const Service = require('../models/service');

// Create a new service
exports.createService = async (req, res) => {
    try {
        const service = new Service(req.body);
        await service.save();
        res.status(201).json(service);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Get all services
exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.status(200).json(services);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get a service by ID
exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.status(200).json(service);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a service by ID
exports.updateService = async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.status(200).json(service);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete a service by ID
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
