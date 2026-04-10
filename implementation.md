# Vi-SlideS Implementation Plan

Vi-SlideS is an AI-powered adaptive classroom platform. This plan focuses on **Parallel Development**, mapping the project into 4 synchronized Sprints. This ensures that all 4 team members have tasks in every phase, leading to steady, equal contributions.

## Team Roles
1. **Member 1 (Frontend Lead)**: Teacher Dashboard & Session Management.
2. **Member 2 (Frontend Dev)**: Student Interfaces & Engagement.
3. **Member 3 (Backend Lead)**: Core API, WebSockets, Database.
4. **Member 4 (Backend AI/NLP)**: AI Engine & Analytics.

---

## Sprint 1: Foundation & Authentication
**Goal**: Get the base infrastructure up, handle user logins, and prepare the AI environment.
- **Member 1**: Setup React + Tailwind project. Create Teacher Auth UI and basic Dashboard layout.
- **Member 2**: Implement Student Auth UI and base "Join Class" page layout.
- **Member 3**: Initialize Express/Node.js app + MongoDB. Implement JWT Authentication endpoints.
- **Member 4**: Setup OpenAI/Local LLM scripts. Create testing scaffolding for future AI prompts.

## Sprint 2: Sessions & Real-time Connectivity
**Goal**: Teachers can create a live session, and students can join via WebSockets.
- **Member 1**: Implement "Create Session" flow, generate unique codes, build "Active Session" UI container.
- **Member 2**: Implement the "Join Session via Code" flow and basic Question Input UI.
- **Member 3**: Setup Socket.io. Implement Session DB schema and endpoints to Start/Join sessions.
- **Member 4**: Build the initial internal API route that accepts a question string and returns basic dummy analysis.

## Sprint 3: In-Class Questions & AI Triage
**Goal**: Students submit questions, AI analyzes them instantly, and routes appropriately.
- **Member 1**: Build the real-time "Slides-Based View" for teachers, receiving live questions via websockets.
- **Member 2**: Finalize the real-time Question Submission form with "Anonymous" toggle and live status updates.
- **Member 3**: Build APIs for Question CRUD and websocket broadcasting logic (only send complex questions to teachers).
- **Member 4**: Implement the core "Smart Triage" AI system: Cognitive Complexity Classification and Auto-Answering factual queries.

## Sprint 4: Analytics & Polish
**Goal**: Post-class insights, mood analysis, and final integration.
- **Member 1**: Develop the Session Summary UI displaying class mood and motivation.
- **Member 2**: Polish student mobile responsiveness, handle websocket disconnect/reconnect errors.
- **Member 3**: Aggregate database statistics for analytics endpoints. Secure all routes.
- **Member 4**: Implement the Class Sentiment/Mood analysis pipeline by examining the batch of session questions.
