# StudyFlow — AI-Powered Study Planner

StudyFlow is a full-stack AI-powered study planning application that helps students create personalized study plans based on their subjects, available study time, and upcoming exams.

## Features

- 🤖 AI-generated personalized study plans
- 🔐 User registration and JWT-based authentication
- 📚 Subject and study-profile management
- 📅 Upcoming exam tracking
- ✅ Study task completion tracking
- 📊 Study analytics and progress insights
- 🧠 Structured and validated AI-generated study plans
- 💾 Persistent user and study data with MongoDB
- 🎨 Responsive React-based dashboard

## Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- Node.js
- Express.js
- JWT authentication
- REST APIs

### Database
- MongoDB
- Mongoose

### AI
- OpenAI API

## Architecture

```text
React + Vite
     │
     │ REST API
     ▼
Node.js + Express
     │
     ├── JWT Authentication
     │
     ├── OpenAI API
     │
     ▼
   MongoDB


ai-study-planner/
│
├── client/
│   ├── public/
│   └── src/
│       ├── pages/
│       ├── assets/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   └── server.js
│
└── README.md



