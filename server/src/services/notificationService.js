import { sendEmail } from "../utils/email.js";
import logger from "../utils/logger.js";

function orderConfirmationTemplate(order) {
  const items = order.items.map((i) => `<li>${i.title} x${i.quantity} — $${(i.price * i.quantity).toFixed(2)}</li>`).join("");
  return {
    subject: `Order confirmed #${order.orderNumber}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #eee;border-radius:8px">
      <h2 style="color:#4f46e5">Order confirmed!</h2>
      <p>Hi ${order.user?.name || "there"},</p>
      <p>Your order <strong>#${order.orderNumber}</strong> has been placed successfully.</p>
      <ul style="padding-left:20px">${items}</ul>
      <p><strong>Subtotal:</strong> $${order.subtotal.toFixed(2)}</p>
      ${order.coupon?.discount ? `<p><strong>Discount:</strong> -$${order.coupon.discount.toFixed(2)}</p>` : ""}
      <p><strong>Shipping:</strong> ${order.shipping === 0 ? "FREE" : `$${order.shipping.toFixed(2)}`}</p>
      <p><strong>Tax:</strong> $${order.tax.toFixed(2)}</p>
      <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
      <p style="color:#777;font-size:12px">Thank you for shopping with us!</p>
    </div>`,
  };
}

function orderStatusUpdateTemplate(order, oldStatus) {
  return {
    subject: `Order #${order.orderNumber} status updated`,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #eee;border-radius:8px">
      <h2 style="color:#4f46e5">Order status update</h2>
      <p>Hi ${order.user?.name || "there"},</p>
      <p>Your order <strong>#${order.orderNumber}</strong> status has changed from <em>${oldStatus}</em> to <strong>${order.status}</strong>.</p>
      ${order.status === "shipped" && order.trackingNumber ? `<p><strong>Tracking:</strong> ${order.trackingNumber}</p>` : ""}
      <p style="color:#777;font-size:12px">If you have any questions, please contact support.</p>
    </div>`,
  };
}

async function sendOrderConfirmation(order) {
  try {
    const template = orderConfirmationTemplate(order);
    await sendEmail({ to: order.user?.email, ...template });
    logger.info("Order confirmation email sent", { orderId: order._id });
  } catch (err) {
    logger.warn("Failed to send order confirmation email", { orderId: order._id, error: err.message });
  }
}

async function sendOrderStatusUpdate(order, oldStatus) {
  try {
    const template = orderStatusUpdateTemplate(order, oldStatus);
    await sendEmail({ to: order.user?.email, ...template });
    logger.info("Order status update email sent", { orderId: order._id, status: order.status });
  } catch (err) {
    logger.warn("Failed to send order status update email", { orderId: order._id, error: err.message });
  }
}

export { sendOrderConfirmation, sendOrderStatusUpdate };
