# Vi-SlideS

Vi-SlideS is an AI-powered, question-driven classroom platform that helps teachers adapt live teaching based on student questions, sentiment, and cognitive understanding.

## 🚀 Current Features (Phase 1-3 Implementation)

This implementation includes:

### Phase 1: Authentication & Setup ✅
- **Google OAuth Integration**: Secure authentication using Google Sign-In
- **JWT-based Sessions**: Token-based authentication with 7-day expiry
- **Role-Based Access**: Separate dashboards for Teachers and Students
- **Modern UI**: Clean, responsive interface with gradient design

### Phase 2: Class Session Management ✅
- **Session Creation**: Teachers can create sessions with unique room codes
- **Real-time Session Status**: Live, Paused, Waiting, and Ended states
- **Session Controls**: Start, pause, and end sessions with proper state management
- **Socket.io Integration**: Real-time communication between teachers and students

### Phase 3: Question Submission System ✅
- **Real-time Question Submission**: Students can submit questions during active sessions
- **Card Stack Interface**: Teachers view questions in an intuitive card-based UI
- **Question Navigation**: Click through pending questions easily
- **Answer System**: Teachers can answer questions with responses visible to students
- **Session Summary**: Comprehensive report with statistics and all Q&A history

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Vanilla CSS
- **Backend**: Node.js, Express, TypeScript, JWT
- **Database**: MongoDB (local or Atlas)
- **Real-time**: Socket.io for live updates

## 🚦 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or Atlas account)
- Google OAuth Client ID (for authentication)

### 1. Clone & Setup

```bash
git clone https://github.com/vicharanashala/vi-slides.git
cd vi-slides
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/vi-slides
JWT_SECRET=your-super-secret-key
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your-google-client-id
```

Start the backend server:
```bash
npm run dev
```

You should see:
```
MongoDB Connected ✅
Server running on port 5000
```

### 3. Frontend Setup

Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

### 4. Usage

1. Open `http://localhost:5173` in your browser
2. Sign in with Google and select your role (Teacher/Student)
3. **Teachers**: 
   - Click "Launch New Session" to create a session
   - Share the room code with students
   - Click "Begin" to start accepting questions
   - Answer questions using the card interface
   - Click "Close" to end the session and view summary
4. **Students**:
   - Enter the room code provided by teacher
   - Submit questions during active sessions
   - View teacher's answers in real-time

## 📁 Project Structure

```
vi-slides/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth middleware
│   │   ├── models/          # MongoDB models
│   │   ├── routes/          # API routes
│   │   └── index.ts         # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/           # React pages
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   └── package.json
│
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/google` - Google OAuth authentication

### Sessions
- `POST /api/session/create` - Create new session (Teacher)
- `POST /api/session/join` - Join session with code (Student)
- `PATCH /api/session/:sessionId/status` - Update session status
- `GET /api/session/:sessionId/summary` - Get session summary

### Questions
- `POST /api/question/submit` - Submit question (Student)
- `PATCH /api/question/:questionId/answer` - Answer question (Teacher)

## 🎯 Key Features

### For Teachers
- **One-Click Session Creation**: Generate unique room codes instantly
- **Real-time Question Feed**: See questions as they arrive
- **Card-Based Interface**: Navigate through questions like a deck of cards
- **Session Analytics**: View participation metrics and engagement stats
- **Answer History**: Track all answered questions in the session

### For Students
- **Easy Join**: Enter room code to join sessions
- **Simple Question Submission**: Ask questions with a clean interface
- **Real-time Answers**: See teacher responses immediately
- **Session Status**: Know when sessions are active, paused, or ended

## 📝 Roadmap

- [x] **Phase 1: Project Setup & Authentication**
- [x] **Phase 2: Class Session Management**
- [x] **Phase 3: Question Submission System**
- [ ] Phase 4: AI Analysis & Integration
- [ ] Phase 5: Teacher Insights Dashboard
- [ ] Phase 6: History & Reports

## 🐛 Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

## 👥 Contributors

- Yaswanth Kesa - Phase 2 & 3 Implementation
