import { Router } from "express";
import {
  fetchAlertHistory,
  handleSetAlert,
  monitorAlerts,
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
/**
 * @swagger
 * /alerts/monitor:
 *   get:
 *     summary: Monitor alerts
 */
router.get("/monitor-alerts", async (req, res) => {
  try {
    await monitorAlerts();
    res.status(200).send("Alerts checked successfully!");
  } catch (error) {
    res.status(500).send("Error monitoring alerts");
  }
});

export { router as alertRouter };
