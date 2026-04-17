import sequelize from "../src/config/database.js";
import initModels from "../src/models/init-models.js";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3008";
const model = initModels(sequelize);

const req = async (method, path, body, token) => {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  return { status: res.status, body: data };
};

const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

const run = async () => {
  const ts = Date.now();
  const staffEmail = `wf_staff_${ts}@test.com`;
  const adminEmail = `wf_admin_${ts}@test.com`;
  const pass = "123456";

  await sequelize.authenticate();
  console.log("DB_AUTH=OK");

  const signupStaff = await req("POST", "/auth/v1/signup", {
    role_id: 1,
    email: staffEmail,
    password: pass,
    name: `WF Table ${ts}`,
    quantity: 4,
  });
  assert(signupStaff.status === 201, `signup staff failed: ${signupStaff.status}`);
  const staffAccountID = signupStaff.body?.data?.accountID;
  const tableID = signupStaff.body?.data?.roleDetails?.tableID;

  const signupAdmin = await req("POST", "/auth/v1/signup", {
    role_id: 2,
    email: adminEmail,
    password: pass,
    name: `WF Admin ${ts}`,
  });
  assert(signupAdmin.status === 201, `signup admin failed: ${signupAdmin.status}`);
  const adminID = signupAdmin.body?.data?.roleDetails?.adminID;

  const loginStaff = await req("POST", "/auth/v1/login", { email: staffEmail, password: pass });
  const loginAdmin = await req("POST", "/auth/v1/login", { email: adminEmail, password: pass });
  assert(loginStaff.status === 200 && loginAdmin.status === 200, "login failed");

  const staffToken = loginStaff.body?.data?.accessToken;
  const adminToken = loginAdmin.body?.data?.accessToken;
  assert(staffToken && adminToken, "missing token");

  const addDish = await req(
    "POST",
    "/admin/v1/new_dish",
    {
      itemName: `WF Dish ${ts}`,
      type_of_food: "Main",
      price: 55,
      descriptions: "workflow dish",
      preparation_time: 8,
      image: null,
    },
    adminToken
  );
  assert(addDish.status === 201, `add dish failed: ${addDish.status}`);
  const itemID = addDish.body?.data?.itemID;

  const register = await req(
    "POST",
    `/table/v1/${tableID}/customers`,
    { customerName: "Workflow Guest", phone: "0901234567", guestCount: 2 },
    staffToken
  );
  assert(register.status === 201, `register customer failed: ${register.status}`);
  assert(register.body?.data?.tableStatus === "OCCUPIED", "table should auto OCCUPIED after start session");
  const sessionID = register.body?.data?.sessionID;

  // Verify table-staff-session mapping right after session start.
  const mappedTable = await model.TableEntity.findByPk(tableID);
  const openedSession = await model.ServiceSession.findByPk(sessionID);
  assert(mappedTable?.tabletAccountID === staffAccountID, "table-staff mapping mismatch");
  assert(openedSession?.tableID === tableID, "session-table mapping mismatch");
  assert(mappedTable?.status === "OCCUPIED", "table should be OCCUPIED in DB after session start");

  const choose = await req(
    "POST",
    `/table/v1/menu/${sessionID}/choose`,
    { items: [{ itemID, quantity: 2, note: "No chilli" }] },
    staffToken
  );
  assert(choose.status === 201, `choose item failed: ${choose.status}`);

  const edit = await req(
    "PUT",
    `/table/v1/menu/${sessionID}/choose`,
    { items: [{ itemID, quantity: 1, note: "Less salt", deleted: false }] },
    staffToken
  );
  assert(edit.status === 200, `edit item failed: ${edit.status}`);

  const submit = await req("POST", `/table/v1/menu/${sessionID}/submit`, {}, staffToken);
  assert(submit.status === 200, `submit order failed: ${submit.status}`);

  const detail = await req("GET", `/admin/v1/tables/${tableID}`, undefined, adminToken);
  assert(detail.status === 200, `get table detail failed: ${detail.status}`);
  assert(detail.body?.data?.activeSession, "admin table detail should include activeSession");
  assert(Array.isArray(detail.body?.data?.orderedItems), "admin table detail should include orderedItems");
  assert(typeof detail.body?.data?.totalDishCount === "number", "admin table detail should include totalDishCount");
  assert(typeof detail.body?.data?.totalBill === "number", "admin table detail should include totalBill");
  const chooseID = detail.body?.data?.orderedItems?.[0]?.chooseID;
  assert(!!chooseID, "missing chooseID");

  // Reject invalid status flow (PREPARING -> SERVED directly).
  const invalidTransition = await req(
    "PUT",
    `/admin/v1/${adminID}/tables/status`,
    { items: [{ chooseID, status: "SERVED" }] },
    adminToken
  );
  assert(invalidTransition.status === 400, `invalid transition should be rejected: ${invalidTransition.status}`);

  const toProgress = await req(
    "PUT",
    `/admin/v1/${adminID}/tables/status`,
    { items: [{ chooseID, status: "IN_PROGRESS" }] },
    adminToken
  );
  assert(toProgress.status === 200, `to IN_PROGRESS failed: ${toProgress.status}`);

  // Rule check: IN_PROGRESS item must not be deletable.
  const deleteInProgress = await req(
    "PUT",
    `/table/v1/menu/${sessionID}/choose`,
    { items: [{ itemID, deleted: true }] },
    staffToken
  );
  assert(deleteInProgress.status === 400, `IN_PROGRESS delete should be rejected: ${deleteInProgress.status}`);

  const toServed = await req(
    "PUT",
    `/admin/v1/${adminID}/tables/status`,
    { items: [{ chooseID, status: "SERVED" }] },
    adminToken
  );
  assert(toServed.status === 200, `to SERVED failed: ${toServed.status}`);

  const bill = await req("GET", `/table/v1/orders/${sessionID}/bill`, undefined, staffToken);
  assert(bill.status === 200, `get bill failed: ${bill.status}`);

  const checkout = await req(
    "POST",
    `/table/v1/orders/${sessionID}/checkout`,
    { payment_method: "CASH", feedback: "all good" },
    staffToken
  );
  assert(checkout.status === 200, `checkout failed: ${checkout.status}`);
  const transactionID = checkout.body?.data?.transactionID;

  const confirm = await req(
    "PATCH",
    `/admin/v1/${adminID}/transactions/${transactionID}/confirm-payment`,
    {},
    adminToken
  );
  assert(confirm.status === 200, `confirm payment failed: ${confirm.status}`);

  const doubleConfirm = await req(
    "PATCH",
    `/admin/v1/${adminID}/transactions/${transactionID}/confirm-payment`,
    {},
    adminToken
  );
  assert(doubleConfirm.status === 400, `double confirm should be blocked: ${doubleConfirm.status}`);

  const orderAfterClosed = await req(
    "POST",
    `/table/v1/menu/${sessionID}/choose`,
    { items: [{ itemID, quantity: 1 }] },
    staffToken
  );
  assert(orderAfterClosed.status === 400, `order after close should be blocked: ${orderAfterClosed.status}`);

  const table = await model.TableEntity.findByPk(tableID);
  const session = await model.ServiceSession.findByPk(sessionID);
  const tx = await model.Transaction.findByPk(transactionID);
  const order = await model.Order.findOne({ where: { sessionID }, order: [["orderID", "DESC"]] });
  const orderItems = await model.OrderItem.findAll({ where: { orderID: order.orderID, isCancelled: false } });

  assert(table?.status === "VACANT", "DB table status should be VACANT");
  assert(session?.status === "CLOSED", "DB session should be CLOSED");
  assert(!!session?.checkOutTime, "DB session checkout time missing");
  assert(tx?.paymentStatus === "PAID", "DB transaction should be PAID");
  assert(!!tx?.paidAt, "DB paidAt missing");
  assert(Number(tx?.totalPrice || 0) > 0, "DB totalPrice invalid");
  assert(order?.status === "COMPLETED", "DB order should be COMPLETED");
  assert(orderItems.length > 0 && orderItems.every((i) => i.status === "SERVED"), "DB order items should be SERVED");

  const roleStaff = await model.Role.findByPk(1);
  const roleAdmin = await model.Role.findByPk(2);
  assert(!!roleStaff && !!roleAdmin, "baseline roles missing");

  // Optional check: fixed table setup target (8 tables)
  const totalTables = await model.TableEntity.count();
  console.log(`TABLE_COUNT=${totalTables}`);

  console.log("API_WORKFLOW=PASS");
  console.log("DB_VALIDATION=PASS");
  console.log(
    `TEST_IDS table=${tableID} session=${sessionID} admin=${adminID} transaction=${transactionID} item=${itemID}`
  );
};

try {
  await run();
} catch (e) {
  console.error("FULL_WORKFLOW_TEST_FAIL", e.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
