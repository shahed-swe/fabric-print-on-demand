const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Get all orders
    const allOrders = await Order.find();
    
    // Calculate total revenue from DELIVERED orders only
    const deliveredOrders = allOrders.filter(order => 
      order.status && order.status.toLowerCase() === 'delivered'
    );
    const revenue = deliveredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Get total number of all orders (not just delivered)
    const totalOrders = allOrders.length;

    // Get total customers (excluding admins)
    const totalCustomers = await User.countDocuments({ role: { $ne: 'admin' } });

    // Get pending shipments (orders that are paid/processing but not shipped/delivered/cancelled)
    const pendingShipments = allOrders.filter(order => 
      order.status && ['pending', 'processing', 'packed'].includes(order.status.toLowerCase())
    ).length;

    // Get recent orders (last 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber userId totalAmount status createdAt');

    // Fetch user details for recent orders
    const recentOrdersWithUsers = await Promise.all(
      recentOrders.map(async (order) => {
        let user = null;
        // Only fetch user if userId is a valid ObjectId (not a guest ID)
        if (order.userId && !order.userId.startsWith('guest_')) {
          try {
            user = await User.findById(order.userId);
          } catch (error) {
            // Invalid ObjectId, treat as guest
            user = null;
          }
        }
        return {
          id: order.orderNumber || order._id,
          customer: user?.name || 'Guest',
          total: order.totalAmount?.toFixed(2) || '0.00',
          status: order.status,
          date: order.createdAt
        };
      })
    );

    // Calculate order status breakdown
    const ordersByStatus = {
      pending: allOrders.filter(o => o.status && o.status.toLowerCase() === 'pending').length,
      processing: allOrders.filter(o => o.status && o.status.toLowerCase() === 'processing').length,
      packed: allOrders.filter(o => o.status && o.status.toLowerCase() === 'packed').length,
      shipped: allOrders.filter(o => o.status && o.status.toLowerCase() === 'shipped').length,
      delivered: allOrders.filter(o => o.status && o.status.toLowerCase() === 'delivered').length,
      cancelled: allOrders.filter(o => o.status && o.status.toLowerCase() === 'cancelled').length,
    };

    res.json({
      revenue: revenue.toFixed(2),
      orders: totalOrders,
      deliveredOrders: deliveredOrders.length,
      customers: totalCustomers,
      pendingShipments,
      ordersByStatus,
      recentOrders: recentOrdersWithUsers
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get sales data for charts
// @route   GET /api/admin/dashboard/sales
// @access  Private/Admin
exports.getSalesData = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;

    let groupBy;
    let dateFormat;
    let labels = [];

    if (period === 'daily') {
      // Last 7 days
      groupBy = { $dayOfMonth: '$createdAt' };
      dateFormat = '%Y-%m-%d';
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(date.toISOString().split('T')[0]);
      }
    } else {
      // Last 7 months (default)
      groupBy = { $month: '$createdAt' };
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        labels.push(monthNames[date.getMonth()]);
      }
    }

    // Aggregate sales data (only from delivered orders)
    const salesData = await Order.aggregate([
      {
        $match: {
          status: { $regex: /^delivered$/i }, // Case-insensitive match for 'delivered'
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          sales: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format data for chart
    const formattedData = labels.map((label, index) => {
      const monthIndex = (new Date().getMonth() - 6 + index + 12) % 12 + 1;
      const dataPoint = salesData.find(d => d._id.month === monthIndex);
      return {
        name: label,
        sales: dataPoint ? Math.round(dataPoint.sales) : 0,
        orders: dataPoint ? dataPoint.count : 0
      };
    });

    res.json(formattedData);
  } catch (error) {
    console.error('Error fetching sales data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get category sales data
// @route   GET /api/admin/dashboard/categories
// @access  Private/Admin
exports.getCategoryData = async (req, res) => {
  try {
    const categoryData = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $lookup: {
          from: 'categories',
          localField: 'productInfo.category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$categoryInfo.name',
          value: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      {
        $project: {
          name: '$_id',
          value: 1,
          revenue: 1,
          _id: 0
        }
      },
      { $sort: { value: -1 } },
      { $limit: 5 }
    ]);

    res.json(categoryData);
  } catch (error) {
    console.error('Error fetching category data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
