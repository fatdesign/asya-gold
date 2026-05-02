// --- Configuration ---
const API_URL = 'https://asya-gold.f-klavun.workers.dev/api';

// --- Scroll Effects ---
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (header && window.scrollY > 50) {
        header.classList.add('scrolled');
    } else if (header) {
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
    if (cartDrawer && cartOverlay) {
        cartDrawer.classList.toggle('active');
        cartOverlay.classList.toggle('active');
    }
}

if (cartBtn) cartBtn.addEventListener('click', toggleCart);
if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

function formatCurrency(val) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val);
}

function updateCartUI() {
    if (!cartCount || !cartItemsContainer || !cartTotalPrice) return;
    
    localStorage.setItem('asya_cart', JSON.stringify(cart));
    cartCount.innerText = cart.length;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p style="text-align: center; color: var(--gray); margin-top: 50px;">Ihr Warenkorb ist noch leer.</p>`;
        cartTotalPrice.innerText = '0,00 €';
        return;
    }

    cartItemsContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <img src="${item.image_url}" class="cart-item-img">
            <div class="cart-item-info">
                <h4>${item.title}</h4>
                <p>${formatCurrency(item.price)}</p>
            </div>
            <button class="remove-item" onclick="removeFromCart(${index})"><i class="fa-solid fa-trash-can"></i></button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    cartTotalPrice.innerText = formatCurrency(total);
}

window.addToCart = (productId) => {
    const product = window.allProducts.find(p => p.id === productId);
    if (product) {
        cart.push(product);
        updateCartUI();
        if (cartDrawer && !cartDrawer.classList.contains('active')) toggleCart();
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
    
    const btn = document.querySelector('.cart-footer .cta-luxury');
    const originalText = btn ? btn.innerText : 'Zur Kasse';
    if (btn) {
        btn.innerText = 'Verarbeite...';
        btn.disabled = true;
    }

    setTimeout(() => {
        alert('Vielen Dank für Ihre Bestellung! Wir leiten Sie nun zur sicheren Zahlung weiter (Stripe-Simulation).');
        cart = [];
        updateCartUI();
        toggleCart();
        if (btn) {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    }, 1500);
};

// --- Product Data & Rendering ---
const container = document.getElementById('product-container');

async function renderProducts() {
    if (!container) return;
    
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        window.allProducts = products; // Global für Add-to-Cart speichern
        
        const activeProducts = products.filter(p => p.active === 1 || p.active === true);
        
        if (activeProducts.length === 0) {
            container.innerHTML = `<p style="text-align: center; grid-column: 1/-1; color: var(--gray); padding: 100px 0;">Momentan sind keine Produkte in dieser Kategorie verfügbar.</p>`;
            return;
        }
        
        container.innerHTML = activeProducts.map(p => `
            <div class="product-item">
                <div class="product-image-container">
                    <img src="${p.image_url}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/400x500?text=Bild+nicht+gefunden'">
                    <div class="add-overlay" onclick="addToCart(${p.id})">In den Warenkorb</div>
                </div>
                <div class="product-details">
                    <div class="product-info">
                        <p>${p.category}</p>
                        <h3>${p.title}</h3>
                    </div>
                    <div class="product-price">${formatCurrency(p.price)}</div>
                </div>
            </div>
        `).join('');

        // Reveal Animation Setup
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

    } catch (err) {
        console.error("Fehler beim Laden der Produkte:", err);
        container.innerHTML = `<p style="text-align: center; grid-column: 1/-1; color: var(--gray); padding: 100px 0;">Verbindung zum Server fehlgeschlagen.</p>`;
    }
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartUI();
});
