// ================= GLOBAL VARIABLES =================
let total = 0;
let healthyTotal = 0;
let unhealthyTotal = 0;
let foodItems = [];

// ================= LOGIN =================
function login() {
    let user = document.getElementById("username").value.trim();
    let pass = document.getElementById("password").value.trim();

    if (user && pass) {
        localStorage.setItem("currentUser", user);

        document.getElementById("loginPage").style.display = "none";
        document.getElementById("app").style.display = "block";

        loadTodayData();
    }
}

// ================= HELPERS =================
function getCurrentUser() {
    return localStorage.getItem("currentUser");
}

function getToday() {
    return new Date().toISOString().split("T")[0];
}

// ================= TAB SWITCH =================
function showTab(tabId) {
    document.querySelectorAll(".tabContent").forEach(tab => {
        tab.style.display = "none";
    });

    document.getElementById(tabId).style.display = "block";
}

// ================= BMI =================
function calculateBMI() {
    let weight = parseFloat(document.getElementById("weight").value);
    let weightUnit = document.getElementById("weightUnit").value;
    let heightUnit = document.getElementById("heightUnit").value;

    if (!weight) return;

    if (weightUnit === "lbs") {
        weight = weight * 0.453592;
    }

    let height;

    if (heightUnit === "cm") {
        height = parseFloat(document.getElementById("height").value) / 100;
    } else {
        let feet = parseFloat(document.getElementById("height").value);
        let inches = parseFloat(document.getElementById("inches").value) || 0;
        height = ((feet * 12) + inches) * 0.0254;
    }

    if (!height) return;

    let bmi = (weight / (height * height)).toFixed(2);
    let category = "";
    let target;

    if (bmi < 18.5) { category = "Underweight"; target = 2500; }
    else if (bmi < 24.9) { category = "Normal"; target = 2000; }
    else if (bmi < 29.9) { category = "Overweight"; target = 1800; }
    else { category = "Obese"; target = 1500; }

    document.getElementById("bmiResult").innerText =
        `BMI: ${bmi} (${category})`;

    document.getElementById("targetCalories").innerText =
        `Recommended daily calorie intake: ${target} kcal`;

    let user = getCurrentUser();
    localStorage.setItem(user + "_targetCalories", target);
}

// ================= LOAD TODAY DATA =================
function loadTodayData() {
    let user = getCurrentUser();
    if (!user) return;

    let today = getToday();
    let history = JSON.parse(localStorage.getItem(user + "_history")) || {};

    if (history[today]) {
        total = history[today].total || 0;
        healthyTotal = history[today].healthy || 0;
        unhealthyTotal = history[today].unhealthy || 0;
        foodItems = history[today].foods || [];
    } else {
        total = 0;
        healthyTotal = 0;
        unhealthyTotal = 0;
        foodItems = [];
    }

    renderFood();
    updateProgress();
}

// ================= SAVE TODAY DATA =================
function saveTodayData() {
    let user = getCurrentUser();
    if (!user) return;

    let today = getToday();
    let history = JSON.parse(localStorage.getItem(user + "_history")) || {};

    history[today] = {
        foods: foodItems,
        total: total,
        healthy: healthyTotal,
        unhealthy: unhealthyTotal
    };

    localStorage.setItem(user + "_history", JSON.stringify(history));
}

// ================= ADD FOOD =================
function addFood() {
    let name = document.getElementById("foodName").value.trim();
    let cal = parseInt(document.getElementById("foodCalories").value);
    let type = document.getElementById("foodType").value;

    if (!name || !cal) return;

    total += cal;

    if (type === "healthy") {
        healthyTotal += cal;
    } else {
        unhealthyTotal += cal;
    }

    foodItems.push({
        name: name,
        calories: cal,
        type: type
    });

    renderFood();
    saveTodayData();
    updateProgress();

    document.getElementById("foodName").value = "";
    document.getElementById("foodCalories").value = "";
}

// ================= RENDER FOOD =================
function renderFood() {
    let list = document.getElementById("foodList");
    list.innerHTML = "";

    foodItems.forEach(item => {
        let div = document.createElement("div");
        div.innerText = `${item.name} - ${item.calories} kcal (${item.type})`;
        list.appendChild(div);
    });

    document.getElementById("totalCalories").innerText = total;
    document.getElementById("healthyCalories").innerText = healthyTotal;
    document.getElementById("unhealthyCalories").innerText = unhealthyTotal;
}

// ================= PROGRESS =================
function updateProgress() {
    let user = getCurrentUser();
    if (!user) return;

    let target = parseInt(localStorage.getItem(user + "_targetCalories"));
    if (!target) {
        document.getElementById("progressMessage").innerText =
            "Calculate BMI to get recommended calorie target.";
        return;
    }

    let percent = ((total / target) * 100).toFixed(1);

    document.getElementById("progressMessage").innerText =
        `You consumed ${percent}% of your target calories today.`;
}

// ================= VIEW HISTORY =================
function viewHistory() {
    let user = getCurrentUser();
    if (!user) return;

    let selectedDate = document.getElementById("historyDate").value;
    let history = JSON.parse(localStorage.getItem(user + "_history")) || {};
    let resultDiv = document.getElementById("historyResult");

    if (history[selectedDate]) {
        let data = history[selectedDate];

        resultDiv.innerHTML = `
            <h3>Date: ${selectedDate}</h3>
            <p>Total Calories: ${data.total} kcal</p>
            <p>Healthy Calories: ${data.healthy} kcal</p>
            <p>Unhealthy Calories: ${data.unhealthy} kcal</p>
            <ul>
                ${data.foods.map(food =>
                    `<li>${food.name} - ${food.calories} kcal (${food.type})</li>`
                ).join("")}
            </ul>
        `;
    } else {
        resultDiv.innerHTML = "No data found for this date.";
    }
}

// ================= RESET TODAY =================
function resetCalories() {
    total = 0;
    healthyTotal = 0;
    unhealthyTotal = 0;
    foodItems = [];

    renderFood();
    saveTodayData();
}