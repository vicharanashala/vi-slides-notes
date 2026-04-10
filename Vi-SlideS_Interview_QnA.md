# Vi-SlideS: Technical Interview & Q&A Guide 🧠

This guide contains the most likely, in-depth technical questions your mentor (Rohit Sharma) will ask you about the architecture of **Vi-SlideS**. Read over these answers so you can explain exactly *why* and *how* you built the platform the way you did.

---

## 1. Real-Time Communication (Socket.io)

**Q: Why did you choose WebSockets (Socket.io) instead of standard HTTP REST wrappers or Long Polling?**
**Your Answer:** "Traditional HTTP requires a client to constantly ask the server, *'Is there a new question?'* (Polling). If 100 students pinged the server every second, the database would crash. WebSockets create a **stateful, full-duplex connection**. When a student asks a question, the server instantly *pushes* the update to the Teacher's screen and syncs the presentation slides without the clients ever needing to ask."

**Q: How did you handle separating different classes from receiving each other's questions?**
**Your Answer:** "I heavily utilized Socket.io's **Rooms mechanism**. When a teacher creates a session, an alphanumeric code (like `A7B9QC`) is created. When a student enters that code, my Node.js backend executes `socket.join(sessionCode)`. This perfectly scopes all broadcasts (`socket.to(room).emit()`) dynamically so slide updates and new questions only go to users connected to that specific room ID."

**Q: I saw you fix a 'flickering' bug regarding AI Answers. What was the exact socket race condition?**
**Your Answer:** "When a student asked a simple question, the system correctly executed `socket.emit('auto_answer')` to send the AI's answer strictly back to the sender. But right underneath it, the system *also* broadcasted `io.to(room).emit('receive_question')` to update everyone else's screen about the new Pending question. The problem was `io.to(room)` broadcasts to *everyone*, including the sender! The sender received the AI Answer, and 1 millisecond later, received an overarching 'Pending' status, wiping out their answer. I fixed this by switching the broadcast to `socket.to(room).emit()`, which broadcasts to everyone in the room *except* the sender."

---

## 2. Authentication & Security (JWT)

**Q: How does the Authentication mechanism work for Teachers?**
**Your Answer:** "I used stateless **JSON Web Tokens (JWT)**. When a teacher logs in, the Express server authenticates the password against the bcrypt hash in MongoDB. If successful, it signs a JWT containing the Teacher's `userID` and returns it. The React app stores this token in `localStorage`. For every protected route (like `GET /api/analytics`), the frontend attaches an `Authorization: Bearer <token>` header, which my custom Express middleware verifies before granting access."

**Q: Why don't Students have to log in the same way? Isn't that a security flaw?**
**Your Answer:** "It's an intentional UX design decision called **Frictionless Onboarding**. If a teacher launches a live presentation, you cannot afford to have 100 students fumbling with email verifications and forgotten passwords; they would miss the lecture! They simply input the 6-character Live Code and their display name, and they are temporarily tracked inside the socket session memory."

---

## 3. Frontend Architecture (React & Optimistic UI)

**Q: Explain how you manage the React State for the Live Session.**
**Your Answer:** "I utilize React functional components with `useState` to maintain an array of `Question` objects. I put the initial database fetch and the Socket.io event listeners inside a `useEffect` hook with an empty dependency array (or dependent on the room code), to ensure the Socket is only authenticated once on component mount, preventing memory leaks and infinite loop re-renders."

**Q: What is Optimistic UI, and how did you use intermediate 'tempIds'?**
**Your Answer:** "Gemini 2.5 Flash can take 2 to 4 seconds to parse natural language. If a student pressed 'Send' and the screen froze for 4 seconds, they'd think the app crashed and click Send 10 times. 
Optimistic UI means rendering success *before* the server replies. When the student clicks Send, I instantly inject a bubble into the DOM with a fake `temp-ID` and a `Sending...` status. 
Four seconds later, when the WebSocket gets the real MongoDB `_id` and the AI answer back from the server, React uses the `prev.map()` function to gracefully search for that `tempId` and swap it with the true data without duplicate renders."

---

## 4. Database (MongoDB & Mongoose)

**Q: Explain how the Mongoose schemas relate to each other.**
**Your Answer:** "I have three core models: `User`, `Session`, and `Question`.
The `Session` schema holds a `teacherId` reference to the `User` schema and stores the active 6-character broadcast code. 
The `Question` schema houses the heavy data: the text itself, the AI integer tracking (complexity score), and a `status` enum (`pending`, `answered_ai`, `answered_teacher`). When I need analytics, I can perform highly efficient Mongoose aggregation pipelines counting docs where `sessionCode` matches."

---

## 5. Artificial Intelligence (Generative AI & Smart Triage)

**Q: You used Google Gemini. How did you force the AI to return data that an algorithm can actually parse, rather than just chatty English?**
**Your Answer:** "I strictly engineered the **System Prompt constraints**. First, I used `@google/genai` and configured the model `responseMimeType: "application/json"`. 
Inside the system instructions, I hardcoded a JSON schema telling the AI that it was a 'Strict Educational Classifier'. I demanded keys for `complexity` (integer 1-10) and `suggestedAnswer`. If it wasn't strictly formatted, Node's `JSON.parse` would crash, so constraining the output via system prompting was paramount."

**Q: The Class Sentiment/Mood Analytics is brilliant. How did you build it in Phase 4?**
**Your Answer:** "When the Teacher hits 'End Session', the Analytics Dashboard loads. The frontend calls `POST /api/analytics/:code/mood`. 
The Node server uses Mongoose to find *every single question* tied to that session code. It extracts all the raw strings, concats them into one massive string block, and ships it to Gemini in one high-context prompt. Gemini evaluates the entire text corpus simultaneously, deriving overarching sentiment keywords (like 'Curious' or 'Frustrated') and returns a beautifully parsed summary of the classroom's core understanding!"
