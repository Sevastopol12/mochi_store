import OrderManager from '../models/Manager/order_manager.js';
const om = new OrderManager();

export async function handleCommitOrder(req, res, body, session) {
  try {
    const user_email = session.user.email;
    const { orderMeta } = body;
    const { products, address, payment } = orderMeta;
    if (!products) {
      res.writeHead(400, { 'Content-type': 'application/json' });
      return res.end(JSON.stringify({ message: 'The cart is empty.' }));
    }
    if (!address) {
      res.writeHead(400, { 'Content-type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Please fill in address.' }));
    }
    if (!payment) {
      res.writeHead(400, { 'Content-type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Please select a payment method.' }));
    }

    om.create(products);
    om.assignAddress(address);
    om.addPayment(payment);
    om.assignEmail(user_email);
    const msg = await om.add();

    res.writeHead(200, { 'Content-type': 'application/json' });
    return res.end(JSON.stringify({ message: msg }));
  } 
  catch (err) {
    res.writeHead(500, { 'Content-type': 'application/json' });
    return res.end(JSON.stringify({ message: err.message }));
  }
}

export async function listOrders(req, res, query, session) {
    const { start, startTime, end, endTime } = query;

    const userEmail = session.user ? session.user.email : 'test@example.com';

    try {
        const orders = await om.getOrdersByEmailAndDateRange(userEmail, start, startTime, end, endTime);
        res.writeHead(200, { 'Content-type': 'application/json' });
        return res.end(JSON.stringify(orders));

    } 
    catch (error) {
        res.writeHead(500, { 'Content-type': 'application/json' });
        return res.end(JSON.stringify({ message: err.message }));
    }
}