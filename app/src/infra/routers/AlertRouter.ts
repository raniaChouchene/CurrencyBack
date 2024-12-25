import { Router } from "express";
import {
  deleteAlert,
  fetchAlertHistory,
  handleSetAlert,
} from "~/application/controllers/AlertContoller";

const router = Router();

router.post("/alerts", async (req, res) => {
  try {
    await handleSetAlert(req, res);
  } catch (error) {
    console.error("Error setting alert:", error);
    res.status(500).json({ message: "Failed to set alert" });
  }
});

router.get("/history", async (req, res) => {
  try {
    await fetchAlertHistory(req, res);
  } catch (error) {
    console.error("Error fetching alert history:", error);
    res.status(500).json({ message: "Failed to fetch alert history" });
  }
});

export { router as alertRouter };
