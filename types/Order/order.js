export default class Orer {
    constructor(id, date, time, products) {
        this.id = id;
        this.date = date;
        this.time = time;
        this.products = products;
        this.total = 0;
        this.payment = null;
        this.address = null;
        this.customer = null;
        this.status = 0; // 0 for on-going, 1 for delivered
    }

    // Display order's detail
    orderDetail() {
        return this;
    }

    // Sum up total price
    calculateTotal() {
        let total = 0;
        Object.values(this.products).forEach(x => total += x.product.price * x.quantity);
        this.total = total;
        
        return this;
    }

    // Add payment method
    assignPaymentMethod(method) {
        this.payment = method;
        return this;
    }

    // Add deliver address
    assignAddress(address) {
        this.address = address;
        return this;
    }

    assignUser(userEmail) {
        this.customer = userEmail;
        return this;
    }

    processOrder() {
        if (this.products.length < 1) {return 'Products cannot be empty ';}
        if (this.total ===0) {return 'total price cannot be 0';}
        if (this.payment === null) {return 'No payment method selected';}
        return this;
    }

}