const alertStream = new EventSource(
    "http://localhost:5000/api/alerts/stream"
);

const deviceStream = new EventSource(
    "http://localhost:5000/api/devices/stream"
);

// ==========================================
// ALERT REAL-TIME CONNECTION
// ==========================================

alertStream.addEventListener("connected", () => {
    console.log("✅ Real-time alert connection established");
});

alertStream.addEventListener("SOS_CREATED", (event) => {

    const alert = JSON.parse(event.data);

    console.log("🚨 New SOS received:", alert);

    showRealtimeNotification(
        `New SOS Alert #${alert.id} from ${alert.deviceId}`
    );

    if (typeof loadDashboard === "function") {
        loadDashboard();
    }

    if (typeof loadAlerts === "function") {
        loadAlerts();
    }

    if (typeof updateNavAlertCount === "function") {
        updateNavAlertCount();
    }
});

alertStream.addEventListener("ALERT_UPDATED", (event) => {

    const alert = JSON.parse(event.data);

    console.log("🔄 Alert updated:", alert);

    if (typeof loadDashboard === "function") {
        loadDashboard();
    }

    if (typeof loadAlerts === "function") {
        loadAlerts();
    }

    if (typeof updateNavAlertCount === "function") {
        updateNavAlertCount();
    }
});


// ==========================================
// DEVICE REAL-TIME CONNECTION
// ==========================================

deviceStream.addEventListener("connected", () => {
    console.log("✅ Real-time device connection established");
});

deviceStream.addEventListener("DEVICE_UPDATED", (event) => {

    const device = JSON.parse(event.data);

    console.log("📡 Device updated:", device);

    // Update dashboard immediately
    if (typeof loadDashboard === "function") {
        loadDashboard();
    }

    // Update device page immediately
    if (typeof loadDevices === "function") {
        loadDevices();
    }

    // Update location page immediately
    if (typeof loadLocation === "function") {
        loadLocation();
    }
});


// ==========================================
// CONNECTION ERRORS
// ==========================================

alertStream.onerror = () => {

    console.log(
        "⚠️ Alert real-time connection interrupted. Retrying..."
    );
};

deviceStream.onerror = () => {

    console.log(
        "⚠️ Device real-time connection interrupted. Retrying..."
    );
};


// ==========================================
// NOTIFICATION
// ==========================================

function showRealtimeNotification(message) {

    const notification =
        document.createElement("div");

    notification.className =
        "realtime-notification";

    notification.innerHTML = `
        <strong>🚨 Emergency Alert</strong>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {

        notification.classList.add("show");

    }, 10);

    setTimeout(() => {

        notification.classList.remove("show");

        setTimeout(() => {
            notification.remove();
        }, 300);

    }, 5000);
}