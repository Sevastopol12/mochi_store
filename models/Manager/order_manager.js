import Order from "../Order/order.js";
import BaseManager from "./base_manager.js";

export default class OrderManager extends BaseManager{
    constructor(){
        super();
        this.collection = 'orders'
        this.order = null;
    }

    // Create a temporary order object. This object lives on the client side
    create(products) {
        this.order = new Order(this.generateID(), this.getDate(), products);
        this.order.calculateTotal();
    }

    // Store order into database    
    async add() {
        try {
            if (this.order === null  || this.order.products.length < 1) {throw new Error('You havent add any item yet');}
            let db = await this.dbPromise;
            let orders = db.collection(this.collection);
            
            // Insert 
            await orders.insertOne(this.order);

            this.order = null; // Reset order variable
            return "Order committed!"
        }
        catch (err) {
            throw new Error('Cannot insert order into DB');
        }
    }

    // List all existing orders
    async listAll() {
        let db = await this.dbPromise;
        let orders = db.collection(this.collection);

        let all_orders = orders.find({});
        
        if (all_orders != null) {
            return all_orders.toArray();
        }

        else {return null;}
    }

    // Cancel order
    cancel() {
        this.order = null;
        return;
    }

    // Assign payment method
    addPayment(method) {
        this.order.assignPaymentMethod(method);
        return;
    }

    // Assign delivery address
    assignAddress(address) {
        this.order.assignAddress(address);
        return;
    }
    
    // Generate random id
    generateID() {
        let rnd_id = Array.from({'length': 5}, () => Math.floor(Math.random()*10)).join('');
        return rnd_id;
    }

    // Get today's date
    getDate() {
        let today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); 
        var yyyy = today.getFullYear();

        today = mm + '/' + dd + '/' + yyyy;
        return today;
    }
}