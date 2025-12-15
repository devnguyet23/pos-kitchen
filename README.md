# F&B POS System (NestJS + Next.js + PostgreSQL)

Hệ thống quản lý nhà hàng/cafe (POS) Fullstack với tính năng Real-time.

## Tech Stack

### Backend
*   **Framework:** NestJS (Node.js)
*   **Database:** PostgreSQL
*   **ORM:** Prisma
*   **Real-time:** Socket.io

### Frontend
*   **Framework:** Next.js (App Router)
*   **Styling:** Tailwind CSS

---

## 🚀 Chạy bằng Docker (Khuyên dùng)

Cách nhanh nhất để chạy toàn bộ hệ thống (Backend, Frontend, Database).

### 1. Yêu cầu
*   Docker & Docker Compose

### 2. Chạy lệnh

Tại thư mục gốc của dự án:

```bash
docker-compose up --build
```

Hệ thống sẽ tự động:
1.  Khởi tạo PostgreSQL Database.
2.  Chạy Migration & Seed dữ liệu mẫu.
3.  Build & Start Backend (Port 3001).
4.  Build & Start Frontend (Port 3000).

### 3. Truy cập

*   **POS Frontend:** http://localhost:3000/pos
*   **Backend API:** http://localhost:3001
*   **KDS:** http://localhost:3000/kds
*   **QR Order:** http://localhost:3000/qr?tableId=1

---

## 🛠 Chạy thủ công (Dev Mode)

Nếu bạn muốn chạy từng phần để phát triển.

### 1. Yêu cầu
*   Node.js 18+
*   PostgreSQL (cần tự cài đặt và tạo DB)

### 2. Cài đặt

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Cấu hình Backend

1.  Sửa file `backend/.env` với thông tin Database của bạn:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/pos_db"
    ```
2.  Chạy migration:
    ```bash
    cd backend
    npx prisma migrate dev --name init
    npx ts-node prisma/seed.ts
    ```

### 4. Chạy dự án

```bash
# Tại thư mục gốc
npm start
```
