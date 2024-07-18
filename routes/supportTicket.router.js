const express = require("express");
const router = express.Router();
const supportController = require("../controllers/supportTicket.controller");
const authMiddleware = require("../middleware/Helpers/auth");

// Middleware to authenticate requests
router.use(authMiddleware.validate);

// Define support ticket routes
router.post("/tickets", supportController.createSupportTicket);
router.get("/tickets", supportController.getAllSupportTickets);
router.get("/tickets/:ticketId", supportController.getSupportTicketById);
router.put("/tickets/:ticketId", supportController.updateSupportTicket);
router.delete("/tickets/:ticketId", supportController.deleteSupportTicket);
router.get("/my-tickets", supportController.getMySupportTickets);
router.get("/search", supportController.searchSupportTickets);
router.put("/tickets/:ticketId/assign", supportController.assignSupportTicket);
router.put("/tickets/:ticketId/reopen", supportController.reopenSupportTicket);
router.put("/tickets/:ticketId/close", supportController.closeSupportTicket);

module.exports = router;
