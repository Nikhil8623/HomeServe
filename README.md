# HomeServe — Home Services Platform

HomeServe is a full-stack home services platform that connects customers with service professionals. Customers can discover professionals, manage bookings, communicate with workers, and manage their profiles. Workers can manage their profiles, services, availability, and customer interactions.

## Technology Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

### Backend
- Java
- Spring Boot
- Spring Data JPA
- Maven
- MySQL

### Database
- MySQL hosted on Aiven Cloud

## Project Structure

```text
HomeServe/
├── .github/
├── backend/
│   ├── src/
│   ├── .mvn/
│   ├── pom.xml
│   └── mvnw.cmd
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
└── .gitignore
```

## Requirements

- Node.js and npm
- Java JDK 21 or compatible version
- MySQL database
- Git

## Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Default development URL: `http://localhost:5173`

## Run the Backend

Configure the required database environment variables before starting Spring Boot.

PowerShell example:

```powershell
$env:DB_PASSWORD = Read-Host "Enter database password"
```

Then:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Default backend URL: `http://localhost:8080`

## Environment Configuration

Refer to `frontend/.env.example` and `backend/.env.example` for configuration templates.

Never commit actual passwords, database credentials, authentication secrets, API keys, or private tokens.

Do not put private credentials in frontend `VITE_` environment variables.

## Database

HomeServe uses MySQL with Spring Data JPA.

The backend database configuration is maintained in:

`backend/src/main/resources/application.properties`

Set the required environment variables locally before running the backend. Do not publish production credentials.

## Important

This repository contains the application source code. Build output, installed dependencies, local environment files, and private credentials should not be committed.