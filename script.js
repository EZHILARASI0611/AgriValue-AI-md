
const STORAGE_KEY = "agrivalue_ai_resources";

const resourceData = {
    "Banana Peel": {
        uses: ["Organic compost production", "Biogas generation", "Animal feed research"],
        industries: ["Fertilizer", "Biogas", "Animal Feed"],
        value: 8,
        icon: "🍌"
    },
    "Sugarcane Bagasse": {
        uses: ["Biodegradable packaging", "Paper manufacturing", "Bioenergy production"],
        industries: ["Packaging", "Paper Manufacturing", "Bioenergy"],
        value: 12,
        icon: "🎋"
    },
    "Rice Husk": {
        uses: ["Rice husk ash production", "Bioenergy generation", "Construction material research"],
        industries: ["Construction", "Bioenergy", "Material Processing"],
        value: 10,
        icon: "🌾"
    },
    "Fruit Pulp": {
        uses: ["Food ingredient processing", "Compost production", "Animal feed processing"],
        industries: ["Food Processing", "Fertilizer", "Animal Feed"],
        value: 15,
        icon: "🍎"
    },
    "Vegetable Waste": {
        uses: ["Organic fertilizer", "Biogas production", "Compost manufacturing"],
        industries: ["Fertilizer", "Biogas", "Waste Processing"],
        value: 6,
        icon: "🥬"
    },
    "Groundnut Shell": {
        uses: ["Biomass fuel", "Compost production", "Material processing research"],
        industries: ["Bioenergy", "Fertilizer", "Material Processing"],
        value: 7,
        icon: "🥜"
    }
};

const industryInfo = {
    "Fertilizer": {
        icon: "🌱",
        description: "Potential use of agricultural residues in organic fertilizer and soil improvement products."
    },
    "Biogas": {
        icon: "♻️",
        description: "Organic by-products may be processed for biogas and renewable energy."
    },
    "Animal Feed": {
        icon: "🐄",
        description: "Selected by-products may have potential for animal feed after appropriate processing and safety checks."
    },
    "Packaging": {
        icon: "📦",
        description: "Plant-based residues can be explored for biodegradable packaging materials."
    },
    "Paper Manufacturing": {
        icon: "📄",
        description: "Fibrous agricultural residues may be used as alternative paper-making raw materials."
    },
    "Bioenergy": {
        icon: "⚡",
        description: "Agricultural residues may be converted into biomass fuel and renewable energy."
    },
    "Construction": {
        icon: "🏗️",
        description: "Processed agricultural residues may have applications in construction materials."
    },
    "Material Processing": {
        icon: "⚙️",
        description: "Agricultural residues can be explored as inputs for value-added materials."
    },
    "Food Processing": {
        icon: "🥫",
        description: "Suitable fruit residues may be processed into food ingredients after quality checks."
    },
    "Waste Processing": {
        icon: "♻️",
        description: "Organic waste can be collected and processed through resource recovery methods."
    }
};

let resources = loadResources();

let resourceChart = null;
let quantityChart = null;
let valueChart = null;


// LOAD SAVED DATA

function loadResources() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

function saveResources() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
}


// FORMAT NUMBERS

function formatNumber(value) {
    return Number(value).toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}


// DASHBOARD KPIs

function updateDashboard() {
    const totalResources = resources.length;

    const totalQuantity = resources.reduce(
        (sum, item) => sum + Number(item.quantity), 0
    );

    const totalValue = resources.reduce(
        (sum, item) => sum + Number(item.quantity) * resourceData[item.type].value, 0
    );

    const totalMatches = new Set(
        resources.flatMap(item => resourceData[item.type].industries)
    ).size;

    document.getElementById("totalResources").textContent = totalResources;
    document.getElementById("totalQuantity").textContent = formatNumber(totalQuantity);
    document.getElementById("totalValue").textContent = formatNumber(totalValue);
    document.getElementById("totalMatches").textContent = totalMatches;

    updateCharts();
    updateSummary();
}


// REGISTER RESOURCE

