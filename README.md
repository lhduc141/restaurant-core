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

### 3. Run backend

Start server backend
```
yarn start
```
<!-- 
    Backend run on port: 3001
-->
