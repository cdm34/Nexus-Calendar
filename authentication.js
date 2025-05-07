require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');


admin.initializeApp({
    credential: admin.credential.cert(require('./firebase-keys.json'))
});

const db = admin.firestore();
const app = express();
const cors = require('cors');
app.use(cors());

app.use(express.json());

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

app.listen(3001, () => console.log('Authentication service running on port 3001'));
