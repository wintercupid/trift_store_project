window.addEventListener("load", function () {
  console.log("page loaded");
  const spinner = this.document.getElementById("loading-spinner");
  spinner.style.opacity = "0";

  spinner.addEventListener("transitionend", () => {
    spinner.style.display = "none";
  });
});

setTimeout(() => {
  const spinner = document.getElementById("loading-spinner");
  if (spinner.style.display !== "none") {
    spinner.style.display = "none";
  }
}, 10000);

document.getElementById('shop-now-btn').addEventListener('click', function(e) {
  e.preventDefault();
  const target = document.getElementById('shop-categories');
  target.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
  });
});
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
document.getElementById('conatcts-btn').addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.getElementById('footer');
    target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
  });