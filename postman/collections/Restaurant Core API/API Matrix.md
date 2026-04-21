# Restaurant Core - API Matrix

| Module | Method | Path                                                           | Auth | Role        | Postman Request File                             |
| ------ | ------ | -------------------------------------------------------------- | ---- | ----------- | ------------------------------------------------ |
| Auth   | POST   | /auth/v1/signup                                                | No   | Public      | Auth/Signup.request.yaml                         |
| Auth   | POST   | /auth/v1/signup                                                | No   | Public      | Auth/Signup Admin.request.yaml                   |
| Auth   | POST   | /auth/v1/login                                                 | No   | Public      | Auth/Login.request.yaml                          |
| Table  | GET    | /table/v1/menu-item                                            | Yes  | Staff/Admin | Table/Get Menu Items.request.yaml                |
| Table  | POST   | /table/v1/:tableID/customers                                   | Yes  | Staff       | Table/Register Customer.request.yaml             |
| Table  | POST   | /table/v1/menu/:sessionID/choose                               | Yes  | Staff       | Table/Choose Menu Items.request.yaml             |
| Table  | PUT    | /table/v1/menu/:sessionID/choose                               | Yes  | Staff       | Table/Edit Chosen Items.request.yaml             |
| Table  | POST   | /table/v1/menu/:sessionID/submit                               | Yes  | Staff       | Table/Submit Order.request.yaml                  |
| Table  | GET    | /table/v1/menu/:sessionID/choose                               | Yes  | Staff/Admin | Table/Get Chosen Items.request.yaml              |
| Table  | GET    | /table/v1/orders/:sessionID/bill                               | Yes  | Staff/Admin | Table/Get Bill.request.yaml                      |
| Table  | POST   | /table/v1/orders/:sessionID/checkout                           | Yes  | Staff       | Table/Checkout Bill.request.yaml                 |
| Admin  | GET    | /admin/v1/tables                                               | Yes  | Admin       | Admin/Get Tables.request.yaml                    |
| Admin  | GET    | /admin/v1/tables/:tableID                                      | Yes  | Admin       | Admin/Get Table Detail.request.yaml              |
| Admin  | GET    | /admin/v1/vacant                                               | Yes  | Admin       | Admin/List Vacant Tables.request.yaml            |
| Admin  | PATCH  | /admin/v1/:adminID/tables/:tableID/status                      | Yes  | Admin       | Admin/Update Table Status.request.yaml           |
| Admin  | PUT    | /admin/v1/:adminID/tables/status                               | Yes  | Admin       | Admin/Update Item Processing Status.request.yaml |
| Admin  | GET    | /admin/v1/revenue                                              | Yes  | Admin       | Admin/Get Revenue.request.yaml                   |
| Admin  | GET    | /admin/v1/transaction                                          | Yes  | Admin       | Admin/Get Transaction Detail.request.yaml        |
| Admin  | PATCH  | /admin/v1/:adminID/transactions/:transactionID/confirm-payment | Yes  | Admin       | Admin/Confirm Payment.request.yaml               |
| Admin  | PUT    | /admin/v1/edit_menu                                            | Yes  | Admin       | Admin/Edit Menu.request.yaml                     |
| Admin  | POST   | /admin/v1/new_dish                                             | Yes  | Admin       | Admin/Add New Dish.request.yaml                  |

## Required Collection Variables

- base_url
- staff_token
- admin_token
- table_id
- session_id
- item_id
- choose_id
- transaction_id
- admin_id
- table_capacity
- report_date
