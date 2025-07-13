
    // DOM Content Loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize tooltips
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });

        // Price Range Slider
        const priceRange = document.getElementById('priceRange');
        const priceDisplay = document.querySelector('.price-display');
        
        if (priceRange) {
            priceRange.addEventListener('input', function() {
                document.getElementById('minPrice').textContent = this.value;
            });
        }

        // Size Selection
        const sizeButtons = document.querySelectorAll('.btn-check[name="size"]');
        sizeButtons.forEach(button => {
            button.addEventListener('change', function() {
                filterProducts();
            });
        });

        // Category Checkboxes
        const categoryCheckboxes = document.querySelectorAll('.form-check-input[type="checkbox"]');
        categoryCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', filterProducts);
        });

        // Apply Filters Button
        const applyFiltersBtn = document.querySelector('.btn-warning.w-100');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', filterProducts);
        }

        // Reset Filters Button
        const resetFiltersBtn = document.querySelector('.btn-link.w-100');
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', resetFilters);
        }

        // Sort Dropdown
        const sortDropdownItems = document.querySelectorAll('.dropdown-item');
        sortDropdownItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const sortText = this.textContent;
                document.getElementById('sortDropdown').textContent = `Sort by: ${sortText}`;
                sortProducts(sortText);
            });
        });

        // Add to Cart Buttons
        const addToCartButtons = document.querySelectorAll('.btn-dark.w-100');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const productCard = this.closest('.product-card');
                const productName = productCard.querySelector('.card-title').textContent;
                const productPrice = productCard.querySelector('.price').textContent;
                
                addToCart(productName, productPrice);
                
                // Show success notification
                showToast(`${productName} added to cart!`);
            });
        });

        // Product Filtering Function
        function filterProducts() {
            const selectedSize = document.querySelector('.btn-check[name="size"]:checked')?.id;
            const selectedCategories = Array.from(document.querySelectorAll('.form-check-input[type="checkbox"]:checked'))
                                          .map(cb => cb.id);
            const maxPrice = parseInt(document.getElementById('priceRange')?.value) || 200;

            document.querySelectorAll('.product-card').forEach(card => {
                const cardSize = card.dataset.sizes.split(' ');
                const cardCategory = card.dataset.category;
                const cardPrice = parseFloat(card.dataset.price);

                const sizeMatch = !selectedSize || cardSize.includes(selectedSize.split('-')[1]);
                const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(cardCategory);
                const priceMatch = cardPrice <= maxPrice;

                if (sizeMatch && categoryMatch && priceMatch) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        // Reset Filters Function
        function resetFilters() {
            // Uncheck all checkboxes
            document.querySelectorAll('.form-check-input[type="checkbox"]').forEach(cb => {
                cb.checked = false;
            });
            
            // Reset size selection
            document.getElementById('size-m').checked = true;
            
            // Reset price range
            if (priceRange) {
                priceRange.value = 200;
                document.getElementById('minPrice').textContent = '200';
            }
            
            // Show all products
            document.querySelectorAll('.product-card').forEach(card => {
                card.style.display = 'block';
            });
        }

        // Sort Products Function
        function sortProducts(sortMethod) {
            const productContainer = document.querySelector('.row');
            const products = Array.from(document.querySelectorAll('.product-card'));
            
            products.sort((a, b) => {
                const priceA = parseFloat(a.dataset.price);
                const priceB = parseFloat(b.dataset.price);
                const dateA = new Date(a.dataset.dateAdded);
                const dateB = new Date(b.dataset.dateAdded);
                
                switch(sortMethod) {
                    case 'Price: Low to High':
                        return priceA - priceB;
                    case 'Price: High to Low':
                        return priceB - priceA;
                    case 'Newest Arrivals':
                        return dateB - dateA;
                    default: // Featured
                        return a.dataset.featured === 'true' ? -1 : 1;
                }
            });
            
            // Reattach sorted products
            products.forEach(product => {
                productContainer.appendChild(product.parentElement);
            });
        }

        // Add to Cart Function
        function addToCart(name, price) {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            
            // Check if product already in cart
            const existingItem = cart.find(item => item.name === name);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    name: name,
                    price: price,
                    quantity: 1
                });
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
        }

        // Update Cart Count in Navbar
        function updateCartCount() {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            
            // Update cart count in navbar
            const cartCount = document.querySelector('.nav-link .cart-count');
            if (cartCount) {
                cartCount.textContent = totalItems;
            } else {
                // Create cart count if it doesn't exist
                const cartLink = document.querySelector('.nav-link[href="#"]:last-child');
                if (cartLink) {
                    const countBadge = document.createElement('span');
                    countBadge.className = 'cart-count badge bg-warning rounded-pill ms-1';
                    countBadge.textContent = totalItems;
                    cartLink.appendChild(countBadge);
                }
            }
        }

        // Show Toast Notification
        function showToast(message) {
            const toastContainer = document.getElementById('toastContainer');
            if (!toastContainer) {
                createToastContainer();
            }
            
            const toastEl = document.createElement('div');
            toastEl.className = 'toast show align-items-center text-white bg-success';
            toastEl.setAttribute('role', 'alert');
            toastEl.setAttribute('aria-live', 'assertive');
            toastEl.setAttribute('aria-atomic', 'true');
            toastEl.style.position = 'fixed';
            toastEl.style.bottom = '20px';
            toastEl.style.right = '20px';
            toastEl.style.zIndex = '1100';
            
            toastEl.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            `;
            
            document.getElementById('toastContainer').appendChild(toastEl);
            
            // Auto remove after 3 seconds
            setTimeout(() => {
                toastEl.classList.remove('show');
                setTimeout(() => toastEl.remove(), 300);
            }, 3000);
        }

        // Create Toast Container if it doesn't exist
        function createToastContainer() {
            const container = document.createElement('div');
            container.id = 'toastContainer';
            container.style.position = 'fixed';
            container.style.bottom = '20px';
            container.style.right = '20px';
            container.style.zIndex = '1100';
            document.body.appendChild(container);
        }

        // Initialize cart count on page load
        updateCartCount();

        // Add data attributes to product cards (this would normally come from your backend)
        document.querySelectorAll('.product-card').forEach((card, index) => {
            // These values would normally come from your database
            const prices = [24.99, 39.99, 59.99];
            const categories = ['tops-tShirts', 'tops-shirts', 'tops-sweaters'];
            const sizes = ['xs s m l xl', 's m l xl', 'm l xl'];
            
            card.dataset.price = prices[index] || 0;
            card.dataset.category = categories[index] || '';
            card.dataset.sizes = sizes[index] || '';
            card.dataset.dateAdded = new Date().toISOString();
            card.dataset.featured = index === 0 ? 'true' : 'false';
        });
    });

    // Price Range Filter Implementation
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const priceRange = document.getElementById('priceRange');
    const minPriceDisplay = document.getElementById('minPrice');
    const maxPriceDisplay = document.getElementById('maxPrice');
    const priceDisplay = document.querySelector('.price-display');
    
    // Initialize values
    const minValue = 0;
    const maxValue = parseInt(priceRange.max) || 200;
    let currentValue = parseInt(priceRange.value) || maxValue;
    
    // Update display elements
    if (minPriceDisplay) minPriceDisplay.textContent = minValue;
    if (maxPriceDisplay) maxPriceDisplay.textContent = maxValue;
    
    // Create dynamic price display if it doesn't exist
    if (!priceDisplay && priceRange) {
        const priceDisplay = document.createElement('div');
        priceDisplay.className = 'price-display mt-2 mb-3 text-center';
        priceDisplay.innerHTML = `
            <span class="fw-bold">$${minValue}</span>
            <input type="range" class="form-range" min="${minValue}" max="${maxValue}" 
                   value="${currentValue}" id="priceRange">
            <span class="fw-bold">$${maxValue}</span>
            <div class="mt-2">
                Selected: <span class="badge bg-warning text-dark">Up to $${currentValue}</span>
            </div>
        `;
        priceRange.parentNode.insertBefore(priceDisplay, priceRange.nextSibling);
    }
    
    // Update display when range changes
    if (priceRange) {
        priceRange.addEventListener('input', function() {
            currentValue = parseInt(this.value);
            
            // Update visual displays
            if (priceDisplay) {
                priceDisplay.querySelector('.badge').textContent = `Up to $${currentValue}`;
            }
            
            // Visual feedback - change color as value increases
            const percent = (currentValue / maxValue) * 100;
            this.style.background = `
                linear-gradient(to right, 
                #ffc107 0%, 
                #ffc107 ${percent}%, 
                #dee2e6 ${percent}%, 
                #dee2e6 100%)
            `;
            
            // Optional: Filter products in real-time
            filterProductsByPrice(currentValue);
        });
        
        // Initialize the slider color
        priceRange.style.background = `
            linear-gradient(to right, 
            #ffc107 0%, 
            #ffc107 ${(currentValue / maxValue) * 100}%, 
            #dee2e6 ${(currentValue / maxValue) * 100}%, 
            #dee2e6 100%)
        `;
    }
    
    // Product filtering function
    function filterProductsByPrice(maxPrice) {
        document.querySelectorAll('.product-card').forEach(card => {
            const cardPrice = parseFloat(card.dataset.price) || 0;
            if (cardPrice <= maxPrice) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    // Connect with other filters (from previous implementation)
    function filterProducts() {
        const maxPrice = parseInt(priceRange.value) || maxValue;
        filterProductsByPrice(maxPrice);
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
