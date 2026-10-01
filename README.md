# Women Safety System

College-project prototype for a women-safety wearable and real-time alert dashboard.

## Current development mode

This version uses MOCK/SIMULATED device data because physical wearable hardware is not available yet.

Flow:

Mock Device → Backend → Database → Real-time updates → Frontend Dashboard

## Planned stack

- Backend: Node.js + Express.js
- Database: PostgreSQL
- Real-time: Socket.IO
- Frontend: HTML/CSS/JavaScript
- Future map: Google Maps
- Future hardware: ESP32 + GPS + GSM/LTE

## Project structure

- `backend/` - API and server
- `frontend/` - safety dashboard
- `mock-device/` - simulated wearable
- `database/` - PostgreSQL schema
