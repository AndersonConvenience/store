// js/feed.js
import { db, collection, getDocs } from "./firebase-config.js";

const tbody = document.querySelector("#priceTable tbody");

async function loadFeedData() {
  try {
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

    // Group by category
    const groupedData = {};
    data.forEach(item => {
      const category = item.category;
      if (!groupedData[category]) {
        groupedData[category] = [];
      }
      groupedData[category].push(item);
    });

    // Sort categories
    const sortedCategories = Object.keys(groupedData).sort();

    renderFeedTable(sortedCategories, groupedData);
  } catch (error) {
    console.error("Error loading feed data:", error);
  }
}

function escapeHtml(text) {
  return String(text).replace(/&/g, "&amp;")
                     .replace(/</g, "&lt;")
                     .replace(/>/g, "&gt;")
                     .replace(/"/g, "&quot;")
                     .replace(/'/g, "&#039;");
}


function renderFeedTable(sortedCategories, groupedData) {
  tbody.innerHTML = "";
  sortedCategories.forEach(category => {
    const items = groupedData[category];

    // If multiple rows in category, merge the category cell
    items.forEach((item, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        ${index === 0 ? `<td class="category" rowspan="${items.length}">${escapeHtml(category)}</td>` : ""}
        <td>${escapeHtml(item.quantity)}</td>
        <td>${escapeHtml(item.product)}</td>
        <td>${escapeHtml(item.price)}</td>
      `;
      tbody.appendChild(row);
    });
  });
}

window.addEventListener("DOMContentLoaded", loadFeedData);
