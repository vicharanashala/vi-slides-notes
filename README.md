# Feature: Vi-Slides – Interactive Classroom Platform

## Overview
This branch delivers a full-fledged app for live classes, assignments, todos, and real-time Q&A, collaboratively developed with the MERN stack, Socket.io, and WebRTC.

## Features
- **Real-time classroom**/session management (Socket.io)
- **Assignment** creation and tracking
- **Todo/task** system for students and teachers
- **Live Whiteboard:** Collaborate visually in real time during sessions
- **Screen Sharing:** Instructors share their screen with the class for explanations and presentations
- **Poll system:** teachers launch polls, students vote instantly, with live stats and past poll review
- **Notification system:** assignment/todo reminders with real-time NotificationBell and toast alerts
- **Audio:** mic on/off, mute/unmute, talk via integrated WebRTC and MediaStream API
- Integrated **Ask AI** (Gemini API)—instant answers to student's queries, escalate unclear questions to teachers
- **Role-based access** and secure authentication

## Project Structure

This repository is organized into two primary sections: the backend (server-side) and the frontend (client-side). Below is an overview of the directory and file structure:

```
.
├── Backend
│   ├── .gitignore             # Git ignore rules for backend
│   ├── Readme.md              # Backend documentation
│   ├── package.json           # Backend dependencies and scripts
│   ├── package-lock.json      # Backend dependency lock file
│   ├── tsconfig.json          # TypeScript config for backend
│   └── src
│       ├── index.ts               # Backend entry point
│       ├── config/                # Environment and settings configuration
│       ├── controllers/           # Controller logic for backend routes
│       ├── middleware/            # Middleware functions
│       ├── models/                # Data and domain models
│       ├── routes/                # API endpoints routing
│       └── socket/                # Real-time/socket logic
│
├── Frontend
│   ├── .gitignore             # Git ignore rules for frontend
│   ├── README.md              # Frontend documentation
│   ├── components.json        # UI component list/configuration
│   ├── eslint.config.js       # Linting configuration
│   ├── index.html             # Web app HTML entry
│   ├── package.json           # Frontend dependencies and scripts
│   ├── package-lock.json      # Frontend dependency lock file
│   ├── tsconfig.app.json      # TS config for app
│   ├── tsconfig.json          # General TS config
│   ├── tsconfig.node.json     # Node-specific TS config
│   ├── vite.config.ts         # Vite build config
│   ├── public                 # Static assets (e.g., favicon, icons)
│   └── src
│       ├── App.tsx                # Main React component
│       ├── assets/                # Static and media assets
│       ├── components/            # UI components
│       ├── context/               # React contexts (state management)
│       ├── hooks/                 # Custom hooks
│       ├── index.css              # Main stylesheet
│       ├── lib/                   # Utility functions
│       ├── main.tsx               # React app entry-point
│       └── pages/                 # Routed pages/components
```

- *Backend*: Implements the API, real-time features, and infrastructure logic (Node.js/TypeScript).
- *Frontend*: Handles the UI, user interaction, and routing (React + Vite + TypeScript).

> For deeper details, see each section’s README file.

## Tech Stack
- Frontend: React, TypeScript, Vite, Socket.io-client
- Backend: Node.js, Express, Socket.io, MongoDB
- UI Components: shadcn/ui, Custom components
- Real-time: WebRTC, MediaStream API (for audio)

## Contributors
- Jojan Joji ([joj48](https://github.com/joj48))
- Ayush Mishra ([codefixxx](https://github.com/codefixxx))
- Tanu Mourya ([tanu236gakt](https://github.com/tanu236gakt))
- Aniket Raj Sinha ([aniketsinha05](https://github.com/aniketsinha05))
- Vikas Sharma ([Vikas-Sharma04](https://github.com/Vikas-Sharma04))

## Mentors
- Mr. Rohit Sharma ([imrohitvk](https://github.com/imrohitvk))