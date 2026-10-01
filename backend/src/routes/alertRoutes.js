const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const dataFile = path.join(__dirname, "../../data/alerts.json");

// Connected live clients
const clients = new Set();

// Alerts पढ़ना
function readAlerts() {
    try {
        const data = fs.readFileSync(dataFile, "utf8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Alerts सेव करना
function saveAlerts(alerts) {
    fs.writeFileSync(
        dataFile,
        JSON.stringify(alerts, null, 2),
        "utf8"
    );
}

// सभी connected frontend clients को update भेजना
function notifyClients(event, data) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

    for (const client of clients) {
        try {
            client.write(message);
        } catch (error) {
            clients.delete(client);
        }
    }
}

// Real-time alert stream
router.get("/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    clients.add(res);

    // Connection successfully opened
    res.write(`event: connected\ndata: ${JSON.stringify({
        success: true,
        message: "Real-time alert stream connected"
    })}\n\n`);

    req.on("close", () => {
        clients.delete(res);
    });
});

// नया SOS Alert
router.post("/sos", (req, res) => {
    const alerts = readAlerts();

    const newId =
        alerts.length > 0
            ? Math.max(...alerts.map(alert => alert.id)) + 1
            : 1;

    const alert = {
        id: newId,
        deviceId: req.body.deviceId || null,
        latitude: req.body.latitude || null,
        longitude: req.body.longitude || null,
        battery: req.body.battery || null,
        message: req.body.message || "SOS alert received",
        status: "active",
        createdAt: new Date().toISOString()
    };

    alerts.push(alert);
    saveAlerts(alerts);

    // तुरंत connected dashboard को alert भेजें
    notifyClients("SOS_CREATED", alert);

    res.status(201).json({
        success: true,
        message: "SOS alert received successfully",
        alert
    });
});

// सभी SOS Alerts
router.get("/", (req, res) => {
    const alerts = readAlerts();

    res.json({
        success: true,
        alerts
    });
});

// एक specific alert
router.get("/:id", (req, res) => {
    const alerts = readAlerts();

    const alert = alerts.find(
        alert => alert.id === Number(req.params.id)
    );

    if (!alert) {
        return res.status(404).json({
            success: false,
            message: "Alert not found"
        });
    }

    res.json({
        success: true,
        alert
    });
});

// Alert status बदलना
router.patch("/:id/status", (req, res) => {
    const alerts = readAlerts();

    const alert = alerts.find(
        alert => alert.id === Number(req.params.id)
    );

    if (!alert) {
        return res.status(404).json({
            success: false,
            message: "Alert not found"
        });
    }

    const { status } = req.body;

    const allowedStatuses = [
        "active",
        "acknowledged",
        "resolved"
    ];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid status"
        });
    }

    alert.status = status;

    saveAlerts(alerts);

    // Status update भी live भेजें
    notifyClients("ALERT_UPDATED", alert);

    res.json({
        success: true,
        message: "Alert status updated successfully",
        alert
    });
});

module.exports = router;