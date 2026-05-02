// --- Scroll Effects ---
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// --- Product Data & Rendering ---
const products = [
    {
        id: 1,
        title: "L'Aurore Ring",
        category: "Signature Collection",
        price: "2.490 €",
        image: "images/gold_diamond_ring_luxury_1777729778737.png"
    },
    {
        id: 2,
        title: "Étoile Collier",
        category: "Fine Necklaces",
        price: "1.850 €",
        image: "images/gold_necklace_elegant_1777729798075.png"
    },
    {
        id: 3,
        title: "Océan Bracelet",
        category: "Timeless Wristwear",
        price: "3.200 €",
        image: "images/gold_bracelet_set_1777729811867.png"
    },
    {
        id: 4,
        title: "Lumière Hoops",
        category: "Earrings",
        price: "950 €",
        image: "images/gold_earrings_minimalist_1777729825390.png"
    }
];

const container = document.getElementById('product-container');

function renderProducts() {
    container.innerHTML = products.map(p => `
        <div class="product-item">
            <div class="product-image-container">
                <img src="${p.image}" alt="${p.title}">
                <div class="add-overlay">In den Warenkorb</div>
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
});
