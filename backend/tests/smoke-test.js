/**
 * End-to-end API smoke test (dev only).
 * Boots the real Express app against an in-memory MongoDB and exercises the
 * full auth + CRUD + dashboard + Excel-export flow over HTTP.
 *
 * Usage: node tests/smoke-test.js
 *
 * NOTE: environment variables must be set BEFORE requiring config/server,
 * because config/index.js reads them once at require time.
 */
const { MongoMemoryServer } = require("mongodb-memory-server");

const BASE = "http://localhost:5050"; // test server always runs on this port

let passed = 0;
let failed = 0;

const log = (name, ok, detail = "") => {
  if (ok) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${name}  ${detail}`);
  }
};

async function main() {
  console.log("Starting in-memory MongoDB…");
  const mongod = await MongoMemoryServer.create();
  // These must be set before server.js is required (config reads them once)
  process.env.PORT = "5050";
  process.env.JWT_SECRET = "smoke-test-secret";
  process.env.NODE_ENV = "test";
  process.env.MONGO_URI = mongod.getUri("expense_tracker_test");

  // Boot the real app against the in-memory database
  require("../server");

  // Wait for the server to accept connections
  await new Promise((resolve) => {
    const tryConnect = async () => {
      try {
        await fetch(`${BASE}/api/health`);
        resolve();
      } catch {
        setTimeout(tryConnect, 300);
      }
    };
    tryConnect();
  });
  console.log(`Test server up at ${BASE}\n`);

  /* ------------------------------ /health ------------------------------ */
  const health = await fetch(`${BASE}/api/health`);
  log("GET /api/health -> 200", health.status === 200);

  /* ------------------------------ register ----------------------------- */
  const registerRes = await fetch(`${BASE}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Test User", email: "test@example.com", password: "password123" }),
  });
  const registerBody = await registerRes.json();
  log(
    "POST /auth/register -> 201 + user + token",
    registerRes.status === 201 && registerBody.user?.name === "Test User" && !!registerBody.token,
    JSON.stringify(registerBody)
  );

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${registerBody.token}`,
  };

  /* --------------------------- duplicate email ------------------------- */
  const dupRes = await fetch(`${BASE}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Dup", email: "test@example.com", password: "password123" }),
  });
  log("duplicate register -> 409", dupRes.status === 409, String(dupRes.status));

  /* ------------------------------- login ------------------------------- */
  const loginRes = await fetch(`${BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@example.com", password: "password123" }),
  });
  const loginBody = await loginRes.json();
  log("POST /auth/login -> 200", loginRes.status === 200 && !!loginBody.token, JSON.stringify(loginBody));

  const badLogin = await fetch(`${BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@example.com", password: "wrongpass1" }),
  });
  log("login with wrong password -> 401", badLogin.status === 401, String(badLogin.status));

  /* ------------------------------ getUser ------------------------------ */
  const userRes = await fetch(`${BASE}/api/v1/auth/getUser`, { headers: authHeaders });
  const userBody = await userRes.json();
  log(
    "GET /auth/getUser -> 200 (no password leak)",
    userRes.status === 200 && userBody.user?.email === "test@example.com" && !userBody.user?.password,
    JSON.stringify(userBody)
  );

  const noAuth = await fetch(`${BASE}/api/v1/auth/getUser`);
  log("GET /auth/getUser without token -> 401", noAuth.status === 401, String(noAuth.status));

  /* --------------------------- income CRUD ----------------------------- */
  const addIncomeRes = await fetch(`${BASE}/api/v1/income/add`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ icon: "💼", source: "Salary", amount: 5000, date: new Date().toISOString() }),
  });
  const incomeBody = await addIncomeRes.json();
  log("POST /income/add -> 201", addIncomeRes.status === 201 && incomeBody.income?.source === "Salary", JSON.stringify(incomeBody));

  await fetch(`${BASE}/api/v1/income/add`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ icon: "🎁", source: "Bonus", amount: 500, date: new Date().toISOString() }),
  });

  const getIncomeRes = await fetch(`${BASE}/api/v1/income/getAll`, { headers: authHeaders });
  const incomeList = (await getIncomeRes.json()).income;
  log("GET /income/getAll -> 2 entries", getIncomeRes.status === 200 && incomeList.length === 2, String(incomeList?.length));

  /* --------------------------- expense CRUD ---------------------------- */
  const addExpenseRes = await fetch(`${BASE}/api/v1/expense/add`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ icon: "🛒", category: "Groceries", amount: 120.5, date: new Date().toISOString() }),
  });
  const expenseBody = await addExpenseRes.json();
  log("POST /expense/add -> 201", addExpenseRes.status === 201 && expenseBody.expense?.category === "Groceries", JSON.stringify(expenseBody));

  await fetch(`${BASE}/api/v1/expense/add`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ icon: "🎬", category: "Entertainment", amount: 45, date: new Date().toISOString() }),
  });

  const getExpenseRes = await fetch(`${BASE}/api/v1/expense/getAll`, { headers: authHeaders });
  const expenseList = (await getExpenseRes.json()).expenses;
  log("GET /expense/getAll -> 2 entries", getExpenseRes.status === 200 && expenseList.length === 2, String(expenseList?.length));

  /* -------------------------- validation guards ------------------------ */
  const badAmount = await fetch(`${BASE}/api/v1/income/add`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ source: "X", amount: -5, date: new Date().toISOString() }),
  });
  log("negative amount -> 400", badAmount.status === 400, String(badAmount.status));

  /* --------------------------- dashboard stats ------------------------- */
  const statsRes = await fetch(`${BASE}/api/v1/dashboard/stats`, { headers: authHeaders });
  const stats = await statsRes.json();
  log(
    "GET /dashboard/stats totals correct",
    statsRes.status === 200 &&
      stats.totals.totalIncome === 5500 &&
      stats.totals.totalExpense === 165.5 &&
      stats.totals.totalBalance === 5334.5,
    JSON.stringify(stats.totals)
  );
  log(
    "GET /dashboard/stats chart datasets",
    Array.isArray(stats.charts.last30Days) &&
      stats.charts.last30Days.length === 30 &&
      Array.isArray(stats.charts.dailyExpenseTrend) &&
      Array.isArray(stats.charts.expenseByCategory) &&
      Array.isArray(stats.charts.incomeBySource),
    JSON.stringify(Object.keys(stats.charts || {}))
  );
  log(
    "GET /dashboard/stats recent transactions",
    Array.isArray(stats.recentTransactions) && stats.recentTransactions.length > 0 && stats.recentTransactions.length <= 5,
    String(stats.recentTransactions?.length)
  );

  /* --------------------------- Excel downloads ------------------------- */
  const incomeXls = await fetch(`${BASE}/api/v1/income/download`, { headers: authHeaders });
  const xlsBuf = Buffer.from(await incomeXls.arrayBuffer());
  log(
    "GET /income/download -> xlsx",
    incomeXls.status === 200 &&
      incomeXls.headers.get("content-type").includes("spreadsheetml") &&
      xlsBuf.subarray(0, 2).toString() === "PK", // zip signature
    `${incomeXls.status} ${xlsBuf.length} bytes`
  );

  const expenseXls = await fetch(`${BASE}/api/v1/expense/download`, { headers: authHeaders });
  const exBuf = Buffer.from(await expenseXls.arrayBuffer());
  log(
    "GET /expense/download -> xlsx",
    expenseXls.status === 200 && exBuf.subarray(0, 2).toString() === "PK",
    `${expenseXls.status} ${exBuf.length} bytes`
  );

  /* ------------------------------- delete ------------------------------ */
  const delRes = await fetch(`${BASE}/api/v1/income/${incomeList[0]._id}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  log("DELETE /income/:id -> 200", delRes.status === 200, String(delRes.status));

  const afterDelete = (await (await fetch(`${BASE}/api/v1/income/getAll`, { headers: authHeaders })).json()).income;
  log("income list shrinks after delete", afterDelete.length === 1, String(afterDelete.length));

  const delOther = await fetch(`${BASE}/api/v1/income/${incomeList[0]._id}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  log("DELETE non-existent -> 404", delOther.status === 404, String(delOther.status));

  /* ------------------------------ summary ------------------------------ */
  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("Smoke test crashed:", error);
  process.exit(1);
});
