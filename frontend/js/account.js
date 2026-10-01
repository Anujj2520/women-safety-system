document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       BACKEND API
    ===================================================== */

    const API_BASE_URL = "http://localhost:5000/api";


    /* =====================================================
       ACCOUNT PAGE ELEMENTS
    ===================================================== */

    const loginTab =
        document.getElementById("loginTab");

    const signupTab =
        document.getElementById("signupTab");

    const loginForm =
        document.getElementById("loginForm");

    const signupForm =
        document.getElementById("signupForm");

    const goToSignup =
        document.getElementById("goToSignup");

    const goToLogin =
        document.getElementById("goToLogin");

    const accountMessage =
        document.getElementById("accountMessage");


    /* =====================================================
       MESSAGE FUNCTIONS
    ===================================================== */

    function clearMessage() {

        if (!accountMessage) return;

        accountMessage.textContent = "";
        accountMessage.className = "account-message";
    }


    function showMessage(message, type) {

        if (!accountMessage) return;

        accountMessage.textContent = message;
        accountMessage.className =
            "account-message " + type;
    }


    /* =====================================================
       LOGIN / SIGNUP TABS
    ===================================================== */

    function showLogin() {

        if (!loginForm || !signupForm) return;

        if (loginTab) {
            loginTab.classList.add("active");
        }

        if (signupTab) {
            signupTab.classList.remove("active");
        }

        loginForm.classList.add("active");
        signupForm.classList.remove("active");

        clearMessage();
    }


    function showSignup() {

        if (!loginForm || !signupForm) return;

        if (signupTab) {
            signupTab.classList.add("active");
        }

        if (loginTab) {
            loginTab.classList.remove("active");
        }

        signupForm.classList.add("active");
        loginForm.classList.remove("active");

        clearMessage();
    }


    if (loginTab) {
        loginTab.addEventListener(
            "click",
            showLogin
        );
    }


    if (signupTab) {
        signupTab.addEventListener(
            "click",
            showSignup
        );
    }


    if (goToSignup) {
        goToSignup.addEventListener(
            "click",
            showSignup
        );
    }


    if (goToLogin) {
        goToLogin.addEventListener(
            "click",
            showLogin
        );
    }



    /* =====================================================
       CREATE ACCOUNT
       POST /api/users/register
    ===================================================== */

    if (signupForm) {

        signupForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const fullName =
                    document.getElementById("fullName")
                        .value.trim();

                const phone =
                    document.getElementById("phone")
                        .value.trim();

                const email =
                    document.getElementById("signupEmail")
                        .value.trim();

                const emergencyContact =
                    document.getElementById("emergencyContact")
                        .value.trim();

                const password =
                    document.getElementById("signupPassword")
                        .value;


                /* -----------------------------
                   FRONTEND VALIDATION
                ----------------------------- */

                if (
                    !fullName ||
                    !phone ||
                    !email ||
                    !emergencyContact ||
                    !password
                ) {

                    showMessage(
                        "Please fill in all required fields.",
                        "error"
                    );

                    return;
                }


                if (password.length < 6) {

                    showMessage(
                        "Password must contain at least 6 characters.",
                        "error"
                    );

                    return;
                }


                /* -----------------------------
                   DISABLE BUTTON
                ----------------------------- */

                const submitButton =
                    signupForm.querySelector(
                        'button[type="submit"]'
                    );


                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent =
                        "Creating Account...";
                }


                try {

                    /* -----------------------------
                       SEND DATA TO BACKEND
                    ----------------------------- */

                    const response =
                        await fetch(
                            `${API_BASE_URL}/users/register`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    fullName,
                                    phone,
                                    email,
                                    emergencyContact,
                                    password
                                })
                            }
                        );


                    const data =
                        await response.json();


                    /* -----------------------------
                       HANDLE ERROR
                    ----------------------------- */

                    if (!response.ok || !data.success) {

                        showMessage(
                            data.message ||
                            "Unable to create account.",
                            "error"
                        );

                        return;
                    }


                    /* -----------------------------
                       SAVE ONLY SAFE USER DATA
                    ----------------------------- */

                    localStorage.setItem(
                        "womenSafetyUserId",
                        data.user.id
                    );

                    localStorage.setItem(
                        "womenSafetyLoggedIn",
                        "true"
                    );


                    showMessage(
                        "Account created successfully. Opening your safety profile...",
                        "success"
                    );


                    setTimeout(function () {

                        window.location.href =
                            "user-profile.html";

                    }, 1000);


                } catch (error) {

                    console.error(
                        "Registration error:",
                        error
                    );


                    showMessage(
                        "Cannot connect to the Women Safety server. Please make sure the backend is running.",
                        "error"
                    );

                } finally {

                    if (submitButton) {

                        submitButton.disabled = false;

                        submitButton.textContent =
                            "Create Account";
                    }
                }

            }
        );
    }



    /* =====================================================
       LOGIN
       POST /api/users/login
    ===================================================== */

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const email =
                    document.getElementById("loginEmail")
                        .value.trim();

                const password =
                    document.getElementById("loginPassword")
                        .value;


                if (!email || !password) {

                    showMessage(
                        "Please enter your email and password.",
                        "error"
                    );

                    return;
                }


                const submitButton =
                    loginForm.querySelector(
                        'button[type="submit"]'
                    );


                if (submitButton) {

                    submitButton.disabled = true;

                    submitButton.textContent =
                        "Logging in...";
                }


                try {

                    /* -----------------------------
                       SEND LOGIN REQUEST
                    ----------------------------- */

                    const response =
                        await fetch(
                            `${API_BASE_URL}/users/login`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    email,
                                    password
                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok || !data.success) {

                        showMessage(
                            data.message ||
                            "Incorrect email or password.",
                            "error"
                        );

                        return;
                    }


                    /* -----------------------------
                       SAVE USER ID ONLY
                    ----------------------------- */

                    localStorage.setItem(
                        "womenSafetyUserId",
                        data.user.id
                    );

                    localStorage.setItem(
                        "womenSafetyLoggedIn",
                        "true"
                    );


                    showMessage(
                        "Login successful. Opening your safety profile...",
                        "success"
                    );


                    setTimeout(function () {

                        window.location.href =
                            "user-profile.html";

                    }, 700);


                } catch (error) {

                    console.error(
                        "Login error:",
                        error
                    );


                    showMessage(
                        "Cannot connect to the Women Safety server. Please make sure the backend is running.",
                        "error"
                    );

                } finally {

                    if (submitButton) {

                        submitButton.disabled = false;

                        submitButton.textContent =
                            "Login";
                    }
                }

            }
        );
    }



    /* =====================================================
       PROFILE PAGE ELEMENTS
    ===================================================== */

    const userName =
        document.getElementById("userName");

    const userEmail =
        document.getElementById("userEmail");

    const userPhone =
        document.getElementById("userPhone");

    const emergencyContact =
        document.getElementById("emergencyContact");

    const profileName =
        document.getElementById("profileName");

    const profileAvatar =
        document.getElementById("profileAvatar");

    const deviceId =
        document.getElementById("deviceId");

    const deviceBattery =
        document.getElementById("deviceBattery");

    const deviceStatus =
        document.getElementById("deviceStatus");



    /* =====================================================
       PROFILE VARIABLES
    ===================================================== */

    let savedUser = null;



    /* =====================================================
       LOAD USER PROFILE
       GET /api/users/:id
    ===================================================== */

    async function loadUserProfile() {

        const userId =
            localStorage.getItem(
                "womenSafetyUserId"
            );

        const loggedIn =
            localStorage.getItem(
                "womenSafetyLoggedIn"
            );


        if (!userId || loggedIn !== "true") {

            window.location.href =
                "account.html";

            return;
        }


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/users/${userId}`
                );


            const data =
                await response.json();


            if (!response.ok || !data.success) {

                localStorage.removeItem(
                    "womenSafetyUserId"
                );

                localStorage.removeItem(
                    "womenSafetyLoggedIn"
                );

                window.location.href =
                    "account.html";

                return;
            }


            savedUser =
                data.user;


            /* -----------------------------
               DISPLAY USER INFORMATION
            ----------------------------- */

            if (userName) {

                userName.textContent =
                    savedUser.fullName;
            }


            if (profileName) {

                profileName.textContent =
                    savedUser.fullName;
            }


            if (userEmail) {

                userEmail.textContent =
                    savedUser.email;
            }


            if (userPhone) {

                userPhone.textContent =
                    savedUser.phone;
            }


            if (emergencyContact) {

                emergencyContact.textContent =
                    savedUser.emergencyContact;
            }


            if (profileAvatar) {

                profileAvatar.textContent =
                    savedUser.fullName
                        .charAt(0)
                        .toUpperCase();
            }


            if (deviceId) {

                deviceId.textContent =
                    savedUser.deviceId ||
                    "WS-001";
            }


            if (deviceBattery) {

                deviceBattery.textContent =
                    (savedUser.deviceBattery || 82) +
                    "%";
            }


            if (deviceStatus) {

                deviceStatus.textContent =
                    savedUser.deviceStatus ||
                    "Ready";
            }


        } catch (error) {

            console.error(
                "Profile loading error:",
                error
            );

            alert(
                "Unable to connect to the Women Safety server."
            );
        }
    }



    /* =====================================================
       RUN PROFILE LOADING
    ===================================================== */

    if (
        userName ||
        userEmail ||
        userPhone ||
        profileName
    ) {

        loadUserProfile();
    }



    /* =====================================================
       EDIT PROFILE MODAL
    ===================================================== */

    const profileModal =
        document.getElementById("profileModal");

    const editProfileButton =
        document.getElementById(
            "editProfileButton"
        );

    const closeProfileModal =
        document.getElementById(
            "closeProfileModal"
        );

    const editProfileForm =
        document.getElementById(
            "editProfileForm"
        );

    const editName =
        document.getElementById(
            "editName"
        );

    const editPhone =
        document.getElementById(
            "editPhone"
        );

    const editEmail =
        document.getElementById(
            "editEmail"
        );

    const editEmergency =
        document.getElementById(
            "editEmergency"
        );

    const profileEditMessage =
        document.getElementById(
            "profileEditMessage"
        );



    /* =====================================================
       OPEN EDIT PROFILE
    ===================================================== */

    if (editProfileButton) {

        editProfileButton.addEventListener(
            "click",
            async function () {

                if (!savedUser) {

                    await loadUserProfile();
                }


                if (!savedUser) return;


                editName.value =
                    savedUser.fullName || "";


                editPhone.value =
                    savedUser.phone || "";


                editEmail.value =
                    savedUser.email || "";


                editEmergency.value =
                    savedUser.emergencyContact || "";


                if (profileEditMessage) {

                    profileEditMessage.textContent =
                        "";

                    profileEditMessage.className =
                        "profile-edit-message";
                }


                if (profileModal) {

                    profileModal.classList.add(
                        "active"
                    );
                }

            }
        );
    }



    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    if (closeProfileModal) {

        closeProfileModal.addEventListener(
            "click",
            function () {

                if (profileModal) {

                    profileModal.classList.remove(
                        "active"
                    );
                }

            }
        );
    }



    /* =====================================================
       CLOSE MODAL OUTSIDE
    ===================================================== */

    if (profileModal) {

        profileModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === profileModal
                ) {

                    profileModal.classList.remove(
                        "active"
                    );
                }

            }
        );
    }



    /* =====================================================
       SAVE PROFILE CHANGES
       PUT /api/users/:id
    ===================================================== */

    if (editProfileForm) {

        editProfileForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const updatedName =
                    editName.value.trim();

                const updatedPhone =
                    editPhone.value.trim();

                const updatedEmail =
                    editEmail.value.trim();

                const updatedEmergency =
                    editEmergency.value.trim();


                if (
                    !updatedName ||
                    !updatedPhone ||
                    !updatedEmail ||
                    !updatedEmergency
                ) {

                    if (profileEditMessage) {

                        profileEditMessage.textContent =
                            "Please fill in all fields.";

                        profileEditMessage.className =
                            "profile-edit-message error";
                    }

                    return;
                }


                const userId =
                    localStorage.getItem(
                        "womenSafetyUserId"
                    );


                if (!userId) {

                    window.location.href =
                        "account.html";

                    return;
                }


                const saveButton =
                    editProfileForm.querySelector(
                        'button[type="submit"]'
                    );


                if (saveButton) {

                    saveButton.disabled = true;

                    saveButton.textContent =
                        "Saving...";
                }


                try {

                    const response =
                        await fetch(
                            `${API_BASE_URL}/users/${userId}`,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({

                                    fullName:
                                        updatedName,

                                    phone:
                                        updatedPhone,

                                    email:
                                        updatedEmail,

                                    emergencyContact:
                                        updatedEmergency
                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok || !data.success) {

                        if (profileEditMessage) {

                            profileEditMessage.textContent =
                                data.message ||
                                "Unable to update profile.";

                            profileEditMessage.className =
                                "profile-edit-message error";
                        }

                        return;
                    }


                    /* -----------------------------
                       UPDATE LOCAL DISPLAY
                    ----------------------------- */

                    savedUser =
                        data.user;


                    if (userName) {

                        userName.textContent =
                            savedUser.fullName;
                    }


                    if (profileName) {

                        profileName.textContent =
                            savedUser.fullName;
                    }


                    if (userPhone) {

                        userPhone.textContent =
                            savedUser.phone;
                    }


                    if (userEmail) {

                        userEmail.textContent =
                            savedUser.email;
                    }


                    if (emergencyContact) {

                        emergencyContact.textContent =
                            savedUser.emergencyContact;
                    }


                    if (profileAvatar) {

                        profileAvatar.textContent =
                            savedUser.fullName
                                .charAt(0)
                                .toUpperCase();
                    }


                    if (profileEditMessage) {

                        profileEditMessage.textContent =
                            "Profile updated successfully.";

                        profileEditMessage.className =
                            "profile-edit-message success";
                    }


                    setTimeout(function () {

                        if (profileModal) {

                            profileModal.classList.remove(
                                "active"
                            );
                        }

                    }, 1000);


                } catch (error) {

                    console.error(
                        "Profile update error:",
                        error
                    );


                    if (profileEditMessage) {

                        profileEditMessage.textContent =
                            "Cannot connect to the Women Safety server.";

                        profileEditMessage.className =
                            "profile-edit-message error";
                    }

                } finally {

                    if (saveButton) {

                        saveButton.disabled = false;

                        saveButton.textContent =
                            "Save Changes";
                    }
                }

            }
        );
    }



    /* =====================================================
       LOGOUT
    ===================================================== */

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                localStorage.removeItem(
                    "womenSafetyUserId"
                );

                localStorage.removeItem(
                    "womenSafetyLoggedIn"
                );


                window.location.href =
                    "account.html";

            }
        );
    }

});