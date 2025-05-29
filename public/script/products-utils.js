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
    allProducts = products;

    // No products
    if (!products || products.length < 1) { container.innerHTML = "<p> No product to display. </p>"; }
    renderGrid(products);
  }
  catch(err) { console.error('Error loading products or template:', err); container.innerHTML = err;}
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
   Search engine
   =========================== */

let allProducts;
const searchInput = document.getElementById('product-search');
const suggList = document.getElementById('search-suggestions');

// Utility to render an arbitrary array of products
function renderGrid(products) {
  container.innerHTML = '';
  products.forEach(p => container.appendChild(renderCard(p)));
}

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) {
    suggList.style.display = 'none';
    renderGrid(allProducts);
    return;
  }
  // Find up to 5 name matches
  const matches = allProducts
    .filter(p => p.name.toLowerCase().includes(q))
    .slice(0, 10);

  // Build suggestions dropdown
  suggList.innerHTML = matches
    .map(p => `<li class="list-group-item list-group-item-action" data-id="${p.id}">${p.name}</li>`)
    .join('');
  suggList.style.display = matches.length > 0 ? 'block' : 'none';

  // When a suggestion is clicked
  suggList.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
      searchInput.value = li.textContent;
      suggList.style.display = 'none';
      // Render only the selected product
      const prod = allProducts.find(x => x.id == li.dataset.id);
      renderGrid(prod ? [prod] : []);
    });
  });
});


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

