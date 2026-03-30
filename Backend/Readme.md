# 🚀 Express + TypeScript Backend Setup

This project is a backend server built using **Express.js**, **TypeScript**, and **MongoDB**. It includes authentication, middleware, and a scalable structure for building modern APIs.

---

## 📦 Project Setup

### 1️⃣ Initialize Project

```bash
npm init -y
```

---

### 2️⃣ Install Dependencies

#### ✅ Runtime Dependencies

```bash
npm install express mongoose cors cookie-parser dotenv jsonwebtoken bcrypt
```

#### 🛠️ Dev Dependencies

```bash
npm install -D typescript ts-node-dev @types/node @types/express @types/cors @types/cookie-parser @types/jsonwebtoken @types/bcrypt
```

---

### 3️⃣ Initialize TypeScript

```bash
npx tsc --init
```

---

### 4️⃣ Configure `tsconfig.json`

Update your config:

```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "esModuleInterop": true,
    "strict": true
  }
}
```

---

### 5️⃣ Add Scripts (`package.json`)

```json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js"
}
```

---

## 📁 Project Structure

```
project/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── index.ts
│
├── dist/
├── node_modules/
├── package.json
├── tsconfig.json
└── .env
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root:

```
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

---

## ▶️ Running the Project

### Development Mode

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

---

## 🔐 Features

* User Authentication (JWT + Cookies)
* Secure Password Hashing (bcrypt)
* MongoDB Integration (Mongoose)
* CORS Configuration
* Middleware-based Authorization
* TypeScript Support