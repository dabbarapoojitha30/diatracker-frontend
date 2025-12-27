const API_URL = "https://diatracker-backend.onrender.com";

const user = JSON.parse(localStorage.getItem("user"));

if (!user || user.role !== "patient") {
    alert("Please login as patient");
    location.href = "index.html";
}

document.getElementById("userName").innerText = user.name;

// ================= LOGOUT =================
window.logout = () => {
    localStorage.removeItem("user");
    location.href = "index.html";
};

// ================= DARK MODE =================
window.toggleDarkMode = () => {
    document.body.classList.toggle("dark-mode");
    document.querySelector(".container").classList.toggle("dark-mode");
};

// ================= SPEECH =================
function speak(text) {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "en-US";
    speechSynthesis.speak(msg);
}

// ================= VOICE INPUT =================
window.voiceInput = (field) => {
    if (!annyang) return alert("Voice not supported");

    const prompts = {
        glucose: "Say glucose value",
        bp: "Say systolic and diastolic",
        heartRate: "Say heart rate",
        weight: "Say weight"
    };

    speak(prompts[field]);

    annyang.abort();
    annyang.removeCommands();

    annyang.addCommands({
        "*value": (value) => {
            if (field === "bp") {
                const nums = value.match(/\d+/g);
                if (nums && nums.length >= 2) {
                    systolic.value = nums[0];
                    diastolic.value = nums[1];
                }
            } else {
                document.getElementById(field).value = value.match(/\d+/);
            }
            annyang.abort();
        }
    });

    annyang.start();
};

// ================= SAVE READING =================
window.saveReading = async () => {
    const data = {
        userId: user._id,
        glucose: glucose.value,
        systolic: systolic.value,
        diastolic: diastolic.value,
        heartRate: heartRate.value,
        weight: weight.value
    };

    if (Object.values(data).some(v => !v)) {
        alert("Fill all health fields");
        return;
    }

    await fetch(`${API_URL}/api/readings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    alert("Reading saved");
    loadReadings();
    renderCharts();
};

// ================= READINGS =================
async function loadReadings() {
    const res = await fetch(`${API_URL}/api/readings/${user._id}`);
    const data = await res.json();

    readings.innerHTML = "";

    data.reverse().forEach(r => {
        const p = document.createElement("p");
        p.innerText = `${new Date(r.date).toLocaleString()} | G:${r.glucose} BP:${r.systolic}/${r.diastolic} HR:${r.heartRate}`;
        readings.appendChild(p);
    });
}

// ================= CHARTS =================
let glucoseChart, bpChart;

async function renderCharts() {
    try {
        const res = await fetch(`${API_URL}/api/readings/${user._id}`);
        const data = await res.json();

        console.log("Readings data:", data);

        if (!data || !Array.isArray(data) || data.length === 0) {
            console.warn("No readings data to render charts");
            return;
        }

        const labels = data.map(d => new Date(d.date).toLocaleDateString());
        const gData = data.map(d => d.glucose || 0);
        const sData = data.map(d => d.systolic || 0);
        const dData = data.map(d => d.diastolic || 0);

        if (glucoseChart) glucoseChart.destroy();
        if (bpChart) bpChart.destroy();

        const glucoseCtx = document.getElementById("glucoseChart").getContext("2d");
        glucoseChart = new Chart(glucoseCtx, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Glucose",
                    data: gData,
                    borderColor: "blue",
                    backgroundColor: "rgba(0,0,255,0.1)",
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: true } },
                scales: { y: { beginAtZero: false } }
            }
        });

        const bpCtx = document.getElementById("bpChart").getContext("2d");
        bpChart = new Chart(bpCtx, {
            type: "line",
            data: {
                labels,
                datasets: [
                    { label: "Systolic", data: sData, borderColor: "red", fill: false },
                    { label: "Diastolic", data: dData, borderColor: "orange", fill: false }
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: true } },
                scales: { y: { beginAtZero: false } }
            }
        });

    } catch (err) {
        console.error("Error rendering charts:", err);
    }
}

// ================= REPORT =================
window.generateReport = () => window.print();

// ================= MEDICINE REMINDER =================
window.setMedicineReminder = () => {
    if (!medName.value || !medTime.value) return alert("Enter medicine & time");

    const [h, m] = medTime.value.split(":");
    const target = new Date();
    target.setHours(h, m, 0);

    const delay = target - new Date();
    if (delay < 0) return alert("Time passed");

    setTimeout(() => {
        speak(`Time to take ${medName.value}`);
        alert(`Take medicine: ${medName.value}`);
    }, delay);
};

// ================= CALORIE DEMO =================
window.analyzeFood = () => {
    if (!foodImage.files.length) return alert("Upload image");
    dietResult.innerText = "Estimated calories: ~250 kcal (demo)";
};

// ================= SOS =================
window.saveSOSContact = () => {
    localStorage.setItem("sos", sosContact.value);
    alert("Saved");
};

window.sosAlert = () => {
    speak("Emergency alert sent");
    alert("SOS sent to " + localStorage.getItem("sos"));
};

// ================= MAPS =================
window.showCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(p => {
        map.innerHTML = `<iframe width="100%" height="300"
        src="https://maps.google.com/maps?q=${p.coords.latitude},${p.coords.longitude}&z=15&output=embed"></iframe>`;
    });
};

window.showNearbyHospitals = () => {
    navigator.geolocation.getCurrentPosition(p => {
        map.innerHTML = `<iframe width="100%" height="300"
        src="https://maps.google.com/maps?q=hospitals&ll=${p.coords.latitude},${p.coords.longitude}&z=15&output=embed"></iframe>`;
    });
};

window.showRoute = () => {
    navigator.geolocation.getCurrentPosition(p => {
        map.innerHTML = `<iframe width="100%" height="300"
        src="https://www.google.com/maps?q=${p.coords.latitude},${p.coords.longitude}+to+${dropLocation.value}&output=embed"></iframe>`;
    });
};

// ================= SUPPORT =================
window.goToSupport = () => location.href = "./patientsupport.html";

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
    loadReadings();
    renderCharts();
});
