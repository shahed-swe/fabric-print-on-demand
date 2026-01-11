/**
 * Utility function to generate a custom display Order ID
 * Format: 2 letters (user name) + D + 4 digits (order date MMDD) + M + 4 digits (delivery date MMDD)
 * Delivery date = Order date + 15 days
 * Example: JOD0115M0130 (John, ordered Jan 15, delivery Jan 30)
 */

export const generateDisplayOrderId = (order: any, user?: any) => {
  try {
    // Get user name from order or user parameter
    const userName = user?.name || order?.user?.name || order?.shippingAddress?.fullName || "Unknown";
    
    // Extract first name
    const firstName = userName.split(' ')[0];
    
    // Get first 2 letters, uppercase
    let initials = firstName.slice(0, 2).toUpperCase();
    
    // Handle edge case: single letter name
    if (initials.length === 1) {
      initials = initials + '_';
    }
    
    // Extract order date (MMDD format)
    const createdDate = new Date(order.createdAt);
    const orderMonth = String(createdDate.getMonth() + 1).padStart(2, '0');
    const orderDay = String(createdDate.getDate()).padStart(2, '0');
    const orderDateStr = orderMonth + orderDay;
    
    // Calculate delivery date (15 days after order date)
    const deliveryDate = new Date(createdDate);
    deliveryDate.setDate(deliveryDate.getDate() + 15);
    const deliveryMonth = String(deliveryDate.getMonth() + 1).padStart(2, '0');
    const deliveryDay = String(deliveryDate.getDate()).padStart(2, '0');
    const deliveryDateStr = deliveryMonth + deliveryDay;
    
    // Combine all parts: initials + D + orderDate (MMDD) + M + deliveryDate (MMDD)
    const customOrderId = `${initials}D${orderDateStr}M${deliveryDateStr}`;
    
    return customOrderId;
  } catch (error) {
    console.error('Error generating display order ID:', error);
    // Fallback to MongoDB ID if something goes wrong
    return order?._id?.toString().slice(0, 8).toUpperCase() || "UNKNOWN";
  }
};

/**
 * Format order ID for display with both custom ID and MongoDB ID
 * Useful for showing both human-readable and system IDs
 */
export const formatOrderIdDisplay = (order: any, user?: any) => {
  const customId = generateDisplayOrderId(order, user);
  const mongoId = order?._id?.toString().slice(0, 8).toUpperCase() || "UNKNOWN";
  
  return {
    customId,        // e.g., "JOD0115M0130"
    mongoId,         // e.g., "507F1F77"
    fullDisplay: `${customId} (${mongoId})`,  // e.g., "JOD0115M0130 (507F1F77)"
  };
};

/**
 * Get just the custom ID for simple display
 */
export const getCustomOrderId = (order: any, user?: any) => {
  return generateDisplayOrderId(order, user);
};

/**
 * Extract components from order for custom ID (useful for debugging)
 */
export const getOrderIdComponents = (order: any, user?: any) => {
  const userName = user?.name || order?.user?.name || order?.shippingAddress?.fullName || "Unknown";
  const firstName = userName.split(' ')[0];
  const initials = firstName.slice(0, 2).toUpperCase();
  
  const createdDate = new Date(order.createdAt);
  const orderMonth = String(createdDate.getMonth() + 1).padStart(2, '0');
  const orderDay = String(createdDate.getDate()).padStart(2, '0');
  
  const deliveryDate = new Date(createdDate);
  deliveryDate.setDate(deliveryDate.getDate() + 15);
  const deliveryMonth = String(deliveryDate.getMonth() + 1).padStart(2, '0');
  const deliveryDay = String(deliveryDate.getDate()).padStart(2, '0');
  
  return {
    userName,
    firstName,
    initials,
    orderDate: `${orderMonth}-${orderDay}`,
    deliveryDate: `${deliveryMonth}-${deliveryDay}`,
    mongoId: order?._id?.toString().slice(0, 8).toUpperCase(),
  };
};
