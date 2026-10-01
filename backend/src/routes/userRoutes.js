const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const router = express.Router();

const usersFile = path.join(
    __dirname,
    "../../data/users.json"
);


// =====================================================
// READ USERS
// =====================================================

function readUsers() {

    try {

        if (!fs.existsSync(usersFile)) {
            fs.writeFileSync(
                usersFile,
                "[]",
                "utf8"
            );
        }

        const data =
            fs.readFileSync(
                usersFile,
                "utf8"
            );

        return JSON.parse(data || "[]");

    } catch (error) {

        console.error("Error reading users:", error);

        return [];
    }
}


// =====================================================
// SAVE USERS
// =====================================================

function saveUsers(users) {

    fs.writeFileSync(
        usersFile,
        JSON.stringify(users, null, 4),
        "utf8"
    );
}


// =====================================================
// SAFE USER
// Never send password/hash to frontend
// =====================================================

function safeUser(user) {

    return {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        emergencyContact: user.emergencyContact,
        deviceId: user.deviceId,
        deviceBattery: user.deviceBattery,
        deviceStatus: user.deviceStatus,
        createdAt: user.createdAt
    };
}


// =====================================================
// CREATE ACCOUNT
// POST /api/users/register
// =====================================================

router.post("/register", async (req, res) => {

    try {

        const {
            fullName,
            phone,
            email,
            emergencyContact,
            password
        } = req.body;


        // -----------------------------
        // Validation
        // -----------------------------

        if (
            !fullName ||
            !phone ||
            !email ||
            !emergencyContact ||
            !password
        ) {

            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields."
            });
        }


        if (password.length < 6) {

            return res.status(400).json({
                success: false,
                message:
                    "Password must contain at least 6 characters."
            });
        }


        const users = readUsers();


        // -----------------------------
        // Check duplicate email
        // -----------------------------

        const existingUser =
            users.find(
                user =>
                    user.email.toLowerCase() ===
                    email.toLowerCase()
            );


        if (existingUser) {

            return res.status(409).json({
                success: false,
                message:
                    "An account with this email already exists."
            });
        }


        // -----------------------------
        // Hash password
        // -----------------------------

        const passwordHash =
            await bcrypt.hash(password, 10);


        // -----------------------------
        // Create user
        // -----------------------------

        const newUser = {

            id: crypto.randomUUID(),

            fullName: fullName.trim(),

            phone: phone.trim(),

            email: email.trim().toLowerCase(),

            emergencyContact:
                emergencyContact.trim(),

            passwordHash: passwordHash,

            deviceId: "WS-001",

            deviceBattery: 82,

            deviceStatus: "Ready",

            createdAt:
                new Date().toISOString()

        };


        users.push(newUser);

        saveUsers(users);


        return res.status(201).json({

            success: true,

            message:
                "Account created successfully.",

            user: safeUser(newUser)

        });

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to create account."

        });
    }

});


// =====================================================
// LOGIN
// POST /api/users/login
// =====================================================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter your email and password."

            });
        }


        const users = readUsers();


        const user =
            users.find(
                item =>
                    item.email.toLowerCase() ===
                    email.toLowerCase()
            );


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Incorrect email or password."

            });
        }


        const passwordMatch =
            await bcrypt.compare(
                password,
                user.passwordHash
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Incorrect email or password."

            });
        }


        return res.json({

            success: true,

            message:
                "Login successful.",

            user: safeUser(user)

        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to login."

        });
    }

});


// =====================================================
// GET USER PROFILE
// GET /api/users/:id
// =====================================================

router.get("/:id", (req, res) => {

    try {

        const users = readUsers();

        const user =
            users.find(
                item =>
                    item.id === req.params.id
            );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found."

            });
        }


        return res.json({

            success: true,

            user: safeUser(user)

        });

    } catch (error) {

        console.error(
            "Get user error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to get user profile."

        });
    }

});


// =====================================================
// UPDATE USER PROFILE
// PUT /api/users/:id
// =====================================================

router.put("/:id", (req, res) => {

    try {

        const users = readUsers();

        const userIndex =
            users.findIndex(
                item =>
                    item.id === req.params.id
            );


        if (userIndex === -1) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found."

            });
        }


        const {
            fullName,
            phone,
            email,
            emergencyContact
        } = req.body;


        if (
            !fullName ||
            !phone ||
            !email ||
            !emergencyContact
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please fill in all fields."

            });
        }


        // -----------------------------
        // Check email duplication
        // -----------------------------

        const duplicateEmail =
            users.find(
                user =>
                    user.email.toLowerCase() ===
                    email.toLowerCase() &&
                    user.id !== req.params.id
            );


        if (duplicateEmail) {

            return res.status(409).json({

                success: false,

                message:
                    "Another account already uses this email."

            });
        }


        // -----------------------------
        // Update profile
        // -----------------------------

        users[userIndex].fullName =
            fullName.trim();

        users[userIndex].phone =
            phone.trim();

        users[userIndex].email =
            email.trim().toLowerCase();

        users[userIndex].emergencyContact =
            emergencyContact.trim();


        saveUsers(users);


        return res.json({

            success: true,

            message:
                "Profile updated successfully.",

            user:
                safeUser(users[userIndex])

        });

    } catch (error) {

        console.error(
            "Update user error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to update profile."

        });
    }

});


module.exports = router;