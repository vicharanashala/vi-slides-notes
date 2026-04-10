# Vi-SlideS: Comprehensive Architecture & Project Guide 🚀

**An AI-Powered Adaptive Teaching Ecosystem**  
*Developed under the guidance of Mentor Rohit Sharma.*

---

## 1. Core Problem & Concept Definition
University and high-school classrooms traditionally operate on one-way physical instructions. In large classes, students feel intimidated to ask questions, keeping their queries internal, which balloons into massive conceptual gaps. For professors, when students do finally speak up, the vast majority of these live questions are "low-complexity factual questions" that completely interrupt the pace of the lecture.
Furthermore, a teacher lacks the supernatural ability to gauge the holistic *mood* and *sentiment* (e.g., frustration, curiosity, confusion) of hundreds of students in real-time.

**Vi-SlideS** acts as the digital intermediary:
- Students post questions synchronously on their devices during the live presentation.
- A **Generative AI** acts as an instantaneous Teaching Assistant to intercept these questions.
- Factual and repetitive questions are **auto-answered** before they ever hit the teacher's screen.
- Complex and subjective questions are routed to the **Teacher Dashboard** where the human teacher intervenes.
- At the end of the class, all interactions are batch-processed by AI to deliver a beautiful Analytics Dashboard summarizing the overall class sentiment.

---

## 2. Technical Stack
The platform is composed of a decoupled Full-Stack architecture:
*   **Web Framework (Frontend)**: React.js (via Vite) + TypeScript.
*   **Styling**: Pure TailwindCSS with fully custom Lucide Icons integration to achieve a premium UI aesthetic (glassmorphism/dynamic renders).
*   **Server Framework (Backend)**: Node.js + Express.js + Mongoose ODM (MongoDB).
*   **Real-time Communication Layer**: Socket.io (WebSocket implementation bridging React and Express).
*   **Artificial Intelligence Engine**: `@google/genai` (utilizing **Gemini 2.5 Flash**) integrated purely via backend APIs.

---

## 3. High-Level Architectural Flow

### 3.1 Session Creation & Connectivity Flow
1. **Teacher Authorization**: Teachers register/login, generating a JWT token which is placed securely in frontend LocalStorage. 
2. **Room Generation**: The Teacher clicks `Create Live Session`. Express generates a 6-character broadcast alphanumeric code and saves an active `ISession` object in MongoDB.
3. **Websocket Handshake**: The Teacher's React app mounts `<ActiveSession />` and links a `tcp/ws` full-duplex connection via `io.on('connect')`.
4. **Student Entry**: Students join via the 6-character code on their portal without needing authentication, ensuring rapid, frictionless onboarding.

### 3.2 The Smart Triage Pipeline (The Core AI Feature)
This sequence is the absolute foundation of Vi-SlideS:
1. Student types *"What is the formula for gravity?"* and presses Send.
2. The UI instantly injects a `tempId` into React State to render a non-blocking `Sending...` visual bubble (Optimistic UI Pattern).
3. The WebSocket transmits the packet to `server.ts` `on('send_question')`.
4. The backend delegates the text to `analyzeQuestionPrompt` inside `ai.service.ts`.
5. Gemini 2.5 Flash analyzes it according to our System Instruction Prompts and replies using a strict `JSON schema` (Complexity 1-10, Cognitive Level, Suggested Answer).
6. The Express server performs the **Triage Rule**: 
   - `if (complexity <= 4)`, the server emits an `auto_answer` back to the specific student, resolving their query in milliseconds!
   - `if (complexity > 4)`, the server skips auto-answering and routes the question directly into the human Teacher's queue!

### 3.3 State Synchronization & Teacher Controls
- **Slide Progression**: Teachers control the slide page buttons. When incremented, `io.to(room).emit('slide_update')` fires, perfectly synchronizing all students' screens.
- **Session Locking**: A Teacher can hit the **Pause** button to shut down class disturbances. Express updates the Session MongoDB model to `status: 'paused'` and broadcasts a command to all Student websockets to instantly disable their `<textarea>` elements.

### 3.4 Post-Session Intelligence & NLP Analytics
When a teacher hits **End Session**:
1. All client websockets are purposefully severed, and students are forcefully redirected to the exit lobby.
2. The Teacher is redirected to the `/summary/:code` Premium Dashboard.
3. The Dashboard fires a `GET` request to aggregate all mathematically queryable metrics (`Total Queries`, `Gemini Deflection Percentage`).
4. The Dashboard fires a `POST /api/analytics/:code/mood` webhook. The backend accumulates the *entire database of string texts* that students asked during the session, squashes them together, and ships them to Gemini one final time to evaluate the Class Sentiment.
5. Gemini returns a vibe status (e.g., `Confused`, `Engaged`) and a qualitative summary representing the class performance.

---

## 4. Scalability Choices & System Highlights
- **Optimistic UI Caching**: To mask the 3 to 4-second delay required by language models, the WebSockets heavily employ intermediate Temporal IDs (`tempId`), giving students immediate visual feedback before the server responds.
- **WebSocket Event Segregation**: The system heavily relies on differentiating between generic room broadcasts (`io.to(room).emit`) versus sender-specific broadcasts (`socket.emit` or `socket.to(room).emit`). This ensures the exact delivery of state mutations without causing race condition collisions or duplicating UI elements across clients.
- **Robust Error Catching**: WebSockets feature auto-reconnection algorithms scaling up to 10 attempts ensuring mobile students experiencing cell tower drops don't lose session state.

Everything has been rigorously designed to automate the painful parts of teaching, leaving the professor free to address exclusively the smartest queries.
