
document.addEventListener("DOMContentLoaded", () => {
 
    let compareList = JSON.parse(localStorage.getItem("compareList") || "[]");


    const floatingBar = document.createElement("div");
    floatingBar.id = "compare-floating-bar";
    floatingBar.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: rgba(0, 0, 0, 0.9);
        border: 2px solid #d4af37;
        border-radius: 50px;
        padding: 15px 30px;
        z-index: 2000;
        display: none;
        box-shadow: 0 4px 20px rgba(212, 175, 55, 0.5);
        align-items: center;
        gap: 15px;
        font-family: sans-serif;
    `;
    floatingBar.innerHTML = `
        <span id="compare-count" style="color: #fff; font-weight: bold;">0 Cars Selected</span>
        <button id="compare-action-btn" style="
            background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%);
            color: #000;
            border: none;
            padding: 8px 20px;
            border-radius: 50px;
            font-weight: bold;
            cursor: pointer;
            transition: 0.3s;
        ">Compare Now</button>
    `;
    document.body.appendChild(floatingBar);

    const countEl = document.getElementById("compare-count");
    const actionBtn = document.getElementById("compare-action-btn");

    actionBtn.addEventListener("click", () => {
        window.location.href = "compare.html";
    });

    function updateFloatingBar() {
        if (compareList.length > 0) {
            floatingBar.style.display = "flex";
            countEl.textContent = `${compareList.length} Car${compareList.length > 1 ? 's' : ''} Selected`;
        } else {
            floatingBar.style.display = "none";
        }
    }

  
    function injectCompareButtons() {
       
        const staticMap = {
            "car-details-1.html": "c1",
            "car-details-2.html": "c2",
            "car-details-3.html": "c3",
            "car-details-4.html": "c4",
            "car-details-5.html": "c5",
            "car-details-6.html": "c6",
        };

        const cards = document.querySelectorAll(".car-card");
        cards.forEach(card => {
            if (card.querySelector(".compare-btn")) return;

            const actions = card.querySelector(".car-actions");
            if (!actions) return;

            let id = card.dataset.carId;
            if (!id) {
                const link = card.querySelector("a[href^='car-details-']");
                if (link) {
                    const href = link.getAttribute("href").split("?")[0];
                    id = staticMap[href];
                }
            }

            if (!id) return;

            card.style.position = "relative";

            const checkboxContainer = document.createElement("div");
            checkboxContainer.className = "compare-checkbox-container compare-btn"; 
            checkboxContainer.style.cssText = `
                position: absolute;
                top: 15px;
                right: 15px;
                z-index: 10;
                background: rgba(0, 0, 0, 0.75);
                padding: 6px 10px;
                border-radius: 8px;
                border: 1px solid #d4af37;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.5);
            `;

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `compare-chk-${id}`;
            checkbox.checked = compareList.includes(id);
            checkbox.style.cssText = `
                width: 18px;
                height: 18px;
                accent-color: #d4af37;
                cursor: pointer;
            `;

            const label = document.createElement("label");
            label.htmlFor = `compare-chk-${id}`;
            label.textContent = "Compare";
            label.style.cssText = `
                color: #d4af37;
                font-size: 0.85rem;
                cursor: pointer;
                font-weight: bold;
                user-select: none;
            `;
            checkbox.addEventListener("change", (e) => {
                if (checkbox.checked) {
                   
                    if (compareList.length >= 3) {
                        alert("You can compare up to 3 cars max.");
                        checkbox.checked = false;
                        return;
                    }
                    compareList.push(id);
                } else {
                   
                    compareList = compareList.filter(item => item !== id);
                }
                localStorage.setItem("compareList", JSON.stringify(compareList));
                updateFloatingBar();
            });

            
            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(label);
            card.appendChild(checkboxContainer);
        });
    }

  
    injectCompareButtons();
    updateFloatingBar();

    
    const observer = new MutationObserver(() => {
        injectCompareButtons();
    });
    const grid = document.querySelector(".car-grid");
    if (grid) {
        observer.observe(grid, { childList: true });
    }
});





