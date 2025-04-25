const express = require("express");
const cors = require("cors"); // Importation de CORS
const authRoutes = require("./routes/auth.routes");

const app = express();

// Configuration CORS
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend React sur localhost:3000
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
