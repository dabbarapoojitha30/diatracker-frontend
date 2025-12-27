const API_URL = "https://diatracker-backend.onrender.com";


// ---------- CHECK LOGGED-IN PATIENT ----------
const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "patient") {
    alert("Please login as patient");
    location.href = "index.html";
}

// ---------- APPLY FOR SUPPORT ----------
window.applySupport = async () => {
    const prescription = document.getElementById("prescription").value.trim();
    const cost = document.getElementById("cost").value.trim();

    if (!prescription || !cost) {
        alert("Please enter prescription/treatment and cost");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/support/apply`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                patientId: user._id,
                treatment: prescription,
                amount: parseFloat(cost)
            })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Support request applied!");
            document.getElementById("prescription").value = "";
            document.getElementById("cost").value = "";
            loadStatus();
        } else {
            alert(data.error || "Failed to apply support");
        }

    } catch (err) {
        console.error(err);
        alert("Failed to apply support");
    }
};

// ---------- LOAD SUPPORT STATUS ----------
async function loadStatus() {
    try {
        const res = await fetch(`${API_URL}/api/support/status/${user._id}`);
        const requests = await res.json();

        const container = document.getElementById("status");
        container.innerHTML = "";

        if (!requests || requests.length === 0) {
            container.innerText = "No support requests found.";
            return;
        }

        requests.forEach(r => {
            const treatment = r.treatment || "N/A";
            const amount = r.amount !== undefined ? `$${r.amount}` : "N/A";
            const status = r.status || "pending";

            const div = document.createElement("div");
            div.style.border = "1px solid #ccc";
            div.style.padding = "10px";
            div.style.margin = "10px 0";
            div.style.borderRadius = "8px";
            div.style.background = "#f9f9f9";

            div.innerHTML = `
                <strong>Treatment:</strong> ${treatment}<br>
                <strong>Amount:</strong> ${amount}<br>
                <strong>Status:</strong> ${status}
            `;

            container.appendChild(div);
        });

    } catch (err) {
        console.error(err);
        document.getElementById("status").innerText = "Error loading status";
    }
}

// ---------- INIT ----------
loadStatus();
