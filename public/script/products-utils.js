import { updateCart, refreshCart } from './cart-utils.js'

const container = document.getElementById('product-list');
const messageEl = document.getElementById('message');

/* ===========================
   Products
   =========================== */

// Render products
export function renderCard(product) {
  const template = document.getElementById('product-template').content;
  const clone    = document.importNode(template, true);
  const card     = clone.querySelector('.product-card');

  // ID & dataset for later reference (if needed)
  card.id          = `product-${product.id}`;
  card.dataset.id  = product.id;

  // Image & modal trigger
  const img = clone.querySelector('.product-image');
  img.src = product.imageUrl || '/img/mochi.jpeg';
  img.alt = product.name;
  img.setAttribute('data-bs-toggle', 'modal');
  img.setAttribute('data-bs-target', '#productModal');
  img.addEventListener('click', () => populateProductModal(product));

  // Name & price
  clone.querySelector('.product-name').textContent  = product.name;
  clone.querySelector('.product-price').textContent = `$ ${product.price.toFixed(2)}`;

  // Add-to-cart button
  const addBtn = clone.querySelector('.add-cart-btn');
  addBtn.addEventListener('click', () => updateCart(product, 1));

  return clone;
}

// Load products
export async function loadProducts() {
  try {
    const products = await (await fetch('/api/products')).json();
    // No products
    if (!products || products.length < 1) { container.innerHTML = "<p> No product to display. </p>"; }
    renderGrid(products);
  }
  catch(err) { console.error('Error loading products or template:', err); container.innerHTML = err;}
}

// Utility to render an arbitrary array of products
function renderGrid(products) {
  container.innerHTML = '';
  products.forEach(p => container.appendChild(renderCard(p)));
}


// Display product info
export function populateProductModal(product) {
  // Get modal elements
  const titleEl = document.getElementById('productModalLabel');
  const imgEl   = document.getElementById('modalProductImage');
  const descEl  = document.getElementById('modalProductDesc');
  const priceEl = document.getElementById('modalProductPrice');

  // Fill content
  titleEl.textContent = product.name;
  imgEl.src           = product.imageUrl || '/img/mochi.jpeg';
  imgEl.alt           = product.name;
  descEl.textContent  = product.description || 'No description available.';
  priceEl.textContent = `$ ${product.price.toFixed(2)}`;

  // Re-bind Add to Cart button
  const btnOld = document.getElementById('add-cart');
  const btnNew = btnOld.cloneNode(true);
  btnOld.replaceWith(btnNew);
  btnNew.addEventListener('click', () => {updateCart(product, 1);});
}


/* ===========================
   Helpers
   =========================== */

// Refresh page 
async function refreshAll() {
    await Promise.all([refreshCart()], [loadProducts()]);
}

// Helper to display messages
export function showMessage(msg, type = 'danger') {
  messageEl.textContent = msg;
  messageEl.className = `alert alert-${type} mt-2`;
  setTimeout(() => {
    messageEl.textContent = '';
    messageEl.className = '';
  }, 5000);
}

// DOM response
document.addEventListener('DOMContentLoaded', refreshAll)


