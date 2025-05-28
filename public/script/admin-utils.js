const container = document.getElementById('product-list');
const revEl = document.getElementById('rev-value');
const messageEl = document.getElementById('message');

// Form fields
const idInput = document.getElementById('prod-id');
const nameInput = document.getElementById('prod-name');
const priceInput = document.getElementById('prod-price');
const qtyInput = document.getElementById('prod-qty');
const descriptionInput = document.getElementById('prod-description')

// Buttons
const addBtn = document.getElementById('btn-add');
const updateBtn = document.getElementById('btn-update');
const removeBtn = document.getElementById('btn-delete');

// Event listeners
addBtn.addEventListener('click', addProduct);
updateBtn.addEventListener('click', updateProduct);
removeBtn.addEventListener('click', removeProduct);

// DOM responses
document.addEventListener('DOMContentLoaded', refreshAll);

// Helper to display messages
function showMessage(msg, type = 'danger') {
  messageEl.textContent = msg;
  messageEl.className = `alert alert-${type} mt-2`;
  setTimeout(() => {
    messageEl.textContent = '';
    messageEl.className = '';
  }, 5000);
}

// POST: add product
async function addProduct() {
  // Validation
  if (!nameInput.value.trim()) return showMessage('Name is required');
  if (!priceInput.value.trim()) return showMessage('Price is required');

  const productMeta = {
    product_id: idInput.value.trim(),
    name: nameInput.value.trim(),
    price: parseFloat(priceInput.value),
    quantity: parseInt(qtyInput.value, 10) || 1,
    description: descriptionInput.value.trim() || null
  };

  try {
    const res = await fetch('/api/products/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productMeta })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Add failed');
    showMessage(data.mess || 'Product added.', 'success');
    await refreshAll();
  } 
  catch (err) {
    showMessage(err.message);
  }
}

// POST: update product quantity
async function updateProduct() {
  // Product ID
  const id = idInput.value.trim();
  // Update values
  const productMeta = {
    price: parseFloat(priceInput.value),
    quantity: parseInt(qtyInput.value, 10),
    description: descriptionInput.value.trim()
  };

  const noUpdates = (isNaN(productMeta.quantity) && isNaN(productMeta.price) && !productMeta.description);
  if (!id || noUpdates) {
    return showMessage('Valid ID and updates are required.');
  }
  try {
    const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productMeta }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    showMessage(data.message, 'success');
    await refreshAll();
  } catch (e) { showMessage(e.message); }
}

// POST: delete product
async function removeProduct() {
  const id = idInput.value.trim();
  if (!id) return showMessage('ID is required.');
  try {
    const res = await fetch(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    showMessage(data.message, 'success');
    await refreshAll();
  } catch (e) { showMessage(e.message); }
}

// Render and load
function renderCard(product) {
  const template = document.getElementById('product-template').content;
  const clone = document.importNode(template, true);
  const card = clone.querySelector('.product-card');
  card.id = `product-${product.id}`;
  clone.querySelector('.product-image').src = product.imageUrl || '/img/mochi.jpeg';
  clone.querySelector('.product-id').textContent = `ID: ${product.id}`;
  clone.querySelector('.product-name').textContent = product.name;
  clone.querySelector('.product-price').textContent = `$${product.price.toFixed(2)}`;
  clone.querySelector('.qty-value').textContent = `In stock: ${parseInt(product.quantity)}`;
  return clone;
}

// Load products
async function loadProducts() {
  try {
    const products = await (await fetch('/api/products')).json();
    // No products
    if (!products || products.length < 1) { container.innerHTML = "<p> No product to display. </p>"; }
    container.innerHTML = '';
    Object.values(products).forEach(product => {container.appendChild(renderCard(product));})
  }
  catch(err) { console.error('Error loading products or template:', err); container.innerHTML = err;}
}

// Load total revenue
async function loadRevenue() {
  const res = await fetch('/api/revenue');
  let { total_revenue } = await res.json();
  revEl.textContent = `$${total_revenue}`;
}

// Refresh page
async function refreshAll() {
  await Promise.all([loadProducts()]);
  idInput.value = nameInput.value = priceInput.value = qtyInput.value = descriptionInput.value = '';
}
