   import { db, collection, getDoc, getDocs, updateDoc, doc, addDoc, deleteDoc, where, query, signOut, onAuthStateChanged, auth, onSnapshot, setDoc } from "./firebase-config.js";
   
   //Check if authorized login
    const userEmailSpan = document.getElementById("userEmail");
    onAuthStateChanged(auth, user => {
  if (!user) {
    // Not logged in, redirect to login page
    window.location.href = "login.html";
  } else {
    // User is logged in, proceed to show dashboard
     const emailName = user.email.split('@')[0];
      userEmailSpan.textContent = emailName;
    console.log("User is authenticated:", user.email);
  }
});

    //logout
      document.getElementById('logoutBtn').addEventListener('click', () => {
        signOut(auth).then(() => {
          // Successfully signed out from Firebase
          localStorage.removeItem('isAdminLoggedIn'); // clear your local flag
          window.location.href = 'login.html';        // redirect to login page
        }).catch((error) => {
          console.error('Error signing out:', error);
        });
      });
   //Sidebar
    const buttons = document.querySelectorAll('#sidebar button');
    const sections = document.querySelectorAll('.dashboard-section');

    buttons.forEach(button => {
      button.addEventListener('click', () => {
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const sectionId = button.getAttribute('data-section');
        sections.forEach(section => {
          section.classList.remove('active');
          if (section.id === sectionId) {
            section.classList.add('active');
          }
        });
      });
    });

    // newOrder.js
        // Get references to DOM elements
const ordersContainer = document.getElementById('ordersContainer');
const notificationSound = document.getElementById('notificationSound');
notificationSound.loop = true;

