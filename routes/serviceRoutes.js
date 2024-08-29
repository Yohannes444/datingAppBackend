const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const helper = require("../middleware/Helpers/auth");


// Create a new service
router.post('/',helper.validateSuperAdmin, serviceController.createService);

// Get all services
router.get('/',helper.validateSuperAdmin, serviceController.getAllServices);

// Get a service by ID
router.get('/:id',helper.validateSuperAdmin, serviceController.getServiceById);

// Update a service by ID
router.put('/:id',helper.validateSuperAdmin, serviceController.updateService);

// Delete a service by ID
router.delete('/:id',helper.validateSuperAdmin, serviceController.deleteService);

module.exports = router;
