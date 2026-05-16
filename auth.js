
const USERS_KEY   = "md_users";
const SESSION_KEY = "md_session";

const ADMIN = {
  firstName: "Gurrahmat",
  lastName:  "Sandhu",
  email:     "MotorDeal@gmail.com",
  phone:     "8340058000",
  role:      "admin",
  password:  lightHash("MotorDealer"),
  createdAt: "2026-01-01T00:00:00.000Z"
};


function lightHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
  return "h_" + Math.abs(h).toString(16) + "_" + str.length;
}

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; }
}

function saveUsers(list) { localStorage.setItem(USERS_KEY, JSON.stringify(list)); }


function findUser(email) {
  if (email.toLowerCase() === ADMIN.email.toLowerCase()) return ADMIN;
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}


function setSession(user) {
  const payload = {
    email:     user.email,
    firstName: user.firstName,
    lastName:  user.lastName,
    role:      user.role || "user",
    loggedInAt: Date.now()
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
}


function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
}


function clearSession() { localStorage.removeItem(SESSION_KEY); }

function isAdmin() { const s = getSession(); return s && s.role === "admin"; }

function showAlert(type, msg) {
  const box = document.getElementById("authAlert");
  if (!box) return;
  box.className = "auth-alert " + type;
  box.textContent = msg;
  box.style.display = "block";
}
function hideAlert() {
  const box = document.getElementById("authAlert");
  if (box) box.style.display = "none";
}


function scorePassword(pwd) {
  let s = 0;
  if (pwd.length >= 6)  s++;
  if (pwd.length >= 10) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
}


function injectNavUser() {
  const session = getSession();
  const navUl = document.querySelector("nav ul");
  if (!navUl) return;

  
  navUl.querySelectorAll("a[href='login.html'], a[href='signup.html']").forEach(a => a.parentElement.remove());

  if (session) {
   
    navUl.querySelectorAll(".nav-auth-item").forEach(el => el.remove());

    const greeting = document.createElement("li");
    greeting.className = "nav-auth-item";
    greeting.innerHTML = `<span style="color:#f4d03f;font-weight:bold;">
      ${session.role === "admin" ? "👑 Gurrahmat" : "👤 " + session.firstName}
    </span>`;
    navUl.appendChild(greeting);

    if (session.role === "admin") {
      const adminLi = document.createElement("li");
      adminLi.className = "nav-auth-item";
      adminLi.innerHTML = `<a href="#" id="admin-nav-link" style="color:#d4af37;">🛡️ Admin</a>`;
      navUl.appendChild(adminLi);

      const resetDiv = document.getElementById("adminResetContainer");
      if (resetDiv) resetDiv.style.display = "block";
    }

    const logoutLi = document.createElement("li");
    logoutLi.className = "nav-auth-item";
    logoutLi.innerHTML = `<a href="#" id="logout-btn" style="color:#d4af37;">Logout</a>`;
    navUl.appendChild(logoutLi);

    document.getElementById("logout-btn").addEventListener("click", e => {
      e.preventDefault();
      clearSession();
      window.location.href = "login.html";
    });

    const adminLink = document.getElementById("admin-nav-link");
    if (adminLink) {
      adminLink.addEventListener("click", e => {
        e.preventDefault();
        if (typeof openApprovalModal === "function") openApprovalModal();
      });
    }
  } else {
    
    navUl.querySelectorAll(".nav-auth-item").forEach(el => el.remove());
    const li = document.createElement("li");
    li.className = "nav-auth-item";
    li.innerHTML = `<a href="login.html" class="btn" style="padding:7px 20px;font-size:.85rem;">Login / Sign Up</a>`;
    navUl.appendChild(li);
  }
}

function requireAuth() {
  const exempt = ["login.html", "signup.html"];
  const page   = window.location.pathname.split("/").pop() || "index.html";
  if (exempt.includes(page)) return;
  if (!getSession()) {
    window.location.href = "login.html";
  }
}


