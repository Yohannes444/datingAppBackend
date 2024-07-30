const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');

// Routes for managing warehouse orders
router.get('/:warehouseId/orders/filter', warehouseController.filterOrders);
router.get('/orders', warehouseController.getAllOrders);
router.get('/orders/:orderId', warehouseController.getOrderById);
router.post('/orders', warehouseController.createOrder);
router.put('/orders/:orderId', warehouseController.updateOrder);
router.put('/orders/:orderId/status', warehouseController.updateOrderStatus);
router.delete('/orders/:orderId', warehouseController.deleteOrder);
router.get('/orders/grouped-by-destination', warehouseController.getOrdersGroupedByDestination);

module.exports = router;
