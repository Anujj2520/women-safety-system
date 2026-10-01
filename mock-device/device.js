const http = require("http");

const DEVICE_ID = "Sakhi-001";
const API_HOST = "localhost";
const API_PORT = 5000;

let battery = 82;

let location = {
    latitude: 19.0760,
    longitude: 72.8777
};

function sendHeartbeat() {
    const data = JSON.stringify({
        deviceId: DEVICE_ID,
        battery: battery,
        latitude: location.latitude,
        longitude: location.longitude
    });

    const options = {
        hostname: API_HOST,
        port: API_PORT,
        path: "/api/devices/heartbeat",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(data)
        }
    };

    const request = http.request(options, response => {
        let responseData = "";

        response.on("data", chunk => {
            responseData += chunk;
        });

        response.on("end", () => {
            console.log(
                `[Heartbeat] ${response.statusCode}: ${responseData}`
            );
        });
    });

    request.on("error", error => {
        console.error(
            "[Heartbeat Error]",
            error.message
        );
    });

    request.write(data);
    request.end();
}

function pressSOS() {
    const data = JSON.stringify({
        deviceId: DEVICE_ID,
        message: "Emergency button pressed",
        latitude: location.latitude,
        longitude: location.longitude
    });

    const options = {
        hostname: API_HOST,
        port: API_PORT,
        path: "/api/alerts/sos",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(data)
        }
    };

    const request = http.request(options, response => {
        let responseData = "";

        response.on("data", chunk => {
            responseData += chunk;
        });

        response.on("end", () => {
            console.log(
                `[SOS] ${response.statusCode}: ${responseData}`
            );
        });
    });

    request.on("error", error => {
        console.error(
            "[SOS Error]",
            error.message
        );
    });

    request.write(data);
    request.end();
}

module.exports = {
    sendHeartbeat,
    pressSOS
};