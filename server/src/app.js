import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import erpRoutes from "./routes/erpRoutes.js";
import { startERPScheduler } from "./services/erpScheduler.js";

import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5002;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "ERP Keeper API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/erp", erpRoutes);



app.listen(PORT, () => {
  console.log(
    `ERP Keeper server running on http://localhost:${PORT}`
  );
});