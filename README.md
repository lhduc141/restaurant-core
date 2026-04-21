# Restaurant Core

Backend cho hệ thống quản lý nhà hàng.

## Yêu cầu

- Node.js
- Yarn
- Docker

---

### 1. Clone project

```bash
git clone https://github.com/lhduc141/restaurant-core.git
cd restaurant-core
yarn install
```

### 2. Docker

Create docker

```
docker run -d --name restaurant-mysql -e MYSQL_ROOT_PASSWORD=rootpassword -e MYSQL_DATABASE=restaurantdb -e MYSQL_USER=user -e MYSQL_PASSWORD=user -p 3310:3306 -v mysql_data:/var/lib/mysql mysql:8.0
```

Check docker create success

```
# Result: restaurant-mysql   0.0.0.0:3310->3306/tcp
docker ps
```

Import database

```
docker exec -i restaurant-mysql mysql -uuser -puser restaurantdb < restaurantdb.sql
```

### 3. Schema Migration Path (khuyến nghị)

Tạo file `.env` từ `.env.example` và quản lý schema bằng migration/import SQL trước khi start app.

- Runtime không còn hỗ trợ `sequelize.sync({ alter: true })`.
- Nếu đặt `DB_SYNC_MODE=alter` hoặc `DB_SYNC_MODE=force`, app sẽ dừng để bảo vệ dữ liệu.

Mặc định an toàn: `DB_SYNC_MODE=none` (không thay đổi schema ngầm khi app boot).

### 4. Run backend

Start server backend

```
yarn start
```

Khi app khởi động, hệ thống sẽ tự seed role chuẩn:

- `roleID=1` -> `Staff`
- `roleID=2` -> `Admin`

### 5. PR Acceptance Checklist (CI/Team)

Mục tiêu: mọi PR liên quan workflow bàn/món/thanh toán phải chạy lại cùng một bộ acceptance test trước khi merge.

#### 5.1. Chuẩn bị môi trường chạy test

- [ ] DB đã import từ `restaurantdb.sql`.
- [ ] File `.env` có `DB_SYNC_MODE=none`.
- [ ] Khởi động API ở cổng riêng cho review (ví dụ 3003):

```bash
PORT=3003 yarn start
```

Trên Windows CMD:

```cmd
set PORT=3003 && yarn start
```

#### 5.2. Acceptance flow bắt buộc

Chạy theo thứ tự dưới đây (có thể dùng Postman trong thư mục `postman/collections/Restaurant Core API/`).

- [ ] Signup `Staff` và `Admin` thành công.
- [ ] Login lấy token cho cả `Staff` và `Admin` thành công.
- [ ] Admin tạo món mới thành công.
- [ ] Staff mở session bàn và chọn món thành công.
- [ ] Staff submit order thành công.

#### 5.3. Edge cases bắt buộc (để chống regression)

- [ ] Invalid food status transition bị chặn đúng (mong đợi `400`).
      Ví dụ: cố chuyển trực tiếp `PREPARING -> SERVED`.
- [ ] Item đang `IN_PROGRESS` không xóa được bằng luồng sửa draft (mong đợi `404` hoặc `400`, miễn không xóa được).
- [ ] Checkout bill tạo giao dịch `PENDING` thành công.
- [ ] Confirm payment lần 1 thành công (`200`) và bàn về `VACANT`.
- [ ] Double confirm payment bị chặn (mong đợi `400`).
- [ ] Session đã `CLOSED` không cho order thêm (mong đợi `400`).

#### 5.4. Điều kiện pass để merge

- [ ] Tất cả checklist trên đều pass.
- [ ] Không còn file thay đổi ngoài phạm vi PR (`git status` sạch sau khi test).
- [ ] PR mô tả rõ evidence test (status code/ảnh chụp hoặc log runner).

### 6. Full API Reference

Base URL (local): `http://localhost:3001`

#### 6.1. Response format

Tất cả API trả theo format:

```json
{
  "success": true,
  "message": "...",
  "data": {},
  "timestamp": "2026-04-17T00:00:00.000Z"
}
```

#### 6.2. Authentication & Authorization

- Public endpoint: chỉ nhóm `Auth`.
- Protected endpoint: yêu cầu `Authorization: Bearer <accessToken>`.
- Role:
  - `STAFF = 1`
  - `ADMIN = 2`

#### 6.3. Auth APIs

1. `POST /auth/v1/signup`

Request body:

```json
{
  "role_id": 1,
  "email": "staff@example.com",
  "password": "Pass123!",
  "name": "Table A",
  "quantity": 4
}
```

Notes:

- `role_id=1` (Staff): cần `quantity` để tạo table capacity.
- `role_id=2` (Admin): có thể bỏ `quantity`.

