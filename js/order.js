import { db, collection, getDocs } from "./firebase-config.js";

document.addEventListener('DOMContentLoaded', async () => {
  // References to DOM elements
  const itemSelect = document.getElementById('item');
  const toppingsSection = document.getElementById('toppingsSection');
  const pizzaOptions = document.getElementById('pizzaOptions');
  const everythingToppings = document.getElementById('everythingToppings');
  const burgerToppings = document.querySelectorAll('.topping');
  const pizzaEverything = document.getElementById('pizzaEverything');
  const pizzaToppings = document.querySelectorAll('.pizza-topping');
  const form = document.getElementById('orderForm');
  const quantityInput = document.getElementById('quantity');
  const productPreview = document.getElementById('productPreview');
  const customerInfoFields = document.getElementById('customerInfoFields');

  // Load menu items from Firestore
  const menuRef = collection(db, 'menu');
  const snapshot = await getDocs(menuRef);
  const menuData = [];
  itemSelect.innerHTML = '<option value="">-- Choose an item --</option>';

  // Group items by category for select options
  const categories = {};

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.available) {
      menuData.push(data);
      if (!categories[data.category]) categories[data.category] = [];
      categories[data.category].push(data);
    }
  });

  // Create optgroups with options for itemSelect
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

  // Store menu data locally for quick access later
  localStorage.setItem('menuData', JSON.stringify(menuData));
  localStorage.setItem('categories', JSON.stringify(categories));

  // Helper function to get image URL based on item name
  function getImage(name) {
    const images = {
      "Crispy Chicken Sandwich": "./pics/crispy.jpg",
      "Spicy Chicken Sandwich": "./pics/spicy.jpg",
      "Ham Burger": "./pics/ham.jpg",
      "Personal Pizza": "./pics/pizza.jpg",
      "Cheese Sticks": "./pics/cheese-sticks.jpg",
      "Cheese Potatoes": "./pics/cheese-potatoes.jpg",
      "Potato Wadges": "./pics/potato-wages.jpg",
      "Fries": "./pics/fries.jpg",
      "Corn Dog": "./pics/corndog.jpg",
      "Shrimp Basket": "./pics/shrimp Basket.jpg",
      "Chicken Fingers": "./pics/fingers.jpg",
      "Spicy Chicken Bites": "./pics/Spicy Bites.jpg",
      "Chicken Nuggets": "./pics/nuggets.jpg"
    };
    return images[name] || "./pics/default.jpg";
  }

  // Generate product preview cards dynamically
  productPreview.innerHTML = '';
  menuData.forEach(item => {
    const previewItem = document.createElement('div');
    previewItem.classList.add('preview-item');
    previewItem.id = `preview-${item.name.trim().replace(/\s+/g, '-')}`;
    previewItem.style.display = 'none';
    previewItem.style.textAlign = 'center';
    previewItem.style.marginBottom = '1rem';

    const img = document.createElement('img');
    img.src = getImage(item.name);
    img.alt = item.name;

    const caption = document.createElement('p');
    const description = document.createElement('p');
    description.textContent = `${item.description}`;
    caption.textContent = `${item.name} - $${item.price.toFixed(2)}`;

    previewItem.appendChild(img);
    previewItem.appendChild(caption);
    previewItem.appendChild(description);
    productPreview.appendChild(previewItem);
  });

  productPreview.style.display = 'none';

  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart.length === 0) {
    customerInfoFields.style.display = 'block';
  } else {
    customerInfoFields.style.display = 'none';
  }

  // Time-based button disable logic
  const submitButton = form.querySelector('button[type="submit"]');
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinutes;
  const startTime = 8 * 60; // 8:00 AM
  const endTime = 20 * 60; // 8:00 PM

  if (currentTimeInMinutes < startTime || currentTimeInMinutes > endTime) {
    submitButton.disabled = true;
    submitButton.style.opacity = '0.5'; // Visually indicate it's disabled
    const timeMessage = document.createElement('p');
    timeMessage.className = 'alert-message';
    timeMessage.textContent = '⚠️ Orders can only be placed between 8 AM and 8 PM.';
    form.insertBefore(timeMessage, submitButton.parentElement);
  }

  itemSelect.addEventListener('change', () => {
    const burgerItems = ["Crispy Chicken Sandwich", "Spicy Chicken Sandwich", "Ham Burger"];
    const pizzaItems = ["Personal Pizza", "Medium Pizza", "Large Pizza"];
    const selectedItem = itemSelect.value;

    const isBurger = burgerItems.includes(selectedItem);
    toppingsSection.style.display = isBurger ? 'block' : 'none';
    if (!isBurger) everythingToppings.checked = false;

    const isPizza = pizzaItems.includes(selectedItem);
    pizzaOptions.style.display = isPizza ? 'block' : 'none';
    if (!isPizza) {
      pizzaEverything.checked = false;
      pizzaToppings.forEach(cb => cb.checked = false);
    }

    const previewId = `preview-${selectedItem.trim().replace(/\s+/g, '-')}`;
    document.querySelectorAll('.preview-item').forEach(el => el.style.display = 'none');
    if (selectedItem) {
      const targetPreview = document.getElementById(previewId);
      if (targetPreview) {
        productPreview.style.display = 'block';
        targetPreview.style.display = 'block';
      } else {
        productPreview.style.display = 'none';
      }
    } else {
      productPreview.style.display = 'none';
    }
  });

  everythingToppings.addEventListener('change', () => {
    burgerToppings.forEach(cb => cb.checked = everythingToppings.checked);
  });

  pizzaEverything.addEventListener('change', () => {
    pizzaToppings.forEach(cb => cb.checked = pizzaEverything.checked);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Check current time
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinutes;
    const startTime = 8 * 60; // 8:00 AM
    const endTime = 20 * 60; // 8:00 PM

    if (currentTimeInMinutes < startTime || currentTimeInMinutes > endTime) {
      alert('Orders can only be placed between 8 AM and 8 PM.');
      return;
    }

    if (customerInfoFields.style.display === 'none') {
      document.getElementById('name').required = false;
      document.getElementById('phone').required = false;
    } else {
      document.getElementById('name').required = true;
      document.getElementById('phone').required = true;
    }

    const item = itemSelect.value;
    const quantity = parseInt(quantityInput.value);
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const request = document.getElementById('request').value.trim();

    if (!item || !quantity || (customerInfoFields.style.display !== 'none' && (!name || !phone))) {
      alert('Please fill in all required fields.');
      return;
    }

    const selectedPizzaToppings = [...document.querySelectorAll('.pizza-topping:checked')];
    const burgerToppingsChecked = [...document.querySelectorAll('.topping:checked')];

    let itemDescription = item;
    let price = 0;

    const storedMenuData = JSON.parse(localStorage.getItem('menuData')) || [];
    const found = storedMenuData.find(i => i.name === item);
    const category = found ? found.category : "Unknown";

    if (["Personal Pizza", "Medium Pizza", "Large Pizza"].includes(item)) {
      let pizzaSize = "";
      if (item === "Personal Pizza") pizzaSize = "Small";
      else if (item === "Medium Pizza") pizzaSize = "Medium";
      else if (item === "Large Pizza") pizzaSize = "Large";

      const pizzaData = storedMenuData.find(i => i.name === item);
      if (!pizzaData) {
        alert(`Price for ${item} not found. Please reload.`);
        return;
      }
      const basePrice = pizzaData.price;
      const toppingCount = selectedPizzaToppings.length;

      price = pizzaSize === "Small" ? basePrice + (0.50 * toppingCount) : basePrice + (1.00 * toppingCount);
      itemDescription = `Pizza (${pizzaSize})`;
    } else {
      if (!found) {
        alert('Item price not found. Try reloading the page.');
        return;
      }
      price = found.price;
    }

    const burgerToppingsValues = burgerToppingsChecked.map(cb => cb.value);
    const pizzaToppingsValues = selectedPizzaToppings.map(cb => cb.value);

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(i =>
      i.name === itemDescription &&
      JSON.stringify(i.toppings) === JSON.stringify(
        ["Personal Pizza", "Medium Pizza", "Large Pizza"].includes(item) ? pizzaToppingsValues : burgerToppingsValues
      )
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        name: itemDescription,
        quantity,
        price: parseFloat(price.toFixed(2)),
        toppings: ["Personal Pizza", "Medium Pizza", "Large Pizza"].includes(item) ? pizzaToppingsValues : burgerToppingsValues,
        pizzaSize: itemDescription.startsWith("Pizza") ? itemDescription.match(/\(([^)]+)\)/)[1] : null,
        request,
        nameInput: name,
        phoneInput: phone,
        category
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    alert(`${quantity} x ${itemDescription} added to cart.`);
    window.location.href = 'cart.html';
  });
});