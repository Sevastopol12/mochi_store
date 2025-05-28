import OrderManager from "../models/Manager/order_manager.js";

const om = new OrderManager()

export async function handleCommitOrder(req, res, next) {
    try {
        let { orderMeta } = req.body;
        let { products, address, payment } = orderMeta;

        if (!products) {return res.status(500).json({message: "The cart is empty."});}
        if (!address) {return res.status(500).json({message: "Please fill in address."});}
        if (!payment) {return res.status(500).json({message: "Please select a payment method."});}

        // Create order
        om.create(products);
        om.assignAddress(address);
        om.addPayment(payment);

        // Commit to DB
        const message = await om.add();
        return res.status(200).json({ message });
    } 
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
}