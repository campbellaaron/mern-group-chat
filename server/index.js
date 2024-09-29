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
const { setupSocket } = require("./socket");
const { admin } = require('./firebaseConfig');  // Initialize Firebase once


dotenv.config();

const express = require("express");
const app = express();
const server = http.createServer(app);

setupSocket(server);

// Allow CORS for the frontend domain
const allowedOrigin = process.env.ORIGIN;


// Middleware 
const corsOptions = {
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));


app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/channel', channelRoutes);

const port = process.env.PORT || 3001;
const databaseUrl = process.env.MONGODB_URI;

mongoose.connect(databaseUrl)
  .then(() => console.log("Mongoose Connection: Successful"))
  .catch(err => {
    console.log("Mongoose Connection Error:", err.message);
    process.exit(1);
  });

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port} and ${allowedOrigin}`);
});