// Create alert overlay for new orders
const overlay = document.createElement('div');
overlay.id = 'orderAlertOverlay';
overlay.style.cssText = `
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  display: none;
  color:black;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;
const alertBox = document.createElement('div');
alertBox.id = 'orderAlertBox';
alertBox.style.cssText = `
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  text-align: center;
`;
overlay.appendChild(alertBox);
document.body.appendChild(overlay);

// Unlock sound playback on first user interaction
document.addEventListener('click', () => {
  notificationSound.play().then(() => {
    notificationSound.pause();
  }).catch(err => console.warn('Cannot autoplay sound:', err));
}, { once: true });

// Listen for new orders and update dashboard
function listenForOrders() {
  const ordersRef = collection(db, 'orders');

  onSnapshot(ordersRef, snapshot => {
    if (snapshot.empty) {
      ordersContainer.innerHTML = '<p>No orders currently.</p>';
      notificationSound.pause();
      notificationSound.currentTime = 0;
      return;
    }

    // Always display all active orders
    displayAllOrders(snapshot.docs);

    // If there’s a new order (added), show the alert
    snapshot.docChanges().forEach(change => {
      if (change.type === 'added') {
        const order = change.doc.data();
        const orderId = change.doc.id;

        if (notificationSound.paused) notificationSound.play().catch(() => {});
        showOrderNotification(order, orderId);
      }
    });
  });
}

// Show single new order alert
function showOrderNotification(order, orderId) {
  alertBox.innerHTML = `
    <p><strong>New Order!</strong></p>
    <p>Item: ${order.item || 'N/A'}</p>
    <button id="confirmBtn">OK</button>
  `;

  overlay.style.display = 'flex';

  // Use addEventListener for the confirm button
  const confirmBtn = document.getElementById('confirmBtn');
  confirmBtn.replaceWith(confirmBtn.cloneNode(true)); // remove old listeners
  document.getElementById('confirmBtn').addEventListener('click', () => {
    notificationSound.pause();
    notificationSound.currentTime = 0;
    overlay.style.display = 'none';
  });
}

// Display ALL orders in the dashboard
function displayAllOrders(orderDocs) {
  ordersContainer.innerHTML = ''; // Clear old orders

  orderDocs.forEach(docSnap => {
    const order = docSnap.data();
    const orderId = docSnap.id;

    const orderDiv = document.createElement('div');
    orderDiv.classList.add('order');
    orderDiv.innerHTML = `
      <h3>${order.item || 'Item not specified'}</h3>
      ${order.quantity != null ? `<p><strong>Quantity:</strong> ${order.quantity}</p>` : ''}
      ${order.price != null ? `<p><strong>Price:</strong> $${order.price.toFixed(2)}</p>` : ''}
      ${order.name ? `<p><strong>Name:</strong> ${order.name}</p>` : ''}
      ${order.phone ? `<p><strong>Phone:</strong> ${order.phone}</p>` : ''}
      ${order.pizzaSize ? `<p><strong>Pizza Size:</strong> ${order.pizzaSize}</p>` : ''}
      ${order.toppings && order.toppings.length > 0 ? `<p><strong>Toppings:</strong> ${order.toppings.join(', ')}</p>` : ''}
      ${order.request ? `<p><strong>Request:</strong> ${order.request}</p>` : ''}
      ${order.createdAt ? `<p><strong>Created:</strong> ${new Date(order.createdAt).toLocaleString()}</p>` : ''}
      <button data-id="${orderId}">Order Completed</button>
      <hr>
    `;
    ordersContainer.appendChild(orderDiv);

    // Handle "Order Completed" button
    orderDiv.querySelector('button[data-id]').addEventListener('click', async () => {
      if (confirm('Mark this order as completed and move to completedOrders?')) {
        try {
          await setDoc(doc(db, 'completedOrders', orderId), order);
          await deleteDoc(doc(db, 'orders', orderId));
          orderDiv.remove();
        } catch (error) {
          console.error('Error moving order to completedOrders:', error);
        }
      }
    });
  });
}

// Start listening for orders
listenForOrders();


  // js/gas-prices.js


async function loadGasPrices() {
  const docRef = doc(db, "gasPrices", "current");
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const prices = docSnap.data();

      // Map prices to your HTML price cards by data-type attribute
      const priceCards = document.querySelectorAll(".price-card");
      priceCards.forEach(card => {
        const type = card.getAttribute("data-type");
        let priceText = "";

        switch(type) {
          case "Regular":
            priceText = prices.regular ? `$${prices.regular.toFixed(3)}` : "N/A";
            break;
          case "Mid-Grade":
            priceText = prices.midGrade ? `$${prices.midGrade.toFixed(3)}` : "N/A";
            break;
          case "Premium":
            priceText = prices.premium ? `$${prices.premium.toFixed(3)}` : "N/A";
            break;
          case "Diesel (Off-Road)":
            priceText = prices.dieselOffRoad ? `$${prices.dieselOffRoad.toFixed(3)}` : "N/A";
            break;
          case "Diesel (On-Road)":
            priceText = prices.dieselOnRoad ? `$${prices.dieselOnRoad.toFixed(3)}` : "N/A";
            break;
          default:
            priceText = "N/A";
        }

        // Update price paragraph text
        const priceElement = card.querySelector("p");
        if (priceElement) priceElement.textContent = priceText;
      });
    } else {
      console.error("No gas price document found!");
    }
  } catch (error) {
    console.error("Error fetching gas prices:", error);
  }
}

// Run on page load
window.addEventListener("DOMContentLoaded", loadGasPrices);
document.getElementById("updateFuelBtn").addEventListener("click", async () => {
  const fuelTypeInput = document.getElementById("fuelTypeInput").value.trim();
  const newPriceInput = document.getElementById("newFuelPriceInput").value.trim();
  const messageElement = document.getElementById("fuelMessage");

  if (!fuelTypeInput || !newPriceInput) {
    messageElement.style.display = "block";
    messageElement.textContent = "Please enter both fuel type and new price.";
    messageElement.style.color = "red";
    return;
  }

  // Map fuel type to Firestore field names
  const typeMap = {
    "Regular": "regular",
    "Mid-Grade": "midGrade",
    "Premium": "premium",
    "Diesel (Off-Road)": "dieselOffRoad",
    "Diesel (On-Road)": "dieselOnRoad"
  };

  const field = typeMap[fuelTypeInput];
  if (!field) {
    messageElement.style.display = "block";
    messageElement.textContent = "Invalid fuel type.";
    messageElement.style.color = "red";
    return;
  }

  // Parse price
  let price = parseFloat(newPriceInput.replace(/[^0-9.]/g, ""));
  if (isNaN(price) || price <= 0) {
    messageElement.style.display = "block";
    messageElement.textContent = "Invalid price entered.";
    messageElement.style.color = "red";
    return;
  }

  // Update Firestore
  try {
    const docRef = doc(db, "gasPrices", "current");
    await updateDoc(docRef, {
      [field]: price
    });

    // Reload prices on UI
    await loadGasPrices();

    messageElement.style.display = "block";
    messageElement.textContent = `Updated ${fuelTypeInput} price to $${price.toFixed(3)} successfully.`;
    messageElement.style.color = "green";

    // Optionally clear inputs
    document.getElementById("fuelTypeInput").value = "";
    document.getElementById("newFuelPriceInput").value = "";
  } catch (error) {
    console.error("Error updating fuel price:", error);
    messageElement.style.display = "block";
    messageElement.textContent = "Error updating fuel price.";
    messageElement.style.color = "red";
  }
});

   

//Feed Section Js

const productInput = document.getElementById("productName");
const priceInput = document.getElementById("newPrice");
const updatePriceBtn = document.getElementById("updatePriceBtn");
const suggestionsBox = document.getElementById("suggestions");
const addFeedForm = document.getElementById("addFeedForm");
const deleteButton = document.getElementById("deleteFeedBtn"); // Updated selector for clarity

let feedData = [];

// Function to display messages for add feed form
function showAddFeedMessage(message, isError = false) {
  const messageEl = document.getElementById('addFeedMessage');
  messageEl.textContent = message;
  messageEl.style.color = isError ? 'red' : 'green';
  messageEl.style.display = 'block';
  // Hide message after 2 seconds
  setTimeout(() => {
    messageEl.style.display = 'none';
  }, 2000);
}

// Function to populate the price table
function updatePriceTable() {
  const tbody = document.querySelector('#priceTable tbody');
  tbody.innerHTML = ''; // Clear existing rows
  feedData.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.category}</td>
      <td>${item.quantity}</td>
      <td>${item.product}</td>
      <td>${item.price}</td>
    `;
    tbody.appendChild(row);
  });
}

