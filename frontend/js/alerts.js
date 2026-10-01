async function loadAlerts() {
    const container = document.getElementById("alertCards");

    if (!container) return;

    try {
        const data = await apiGet("/alerts");

        const alerts = [...(data.alerts || [])].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        // Update counters
        document.getElementById("activeCount").textContent =
            alerts.filter(a => a.status === "active").length;

        document.getElementById("ackCount").textContent =
            alerts.filter(a => a.status === "acknowledged").length;

        document.getElementById("resolvedCount").textContent =
            alerts.filter(a => a.status === "resolved").length;

        // No alerts
        if (!alerts.length) {
            container.innerHTML = `
                <div class="empty-state">
                    No SOS alerts found.
                </div>
            `;
            return;
        }

        // Display alerts
        container.innerHTML = alerts.map(alert => `
            <article class="alert-card">

                <div class="alert-card-top">

                    <div>
                        <h4>
                            Alert #${alert.id} —
                            ${escapeHtml(alert.message || "SOS alert")}
                        </h4>

                        <p>
                            <strong>Device:</strong>
                            ${escapeHtml(alert.deviceId || "--")}
                            •
                            <strong>Battery:</strong>
                            ${alert.battery ?? "--"}%
                        </p>

                        <p>
                            <strong>Location:</strong>
                            ${alert.latitude ?? "--"},
                            ${alert.longitude ?? "--"}
                        </p>

                        <p>
                            <strong>Received:</strong>
                            ${formatTime(alert.createdAt)}
                        </p>
                    </div>

                    <span class="status-pill ${statusClass(alert.status)}">
                        ${escapeHtml(alert.status || "unknown")}
                    </span>

                </div>

                <div class="alert-actions">

                    ${
                        alert.status !== "acknowledged"
                            ? `
                                <button
                                    class="action-btn"
                                    onclick="changeStatus(${alert.id}, 'acknowledged')"
                                >
                                    Acknowledge
                                </button>
                              `
                            : ""
                    }

                    ${
                        alert.status !== "resolved"
                            ? `
                                <button
                                    class="action-btn"
                                    onclick="changeStatus(${alert.id}, 'resolved')"
                                >
                                    Mark Resolved
                                </button>
                              `
                            : ""
                    }

                    ${
                        alert.status !== "active"
                            ? `
                                <button
                                    class="action-btn"
                                    onclick="changeStatus(${alert.id}, 'active')"
                                >
                                    Set Active
                                </button>
                              `
                            : ""
                    }

                </div>

            </article>
        `).join("");

        if (typeof updateNavAlertCount === "function") {
            updateNavAlertCount();
        }

    } catch (error) {

        console.error("Failed to load alerts:", error);

        container.innerHTML = `
            <div class="empty-state">
                Could not load alerts.
                Check that the backend is running.
            </div>
        `;
    }
}


// Change alert status
async function changeStatus(id, status) {

    try {

        await apiPatch(`/alerts/${id}/status`, {
            status: status
        });

        await loadAlerts();

        if (typeof updateNavAlertCount === "function") {
            updateNavAlertCount();
        }

    } catch (error) {

        console.error("Status update failed:", error);

        alert(error.message || "Could not update alert status.");
    }
}


// Format date and time
function formatTime(dateString) {

    if (!dateString) {
        return "--";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleString();
}


// Status CSS class
function statusClass(status) {

    switch (status) {

        case "active":
            return "danger";

        case "acknowledged":
            return "warning";

        case "resolved":
            return "success";

        default:
            return "neutral";
    }
}


// Prevent unsafe HTML
function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// Refresh button
document
    .getElementById("refreshAlerts")
    ?.addEventListener("click", loadAlerts);


// Initial load
loadAlerts();


// Automatically refresh every 5 seconds
setInterval(loadAlerts, 5000);