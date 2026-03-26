# 📝 Task Management Dashboard

A full-stack, secure, and modern Task Management application built with **Angular 19**, **FastAPI**, and **MongoDB**. This project features a dynamic dashboard, real-time filtering, and a sleek Material Design interface.

---

## 🚀 Key Features

-   **🔐 Secure Authentication**: JWT-based login and registration with encrypted passwords (Bcrypt).
-   **👤 User Dashboard**: A persistent left-side sidebar showing your profile (name, email, and avatar).
-   **✏️ Profile Management**: Edit your name, email, and update your password directly from the dashboard.
-   **📅 Advanced Task Filtering**: Powerful filtering pipeline for searching by text, completion status, and custom date ranges/relative periods (today, this week, etc.).
-   **⚡ High Performance**: In-memory RxJS filtering for instant UI updates and a non-blocking FastAPI backend.
-   **🎨 Premium UI**: Modern glassmorphism effects, linear gradients, and responsive Material Design layout.

---

## 🛠️ Technology Stack

### **Frontend**
-   **Framework**: Angular 19 (Standalone)
-   **UI Library**: Angular Material (SideNav, Dialogs, DatePickers)
-   **State Management**: RxJS (BehaviorSubjects & Observables)
-   **Styling**: Vanilla CSS with modern Glassmorphism and Backdrop filters.

### **Backend**
-   **Framework**: FastAPI (Asynchronous Python)
-   **Database**: MongoDB (NoSQL)
-   **Async Driver**: Motor
-   **Security**: PyJWT & Bcrypt
-   **Validation**: Pydantic

---

## 📦 Getting Started

### **1. Prerequisites**
-   Python 3.8+
-   Node.js 20+
-   MongoDB (Running locally or on Atlas)

### **2. Backend Setup**
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    .\venv\Scripts\activate  # Windows
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the server:
    ```bash
    uvicorn main:app --reload
    ```
    *The API will be available at http://localhost:8000*

### **3. Frontend Setup**
1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm start
    ```
    *The app will open at http://localhost:4200 (using the proxy configuration for the backend).*

---

## 🧪 Documentation

For a deep dive into the technical architecture, data flows, and specific Material UI components used, please refer to our internal documentation:
- [Project Architecture & Data Flow](./project_architecture.md)

---

## 🏗️ Deployment

-   **Frontend**: Ready for deployment on **Vercel** via the included `vercel.json`.
-   **Backend**: Best suited for **Railway** or **Render** where MongoDB can be linked as an environment variable (`MONGO_URL`).

---

## 🤝 Contributing
Feel free to fork this repository and submit pull requests for any features or improvements!
