document.addEventListener('DOMContentLoaded', () => {
  const openAuth = document.getElementById('openAuth');
  if (openAuth) {
    openAuth.addEventListener('click', () => loadAuthModal());
  }
})

// Create overlay
const overlay = document.createElement('div');
overlay.id = 'authModal';
overlay.className = 'auth-modal';
overlay.style.display = 'none';

// Close handlers
overlay.addEventListener('click', e => { if (e.target === overlay) overlay.style.display = 'none';});

// Init load
loadAuthModal();
export function loadAuthModal() {
  // Prevent multiple creations
  if (document.getElementById('authModal')) {overlay.style.display = 'flex'; return;};
  
  // Modal container
  const container = document.createElement('div');
  container.className = 'auth-container';
  container.innerHTML = `
    <div class="auth-tabs">
      <div id="tab-login" class="auth-tab auth-tab--active">Đăng Nhập</div>
      <div id="tab-register" class="auth-tab">Đăng Ký</div>
    </div>
    <div class="auth-forms">
      <img src="/img/login-logo.png" alt="Mochi" class="auth-icon" />
      <form id="form-login" class="auth-form auth-form--active">
        <div class="auth-field">
          <label for="login-email">Email</label>
          <input type="email" id="login-email" placeholder="you@example.com" required />
        </div>
        <div class="auth-field">
          <label for="login-password">Mật khẩu</label>
          <input type="password" id="login-password" placeholder="••••••••" required />
        </div>
        <button id="login" type="submit" class="auth-btn">Đăng Nhập</button>
        <div class="auth-toggle">Chưa có tài khoản? <span id="show-register">Đăng Ký</span></div>
      </form>
      <form id="form-register" class="auth-form">
        <div class="auth-field">
          <label for="reg-name">Họ & Tên</label>
          <input type="text" id="reg-name" placeholder="kimi no na wa" required />
        </div>
        <div class="auth-field">
          <label for="reg-phone">Số điện thoại</label>
          <input type="text" id="reg-phone" placeholder="yo phone number" required />
        </div>
        <div class="auth-field">
          <label for="reg-email">Email</label>
          <input type="email" id="reg-email" placeholder="you@example.com" required />
        </div>
        <div class="auth-field">
          <label for="reg-password">Mật khẩu</label>
          <input type="password" id="reg-password" placeholder="••••••••" required />
        </div>
        <button id="register" type="submit" class="auth-btn">Đăng Ký</button>
        <div class="auth-toggle">Đã có tài khoản? <span id="show-login">Đăng Nhập</span></div>
      </form>
      <div id="auth-message" class="text-center text-danger mt-2" role="alert"></div>
    </div>
  `;

  overlay.appendChild(container);
  document.body.appendChild(overlay);

  // Logic
  const tabLogin = overlay.querySelector('#tab-login');
  const tabRegister = overlay.querySelector('#tab-register');
  const formLogin = overlay.querySelector('#form-login');
  const formRegister = overlay.querySelector('#form-register');
  const showRegister = overlay.querySelector('#show-register');
  const showLogin = overlay.querySelector('#show-login');

  // Switch between login/register
  function activateLogin() {
    tabLogin.classList.add('auth-tab--active');
    tabRegister.classList.remove('auth-tab--active');
    formLogin.classList.add('auth-form--active');
    formRegister.classList.remove('auth-form--active');
  }
  function activateRegister() {
    tabRegister.classList.add('auth-tab--active');
    tabLogin.classList.remove('auth-tab--active');
    formRegister.classList.add('auth-form--active');
    formLogin.classList.remove('auth-form--active');
  }

  tabLogin.addEventListener('click', activateLogin);
  tabRegister.addEventListener('click', activateRegister);
  showRegister.addEventListener('click', activateRegister);
  showLogin.addEventListener('click', activateLogin);

    // Login submit
  formLogin.addEventListener('submit', async e => {
    e.preventDefault();
    const email = formLogin['login-email'].value;
    const pass  = formLogin['login-password'].value;
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      overlay.style.display = 'none';
      window.location.reload();
    } 
    catch (err) {
      document.getElementById('auth-message').textContent = err.message;
    }
  });

  // Register submit + auto-login
  formRegister.addEventListener('submit', async e => {
    e.preventDefault();
    try {          
      const name = formRegister['reg-name'].value;
      const email = formRegister['reg-email'].value;
      const pass = formRegister['reg-password'].value;
      const phone_number = formRegister['reg-phone'].value;

      // Register
      const regRes = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, email, password: pass , phone_number}),
      });
      const regData = await regRes.json();
      if (!regRes.ok) throw new Error(regData.message);

      // Auto-login
      const loginRes = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.message);

      container.style.display = 'none';
      window.location.reload();

    } 
    catch (err) {
      document.getElementById('auth-message').textContent = err.message;
    }
  });
}


