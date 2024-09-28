require('dotenv').config(); // Add this line to load env variables
const admin = require('firebase-admin');
const serviceAccount = require('./thechatroom-8a53b-firebase-adminsdk-8eibg-b1b975d7dc.json'); // Ensure the correct path to the JSON file

// Initialize Firebase app
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET // Ensure this matches your Firebase bucket
});

const bucket = admin.storage().bucket(); // Now you can use Firebase Storage

module.exports = { admin, bucket };