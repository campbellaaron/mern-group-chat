const express = require("express");
const { signup, checkUser, login, getUserInfo, updateProfile, addProfileImg, removeProfileImg, logout } = require("../controllers/AuthController");
const { verifyToken } = require("../middlewares/AuthMiddleware");
const multer = require("multer");

// Use multer's memory storage to store files in memory temporarily
const upload = multer({ storage: multer.memoryStorage() })


const authRoutes = express.Router();

authRoutes.post("/signup", signup);
authRoutes.get('/check-user', checkUser);
authRoutes.post("/login", login);
authRoutes.get('/user-info', verifyToken, getUserInfo);
authRoutes.post('/update-profile', verifyToken, updateProfile);
authRoutes.post('/add-profile-img', verifyToken, upload.single("profile-image"), addProfileImg);
authRoutes.delete("/remove-profile-img", verifyToken, removeProfileImg);
authRoutes.post("/logout", logout);


module.exports = authRoutes;