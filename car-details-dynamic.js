
function formatPrice(n) {
    if (!n) return "N/A";
    return "₹" + Number(n).toLocaleString("en-IN");
}


function getCarById(id) {
    const approved = JSON.parse(localStorage.getItem("approvedCars") || "[]");
    const pending  = JSON.parse(localStorage.getItem("pendingCars")  || "[]");
    return [...approved, ...pending].find(c => c.id === id) || null;
}


function render(car) {
   
    const imgs = [car.image, car.image2, car.image3].filter(Boolean);
    const mainImg = imgs[0] || "https://via.placeholder.com/800x400?text=No+Image";

    const thumbsHtml = imgs.map((src, i) => `
        <img src="${src}" alt="Photo ${i+1}" class="${i===0?'active':''}" onclick="switchMain(this,'${src}')">
    `).join("") || `<img src="${mainImg}" alt="Car">`;

    const specRows = [
        ["Brand",        car.brand],
        ["Model",        car.model],
        ["Year",         car.year],
        ["Mileage",      car.mileage],
        ["Color",        car.color],
        ["Fuel Type",    car.fuel],
        ["Transmission", car.transmission || "—"],
        ["Engine",       car.engine || "—"],
        ["Body Type",    car.bodyType || "—"],
        ["Condition",    car.condition || "—"],
        ["No. of Owners",car.owners || "—"],
        ["Insurance",    car.insurance || "—"],
        ["Registration", car.regNo || "—"],
    ].filter(r => r[1] && r[1] !== "—");

    const featureList = (car.features || "")
        .split(",").map(f => f.trim()).filter(Boolean);

    const featuresHtml = featureList.length
        ? `<ul>${featureList.map(f=>`<li>${f}</li>`).join("")}</ul>`
        : "<p style='color:#888'>No features listed.</p>";

    document.getElementById("car-content").innerHTML = `
        <div class="details-grid">
            <div class="car-images">
                <img id="main-img" src="${mainImg}" alt="${car.brand} ${car.model}" class="main-image">
                <div class="thumbnail-images">${thumbsHtml}</div>
            </div>
            <div class="car-details-info">
                <h1>${car.brand} ${car.model} ${car.year}
                    <span class="badge">User Listed</span>
                    ${car.isSold ? '<span class="badge" style="background:#ff3b30; color:#fff;">SOLD OUT</span>' : ''}
                </h1>
                <div class="price-tag">${formatPrice(car.price)}</div>
                <table class="specs-table">
                    ${specRows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join("")}
                </table>
                <a href="contact.html" class="btn">Contact Seller Now</a>
            </div>
        </div>

        <div class="features-list">
            <h3>Key Features</h3>
            ${featuresHtml}
        </div>

        <div class="description-section">
            <h2>Description</h2>
            <p>${car.desc ? car.desc.replace(/\n/g,"<br>") : "No description provided."}</p>
        </div>

        <div class="seller-info">
            <h3>Seller Information</h3>
            <p><strong>Name:</strong> <span>${car.ownerName || "—"}</span></p>
            <p><strong>Location:</strong> <span>${car.city ? car.city+", "+car.state : "—"}</span></p>
            <p><strong>Phone:</strong> <span>${car.ownerPhone || "—"}</span></p>
            <p><strong>Email:</strong> <span>${car.ownerEmail || "—"}</span></p>
            <p><strong>Available for:</strong> <span>Test drives by appointment</span></p>
        </div>

        <div style="text-align:center;margin-top:10px;">
            <a href="contact.html" class="btn" style="font-size:1.2rem;padding:15px 40px;">Contact Seller Now</a>
        </div>`;

    document.title = `${car.brand} ${car.model} ${car.year} – MotorDeal`;
}


function switchMain(thumb, src) {
    document.getElementById("main-img").src = src;
   
    document.querySelectorAll(".thumbnail-images img").forEach(i => i.classList.remove("active"));
    thumb.classList.add("active");
}

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (id) {
    const car = getCarById(id);
    if (car) render(car);
    else document.getElementById("car-content").innerHTML = `
        <div class="no-data">
            <h2>Car not found</h2>
            <p>This listing may have been removed or the link is invalid.</p>
            <br><a href="carsale.html#cars" class="btn">Browse All Cars</a>
        </div>`;
} else {
    document.getElementById("car-content").innerHTML = `
        <div class="no-data">
            <h2>No car selected</h2>
            <a href="carsale.html#cars" class="btn">Browse All Cars</a>
        </div>`;
}
