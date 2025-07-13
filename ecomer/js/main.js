// main.js - Comprehensive E-commerce Functionality

// ======================
// DOM Utility Functions
// ======================
const domReady = (callback) => {
    if (document.readyState !== 'loading') callback();
    else document.addEventListener('DOMContentLoaded', callback);
};

const createElement = (tag, attributes = {}, text = '') => {
    const el = document.createElement(tag);
    Object.keys(attributes).forEach(attr => el.setAttribute(attr, attributes[attr]));
    if (text) el.textContent = text;
    return el;
};

// ======================
// Cart Management
// ======================
const CartManager = {
    getCart: () => JSON.parse(localStorage.getItem('cart')) || [],
    
    saveCart: (cart) => localStorage.setItem('cart', JSON.stringify(cart)),
    
    addItem: (name, price) => {
        const cart = CartManager.getCart();
        const existingItem = cart.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, quantity: 1 });
        }
        
        CartManager.saveCart(cart);
        UI.showToast(`${name} added to cart!`);
        UI.updateCartUI();
    },
    
    removeItem: (name) => {
        const cart = CartManager.getCart().filter(item => item.name !== name);
        CartManager.saveCart(cart);
        UI.showToast(`Removed ${name} from cart`);
        UI.updateCartUI();
    },
    
    emptyCart: () => {
        localStorage.removeItem('cart');
        UI.showToast('Your cart has been emptied');
        UI.updateCartUI();
        
        if (window.location.pathname.includes('checkout.html')) {
            setTimeout(() => window.location.href = 'index.html', 1500);
        }
    },
    
    getTotalItems: () => {
        return CartManager.getCart().reduce((sum, item) => sum + item.quantity, 0);
    },
    
    getSubtotal: () => {
        return CartManager.getCart().reduce((sum, item) => {
            return sum + (parseFloat(item.price.replace('$', '')) * item.quantity);
        }, 0);
    }
};

// ======================
// User Interface
// ======================
const UI = {
    initTooltips: () => {
        const tooltips = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
            .map(el => new bootstrap.Tooltip(el));
    },
    
    showToast: (message, type = 'success') => {
        const types = {
            success: { bg: 'bg-success', icon: 'fa-check-circle' },
            error: { bg: 'bg-danger', icon: 'fa-exclamation-circle' },
            info: { bg: 'bg-info', icon: 'fa-info-circle' }
        };
        
        const toastContainer = document.getElementById('toastContainer') || UI.createToastContainer();
        const toast = createElement('div', {
            'class': `toast show align-items-center text-white ${types[type].bg}`,
            'role': 'alert',
            'aria-live': 'assertive',
            'aria-atomic': 'true'
        });
        
        toast.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1100;';
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas ${types[type].icon} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },
    
    createToastContainer: () => {
        const container = createElement('div', { id: 'toastContainer' });
        container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1100;';
        document.body.appendChild(container);
        return container;
    },
    
    updateCartCount: () => {
        const count = CartManager.getTotalItems();
        const cartCount = document.querySelector('.cart-count');
        const cartLinks = document.querySelectorAll('.nav-link .fa-shopping-cart');
        
        if (cartCount) {
            cartCount.textContent = count;
        } else if (count > 0 && cartLinks.length > 0) {
            cartLinks.forEach(link => {
                if (!link.nextElementSibling?.classList.contains('cart-count')) {
                    const badge = createElement('span', {
                        'class': 'cart-count badge bg-warning rounded-pill ms-1'
                    }, count);
                    link.parentNode.appendChild(badge);
                }
            });
        }
    },
    
    updateCheckoutButton: () => {
        const count = CartManager.getTotalItems();
        const checkoutBtn = document.getElementById('checkoutBtn');
        const mobileCheckoutBtn = document.getElementById('mobileCheckoutBtn');
        
        [checkoutBtn, mobileCheckoutBtn].forEach(btn => {
            if (btn) {
                if (count > 0) {
                    btn.classList.remove('disabled');
                    btn.querySelector('.badge')?.remove();
                    const badge = createElement('span', {
                        'class': 'badge bg-danger ms-2'
                    }, count);
                    btn.appendChild(badge);
                } else {
                    btn.classList.add('disabled');
                    btn.querySelector('.badge')?.remove();
                }
            }
        });
    },
    
    updateEmptyCartButton: () => {
        const emptyCartBtn = document.getElementById('emptyCartBtn');
        if (emptyCartBtn) {
            emptyCartBtn.style.display = CartManager.getTotalItems() > 0 ? 'block' : 'none';
        }
    },
    
    loadCartItems: () => {
        const orderItems = document.getElementById('orderItems');
        if (!orderItems) return;
        
        const cart = CartManager.getCart();
        orderItems.innerHTML = '';
        
        if (cart.length === 0) {
            orderItems.innerHTML = '<p class="text-muted">Your cart is empty</p>';
            return;
        }
        
        cart.forEach(item => {
            const price = parseFloat(item.price.replace('$', ''));
            const total = price * item.quantity;
            
            const itemEl = createElement('div', { 'class': 'order-summary-item' });
            itemEl.innerHTML = `
                <div class="d-flex justify-content-between">
                    <span>${item.name} × ${item.quantity}</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
            `;
            orderItems.appendChild(itemEl);
        });
        
        // Update totals
        const subtotal = CartManager.getSubtotal();
        const shipping = 5.99; // Flat rate
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + shipping + tax;
        
        document.getElementById('subtotal')?.textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('shipping')?.textContent = `$${shipping.toFixed(2)}`;
        document.getElementById('tax')?.textContent = `$${tax.toFixed(2)}`;
        document.getElementById('total')?.textContent = `$${total.toFixed(2)}`;
    },
    
    updateCartUI: () => {
        UI.updateCartCount();
        UI.updateCheckoutButton();
        UI.updateEmptyCartButton();
        UI.loadCartItems();
    },
    
    setupProductCards: () => {
        document.querySelectorAll('.product-card').forEach((card, index) => {
            // These would normally come from your backend
            const prices = [24.99, 39.99, 59.99];
            const categories = ['tops-tShirts', 'tops-shirts', 'tops-sweaters'];
            const sizes = ['xs s m l xl', 's m l xl', 'm l xl'];
            
            card.dataset.price = prices[index] || 0;
            card.dataset.category = categories[index] || '';
            card.dataset.sizes = sizes[index] || '';
            card.dataset.dateAdded = new Date().toISOString();
            card.dataset.featured = index === 0 ? 'true' : 'false';
            
            // Add to cart button
            const addBtn = card.querySelector('.add-to-cart');
            if (addBtn) {
                addBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const productName = card.querySelector('.card-title').textContent;
                    const productPrice = card.querySelector('.price').textContent;
                    CartManager.addItem(productName, productPrice);
                });
            }
        });
    },
    
    setupPriceRange: () => {
        const priceRange = document.getElementById('priceRange');
        if (!priceRange) return;
        
        const maxValue = parseInt(priceRange.max) || 200;
        let currentValue = parseInt(priceRange.value) || maxValue;
        
        priceRange.addEventListener('input', function() {
            currentValue = parseInt(this.value);
            const percent = (currentValue / maxValue) * 100;
            
            this.style.background = `
                linear-gradient(to right, 
                #ffc107 0%, 
                #ffc107 ${percent}%, 
                #dee2e6 ${percent}%, 
                #dee2e6 100%)
            `;
            
            // Filter products
            document.querySelectorAll('.product-card').forEach(card => {
                const cardPrice = parseFloat(card.dataset.price) || 0;
                card.style.display = cardPrice <= currentValue ? 'block' : 'none';
            });
        });
        
        // Initialize
        priceRange.style.background = `
            linear-gradient(to right, 
            #ffc107 0%, 
            #ffc107 ${(currentValue / maxValue) * 100}%, 
            #dee2e6 ${(currentValue / maxValue) * 100}%, 
            #dee2e6 100%)
        `;
    }
};

