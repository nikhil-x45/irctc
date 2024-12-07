const db = require('../config/database');

// Add new train (Admin only)
exports.addTrain = async (req, res) => {
    const client = await db.getClient();
    
    try {
        await client.query('BEGIN');
        
        const { train_name, source_station, destination_station, 
                total_seats, departure_time, arrival_time } = req.body;
        
        const trainResult = await client.query(
            `INSERT INTO trains (train_name, source_station, destination_station, 
                               total_seats, departure_time, arrival_time)
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [train_name, source_station, destination_station, 
             total_seats, departure_time, arrival_time]
        );

        // initialize seat availability
        await client.query(
            `INSERT INTO seat_availability (train_id, travel_date, available_seats)
             VALUES ($1, CURRENT_DATE, $2)`,
            [trainResult.rows[0].train_id, total_seats]
        );

        await client.query('COMMIT');
        
        res.status(201).json({
            success: true,
            train: trainResult.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: err.message });
    } finally {
        client.release();
    }
};

// Check availability between stations
exports.checkAvailability = async (req, res) => {
    try {
        const { source, destination, date } = req.query;
        
        const result = await db.query(
            `SELECT t.*, sa.available_seats
             FROM trains t
             JOIN seat_availability sa ON t.train_id = sa.train_id
             WHERE t.source_station = $1 
             AND t.destination_station = $2
             AND sa.travel_date = $3`,
            [source, destination, date]
        );

        res.json({
            success: true,
            trains: result.rows
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Book a seat
exports.bookSeat = async (req, res) => {
    const client = await db.getClient();
    
    try {
        await client.query('BEGIN');
        
        const { train_id, travel_date } = req.body;
        const user_id = req.user.userId;

        // Check and update availability atomically
        const availabilityResult = await client.query(
            `UPDATE seat_availability 
             SET available_seats = available_seats - 1
             WHERE train_id = $1 
             AND travel_date = $2 
             AND available_seats > 0
             RETURNING available_seats`,
            [train_id, travel_date]
        );

        if (availabilityResult.rowCount === 0) {
            throw new Error('No seats available');
        }

        // Create booking
        const bookingResult = await client.query(
            `INSERT INTO bookings (train_id, user_id, travel_date, seat_number)
             SELECT $1, $2, $3,
                    (SELECT COALESCE(MAX(seat_number), 0) + 1
                     FROM bookings 
                     WHERE train_id = $1 AND travel_date = $3)
             RETURNING *`,
            [train_id, user_id, travel_date]
        );

        await client.query('COMMIT');
        
        res.status(201).json({
            success: true,
            booking: bookingResult.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ success: false, message: err.message });
    } finally {
        client.release();
    }
};

// get booking details
exports.getBooking = async (req, res) => {
    try {
        const { booking_id } = req.params;
        const user_id = req.user.userId;

        const result = await db.query(
            `SELECT b.*, t.train_name, t.source_station, t.destination_station,
                    t.departure_time, t.arrival_time
             FROM bookings b
             JOIN trains t ON b.train_id = t.train_id
             WHERE b.booking_id = $1 AND b.user_id = $2`,
            [booking_id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            booking: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};