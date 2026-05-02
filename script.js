// Beispiel-Produktdaten (Später kommen diese aus der Cloudflare D1 Datenbank)
const products = [
    {
        id: 1,
        title: "Klassischer Diamantring",
        category: "Ringe",
        price: "1.299,00 €",
        image: "images/gold_diamond_ring_luxury_1777729778737.png"
    },
    {
        id: 2,
        title: "Elegante Goldkette",
        category: "Ketten",
        price: "849,00 €",
        image: "images/gold_necklace_elegant_1777729798075.png"
    },
    {
        id: 3,
        title: "Goldenes Armband-Set",
        category: "Armbänder",
        price: "599,00 €",
        image: "images/gold_bracelet_set_1777729811867.png"
    },
    {
        id: 4,
        title: "Minimalistische Creolen",
        category: "Ohrringe",
        price: "329,00 €",
        image: "images/gold_earrings_minimalist_1777729825390.png"
    }
];

// DOM Elemente
const productContainer = document.getElementById('product-container');
const cartCount = document.getElementById('cart-count');

let cart = [];

// Produkte rendern
function renderProducts() {
    productContainer.innerHTML = products.map(product => `
        <div class="product-card animate-fade">
            <img src="${product.image}" alt="${product.title}" class="product-image">
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.title}</h3>
                <div class="product-price">${product.price}</div>
                <button class="btn-add" onclick="addToCart(${product.id})">In den Warenkorb</button>
            </div>
        </div>
    `).join('');
}

// Warenkorb Logik
window.addToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    cart.push(product);
    updateCart();
};

function updateCart() {
    cartCount.innerText = cart.length;
    
    // Animation für den Warenkorb
    cartCount.classList.add('bump');
    setTimeout(() => cartCount.classList.remove('bump'), 300);
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
});
