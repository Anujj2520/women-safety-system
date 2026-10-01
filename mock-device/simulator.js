const {
    sendHeartbeat,
    pressSOS
} = require("./device");

console.log("======================================");
console.log(" WOMEN SAFETY MOCK DEVICE");
console.log(" Device ID: Sakhi-001");
console.log("======================================");

console.log("Starting heartbeat simulation...\n");

// Send heartbeat immediately
sendHeartbeat();

// Send heartbeat every 10 seconds
setInterval(() => {
    sendHeartbeat();
}, 10000);

// Demo SOS after 30 seconds
setTimeout(() => {
    console.log("\n🚨 DEMO SOS BUTTON PRESSED");
    pressSOS();
}, 30000);