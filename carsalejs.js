
document.addEventListener("DOMContentLoaded", () => {

  if (window.MotorDealsAuth) {
    window.MotorDealsAuth.requireAuth();
  }

  const brandFilter = document.getElementById("brandFilter");
  const maxPriceInput = document.getElementById("maxPrice");
  const searchBtn = document.querySelector(".search-filter .btn");

  if (searchBtn) {
    searchBtn.addEventListener("click", filterCars);
  }


  function parsePriceINR(text) {
    if (!text) return 0;
    return parseInt(text.replace(/[₹,\s]/g, ""), 10) || 0;
  }

  function filterCars() {
    const brand = brandFilter ? brandFilter.value.toLowerCase() : "all";
    const maxPrice = maxPriceInput ? parseInt(maxPriceInput.value, 10) || Infinity : Infinity;

    const cards = document.querySelectorAll(".car-card");
    cards.forEach(card => {
      const title = (card.querySelector("h3") || {}).textContent || "";
      const priceEl = card.querySelector(".car-price");
      const price = priceEl ? parsePriceINR(priceEl.textContent) : 0;

      const brandMatch = brand === "all" || title.toLowerCase().includes(brand);
      const priceMatch = price <= maxPrice;

      card.style.display = (brandMatch && priceMatch) ? "" : "none";
    });
  }

  injectApprovedCars();

  function injectApprovedCars() {
    const grid = document.querySelector(".car-grid");
    if (!grid) return;

    const approved = JSON.parse(localStorage.getItem("approvedCars") || "[]");
    approved.forEach(car => {
      const card = document.createElement("div");
      card.className = "car-card";
      card.dataset.carId = car.id;
      card.innerHTML = `
        ${car.isSold ? '<div style="position: absolute; top:0; left:0; background:#ff3b30; color:#fff; padding: 5px 15px; font-weight:bold; z-index:10; border-top-left-radius: 10px; border-bottom-right-radius: 10px;">SOLD</div>' : ''}
        <div class="car-image">
          <img src="${car.image || 'https://via.placeholder.com/400x250?text=No+Photo'}"
               alt="${car.brand} ${car.model}"
               onerror="this.src='https://via.placeholder.com/400x250?text=No+Photo'">
        </div>
        <div class="car-info">
          <h3>${car.brand} ${car.model}</h3>
          <div class="car-details">
            <p><strong>Year:</strong> ${car.year}</p>
            <p><strong>Mileage:</strong> ${Number(car.mileage).toLocaleString("en-IN")} km</p>
            <p><strong>Color:</strong> ${car.color || "—"}</p>
            <p><strong>Fuel:</strong> ${car.fuel || "—"}</p>
          </div>
          <div class="car-price">₹${Number(car.price).toLocaleString("en-IN")}</div>
          <div class="car-actions">
            <a href="car-details-dynamic.html?id=${car.id}" class="btn btn-secondary">View Details</a>
            <a href="contact.html" class="btn">Contact Seller</a>
          </div>
        </div>`;
      grid.appendChild(card);
    });
  }

  const sellForm = document.querySelector(".sell-form");
  if (sellForm) {
    sellForm.addEventListener("submit", handleSellForm);
  }

  
  function handleSellForm(e) {
    e.preventDefault();

    
    function val(id) {
      const el = document.getElementById(id);
      return el ? el.value.trim() : "";
    }

    const car = {
      id:           "u_" + Date.now(),
      brand:        val("carBrand"),
      model:        val("carModel"),
      year:         val("carYear"),
      bodyType:     val("carBodyType"),
      color:        val("carColor"),
      condition:    val("carCondition"),
      fuel:         val("fuelType"),
      transmission: val("carTransmission"),
      engine:       val("carEngine"),
      mileage:      val("carMileage"),
      owners:       val("carOwners"),
      insurance:    val("carInsurance"),
      regNo:        val("carRegNo"),
      price:        val("carPrice"),
      negotiable:   val("carNegotiable"),
      image:        val("imageURL"),
      image2:       val("imageURL2"),
      image3:       val("imageURL3"),
      features:     val("carFeatures"),
      desc:         val("carDescription"),
      ownerName:    val("ownerName"),
      ownerPhone:   val("ownerPhone"),
      ownerEmail:   val("ownerEmail"),
      city:         val("ownerCity"),
      state:        val("ownerState"),
      submittedAt:  new Date().toISOString(),
      status:       "pending"
    };

    // Save to pendingCars
    const pending = JSON.parse(localStorage.getItem("pendingCars") || "[]");
    pending.push(car);
    localStorage.setItem("pendingCars", JSON.stringify(pending));

    // Success feedback
    alert("✅ Your listing has been submitted for admin approval!\n\nWe'll review it shortly and it will appear in the cars section once approved.");
    sellForm.reset();
  }

  window.openApprovalModal = function () {
    
    if (document.getElementById("approvalModal")) {
      renderApprovalModal();
      document.getElementById("approvalModal").style.display = "flex";
      return;
    }

    const modal = document.createElement("div");
    modal.id = "approvalModal";
    modal.style.cssText = `
      position:fixed;top:0;left:0;width:100%;height:100%;
      background:rgba(0,0,0,0.85);z-index:9999;
      display:flex;align-items:center;justify-content:center;
    `;
    modal.innerHTML = `
      <div style="background:#111;border:2px solid #d4af37;border-radius:16px;
                  max-width:900px;width:95%;max-height:85vh;overflow-y:auto;padding:30px;font-family:sans-serif;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h2 style="color:#d4af37;">🛡️ Admin Control Panel</h2>
          <div style="display:flex;gap:15px;align-items:center;">
            <button onclick="if(confirm('Reset all data?')){ localStorage.clear(); location.reload(); }" 
              style="background:#ff3b30;color:#fff;border:none;border-radius:20px;padding:8px 15px;font-weight:bold;cursor:pointer;font-size:0.85rem;">
              🧹 Reset Data
            </button>
            <button id="closeApprovalModal"
              style="background:none;border:none;color:#d4af37;font-size:2rem;cursor:pointer;">✕</button>
          </div>
        </div>
        
        <div style="display:flex;gap:20px;margin-bottom:20px;border-bottom:1px solid #333;padding-bottom:10px;flex-wrap:wrap;">
          <button id="tabListings" style="background:none;border:none;color:#d4af37;font-weight:bold;cursor:pointer;font-size:1.1rem;border-bottom:2px solid #d4af37;padding-bottom:5px;">Pending Listings</button>
          <button id="tabApproved" style="background:none;border:none;color:#888;font-weight:bold;cursor:pointer;font-size:1.1rem;padding-bottom:5px;">Approved Listings</button>
          <button id="tabMessages" style="background:none;border:none;color:#888;font-weight:bold;cursor:pointer;font-size:1.1rem;padding-bottom:5px;">Messages</button>
        </div>

        <div id="approvalList"></div>
        <div id="approvedList" style="display:none;"></div>
        <div id="messageList" style="display:none;"></div>
      </div>`;
    document.body.appendChild(modal);

    document.getElementById("closeApprovalModal").addEventListener("click", () => {
      modal.style.display = "none";
    });

    const tListings = document.getElementById("tabListings");
    const tApproved = document.getElementById("tabApproved");
    const tMessages = document.getElementById("tabMessages");
    
    const divListings = document.getElementById("approvalList");
    const divApproved = document.getElementById("approvedList");
    const divMessages = document.getElementById("messageList");

    function resetTabs() {
      tListings.style.color = "#888"; tListings.style.borderBottom = "none";
      tApproved.style.color = "#888"; tApproved.style.borderBottom = "none";
      tMessages.style.color = "#888"; tMessages.style.borderBottom = "none";
      divListings.style.display = "none";
      divApproved.style.display = "none";
      divMessages.style.display = "none";
    }

    tListings.addEventListener("click", () => {
      resetTabs();
      tListings.style.color = "#d4af37";
      tListings.style.borderBottom = "2px solid #d4af37";
      divListings.style.display = "block";
      renderApprovalModal();
    });

    tApproved.addEventListener("click", () => {
      resetTabs();
      tApproved.style.color = "#d4af37";
      tApproved.style.borderBottom = "2px solid #d4af37";
      divApproved.style.display = "block";
      renderApprovedListings();
    });

    tMessages.addEventListener("click", () => {
      resetTabs();
      tMessages.style.color = "#d4af37";
      tMessages.style.borderBottom = "2px solid #d4af37";
      divMessages.style.display = "block";
      renderAdminMessages();
    });

    modal.addEventListener("click", e => {
      if (e.target === modal) modal.style.display = "none";
    });

    renderApprovalModal();
  };

  /**
   * Retrieves all 'approvedCars' from localStorage and renders them in a list 
   * specifically formatted for the Admin Panel so the admin can review, delete, 
   * or mark them as Sold.
   */
  function renderApprovedListings() {
    const list = document.getElementById("approvedList");
    if (!list) return;
    const approved = JSON.parse(localStorage.getItem("approvedCars") || "[]");

    if (approved.length === 0) {
      list.innerHTML = `<p style="color:#aaa;text-align:center;padding:30px;">No approved listings yet.</p>`;
      return;
    }

    list.innerHTML = approved.map((car, i) => `
      <div style="background:#1a1a1a;border:1px solid #d4af37;border-radius:10px;padding:18px;margin-bottom:16px;color:#fff;">
        <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start;">
          <img src="${car.image || 'https://via.placeholder.com/120x80?text=No+Photo'}" style="width:120px;height:80px;object-fit:cover;border-radius:6px;border:1px solid #d4af37;">
          <div style="flex:1;min-width:200px;">
            <h3 style="color:#d4af37;margin-bottom:6px;">${car.brand} ${car.model} (${car.year}) ${car.isSold ? '<span style="color:#ff3b30; font-weight:bold;">[SOLD]</span>' : ''}</h3>
            <p style="color:#eee;font-size:.9rem;">₹${Number(car.price || 0).toLocaleString("en-IN")} | ${car.fuel} | ${car.mileage} km</p>
            <p style="color:#aaa;font-size:.85rem;margin-top:4px;">Seller: ${car.ownerName}</p>
          </div>
          <div>
            <button onclick="toggleSoldStatus('${car.id}')" style="background:${car.isSold ? '#333' : '#ff9500'};color:#fff;border:none;border-radius:20px;padding:8px 20px;font-weight:bold;cursor:pointer;">
              ${car.isSold ? 'Mark Available' : 'Mark Sold Out'}
            </button>
          </div>
        </div>
      </div>
    `).join("");
  }

  window.toggleSoldStatus = function(id) {
    let approved = JSON.parse(localStorage.getItem("approvedCars") || "[]");
    approved = approved.map(c => {
      if (c.id === id) c.isSold = !c.isSold;
      return c;
    });
    localStorage.setItem("approvedCars", JSON.stringify(approved));
    renderApprovedListings();
    injectApprovedCars(); // update UI cards immediately
  };

  function renderAdminMessages() {
    const list = document.getElementById("messageList");
    if (!list) return;
    const msgs = JSON.parse(localStorage.getItem("adminMessages") || "[]");

    if (msgs.length === 0) {
      list.innerHTML = `<p style="color:#aaa;text-align:center;padding:30px;">No messages received.</p>`;
      return;
    }

    list.innerHTML = msgs.map((msg, i) => `
      <div style="background:#1a1a1a;border:1px solid #d4af37;border-radius:10px;
                  padding:18px;margin-bottom:16px;color:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
          <div>
            <h3 style="color:#d4af37;">${msg.subject || "No Subject"}</h3>
            <p style="color:#eee;font-size:0.95rem;margin-top:4px;">From: <strong>${msg.firstName} ${msg.lastName}</strong> (${msg.email})</p>
            ${msg.phone ? `<p style="color:#aaa;font-size:0.9rem;">Phone: ${msg.phone}</p>` : ''}
          </div>
          <button onclick="deleteMessage(${i})" style="background:#ff3b30;color:#fff;border:none;border-radius:5px;padding:5px 10px;cursor:pointer;font-size:0.85rem;">Delete</button>
        </div>
        <div style="background:#222;padding:15px;border-radius:8px;border-left:3px solid #d4af37;margin-top:10px;white-space:pre-wrap;">${msg.message}</div>
        <p style="color:#888;font-size:0.8rem;margin-top:10px;text-align:right;">Received: ${new Date(msg.submittedAt).toLocaleString()}</p>
      </div>
    `).join("");
  }

  window.deleteMessage = function(index) {
    const msgs = JSON.parse(localStorage.getItem("adminMessages") || "[]");
    msgs.splice(index, 1);
    localStorage.setItem("adminMessages", JSON.stringify(msgs));
    renderAdminMessages();
  };

  function renderApprovalModal() {
    const list = document.getElementById("approvalList");
    if (!list) return;
    const pending = JSON.parse(localStorage.getItem("pendingCars") || "[]");

    if (pending.length === 0) {
      list.innerHTML = `<p style="color:#aaa;text-align:center;padding:30px;">No pending listings.</p>`;
      return;
    }

    list.innerHTML = pending.map((car, i) => `
      <div style="background:#1a1a1a;border:1px solid #d4af37;border-radius:10px;
                  padding:18px;margin-bottom:16px;">
        <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start;">
          <img src="${car.image || 'https://via.placeholder.com/120x80?text=No+Photo'}"
               onerror="this.src='https://via.placeholder.com/120x80?text=No+Photo'"
               style="width:120px;height:80px;object-fit:cover;border-radius:6px;border:1px solid #d4af37;">
          <div style="flex:1;min-width:200px;">
            <h3 style="color:#d4af37;margin-bottom:6px;">${car.brand} ${car.model} (${car.year})</h3>
            <p style="color:#eee;font-size:.9rem;">
              ₹${Number(car.price || 0).toLocaleString("en-IN")} &nbsp;|&nbsp;
              ${car.fuel || "—"} &nbsp;|&nbsp; ${car.mileage} km
            </p>
            <p style="color:#aaa;font-size:.85rem;margin-top:4px;">
              Seller: ${car.ownerName || "—"} · ${car.ownerPhone || "—"}
            </p>
            <p style="color:#888;font-size:.8rem;">Submitted: ${new Date(car.submittedAt).toLocaleString()}</p>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <button onclick="approveCar(${i})"
              style="background:linear-gradient(135deg,#d4af37,#f4d03f);color:#000;border:none;
                     border-radius:20px;padding:8px 20px;font-weight:bold;cursor:pointer;">
              ✅ Approve
            </button>
            <button onclick="rejectCar(${i})"
              style="background:#333;color:#d4af37;border:1px solid #d4af37;
                     border-radius:20px;padding:8px 20px;font-weight:bold;cursor:pointer;">
              ❌ Reject
            </button>
          </div>
        </div>
      </div>
    `).join("");
  }

  window.approveCar = function (index) {
    const pending = JSON.parse(localStorage.getItem("pendingCars") || "[]");
    const car = pending.splice(index, 1)[0];
    if (!car) return;
    car.status = "approved";
    const approved = JSON.parse(localStorage.getItem("approvedCars") || "[]");
    approved.push(car);
    localStorage.setItem("approvedCars", JSON.stringify(approved));
    localStorage.setItem("pendingCars", JSON.stringify(pending));
    renderApprovalModal();
    // Inject the new card immediately without reload
    const grid = document.querySelector(".car-grid");
    if (grid) {
      const card = document.createElement("div");
      card.className = "car-card";
      card.dataset.carId = car.id;
      card.innerHTML = `
        <div class="car-image">
          <img src="${car.image || 'https://via.placeholder.com/400x250?text=No+Photo'}"
               alt="${car.brand} ${car.model}"
               onerror="this.src='https://via.placeholder.com/400x250?text=No+Photo'">
        </div>
        <div class="car-info">
          <h3>${car.brand} ${car.model}</h3>
          <div class="car-details">
            <p><strong>Year:</strong> ${car.year}</p>
            <p><strong>Mileage:</strong> ${Number(car.mileage).toLocaleString("en-IN")} km</p>
            <p><strong>Color:</strong> ${car.color || "—"}</p>
            <p><strong>Fuel:</strong> ${car.fuel || "—"}</p>
          </div>
          <div class="car-price">₹${Number(car.price).toLocaleString("en-IN")}</div>
          <div class="car-actions">
            <a href="car-details-dynamic.html?id=${car.id}" class="btn btn-secondary">View Details</a>
            <a href="contact.html" class="btn">Contact Seller</a>
          </div>
        </div>`;
      grid.appendChild(card);
    }
  };

  window.rejectCar = function (index) {
    const pending = JSON.parse(localStorage.getItem("pendingCars") || "[]");
    pending.splice(index, 1);
    localStorage.setItem("pendingCars", JSON.stringify(pending));
    renderApprovalModal();
  };

  /* ── SIMPLE CHATBOT ── */
  /**
   * Chatbot Initialization.
   * Creates a floating chatbot widget injected directly into the DOM using vanilla JS.
   * Features interactive suggestion chips and an automated switch-case responder.
   */
  function initChatbot() {
    const botHTML = `
      <div id="md-chat-widget" style="position:fixed; bottom:30px; left:30px; z-index:9999; font-family:sans-serif;">
        <button id="md-chat-toggle" style="background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer; box-shadow: 0 4px 15px rgba(212,175,55,0.4); font-size: 24px; color: #000; display:flex; align-items:center; justify-content:center;">💬</button>
        
        <div id="md-chat-window" style="display:none; position:absolute; bottom: 80px; left: 0; width: 300px; height: 400px; background: #111; border: 2px solid #d4af37; border-radius: 15px; flex-direction: column; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <div style="background: #d4af37; color: #000; padding: 15px; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
            <span>🤖 MotorDeals Assistant</span>
            <button id="md-chat-close" style="background:none; border:none; color:#000; font-size: 20px; cursor: pointer;">✕</button>
          </div>
          
          <div id="md-chat-messages" style="flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;">
            <div style="background: #222; color: #d4af37; padding: 10px; border-radius: 10px; max-width: 80%; align-self: flex-start; font-size: 0.9rem;">
              Hi! I'm the MotorDeals assistant. How can I help you today?
            </div>
          </div>
          
          <div id="md-chat-suggestions" style="padding: 10px; background: #1a1a1a; display: flex; flex-wrap: wrap; gap: 8px; border-top: 1px solid #333;">
            <button class="md-chat-sugg" style="background: #333; color: #d4af37; border: 1px solid #d4af37; border-radius: 15px; padding: 5px 10px; font-size: 0.8rem; cursor: pointer;">Buy a Car</button>
            <button class="md-chat-sugg" style="background: #333; color: #d4af37; border: 1px solid #d4af37; border-radius: 15px; padding: 5px 10px; font-size: 0.8rem; cursor: pointer;">Sell my Car</button>
            <button class="md-chat-sugg" style="background: #333; color: #d4af37; border: 1px solid #d4af37; border-radius: 15px; padding: 5px 10px; font-size: 0.8rem; cursor: pointer;">Contact Admin</button>
          </div>
          
          <div style="padding: 10px; background: #1a1a1a; display: flex;">
            <input type="text" id="md-chat-input" placeholder="Type a message..." style="flex: 1; padding: 8px 12px; border: 1px solid #333; border-radius: 20px; background: #222; color: #fff; outline: none;">
            <button id="md-chat-send" style="background: #d4af37; color: #000; border: none; padding: 8px 15px; border-radius: 20px; margin-left: 10px; cursor: pointer; font-weight: bold;">Send</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", botHTML);

    const toggleBtn = document.getElementById("md-chat-toggle");
    const closeBtn = document.getElementById("md-chat-close");
    const chatWindow = document.getElementById("md-chat-window");
    const inputField = document.getElementById("md-chat-input");
    const sendBtn = document.getElementById("md-chat-send");
    const messagesContainer = document.getElementById("md-chat-messages");

    function toggleChat() {
      chatWindow.style.display = chatWindow.style.display === "none" ? "flex" : "none";
    }

    toggleBtn.addEventListener("click", toggleChat);
    closeBtn.addEventListener("click", () => chatWindow.style.display = "none");

    function addMessage(text, sender) {
      const msgDiv = document.createElement("div");
      msgDiv.style.padding = "10px";
      msgDiv.style.borderRadius = "10px";
      msgDiv.style.maxWidth = "80%";
      msgDiv.style.fontSize = "0.9rem";
      msgDiv.style.marginBottom = "5px";
      
      if (sender === "user") {
        msgDiv.style.background = "#d4af37";
        msgDiv.style.color = "#000";
        msgDiv.style.alignSelf = "flex-end";
      } else {
        msgDiv.style.background = "#222";
        msgDiv.style.color = "#d4af37";
        msgDiv.style.alignSelf = "flex-start";
      }
      
      msgDiv.textContent = text;
      messagesContainer.appendChild(msgDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function handleUserInput() {
      const text = inputField.value.trim();
      if (!text) return;
      
      addMessage(text, "user");
      inputField.value = "";
      
      setTimeout(() => {
        const lowerText = text.toLowerCase();
        let reply = "I'm sorry, I don't understand. Try asking about 'cars', 'sell', 'contact', or 'admin'.";
        
        if (lowerText.includes("car") || lowerText.includes("buy")) {
          reply = "You can browse all our available cars on the home page! Click 'Cars' in the navigation.";
        } else if (lowerText.includes("sell")) {
          reply = "Looking to sell your car? Navigate to the 'Sell Car' section to fill out a listing form.";
        } else if (lowerText.includes("contact") || lowerText.includes("support") || lowerText.includes("admin")) {
          reply = "You can reach us through the 'Contact' page, or if you are an admin, click the 'Admin' link in the top right to open the control panel.";
        } else if (lowerText.includes("hello") || lowerText.includes("hi")) {
          reply = "Hello there! How can I assist you with MotorDeals today?";
        }
        
        addMessage(reply, "bot");
      }, 600);
    }

    sendBtn.addEventListener("click", handleUserInput);
    inputField.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleUserInput();
    });

    document.querySelectorAll(".md-chat-sugg").forEach(btn => {
      btn.addEventListener("click", () => {
        inputField.value = btn.textContent;
        handleUserInput();
      });
    });
  }

  initChatbot();

}); // end DOMContentLoaded