function initAuthPage() {

  const loginTab  = document.getElementById("tab-login");
  const signupTab = document.getElementById("tab-signup");
  const loginPane = document.getElementById("pane-login");
  const signupPane= document.getElementById("pane-signup");

  function showTab(tab) {
    hideAlert();
    if (tab === "login") {
      loginTab.classList.add("active-tab");
      signupTab.classList.remove("active-tab");
      loginPane.style.display  = "flex";
      signupPane.style.display = "none";
    } else {
      signupTab.classList.add("active-tab");
      loginTab.classList.remove("active-tab");
      signupPane.style.display = "flex";
      loginPane.style.display  = "none";
    }
  }

  if (loginTab)  loginTab.addEventListener("click",  () => showTab("login"));
  if (signupTab) signupTab.addEventListener("click",  () => showTab("signup"));

  const urlTab = new URLSearchParams(window.location.search).get("tab");
  if (urlTab === "signup") showTab("signup");

  document.querySelectorAll(".toggle-password").forEach(btn => {
    btn.addEventListener("click", () => {
      const inp = document.getElementById(btn.dataset.target);
      if (!inp) return;
      const show = inp.type === "password";
      inp.type   = show ? "text" : "password";
      btn.textContent = show ? "🙈" : "👁️";
    });
  });


  const pwdInp = document.getElementById("signupPassword");
  const bar    = document.getElementById("strengthBar");
  const txt    = document.getElementById("strengthText");
  if (pwdInp && bar) {
    pwdInp.addEventListener("input", () => {
      const lvls = [
        { w:"0%",   c:"#e5e5e5", t:"Password strength" },
        { w:"20%",  c:"#e53935", t:"Very weak" },
        { w:"40%",  c:"#fb8c00", t:"Weak" },
        { w:"60%",  c:"#fdd835", t:"Okay" },
        { w:"80%",  c:"#43a047", t:"Strong" },
        { w:"100%", c:"#2e7d32", t:"Very strong 💪" },
      ];
      const l = lvls[scorePassword(pwdInp.value)];
      bar.style.width = l.w; bar.style.background = l.c;
      if (txt) txt.textContent = l.t;
    });
  }

  /* ── LOGIN ── */
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", e => {
      e.preventDefault(); hideAlert();
      const email    = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;
      if (!/^\S+@\S+\.\S+$/.test(email)) return showAlert("error", "Enter a valid email.");
      if (password.length < 6) return showAlert("error", "Password must be at least 6 characters.");
      const user = findUser(email);
      if (!user || user.password !== lightHash(password))
        return showAlert("error", "❌ Invalid email or password.");
      setSession(user);
      showAlert("success", `✅ Welcome back, ${user.firstName}! Redirecting…`);
      setTimeout(() => { window.location.href = "index.html"; }, 1000);
    });

    const forgot = document.getElementById("forgotLink");
    if (forgot) {
      forgot.addEventListener("click", e => {
        e.preventDefault();
        const email = prompt("Enter your registered email:");
        if (!email) return;
        const u = findUser(email.trim());
        alert(u
          ? "✅ Reset link sent to " + u.email + "\n(Demo: integrate email service in production.)"
          : "❌ No account with that email.");
      });q
    }
  }

  /* ── SIGNUP ── */
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", e => {
      e.preventDefault(); hideAlert();
      const firstName = document.getElementById("firstName").value.trim();
      const lastName  = document.getElementById("lastName").value.trim();
      const email     = document.getElementById("signupEmail").value.trim();
      const phone     = document.getElementById("signupPhone").value.trim();
      const password  = document.getElementById("signupPassword").value;
      const confirm   = document.getElementById("confirmPassword").value;
      const agree     = document.getElementById("agreeTerms").checked;

      if (!firstName || !lastName) return showAlert("error", "Enter your full name.");
      if (!/^\S+@\S+\.\S+$/.test(email)) return showAlert("error", "Enter a valid email.");
      if (password.length < 6) return showAlert("error", "Password must be at least 6 characters.");
      if (password !== confirm) return showAlert("error", "Passwords do not match.");
      if (!agree) return showAlert("error", "Please accept the Terms of Service.");
      if (findUser(email)) return showAlert("error", "Account already exists. Please login.");

      const newUser = { firstName, lastName, email, phone, role: "user",
        password: lightHash(password), createdAt: new Date().toISOString() };
      const users = getUsers(); users.push(newUser); saveUsers(users);
      setSession(newUser);
      showAlert("success", "🎉 Account created! Redirecting…");
      setTimeout(() => { window.location.href = "index.html"; }, 1000);
    });
  }
}

window.MotorDealsAuth = { getSession, clearSession, findUser, isAdmin, setSession, requireAuth };

document.addEventListener("DOMContentLoaded", () => {
  requireAuth();
  injectNavUser();
  if (document.getElementById("loginForm") || document.getElementById("signupForm")) {

    if (getSession()) { window.location.href = "index.html"; return; }
    initAuthPage();
  }

 
  const contactForm = document.querySelector(".contact-form-container form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const msg = {
        id: Date.now(),
        firstName: document.getElementById("firstName") ? document.getElementById("firstName").value : "",
        lastName: document.getElementById("lastName") ? document.getElementById("lastName").value : "",
        email: document.getElementById("email") ? document.getElementById("email").value : "",
        phone: document.getElementById("phone") ? document.getElementById("phone").value : "",
        subject: document.getElementById("subject") ? document.getElementById("subject").value : "",
        message: document.getElementById("message") ? document.getElementById("message").value : "",
        submittedAt: new Date().toISOString()
      };

      const msgs = JSON.parse(localStorage.getItem("adminMessages") || "[]");
      msgs.push(msg);
      localStorage.setItem("adminMessages", JSON.stringify(msgs));
      
      alert("✅ Message sent successfully! Admin will get back shortly.");
      contactForm.reset();
    });
  }
});










