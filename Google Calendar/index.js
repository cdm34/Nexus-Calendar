//This is a local script that serves as a POC for retrieving google calendar events

require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const admin = require('firebase-admin');

const app = express();

admin.initializeApp({
    credential: admin.credential.cert(require('./nexus-calendar-7922f-firebase-adminsdk-fbsvc-415b5fda9c.json'))
})

const db = admin.firestore();

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID, 
    process.env.SECRET_ID, 
    process.env.REDIRECT
);

// Route to initiate Google OAuth2 flow
app.get('/', (req, res) => {
    // Generate the Google authentication URL
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Request offline access to receive a refresh token
      scope: 'https://www.googleapis.com/auth/calendar.readonly' // Scope for read-only access to the calendar
    });
    // Redirect the user to Google's OAuth 2.0 server
    res.redirect(url);
  });
  
  // Route to handle the OAuth2 callback
  app.get('/redirect', (req, res) => {
    // Extract the code from the query parameter
    const code = req.query.code;
    // Exchange the code for tokens
    oauth2Client.getToken(code, (err, tokens) => {
      if (err) {
        // Handle error if token exchange fails
        console.error('Couldn\'t get token', err);
        res.send('Error');
        return;
      }
      // Set the credentials for the Google API client
      oauth2Client.setCredentials(tokens);
      // Notify the user of a successful login
      res.send('Successfully logged in');
    });
  });
  
  // Route to list all calendars
  app.get('/calendars', (req, res) => {
    // Create a Google Calendar API client
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    // List all calendarsS
    calendar.calendarList.list({}, (err, response) => {
      if (err) {
        // Handle error if the API request fails
        console.error('Error fetching calendars', err);
        res.end('Error!');
        return;
      }
      // Send the list of calendars as JSON
      const calendars = response.data.items;
      res.json(calendars);
    });
  });
  
  app.get('/events', async (req, res) => {
    try {
      // Get the calendar ID from the query string (default to 'primary')
      const calendarId = req.query.calendar ?? 'primary';
      const userId = "user123"; // Replace with dynamic user authentication later
  
      // Create a Google Calendar API client
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
      // Fetch events from Google Calendar
      const response = await calendar.events.list({
        calendarId,
        timeMin: new Date().toISOString(),
        maxResults: 15,
        singleEvents: true,
        orderBy: 'startTime'
      });
  
      const events = response.data.items;
      const batch = db.batch();
  
      // Store each event in Firestore
      events.forEach(event => {
        const eventRef = db.collection(`users/${userId}/calendars/google/events`).doc(event.id);
        batch.set(eventRef, {
          title: event.summary,
          startTime: event.start.dateTime || event.start.date,
          endTime: event.end.dateTime || event.end.date,
          description: event.description || "",
          location: event.location || "",
          calendarType: "Google"
        });
      });
  
      await batch.commit();
  
      res.json({ message: "Events synced to Firestore", events });
    } catch (err) {
      console.error('Error fetching or saving events:', err);
      res.status(500).send('Error fetching events');
    }
  });
  
  
  // Start the Express server
  app.listen(3000, () => console.log('Server running at 3000'));