document.getElementById("wasteForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const type = document.getElementById("wasteType").value;
    const quantity = Number(document.getElementById("quantity").value);
    const source = document.getElementById("source").value.trim();
    const location = document.getElementById("location").value.trim();

    if (!type || !quantity || quantity <= 0 || !source || !location) {
        alert("Please enter all resource details correctly.");
        return;
    }

    const newResource = {
        id: Date.now(),
        type,
        quantity,
        source,
        location
    };

    resources.push(newResource);

    saveResources();
    renderResources();
    updateDashboard();
    updateIndustryCards();

    this.reset();

    alert("Agricultural resource registered successfully!");
});


// DISPLAY RESOURCE TABLE

function renderResources() {
    const table = document.getElementById("resourceTable");

    if (resources.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;padding:30px;color:#849087;">
                    No resources registered yet. Add your first resource above.
                </td>
            </tr>
        `;
        return;
    }

    table.innerHTML = resources.map(item => {
        const data = resourceData[item.type];

        return `
            <tr>
                <td><strong>${escapeHTML(data.icon)} ${escapeHTML(item.type)}</strong></td>
                <td>${formatNumber(item.quantity)} kg</td>
                <td>${escapeHTML(item.source)}</td>
                <td>${escapeHTML(item.location)}</td>
                <td>
                    <button onclick="deleteResource(${Number(item.id)})">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}


// PROTECT TABLE TEXT

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function(char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char];
    });
}


// DELETE RESOURCE

function deleteResource(id) {
    if (!confirm("Are you sure you want to delete this resource?")) {
        return;
    }

    resources = resources.filter(item => Number(item.id) !== Number(id));

    saveResources();
    renderResources();
    updateDashboard();
    updateIndustryCards();
}


// RESOURCE CHARTS

function updateCharts() {
    if (typeof Chart === "undefined") return;

    const labels = Object.keys(resourceData);

    const quantities = labels.map(type =>
        resources
            .filter(item => item.type === type)
            .reduce((sum, item) => sum + Number(item.quantity), 0)
    );

    const values = labels.map((type, index) =>
        quantities[index] * resourceData[type].value
    );

    const chartColors = [
        "#245d40",
        "#8bbd68",
        "#e7b45c",
        "#8c80bd",
        "#64a9a0",
        "#d58b63"
    ];

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: { size: 10 }
                }
            }
        }
    };

    if (resourceChart) resourceChart.destroy();

    resourceChart = new Chart(
        document.getElementById("resourceChart"),
        {
            type: "doughnut",
            data: {
                labels,
                datasets: [{
                    data: quantities,
                    backgroundColor: chartColors,
                    borderWidth: 3,
                    borderColor: "#ffffff"
                }]
            },
            options: {
                ...chartOptions,
                cutout: "68%"
            }
        }
    );

    if (quantityChart) quantityChart.destroy();

    quantityChart = new Chart(
        document.getElementById("quantityChart"),
        {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Quantity (kg)",
                    data: quantities,
                    backgroundColor: chartColors,
                    borderRadius: 6
                }]
            },
            options: {
                ...chartOptions,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        }
    );

    if (valueChart) valueChart.destroy();

    valueChart = new Chart(
        document.getElementById("valueChart"),
        {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Estimated value (₹)",
                    data: values,
                    backgroundColor: chartColors,
                    borderRadius: 6
                }]
            },
            options: {
                ...chartOptions,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        }
    );
}


// AI RECOMMENDATION

document.getElementById("recommendBtn").addEventListener("click", function() {
    const type = document.getElementById("recommendSelect").value;
    const result = document.getElementById("recommendResult");

    if (!type) {
        alert("Please select an agricultural resource.");
        return;
    }

    const data = resourceData[type];

    const registered = resources
        .filter(item => item.type === type)
        .reduce((sum, item) => sum + Number(item.quantity), 0);

    result.innerHTML = `
        <div class="insight-content">
            <span class="section-kicker">RESOURCE ANALYSIS RESULT</span>

            <div style="font-size:42px;margin-bottom:12px;">
                ${data.icon}
            </div>

            <h3 style="font-size:21px;margin-bottom:8px;">
                ${escapeHTML(type)}
            </h3>

            <p style="color:#849087;font-size:11px;margin-bottom:20px;">
                Potential utilization opportunities identified.
            </p>

            <div style="background:#edf5e9;padding:14px;border-radius:10px;margin-bottom:20px;">
                <strong style="font-size:12px;color:#245d40;">
                    Registered quantity: ${formatNumber(registered)} kg
                </strong>
            </div>

            <h4 style="font-size:12px;margin-bottom:13px;">
                Suggested utilization methods
            </h4>

            ${data.uses.map((use, index) => `
                <div style="display:flex;gap:12px;align-items:center;margin-bottom:13px;">
                    <span style="background:#edf5e9;color:#245d40;padding:7px 10px;border-radius:8px;font-size:11px;">
                        0${index + 1}
                    </span>
                    <span style="font-size:12px;">${escapeHTML(use)}</span>
                </div>
            `).join("")}

            <p style="font-size:10px;color:#849087;margin-top:20px;line-height:1.7;">
                These are preliminary rule-based suggestions, not verified processing or food-safety advice.
            </p>
        </div>
    `;
});


