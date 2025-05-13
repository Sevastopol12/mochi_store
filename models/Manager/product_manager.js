import BaseManager from './base_manager.js';
import Product from "../Product/product.js";
import AppConfig from "../Config.js";

export default class ProductManager extends BaseManager{
  /**
   * A class that works with the product database, have all access and permission to manipulate the product database
  */
  constructor() {
    super();
    this.collection = 'products';
  }

  // Add a product
  async add({product_id, name, price, quantity}) {
    let db = await this.dbPromise;
    let products = db.collection(this.collection);

    // Create a new product and add it into the database
    try {
      let new_product = new Product({id: product_id, name: name, price: price, quantity: quantity});
      await products.insertOne(new_product);
      return this;
    }

    catch (error) {
      console.error('Error adding account to database:', error);
      throw error;
    }
  }

  // Remove a product 
  async remove({product_id}) {
    return this;
  }

  // Return all product in the database
  async listAll() {
    let db = await this.dbPromise;
    let products = db.collection(this.collection);

    // Get all existing product
    let all_products = products.find({});

    if (all_products !== null){
      all_products = all_products.toArray();
      return all_products;
    }

    else {return null;}

  }

  // Update product quantity 
  async updateQuantity(product, add_quantity) {
    return this;
  }


  // Find a product using its id
  async findById(product_id) {
    return this;
 }

}
