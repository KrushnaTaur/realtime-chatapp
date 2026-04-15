// js/auth.js
// Handles authentication: signup, login, logout, token management

const API = CONFIG.BACKEND_URL;

// ─────────────────────────────────────
// SIGNUP FORM HANDLER
// ─────────────────────────────────────
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const errorEl = document.getElementById("error");
    const btn = document.getElementById("submitBtn");

    btn.disabled = true;
    btn.textContent = "Creating account...";
    errorEl.textContent = "";

    try {
      const res = await fetch(`${API}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        errorEl.textContent = data.message || "Signup failed";
        btn.disabled = false;
        btn.textContent = "Create Account";
        return;
      }

      // Save token and user info to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ _id: data._id, name: data.name, email: data.email }));

      // Redirect to chat page
      window.location.href = "index.html";
    } catch (err) {
      errorEl.textContent = "Network error. Is the backend running?";
      btn.disabled = false;
      btn.textContent = "Create Account";
    }
  });
}

// ─────────────────────────────────────
// LOGIN FORM HANDLER
// ─────────────────────────────────────
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const errorEl = document.getElementById("error");
    const btn = document.getElementById("submitBtn");

    btn.disabled = true;
    btn.textContent = "Signing in...";
    errorEl.textContent = "";

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        errorEl.textContent = data.message || "Login failed";
        btn.disabled = false;
        btn.textContent = "Sign In";
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ _id: data._id, name: data.name, email: data.email }));
      window.location.href = "index.html";
    } catch (err) {
      errorEl.textContent = "Network error. Is the backend running?";
      btn.disabled = false;
      btn.textContent = "Sign In";
    }
  });
}

// Redirect to login if already logged in (on auth pages)
if (localStorage.getItem("token")) {
  const isAuthPage =
    window.location.pathname.includes("login.html") ||
    window.location.pathname.includes("signup.html");
  if (isAuthPage) window.location.href = "index.html";
}