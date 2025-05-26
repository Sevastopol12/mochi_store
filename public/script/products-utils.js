/**
 * Built on AJAX/webservice's convention. Loads the product-list element internally.
*/

// Built-in shopping cart
let cart = {};  
// Payment method defaults to cash

document.addEventListener('DOMContentLoaded', async () => {
  // Target product-list section
  const container = document.getElementById('product-list');
  // Fetch products
  try {
    const products = await (await fetch('/api/products')).json();

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

  // Payment
  const cashBtn = document.getElementById('pay-cash-btn');
  const cardBtn = document.getElementById('pay-card-btn');

  [cashBtn, cardBtn].forEach(btn => {
    btn.addEventListener('click', () => {
      cashBtn.classList.remove('active');
      cardBtn.classList.remove('active');
      btn.classList.add('active');
    });
  });

  // Commit button
  const commitBtn  = document.getElementById('commit-btn');
  commitBtn.addEventListener('click', async () => {
    commitOrder();
  });

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

  // Update state
  const entry = cart[product.id] || { product, qty: 0 };
  entry.qty = Math.max(0, entry.qty + delta);
  if (entry.qty === 0) delete cart[product.id];
  else cart[product.id] = entry;

  // Update card badge
  const card = document.querySelector(`.product-card[data-id="${product.id}"]`);
  if (card) card.querySelector('.qty-value').textContent = entry.qty || 0;

  // Re-render cart sidebar
  renderCart();
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


  if (Object.keys(cart).length > 0) {
      cartEmptyParagraph.setAttribute('hidden', 'true');
  }

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

  total.textContent = `$${sum.toFixed(2)}`;
}

// POST 'api/order/': Commit order
async function commitOrder() {
  // Validate address
  let address = document.getElementById('shipping-address').value.trim();
  if (!address || address.length < 1) {
    document.getElementById('message').textContent = 'Please enter an address.';
    return;
  }

  // Validate payment method
  let payment = document.querySelector('.btn-group .btn.active').dataset.value.trim();
  if (!payment || payment.trim().length < 1) {
    document.getElementById('message').textContent = 'Please select a payment method.';
    return;
  }

  // Validate product
  if (Object.keys(cart).length < 1) {
    document.getElementById('message').textContent = 'Please select an item.';
    return;
  }

  let products = Object.values(cart).map(e => ({
    product: e.product,
    quantity:  e.qty
  }));

  let orderMeta = {products, address, payment};

  fetch('/api/order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ orderMeta })
  })
  .then(async res => {
    const data = await res.json();
    if (!res.ok) throw new Error(data['message']);
    return data;
  })
  .then(({ }) => {
    showOrderModal();

    Object.keys(cart).forEach(k => delete cart[k]);
    renderCart();
    document.querySelectorAll('.qty-value').forEach(s => (s.textContent = '0'));
  })
  .catch(err => {
    console.error('Order failed:', err);
    alert(err.message);
  });
}

// Commit alert
const modal       = document.getElementById('orderModal');
const closeIcon   = document.getElementById('orderModalClose');
const okButton    = document.getElementById('orderModalOk');

function showOrderModal() {
  modal.style.display = 'flex';
}
function hideOrderModal() {
  modal.style.display = 'none';
}

// close on “×” or “OK”
closeIcon.addEventListener('click', hideOrderModal);
okButton.addEventListener('click', hideOrderModal);

// also close if user clicks outside the content
modal.addEventListener('click', e => {
  if (e.target === modal) hideOrderModal();
});