const express = require("express");
const cors = require("cors"); // Importation de CORS
const authRoutes = require("./routes/auth.routes");
const protectedRoutes = require("./routes/protected.routes");

const app = express();
require("dotenv").config();

// Configuration CORS
app.use(
  cors({
    origin: process.env.REACT_APP_API_URL, // Frontend React sur localhost:3000
    methods: ["GET", "POST", "PUT", "DELETE"], // Méthodes autorisées
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Permet l'envoi des cookies
  })
);

app.use(express.json());
const path = require("path");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
