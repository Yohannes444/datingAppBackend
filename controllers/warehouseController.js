const Warehouse = require('../models/Warehouse');
const Order = require('../models/Order');

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create a new order
exports.createOrder = async (req, res) => {
  const { customer, driver, vehicle, packageDetails, destination, status, cost, deliverySpeed, tracking } = req.body;

  try {
    const newOrder = new Order({
      customer,
      driver,
      vehicle,
      packageDetails,
      destination,
      status,
      cost,
      deliverySpeed,
      tracking
    });

    const savedOrder = await newOrder.save();

    // Add the order to the warehouse
    const warehouse = await Warehouse.findOne();
    if (warehouse) {
      warehouse.orders.push({ order: savedOrder._id, status: 'received' });
      await warehouse.save();
    } else {
      const newWarehouse = new Warehouse({
        name: 'Default Warehouse',
        location: {
          address: 'Default Address',
          lat: 0,
          lng: 0
        },
        capacity: 1000,
        orders: [{ order: savedOrder._id, status: 'received' }]
      });
      await newWarehouse.save();
    }

    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update order
exports.updateOrder = async (req, res) => {
  const { orderId } = req.params;
  const updateData = req.body;

  try {
    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true });
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    // Find the warehouse that contains the order
    const warehouse = await Warehouse.findOne({ "orders.order": orderId });

    if (!warehouse) {
      return res.status(404).json({ message: 'Order not found in any warehouse' });
    }

    // Find the order within the warehouse
    const order = warehouse.orders.find(o => o.order.toString() === orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update the order status and timestamps
    order.status = status;
    if (status === 'sorted') order.sortedAt = new Date();
    if (status === 'processed') order.processedAt = new Date();
    if (status === 'packaged') order.packagedAt = new Date();
    if (status === 'shipped') order.shippedAt = new Date();

    await warehouse.save();

    res.json({ message: 'Order status updated successfully', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    // Find the warehouse that contains the order
    const warehouse = await Warehouse.findOne({ "orders.order": orderId });

    if (warehouse) {
      // Remove the order from the warehouse's orders array
      warehouse.orders = warehouse.orders.filter(o => o.order.toString() !== orderId);
      await warehouse.save();
    }

    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get orders grouped by destination
exports.getOrdersGroupedByDestination = async (req, res) => {
  try {
    const orders = await Order.find();

    const groupedOrders = orders.reduce((acc, order) => {
      const { destination } = order;
      const key = destination.address;

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(order);
      return acc;
    }, {});

    res.json(groupedOrders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.filterOrders = async (req, res) => {
  try {
    const { warehouseId } = req.params;
    const {
      destinationAddress,
      vehicle,
      driver,
      status,
      customer
    } = req.query;

    const warehouse = await Warehouse.findById(warehouseId).populate('orders.order');

    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }

    let filteredOrders = warehouse.orders;

    if (destinationAddress) {
      filteredOrders = filteredOrders.filter(order => 
        order.order.destination.address.toLowerCase().includes(destinationAddress.toLowerCase())
      );
    }
    
    if (vehicle) {
      filteredOrders = filteredOrders.filter(order => 
        order.order.vehicle && order.order.vehicle.toString() === vehicle
      );
    }
    
    if (driver) {
      filteredOrders = filteredOrders.filter(order => 
        order.order.driver && order.order.driver.toString() === driver
      );
    }

    if (status) {
      filteredOrders = filteredOrders.filter(order => 
        order.order.status === status
      );
    }

    if (customer) {
      filteredOrders = filteredOrders.filter(order => 
        order.order.customer && order.order.customer.toString() === customer
      );
    }

    res.status(200).json(filteredOrders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};;