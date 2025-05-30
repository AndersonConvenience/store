   import { db, collection, getDoc, getDocs, updateDoc, doc, addDoc, deleteDoc, where, query, signOut, onAuthStateChanged, auth, onSnapshot } from "./firebase-config.js";
   
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

    //Food order.js
    // orders.js
    const ordersContainer = document.getElementById('ordersContainer');
const notificationSound = document.getElementById('notificationSound');
notificationSound.loop = true; // Loop the sound continuously

let currentOrderIds = new Set();

function listenForOrders() {
  const ordersRef = collection(db, 'orders');

  onSnapshot(ordersRef, snapshot => {
    const snapshotOrderIds = new Set();
    let ordersHTML = '';

    snapshot.forEach(docSnap => {
      const order = docSnap.data();
      const orderId = docSnap.id;
      snapshotOrderIds.add(orderId);
      currentOrderIds.add(orderId);

      let html = `<div class="order"><h3>${order.item || 'Item not specified'}</h3>`;
      if (order.quantity != null) html += `<p><strong>Quantity:</strong> ${order.quantity}</p>`;
      if (order.price != null) html += `<p><strong>Price:</strong> $${order.price.toFixed(2)}</p>`;
      if (order.name) html += `<p><strong>Name:</strong> ${order.name}</p>`;
      if (order.phone) html += `<p><strong>Phone:</strong> ${order.phone}</p>`;
      if (order.pizzaSize) html += `<p><strong>Pizza Size:</strong> ${order.pizzaSize}</p>`;
      if (order.toppings && order.toppings.length > 0) html += `<p><strong>Toppings:</strong> ${order.toppings.join(', ')}</p>`;
      if (order.request) html += `<p><strong>Request:</strong> ${order.request}</p>`;
      if (order.createdAt) html += `<p><strong>Created:</strong> ${new Date(order.createdAt).toLocaleString()}</p>`;

      html += `<button data-id="${orderId}">Order Completed</button><br><p>------------------------------------------------</p></div><br>`;

      ordersHTML += html;
    });

    ordersContainer.innerHTML = ordersHTML;
    attachDeleteListeners();

    // Handle sound logic:
    if (snapshot.size > 0) {
      if (notificationSound.paused) {
        notificationSound.play().catch(err => console.warn('Cannot autoplay sound:', err));
      }
    } else {
      // No active orders: stop and reset audio
      notificationSound.pause();
      notificationSound.currentTime = 0;
    }

    // Update tracked orders
    currentOrderIds = snapshotOrderIds;
  });
}

function attachDeleteListeners() {
  const buttons = document.querySelectorAll('button[data-id]');
  buttons.forEach(button => {
    button.addEventListener('click', async () => {
      const id = button.getAttribute('data-id');
      if (confirm('Mark this order as completed and remove from database?')) {
        try {
          await deleteDoc(doc(db, 'orders', id));
        } catch (error) {
          console.error('Error deleting order:', error);
        }
      }
    });
  });
}

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

   
   /*/ check if loggedin
    window.addEventListener("DOMContentLoaded", () => {
        const loggedIn = localStorage.getItem("isAdminLoggedIn");
        if (loggedIn !== "true") {
            window.location.href = ".//admin/login.html"; // redirect if not logged in
        }
    });

    //logout
    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("isAdminLoggedIn");
        window.location.href = "login.html";
        });
*/

//Feed Section Js

const productInput = document.getElementById("productName");
const priceInput = document.getElementById("newPrice");
const updatePriceBtn = document.getElementById("updatePriceBtn");
const suggestionsBox = document.getElementById("suggestions");

let feedData = [];

// Fetch feed data from Firestore on load
async function fetchFeedData() {
  const querySnapshot = await getDocs(collection(db, "feedPrices"));
  feedData = [];
  querySnapshot.forEach(docSnap => {
    feedData.push({ id: docSnap.id, ...docSnap.data() });
  });
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
    await fetchFeedData();
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
//Add new feed items

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
    fetchFeedData(); // Refresh local list
  } catch (error) {
    console.error("Error adding feed item:", error);
    showAddFeedMessage("Error adding product.", true);
  }
});

//feed delete section:


const deleteButton = document.querySelector('#updatePriceBtn + button[type="submit"]');

deleteButton.addEventListener('click', async (e) => {
  e.preventDefault();

  const productName = document.getElementById('productName').value.trim();
  if (!productName) {
    alert("Please enter a product name to delete.");
    return;
  }

  try {
    const feedRef = collection(db, "feedPrices");
    const q = query(feedRef, where("product", "==", productName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert(`No product found with name "${productName}".`);
      return;
    }

    let deletedCount = 0;
    for (const docSnap of querySnapshot.docs) {
      await deleteDoc(docSnap.ref);
      deletedCount++;
    }

    alert(`Deleted ${deletedCount} product(s) named "${productName}".`);
    document.getElementById('productName').value = '';
    document.getElementById('newPrice').value = '';
    fetchFeedData(); // Refresh UI if needed
  } catch (error) {
    console.error("Error deleting product:", error);
    alert("Error deleting product. Check console for details.");
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