2. `POST /auth/v1/login`

Request body:

```json
{
  "email": "staff@example.com",
  "password": "Pass123!"
}
```

Response `data` chứa `accessToken` và thông tin user.

#### 6.4. Table APIs (cần token)

1. `GET /table/v1/menu-item`

- Mô tả: lấy menu theo nhóm `type_of_food`.
- Quyền: Staff/Admin đã đăng nhập.

2. `POST /table/v1/:tableID/customers`

- Mô tả: mở service session cho bàn.
- Quyền: Staff.

Request body:

```json
{
  "customerName": "Nguyen Van A",
  "phone": "0901234567",
  "guestCount": 2
}
```

3. `POST /table/v1/menu/:sessionID/choose`

- Mô tả: thêm món vào draft order.
- Quyền: Staff.

Request body:

```json
{
  "items": [
    {
      "itemID": 1,
      "quantity": 2,
      "note": "less spicy"
    }
  ]
}
```

4. `PUT /table/v1/menu/:sessionID/choose`

- Mô tả: sửa hoặc hủy (draft) item.
- Quyền: Staff.

Request body:

```json
{
  "items": [
    {
      "itemID": 1,
      "quantity": 1,
      "note": "no onion",
      "deleted": false
    }
  ]
}
```

5. `POST /table/v1/menu/:sessionID/submit`

- Mô tả: submit draft order sang bếp (item từ `ORDERED` sang `PREPARING`).
- Quyền: Staff.

6. `GET /table/v1/menu/:sessionID/choose`

- Mô tả: lấy danh sách item đã submit + tổng món/tổng bill.
- Quyền: Staff/Admin đã đăng nhập.

7. `GET /table/v1/orders/:sessionID/bill`

- Mô tả: lấy bill hiện tại của session.
- Quyền: Staff/Admin đã đăng nhập.

8. `POST /table/v1/orders/:sessionID/checkout`

- Mô tả: tạo yêu cầu thanh toán (`PENDING`).
- Quyền: Staff.

Request body:

```json
{
  "payment_method": "CASH",
  "feedback": "good service"
}
```

`payment_method` hỗ trợ: `CASH`, `CARD`, `TRANSFER`, `OTHER`.

#### 6.5. Admin APIs (cần token Admin)

1. `PUT /admin/v1/:adminID/tables/status`

- Mô tả: cập nhật trạng thái chế biến món theo batch.

Request body:

```json
{
  "items": [
    {
      "chooseID": 1,
      "status": "IN_PROGRESS"
    }
  ]
}
```

Status flow hợp lệ: `PREPARING -> IN_PROGRESS -> SERVED`.

2. `PATCH /admin/v1/:adminID/tables/:tableID/status`

- Mô tả: đổi trạng thái bàn thủ công.

Request body:

```json
{
  "status": "VACANT"
}
```

3. `GET /admin/v1/tables?quantity=<number>`

- Mô tả: danh sách bàn + session/item summary.

4. `GET /admin/v1/tables/:tableID`

- Mô tả: chi tiết 1 bàn.

5. `GET /admin/v1/revenue?date=YYYY-MM-DD`

- Mô tả: doanh thu theo ngày (mặc định ngày hiện tại nếu không truyền).

6. `GET /admin/v1/transaction?transactionID=<id>`

- Mô tả: chi tiết transaction.

7. `PATCH /admin/v1/:adminID/transactions/:transactionID/confirm-payment`

- Mô tả: xác nhận thanh toán.
- Hiệu ứng: transaction `PENDING -> PAID`, session `CLOSED`, table `VACANT`.

8. `GET /admin/v1/vacant?quantity=<number>`

- Mô tả: trả danh sách bàn theo 2 nhóm `vacant` và `ongoing`.

9. `PUT /admin/v1/edit_menu`

- Mô tả: cập nhật thông tin món.

Request body:

```json
{
  "itemID": 1,
  "itemName": "Fried Rice",
  "type_of_food": "Main",
  "price": 40,
  "descriptions": "updated",
  "preparation_time": 10
}
```

10. `POST /admin/v1/new_dish`

- Mô tả: thêm món mới.

Request body:

```json
{
  "itemName": "Noodle",
  "type_of_food": "Main",
  "price": 35,
  "descriptions": "new dish",
  "preparation_time": 8,
  "image": null
}
```

#### 6.6. Common error status

- `400`: sai business rule / validation fail.
- `401`: thiếu token hoặc token hết hạn/sai.
- `403`: sai quyền role.
- `404`: không tìm thấy resource.
- `500`: lỗi hệ thống.
<!--
    Backend run on port: 3001
-->
