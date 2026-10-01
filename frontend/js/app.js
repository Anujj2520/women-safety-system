/* =========================
   BACKEND CONNECTION STATUS
========================= */

async function updateConnectionStatus() {

    const badge =
        document.getElementById("connectionBadge");

    if (!badge) return;

    try {

        const result = await checkBackend();

        if (result && result.success) {

            badge.innerHTML =
                '<i></i> Backend Online';

            badge.classList.remove("offline");

            badge.classList.add("online");

        } else {

            showBackendOffline(badge);

        }

    } catch (error) {

        console.error(
            "Backend health check failed:",
            error
        );

        showBackendOffline(badge);

    }

}


/* =========================
   OFFLINE STATE
========================= */

function showBackendOffline(badge) {

    badge.innerHTML =
        '<i></i> Backend Offline';

    badge.classList.remove("online");

    badge.classList.add("offline");

}


/* =========================
   INITIAL CHECK
========================= */

updateConnectionStatus();


/* =========================
   CHECK EVERY 5 SECONDS
========================= */

setInterval(
    updateConnectionStatus,
    5000
);