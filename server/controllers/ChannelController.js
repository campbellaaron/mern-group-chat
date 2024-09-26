const User = require("../models/UserModel");
const Channel = require("../models/ChannelModel");
const mongoose = require("mongoose");

const createChannel = async (req, res, next) => {
    try {
        const { name, members } = req.body;
        const userId = req.userId;

        const admin = await User.findById(userId);

        if (!admin) {
            return res.status(400).send("Admin user not found");
        }

        const validMembers = await User.find({ _id: { $in: members } });

        if (validMembers.length !== members.length) {
            return res.status(400).send("Some members are not valid users");
        }

        const newChannel = new Channel({
            name, members, admin: userId
        });

        await newChannel.save();
        return res.status(201).json({ channel: newChannel });

    } catch (error) {
        console.log("Something went wrong: ", error);
        return res.status(500).send("Internal Server Error");
    }
}

const getAllChannels = async (req, res, next) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.userId);

        const channels = await Channel.aggregate([
            {
                $match: {
                    $or: [{ admin: userId }, { members: userId }],
                },
            },
            {
                $lookup: {
                    from: "messages",
                    localField: "_id",
                    foreignField: "channelId",
                    as: "messages",
                },
            },
            {
                $addFields: {
                    unreadMessages: {
                        $size: {
                            $filter: {
                                input: "$messages",
                                as: "message",
                                cond: { $not: { $in: [userId, "$$message.readBy"] } },  // Count only unread messages
                            },
                        },
                    },
                },
            },
            {
                $sort: { updatedAt: -1 },
            },
            {
                $project: {
                    name: 1,
                    unreadMessages: 1,
                },
            },
        ]);

        return res.status(201).json({ channels });

    } catch (error) {
        console.log("Something went wrong: ", error);
        return res.status(500).send("Internal Server Error");
    }
};

const markChannelMessagesAsRead = async (req, res) => {
    try {
        const { channelId } = req.params;
        const userId = req.userId;

        await Message.updateMany(
            {
                channelId: channelId,   // Messages in the channel
                readBy: { $ne: userId },  // Messages not already marked as read by the user
            },
            { $addToSet: { readBy: userId } }  // Add userId to the readBy array
        );

        return res.status(200).send("Channel messages marked as read");
    } catch (error) {
        console.log("Something went wrong: ", error);
        return res.status(500).send("Internal Server Error");
    }
};


const getChannelMessages = async (req, res, next) => {
    try {
        const {channelId} = req.params;
        const channel = await Channel.findById(channelId).populate({path:"messages", populate:{
            path: 'sender', select:"firstName lastName email _id image color",
            },
        });

        if (!channel) {
            return res.status(404).send("Channel not found");
        }

        const messages = channel.messages;

        return res.status(201).json({ messages });

    } catch (error) {
        console.log("Something went wrong: ", error);
        return res.status(500).send("Internal Server Error");
    }
}

module.exports = {
    createChannel, getAllChannels, getChannelMessages, markChannelMessagesAsRead
};