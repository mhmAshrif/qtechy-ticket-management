# 🎫 QTechy Role-Based Ticket Management System

This project is a full-stack MERN application built for the **QTechy Associate MERN Engineer technical assessment**. It is a secure, role-based ticket management system where Users can create support tickets, Agents can manage them, and Admins can oversee the entire system via a comprehensive dashboard.

## 🚀 Live Deployment Links
* **Frontend Application (Vercel):** https://qtechy-ticket-management.vercel.app
* **Backend API (Alwaysdata):** https://ashrif-ticket-system.alwaysdata.net
* **GitHub Repository:** https://github.com/mhmAshrif/qtechy-ticket-management.git

---

## 🔐 Test Login Credentials
As per the assessment requirements, please use the following role-based test accounts to evaluate the live application without needing to register.

| Role | Email Address | Password | Permissions & Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@test.com` | `password123` | Full system access. View all tickets, manage users, assign agents, delete tickets, view dashboard statistics. |
| **Agent** | `agent@test.com` | `password123` | View assigned tickets, update ticket statuses, add comments. |
| **User** | `user@test.com`  | `password123` | Create new tickets, view personal ticket history, add comments to own tickets. |

---

## 🛠️ Tech Stack & Architecture
This project implements a complete, modern MERN stack architecture:
* **Frontend:** React.js (Vite), CSS/Tailwind, Axios
* **State Management:** Redux Toolkit (predictable state container)
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas (Mongoose ODM)
* **Authentication:** JSON Web Tokens (JWT) & bcryptjs password hashing
* **Deployment Architecture:** Vercel (Frontend Hosting) & Alwaysdata (Backend Reverse Proxy)

---

## ⚙️ Environment Variables Guide
To run this project locally, you must create a `.env` file in both the `frontend` and `backend` root directories.

### Backend (`/backend/.env`)
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:5173


## Frontend (`/frontend/.env`)
Create a `.env` file in the frontend folder and add the following variable:

```env
# For local testing, use http://localhost:5000/api
VITE_API_URL=[https://ashrif-ticket-system.alwaysdata.net/api](https://ashrif-ticket-system.alwaysdata.net/api)


Local Setup & Installation Instructions
Follow these steps to run the project locally on your machine.

1. Clone the repository
git clone [https://github.com/mhmAshrif/qtechy-ticket-management.git]
cd qtechy-ticket-management

2. Setup the Backend Server
cd backend
npm install
# Ensure your .env file is created based on the guide above
npm run dev

The backend server will start on port 5000.


3. Setup the Frontend Client
Open a new terminal window:
cd frontend
npm install
# Ensure your .env file is created based on the guide above
npm run dev

The React application will be accessible at http://localhost:5173.




API Endpoints Summary
All API routes (except login/register) are protected by a custom JWT authorization middleware that enforces role-based access control.

Authentication Routes (/api/users)
POST /register - Register a new user

POST /login - Authenticate user & receive JWT payload

GET /me - Get current user profile (Protected)

Ticket Management Routes (/api/tickets)
GET / - Fetch tickets (Users see their own; Admins/Agents see assigned or all)

POST / - Create a new support ticket (User/Admin)

GET /:id - Get details of a single ticket by ID

PUT /:id - Update ticket details (Creator/Admin)

PATCH /:id/status - Update the status of a ticket (Agent/Admin)

PATCH /:id/assign - Assign a ticket to a specific Agent (Admin only)

DELETE /:id - Delete a ticket entirely (Admin only)

Comment Routes (/api/tickets/:id/comments)
POST / - Add a communication comment to a specific ticket

Developed by Mohamed Ashrif for the QTechy Associate MERN Engineer Technical Assessment.

