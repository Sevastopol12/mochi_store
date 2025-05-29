import ProductModel from '../models/productModel.js';
import ReveCounter from '../models/revenue_counter.js';

const pm = new ProductModel();
const rc = new ReveCounter();

export async function addProduct(req, res, body) {
  try {
    const { productMeta } = body;
    
    // Validate whether the id & name is valid
    const exists = await pm.ExistenceValidation(productMeta.product_id, productMeta.name);
    if (exists) {
      res.writeHead(400, {'Content-type':'application/json'}); 
      return res.end(JSON.stringify({ message: 'Product already exists.' }));
    }

    // Add product
    const mess = await pm.add(productMeta.product_id, productMeta.name, productMeta.price, productMeta.quantity, productMeta.description);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: mess }));
  } 
  catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: err.message }));
  }
}

export async function updateProduct(req, res, body, params) {
  try {
    const { id } = params;
    const { productMeta } = body;

    const product = await pm.findById(id);
    if (!product) {
      res.writeHead(404, {'Content-type': 'application/json'});
      return res.end(JSON.stringify({ message: 'Product not found.' }))
    }
    
    await pm.updateProduct(product, parseInt(productMeta.quantity, 10), parseFloat(productMeta.price), productMeta.description);
    res.writeHead(200, { 'Content-type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Quantity updated successfully.' }));
    
  } 
  catch (err) {
    res.writeHead(500, {'Content-type': 'application/json'});
    return res.end(JSON.stringify({message: err.message}));
  }
}

export async function removeProduct(req, res, params) {
  try {
    const { id } = params;
    const product = await pm.findById(id);
    if (!product) {
      res.writeHead(404, {'Content-type': 'application/json'});
      return res.end(JSON.stringify({ message: 'Product not found.' }));
    }
    await pm.remove(id);
    res.writeHead(200, {'Content-type': 'application/json'});
    return res.end(JSON.stringify({ message: 'Product removed successfully.' }));

  } 
  catch (err) {
    res.writeHead(500, {'Content-type': 'application/json'});
    return res.end(JSON.stringify({message: err.message}));
  }
}

export async function displayRevenue(req, res) {
  try {
    const { total_revenue } = await rc.getTotal();
    res.writeHead(200, {'Content-type': 'application/json'});
    return res.end(JSON.stringify({ total_revenue: total_revenue }));
  } 
  catch (err) {
    res.writeHead(500, {'Content-type': 'application/json'});
    return res.end(JSON.stringify({message: err.message }));
  }
}