const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicle.controller");
const authMiddleware = require("../middleware/Helpers/auth");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Temporary storage location
const helper = require("../middleware/Helpers/auth");

// In your route definition
router.post('/register', helper.validate, upload.fields([{ name: 'driverLicense' }, { name: 'vehicleLibrary' }, { name: 'vehicleImage' }]), vehicleController.registerVehicle);

router.get("/driver", helper.validate, vehicleController.getDriverVehicles);
router.put(
  "/:vehicleId/update-availability", helper.validate,
  vehicleController.updateVehicleAvailability
);
router.get("/available", helper.validate, vehicleController.getAvailableVehicles);
router.get("/:vehicleId", helper.validate, vehicleController.getVehicleById);
router.put(
  "/:vehicleId/update-details", helper.validate,
  vehicleController.updateVehicleDetails
);
router.delete("/:vehicleId", helper.validate, vehicleController.deleteVehicle);
router.get("/search", helper.validate, vehicleController.searchVehicles);
router.put("/:vehicleId/assign", helper.validate, vehicleController.assignVehicle);
router.put(
  "/:vehicleId/remove-assignment", helper.validate,
  vehicleController.removeDriverAssignment
);
router.get("/type/:type", helper.validate, vehicleController.getVehiclesByType);

module.exports = router;
