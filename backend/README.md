# Backend

## Setup

```bash
cd backend
npm install
npm run dev
```

The API starts on `http://localhost:5000`.

Initial endpoint:

- `GET /api/health`
- `POST /api/device/sos`

The SOS endpoint currently keeps data in memory for the prototype. PostgreSQL will be connected in the next development stage.
