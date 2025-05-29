import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import AccountManager from '../models/Manager/account_manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const am = new AccountManager();

export async function login(req, res, body, session) {
  try {
    const { email, password } = body;
    if (!email || !password) {
      res.writeHead(400, { 'Content-type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Email and password are required.' }));
    }
    const user = await am.authenticate(email, password);
    if (!user) {
      res.writeHead(401, { 'Content-type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Invalid credentials.' }));
    }
    session.user = { id: user._id.toString(), name: user.name, role: user.role };
    res.writeHead(200, { 'Content-type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Login successful.' }));
  } catch (err) {
    res.writeHead(500, { 'Content-type': 'application/json' });
    return res.end(JSON.stringify({ message: err.message }));
  }
}

export async function register(req, res, body) {
  try {
    let { name, email, password, phone_number, role } = body;
    role = role || 'user';
    const exists = await am.isExisted(email);
    if (exists) {
      res.writeHead(409, { 'Content-type': 'application/json' });
      return res.end(JSON.stringify({ message: 'Email already registered.' }));
    }
    await am.add(name, password, email, phone_number);
    res.writeHead(201, { 'Content-type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Registration successful.' }));
  } catch (err) {
    res.writeHead(500, { 'Content-type': 'application/json' });
    return res.end(JSON.stringify({ message: err.message }));
  }
}

export async function logout(req, res, session) {
  // Clear session data
  Object.keys(session).forEach(key => delete session[key]);
  const view = path.join(__dirname, '../views/homepage.ejs');
  const html = await ejs.renderFile(view, { title: 'Admins Only.', session } );
  res.writeHead(200, { 'Content-type': 'text/html' });
  return res.end(html);
}
export async function checkAuth(req, res, session) {
  if (session && session.user) return true;

  const isApi = req.url.startsWith('/api');

  if (isApi) {
    res.writeHead(401, { 'Content-type': 'application/json' });
    res.end(JSON.stringify({ message: 'Unauthorized.' }));
  } 
  else {
    const view = path.join(__dirname, '../views/access-denied.ejs');
    const html = await ejs.renderFile(view, { title: 'Admins Only.' });
    res.writeHead(403, { 'Content-type': 'text/html' });
    res.end(html);
  }

  return false;
}

export async function checkRole(req, res, session) {
  if (session.user.role === 'admin') return true;

  const view = path.join(__dirname, '../views/access-denied.ejs');
  const html = await ejs.renderFile(view, { title: 'Admins Only.' });
  res.writeHead(403, { 'Content-type': 'text/html' });
  res.end(html);

  return false;
}