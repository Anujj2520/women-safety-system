/* =====================================================
   SAKHI - LIVE LOCATION
===================================================== */

async function loadLocation() {

    const mapDevice = document.getElementById("mapDevice");
    const locationDevice = document.getElementById("locationDevice");
    const latitudeElement = document.getElementById("latitude");
    const longitudeElement = document.getElementById("longitude");
    const locationTime = document.getElementById("locationTime");
    const mapsLink = document.getElementById("mapsLink");
    const mapFrame = document.getElementById("mapFrame");

    try {

        console.log("Loading device location...");

        const devicesData = await apiGet("/devices");

        console.log("Devices API response:", devicesData);

        const devices = Array.isArray(devicesData.devices)
            ? devicesData.devices
            : [];

        if (!devices.length) {

            mapDevice.textContent = "No device";
            mapDevice.className = "status-pill neutral";

            locationDevice.textContent = "--";
            latitudeElement.textContent = "--";
            longitudeElement.textContent = "--";
            locationTime.textContent = "--";

            mapsLink.removeAttribute("href");

            mapFrame.removeAttribute("src");

            return;
        }

        /* ---------------------------------------------
           GET LATEST DEVICE
        --------------------------------------------- */

        const device = devices[devices.length - 1];

        console.log("Latest device:", device);


        /* ---------------------------------------------
           READ COORDINATES
        --------------------------------------------- */

        const lat = Number(device.latitude);
        const lon = Number(device.longitude);


        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {

            console.warn("Invalid coordinates:", {
                latitude: device.latitude,
                longitude: device.longitude
            });

            mapDevice.textContent = "No location";
            mapDevice.className = "status-pill neutral";

            locationDevice.textContent =
                device.deviceId || "--";

            latitudeElement.textContent = "--";
            longitudeElement.textContent = "--";
            locationTime.textContent = "--";

            mapsLink.removeAttribute("href");
            mapFrame.removeAttribute("src");

            return;
        }


        /* ---------------------------------------------
           DEVICE STATUS
        --------------------------------------------- */

        const isOnline = device.online === true;

        mapDevice.textContent =
            isOnline
                ? `${device.deviceId || "Device"} • Online`
                : `${device.deviceId || "Device"} • Offline`;

        mapDevice.className =
            isOnline
                ? "status-pill resolved"
                : "status-pill neutral";


        /* ---------------------------------------------
           LOCATION DETAILS
        --------------------------------------------- */

        locationDevice.textContent =
            device.deviceId || "--";

        latitudeElement.textContent =
            lat.toFixed(6);

        longitudeElement.textContent =
            lon.toFixed(6);


        /* ---------------------------------------------
           LAST SEEN
        --------------------------------------------- */

        if (device.lastSeen) {

            const date = new Date(device.lastSeen);

            if (!Number.isNaN(date.getTime())) {

                locationTime.textContent =
                    date.toLocaleString();

            } else {

                locationTime.textContent =
                    device.lastSeen;

            }

        } else {

            locationTime.textContent = "--";

        }


        /* ---------------------------------------------
           GOOGLE MAPS
        --------------------------------------------- */

        mapsLink.href =
            `https://www.google.com/maps?q=${lat},${lon}`;


        /* ---------------------------------------------
           OPENSTREETMAP
        --------------------------------------------- */

        const delta = 0.01;

        const bbox =
            `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;

        const mapUrl =
            `https://www.openstreetmap.org/export/embed.html` +
            `?bbox=${encodeURIComponent(bbox)}` +
            `&layer=mapnik` +
            `&marker=${encodeURIComponent(lat)},${encodeURIComponent(lon)}`;

        mapFrame.src = mapUrl;


        console.log("Location loaded successfully:", {
            deviceId: device.deviceId,
            latitude: lat,
            longitude: lon,
            online: device.online
        });

    } catch (error) {

        console.error("LIVE LOCATION ERROR:", error);

        /*
           IMPORTANT:
           Do NOT falsely say backend is offline.
        */

        mapDevice.textContent = "Connection Error";
        mapDevice.className = "status-pill neutral";

        locationDevice.textContent = "--";
        latitudeElement.textContent = "--";
        longitudeElement.textContent = "--";
        locationTime.textContent = "--";

    }
}


/* =====================================================
   INITIAL LOAD
===================================================== */

loadLocation();


/* =====================================================
   AUTO REFRESH
   Every 5 seconds
===================================================== */

setInterval(loadLocation, 5000);