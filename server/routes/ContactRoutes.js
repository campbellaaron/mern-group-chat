const express = require("express");
const { searchContacts, getContactsForDmList, getAllContacts } = require("../controllers/ContactsController.js");
const { verifyToken } = require("../middlewares/AuthMiddleware.js");

const contactRoutes = express.Router();

contactRoutes.post("/search", verifyToken, searchContacts);
contactRoutes.get("/get-contacts-for-dm", verifyToken, getContactsForDmList);
contactRoutes.get("/get-all-contacts", verifyToken, getAllContacts);

module.exports = contactRoutes;