const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/healthRoutes");
const alertRoutes = require("./routes/alertRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "*"
}));

app.use(express.json());


// ===============================
// HEALTH ROUTES
// ===============================
app.use("/api", healthRoutes);


// ===============================
// ALERT ROUTES
// ===============================
app.use("/api/alerts", alertRoutes);


// ===============================
// DEVICE ROUTES
// ===============================
app.use("/api/devices", deviceRoutes);


// ===============================
// USER ROUTES
// ===============================
app.use("/api/users", userRoutes);


// ===============================
// 404 ROUTE
// ===============================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});


// ===============================
// ERROR HANDLER
// ===============================
app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });

});


module.exports = app; 