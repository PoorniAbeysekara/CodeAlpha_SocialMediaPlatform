# My Social Media Application

## Overview

This is a modern social media application designed to connect users, allow them to share text-based posts with optional images, interact through likes and comments, and manage their personal profiles. The application is built with a focus on a clean user interface and robust backend functionality for authentication and data management.

##  Features

* **User Authentication:** Secure registration and login using JWTs (JSON Web Tokens).
* **User Profiles:** Users can create, view, and update their personal profiles including bio, location, and social media links.
* **Post Management:**
    * Create new posts with text and optional image URLs.
    * View all posts from users (a global feed).
    * View a user's specific posts on their profile.
    * Delete their own posts.
* **Interaction:**
    * Like and Unlike posts.
    * Add comments to posts.
    * Delete their own comments.
* **Account Management:** Users can delete their entire account and all associated data.


## 🛠 Technologies Used

**Backend (API):**
* **Node.js:** JavaScript runtime environment.
* **Express.js:** Fast, unopinionated, minimalist web framework for Node.js.
* **MongoDB:** NoSQL database for storing application data.
* **Mongoose:** MongoDB object data modeling (ODM) for Node.js.
* **JSON Web Tokens (JWT):** For secure user authentication.
* **Bcrypt.js:** For password hashing.
* **Express Validator:** For request body validation.
* **Nodemon:** For automatic server restarts during development.

**Frontend (Client):**
* **HTML5:** Structure of the web pages.
* **CSS3:** Styling and layout (custom CSS).
* **JavaScript :** Client-side logic and DOM manipulation.

## ⚙️ Setup and Installation

Follow these steps to get the development environment up and running.

### Prerequisites

Before you begin, ensure you have the following installed on your machine:

* [Node.js](https://nodejs.org/en/download/) (LTS version recommended)
* [npm](https://www.npmjs.com/get-npm) (comes with Node.js)
* [MongoDB Community Server](https://www.mongodb.com/try/download/community) (or access to a MongoDB Atlas cluster)

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd my-social-media-app # Replace with your project folder name

2. Backend Setup

cd backend
npm install

node server.js

