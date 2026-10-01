/* =====================================================
   SAKHI - DEVICES PAGE
===================================================== */

async function loadDevices() {

    const grid = document.getElementById("deviceGrid");

    if (!grid) return;

    try {

        console.log("Loading devices...");

        const data = await apiGet("/devices");

        console.log("Devices API response:", data);

        const devices = Array.isArray(data.devices)
            ? data.devices
            : [];


        /* ---------------------------------------------
           NO DEVICES
        --------------------------------------------- */

        if (!devices.length) {

            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">◈</div>
                    <h4>No devices registered</h4>
                    <p>
                        No wearable devices are currently connected
                        to the Sakhi system.
                    </p>
                </div>
            `;

            return;
        }


        /* ---------------------------------------------
           DEVICE CARDS
        --------------------------------------------- */

        grid.innerHTML = devices.map(device => {

            const battery = Number(device.battery);

            const safeBattery =
                Number.isFinite(battery)
                    ? Math.max(0, Math.min(100, battery))
                    : 0;


            let batteryClass = "battery-good";

            if (safeBattery <= 20) {
                batteryClass = "battery-danger";
            }
            else if (safeBattery <= 50) {
                batteryClass = "battery-warning";
            }


            const online = device.online === true;


            /* Location */

            const latitude =
                Number.isFinite(Number(device.latitude))
                    ? Number(device.latitude).toFixed(6)
                    : "--";

            const longitude =
                Number.isFinite(Number(device.longitude))
                    ? Number(device.longitude).toFixed(6)
                    : "--";


            /* Last seen */

            const lastSeen =
                formatDeviceTime(device.lastSeen);


            return `
                <article class="device-card">

                    <div class="device-card-head">

                        <div class="device-title">

                            <p class="eyebrow">
                                WEARABLE DEVICE
                            </p>

                            <h4>
                                ${escapeDeviceHtml(device.deviceId)}
                            </h4>

                        </div>


                        <span class="device-status ${online ? "online" : "offline"}">

                            <i></i>

                            ${online ? "Online" : "Offline"}

                        </span>

                    </div>


                    <div class="device-metrics">


                        <!-- BATTERY -->

                        <div class="metric">

                            <span>Battery</span>

                            <strong>
                                ${safeBattery}%
                            </strong>

                            <div class="battery-bar">

                                <span
                                    class="${batteryClass}"
                                    style="width:${safeBattery}%">
                                </span>

                            </div>

                        </div>


                        <!-- LAST SEEN -->

                        <div class="metric">

                            <span>Last heartbeat</span>

                            <strong>
                                ${lastSeen}
                            </strong>

                        </div>


                        <!-- LOCATION -->

                        <div class="metric">

                            <span>Location</span>

                            <strong>
                                ${latitude}, ${longitude}
                            </strong>

                        </div>

                    </div>


                    <div class="device-card-footer">

                        <span class="device-id-label">
                            Device ID:
                            <strong>
                                ${escapeDeviceHtml(device.deviceId)}
                            </strong>
                        </span>

                        ${
                            latitude !== "--" && longitude !== "--"
                            ? `
                                <a
                                    class="device-location-button"
                                    href="location.html">
                                    View Live Location →
                                </a>
                            `
                            : ""
                        }

                    </div>

                </article>
            `;

        }).join("");


        console.log("Devices loaded successfully.");

    }
    catch (error) {

        console.error("Device loading error:", error);

        grid.innerHTML = `
            <div class="empty-state error-state">

                <div class="empty-icon">!</div>

                <h4>Unable to load devices</h4>

                <p>
                    The device information could not be retrieved.
                    Check the browser console for details.
                </p>

                <button
                    class="button button-secondary"
                    onclick="loadDevices()">
                    Try Again
                </button>

            </div>
        `;
    }
}


/* =====================================================
   FORMAT DEVICE TIME
   Independent of app.js
===================================================== */

function formatDeviceTime(timestamp) {

    if (!timestamp) {
        return "--";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return String(timestamp);
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });
}


/* =====================================================
   ESCAPE DEVICE ID
===================================================== */

function escapeDeviceHtml(value) {

    return String(value ?? "--")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =====================================================
   REFRESH BUTTON
===================================================== */

document
    .getElementById("refreshDevices")
    ?.addEventListener("click", loadDevices);


/* =====================================================
   INITIAL LOAD
===================================================== */

loadDevices();


/* =====================================================
   AUTO REFRESH
===================================================== */

setInterval(loadDevices, 5000);