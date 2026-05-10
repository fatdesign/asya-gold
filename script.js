// --- Configuration ---
const API_URL = 'https://asya-gold.f-klavun.workers.dev/api';

// --- Header Scroll Effect ---
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (header && window.scrollY > 50) {
        header.classList.add('scrolled');
    } else if (header) {
        header.classList.remove('scrolled');
    }
});

// --- Luxury Scroll Reveal (IntersectionObserver) ---
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target); // Einmal triggern reicht
        }
    });
}, {
    threshold: 0.15, // Startet wenn 15% des Elements sichtbar ist
    rootMargin: '0px 0px -50px 0px' // Etwas früher auslösen
});

// Alle reveal-Elemente registrieren
document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    revealObserver.observe(el);
});

// --- Parallax Effekt auf Lifestyle Bild ---
const lifestyleImg = document.querySelector('.lifestyle-split-image img');
if (lifestyleImg) {
    window.addEventListener('scroll', () => {
        const rect = lifestyleImg.closest('.lifestyle-split-image').getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (inView) {
            const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
            const shift = (progress - 0.5) * 40; // Max 20px Verschiebung
            lifestyleImg.style.transform = `translateY(${shift}px) scale(1.05)`;
        }
    }, { passive: true });
}


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

const menuToggle = document.getElementById('menu-toggle');
const closeMobileMenu = document.getElementById('close-mobile-menu');
const mobileMenu = document.getElementById('mobile-menu');

function toggleMobileMenu() {
    mobileMenu.classList.toggle('active');
}

if (menuToggle) menuToggle.addEventListener('click', toggleMobileMenu);
if (closeMobileMenu) closeMobileMenu.addEventListener('click', toggleMobileMenu);

