# Vi-SlideS

Vi-SlideS is an AI-powered, question-driven classroom platform that helps teachers adapt live teaching based on student questions, sentiment, and cognitive understanding. Instead of one-way lectures, the system enables students to shape class flow through meaningful questions while AI assists teachers with real-time insights.

---

## Overview

Traditional classrooms often struggle to measure real-time understanding and engagement. Vi-SlideS changes this by introducing a **question-first teaching model**.

After a short topic introduction (5–10 minutes), students submit questions through the platform. These questions become the primary input for AI-driven analysis that helps teachers understand:

- What students are confused about
- Overall class mood and motivation
- Depth of student understanding
- Which questions can be answered automatically
- Which questions require deeper teacher attention

This allows instructors to focus their time where it matters most.

---

## Core Concept

1. Teacher introduces a topic briefly  
2. Students submit questions
3. AI analyzes all questions in real time  
4. Simple questions receive instant AI responses  
5. Complex questions are prioritized for the teacher  
6. Teacher adapts the class using live insights  

---

## Key Features

- Real-time student question submission
- Optional anonymous or identified questions
- Automatic question categorization by complexity
- AI-powered sentiment and motivation analysis
- Smart routing of questions (AI vs Teacher)
- Teacher dashboard with prioritized questions
- Class-level insights on understanding and learning gaps
- Question and answer history for later review

---

## Question Handling Logic

### AI Automatically Answers
- Definition-based or factual questions
- Repeated or previously answered questions
- Low cognitive complexity clarifications

### Teacher Handles
- Conceptually deep questions
- Critical thinking and problem-solving queries
- Novel or creative perspectives
- Personalized explanation requests

Teachers can review, edit, or override AI-generated answers at any time.

---

## Tech Stack

### Frontend
- React
- TypeScript
- Modern UI with real-time updates

### Backend
- Node.js
- Express.js
- REST APIs
- WebSocket-based real-time communication

### Database
- MongoDB

### AI & NLP
- Large Language Models (LLMs)
- Sentiment analysis models
- Cognitive complexity classification models
- Theme extraction and clustering

---

## System Workflow

### Pre-Class
- Teacher presents a short introduction
- Students submit questions

### During Class
- AI analyzes incoming questions
- Mood, motivation, and understanding are inferred
- Questions are routed to AI or teacher
- Teacher adjusts teaching direction dynamically

### Post-Class
- Analytics report generated
- Questions and answers archived
- Learning gaps identified for future sessions

---

## Current Status

The project is in the experimentation phase, which is being carried out using Google Forms, Sheets, and Slides for validation.
We want a full proof MERN application for it.

---

## Goals

- Make classrooms more interactive and student-driven
- Reduce teacher overload through smart automation
- Identify learning gaps early
- Improve engagement by validating student curiosity
- Enable data-driven teaching decisions

---

## Current Status

The project is currently in the experimentation and validation phase, using Google Forms, Google Sheets, and Google Slides to test the core idea and classroom workflow.

The next goal is to build a full-fledged MERN application that provides a scalable, real-time, and production-ready implementation of the platform.

---

## Contributing

Contributions are welcome.  
Please check the Issues for existing feature requests or reported bugs. Feel free to pick an issue, suggest improvements, or open a new issue if you have an idea to enhance the project. Kindly keep changes focused and well-documented.

---

## License

This project is licensed under the MIT License.


