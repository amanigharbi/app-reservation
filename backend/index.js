const express = require("express");
const cors = require("cors"); // Importation de CORS
const authRoutes = require("./routes/auth.routes");
const protectedRoutes = require("./routes/protected.routes");

const app = express();

// Configuration CORS
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend React sur localhost:3000
    methods: ["GET", "POST", "PUT", "DELETE"], // Méthodes autorisées
    allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,              // Permet l'envoi des cookies

  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
