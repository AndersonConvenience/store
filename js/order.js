import { db, collection, getDocs } from "./firebase-config.js";

document.addEventListener('DOMContentLoaded', async () => {
  // Load menu items from Firestore
  const menuRef = collection(db, 'menu');
  const snapshot = await getDocs(menuRef);
  const menuData = [];
  const itemSelect = document.getElementById('item');
  itemSelect.innerHTML = '<option value="">-- Choose an item --</option>';

  // Group items by category
  const categories = {};

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.available) {
      menuData.push(data);
      if (!categories[data.category]) {
        categories[data.category] = [];
      }
      categories[data.category].push(data);
    }
  });

  // Create optgroups with options
  for (const category in categories) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = category;

    categories[category].forEach(item => {
      const option = document.createElement('option');
      option.value = item.name;
      option.textContent = `${item.name} - $${item.price.toFixed(2)}`;
      optgroup.appendChild(option);
    });

    itemSelect.appendChild(optgroup);
  }

  // Store locally for quick access
  localStorage.setItem('menuData', JSON.stringify(menuData));

  // Other DOM elements
  const form = document.getElementById('orderForm');
  const quantityInput = document.getElementById('quantity');
  const toppingsSection = document.getElementById('toppingsSection');
  const burgerToppings = document.querySelectorAll('.topping');
  const everythingToppings = document.getElementById('everythingToppings');
  const pizzaOptions = document.getElementById('pizzaOptions');
  const pizzaEverything = document.getElementById('pizzaEverything');
  const pizzaToppings = document.querySelectorAll('.pizza-topping');

  // Show/hide toppings based on selected item
  itemSelect.addEventListener('change', () => {
    const burgerItems = ["Crispy Chicken Sandwich", "Spicy Chicken Sandwich", "Ham Burger"];
    // Pizza items by name for this example
    const pizzaItems = ["Personal Pizza", "Medium Pizza", "Large Pizza"];
    const isBurger = burgerItems.includes(itemSelect.value);
    const isPizza = pizzaItems.includes(itemSelect.value);

    toppingsSection.style.display = isBurger ? 'block' : 'none';
    pizzaOptions.style.display = isPizza ? 'block' : 'none';

    if (!isBurger) everythingToppings.checked = false;
    if (!isPizza) {
      pizzaEverything.checked = false;
      pizzaToppings.forEach(t => t.checked = false);
    }
  });

  everythingToppings.addEventListener('change', () => {
    burgerToppings.forEach(cb => cb.checked = everythingToppings.checked);
  });

  pizzaEverything.addEventListener('change', () => {
    pizzaToppings.forEach(cb => cb.checked = pizzaEverything.checked);
  });

  // Form submit event: only update localStorage
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const item = itemSelect.value;
    const quantity = parseInt(quantityInput.value);
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const selectedPizzaToppings = [...document.querySelectorAll('.pizza-topping:checked')];
    const burgerToppingsChecked = [...document.querySelectorAll('.topping:checked')];
    const request = document.getElementById('request').value.trim();

    if (!item || !quantity || !name || !phone) {
      alert('Please fill in all required fields.');
      return;
    }

    let itemDescription = item;
    let price = 0;

    // Pizza size determined by selected pizza item name
    if (["Personal Pizza", "Medium Pizza", "Large Pizza"].includes(item)) {
      let pizzaSize = "";
      if (item === "Personal Pizza") pizzaSize = "Small";
      else if (item === "Medium Pizza") pizzaSize = "Medium";
      else if (item === "Large Pizza") pizzaSize = "Large";

      // Find pizza base price from menuData
      const pizzaData = menuData.find(i => i.name === item);
      if (!pizzaData) {
        alert(`Price for ${item} not found. Please reload.`);
        return;
      }

      const basePrice = pizzaData.price;
      const toppingCount = selectedPizzaToppings.length;

      if (pizzaSize === "Small") {
        price = basePrice + (0.50 * toppingCount);
      } else {
        // Medium and Large pizzas
        price = basePrice + (1.00 * toppingCount);
      }

      itemDescription = `Pizza (${pizzaSize})`;
    } else {
      // Other items price from menuData
      const found = menuData.find(i => i.name === item);
      if (!found) {
        alert('Item price not found. Try reloading the page.');
        return;
      }
      price = found.price;
    }

    const burgerToppingsValues = burgerToppingsChecked.map(cb => cb.value);
    const pizzaToppingsValues = selectedPizzaToppings.map(cb => cb.value);

    // Update cart in localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(i =>
      i.name === itemDescription &&
      JSON.stringify(i.toppings) === JSON.stringify(item === "Personal Pizza" || item === "Medium Pizza" || item === "Large Pizza" ? pizzaToppingsValues : burgerToppingsValues)
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        name: itemDescription,
        quantity,
        price: parseFloat(price.toFixed(2)),
        toppings: item === "Personal Pizza" || item === "Medium Pizza" || item === "Large Pizza" ? pizzaToppingsValues : burgerToppingsValues,
        pizzaSize: itemDescription.startsWith("Pizza") ? itemDescription.match(/\(([^)]+)\)/)[1] : null,
        request,
        nameInput: name,
        phoneInput: phone
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    alert(`${quantity} x ${itemDescription} added to cart.`);
    window.location.href = 'cart.html';
  });

  // Product preview logic (optional)
  const productPreview = document.getElementById('productPreview');
  const previewItems = document.querySelectorAll('.preview-item');

  itemSelect.addEventListener('change', function () {
    previewItems.forEach(el => el.classList.remove('active'));
    const selectedValue = this.value.trim().replace(/\s+/g, '-');
    const targetItem = document.getElementById(`preview-${selectedValue}`);
    if (targetItem) {
      productPreview.classList.add('active');
      targetItem.classList.add('active');
    } else {
      productPreview.classList.remove('active');
    }
  });
});
