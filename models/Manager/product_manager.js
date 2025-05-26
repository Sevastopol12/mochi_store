import Product from "../Product/product.js";
import BaseManager from "./base_manager.js";

export class ProductManager extends BaseManager {
  constructor() {
    super();
    this.collection = 'products';
  }

  async add({ product_id, name, price, quantity }) {
    let db = await this.dbPromise;
    let products = db.collection(this.collection);

    try {
      let new_product = new Product({ id: product_id, name, price, quantity });
      await products.insertOne(new_product);
      return this;
    } catch (error) {
      console.error('Error adding product to database:', error);
      throw error;
    }
  }

  async remove({ product_id }) {
    let db = await this.dbPromise;
    let products = db.collection(this.collection);

    let product = await products.findOne({ id: product_id });

    if (product !== null) {
      await products.deleteOne({ id: product_id });
    }

    return this;
  }

  async updateQuantity(product, add_quantity) {
    let db = await this.dbPromise;
    let products = db.collection(this.collection);
    let new_quantity = product.quantity + add_quantity;

    await products.updateOne(
      { id: product.id },
      { $set: { quantity: new_quantity } }
    );

    return this;
  }

  async listAll() {
    let db = await this.dbPromise;
    let products = db.collection(this.collection);
    return products.find({}).toArray();
  }

  async findById(product_id) {
    let db = await this.dbPromise;
    let products = db.collection(this.collection);
    return await products.findOne({ id: product_id }) || null;
  }
}

export default ProductManager;