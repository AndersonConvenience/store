
    // login.js
  import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorMsg = document.getElementById("error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("isAdminLoggedIn", "true");
      window.location.href = "./dashboard.html";
    } catch (error) {
      console.error("Login error:", error);
      errorMsg.hidden = false;
    }
  });
});
