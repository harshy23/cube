// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const Cube = require("./models/cubemodels");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Test route
app.get("/", (req, res) => {
  res.send("API Working!");
});

// Get cube state
app.get("/api/cubes/cube_1", async (req, res) => {
  try {
    const cube = await Cube.findOne({ cubeId: "cube_1" });
    if (!cube) return res.status(404).json({ error: "Cube not found" });
    res.json(cube);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Save cube state
app.post("/api/cubes/cube_1/save", async (req, res) => {
  const { x, y, z, rotationSpeed } = req.body;

  try {
    let cube = await Cube.findOne({ cubeId: "cube_1" });
    if (!cube) cube = new Cube({ cubeId: "cube_1" });

    cube.position = { x, y, z };
    cube.rotationSpeed = rotationSpeed;
    cube.lastSaved = new Date();
    cube.updatedAt = new Date();

    await cube.save();
    res.json({ message: "Cube state saved!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save cube" });
  }
});

// Reset cube
app.post("/api/cubes/cube_1/reset", async (req, res) => {
  try {
    let cube = await Cube.findOne({ cubeId: "cube_1" });
    if (!cube) cube = new Cube({ cubeId: "cube_1" });

    cube.position = { x: 0, y: 0, z: 0 };
    cube.rotationSpeed = 0;
    cube.lastSaved = new Date();
    cube.updatedAt = new Date();

    await cube.save();
    res.json({ message: "Cube reset to default!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to reset cube" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
