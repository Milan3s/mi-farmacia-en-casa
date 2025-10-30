import express from "express";
import {
  getDashboard,
  createOrUpdateDashboard,
  addCard,
  updateCard,
  deleteCard,
  assignRolesToCard,
  deleteDashboard,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/", getDashboard);
router.post("/", createOrUpdateDashboard);
router.delete("/", deleteDashboard);

router.post("/card", addCard);
router.put("/card/:cardId", updateCard);
router.delete("/card/:cardId", deleteCard);
router.put("/card/:cardId/roles", assignRolesToCard);

export default router;
