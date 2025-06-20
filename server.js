import http from 'http';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import ejs, { render } from 'ejs';

import { renderProductPage, listAll } from './controllers/ProductController.js';
import { handleCommitOrder, listOrders } from './controllers/OrderController.js';
import { addProduct, displayRevenue, updateProduct, removeProduct } from './controllers/AdminController.js';
import { checkAuth, checkRole, login, register, logout } from './controllers/AuthController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

// Store session
const sessions = {};
const COOKIE_NAME = 'sid';

// Generate session ID
function generateSessionId() {
  return crypto.randomBytes(16).toString('hex');
}

// Parse cookies header into object
function parseCookies(cookieHeader = '') {
  return Object.fromEntries(
    cookieHeader.split(';').map(c => c.trim().split('='))
  );
}

// Read files from public
async function serveStatic(req, res) {
  const urlPath = req.url.split('?')[0];
  const filePath = path.join(__dirname, 'public', urlPath);
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).slice(1);
    const mime = {
      js: 'application/javascript',
      css: 'text/css',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      svg: 'image/svg+xml',
      html: 'text/html'
    }[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
    return true;
  } 
  catch {
    return false;
  }
}

// JSON body parser
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (err) {
        reject(err);
      }
    });
  });
}

// Server
const server = http.createServer(async (req, res) => {
  const { method, url, headers } = req;
  const parsedUrl = url.split('?')[0];

  // Sessions
  const cookies = parseCookies(headers.cookie);
  let sessionId = cookies[COOKIE_NAME];
  if (!sessionId || !sessions[sessionId]) {
    sessionId = generateSessionId();
    sessions[sessionId] = {};
  }
  const session = sessions[sessionId];
  const renderOptions = { session };
  // Set cookie
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${sessionId}; HttpOnly; Path=/; Max-Age=86400`);

  // Static assets
  if (await serveStatic(req, res)) return;

  // Routes
  try {
    // Page routes
    if (method === 'GET') {
      switch (parsedUrl) {
        case '/':
        case '/homepage':
          return renderView(res, 'homepage', renderOptions);
        case '/login':
          return renderView(res, 'login', renderOptions);

        case '/register':
          return renderView(res, 'register', renderOptions);
        case '/product':
          return renderProductPage(req, res, renderOptions);

        case '/info':
          if (!(await checkAuth(req, res, session))) return;
          return renderView(res, 'info', renderOptions);
        
        case '/admin':
          if (!(await checkAuth(req, res, session))) return;
          if (!(await checkRole(req, res, session))) return;
          return renderView(res, 'admin', renderOptions);     
      }
    }

    // API routes
    if (parsedUrl.startsWith('/api/')) {
      try {

        // Order commit 
        if (parsedUrl === '/api/order' && method === 'POST') {
          if (!(await checkAuth(req, res, session))) return;
          const body = await parseJsonBody(req);
          return handleCommitOrder(req, res, body, session);
        }

        if (parsedUrl === '/api/my-orders' && method === 'GET') {
          if (!(await checkAuth(req, res, session))) return;

          const fullUrl = new URL(req.url, `http://${req.headers.host}`);
          const params  = fullUrl.searchParams;

          const query = {
            start:     params.get('start'),
            startTime: params.get('startTime'),
            end:       params.get('end'),
            endTime:   params.get('endTime'),
          };

          return listOrders(req, res, query, session);
        }

        // Login
        if (parsedUrl === '/api/login' && method === 'POST') {
          const body = await parseJsonBody(req);
          return login(req, res, body, session);
        }

        // Register
        if (parsedUrl === '/api/register' && method === 'POST') {
          const body = await parseJsonBody(req);
          return register(req, res, body, session);
        }

        // Logout
        if (parsedUrl === '/api/logout' && method === 'GET') {
          return await logout(req, res, session);        
        }

        if (parsedUrl === '/api/products' && method === 'GET') {
          return listAll(req, res);
        }
        
        // Add product
         if (parsedUrl === '/api/products/add' && method === 'POST') {
          if (!(await checkAuth(req, res, session))) return;
          if (!(await checkRole(req, res, session))) return;
          const body = await parseJsonBody(req);
          return addProduct(req, res, body);
        }

        // Update product attributes
        if (parsedUrl.match(/^\/api\/products\/\d+$/) && method === 'PUT') {
          if (!(await checkAuth(req, res, session))) return;
          if (!(await checkRole(req, res, session))) return;
          const id = parsedUrl.split('/').pop();
          const body = await parseJsonBody(req);
          return updateProduct(req, res, body, { id });
        }

        // Remove product
        if (parsedUrl.match(/^\/api\/products\/\d+$/) && method === 'DELETE') {
          if (!(await checkAuth(req, res, session))) return;
          if (!(await checkRole(req, res, session))) return;
          const id = parsedUrl.split('/').pop();
          return removeProduct(req, res, { id });
        }

        // Loads revenue
        if (parsedUrl === '/api/revenue' && method === 'GET') {
          if (!(await checkAuth(req, res, session))) return;
          if (!(await checkRole(req, res, session))) return;
          return displayRevenue(req, res);
        }
        // Unknown API endpoint
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Not found' }));
      } 

      catch (apiErr) {
        console.error(apiErr);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'Internal server error.' }));
      }
    }


    // Fallback 404
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 Internal Server Error');
  }
});

async function renderView(res, name, data) {
  const file = path.join(__dirname, 'views', name + '.ejs');
  const html = await ejs.renderFile(file, data);
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
}

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));