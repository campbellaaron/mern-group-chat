const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require('http');
const path = require('path');
const authRoutes = require("./routes/AuthRoutes");
const contactRoutes = require("./routes/ContactRoutes");
const messagesRoutes = require("./routes/MessagesRoutes");
const channelRoutes = require("./routes/ChannelRoutes");
const {setupSocket } = require("./socket");

dotenv.config();

const express = require("express");
const app = express();
const server = http.createServer(app);

setupSocket(server);

// Allow CORS for the frontend domain
const allowedOrigin = process.env.ORIGIN || 'https://mern-group-chat-frontend.vercel.app';

// Middleware 
const corsOptions = {
  origin: allowedOrigin, // Replace with your front-end URL or use '*' to allow all origins
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true, // Enable cookies on browser
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use("/uploads/profiles", express.static("uploads/profiles")); 
app.use("/uploads/files", cors(corsOptions), express.static("uploads/files")); // Apply CORS here as well

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/channel', channelRoutes);

const port = process.env.PORT || 3001;
const databaseUrl = process.env.DB_URL;

mongoose.connect(databaseUrl).then(()=> console.log("Mongoose Connection: Successful")).catch(err=> console.log(err.message));

server.listen(port, ()=> {
    console.log(`Server is running on http://localhost:${port}`);
});
