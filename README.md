# 🎯 RandomDots.id

RandomDots is a fullstack web application that visualizes randomly generated points and stores them using a secure backend. Built with Node.js , Express, and EJS, it connects to MongoDB and Cloudinary, and is deployed with Docker and Caddy for production-ready performance.

Inspired by the idea that the best places are often found through friends, not search results, Randomdots makes it easy to contribute, explore, and revisit favorite spots, one post at a time.

The app includes RESTful API endpoints for managing dot data and uses secure, token-based interaction for storage and retrieval.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Docker), Cloudinary
- **DevOps & Deployment:** Docker, Docker Compose, Caddy, GitHub Actions

---

## 🚀 Live Demo

🔗 [randomdots.id](https://randomdots.id)

---

## 🧑‍💻 Features

- Generate and visualize random 2D dot coordinates
- Store and retrieve dot data via RESTful API
- Secure MongoDB connection with Docker networking and authentication
- Cloudinary integration for additional images storage and auth
- Deployed with Docker Compose and served over HTTPS via Caddy

---

## 🐳 Local Development

Clone the repository and run the containers:

```bash
git clone https://github.com/chrisimbolon/randomdots.git
cd randomdots
docker-compose up --build
```

Access the backend at `http://localhost:3000`.

Make sure to set up environment variables for:
- MongoDB user and password
- Cloudinary project credentials

---

## 📁 Project Structure

```
randomdots/
├── src/
│   ├── routes/
│   ├── controllers/
│   └── app.js
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── Caddyfile
└── README.md
```

---

## ✨ About the Project

This project showcases my backend development skills, secure database integration, and Docker-based deployment practices. It reflects my experience working with production setups, CI/CD, and reverse proxy management.

---

## 🙋‍♂️ Author

**Christyan Simbolon**

- 🌐 [Portfolio](https://chrisimbolon.dev)
- 💻 [GitHub](https://github.com/chrisimbolon)
- 🔗 [LinkedIn](https://linkedin.com/in/christyan-simbolon-60a854360)

---

## 📄 License

This project is licensed under the MIT License.

