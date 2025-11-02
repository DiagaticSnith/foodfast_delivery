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
- Kiểm tra API: `backend/tests/test.js` (ví dụ đơn giản). Có thể chạy `node backend/tests/test.js` để kiểm tra một số endpoint giả lập.

## Thanh toán & luồng tiền (tóm tắt)
- Sử dụng Stripe Connect (khuyến nghị): platform có thể giữ tiền tạm và thực hiện payout cho nhà hàng sau khi đơn hoàn thành.
- Lưu `paymentIntentId` / `sessionId` trong bảng `orders` để reconcile và xử lý webhook.

## Contributing
- Xây dựng branch theo feature: `feature/<name>`
- Pull request mô tả rõ thay đổi, migration, ảnh hưởng data.
- Viết test nhỏ cho logic quan trọng (payments, dispatch).
- 
---

## CI / CD

This repository includes two GitHub Actions workflows in `.github/workflows/`:

- `ci.yml`: runs on push and pull requests and performs the following checks:
	- Installs backend dependencies (no build step for backend)
	- Installs and builds `frontend` (Vite)
	- Installs and builds `frontend-admin` (Vite)

- `cd.yml`: runs on pushes to `main` / `master` and performs:
	- Builds Docker images for `backend`, `frontend`, `frontend-admin` and pushes them to GitHub Container Registry (GHCR) under your account
	- Optional deploy step (via SSH) that will run `docker-compose pull` and `docker-compose up -d` on your remote host

Required repository secrets for CD (set these in your GitHub repo settings -> Secrets):

- `SSH_HOST` (optional) — remote host for deployment
- `SSH_USER` (optional)
- `SSH_PORT` (optional, default 22)
- `SSH_PRIVATE_KEY` (optional) — private key for deployment user

Notes:
- The CD workflow uses the `GITHUB_TOKEN` to authenticate with GHCR. No extra token is required to push packages to GHCR for the same repository owner when using the built-in token.
- If you prefer Docker Hub instead of GHCR, update `cd.yml` to login to Docker Hub and adjust tags and secrets (`DOCKERHUB_USERNAME` / `DOCKERHUB_PASSWORD`).
- The deploy step only runs if `SSH_HOST` and `SSH_PRIVATE_KEY` secrets are set.

If you want, I can:
- Add an automatic DB migration step before the backend container is started on the remote host (e.g., `npx sequelize db:migrate`).
- Change CD to build multi-arch images or add image tags for SemVer.
- Configure a more advanced deploy (Capistrano/Ansible/Kubernetes).


