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

### 3. Cấu hình đồng bộ schema (khuyến nghị)

Tạo file `.env` từ `.env.example`, sau đó chọn một trong các mode:

- `DB_SYNC_MODE=none`: không tự động sync schema (dùng DB đúng chuẩn sẵn có).
- `DB_SYNC_MODE=alter`: tự động cập nhật schema theo model, giữ dữ liệu tối đa.

Lưu ý: project đã tắt `DB_SYNC_MODE=force` để tránh xóa dữ liệu ngoài ý muốn.

### 4. Run backend

Start server backend

```
yarn start
```

Khi app khởi động, hệ thống sẽ tự seed role chuẩn:

- `roleID=1` -> `Staff`
- `roleID=2` -> `Admin`
<!--
    Backend run on port: 3001
-->
