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
  productPreview.innerHTML = ''; // Clear existing
  menuData.forEach(item => {
    const previewItem = document.createElement('div');
    previewItem.classList.add('preview-item');
    previewItem.id = `preview-${item.name.trim().replace(/\s+/g, '-')}`;
    previewItem.style.display = 'none'; // Hide by default
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

  // Hide preview container initially
  productPreview.style.display = 'none';

  // Show or hide customer info fields depending on cart content (runs on page load)
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart.length === 0) {
    customerInfoFields.style.display = 'block';
  } else {
    customerInfoFields.style.display = 'none';
  }

  // Event: When item changes, show/hide toppings and preview
  itemSelect.addEventListener('change', () => {
    const burgerItems = ["Crispy Chicken Sandwich", "Spicy Chicken Sandwich", "Ham Burger"];
    const pizzaItems = ["Personal Pizza", "Medium Pizza", "Large Pizza"];
    const selectedItem = itemSelect.value;

    // Show/hide burger toppings
    const isBurger = burgerItems.includes(selectedItem);
    toppingsSection.style.display = isBurger ? 'block' : 'none';
    if (!isBurger) everythingToppings.checked = false;

    // Show/hide pizza options
    const isPizza = pizzaItems.includes(selectedItem);
    pizzaOptions.style.display = isPizza ? 'block' : 'none';
    if (!isPizza) {
      pizzaEverything.checked = false;
      pizzaToppings.forEach(cb => cb.checked = false);
    }

    // Show/hide product preview
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

  // Event: Everything toppings checkboxes toggle all individual toppings
  everythingToppings.addEventListener('change', () => {
    burgerToppings.forEach(cb => cb.checked = everythingToppings.checked);
  });

  pizzaEverything.addEventListener('change', () => {
    pizzaToppings.forEach(cb => cb.checked = pizzaEverything.checked);
  });


  // Form submit: validate and save order to localStorage cart
  form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Dynamically set required attribute based on visibility
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

  // Validate required fields based on current state
  if (!item || !quantity || (customerInfoFields.style.display !== 'none' && (!name || !phone))) {
    alert('Please fill in all required fields.');
    return;
  }

    const selectedPizzaToppings = [...document.querySelectorAll('.pizza-topping:checked')];
    const burgerToppingsChecked = [...document.querySelectorAll('.topping:checked')];

    // Determine price and description
    let itemDescription = item;
    let price = 0;

    // Load menuData from localStorage
    const storedMenuData = JSON.parse(localStorage.getItem('menuData')) || [];

    if (["Personal Pizza", "Medium Pizza", "Large Pizza"].includes(item)) {
      // Pizza price calculation
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
      // Other items
      const found = storedMenuData.find(i => i.name === item);
      if (!found) {
        alert('Item price not found. Try reloading the page.');
        return;
      }
      price = found.price;
    }

    const burgerToppingsValues = burgerToppingsChecked.map(cb => cb.value);
    const pizzaToppingsValues = selectedPizzaToppings.map(cb => cb.value);

    // Load existing cart or create new
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if same item with same toppings already exists to increment quantity
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
        phoneInput: phone
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    alert(`${quantity} x ${itemDescription} added to cart.`);
    window.location.href = 'cart.html';
  });

});
