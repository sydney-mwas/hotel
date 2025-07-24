let cart = [];

function addToCart(productId, productName, price) {
    const item = { id: productId, name: productName, price: price, quantity: 1 };
    cart.push(item);
    updateCartCount();
}

function updateCartCount() {
    document.getElementById('cart-count').textContent = cart.length;
}// cart.js - Responsive Shopping Cart Functionality
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const cartItemsEl = document.getElementById('cartItems');
    const emptyCartEl = document.getElementById('emptyCart');
    const cartSummaryEl = document.getElementById('cartSummary');
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const totalEl = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const mobileCartToggle = document.getElementById('mobileCartToggle');

    // Cart state
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Initialize cart
    initCart();

    // Initialize the cart
    function initCart() {
        renderCart();
        setupEventListeners();
        setupResponsiveFeatures();
    }

    // Render cart items
    function renderCart() {
        // Clear existing items
        const existingItems = document.querySelectorAll('.cart-item');
        existingItems.forEach(item => item.remove());

        if (cart.length === 0) {
            emptyCartEl.style.display = 'block';
            cartSummaryEl.style.display = 'none';
            if (mobileCartToggle) mobileCartToggle.style.display = 'none';
            return;
        }

        emptyCartEl.style.display = 'none';
        cartSummaryEl.style.display = 'block';
        if (mobileCartToggle) mobileCartToggle.style.display = 'flex';

        // Add each item to the cart
        cart.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="item-image" loading="lazy">
                <div class="item-details">
                    <div class="item-title">${item.name}</div>
                    <div class="item-price">$${item.price.toFixed(2)}</div>
                    <div class="quantity-control">
                        <button class="quantity-btn minus" data-id="${item.id}" aria-label="Decrease quantity">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}" aria-label="Quantity">
                        <button class="quantity-btn plus" data-id="${item.id}" aria-label="Increase quantity">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <button class="remove-btn" data-id="${item.id}" aria-label="Remove item">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            cartItemsEl.insertBefore(itemEl, emptyCartEl);
        });

        updateTotals();
    }

    // Update cart totals
    function updateTotals() {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = calculateShipping(subtotal);
        const total = subtotal + shipping;

        subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        shippingEl.textContent = `$${shipping.toFixed(2)}`;
        totalEl.textContent = `$${total.toFixed(2)}`;

        // Update localStorage
        localStorage.setItem('cart', JSON.stringify(cart));

        // Dispatch event for other components to listen to
        document.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: { cart, subtotal, shipping, total }
        }));
    }

    // Calculate shipping based on subtotal
    function calculateShipping(subtotal) {
        if (subtotal === 0) return 0;
        if (subtotal > 100) return 0; // Free shipping over $100
        return 5.00; // Flat rate shipping
    }

    // Event listeners setup
    function setupEventListeners() {
        // Quantity controls
        cartItemsEl.addEventListener('click', handleCartActions);
        
        // Quantity input changes
        cartItemsEl.addEventListener('change', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                const id = parseInt(e.target.getAttribute('data-id'));
                const quantity = parseInt(e.target.value);
                const item = cart.find(item => item.id === id);
                
                if (quantity >= 1) {
                    item.quantity = quantity;
                    updateTotals();
                } else {
                    e.target.value = item.quantity;
                }
            }
        });

        // Checkout button
        checkoutBtn.addEventListener('click', handleCheckout);

        // Mobile cart toggle (if exists)
        if (mobileCartToggle) {
            mobileCartToggle.addEventListener('click', () => {
                cartSummaryEl.classList.toggle('mobile-visible');
            });
        }

        // Window resize for responsive adjustments
        window.addEventListener('resize', debounce(handleResponsiveAdjustments, 100));
    }

    // Handle all cart actions
    function handleCartActions(e) {
        // Minus button
        if (e.target.classList.contains('minus') || e.target.closest('.minus')) {
            const btn = e.target.classList.contains('minus') ? e.target : e.target.closest('.minus');
            const id = parseInt(btn.getAttribute('data-id'));
            const item = cart.find(item => item.id === id);
            if (item.quantity > 1) {
                item.quantity--;
                renderCart();
            }
        } 
        // Plus button
        else if (e.target.classList.contains('plus') || e.target.closest('.plus')) {
            const btn = e.target.classList.contains('plus') ? e.target : e.target.closest('.plus');
            const id = parseInt(btn.getAttribute('data-id'));
            const item = cart.find(item => item.id === id);
            item.quantity++;
            renderCart();
        } 
        // Remove button
        else if (e.target.classList.contains('remove-btn') || e.target.closest('.remove-btn')) {
            const btn = e.target.classList.contains('remove-btn') ? e.target : e.target.closest('.remove-btn');
            const id = parseInt(btn.getAttribute('data-id'));
            cart = cart.filter(item => item.id !== id);
            renderCart();
        }
    }

    // Handle checkout process
    function handleCheckout() {
        if (cart.length === 0) {
            showToast('Your cart is empty!', 'error');
            return;
        }

        // In a real app, this would redirect to checkout page
        showToast('Proceeding to checkout!', 'success');
        console.log('Checkout data:', {
            items: cart,
            subtotal: subtotalEl.textContent,
            shipping: shippingEl.textContent,
            total: totalEl.textContent
        });
    }

    // Responsive adjustments
    function handleResponsiveAdjustments() {
        if (window.innerWidth < 768) {
            // Mobile-specific adjustments
            document.querySelectorAll('.cart-item').forEach(item => {
                item.style.flexDirection = 'column';
                item.querySelector('.item-image').style.marginRight = '0';
                item.querySelector('.item-image').style.marginBottom = '10px';
            });
        } else {
            // Desktop adjustments
            document.querySelectorAll('.cart-item').forEach(item => {
                item.style.flexDirection = 'row';
                item.querySelector('.item-image').style.marginRight = '20px';
                item.querySelector('.item-image').style.marginBottom = '0';
            });
        }
    }

    // Setup responsive features
    function setupResponsiveFeatures() {
        handleResponsiveAdjustments();
        
        // Lazy loading for images
        if ('loading' in HTMLImageElement.prototype) {
            document.querySelectorAll('.item-image').forEach(img => {
                img.loading = 'lazy';
            });
        }
    }

    // Helper function to debounce resize events
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }

    // Show toast notification
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Public API for other scripts to interact with the cart
    window.cartManager = {
        addItem: function(item) {
            const existingItem = cart.find(i => i.id === item.id);
            if (existingItem) {
                existingItem.quantity += item.quantity || 1;
            } else {
                cart.push({
                    ...item,
                    quantity: item.quantity || 1
                });
            }
            renderCart();
        },
        removeItem: function(id) {
            cart = cart.filter(item => item.id !== id);
            renderCart();
        },
        getCart: function() {
            return [...cart];
        },
        getTotal: function() {
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const shipping = calculateShipping(subtotal);
            return subtotal + shipping;
        },
        clearCart: function() {
            cart = [];
            renderCart();
        }
    };
});