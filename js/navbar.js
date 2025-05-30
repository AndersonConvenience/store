// Load navbar HTML dynamically
fetch('./partials/navbar.html')
  .then(response => {
    if (!response.ok) throw new Error("Failed to load navbar.html");
    return response.text();
  })
  .then(data => {
    document.getElementById('navbar-placeholder').innerHTML = data;

    // Re-run cart count update after navbar loads
    updateCartCount();
  })
  .catch(error => {
    console.error('Error loading navbar:', error);
  });

// Load cart from localStorage or initialize empty
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartCount() {
  const countSpan = document.querySelector('.cart-count');
  if (countSpan) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countSpan.textContent = totalItems;
  }
}

function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

// Attach event listeners after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();

  document.querySelectorAll('.menu-item .cart').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.menu-item');
      const name = item.dataset.name;
      const price = parseFloat(item.dataset.price);

      const confirmed = confirm(`Add "${name}" to your cart?`);
      if (confirmed) {
        addToCart(name, price);
        alert(`"${name}" added to cart.`);
      } else {
        alert(`"${name}" was not added.`);
      }
    });
  });
});


//Navbar
  function toggleMenu() {
    document.querySelector('.links').classList.toggle('show');
  }

