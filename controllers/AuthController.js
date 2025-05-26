import AccountManager from '../models/Manager/account_manager.js'

const am = new AccountManager();

//Login
export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) { return res.status(400).json({ message: 'Email and password are required.' }); }

  const user = await am.authenticate(email, password);
  if (!user) { return res.status(401).json({ message: 'Invalid credentials.' }); }

  // Set session
  req.session.user = { id: user._id.toString(), name: user.name, role: user.role };
  return res.json({ message: 'Login successful.' });
}

//Register
export async function register(req, res) {
  const { name, email, password, phone_number, role } = req.body;
  role = role || 'user';

  const exists = await am.isExisted(email);
  if (exists) {
    return res.status(409).json({ message: 'Email already registered.' });
  }
  await am.add(name, password, email, phone_number);
  return res.status(201).json({ message: 'Registration successful.' });
}

export function logout(req, res) {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout failed.' });
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
}


export function checkAuth(req, res, next) {
  if (req.session && req.session.user) { return next(); }
  // Return JSON if its an API call
  if (req.path.startsWith('/api')) { return res.status(401).json({message: "Unauthorized."}); }
  res.render('access-denied', {title: 'Admins Only.'})
}


export function checkRole(req, res, next) {
  if (req.session.user.role === 'admin') { next(); }
  else {res.status(403).render('access-denied', { title: 'Admins Only' })};
};