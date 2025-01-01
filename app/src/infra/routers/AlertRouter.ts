import { Router } from "express";
import {
  fetchAlertHistory,
  handleSetAlert,
} from "~/application/controllers/AlertContoller";

const router = Router();
/**
 * @swagger
 * /alerts:
 *   post:
 *     summary: Create a new alert
 */
router.post("/alerts", async (req, res) => {
  try {
    await handleSetAlert(req, res);
  } catch (error) {
    console.error("Error setting alert:", error);
    res.status(500).json({ message: "Failed to set alert" });
  }
});
/**
 * @swagger
 * /alerts/history:
 *   get:
 *     summary: Fetch alert history
 */
router.get("/history", async (req, res) => {
  try {
    await fetchAlertHistory(req, res);
  } catch (error) {
    console.error("Error fetching alert history:", error);
    res.status(500).json({ message: "Failed to fetch alert history" });
  }
});

export { router as alertRouter };
