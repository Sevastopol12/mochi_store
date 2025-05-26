import {showMessage} from './products-utils.js'

/* ===========================
   Shopping Cart
   =========================== */

let cart = {}; 
const cartModalEl = document.getElementById('cartModal');
const cartModal = bootstrap.Modal.getOrCreateInstance(cartModalEl);
const openCartBtn = document.getElementById('openCartBtn'); 

if (openCartBtn && cartModalEl) {
    openCartBtn.addEventListener('click', () => {
        cartModal.show();
        cartModalEl.removeAttribute('inert');
    });

    cartModalEl.addEventListener('hidden.bs.modal', () => {
        cartModalEl.setAttribute('inert', 'true');
        openCartBtn.focus();
    });

    // Initially set the modal to inert
    cartModalEl.setAttribute('inert', 'true');
}

// Payment method
const payment = document.querySelector('.btn-group .btn.active');
const cashBtn = document.getElementById('pay-cash-btn');
const cardBtn = document.getElementById('pay-card-btn');
[cashBtn, cardBtn].forEach(btn => {
  btn.addEventListener('click', () => {
    cashBtn.classList.remove('active');
    cardBtn.classList.remove('active');
    btn.classList.add('active');
  });
});

// Address
const address = document.getElementById('shipping-address')

// Update cart
export function updateCart(product, delta) {
  // Update state
  const entry = cart[product.id] || { product, qty: 0 };
  entry.qty = Math.max(0, entry.qty + delta);
  if (entry.qty === 0) delete cart[product.id];
  else cart[product.id] = entry;

  // Re-render cart sidebar
  renderCart();
  const totalItems = Object.values(cart).reduce((sum, e) => sum + e.qty, 0);
  cartCount.textContent = totalItems;
  cartCount.style.display = totalItems ? 'inline-block' : 'none';
}

// Render cart item
function renderCart() {
  // Reset error message
  document.getElementById('message').textContent = '';
  let cartEmptyParagraph = document.getElementById('cart-empty');

  // Start rendering
  const ul = document.getElementById('cart-items');
  const total = document.getElementById('cart-total');
  ul.innerHTML = '';
  let sum = 0;
  if (Object.keys(cart).length >= 0) { cartEmptyParagraph.setAttribute('hidden', 'true'); }

  else {
      ul.innerHTML = '';
      cartEmptyParagraph.setAttribute('hidden', 'false'); 
      return;
  }

  Object.values(cart).forEach(({ product, qty }) => {
    const li = document.createElement('li');
    li.className = 'd-flex justify-content-between align-items-center mb-2';

    li.innerHTML = `
      <span>${product.name} × ${qty}</span>
      <div>
        <button class="btn btn-sm btn-outline-secondary me-1" data-id="${product.id}" data-delta="-1">−</button>
        <button class="btn btn-sm btn-outline-secondary" data-id="${product.id}" data-delta="+1">＋</button>
      </div>
    `;
    li.querySelectorAll('button').forEach(btn => {
      const pid = btn.dataset.id;
      const d   = parseInt(btn.dataset.delta, 10);
      btn.addEventListener('click', () => updateCart(cart[pid].product, d));
    });
    ul.appendChild(li);
    sum += product.price * qty;
  });

  total.textContent = `$ ${sum.toFixed(2)}`;
}

// Load cart
export function refreshCart() {
  address.value = payment.value = '';
  Object.keys(cart).forEach(k => delete cart[k]);
  cartCount.textContent = 0;
  renderCart();
}


/* ===========================
   Commit order
   =========================== */

// Commit button
const commitBtn  = document.getElementById('commit-btn');
commitBtn.addEventListener('click', async () => {
  commitOrder();
});

// POST 'api/order/': Commit order
export async function commitOrder() {
  let my_address = address.value.trim() || null;
  let my_payment = payment.dataset.value.trim() || null;
  let products = Object.values(cart).map(e => ({
    product: e.product,
    quantity:  e.qty
  }));

  products = products.length > 0? products : null;

  let orderMeta = {products, address: my_address, payment: my_payment};

  try {
    const res = await fetch('/api/order', {
      method: 'POST',
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify({ orderMeta })
    })
    const data = await res.json();

    // Authorization
    if (res.status === 401) {
      cartModal.hide();
      openCartBtn.click();
      document.getElementById('openAuth').click();
      return;
    } 

    if (!res.ok) throw new Error(data.message || 'Add failed');
    else {
        cartModal.hide();
        showOrderModal();
        refreshCart();
    }
  }

  catch (err) {
    showMessage(err.message);
  }
}

// Commit alert
const orderModal = document.getElementById('orderModal');
// Commit modal
const orderModalInstance = bootstrap.Modal.getOrCreateInstance(orderModal);

// Helpers
function showOrderModal() {
  orderModalInstance.show(); 
  orderModal.removeAttribute('inert');
}

function hideOrderModal() {
  orderModal.setAttribute('inert', 'true');    
  orderModalInstance.hide();
}

orderModal.addEventListener('hidden.bs.modal', hideOrderModal)

// Initially set the modal to inert
orderModal.setAttribute('inert', 'true');