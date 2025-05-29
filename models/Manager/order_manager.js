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
        this.order = new Order(this.generateID(), this.getDate(), this.getTime(), products);
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
            return "Order committed!";
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

    async getOrdersByEmailAndDateRange(email, startDateString, startTimeString, endDateString, endTimeString) {
        let db = await this.dbPromise;
        let orders = db.collection(this.collection);

        let user_orders = await orders.find({ customer: email }).toArray();
        if (!user_orders || user_orders.length === 0) {
            return [];
        }

        let filteredOrders = user_orders;

        // Only proceed with date/time filtering if at least one date or time string is provided
        if (startDateString || startTimeString || endDateString || endTimeString) {
            let startDateTime = null;
            let endDateTime = null;

            // Construct startDateTime
            if (startDateString) {
                const fullStartString = `${startDateString}T${startTimeString || '00:00:00'}`;
                startDateTime = new Date(fullStartString);

                // Validate the date. If invalid, treat as null.
                if (isNaN(startDateTime.getTime())) {
                    console.warn(`Invalid start date/time: ${fullStartString}. Ignoring start date filter.`);
                    startDateTime = null;
                }
            }

            // Construct endDateTime
            if (endDateString) {
                // If endTimeString is not provided, default to "23:59:59" for the end of the day
                const fullEndString = `${endDateString}T${endTimeString || '23:59:59'}`;
                endDateTime = new Date(fullEndString);

                // Validate the date. If invalid, treat as null.
                if (isNaN(endDateTime.getTime())) {
                    console.warn(`Invalid end date/time: ${fullEndString}. Ignoring end date filter.`);
                    endDateTime = null;
                }
            }

            // Apply filtering based on the constructed full date/time objects
            filteredOrders = filteredOrders.filter(order => {
                const orderFullDateTimeString = `${order.date}T${order.time}`;
                const orderDateTime = new Date(orderFullDateTimeString);

                // Handle cases where order.date or order.time might be missing or invalid
                if (isNaN(orderDateTime.getTime())) {
                    console.warn(`Order ${order.id} has invalid date/time: ${orderFullDateTimeString}. Skipping filter for this order.`);
                    return false; 
                }

                let passesFilter = true;

                if (startDateTime && orderDateTime < startDateTime) {
                    passesFilter = false;
                }
                if (endDateTime && orderDateTime > endDateTime) {
                    passesFilter = false;
                }
                return passesFilter;
            });
        }
        return filteredOrders;
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

    assignEmail(email){
        this.order.assignUser(email);
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
        var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
        var yyyy = today.getFullYear();

        // Changed to YYYY-MM-DD
        today = yyyy + '-' + mm + '-' + dd;
        return today;
    }

    getTime() {
    let now = new Date();
    var hh = String(now.getHours()).padStart(2, '0');
    var min = String(now.getMinutes()).padStart(2, '0');
    var ss = String(now.getSeconds()).padStart(2, '0');

    let currentTime = hh + ':' + min + ':' + ss;
    return currentTime;
    }
}