const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const client = require('./connect');
const bcrypt = require('bcryptjs');
const multer = require('multer');

const app = express();

const port = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));
app.use(express.static('public'));

// Serve HTML files
app.get('/homepage.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'homepage.html'));
});

app.get('/profilepage.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'profilepage.html'));
});

app.get('/search.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'search.html'));
});

app.get('/create.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'create.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/user_event.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'user_event.html'));
});

// Serve CSS files (make sure the correct paths are used)
app.get('/main.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'main.css'));
});

app.get('/homepage.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'homepage.css'));
});

// Middleware for authentication
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
      return next();
  }
  res.redirect('/login.html');
};

//Route to get events for the logged-in user
app.get('/events', async (req, res) => {
  try {
      const result = await client.query('SELECT * FROM events ORDER BY event_date DESC');
      res.json(result.rows);
  } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Route to get search data
app.get('/search', async (req, res) => {
  const { date, location, category } = req.query;
  try {
      let query = `SELECT * FROM events WHERE 1=1`;
      const queryParams = [];

      if (date) {
          queryParams.push(date);
          query += ` AND date = $${queryParams.length}`;
      }
      if (location) {
          queryParams.push(`%${location}%`);
          query += ` AND location ILIKE $${queryParams.length}`;
      }
      if (category) {
          queryParams.push(category);
          query += ` AND category = $${queryParams.length}`;
      }

      const result = await client.query(query, queryParams);
      res.json(result.rows);
  } catch (err) {
      console.error('Error executing query', err.stack);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Register route
app.post('/register', async (req, res) => {
  const { email, fname, lname, user, pwd } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(pwd, 8);

    const query = 'INSERT INTO users (email, first_name, last_name, username, password) VALUES ($1, $2, $3, $4, $5)';
    await client.query(query, [email, fname, lname, user, hashedPassword]);

    res.redirect('/homepage.html');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error registering user');
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, pwd } = req.body;

  try {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await client.query(query, [email]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      
      const isMatch = await bcrypt.compare(pwd, user.password);

      if (isMatch) {
        res.redirect('/homepage.html');
      } else {
        res.status(400).send('Invalid credentials');
      }
    } else {
      res.status(400).send('Invalid credentials');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error logging in');
  }
});

// Event creation route
app.post('/create-event', upload.single('myfile'), async (req, res) => {
  const { user, date, appt, location, message, category } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  console.log('User:', user);
  console.log('Image URL:', imageUrl);

  try {
      const userQuery = 'SELECT id FROM users WHERE username = $1';
      const userResult = await client.query(userQuery, [user]);

      if (userResult.rows.length === 0) {
          return res.status(400).send('Invalid username');
      }

      const userId = userResult.rows[0].id;

      const query = `
          INSERT INTO events (user_id, event_date, event_time, location, description, category, image_url)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      await client.query(query, [userId, date, appt, location, message, category, imageUrl]);

      res.redirect('/homepage.html');
  } catch (err) {
      console.error('Error creating event:', err);
      res.status(500).send('Error creating event');
  }
});

// Route to update an event (only if created by the logged-in user)
app.put('/events/:id', ensureAuthenticated, async (req, res) => {
  const eventId = req.params.id;
  const updatedEvent = req.body;
  const username = req.user.id;

  try {
      const result = await client.query('UPDATE events SET date = $1, location = $2, category = $3, description = $4 WHERE id = $5 AND user_id = (SELECT id FROM users WHERE username = $6)',
          [updatedEvent.date, updatedEvent.location, updatedEvent.category, updatedEvent.description, eventId, username]);

      if (result.rowCount === 0) {
          return res.status(403).json({ error: 'Not authorized to update this event' });
      }

      res.status(200).json({ message: 'Event updated successfully' });
  } catch (error) {
      res.status(500).json({ error: 'Failed to update event' });
  }
});

// Route to delete an event (only if created by the logged-in user)
app.delete('/events/:id', ensureAuthenticated, async (req, res) => {
  const eventId = req.params.id;
  const username = req.user.id;

  try {
      const result = await client.query('DELETE FROM events WHERE id = $1 AND user_id = (SELECT id FROM users WHERE username = $2)', [eventId, username]);

      if (result.rowCount === 0) {
          return res.status(403).json({ error: 'Not authorized to delete this event' });
      }

      res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
      res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//http://localhost:3000/homepage.html
