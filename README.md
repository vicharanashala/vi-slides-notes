# Vi-SlideS 🚀

**Vi-SlideS is a real-time, AI-powered interactive classroom and presentation platform that fundamentally revolutionizes teaching by making it question-driven and adaptive.**

Instead of dealing with massive lecture halls where students are too intimidated to ask questions, or teachers getting overwhelmed with repetitive queries, Vi-SlideS intelligently sits between the student and the professor.

## 🌟 The Problem Statement
Traditional lectures are often one-directional. Students hesitate to ask questions, leading to knowledge gaps. When they do ask questions, low-level factual queries can derail the pace of the lecture, overwhelming the teacher and wasting class time. Furthermore, teachers struggle to "read the room" and gauge the collective mood, engagement, and conceptual understanding of 100+ students simultaneously.

## 🎯 The Solution
Vi-SlideS transforms lectures into adaptive learning experiences:
1. **Smart Triage (AI-Deflection)**: Students submit questions anonymously during the lesson. Vi-SlideS uses Google Gemini to rank the *Cognitive Complexity* of the question on a scale of 1-10.
2. **Instant Automated TA**: Simple, factual questions (Complexity $\le$ 4) are instantly resolved by the generative AI, completely deflecting the noise away from the teacher.
3. **Teacher Moderation Dashboard**: Complex, analytical, or subjective questions (Complexity $>$ 4) bypass the AI and route directly to the human Teacher's live dashboard, color-coded by urgency.
4. **Session Analytics**: Post-class, the system evaluates all submissions to perform Sentiment and Mood Analysis, presenting the teacher with a dashboard summarizing class motivation and understanding.

## ✨ Key Implemented Features

### Phase 1: Foundation & Authentication
- Secure JWT-based Authentication separated by "Teacher" and "Student" roles.
- Modern landing page and registration/login interfaces using TailwindCSS.

### Phase 2: Sessions & Real-time Connectivity
- Teachers can create a live Presentation Session with a unique 6-character broadcast code.
- Students can seamlessly join the active session via code.
- Core Mongoose models established for `Users`, `Sessions`, and `Questions`.

### Phase 3: In-Class Questions & AI Triage
- **Real-time Slide Synchronization**: Socket.io broadcasts the teacher's current slide deck position perfectly to all student screens.
- **Smart Triage Architecture**: Gemini 2.5 Flash automatically determines whether to provide an auto-answer or forward the question to the Teacher.
- **Teacher "Auto-Draft"**: A magical button that allows the teacher to press one click and have Gemini pre-generate a draft reply to a complex question for their approval.
- **Student Escalation (Still Confused)**: Students can override AI answers via a "Still Confused? Ask Teacher" flow, which re-routes the problem to the human professor's queue.

### Phase 4: Analytics & Session Control Polish
- **Dynamic Teacher Session Controls**: Start, Pause, and End Session capabilities. Pausing the session instantly locks all student input textareas globally via WebSockets.
- **Post-Session Intelligence Report**: An analytics dashboard featuring holistic class interactions, AI-deflection rates, average cognitive complexity, and a natural language Vibe/Mood Analysis summary.

## 🛠 Technology Stack
- **Frontend**: React.js, TypeScript, Tailwind CSS, Vite, Lucide Icons
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB (Mongoose)
- **Real-time Engine**: Socket.io
- **AI/NLP Engine**: `@google/genai` (Google Gemini 2.5 Flash)

## 🚀 Upcoming Features
- Expand AI capabilities to automatically generate quizzes based on the most confused concepts.
- Provide exportable `.csv` grading sheets logging student participation metrics.
- Support audio-based questioning using Whisper transcription.

---
*Developed under the guidance and mentorship of Rohit Sharma.*
