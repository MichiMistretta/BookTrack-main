const express = require('express');
const router = express.Router();
const db = require('./db');



// Register POST route
router.post('/register', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    // Insert the new user into the User table
    db.query('INSERT INTO User (email, password) VALUES (?, ?)', [email, password], (error, results) => {
        if (error) {
            console.error('Error inserting user:', error);
            return res.status(500).send('Failed to register user');
        }
        const userId = results.insertId;
        req.session.userId = userId;

        res.redirect('/login.html');
    });
});

// Login POST route
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }

    // Check if the user exists in the User table
    db.query('SELECT * FROM User WHERE email = ? AND password = ?', [email, password], (error, results) => {
        if (error) {
            console.error('Error fetching user:', error);
            return res.status(500).send('An error occurred while trying to log in');
        }

        if (results.length === 0) {
            return res.status(401).send('Invalid email or password');
        }
        
        const user = results[0];
        req.session.userId = user.user_id;

        res.redirect('/mainPage.html'); // Redirect to the main page after successful login
    });
});



// Add Book POST route
router.post('/addBook', (req, res) => {
    const { title, author, review, rating, statusId } = req.body;
    const userId = req.session.userId;

     // Check if required fields are provided
    if (!title || !author || !statusId || !userId) {
        return res.status(400).send('Title, author, statusId, and userId are required');
    }

    // SQL query to insert a new book into the Book table
    const insertBookQuery = 'INSERT INTO Book (title, author, review, rating, User_user_id, Status_idStatus) VALUES (?, ?, ?, ?, ?, ?)';
    const bookData = [title, author, review || null, rating || null, userId, statusId];

    db.query(insertBookQuery, bookData, (err) => {
        if (err) {
            console.error('Error inserting book:', err);
            return res.status(500).send('Error inserting book');
        }
        console.log('Inserting book with data:', bookData);
        res.json({ success: true });
    });
});


// Get Books GET route
router.get('/book', (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).send('User not logged in');
    }

    // SQL query to retrieve books for the logged in user
    const getBooksQuery = `
        SELECT b.*, 
        CASE 
            WHEN b.Status_idStatus = 1 THEN s.current
            WHEN b.Status_idStatus = 2 THEN s.want_to_read
            WHEN b.Status_idStatus = 3 THEN s.did_not_finish
            WHEN b.Status_idStatus = 4 THEN s.read
            ELSE 'Unknown'
        END AS status_name
        FROM Book b
        JOIN Status s ON b.Status_idStatus = s.idStatus
        WHERE b.User_user_id = ?
    `;

    db.query(getBooksQuery, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching books:', err);
            return res.status(500).send('Error fetching books');
        }
        res.json(results);
    });
});

// DELETE route for deleting a book
router.delete('/deleteBook/:bookId', (req, res) => {
    const bookId = req.params.bookId;
    
 // SQL query to delete a book by its ID
    const deleteBookQuery = 'DELETE FROM Book WHERE book_id = ?';

    db.query(deleteBookQuery, [bookId], (error, results) => {
        if (error) {
            console.error('Error deleting book:', error);
            return res.status(500).json({ success: false, message: 'Error deleting book' });
        }
        
        if (results.affectedRows > 0) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: 'Book not found' });
        }
    });
});

module.exports = router;






