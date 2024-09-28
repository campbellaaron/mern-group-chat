const express = require("express");
const { getMessages, uploadFile } = require("../controllers/MessagesController.js");
const { verifyToken } = require("../middlewares/AuthMiddleware.js");
const multer = require("multer");

const messagesRoutes = express.Router();

// Use multer's memory storage to store files in memory temporarily
const upload = multer({ storage: multer.memoryStorage() })

messagesRoutes.post("/get-messages", verifyToken, getMessages);
messagesRoutes.post("/upload-file", verifyToken, upload.single("file"), uploadFile);

module.exports = messagesRoutes;