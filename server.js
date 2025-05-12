import AccountManager from './app/Manager/account_manager.js';
import ProductManager from './app/Manager/product_manager.js';
import Product from './app/Product/product.js';
import User from './app/Account/user.js';
import Admin from './app/Account/admin.js';
import AppConfig from './app/Config.js';
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
  console.log(await pm.listAll())
  res.render('homepage', {title: 'Home page'})
})



// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});