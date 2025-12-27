// js/auth.js
const API_URL = "https://diatracker-backend.onrender.com";


// ---------- TOGGLE UI ----------
window.showRegister = () => {
    document.getElementById("loginDiv").style.display = "none";
    document.getElementById("registerDiv").style.display = "block";
};

window.showLogin = () => {
    document.getElementById("registerDiv").style.display = "none";
    document.getElementById("loginDiv").style.display = "block";
};

// ---------- REGISTER ----------
window.register = async () => {
    const role = document.getElementById("regRole").value;
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const age = document.getElementById("regAge").value;
    const gender = document.getElementById("regGender").value;

    if (!role || !name || !email || !password) {
        document.getElementById("regMsg").innerText = "Please fill required fields";
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role, name, email, password, age, gender })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed");

        alert("Registered successfully! Please login.");
        showLogin();
    } catch (err) {
        document.getElementById("regMsg").innerText = err.message;
    }
};

// ---------- LOGIN ----------
window.login = async () => {
    const role = document.getElementById("loginRole").value;
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!role || !email || !password) {
        document.getElementById("loginMsg").innerText = "Enter all fields";
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role, email, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");

        // ✅ STORE USER CONSISTENTLY
        localStorage.setItem("user", JSON.stringify(data.user));

        // ✅ ROLE-BASED REDIRECT
        if (data.user.role === "patient") {
            window.location.href = "dashboard.html";
        } else {
            window.location.href = "sponsor.html";
        }
    } catch (err) {
        document.getElementById("loginMsg").innerText = err.message;
    }
};
