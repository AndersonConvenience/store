// js/feed.js
import { db, collection, getDocs } from "./firebase-config.js";

const tbody = document.querySelector("#priceTable tbody");

async function loadFeedData() {
  const snapshot = await getDocs(collection(db, "feedPrices"));
  const data = [];

  snapshot.forEach(doc => {
    const item = doc.data();
    data.push({
      category: item.category || "",
      quantity: item.quantity || "",
      product: item.product || "",
      price: item.price || ""
    });
  });

  renderFeedTable(data);
}

function renderFeedTable(data) {
  tbody.innerHTML = "";
  data.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="category">${item.category}</td>
      <td>${item.quantity}</td>
      <td>${item.product}</td>
      <td>${item.price}</td>
    `;
    tbody.appendChild(row);
  });
}

window.addEventListener("DOMContentLoaded", loadFeedData);
