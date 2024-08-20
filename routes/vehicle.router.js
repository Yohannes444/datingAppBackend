const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicle.controller");
const authMiddleware = require("../middleware/Helpers/auth");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Temporary storage location

// In your route definition
router.post('/register', upload.fields([{ name: 'driverLicense' }, { name: 'vehicleLibrary' }, { name: 'vehicleImage' }]), vehicleController.registerVehicle);

router.get("/driver", vehicleController.getDriverVehicles);
router.put(
  "/:vehicleId/update-availability",
  vehicleController.updateVehicleAvailability
);
router.get("/available", vehicleController.getAvailableVehicles);
router.get("/:vehicleId", vehicleController.getVehicleById);
router.put(
  "/:vehicleId/update-details",
  vehicleController.updateVehicleDetails
);
router.delete("/:vehicleId", vehicleController.deleteVehicle);
router.get("/search", vehicleController.searchVehicles);
router.put("/:vehicleId/assign", vehicleController.assignVehicle);
router.put(
  "/:vehicleId/remove-assignment",
  vehicleController.removeDriverAssignment
);
router.get("/type/:type", vehicleController.getVehiclesByType);

module.exports = router;