// Fetch feed data from Firestore on load
async function fetchFeedData() {
  const querySnapshot = await getDocs(collection(db, "feedPrices"));
  feedData = [];
  querySnapshot.forEach(docSnap => {
    feedData.push({ id: docSnap.id, ...docSnap.data() });
  });
  updatePriceTable(); // Update table after fetching
}

fetchFeedData();

// Update price button click handler
updatePriceBtn.addEventListener("click", async () => {
  const productName = productInput.value.trim();
  let newPrice = priceInput.value.trim();

  if (!productName || !newPrice) {
    alert("Please enter both a product name and a new price.");
    return;
  }

  if (!/^\$?\d+(\.\d{1,2})?$/.test(newPrice)) {
    alert("Please enter a valid price (e.g., $25 or 25.00).");
    return;
  }

  if (!newPrice.startsWith("$")) {
    newPrice = "$" + newPrice;
  }

  const item = feedData.find(i => i.product.toLowerCase() === productName.toLowerCase());
  if (!item) {
    alert(`Product "${productName}" not found.`);
    return;
  }

  try {
    const docRef = doc(db, "feedPrices", item.id);
    await updateDoc(docRef, { price: newPrice });
    alert(`Price for "${productName}" updated to ${newPrice}.`);
    await fetchFeedData(); // Refresh local list and table
  } catch (error) {
    console.error("Error updating price:", error);
    alert("Failed to update price.");
  }

  productInput.value = "";
  priceInput.value = "";
  suggestionsBox.innerHTML = "";
});

// Autocomplete suggestions on product name input
productInput.addEventListener("input", () => {
  const query = productInput.value.toLowerCase().trim();
  suggestionsBox.innerHTML = "";

  if (query.length === 0) return;

  const matches = feedData
    .filter(item => item.product.toLowerCase().includes(query))
    .slice(0, 5);

  matches.forEach(match => {
    const suggestion = document.createElement("div");
    suggestion.textContent = match.product;
    suggestion.classList.add("suggestion-item");
    suggestion.addEventListener("click", () => {
      productInput.value = match.product;
      suggestionsBox.innerHTML = "";
      priceInput.focus();
    });
    suggestionsBox.appendChild(suggestion);
  });
});

// Hide suggestions when clicking outside
document.addEventListener("click", e => {
  if (!suggestionsBox.contains(e.target) && e.target !== productInput) {
    suggestionsBox.innerHTML = "";
  }
});

