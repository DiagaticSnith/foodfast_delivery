**Foodfast Delivery - Đồ án ứng dụng đặt đồ ăn nhanh**
**Giới thiệu**

# FoodFast Delivery

Một ứng dụng mẫu đặt món & giao hàng nhanh (hỗ trợ drone) — backend Node.js (Sequelize) và frontend (Vite). README này tóm tắt mục tiêu dự án, các tính năng chính, hướng dẫn chạy nhanh trên máy dev, và tài nguyên liên quan.

## Tổng quan

FoodFast là một nền tảng đặt món cho phép khách hàng duyệt menu, đặt món, thanh toán và theo dõi giao hàng thời gian thực. Hệ thống hỗ trợ giao hàng tự động bằng drone trong các khu vực thí điểm, đồng thời cung cấp portal cho nhà hàng và dashboard cho admin.

## Tính năng chính
- Đăng ký / đăng nhập người dùng (buyer, restaurant owner, admin)
- Duyệt menu, thêm món vào giỏ, đặt hàng
- Thanh toán qua Stripe (webhook xử lý thanh toán, refund, payout)
- Quản lý menu & trạng thái món của nhà hàng
- Hệ thống tự động dispatch drone (telemetry, flight tracking)
- Dashboard admin: phê duyệt đối tác, xử lý khiếu nại, giám sát drone

## Kiến trúc tóm tắt
- Backend: Node.js + Express + Sequelize (models tại `backend/src/models`)
- Frontend: Vite + React (thư mục `frontend/src`)
- Database: MySQL (migrations tại `database/migrations`)

## Yêu cầu
- Node.js (v16+)
- npm hoặc yarn
- Docker 

## Chạy nhanh (development)
Các lệnh ví dụ dùng PowerShell (Windows):

1) Cài dependencies backend & frontend

```powershell
cd backend
npm install
cd ..\frontend
npm install
```

2) Thiết lập biến môi trường
- Sao chép file `.env.example` (nếu có) và cập nhật STRIPE keys, DB URL, v.v.

3) Chạy migrations & seed (Sequelize CLI)

```powershell
cd backend
npx sequelize db:migrate
npx sequelize db:seed:all
```

4) Chạy ứng dụng

```powershell
# backend
cd backend
npm run dev

# frontend (mở cửa sổ khác)
cd frontend
npm run dev
```

## Kiểm thử nhanh
- Chạy lệnh `npm run test` để test coverage bằng unit test và integration test trong folder `backend/tests`

## Thanh toán & luồng tiền (tóm tắt)
- Sử dụng Stripe Connect (khuyến nghị): platform có thể giữ tiền tạm và thực hiện payout cho nhà hàng sau khi đơn hoàn thành.
- Lưu `paymentIntentId` / `sessionId` trong bảng `orders` để reconcile và xử lý webhook.

## Contributing
- Xây dựng branch theo feature: `feature/<name>`
- Pull request mô tả rõ thay đổi, migration, ảnh hưởng data.
- Viết test nhỏ cho logic quan trọng (payments, dispatch).

asf