// INDUSTRY MATCHING

function updateIndustryCards() {
    const container = document.getElementById("industryCards");

    const industrySet = new Set();

    resources.forEach(item => {
        resourceData[item.type].industries.forEach(industry => {
            industrySet.add(industry);
        });
    });

    const industries = industrySet.size > 0
        ? [...industrySet]
        : Object.keys(industryInfo);

    container.innerHTML = industries.map(industry => {
        const info = industryInfo[industry];

        const matchingResources = resources
            .filter(item => resourceData[item.type].industries.includes(industry));

        const matchingQuantity = matchingResources.reduce(
            (sum, item) => sum + Number(item.quantity), 0
        );

        return `
            <div class="industry-card">
                <div class="industry-icon">${info.icon}</div>
                <h3>${escapeHTML(industry)}</h3>
                <p>${escapeHTML(info.description)}</p>

                <div style="margin-top:17px;padding-top:13px;border-top:1px solid #e8ece5;">
                    <strong style="font-size:11px;color:#245d40;">
                        ${matchingResources.length} matching entries
                    </strong>
                    <p style="margin-top:5px;">
                        Potential quantity: ${formatNumber(matchingQuantity)} kg
                    </p>
                </div>
            </div>
        `;
    }).join("");
}


// ANALYTICS SUMMARY

function updateSummary() {
    const summary = document.getElementById("summary");

    const totalQuantity = resources.reduce(
        (sum, item) => sum + Number(item.quantity), 0
    );

    const totalValue = resources.reduce(
        (sum, item) => sum + Number(item.quantity) * resourceData[item.type].value, 0
    );

    const uniqueTypes = new Set(resources.map(item => item.type)).size;

    summary.innerHTML = `
        <p>• Total registered entries: <strong>${resources.length}</strong></p>
        <p>• Total recorded quantity: <strong>${formatNumber(totalQuantity)} kg</strong></p>
        <p>• Different resource categories: <strong>${uniqueTypes}</strong></p>
        <p>• Illustrative estimated value: <strong>₹${formatNumber(totalValue)}</strong></p>
        <p>• Potential industry sectors: <strong>${new Set(resources.flatMap(item => resourceData[item.type].industries)).size}</strong></p>
        <p style="margin-top:12px;font-size:10px;">
            Value estimates use illustrative sample rates and are not live market quotations.
        </p>
    `;
}


// EXPORT CSV

document.getElementById("exportBtn").addEventListener("click", function() {
    if (resources.length === 0) {
        alert("No resources available to export.");
        return;
    }

    const rows = [
        ["Resource Type", "Quantity (kg)", "Source", "Location", "Estimated Value (INR)"]
    ];

    resources.forEach(item => {
        rows.push([
            item.type,
            item.quantity,
            item.source,
            item.location,
            item.quantity * resourceData[item.type].value
        ]);
    });

    const csv = rows.map(row =>
        row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")
    ).join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "AgriValue_AI_Report.csv";
    link.click();

    URL.revokeObjectURL(url);
});


// SIDEBAR NAVIGATION

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", function() {
        document.querySelectorAll(".nav-link").forEach(item => {
            item.classList.remove("active");
        });

        this.classList.add("active");
    });
});


// INITIALIZE APPLICATION

renderResources();
updateDashboard();
updateIndustryCards();