// Add new feed items
addFeedForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const category = document.getElementById('newCategory').value.trim();
  const quantityStr = document.getElementById('newQuantity').value.trim();
  const product = document.getElementById('newProductName').value.trim();
  let price = document.getElementById('newProductPrice').value.trim();

  if (!category || !quantityStr || !product || !price) {
    showAddFeedMessage("Please fill out all fields.", true);
    return;
  }

  const quantity = Number(quantityStr);
  if (isNaN(quantity) || quantity < 0) {
    showAddFeedMessage("Please enter a valid quantity.", true);
    return;
  }

  if (!/^\$?\d+(\.\d{1,2})?$/.test(price)) {
    showAddFeedMessage("Please enter a valid price (e.g., $25 or 25.00).", true);
    return;
  }

  if (!price.startsWith("$")) price = "$" + price;

  // Check for duplicate product name (case-insensitive)
  if (feedData.some(item => item.product.toLowerCase() === product.toLowerCase())) {
    showAddFeedMessage(`Product "${product}" already exists.`, true);
    return;
  }

  const newItem = {
    category,
    quantity,
    product,
    price,
    createdAt: new Date().toISOString()
  };

  try {
    await addDoc(collection(db, "feedPrices"), newItem);
    showAddFeedMessage(`Added "${product}" successfully!`, false);
    addFeedForm.reset();
    await fetchFeedData(); // Refresh local list and table
    // Reload page with #feed-price hash after 2 seconds to stay on the same section
    setTimeout(() => {
      window.location.href = window.location.pathname + '#feed-price';
    }, 2000);
  } catch (error) {
    console.error("Error adding feed item:", error);
    showAddFeedMessage("Error adding product.", true);
  }
});

// Feed delete section
deleteButton.addEventListener('click', async (e) => {
  e.preventDefault();

  const productName = document.getElementById('productName').value.trim();
  if (!productName) {
    showAddFeedMessage("Please enter a product name to delete.", true);
    return;
  }

  try {
    const feedRef = collection(db, "feedPrices");
    const querySnapshot = await getDocs(feedRef); // Get all documents
    const matchingDocs = querySnapshot.docs.filter(doc => 
      doc.data().product.toLowerCase() === productName.toLowerCase()
    );

    if (matchingDocs.length === 0) {
      showAddFeedMessage(`No product found with name "${productName}".`, true);
      return;
    }

    let deletedCount = 0;
    for (const docSnap of matchingDocs) {
      await deleteDoc(docSnap.ref);
      deletedCount++;
    }

    showAddFeedMessage(`Deleted ${deletedCount} product(s) named "${productName}".`, false);
    document.getElementById('productName').value = '';
    document.getElementById('newPrice').value = '';
    await fetchFeedData(); // Refresh local list and table
  } catch (error) {
    console.error("Error deleting product:", error);
    let message = "Error deleting product.";
    if (error.code === 'permission-denied') {
      message = "You don't have permission to delete this product.";
    } else if (error.code === 'unavailable') {
      message = "Network error. Please check your connection.";
    }
    showAddFeedMessage(message, true);
  }
});



//Deli section Js
    document.addEventListener('DOMContentLoaded', () => {
      const menuCol = collection(db, 'menu');
      const menuTableBody = document.querySelector('#menuTable tbody');
      const addItemForm = document.getElementById('addItemForm');
      const categoryOptions = ['Burger','Pizza','Snacks','Weekend Items'];

      // Fetch & render menu items
      async function loadMenu() {
        menuTableBody.innerHTML = '';
        const snapshot = await getDocs(menuCol);
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          const tr = document.createElement('tr');
          tr.dataset.id = docSnap.id;
          tr.innerHTML = `
            <td contenteditable="true" class="edit-name">${data.name}</td>
            <td contenteditable="true" class="edit-price">${data.price.toFixed(2)}</td>
            <td>
              <select class="edit-category">
                ${categoryOptions.map(cat => `
                  <option value="${cat}" ${data.category===cat? 'selected':''}>${cat}</option>
                `).join('')}
              </select>
            </td>
            <td contenteditable="true" class="edit-description">${data.description || ''}</td>
            <td><input type="checkbox" class="edit-available" ${data.available ? 'checked' : ''}></td>
            <td>
              <button class="update-btn" type="button">Save</button>
              <button class="delete-btn" type="button">Delete</button>
            </td>
          `;
          menuTableBody.appendChild(tr);
        });
        attachMenuListeners();
      }

      // Add new item with duplicate check
      addItemForm.addEventListener('submit', async e => {
        e.preventDefault();
        if (!addItemForm.checkValidity()) {
          addItemForm.reportValidity();
          return;
        }
        const name = document.getElementById('newName').value.trim();
        const price = parseFloat(document.getElementById('newPrice').value);
        const category = document.getElementById('newCategory').value;
        const description = document.getElementById('newDescription').value.trim();
        const available = document.getElementById('newAvailable').checked;

        // Check for existing item with same name
        const q = query(menuCol, where('name', '==', name));
        const existing = await getDocs(q);
        if (!existing.empty) {
          alert(`An item named "${name}" already exists.`);
          return;
        }

        try {
          await addDoc(menuCol, { name, price, category, description, available });
          addItemForm.reset();
          loadMenu();
        } catch (error) {
          console.error('Error adding item:', error);
          alert('Failed to add item.');
        }
      });

      // Attach update & delete listeners
      function attachMenuListeners() {
        document.querySelectorAll('.update-btn').forEach(btn => {
          btn.onclick = async () => {
            const row = btn.closest('tr');
            const id = row.dataset.id;
            const updated = {
              name: row.querySelector('.edit-name').textContent.trim(),
              price: parseFloat(row.querySelector('.edit-price').textContent),
              category: row.querySelector('.edit-category').value,
              description: row.querySelector('.edit-description').textContent.trim(),
              available: row.querySelector('.edit-available').checked
            };
            try {
              await updateDoc(doc(db, 'menu', id), updated);
              loadMenu();
            } catch (error) {
              console.error('Error updating item:', error);
              alert('Failed to save changes.');
            }
          };
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
          btn.onclick = async () => {
            const id = btn.closest('tr').dataset.id;
            if (confirm('Delete this menu item?')) {
              try {
                await deleteDoc(doc(db, 'menu', id));
                loadMenu();
              } catch (error) {
                console.error('Error deleting item:', error);
                alert('Failed to delete item.');
              }
            }
          };
        });
      }

      // Initial load
      loadMenu();
    });

    //Report jS
        
