import ProductManager from './app/Manager/product_manager.js';
const manager = new ProductManager();

const sampleProducts = [
  {"id":"1","name":"Mochi Truyền Thống","price":0.577,"quantity":60},
  {"id":"2","name":"Mochi Dâu","price":0.769,"quantity":45},
  {"id":"3","name":"Mochi Trà Xanh","price":0.769,"quantity":30},
  {"id":"4","name":"Mochi Chocolate","price":0.846,"quantity":24},
  {"id":"5","name":"Mochi Xoài","price":0.808,"quantity":36},
  {"id":"6","name":"Mochi Phô Mai","price":0.692,"quantity":75},
  {"id":"7","name":"Mochi Vani","price":0.654,"quantity":54},
  {"id":"8","name":"Mochi Việt Quất","price":0.846,"quantity":30},
  {"id":"9","name":"Mochi Kem Sữa","price":0.615,"quantity":42},
  {"id":"10","name":"Mochi Đậu Đỏ","price":0.577,"quantity":60},
  {"id":"11","name":"Mochi Matcha Socola","price":0.885,"quantity":27},
  {"id":"12","name":"Mochi Chuối","price":0.731,"quantity":33},
  {"id":"13","name":"Mochi Kem Dừa","price":0.808,"quantity":39},
  {"id":"14","name":"Mochi Caramen","price":0.769,"quantity":48},
  {"id":"15","name":"Mochi Kiwi","price":0.827,"quantity":21},
  {"id":"16","name":"Mochi Táo Xanh","price":0.788,"quantity":30},
  {"id":"17","name":"Mochi Socola Trắng","price":0.865,"quantity":15},
  {"id":"18","name":"Mochi Phúc Bồn Tử","price":0.885,"quantity":18},
  {"id":"19","name":"Mochi Khoai Môn","price":0.75,"quantity":36},
  {"id":"20","name":"Mochi Đậu Phộng","price":0.692,"quantity":42}
]

async function seed() {
  for (let i = 0; i < sampleProducts.length; i++) {
    const product = sampleProducts[i];
    await manager.add({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: product.quantity,
    });
    console.log(`Inserted: ${product.name}`);
  }
  console.log('✅ All products inserted.');
}

seed();

