// ================= LOGIN =================
function login(){
    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;

    if(user && pass){
        localStorage.setItem("currentUser", user);
        document.getElementById("loginPage").style.display="none";
        document.getElementById("app").style.display="block";
        loadUserData();
    }
}

// Get current user
function getCurrentUser(){
    return localStorage.getItem("currentUser");
}

// ================= TAB SWITCH =================
function showTab(tabId){
    document.querySelectorAll(".tabContent").forEach(tab=>{
        tab.style.display="none";
    });
    document.getElementById(tabId).style.display="block";
}

// ================= BMI =================
function calculateBMI(){
    let weight = parseFloat(document.getElementById("weight").value);
    let weightUnit = document.getElementById("weightUnit").value;
    let heightUnit = document.getElementById("heightUnit").value;

    if(weightUnit==="lbs") weight = weight * 0.453592;

    let height;

    if(heightUnit==="cm"){
        height = parseFloat(document.getElementById("height").value)/100;
    } else {
        let feet = parseFloat(document.getElementById("height").value);
        let inches = parseFloat(document.getElementById("inches").value) || 0;
        height = ((feet*12)+inches)*0.0254;
    }

    let bmi = (weight/(height*height)).toFixed(2);
    let category="";
    let target;

    if(bmi<18.5){ category="Underweight"; target=2500;}
    else if(bmi<24.9){ category="Normal"; target=2000;}
    else if(bmi<29.9){ category="Overweight"; target=1800;}
    else{ category="Obese"; target=1500;}

    document.getElementById("bmiResult").innerText =
        `BMI: ${bmi} (${category})`;

    document.getElementById("targetCalories").innerText =
        `Recommended daily calorie intake: ${target} kcal`;

    let user = getCurrentUser();
    localStorage.setItem(user+"_targetCalories", target);
}

// ================= USER DATA LOAD =================
let total = 0;
let foodItems = [];

function loadUserData(){
    let user = getCurrentUser();
    total = parseInt(localStorage.getItem(user+"_dailyTotal")) || 0;
    foodItems = JSON.parse(localStorage.getItem(user+"_foodItems")) || [];

    document.getElementById("totalCalories").innerText = total;
    document.getElementById("foodList").innerHTML = "";

    foodItems.forEach(item=>{
        let div = document.createElement("div");
        div.innerText = `${item.name} - ${item.calories} kcal`;
        document.getElementById("foodList").appendChild(div);
    });

    updateProgress();
}

// ================= ADD FOOD =================
function addFood(){
    let name = document.getElementById("foodName").value;
    let cal = parseInt(document.getElementById("foodCalories").value);

    if(!name || !cal) return;

    let user = getCurrentUser();

    total += cal;
    foodItems.push({ name, calories: cal });

    localStorage.setItem(user+"_dailyTotal", total);
    localStorage.setItem(user+"_foodItems", JSON.stringify(foodItems));

    document.getElementById("totalCalories").innerText = total;

    let div = document.createElement("div");
    div.innerText = `${name} - ${cal} kcal`;
    document.getElementById("foodList").appendChild(div);

    updateProgress();

    document.getElementById("foodName").value="";
    document.getElementById("foodCalories").value="";
}

// ================= PROGRESS =================
function updateProgress(){
    let user = getCurrentUser();
    let target = parseInt(localStorage.getItem(user+"_targetCalories"));
    if(!target) return;

    let percent = ((total/target)*100).toFixed(1);

    document.getElementById("progressMessage").innerText =
        `You consumed ${percent}% of your target calories today.`;
}

// ================= RESET =================
function resetCalories(){
    let user = getCurrentUser();

    localStorage.removeItem(user+"_dailyTotal");
    localStorage.removeItem(user+"_foodItems");

    total = 0;
    foodItems = [];

    document.getElementById("totalCalories").innerText = 0;
    document.getElementById("foodList").innerHTML = "";
    document.getElementById("progressMessage").innerText = "";

    alert("Today's calories reset for this user.");
}