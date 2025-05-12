import ProductManager from './app/Manager/product_manager.js';
const manager = new ProductManager();

async function reset() {
  for (let i = 0; i < 20; i++) {
    await manager.remove({
        product_id: String(i+1)
    })
    console.log(`Deleted: product`);
  }
  console.log('✅ All products deleted.');
}

reset();

