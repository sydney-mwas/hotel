const products = [
    { id: 1, name: "Product 1", price: 19.99, image: "product1.jpg" },
    { id: 2, name: "Product 2", price: 29.99, image: "product2.jpg" },
];

function renderProducts() {
    const grid = document.querySelector('.product-grid');
    products.forEach(product => {
        grid.innerHTML += `
            <div class="product-card">
                <img src="./assets/images/products/${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>$${product.price}</p>
                <button onclick="addToCart(${product.id}, '${product.name}', ${product.price})">
                    Add to Cart
                </button>
            </div>
        `;
    });
}

// Load products when page opens
window.onload = renderProducts;