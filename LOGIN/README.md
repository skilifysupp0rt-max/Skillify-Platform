# Skillify Platform

**Skillify** is a comprehensive educational platform designed to empower users with skills through an interactive and gamified experience. This repository contains the source code for the Skillify web application, featuring user authentication, dashboards, and community interaction.

## 🚀 Features

-   **User Authentication**: Secure Login & Sign Up with Email/Password and Google OAuth.
-   **Role-Based Access**: Specialized dashboards for Students and Admins.
-   **Gamification**: XP, Levels, Streaks, and Focus Hours tracking.
-   **Community**: Interactive forums and posts.
-   **Real-time Features**: Notifications and updates.

## 🛠️ Tech Stack

-   **Frontend**: HTML5, CSS3, JavaScript (Vanilla).
-   **Backend**: Node.js, Express.js.
-   **Database**: SQLite (Development), utilizing Sequelize ORM.
-   **Security**: Helmet, Rate Limiting, BCrypt, Passport.js.
-   **Real-time**: Socket.io.

## 📋 Prerequisites

-   **Node.js**: v16 or higher.
-   **NPM**: v8 or higher.

## 🏁 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/skillify.git
    cd skillify
    ```

2.  **Install Dependencies**
     Navigate to the server directory and install packages:
    ```bash
    cd LOGIN/server
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in `LOGIN/server/` and configure your keys:
    ```env
    PORT=5000
    SESSION_SECRET=your_super_secret_key
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
    ```

4.  **Run the Server**
    ```bash
    # Development mode (auto-reload)
    npm run dev

    # Production mode
    npm start
    ```

5.  **Access the App**
    Open [http://localhost:5000](http://localhost:5000) in your browser.

## 🛡️ Security Note

-   Ensure `.env` and database files are **never** committed to version control.
-   The default database is SQLite for ease of development. For production, switch to PostgreSQL/MySQL in `config/database.js`.

## 📜 License

This project is licensed under the ISC License.