const monthSelect = document.getElementById('monthSelect');
const orderDateRangeEl = document.getElementById('orderDate');
const totalOrdersEl = document.getElementById('totalOrders');
const totalPriceEl = document.getElementById('totalPrice');
const monthlyOrdersList = document.getElementById('monthlyOrdersList');

// Utility to format date
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Populate dropdown with months found in completedOrders
async function loadAvailableMonths() {
  const ordersRef = collection(db, 'completedOrders');
  const snapshot = await getDocs(ordersRef);

  const monthSet = new Set();

  snapshot.forEach(docSnap => {
    const order = docSnap.data();
    if (order.createdAt) {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthSet.add(monthKey);
    }
  });

  const sortedMonths = Array.from(monthSet).sort().reverse();
  monthSelect.innerHTML = '<option value="">Select Month</option>' +
    sortedMonths.map(month => `<option value="${month}">${month}</option>`).join('');
}

// Load monthly report for selected month
async function loadMonthlyReport(month) {
  if (!month) return;

  const [year, monthNum] = month.split('-');
  const start = new Date(year, monthNum - 1, 1);
  const end = new Date(year, monthNum, 1);

  const ordersRef = collection(db, 'completedOrders');
  const snapshot = await getDocs(ordersRef);

  let totalOrders = 0;
  let taxAmount = 0;
  let totalPrice = 0;
  let ordersHTML = '';

  snapshot.forEach(docSnap => {
    const order = docSnap.data();
    if (order.createdAt) {
      const orderDate = new Date(order.createdAt);
      if (orderDate >= start && orderDate < end) {
        totalOrders++;
        if (order.price) totalPrice += order.price * order.quantity;

        ordersHTML += `
          <div class="order">
            <h4>${order.item || 'Item not specified'}</h4>
            <p><strong>Quantity:</strong> ${order.quantity || 'N/A'}</p>
            <p><strong>Price:</strong> $${order.price?.toFixed(2) || '0.00'}</p>
            <p><strong>Name:</strong> ${order.name || 'N/A'}</p>
            <p><strong>Created:</strong> ${orderDate.toLocaleString()}</p>
            <button data-id="${docSnap.id}" class="deleteOrderBtn">Delete</button>
            <hr>
          </div>
        `;
      }
    }
  });

  orderDateRangeEl.textContent = `${start.toLocaleDateString()} - ${new Date(end - 1).toLocaleDateString()}`;
  totalOrdersEl.textContent = totalOrders;
  totalPriceEl.textContent = totalPrice.toFixed(2);
  monthlyOrdersList.innerHTML = ordersHTML || '<p>No orders found for this month.</p>';

  attachDeleteListeners();
}

// Delete a specific order
function attachDeleteListeners() {
  const deleteButtons = document.querySelectorAll('.deleteOrderBtn');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      if (confirm('Delete this order?')) {
        try {
          await deleteDoc(doc(db, 'completedOrders', id));
          btn.parentElement.remove();
        } catch (error) {
          console.error('Error deleting order:', error);
        }
      }
    });
  });
}

// Event: month dropdown change
monthSelect.addEventListener('change', e => {
  const month = e.target.value;
  loadMonthlyReport(month);
});

// Initial load
loadAvailableMonths();