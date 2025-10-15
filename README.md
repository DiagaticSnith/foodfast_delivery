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
- Hệ thống dispatch drone (telemetry, flight tracking, no-fly zones)
- Dashboard admin: phê duyệt đối tác, xử lý khiếu nại, giám sát drone

## Kiến trúc tóm tắt
- Backend: Node.js + Express + Sequelize (models tại `backend/src/models`)
- Frontend: Vite + React (thư mục `frontend/src`)
- Database: Postgres / MySQL (migrations tại `database/migrations`)
- Messaging / Queue: RabbitMQ / Redis Streams (tùy cấu hình)
- Object storage: S3 / MinIO
- Observability: Prometheus + Grafana, ELK/Loki

## Yêu cầu
- Node.js (v16+)
- npm hoặc yarn
- Docker (tuỳ chọn, nếu muốn chạy DB/Redis local)
- (Optional) Inkscape / ImageMagick để convert SVG -> PNG cho diagrams

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
- Kiểm tra API: `backend/tests/test.js` (ví dụ đơn giản). Bạn có thể chạy `node backend/tests/test.js` để kiểm tra một số endpoint giả lập.

## Diagrams & Docs
- Deployment diagram (3-tier): `docs/diagrams/deployment_diagram.svg` (mở trong VS Code hoặc trình duyệt). Nếu cần PNG, dùng Inkscape / ImageMagick để convert.
- User scenarios & PRD: xem nội dung trong `docs/PRD.md` (nếu có) hoặc yêu cầu tôi xuất file.

## Thanh toán & luồng tiền (tóm tắt)
- Sử dụng Stripe Connect (khuyến nghị): platform có thể giữ tiền tạm và thực hiện payout cho nhà hàng sau khi đơn hoàn thành.
- Lưu `paymentIntentId` / `sessionId` trong bảng `orders` để reconcile và xử lý webhook.

## Drone & Telemetry
- Telemetry ingestion cần endpoint riêng để nhận vị trí drone (lưu vào `flight_tracks`), và một dịch vụ dispatch để lập kế hoạch chuyến bay.
- Các bảng gợi ý: `drones`, `flights`, `flight_tracks`, `incidents`.

## Contributing
- Xây dựng branch theo feature: `feature/<name>`
- Pull request mô tả rõ thay đổi, migration, ảnh hưởng data.
- Viết test nhỏ cho logic quan trọng (payments, dispatch).

## Next steps tôi có thể hỗ trợ
- Tạo seeders mẫu đầy đủ (users, restaurants, menus, drones, orders).
- Viết migration bổ sung cho telemetry / ledger entries.
- Thêm webhook handler mẫu cho Stripe trong `backend/src/controllers/webhookController.js`.

---

Nếu bạn muốn, tôi sẽ commit thay đổi README này vào repo (đã làm) và có thể mở rộng thành `docs/` chi tiết hơn. Muốn tôi tạo thêm mục nào trong README hay tài liệu khác không?

Frontend (Tầng giao diện): Sử dụng ReactJS để hiển thị giao diện thân thiện và responsive.

Backend (Tầng logic nghiệp vụ): Sử dụng Node.js/Express để xử lý logic đặt hàng, quản lý menu, và xác thực người dùng.

Database (Tầng dữ liệu): Sử dụng MySQL để lưu trữ thông tin về món ăn, đơn hàng, và người dùng.

Dự án tích hợp CI/CD sử dụng GitHub Actions để tự động hóa kiểm tra, build, và triển khai.

Công nghệ sử dụng

Frontend: ReactJS, Vite

Backend: Node.js, Express, Sequelize (hoặc mysql2)

Database: MySQL

CI/CD: GitHub Actions

Container: Docker
