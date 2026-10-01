const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const dataFile = path.join(__dirname, "../../data/devices.json");

// ==========================================
// CONNECTED FRONTEND CLIENTS
// ==========================================

const clients = new Set();

// ==========================================
// READ DEVICES
// ==========================================

function readDevices() {
    try {
        const data = fs.readFileSync(dataFile, "utf8");

        if (!data.trim()) {
            return [];
        }

        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// ==========================================
// SAVE DEVICES
// ==========================================

function saveDevices(devices) {
    fs.writeFileSync(
        dataFile,
        JSON.stringify(devices, null, 2),
        "utf8"
    );
}

// ==========================================
// SEND REAL-TIME UPDATE
// ==========================================

function notifyClients(event, data) {

    const message =
        `event: ${event}\n` +
        `data: ${JSON.stringify(data)}\n\n`;

    for (const client of clients) {

        try {
            client.write(message);
        } catch (error) {
            clients.delete(client);
        }
    }
}

// ==========================================
// REAL-TIME DEVICE STREAM
// ==========================================

router.get("/stream", (req, res) => {

    res.setHeader(
        "Content-Type",
        "text/event-stream"
    );

    res.setHeader(
        "Cache-Control",
        "no-cache"
    );

    res.setHeader(
        "Connection",
        "keep-alive"
    );

    res.flushHeaders();

    clients.add(res);

    // Connection confirmation
    res.write(
        `event: connected\n` +
        `data: ${JSON.stringify({
            success: true,
            message: "Real-time device stream connected"
        })}\n\n`
    );

    // Remove disconnected client
    req.on("close", () => {
        clients.delete(res);
    });
});

// ==========================================
// DEVICE HEARTBEAT
// ==========================================

router.post("/heartbeat", (req, res) => {

    const devices = readDevices();

    const {
        deviceId,
        battery,
        latitude,
        longitude
    } = req.body;

    // Device ID required
    if (!deviceId) {

        return res.status(400).json({
            success: false,
            message: "deviceId is required"
        });
    }

    // Find existing device
    const existingDeviceIndex = devices.findIndex(
        device => device.deviceId === deviceId
    );

    // Create updated device
    const device = {

        deviceId: deviceId,

        battery:
            battery ?? null,

        latitude:
            latitude ?? null,

        longitude:
            longitude ?? null,

        lastSeen:
            new Date().toISOString(),

        online:
            true
    };

    // Update existing device
    if (existingDeviceIndex !== -1) {

        devices[existingDeviceIndex] = device;

    } else {

        // Add new device
        devices.push(device);
    }

    // Save data
    saveDevices(devices);

    // Send real-time update
    notifyClients(
        "DEVICE_UPDATED",
        device
    );

    // Send response
    res.json({
        success: true,
        message: "Device heartbeat received",
        device: device
    });
});

// ==========================================
// GET ALL DEVICES
// ==========================================

router.get("/", (req, res) => {

    const devices = readDevices();

    res.json({
        success: true,
        devices: devices
    });
});

module.exports = router;