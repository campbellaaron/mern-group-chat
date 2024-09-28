require('dotenv').config(); // Add this line to load env variables
const admin = require('firebase-admin');


// Initialize Firebase app
admin.initializeApp({
    credential: admin.credential.cert({
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET // Ensure this matches your Firebase bucket
});

const bucket = admin.storage().bucket(); // Now you can use Firebase Storage

module.exports = { admin, bucket };