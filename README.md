
# Railway Management System

A real-time railway booking system built with Node.js, Express, and PostgreSQL that handles concurrent bookings and user authentication.

## Setup
1. Clone the repository:
```bash
git clone https://github.com/nikhil-x45/irctc.git
cd irctc
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in the project root:
```
PORT=3000
DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=<your_database_name>
DB_PASSWORD=<your_db_password>
DB_PORT=5432
JWT_SECRET=your_jwt_secret_key
ADMIN_API_KEY=your_admin_api_key
```

## Running the Application
Start the server:
```bash
npm start
```

For development mode with auto-reload:
```bash
npm run dev
```


## Key Assumptions
- Each train operates on a daily schedule
- Seat numbers are assigned sequentially starting from 1
- Bookings cannot be modified once confirmed
- Concurrent bookings are handled through database transactions
- JWT tokens expire after 24 hours

## API Endpoints

  ## Authentication

     POST /auth/register - Register new user
     POST /auth/login - User login

  ## Train Management

     POST /train/train - Add new train (Admin only)
     GET /train/availability - Check seat availability
     POST /train/book - Book a seat
     GET /train/booking/:booking_id - Get booking details

All protected endpoints require JWT token in Authorization header.
Admin endpoints additionally require API key in x-api-key header.