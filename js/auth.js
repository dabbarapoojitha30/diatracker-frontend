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
    const msg = document.getElementById("regMsg");

    if (!role || !name || !email || !password) {
        msg.innerText = "Please fill required fields";
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role, name, email, password, age, gender })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Registration failed");

        alert("Registered successfully! Please login.");
        showLogin();
    } catch (err) {
        msg.innerText = err.message;
    }
};

// ---------- LOGIN ----------
window.login = async () => {
    const role = document.getElementById("loginRole").value;
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const msg = document.getElementById("loginMsg");

    if (!role || !email || !password) {
        msg.innerText = "Enter all fields";
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role, email, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Login failed");

        // Save user
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirect
        if (data.user.role === "patient") {
            window.location.href = "dashboard.html";
        } else {
            window.location.href = "sponsor.html";
        }
    } catch (err) {
        msg.innerText = err.message;
    }
};
