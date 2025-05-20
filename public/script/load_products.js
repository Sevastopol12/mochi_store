import ProductManager from '../models/Manager/product_manager.js';  

/**
 * Built on AJAX/webservice's convention. Loads the product-list element internally.
*/

// Built-in shopping cart
const cart = {};  
let bsCartOffcanvas;

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('product-list');
  const model = new ProductManager();
  // Cart items
  const commitBtn  = document.getElementById('commit-btn');

  // Fetch products
  try {
    const products = await model.listAll();

    // No products
    if (!products || products.length < 1) {
      container.innerHTML = "<p> No product to display. </p>";
    }

    container.innerHTML = '';
    products.forEach(product => {
      const product_element = renderCard(product);
      container.appendChild(product_element);
    })
  }

  catch(err) {
    console.error('Error loading products or template:', err);
    container.innerHTML = "<p>Error loading products.</p>";
  }

})

// Render item's html content
function renderCard(product) {
  // Get the product-card template, which defined in the product page
  const template = document.getElementById('product-template').content;
  const clone = document.importNode(template, true);

  // product card
  const card = clone.querySelector('.product-card');
  card.id = `product-${product.id}`;
  card.dataset.id = product.id;

  clone.querySelector('.product-image')
      .src = product.imageUrl || '/img/mochi.jpeg';
  clone.querySelector('.product-name').textContent = product.name;
  clone.querySelector('.product-price').textContent = `$ ${product.price.toFixed(2)}`;
  clone.querySelector('.qty-value').textContent = 0;

  clone.querySelectorAll('.qty-btn').forEach(btn => {
    const delta = parseInt(btn.dataset.delta, 10);
    btn.addEventListener('click', () => {
      updateCart(product, delta);
    });
  });

  return clone;
}


// Shopping cart 
function updateCart(product, delta) {
  // 1) Update state
  const entry = cart[product.id] || { product, qty: 0 };
  entry.qty = Math.max(0, entry.qty + delta);
  if (entry.qty === 0) delete cart[product.id];
  else cart[product.id] = entry;

  // 2) Update card badge
  const card = document.querySelector(`.product-card[data-id="${product.id}"]`);
  if (card) card.querySelector('.qty-value').textContent = entry.qty || 0;

  // 3) Re-render cart sidebar
  renderCart();
}

function renderCart() {
  const ul    = document.getElementById('cart-items');
  const total = document.getElementById('cart-total');
  ul.innerHTML = '';
  let sum = 0;

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

  total.textContent = `$${sum.toFixed(2)}`;
}

function commitOrder() {
  const items = Object.values(cart).map(e => ({
    productId: e.product.id,
    quantity:  e.qty
  }));

  fetch('/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  })
    .then(res => {
      if (!res.ok) throw new Error('Order failed');
      return res.json();
    })
    .then(({ orderId }) => {
      alert(`Order #${orderId} committed!`);
      // Clear cart
      Object.keys(cart).forEach(k => delete cart[k]);
      renderCart();
      // Reset all card badges
      document.querySelectorAll('.qty-value').forEach(s => s.textContent = '0');
    })
    .catch(err => {
      console.error(err);
      alert('Failed to commit order.');
    });
}