const express = require("express");
const router = express.Router();

const {
  addWorker,
  getWorkers,
  updateWorker,
  deleteWorker
} = require("../controllers/workerController");

// POST /api/workers
router.post("/", addWorker);

// GET /api/workers
router.get("/", getWorkers);

// PUT /api/workers/:id
router.put("/:id", updateWorker);

// DELETE /api/workers/:id
router.delete("/:id", deleteWorker);

module.exports = router;