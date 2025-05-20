import ProductManager from './models/Manager/product_manager.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const pm = new ProductManager();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set view engine
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Define routes
// Homepage
app.route('/')
.get(async (req, res) => {
  res.render('homepage', {title: 'Home page'})
})

app.route('/product')
.get(async (req, res) => {
  res.render('product', {title: 'Home page'})
})

// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});