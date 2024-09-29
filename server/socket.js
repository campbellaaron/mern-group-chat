const { Server } = require('socket.io');
const Message = require("./models/MessagesModel");
const Channel = require("./models/ChannelModel");
require('dotenv').config();

const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
          origin: process.env.ORIGIN,
          methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
          allowedHeaders: ["X-CSRF-Token", "X-Requested-With", "Accept", "Accept-Version", "Content-Length", "Content-MD5", "Content-Type", "Date", "X-Api-Version"],
          credentials: true, // Enable cookies on browser
        },
    });
    const userSocketMap = new Map();

    const disconnect = (socket) => {
        console.log(`Client disconnected: ${socket.id}`);
        for(const [userId, socketId] of userSocketMap.entries()) {
            if(socketId === socket.id) {
                userSocketMap.delete(userId);
                break;
            }
        }
    }

    const sendChannelMessage = async (message) => {
        const {channelId, sender, content, messageType, fileUrl} = message;

        const createdMessage = await Message.create({
            sender, 
            recipient: null,
            content, 
            messageType,
            timestamp: new Date(),
            fileUrl,
        });

        console.log({createdMessage});

        const messageData = await Message.findById(createdMessage._id).populate("sender", "id email firstName lastName image color").exec();

        if (!messageData) {
            console.error('Failed to populate message data');
            return;
        }

        await Channel.findByIdAndUpdate(channelId, {
            $push:{messages: createdMessage._id},
        });

        const channel = await Channel.findById(channelId).populate("members");

        const finalData = {...messageData._doc,channelId: channel._id};

        if(channel && channel.members) {
            channel.members.forEach((member)=> {
                const memberSocketId = userSocketMap.get(member._id.toString());
                if (memberSocketId) {
                    io.to(memberSocketId).emit('receive-channel-message', finalData);
                }
            });
            const adminSocketId = userSocketMap.get(channel.admin._id.toString());
            if (adminSocketId) {
                io.to(adminSocketId).emit('receive-channel-message', finalData);
            }
        }
    }

    const sendMessage = async (message) => {
        const {sender, content, messageType, fileUrl} = message;
        const senderSocketId = userSocketMap.get(message.sender);
        const recipientSocketId = userSocketMap.get(message.recipient);

        const createdMessage = await Message.create({
            sender, 
            recipient: null,
            content, 
            messageType,
            timestamp: new Date(),
            fileUrl,
        });
        console.log({createdMessage});

        const messageData = await Message.findById(createdMessage._id).populate("sender","id email firstName lastName image color").populate("recipient","id email firstName lastName image color");

        if(recipientSocketId) {
            io.to(recipientSocketId).emit("receiveMessage", messageData);
        }
        if(senderSocketId) {
            io.to(senderSocketId).emit("receiveMessage", messageData);
        }
    }

    io.on("connection", (socket)=> {
        const userId = socket.handshake.query.userId;

        if(userId) {
            userSocketMap.set(userId, socket.id);
            console.log(`User connected: ${userId} with socket ID ${socket.id}`);
        } else {
            console.log("User ID not provided during connection");
        }

        socket.on("sendMessage", sendMessage);
        socket.on("send-channel-message", sendChannelMessage);
        socket.on("disconnect", ()=>disconnect(socket));
    });
}


module.exports = {
    setupSocket
}