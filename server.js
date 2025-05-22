import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

import { renderProductPage, listAll } from './controllers/ProductController.js';
import { handleCommitOrder } from './controllers/OrderController.js';
import { checkAuth, checkRole, login, register, logout } from './controllers/AuthController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const app = express();

// Serve only public/* as static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Session
app.use(session({
  secret: 'mocnhien',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 86400000 }
}));

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Public routes
app.get('/', (req, res) => res.render('homepage'));
app.get('/login', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));
app.get('/product', renderProductPage);

// Auth
app.post('/api/login', login);
app.post('/api/register', register);
app.get('/api/logout', logout);

// Public API
app.get('/api/products', listAll);

// Order API
app.post('/api/order', checkAuth, handleCommitOrder);


// Catch-all JSON error handler for /api
app.use('/api', (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error.' });
});

// Start server
app.listen(3000, () =>
  console.log('Server running on http://localhost:3000')
);