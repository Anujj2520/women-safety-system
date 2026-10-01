const API_BASE = "http://localhost:5000/api";


/* =========================
   COMMON API REQUEST
========================= */

async function apiRequest(endpoint, options = {}) {

    try {

        const response = await fetch(`${API_BASE}${endpoint}`, {

            headers: {
                "Content-Type": "application/json"
            },

            ...options

        });


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "API request failed"
            );

        }


        return data;

    } catch (error) {

        console.error("API Error:", error);

        throw error;

    }

}


/* =========================
   GET REQUEST
========================= */

async function apiGet(endpoint) {

    return await apiRequest(endpoint, {
        method: "GET"
    });

}


/* =========================
   POST REQUEST
========================= */

async function apiPost(endpoint, body = {}) {

    return await apiRequest(endpoint, {

        method: "POST",

        body: JSON.stringify(body)

    });

}


/* =========================
   PATCH REQUEST
========================= */

async function apiPatch(endpoint, body = {}) {

    return await apiRequest(endpoint, {

        method: "PATCH",

        body: JSON.stringify(body)

    });

}


/* =========================
   DELETE REQUEST
========================= */

async function apiDelete(endpoint) {

    return await apiRequest(endpoint, {

        method: "DELETE"

    });

}


/* =========================
   CHECK BACKEND
========================= */

async function checkBackend() {

    try {

        const response = await fetch(
            `${API_BASE}/health`
        );


        if (!response.ok) {

            throw new Error(
                "Backend unavailable"
            );

        }


        return await response.json();

    } catch (error) {

        console.error(
            "Backend connection failed:",
            error
        );

        return null;

    }

}


/* =========================
   ALERTS
========================= */

async function getAlerts() {

    return await apiGet("/alerts");

}


/* =========================
   DEVICES
========================= */

async function getDevices() {

    return await apiGet("/devices");

}