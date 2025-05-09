require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors'); // You also need this if it's missing
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');
const { google } = require('googleapis');


const app = express(); 
app.use(cors());
app.use(express.json());


admin.initializeApp({
    credential: admin.credential.cert(require('./firebase-keys.json'))
});

const db = admin.firestore();

// Google OAuth setup
const credentials = JSON.parse(
fs.readFileSync('client_secret_163745154776-a7rnimll4ohaov0bc5q3peotqnbqkk50.apps.googleusercontent.com.json')
);
const { client_id, client_secret, redirect_uris } = credentials.web;
const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[2]);

// OAuth flow route
app.get('/', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: 'https://www.googleapis.com/auth/calendar.readonly'
    });
    res.redirect(url);
});

app.get('/redirect', (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).send('Missing code parameter');

    oauth2Client.getToken(code, (err, tokens) => {
        if (err) {
        console.error('Token exchange error:', err.response?.data || err);
        return res.status(500).send('Token error');
        }
        oauth2Client.setCredentials(tokens);
        fs.writeFileSync('token.json', JSON.stringify(tokens));
        res.redirect('http://localhost:5500/index.html?synced=true');
    });
});

app.get('/sync-events', async (req, res) => {
    try {
      const calendarId = req.query.calendar ?? 'primary';
      const userId = req.query.userId;          // nexusUserId coming from the client
  
      console.log(userId)

      if (!userId) {
        return res.status(400).json({ error: 'Missing userId query parameter.' });
      }
  
      // Make sure oauth2Client already has valid credentials (step 1 above)
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
      // Pull the next 15 upcoming events
      const gRes = await calendar.events.list({
        calendarId,
        timeMin: new Date().toISOString(),
        maxResults: 15,
        singleEvents: true,
        orderBy: 'startTime'
      });
  
      const events = gRes.data.items;
      const batch  = db.batch();
  
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
      res.status(200).json({ message: 'Events synced to Firestore', events });
    } catch (err) {
      console.error('Error syncing events:', err);
      res.status(500).json({ error: 'Failed to sync events.' });
    }
  });
  

