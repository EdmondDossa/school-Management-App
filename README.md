# 🎓 School Management App

A comprehensive desktop application designed to streamline school administration and management tasks. Built with Electron, React, and Tailwind CSS, this application provides a user-friendly interface for managing students, teachers, classes, grades, and more.

## ✨ Features

-   **Dashboard:** A central hub for quick access to key information and actions.
-   **Student Management:** Add, edit, delete, and search for students. View detailed student information.
-   **Teacher Management:** Manage teacher profiles, including their assigned subjects.
-   **Class Management:** Create and manage classes, assign subjects and teachers.
-   **Subject Management:** Maintain a list of subjects offered by the school.
-   **Enrollment Management:** Enroll students in classes for a specific school year.
-   **Grading System:** Input and manage student grades for different subjects and periods (semesters/trimesters).
-   **Report Cards:** Generate and view student report cards.
-   **Timetable Management:** Create and manage school timetables.
-   **User Authentication:** Secure login system for administrators.
-   **Configuration Assistant:** An initial setup wizard to configure the application for the first time.

## 🛠️ Tech Stack

-   **Framework:** [Electron](https://www.electronjs.org/)
-   **Frontend:** [React](https://reactjs.org/)
-   **Database:** [SQLite](https://www.sqlite.org/index.html) with [Knex.js](https://knexjs.org/) for query building and migrations.
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Bundler:** [Vite](https://vitejs.dev/)
-   **Routing:** [React Router](https://reactrouter.com/)
-   **State Management:** React Hooks & Context API

## 📂 Project Structure

The project is organized into the following main directories:

-   `src/`: Contains the main source code of the application.
    -   `main.js`: The entry point for the Electron main process.
    -   `preload.js`: The script that runs before the web page is loaded in the browser window.
    -   `frontend/`: Contains the React frontend code.
        -   `components/`: Reusable UI components.
        -   `views/`: The main views or pages of the application.
        -   `services/`: Handles communication with the main process and the database.
        -   `models/`: Data models for different entities (Student, Teacher, etc.).
-   `migrations/`: Contains the database migration files managed by Knex.js.
-   `resources/`: Contains static assets like images and icons.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18 or later recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/EdmondDossa/school-Management-App.git
    cd school-Management-App
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

### Running the Application

-   **Development Mode:**
    To start the application in development mode with hot-reloading, run:
    ```sh
    npm run start
    ```

-   **Production Build:**
    To build the application for production, run:
    ```sh
    npm run make
    ```
    This will create a distributable package in the `out` directory.

## 🗄️ Database

The application uses SQLite as its database. The database schema is managed through migrations using Knex.js.

-   **Running Migrations:**
    To apply the latest database migrations, run the following command:
    ```sh
    npx knex migrate:latest
    ```
    *Note: Migrations are usually run automatically on application startup.*

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---
*Made with ❤️ by Marie Edmond DOSSA HEGNON (ABOKA JR)*