import express from "express";

import {
  saveERPSession,
  testKeepAlive,
} from "../controllers/erpController.js";

import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/session",
  requireAuth,
  saveERPSession
);

router.post(
  "/keep-alive",
  requireAuth,
  testKeepAlive
);

export default router;