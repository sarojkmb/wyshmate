# Wyshmate

A minimal web app for creating celebration boards where users can share a link and others add text wishes.

## Features

- Create a celebration board with occasion, recipient name, and optional title
- Share a public link to the board
- Add text messages/wishes to the board
- View all wishes in a simple list

## Tech Stack

- **Frontend**: Next.js (TypeScript, Tailwind CSS)
- **Backend**: Spring Boot (Java 17, Spring Data JPA)
- **Database**: PostgreSQL

## Prerequisites

- Java 17
- Node.js
- PostgreSQL (running locally)
- Maven

## Setup

1. **Clone or navigate to the project directory**:
   ```
   cd /Users/saroj/Projects/wyshmate
   ```

2. **Set up PostgreSQL database**:
   - Ensure PostgreSQL is running
   - Create the database:
     ```
     psql -U postgres -c "CREATE DATABASE wyshmate;"
     ```
   - If your PostgreSQL credentials differ, update `api/src/main/resources/application.properties`

3. **Build and run the backend**:
   ```
   cd api
   mvn clean install
   mvn spring-boot:run
   ```
   The API will run on `http://localhost:8080`

4. **Build and run the frontend** (in a new terminal):
   ```
   cd ui
   npm install
   npm run dev
   ```
   The app will run on `http://localhost:3000`

## Usage

1. Open `http://localhost:3000` in your browser
2. Click "Create a Board"
3. Fill in the occasion, recipient name, and optional title
4. Click "Create Board" - you'll be redirected to the board page
5. Copy the shareable link and send it to others
6. Others can visit the link, add their wishes, and view all messages

## API Endpoints

- `POST /boards` - Create a new board
- `GET /boards/{id}` - Get board details
- `POST /boards/{id}/messages` - Add a message to a board
- `GET /boards/{id}/messages` - Get all messages for a board

## Database Schema

### boards
- id (UUID, primary key)
- title (varchar)
- occasion (varchar)
- recipient_name (varchar)
- admin_token (varchar)
- created_at (timestamp)

### messages
- id (UUID, primary key)
- board_id (UUID, foreign key)
- author_name (varchar)
- content (text)
- created_at (timestamp)

## Development

- Backend uses Spring Boot with JPA for database operations
- Frontend uses Next.js with client-side fetching
- CORS is enabled for development

## Deployment

- Frontend can be deployed to Vercel
- Backend can be deployed to Render or Railway
- Database can be hosted on Neon or Supabase

## License

This project is for educational purposes.