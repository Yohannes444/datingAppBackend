const express = require("express");
const router = express.Router();
const supportController = require("../controllers/supportTicket.controller");
const authMiddleware = require("../middleware/Helpers/auth");
const helper = require("../middleware/Helpers/auth");

// Middleware to authenticate requests
router.use(authMiddleware.validate);

// Define support ticket routes
router.post("/tickets", helper.validate, supportController.createSupportTicket);
router.get("/tickets", helper.validate, supportController.getAllSupportTickets);
router.get("/tickets/:ticketId", helper.validate, supportController.getSupportTicketById);
router.put("/tickets/:ticketId", helper.validate, supportController.updateSupportTicket);
router.delete("/tickets/:ticketId", helper.validate, supportController.deleteSupportTicket);
router.get("/my-tickets", helper.validate, supportController.getMySupportTickets);
router.get("/search", helper.validate, supportController.searchSupportTickets);
router.put("/tickets/:ticketId/assign", helper.validate, supportController.assignSupportTicket);
router.put("/tickets/:ticketId/reopen", helper.validate, supportController.reopenSupportTicket);
router.put("/tickets/:ticketId/close", helper.validate, supportController.closeSupportTicket);

module.exports = router;
