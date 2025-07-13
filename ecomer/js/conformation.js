document.addEventListener('DOMContentLoaded', function() {
    // Load cart items
    loadCartItems();
    
    // Payment method selection
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', function() {
            document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
            this.classList.add('selected');
            document.querySelector(`#${this.id} input[type="radio"]`).checked = true;
        });
    });
    
    // Form validation and submission
    document.getElementById('placeOrderBtn').addEventListener('click', function() {
        if (validateForm()) {
            placeOrder();
        }
    });
    
    // Card number formatting
    document.getElementById('cardNumber').addEventListener('input', function(e) {
        this.value = this.value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    });
    
    // Expiry date formatting
    document.getElementById('expiryDate').addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
    });
});

function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const orderItems = document.getElementById('orderItems');
    let subtotal = 0;
    
    orderItems.innerHTML = '';
    
    if (cart.length === 0) {
        orderItems.innerHTML = '<p>Your cart is empty</p>';
        return;
    }
    
    cart.forEach(item => {
        const price = parseFloat(item.price.replace('$', ''));
        const total = price * item.quantity;
        subtotal += total;
        
        const itemElement = document.createElement('div');
        itemElement.className = 'order-summary-item';
        itemElement.innerHTML = `
            <div class="d-flex justify-content-between">
                <span>${item.name} × ${item.quantity}</span>
                <span>$${total.toFixed(2)}</span>
            </div>
        `;
        orderItems.appendChild(itemElement);
    });
    
    // Calculate totals
    const shipping = 5.99; // Flat rate shipping
    const taxRate = 0.08; // 8% tax
    const tax = subtotal * taxRate;
    const total = subtotal + shipping + tax;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

function validateForm() {
    const form = document.getElementById('shippingForm');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    // Additional payment validation if credit card selected
    if (document.getElementById('creditCard').checked) {
        const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;
        
        if (cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
            document.getElementById('cardNumber').classList.add('is-invalid');
            isValid = false;
        }
        
        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
            document.getElementById('expiryDate').classList.add('is-invalid');
            isValid = false;
        }
        
        if (cvv.length < 3 || !/^\d+$/.test(cvv)) {
            document.getElementById('cvv').classList.add('is-invalid');
            isValid = false;
        }
    }
    
    return isValid;
}

function placeOrder() {
    // In a real app, you would send this data to your server
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
            cardNumber: document.getElementById('creditCard').checked ? 
                       document.getElementById('cardNumber').value : null,
            expiry: document.getElementById('creditCard').checked ? 
                   document.getElementById('expiryDate').value : null,
            cvv: document.getElementById('creditCard').checked ? 
                 document.getElementById('cvv').value : null
        },
        items: JSON.parse(localStorage.getItem('cart'))
    };
    
    console.log('Order placed:', orderData); // For demo purposes
    
    // Show confirmation modal
    const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    confirmationModal.show();
    
    // Clear cart
    localStorage.removeItem('cart');
}
// Add this to your existing JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    // Empty Cart Functionality
    const emptyCartBtn = document.getElementById('emptyCartBtn');
    if (emptyCartBtn) {
        emptyCartBtn.addEventListener('click', function() {
            // Show confirmation modal/dialog
            if (confirm('Are you sure you want to empty your cart? This cannot be undone.')) {
                emptyCart();
            }
        });
    }
    
    // Function to empty cart
    function emptyCart() {
        localStorage.removeItem('cart');
        showToast('Your cart has been emptied');
        updateCartUI();
        
        // If on checkout page, redirect to home
        if (window.location.pathname.includes('checkout.html')) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    }
    
    // Update all cart-related UI
    function updateCartUI() {
        updateCartCount();
        updateCheckoutButton();
        
        // If on checkout page, update order summary
        if (document.getElementById('orderItems')) {
            loadCartItems();
        }
    }
    
    // Modify your existing onCartUpdate function
    function onCartUpdate() {
        updateCartUI();
        
        // Show/hide empty cart button based on cart contents
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const emptyCartBtn = document.getElementById('emptyCartBtn');
        if (emptyCartBtn) {
            if (cart.length > 0) {
                emptyCartBtn.style.display = 'inline-block';
            } else {
                emptyCartBtn.style.display = 'none';
            }
        }
    }
});