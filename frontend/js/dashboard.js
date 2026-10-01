document.addEventListener("DOMContentLoaded", () => {

    updateClock();

    setInterval(updateClock, 1000);

    loadDashboard();

    // Refresh dashboard every 5 seconds
    setInterval(loadDashboard, 5000);
});


/* ===============================
   CLOCK
================================ */

function updateClock() {

    const clock = document.getElementById("clock");

    if (!clock) return;

    const now = new Date();

    clock.textContent = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}


/* ===============================
   LOAD DASHBOARD
================================ */

async function loadDashboard() {

    await updateConnection();

    await loadAlerts();

    await loadDevices();
}


/* ===============================
   BACKEND CONNECTION
================================ */

async function updateConnection() {

    const badge = document.getElementById("connectionBadge");

    try {

        const result = await checkBackend();

        if (result) {

            badge.innerHTML = "<i></i> Connected";

            badge.style.color = "#86efac";

        } else {

            throw new Error("Backend offline");

        }

    } catch (error) {

        badge.innerHTML = "<i></i> Offline";

        badge.style.color = "#f87171";
    }
}


/* ===============================
   ALERTS
================================ */

async function loadAlerts() {

    try {

        const result = await getAlerts();

        console.log("Alerts:", result);

        let alerts = [];

        if (Array.isArray(result)) {
            alerts = result;
        } else if (Array.isArray(result.alerts)) {
            alerts = result.alerts;
        } else if (Array.isArray(result.data)) {
            alerts = result.data;
        }

        updateAlertStats(alerts);

        displayLatestAlert(alerts);

        displayRecentAlerts(alerts);

    } catch (error) {

        console.error("Could not load alerts:", error);

        document.getElementById("activeAlerts").textContent = "--";
    }
}


/* ===============================
   ALERT STATISTICS
================================ */

function updateAlertStats(alerts) {

    const activeAlerts = alerts.filter(alert => {

        const status = String(alert.status || "").toLowerCase();

        return (
            status === "active" ||
            status === "pending"
        );

    });

    const counter = document.getElementById("activeAlerts");

    if (counter) {
        counter.textContent = activeAlerts.length;
    }

    const navCounter = document.getElementById("navAlertCount");

    if (navCounter) {
        navCounter.textContent = activeAlerts.length;
    }
}


/* ===============================
   LATEST ALERT
================================ */

function displayLatestAlert(alerts) {

    const container = document.getElementById("latestAlert");

    const status = document.getElementById("latestStatus");

    if (!container) return;

    if (!alerts.length) {

        container.innerHTML = `
            <div>
                🛡️
                <br><br>
                No emergency alerts recorded.
                <br>
                <small>The system is monitoring your device.</small>
            </div>
        `;

        if (status) {
            status.textContent = "No alerts";
        }

        return;
    }

    const latest = alerts[alerts.length - 1];

    const alertStatus = latest.status || "unknown";

    if (status) {
        status.textContent = alertStatus;
    }

    container.innerHTML = `
        <div style="width:100%; text-align:left;">

            <div style="
                display:flex;
                justify-content:space-between;
                margin-bottom:18px;
            ">

                <strong style="font-size:18px;">
                    🚨 ${latest.message || "Emergency Alert"}
                </strong>

                <span style="
                    padding:6px 10px;
                    border-radius:20px;
                    background:rgba(239,68,68,.12);
                    color:#f87171;
                    font-size:10px;
                ">
                    ${alertStatus}
                </span>

            </div>

            <p>
                <strong>Device:</strong>
                ${latest.deviceId || latest.device_id || "Unknown"}
            </p>

            <p>
                <strong>Location:</strong>
                ${latest.location
                    ? `${latest.location.lat || "--"}, ${latest.location.lon || "--"}`
                    : "Unavailable"}
            </p>

            <p>
                <strong>Time:</strong>
                ${latest.createdAt || latest.timestamp || latest.time || "--"}
            </p>

        </div>
    `;
}


