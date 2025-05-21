import OrderManager from "../models/Manager/order_manager.js";

const om = new OrderManager()

export async function handleCommitOrder(req, res, next) {
    try {
        let { orderMeta } = req.body;
        let { products, address, payment } = orderMeta;
        // Create order
        om.create(products);
        om.assignAddress(address);
        om.addPayment(payment);

        // Commit to DB
        const mess = await om.add();
        return res.status(200).json({ mess });
    } 
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
}