app.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: "Email, password, and name are required." });
        }

        const userRecord = await admin.auth().createUser({ email, password, displayName: name });
        const nexusUserId = uuidv4();

        await db.collection('users').doc(nexusUserId).set({
            nexusUserId,
            googleUid: userRecord.uid,
            email,
            name,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({ message: "User registered successfully", nexusUserId });
        res.sendFile(path.join(__dirname, 'sync_calendars.html'));
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }

        // Authenticate using Firebase REST API
        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBlfWPVFv8bEuvCP-ibpoO6ZY5AjGwV15I`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, returnSecureToken: true }),
            }
        );

        const data = await response.json();

        if (response.status !== 200) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        // Fetch the Nexus user data from Firestore
        const userQuery = await db.collection('users').where('email', '==', email).get();
        if (userQuery.empty) {
            return res.status(401).json({ error: "User not found." });
        }

        const userDoc = userQuery.docs[0];
        const userData = userDoc.data();

        // Generate a Firebase Custom Token for session management
        const customToken = await admin.auth().createCustomToken(userData.googleUid);

        res.status(200).json({
            message: "Login successful",
            token: customToken,
            nexusUserId: userData.nexusUserId,
        });
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get('/events', async (req, res) => {
    try {
        const { userId, month, year } = req.query;

        if (!userId || !month || !year) {
            return res.status(400).json({ error: "userId, month, and year are required query parameters." });
        }

        const calendarProviders = ['google', 'ICS'];
        const allEvents = [];

        for (const provider of calendarProviders) {
            const eventsRef = db
                .collection("users")
                .doc(userId)
                .collection("calendars")
                .doc(provider)
                .collection("events");

            const snapshot = await eventsRef.get();

            if (!snapshot.empty) {
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const startDate = new Date(data.startTime);
                    if (
                        startDate.getFullYear() === parseInt(year) &&
                        startDate.getMonth() + 1 === parseInt(month)
                    ) {
                        allEvents.push({ id: doc.id, provider, ...data });
                    }
                });
            }
        }

        if (allEvents.length === 0) {
            return res.status(404).json({ message: "No events found." });
        }

        res.status(200).json({ events: allEvents });
    } catch (error) {
        console.error("Error retrieving events:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.post('/create-group', async (req, res) => {
    try {
        const { groupName, creatorId } = req.body;

        if (!groupName || !creatorId) {
            return res.status(400).json({ error: "Group name and creator ID are required." });
        }

        const groupId = uuidv4();

        const groupData = {
            name: groupName,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection("Groups").doc(groupId).set(groupData);

        const memberData = {
            joinedAt: admin.firestore.FieldValue.serverTimestamp(),
            isCreator: true
        };

        await db
            .collection("Groups")
            .doc(groupId)
            .collection("members")
            .doc(creatorId)
            .set(memberData);

        await db
            .collection("users")
            .doc(creatorId)
            .collection("groups")
            .doc(groupId)
            .set({
                groupId,
                name: groupName,
                isCreator: true,
                joinedAt: admin.firestore.FieldValue.serverTimestamp()
            });

        res.status(201).json({
            message: "Group created and creator added as member",
            groupId
        });
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/invite-to-group', async (req, res) => {
    try {
        const { groupId, senderId, receiverId } = req.body;

        if (!groupId || !senderId || !receiverId) {
            return res.status(400).json({ error: "groupId, senderId, and receiverId are required." });
        }

        const groupDoc = await db.collection("Groups").doc(groupId).get();
        if (!groupDoc.exists) {
            return res.status(404).json({ error: "Group not found." });
        }

        const groupData = groupDoc.data();

        const receiverDoc = await db.collection("users").doc(receiverId).get();
        if (!receiverDoc.exists) {
            return res.status(404).json({ error: "User to invite not found." });
        }

        const inviteData = {
            groupId,
            groupName: groupData.name || null,
            invitedBy: senderId,
            status: "pending",
            sentAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db
            .collection("users")
            .doc(receiverId)
            .collection("invites")
            .doc(groupId)
            .set(inviteData);



        res.status(200).json({ message: "Invite sent successfully." });
    } catch (error) {
        console.error("Error sending group invite:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/accept-invite', async (req, res) => {
    try {
        const { userId, groupId } = req.body;

        if (!userId || !groupId) {
            return res.status(400).json({ error: "userId and groupId are required." });
        }

        const groupDoc = await db.collection("Groups").doc(groupId).get();
        if (!groupDoc.exists) {
            return res.status(404).json({ error: "Group not found." });
        }

        const groupData = groupDoc.data();

        await db
            .collection("Groups")
            .doc(groupId)
            .collection("members")
            .doc(userId)
            .set({
                joinedAt: admin.firestore.FieldValue.serverTimestamp(),
                isCreator: false
            });

        await db
            .collection("users")
            .doc(userId)
            .collection("groups")
            .doc(groupId)
            .set({
                groupId,
                name: groupData.name || null,
                joinedAt: admin.firestore.FieldValue.serverTimestamp()
            });

        await db
            .collection("users")
            .doc(userId)
            .collection("invites")
            .doc(groupId)
            .delete();

        res.status(200).json({ message: "Invite accepted and user added to group." });
    } catch (error) {
        console.error("Error accepting invite:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/decline-invite', async (req, res) => {
    try {
        const { userId, groupId } = req.body;

        if (!userId || !groupId) {
            return res.status(400).json({ error: "userId and groupId are required." });
        }

        const inviteRef = db
            .collection("users")
            .doc(userId)
            .collection("invites")
            .doc(groupId);

        const inviteDoc = await inviteRef.get();
        if (!inviteDoc.exists) {
            return res.status(404).json({ error: "Invite not found." });
        }

        await inviteRef.delete();

        res.status(200).json({ message: "Invite declined and removed." });
    } catch (error) {
        console.error("Error declining invite:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/events', async (req, res) => {
    try {
        const { userId, event } = req.body;

        if (!userId || !event) {
            return res.status(400).json({ error: "userId and event are required." });
        }

        const ref = db.collection("users")
                      .doc(userId)
                      .collection("calendars")
                      .doc("google")
                      .collection("events");

        const docRef = await ref.add(event);

        res.status(201).json({ message: "Event created", eventId: docRef.id });
    } catch (error) {
        console.error("Error saving event:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.delete('/events/:userId/:eventId', async (req, res) => {
  const { userId, eventId } = req.params;

  if (!userId || !eventId) {
    return res.status(400).json({ error: 'Missing userId or eventId' });
  }

  try {
    const eventRef = db
      .collection('users')
      .doc(userId)
      .collection('calendars')
      .doc('google')
      .collection('events')
      .doc(eventId);

    await eventRef.delete();

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

app.put('/events/:userId/:eventId', async (req, res) => {
  const { userId, eventId } = req.params;
  const updatedEvent = req.body;

  if (!userId || !eventId || !updatedEvent) {
    return res.status(400).json({ error: "Missing userId, eventId, or event data." });
  }

  try {
    const eventRef = db
      .collection("users")
      .doc(userId)
      .collection("calendars")
      .doc("google")
      .collection("events")
      .doc(eventId);

    await eventRef.set(updatedEvent, { merge: true });

    res.status(200).json({ message: "Event updated successfully." });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Failed to update event." });
  }
});



app.listen(3001, () => console.log('Authentication service running on port 3001'));
