const SupportTicket = require("../models/supportTicket.model");

// Create a support ticket
exports.createSupportTicket = async (req, res) => {
  try {
    const { subject, description } = req.body;
    const user = req.user.id;

    const ticket = new SupportTicket({
      subject,
      description,
      user,
    });

    await ticket.save();
    res
      .status(201)
      .json({ message: "Support ticket created successfully", ticket });
  } catch (error) {
    res
      .status(400)
      .json({
        error: "Failed to create support ticket",
        details: error.message,
      });
  }
};
// Get all support tickets
exports.getAllSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find().populate(
      "user",
      "username email"
    );
    res.status(200).json({ tickets });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to fetch support tickets",
        details: error.message,
      });
  }
};
// Get support ticket by ID
exports.getSupportTicketById = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await SupportTicket.findById(ticketId).populate(
      "user",
      "username email"
    );

    if (!ticket) {
      return res.status(404).json({ error: "Support ticket not found" });
    }

    res.status(200).json({ ticket });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to fetch support ticket",
        details: error.message,
      });
  }
};
// Update support ticket
exports.updateSupportTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, response } = req.body;

    const ticket = await SupportTicket.findByIdAndUpdate(
      ticketId,
      { status, response },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ error: "Support ticket not found" });
    }

    res
      .status(200)
      .json({ message: "Support ticket updated successfully", ticket });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to update support ticket",
        details: error.message,
      });
  }
};
// Delete support ticket
exports.deleteSupportTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await SupportTicket.findByIdAndDelete(ticketId);

    if (!ticket) {
      return res.status(404).json({ error: "Support ticket not found" });
    }

    res.status(200).json({ message: "Support ticket deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to delete support ticket",
        details: error.message,
      });
  }
};
// Get user's support tickets
exports.getMySupportTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const tickets = await SupportTicket.find({ user: userId });
    res.status(200).json({ tickets });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to fetch user support tickets",
        details: error.message,
      });
  }
};
// Search support tickets
exports.searchSupportTickets = async (req, res) => {
  try {
    const { keyword } = req.query;
    const tickets = await SupportTicket.find({
      $or: [
        { subject: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    }).populate("user", "username email");

    res.status(200).json({ tickets });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to search support tickets",
        details: error.message,
      });
  }
};
// Assign support ticket
exports.assignSupportTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { assignedTo } = req.body;

    const ticket = await SupportTicket.findByIdAndUpdate(
      ticketId,
      { assignedTo },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ error: "Support ticket not found" });
    }

    res
      .status(200)
      .json({ message: "Support ticket assigned successfully", ticket });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to assign support ticket",
        details: error.message,
      });
  }
};
// Reopen support ticket
exports.reopenSupportTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await SupportTicket.findByIdAndUpdate(
      ticketId,
      { status: "open" },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ error: "Support ticket not found" });
    }

    res
      .status(200)
      .json({ message: "Support ticket reopened successfully", ticket });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to reopen support ticket",
        details: error.message,
      });
  }
};
// Close support ticket
exports.closeSupportTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await SupportTicket.findByIdAndUpdate(
      ticketId,
      { status: "closed" },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ error: "Support ticket not found" });
    }

    res
      .status(200)
      .json({ message: "Support ticket closed successfully", ticket });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to close support ticket",
        details: error.message,
      });
  }
};
