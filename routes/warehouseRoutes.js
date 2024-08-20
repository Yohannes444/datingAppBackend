const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const helper = require("../middleware/Helpers/auth");

// Routes for managing warehouse orders
router.post('/createWarehose',helper.validateSuperAdmin , warehouseController.createWarehouse);
router.get('/manager/:managerId', helper.validateWarehouseManager, warehouseController.getWManagerWarehouse);
router.post('/add-order', helper.validateWarehouseManager, warehouseController.addOrderToWarehouse);
router.get('/"warehouseId/:warehouseId', helper.validateWarehouseManager, warehouseController.getSinglWarehosue);

router.get('/orders',helper.validateWarehouseManager , warehouseController.getAllOrders);
router.get("/getallwarehouse", helper.validateSuperAdmin, warehouseController.getAllWarehouse);
router.get('/orders/:orderId',helper.validateWarehouseManager , warehouseController.getOrderById);
router.post('/orders', warehouseController.createOrder);
router.put('/orders/:orderId',helper.validateWarehouseManager , warehouseController.updateOrder);
router.put('/orders/:orderId/status',helper.validateWarehouseManager , warehouseController.updateOrderStatus);
router.delete('/orders/:orderId',helper.validateWarehouseManager , warehouseController.deleteOrder);
router.get('/orders/grouped-by-destination',helper.validateWarehouseManager , warehouseController.getOrdersGroupedByDestination);
router.get('/:warehouseId/orders/filter',helper.validateWarehouseManager , warehouseController.filterOrders);

module.exports = router;
