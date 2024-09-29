const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { renameSync, unlinkSync } = require("fs");
const { admin, bucket } = require('../firebaseConfig');  // Initialize Firebase once

const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (email, userId) => {
    return jwt.sign({ email, userId }, process.env.JWT_KEY, { expiresIn: maxAge }); // Token data will be email and userID and encryption key is in the ENV variable, expires in 3 days
}

const checkUser = async (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.status(400).send("Email is required");
    }

    try {
        const user = await User.findOne({ email });
        if (user) {
            return res.status(200).json({ exists: true });
        }
        return res.status(200).json({ exists: false });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}

const signup = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send("Email and password are both required.");
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send("Email is already registered.");
        }
        const user = await User.create({ email, password });
        const token = createToken(email, user.id);
        console.log(`Registration: Setting cookie with token: ${token} for ${user.id}`); // Debug logging
        res.cookie("jwt", token, {
            maxAge,
            httpOnly: true,  // Prevent client-side JavaScript from accessing the cookie
            secure: process.env.NODE_ENV === 'production' ? true : false,  // Set to true if using HTTPS
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',   // Change to 'Lax' or 'None' based on your needs
        });
        return res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                profileSetup: user.profileSetup,
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error Has Occurred");
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Ensure email and password are provided
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are both required." });
        }

        // Find user by email
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ error: "Email is not found" });
        }

        // Compare passwords
        const auth = await bcrypt.compare(password, existingUser.password);
        if (!auth) {
            return res.status(400).json({ error: "Incorrect password" });
        }

        // Create JWT
        const token = createToken(existingUser.email, existingUser.id);
        console.log(`Login: Setting cookie with token: ${token} for ${existingUser.id}`); // Debug logging

        // Set the JWT as an HTTP-only cookie
        res.cookie("jwt", token, {
            maxAge, // Ensure `maxAge` is defined somewhere
            httpOnly: true, // Prevent client-side access to the cookie
            secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Adjust SameSite based on environment
        });

        // Return user info as a response
        return res.status(200).json({
            user: {
                id: existingUser.id,
                email: existingUser.email,
                profileSetup: existingUser.profileSetup,
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                image: existingUser.image,
                color: existingUser.color,
            },
        });
    } catch (error) {
        console.log("Error in login: ", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


const getUserInfo = async (req, res, next) => {
    try {
        const userData = await User.findById(req.userId);
        if (!userData) {
            console.log("Error with finding user", req.message);
            return res.status(404).send("User is not found");
        }
        return res.status(200).json({
            user: {
                id: userData.id,
                email: userData.email,
                profileSetup: userData.profileSetup,
                firstName: userData.firstName,
                lastName: userData.lastName,
                image: userData.image,
                color: userData.color,
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error Has Occurred");
    }
};

const updateProfile = async (req, res, next) => {
    try {
        const { userId } = req;
        const { firstName, lastName, color } = req.body;
        if (!firstName || !lastName) {
            return res.status(400).send("First and last name, and the color, are required!");
        }

        const userData = await User.findByIdAndUpdate(userId, {
            firstName,
            lastName,
            color,
            profileSetup: true
        },
            { new: true, runValidators: true });
        return res.status(200).json({
            id: userData.id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error Has Occurred");
    }
}

const addProfileImg = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.userId);
        if (!req.file) {
            return res.status(400).send("File is required");
        }

        // Get current timestamp for unique filenames
        const date = Date.now();
        const fileName = `${date}-${req.file.originalname}`;

        // Upload file to Firebase Storage
        const blob = bucket.file(`uploads/profiles/${currentUser._id}/${fileName}`);
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: req.file.mimetype
            }
        });

        blobStream.on('error', (err) => {
            return res.status(500).send({ message: err.message });
        });

        blobStream.on('finish', async () => {
            // The public URL of the file in Firebase Storage
            const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(blob.name)}?alt=media`;

            // Update the user's profile with the new image URL
            const updatedUser = await User.findByIdAndUpdate(
                { _id: req.userId }, // Assume req.userId is set by the auth middleware
                { image: publicUrl },
                { new: true, runValidators: true }
            );

            return res.status(200).json({
                image: updatedUser.image
            });
        });

        blobStream.end(req.file.buffer); // Send the file buffer to Firebase Storage
    } catch (error) {
        console.log("Something went wrong: ", error);
        return res.status(500).json({ message: "Server error" });
    }
}

const removeProfileImg = async (req, res, next) => {
    try {
        const { userId } = req;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send("User not found");
        }

        if (user.image) {
            // Extract the file name from the URL
            const fileName = decodeURIComponent(user.image.split('/o/')[1].split('?')[0]);

            // Delete the file from Firebase Storage
            const bucket = admin.storage().bucket(); // Ensure you've initialized the Firebase Admin SDK
            await bucket.file(fileName).delete();
        }

        user.image = null;
        await user.save();

        return res.status(200).send("Profile image removed successfully");
    } catch (error) {
        console.log("Something went wrong: ", error);
    }
}

const logout = async (req, res, next) => {
    try {
        res.cookie("jwt", "", {
            maxAge: 1,
            secure: true,
            sameSite: "None"
        });
        return res.status(200).send("Logout successful");
    } catch (error) {
        console.log("Something went wrong: ", error);
    }
}

module.exports = {
    signup, login, checkUser, getUserInfo, updateProfile, addProfileImg, removeProfileImg, logout
};