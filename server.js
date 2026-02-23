const express = require("express");
const cors = require("cors");

require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const workerRoutes = require("./routes/workerRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const salaryRoutes = require("./routes/salaryRoutes");
const productRoutes = require("./routes/productRoutes");
const machineRoutes = require("./routes/machineRoutes");
const productionRoutes = require("./routes/productionRoutes");
const rawMaterialRoutes = require("./routes/rawMaterialRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const productionTargetRoutes = require("./routes/productionTargetRoutes");
const publicRoutes = require("./routes/publicRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://factoryflow-portal.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/machines", machineRoutes);
app.use("/api/production", productionRoutes);
app.use("/api/raw-materials", rawMaterialRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/targets", productionTargetRoutes);
app.use("/api/public", publicRoutes);

// ✅ FIXED FOR DEPLOYMENT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
