import ProductManager from "../models/Manager/product_manager.js";

/**
 * A controller that defines routing's actions for loading product page
 */

const pm = new ProductManager();

// Render product page
export async function renderProductPage(req, res, next) {
  res.render('product', {title: 'Product page'});
}

// Loads all products from the database
export async function listAll(req, res, next) {
  try {
    let products = await pm.listAll();
    res.json(products);
  }
  catch(err) {
    next(err);
  }
}
