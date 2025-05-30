// gas.js
import { db, doc, getDoc } from './firebase-config.js'; // Adjust path as needed

async function loadGasPrices() {
  console.log("Loading gas prices...");
  try {
    const docRef = doc(db, "gasPrices", "current"); // collection: gasPrices, document: current
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("Gas price data:", data);

      const priceMap = {
        "Regular": data.regular,
        "Mid-Grade": data.midGrade,
        "Premium": data.premium,
        "Diesel (Off-Road)": data.dieselOffRoad,
        "Diesel (On-Road)": data.dieselOnRoad
      };

      document.querySelectorAll('.price-card').forEach(card => {
        const type = card.dataset.type;
        const price = priceMap[type];
        if (price !== undefined) {
          card.querySelector('p').textContent = `$${price.toFixed(3)}`;
        } else {
          card.querySelector('p').textContent = "N/A";
        }
      });
    } else {
      console.error("No gasPrices/current document found.");
    }
  } catch (error) {
    console.error("Error fetching gas prices:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadGasPrices);
