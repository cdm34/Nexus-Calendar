require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

admin.initializeApp({
    credential: admin.credential.cert(require('../nexus-calendar-7922f-firebase-adminsdk-fbsvc-94deec6503.json'))
});

const db = admin.firestore();
const app = express();
app.use(express.json());

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


app.listen(3001, () => console.log('Authentication service running on port 3001'));
