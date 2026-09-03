import express from "express";

const app = express();

// Example routes
app.get("/health", (req, res) => {
  res.send("OK");
});

app.get("/api/recommendations", (req, res) => {
  res.json({ message: "Here are recommendations" });
});

// Railway requires dynamic PORT
const PORT: number = Number(process.env.PORT) || 8787;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
