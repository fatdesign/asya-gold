// --- Scroll Effects ---
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// --- Cart Management ---
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.getElementById('close-cart');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartCount = document.getElementById('cart-count');

let cart = JSON.parse(localStorage.getItem('asya_cart')) || [];

function toggleCart() {
    cartDrawer.classList.toggle('active');
    cartOverlay.classList.toggle('active');
}

cartBtn.addEventListener('click', toggleCart);
closeCartBtn.addEventListener('click', toggleCart);
cartOverlay.addEventListener('click', toggleCart);

function updateCartUI() {
    localStorage.setItem('asya_cart', JSON.stringify(cart));
    cartCount.innerText = cart.length;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p style="text-align: center; color: var(--gray); margin-top: 50px;">Ihr Warenkorb ist noch leer.</p>`;
        cartTotalPrice.innerText = '0,00 €';
        return;
    }

    cartItemsContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <img src="${item.image}" class="cart-item-img">
            <div class="cart-item-info">
                <h4>${item.title}</h4>
                <p>${item.price}</p>
            </div>
            <button class="remove-item" onclick="removeFromCart(${index})"><i class="fa-solid fa-trash-can"></i></button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => {
        const price = parseFloat(item.price.replace(' €', '').replace('.', '').replace(',', '.'));
        return sum + price;
    }, 0);

    cartTotalPrice.innerText = total.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

window.addToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
        cart.push(product);
        updateCartUI();
        if (!cartDrawer.classList.contains('active')) toggleCart();
    }
};

window.removeFromCart = (index) => {
    cart.splice(index, 1);
    updateCartUI();
};

// --- Checkout ---
window.startCheckout = () => {
    if (cart.length === 0) {
        alert('Ihr Warenkorb ist leer.');
        return;
    }
    
    // Simulations-Effekt
    const btn = document.querySelector('.cart-footer .cta-luxury');
    btn.innerText = 'Verarbeite...';
    btn.disabled = true;

    setTimeout(() => {
        alert('Vielen Dank für Ihre Bestellung! Wir leiten Sie nun zur sicheren Zahlung weiter (Stripe-Simulation).');
        cart = [];
        updateCartUI();
        toggleCart();
        btn.innerText = 'Zur Kasse';
        btn.disabled = false;
    }, 1500);
};

// --- Product Data & Rendering ---
// Wir laden die Produkte aus dem LocalStorage, damit Admin-Änderungen sofort sichtbar sind.
const defaultProducts = [
    {
        id: 1,
        title: "L'Aurore Ring",
        category: "Signature Collection",
        price: "2.490 €",
        image: "images/gold_diamond_ring_luxury_1777729778737.png",
        active: true
    },
    {
        id: 2,
        title: "Étoile Collier",
        category: "Fine Necklaces",
        price: "1.850 €",
        image: "images/gold_necklace_elegant_1777729798075.png",
        active: true
    },
    {
        id: 3,
        title: "Océan Bracelet",
        category: "Timeless Wristwear",
        price: "3.200 €",
        image: "images/gold_bracelet_set_1777729811867.png",
        active: true
    },
    {
        id: 4,
        title: "Lumière Hoops",
        category: "Earrings",
        price: "950 €",
        image: "images/gold_earrings_minimalist_1777729825390.png",
        active: true
    }
];

let products = JSON.parse(localStorage.getItem('asya_products')) || defaultProducts;
if (!localStorage.getItem('asya_products')) {
    localStorage.setItem('asya_products', JSON.stringify(defaultProducts));
}

const container = document.getElementById('product-container');

function renderProducts() {
    if (!container) return;
    
    // Nur aktive Produkte im Shop anzeigen
    const activeProducts = products.filter(p => p.active);
    
    container.innerHTML = activeProducts.map(p => `
        <div class="product-item">
            <div class="product-image-container">
                <img src="${p.image}" alt="${p.title}">
                <div class="add-overlay" onclick="addToCart(${p.id})">In den Warenkorb</div>
            </div>
            <div class="product-details">
                <div class="product-info">
                    <p>${p.category}</p>
                    <h3>${p.title}</h3>
                </div>
                <div class="product-price">${p.price}</div>
            </div>
        </div>
    `).join('');

    // Intersection Observer for reveal animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.product-item').forEach(item => {
        observer.observe(item);
    });
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartUI();
});