/* ===============================
   RECENT ALERT TABLE
================================ */

function displayRecentAlerts(alerts) {

    const table = document.getElementById("recentAlerts");

    if (!table) return;

    if (!alerts.length) {

        table.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    No alerts found.
                </td>
            </tr>
        `;

        return;
    }

    const recent = [...alerts].reverse().slice(0, 5);

    table.innerHTML = recent.map(alert => {

        return `
            <tr>

                <td>#${alert.id ?? "--"}</td>

                <td>
                    ${alert.deviceId || alert.device_id || "--"}
                </td>

                <td>
                    ${alert.message || "SOS Alert"}
                </td>

                <td>
                    ${alert.createdAt ||
                      alert.timestamp ||
                      alert.time ||
                      "--"}
                </td>

                <td>
                    <span class="status-pill">
                        ${alert.status || "unknown"}
                    </span>
                </td>

            </tr>
        `;

    }).join("");
}


/* ===============================
   DEVICES
================================ */

async function loadDevices() {

    try {

        const result = await getDevices();

        console.log("Devices:", result);

        let devices = [];

        if (Array.isArray(result)) {
            devices = result;
        } else if (Array.isArray(result.devices)) {
            devices = result.devices;
        } else if (Array.isArray(result.data)) {
            devices = result.data;
        }

        updateDeviceStats(devices);

        displayDeviceSummary(devices);

    } catch (error) {

        console.error("Could not load devices:", error);

        document.getElementById("onlineDevices").textContent = "--";
    }
}


/* ===============================
   DEVICE STATISTICS
================================ */

function updateDeviceStats(devices) {

    const online = devices.filter(device => {

        return (
            device.online === true ||
            device.status === "online"
        );

    });

    const onlineElement =
        document.getElementById("onlineDevices");

    if (onlineElement) {
        onlineElement.textContent = online.length;
    }

    if (!devices.length) return;

    const latest = devices[devices.length - 1];

    const battery =
        latest.battery ??
        latest.batteryLevel ??
        latest.battery_level;

    const batteryElement =
        document.getElementById("latestBattery");

    if (batteryElement) {

        batteryElement.textContent =
            battery !== undefined
                ? `${battery}%`
                : "--";
    }


    const locationElement =
        document.getElementById("latestLocation");

    if (locationElement) {

        if (latest.location) {

            locationElement.textContent =
                `${latest.location.lat}, ${latest.location.lon}`;

        } else {

            locationElement.textContent = "--";
        }
    }
}


/* ===============================
   DEVICE SUMMARY
================================ */

function displayDeviceSummary(devices) {

    const container =
        document.getElementById("deviceSummary");

    if (!container) return;

    if (!devices.length) {

        container.innerHTML = `
            <div>
                📱
                <br><br>
                No devices connected.
            </div>
        `;

        return;
    }

    container.innerHTML = devices.map(device => {

        const battery =
            device.battery ??
            device.batteryLevel ??
            device.battery_level ??
            "--";

        const online =
            device.online === true ||
            device.status === "online";

        return `
            <div style="
                display:flex;
                align-items:center;
                gap:14px;
                width:100%;
                padding:14px;
                margin-bottom:8px;
                background:rgba(255,255,255,.025);
                border-radius:10px;
            ">

                <div style="font-size:22px;">
                    📱
                </div>

                <div style="flex:1;">

                    <strong>
                        ${device.deviceId ||
                          device.device_id ||
                          "WS-001"}
                    </strong>

                    <div style="
                        margin-top:5px;
                        color:${online ? "#22c55e" : "#ef4444"};
                        font-size:10px;
                    ">
                        ● ${online ? "Online" : "Offline"}
                    </div>

                </div>

                <div style="
                    color:#94a3b8;
                    font-size:11px;
                ">
                    🔋 ${battery}%
                </div>

            </div>
        `;

    }).join("");
}