const Message = require("../models/MessagesModel");
const { admin, bucket } = require('../firebaseConfig');  // Initialize Firebase once

const getMessages = async (req, res, next) => {
    try {
        const user1 = req.userId;
        const user2 = req.body.id;

        if (!user1 || !user2) {
            return res.status(400).send("Both user IDs are required");
        }

        const messages = await Message.find({
            $or: [
                {sender: user1, recipient: user2},
                {sender: user2, recipient: user1},
            ],
        }).sort({ timestamp: 1 });

        return res.status(200).json({ messages });
    } catch (error) {
        console.log("Something went wrong: ", error);
        return res.status(500).send("Internal server error");
    }
}

const uploadFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).send("File is required");
        }

        const date = Date.now();
        const fileName = `${date}-${req.file.originalname}`;

        // Upload file to Firebase Storage
        const blob = bucket.file(`uploads/files/${fileName}`);
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: req.file.mimetype,
            },
        });

        blobStream.on('error', (err) => {
            console.log("File Upload Issues: ", err);
            return res.status(500).send({ message: err.message });
        });

        blobStream.on('finish', async () => {
            const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(blob.name)}?alt=media`;
            console.log({publicUrl});
            return res.status(200).json({ fileUrl: publicUrl });
        });

        blobStream.end(req.file.buffer);
    } catch (error) {
        console.log("Something went wrong: ", error);
        return res.status(500).send("Internal server error");
    }
}

module.exports = {
    getMessages,
    uploadFile
};
