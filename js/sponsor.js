const API_URL = "https://diatracker-backend.onrender.com";


// ---------- CHECK LOGGED-IN SPONSOR ----------
const sponsor = JSON.parse(localStorage.getItem("user"));
if (!sponsor || sponsor.role !== "sponsor") {
    alert("Please login as sponsor");
    location.href = "index.html";
}

document.getElementById("sponsorName").innerText = sponsor.name;

// ---------- LOGOUT ----------
window.logoutSponsor = () => {
    localStorage.removeItem("user");
    location.href = "index.html";
};

// ---------- LOAD REQUESTS ----------
async function loadRequests() {
    const container = document.getElementById("requests");
    container.innerHTML = "Loading...";

    try {
        const res = await fetch(`${API_URL}/api/support/requests`);
        const requests = await res.json();

        container.innerHTML = "";

        if (!requests || requests.length === 0) {
            container.innerHTML = "No pending requests.";
            return;
        }

        requests.forEach(r => {
            const div = document.createElement("div");
            div.style.border = "1px solid #ccc";
            div.style.padding = "10px";
            div.style.margin = "10px 0";
            div.style.borderRadius = "8px";
            div.style.background = "#f9f9f9";

            // Safe access patient info
            const patientName = r.patientId?.name || "Unknown";
            const patientEmail = r.patientId?.email || "Unknown";
            const treatment = r.treatment || "N/A";
            const amount = r.amount !== undefined ? `$${r.amount}` : "N/A";
            const status = r.status || "pending";

            div.innerHTML = `
                <strong>Patient:</strong> ${patientName} (${patientEmail})<br>
                <strong>Treatment:</strong> ${treatment}<br>
                <strong>Amount:</strong> ${amount}<br>
                <strong>Status:</strong> ${status}<br>
                <button onclick="approveRequest('${r._id}')">Approve</button>
            `;

            container.appendChild(div);
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = "Error loading requests";
    }
}

// ---------- APPROVE REQUEST ----------
window.approveRequest = async (requestId) => {
    try {
        const res = await fetch(`${API_URL}/api/support/approve`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requestId, sponsorId: sponsor._id })
        });
        const data = await res.json();

        if (res.ok) {
            alert("Request approved!");
            loadRequests(); // refresh list
        } else {
            alert(data.error || "Failed to approve request");
        }

    } catch (err) {
        console.error(err);
        alert("Failed to approve request");
    }
};

// ---------- INIT ----------
loadRequests();
