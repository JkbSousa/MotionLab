# MotionLab

A physics projectile simulation built with a React frontend and a Java Spring Boot API. Configure launch parameters and watch the projectile fly in real time, with trajectory charts and calculated metrics.

![MotionLab Preview](https://img.shields.io/badge/status-active-brightgreen)

## Features

- Real-time projectile animation with air resistance
- Multi-planet gravity (Earth, Moon, Mars, Venus)
- Resizable trajectory visualization and chart panels
- Metrics: max height, flight time, range, and final velocity
- Responsive layout for desktop and mobile
- Physics calculations powered by a dedicated Java API

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
- react-resizable-panels

**Backend**
- Java 17+
- Spring Boot
- Maven

## Project Structure

```
MotionLab/
├── frontend/   # React application
└── backend/    # Spring Boot API
```

## Getting Started

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

The API will start at `http://localhost:8080`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will start at `http://localhost:5173`.

## API

**POST** `/api/simulate`

Request:
```json
{
  "velocity": 50,
  "angle": 45,
  "gravity": 9.81
}
```

Response:
```json
{
  "maxHeight": 63.71,
  "flightTime": 7.21,
  "range": 254.84,
  "finalVelocity": 50.0
}
```

## Author

Made by [@JkbSousa](https://github.com/JkbSousa)