// --- Page Transition Logic ---
document.addEventListener('DOMContentLoaded', () => {
    // Reveal body after load
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);

    // Smooth Navigation (Intercept link clicks)
    document.querySelectorAll('a').forEach(link => {
        // Only internal links that don't open in new tab
        if (link.hostname === window.location.hostname && 
            !link.hash && 
            link.target !== '_blank' && 
            !link.href.includes('mailto:') && 
            !link.href.includes('tel:')) {
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.href;
                document.body.classList.add('page-exit');
                setTimeout(() => {
                    window.location.href = target;
                }, 800); // Wait for transition
            });
        }
    });

    // Ensure mobile menu closes on click
    document.querySelectorAll('.mobile-nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    });
});

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
window.startCheckout = async () => {
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

    try {
        // --- Lagerbestand in der Datenbank abziehen ---
        const response = await fetch(`${API_URL}/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: cart })
        });

        if (!response.ok) throw new Error("Checkout fehlgeschlagen");

        setTimeout(() => {
            alert('Vielen Dank für Ihre Bestellung! Der Lagerbestand wurde aktualisiert.');
            cart = [];
            updateCartUI();
            toggleCart();
            renderProducts(); // Produkte neu laden um neuen Bestand zu zeigen
            
            if (btn) {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        }, 1000);

    } catch (err) {
        alert("Fehler beim Checkout: " + err.message);
        if (btn) {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    }
};

// --- Product Data & Rendering ---
const container = document.getElementById('product-container');

async function renderProducts() {
    if (!container) return;
    
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        window.allProducts = products; // Global speichern
        
        const activeProducts = products.filter(p => p.active === 1 || p.active === true);
        renderProductList(activeProducts);

        renderFeaturedSlots();

        // --- Shop Filter Logik ---
        const filterLinks = document.querySelectorAll('.filter-link');
        if (filterLinks.length > 0) {
            filterLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    filterLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                    filterProducts(link.innerText);
                });
            });
        }
    } catch (err) {
        console.error("Fehler:", err);
        container.innerHTML = `<p style="text-align: center; grid-column: 1/-1; color: var(--gray); padding: 100px 0;">Verbindung zum Server fehlgeschlagen.</p>`;
    }
}

function renderProductList(productsToRender) {
    if (!container) return;
    if (productsToRender.length === 0) {
        container.innerHTML = `<p style="text-align: center; grid-column: 1/-1; color: var(--gray); padding: 100px 0;">Momentan keine Produkte verfügbar.</p>`;
        return;
    }

    container.innerHTML = productsToRender.map(p => {
        const isOutOfStock = p.stock <= 0;
        const isLowStock = p.stock > 0 && p.stock <= 3;
        return `
            <div class="product-item ${isOutOfStock ? 'out-of-stock' : ''}">
                <div class="product-image-container">
                    <img src="${p.image_url}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/400x500?text=Error'">
                    ${isOutOfStock ? 
                        '<div class="stock-badge out">Ausverkauft</div>' : 
                        `<div class="add-overlay" onclick="addToCart(${p.id})">In den Warenkorb</div>`
                    }
                    ${isLowStock ? `<div class="stock-badge low">Nur noch ${p.stock} verfügbar</div>` : ''}
                </div>
                <div class="product-details">
                    <div class="product-info">
                        <p>${p.category}</p>
                        <h3>${p.title}</h3>
                    </div>
                    <div class="product-price">${formatCurrency(p.price)}</div>
                </div>
            </div>
        `;
    }).join('');

    // Animationen neu triggern
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    container.querySelectorAll('.product-item').forEach(item => observer.observe(item));
}

function filterProducts(category) {
    const activeProducts = window.allProducts.filter(p => p.active === 1 || p.active === true);
    const filtered = (category === 'Alle') 
        ? activeProducts 
        : activeProducts.filter(p => p.category === category);
    renderProductList(filtered);
}

// --- Settings (Marquee) ---
async function fetchSettings() {
    const marqueeBar = document.querySelector('.marquee-bar');
    const marqueeContainer = document.getElementById('marquee-text');
    const header = document.getElementById('header');
    if (!marqueeContainer) return;

    try {
        const response = await fetch(`${API_URL}/settings`);
        const settings = await response.json();
        
        // AN/AUS Logik Marquee
        if (settings.marquee_active === 'false') {
            if (header) header.style.top = '0';
            // Padding Anpassung für Shop-Seite
            const main = document.querySelector('main');
            if (main && window.location.pathname.includes('/shop/')) {
                main.style.paddingTop = '100px';
            }
            if (marqueeBar) marqueeBar.style.display = 'none';
        } else {
            // Wenn aktiv: Einblenden und Text setzen
            if (marqueeBar) marqueeBar.style.display = 'flex';
            const text = settings.marquee_text || 'ASYA GOLD — FINE JEWELRY & ART';
            // Wir wiederholen den Text mehrfach für einen nahtlosen Übergang
            const items = Array(8).fill(`<span class="marquee-item">${text}</span>`).join('');
            marqueeContainer.innerHTML = items;
        }

        // --- Home Page Dynamisierung (Featured Sections) ---
        window.currentSettings = settings;
        if (window.allProducts) {
            renderFeaturedSlots();
        }
    } catch (err) {
        console.error("Fehler beim Laden der Einstellungen:", err);
    }
}

function renderFeaturedSlots() {
    const settings = window.currentSettings;
    const products = window.allProducts;
    if (!settings || !products) return;

    // Slot 1
    if (settings.featured_1_id) {
        const p1 = products.find(p => p.id == settings.featured_1_id);
        if (p1) {
            document.getElementById('featured-section-1').style.display = 'grid';
            document.getElementById('divider-1').style.display = 'block';
            document.getElementById('f1-image-container').innerHTML = `<img src="${p1.image_url}" alt="${p1.title}">`;
            document.getElementById('f1-category').innerText = p1.category;
            document.getElementById('f1-title').innerText = p1.title;
            document.getElementById('f1-text').innerText = settings.featured_1_text || '';
        }
    }

    // Slot 2
    if (settings.featured_2_id) {
        const p2 = products.find(p => p.id == settings.featured_2_id);
        if (p2) {
            document.getElementById('featured-section-2').style.display = 'grid';
            document.getElementById('divider-2').style.display = 'block';
            document.getElementById('f2-image-container').innerHTML = `<img src="${p2.image_url}" alt="${p2.title}">`;
            document.getElementById('f2-category').innerText = p2.category;
            document.getElementById('f2-title').innerText = p2.title;
            document.getElementById('f2-text').innerText = settings.featured_2_text || '';
        }
    }
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    // Body Reveal
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);

    // Smooth Page Transitions für interne Links
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        // Filter für interne Seiten (keine IDs, keine externen Protokolle)
        if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('tel:') && !href.startsWith('mailto:')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.body.classList.remove('loaded');
                setTimeout(() => {
                    window.location.href = href;
                }, 500);
            });
        }
    });

    fetchSettings();
    renderProducts();
    updateCartUI();
});