// ======================
// Page-Specific Setup
// ======================
const PageSetup = {
    initCategoryPage: () => {
        UI.setupProductCards();
        UI.setupPriceRange();
        
        // Empty cart button
        document.getElementById('emptyCartBtn')?.addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('emptyCartModal') || 
                document.createElement('div'));
            
            if (!document.getElementById('emptyCartModal')) {
                if (confirm('Are you sure you want to empty your cart?')) {
                    CartManager.emptyCart();
                }
            } else {
                modal.show();
            }
        });
        
        // Confirm empty cart
        document.getElementById('confirmEmptyCart')?.addEventListener('click', CartManager.emptyCart);
    },
    
    initCheckoutPage: () => {
        // Payment method selection
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', function() {
                document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
                this.classList.add('selected');
                document.querySelector(`#${this.id} input[type="radio"]`).checked = true;
            });
        });
        
        // Form validation
        document.getElementById('placeOrderBtn')?.addEventListener('click', function(e) {
            if (PageSetup.validateCheckoutForm()) {
                PageSetup.placeOrder();
            }
        });
        
        // Card formatting
        const cardNumber = document.getElementById('cardNumber');
        if (cardNumber) {
            cardNumber.addEventListener('input', function(e) {
                this.value = this.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
            });
        }
        
        // Expiry date formatting
        const expiryDate = document.getElementById('expiryDate');
        if (expiryDate) {
            expiryDate.addEventListener('input', function(e) {
                this.value = this.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
            });
        }
    },
    
    validateCheckoutForm: () => {
        let isValid = true;
        const form = document.getElementById('shippingForm');
        
        // Validate required fields
        form.querySelectorAll('[required]').forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });
        
        // Validate credit card if selected
        if (document.getElementById('creditCard')?.checked) {
            const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
            const expiryDate = document.getElementById('expiryDate').value;
            const cvv = document.getElementById('cvv').value;
            
            if (!/^\d{16}$/.test(cardNumber)) {
                document.getElementById('cardNumber').classList.add('is-invalid');
                isValid = false;
            }
            
            if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
                document.getElementById('expiryDate').classList.add('is-invalid');
                isValid = false;
            }
            
            if (!/^\d{3,4}$/.test(cvv)) {
                document.getElementById('cvv').classList.add('is-invalid');
                isValid = false;
            }
        }
        
        return isValid;
    },
    
    placeOrder: () => {
        const orderData = {
            shipping: {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                zip: document.getElementById('zip').value,
                country: document.getElementById('country').value,
                phone: document.getElementById('phone').value
            },
            payment: {
                method: document.querySelector('input[name="paymentMethod"]:checked').id,
                details: {}
            },
            items: CartManager.getCart(),
            total: document.getElementById('total').textContent
        };
        
        // In a real app, you would send this to your server
        console.log('Order placed:', orderData);
        
        // Show confirmation
        const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
        modal.show();
        
        // Clear cart
        CartManager.emptyCart();
    }
};

// ======================
// Initialization
// ======================
domReady(() => {
    UI.initTooltips();
    UI.updateCartUI();
    
    if (document.querySelector('.product-card')) {
        PageSetup.initCategoryPage();
    }
    
    if (document.getElementById('shippingForm')) {
        PageSetup.initCheckoutPage();
    }
    
    // Initialize empty cart modal if it exists
    document.getElementById('confirmEmptyCart')?.addEventListener('click', CartManager.emptyCart);
});