# VoulenteerEvent Project-API

Aplikasi web untuk manajemen event volunteer dan bencana dengan arsitektur fullstack menggunakan AdonisJS (Backend) dan React (Frontend).

## 📋 Daftar Isi

- [Teknologi](#teknologi)
- [Setup Backend](#setup-backend)
- [Setup Frontend](#setup-frontend)
- [Seeder Usage](#seeder-usage)
- [Testing dengan Postman](#testing-dengan-postman)

## 🛠 Teknologi

### Backend
- **Framework**: AdonisJS v6
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT + Google OAuth
- **Language**: TypeScript
- **API**: REST API + GraphQL
- **OAuth**: Google Auth Library

### Frontend
- **Framework**: React 19
- **Styling**: TailwindCSS v4
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **Build Tool**: Vite

## 🚀 Setup Backend

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- Google Cloud Console Account (untuk OAuth)
- Git

### Installation

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd Project-API/backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Generate APP_KEY
   node ace generate:key
   ```

4. **Configure .env**
   ```env
   TZ=UTC
   PORT=3333
   HOST=localhost
   LOG_LEVEL=info
   APP_KEY=your_generated_app_key_here
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_here
   
   MONGODB_URI=your_mongodb_connection_string
   MONGO_DB_NAME=VoulenteerEvent
   
   GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

5. **Setup Google OAuth**
   - Buka [Google Cloud Console](https://console.cloud.google.com/)
   - Buat project baru atau pilih existing project
   - Enable Google+ API
   - Buat OAuth 2.0 credentials
   - Copy Client ID ke .env

6. **Run Development Server**
   ```bash
   npm run dev
   ```

   Server akan berjalan di: `http://localhost:3333`

### Available Scripts

```bash
npm run dev        # Development server with HMR
npm run build      # Build for production
npm run start      # Start production server
npm run test       # Run tests
npm run lint       # Run ESLint
npm run typecheck  # TypeScript type checking
```

## 🎨 Setup Frontend

### Installation

1. **Navigate to Frontend**
   ```bash
   cd Project-API/frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   - Update API base URL jika perlu
   - Setup Google OAuth client ID untuk frontend

4. **Run Development Server**
   ```bash
   npm run dev
   ```

   Frontend akan berjalan di: `http://localhost:5173`

### Available Scripts

```bash
npm run dev      # Development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🌱 Seeder Usage

### Menjalankan Seeder

Seeder digunakan untuk mengisi database dengan data awal (admin dan sample users).

```bash
cd backend
npm run seed
```

### Data yang Akan Dibuat:

#### **Admin Account**
- **Email**: `admin@volunteer.com`
- **Password**: `admin123`
- **Role**: `admin`

#### **Sample Volunteers**
- **Email**: `john@volunteer.com` / **Password**: `volunteer123`
- **Email**: `jane@volunteer.com` / **Password**: `volunteer123`
- **Email**: `bob@volunteer.com` / **Password**: `volunteer123`
- **Role**: `relawan`

### Kapan Menggunakan Seeder:
- Setup development environment baru
- Reset database dengan data fresh
- Demo/testing dengan data konsisten
- Onboarding developer baru

## 📮 Testing dengan Postman

### Setup Postman Environment

1. **Buat Environment Baru**
   - Name: `VoulenteerEvent Local`
   - Variables:
     - `base_url`: `http://localhost:3333`
     - `token`: (akan diisi setelah login)

### Test Flow Recommended

#### **1. Test Authentication**

**Register User Baru:**
```http
POST {{base_url}}/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

**Login Admin (dari seeder):**
```http
POST {{base_url}}/login
Content-Type: application/json

{
  "email": "admin@volunteer.com",
  "password": "admin123"
}
```

**Login User (dari seeder):**
```http
POST {{base_url}}/login
Content-Type: application/json

{
  "email": "john@volunteer.com",
  "password": "volunteer123"
}
```

**Google Login:**
```http
POST {{base_url}}/google-login
Content-Type: application/json

{
  "idToken": "google_id_token_from_frontend"
}
```

#### **2. Test Public Endpoints**

**Get All Bencana:**
```http
GET {{base_url}}/bencana
```

**Get Bencana by ID:**
```http
GET {{base_url}}/bencana/BENCANA_ID_HERE
```

#### **3. Test Protected Endpoints (Admin)**

**Get All Users (Admin only):**
```http
GET {{base_url}}/users
Authorization: Bearer {{token}}
```

**Create Bencana (Admin only):**
```http
POST {{base_url}}/bencana
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "title": "Banjir Jakarta",
  "description": "Banjir melanda Jakarta Selatan",
  "location": "Jakarta Selatan",
  "type": "flood",
  "date": "2024-01-15"
}
```

#### **4. Test Volunteer Registration**

**Join Bencana (User):**
```http
POST {{base_url}}/bencana/BENCANA_ID/join
Authorization: Bearer {{token}}
```

**My Registrations (User):**
```http
GET {{base_url}}/me/registrations
Authorization: Bearer {{token}}
```

**Cancel Registration (User):**
```http
DELETE {{base_url}}/bencana/BENCANA_ID/leave
Authorization: Bearer {{token}}
```

#### **5. Test GraphQL (Admin)**

**GraphQL Query:**
```http
POST {{base_url}}/graphql
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "query": "query { getBencana { id title location type } }"
}
```

**GraphQL Mutation:**
```http
POST {{base_url}}/graphql
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "query": "mutation { joinBencana(bencanaId: \"BENCANA_ID\") { id status } }"
}
```

### Tips Postman Testing

1. **Save Token Otomatis**
   - Di tab "Tests" pada request login, tambahkan:
   ```javascript
   pm.test("Save token", function () {
       var jsonData = pm.response.json();
       pm.environment.set("token", jsonData.token);
   });
   ```

2. **Test Response Status**
   ```javascript
   pm.test("Status code is 200", function () {
       pm.response.to.have.status(200);
   });
   ```

3. **Organize dengan Collections**
   - Buat folder: "Authentication", "Bencana", "Users", "Volunteer Registration"
   - Group related requests

### Expected Responses

**Login Success:**
```json
{
  "message": "Login berhasil",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "name": "Admin Volunteer",
    "email": "admin@volunteer.com",
    "role": "admin"
  }
}
```

**Google Login Success:**
```json
{
  "message": "Login dengan Google berhasil",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@gmail.com",
    "role": "relawan"
  }
}
```

**Unauthorized (tanpa token):**
```json
{
  "message": "Akses tidak sah"
}
```

**Join Bencana Success:**
```json
{
  "message": "Berhasil mendaftar sebagai relawan",
  "data": {
    "id": "registration_id",
    "user": "user_id",
    "bencana": "bencana_id",
    "status": "pending"
  }
}
```

## 📝 Notes

- README ini bersifat **sementara** dan akan diperbarui seiring development
- API Documentation lengkap akan ditambahkan kemudian
- Deployment guide akan disediakan saat ready untuk production
- Troubleshooting section akan diperluas berdasarkan feedback

## 📞 Support

Jika ada pertanyaan atau issue, silakan hubungi tim development.