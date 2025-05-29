import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import ProductModel from '../models/productModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pm = new ProductModel();

export async function renderProductPage(req, res, options) {
  const view = path.join(__dirname, '../views/product.ejs');
  const html = await ejs.renderFile(view, options);
  res.writeHead(200, { 'Content-Type': 'text/html' });
  return res.end(html);
}

export async function listAll(req, res) {
  try {
    const products = await pm.listAll();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(products));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: err.message }));
  }
}