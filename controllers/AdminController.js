import ProductManager from '../models/Manager/product_manager.js';
import ReveCounter from '../models/Manager/revenue_counter.js';

const pm = new ProductManager();
const rc = new ReveCounter();

export async function addProduct(req, res) {
  try {
    const { productMeta } = req.body;
    
    // Validate whether the id & name is valid
    const exists = await pm.ExistenceValidation(productMeta.product_id, productMeta.name);
    if (exists) return res.status(400).json({ message: 'Product already exists.' });

    // Add product
    const mess = await pm.add(productMeta.product_id, productMeta.name, productMeta.price, productMeta.quantity, productMeta.description);
    return res.status(200).json({ message: mess });
  } 
  catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { productMeta } = req.body;

    const product = await pm.findById(id);
    if (!product) { return res.status(404).json({ message: 'Product not found.' }); }
    
    await pm.updateProduct(product, parseInt(productMeta.quantity, 10), parseFloat(productMeta.price), productMeta.description);
    res.json({ message: 'Quantity updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function removeProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await pm.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    await pm.remove(id);
    res.json({ message: 'Product removed successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function displayRevenue(req, res) {
  try {
    const { total_revenue } = await rc.getTotal();
    res.json({ total_revenue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
