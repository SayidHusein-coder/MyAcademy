const USERS_KEY = "myacademy_users";
const SESSION_KEY = "myacademy_current_user";

const authModal = document.getElementById("authModal");
const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");
const authMessage = document.getElementById("authMessage");
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const registerTab = document.getElementById("registerTab");
const loginTab = document.getElementById("loginTab");

try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (
        session &&
        typeof session.name === "string" &&
        typeof session.email === "string"
    ) {
        window.location.replace("home.html");
    }
} catch (error) {
    console.error("Status sesi tidak dapat dibaca:", error);
}

function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (error) {
        console.error("Data pengguna tidak dapat dibaca:", error);
        return [];
    }
}

function saveUsers(users) {
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        return true;
    } catch (error) {
        console.error("Data pengguna tidak dapat disimpan:", error);
        return false;
    }
}

function openAuth(mode = "register") {
    authModal.classList.add("open");
    authModal.setAttribute("aria-hidden", "false");
    setAuthMode(mode);
    document.body.style.overflow = "hidden";
}

function closeAuth() {
    authModal.classList.remove("open");
    authModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    authMessage.textContent = "";
    authMessage.classList.remove("error");
}

function setAuthMode(mode) {
    const isLogin = mode === "login";
    registerForm.classList.toggle("active", !isLogin);
    loginForm.classList.toggle("active", isLogin);
    registerTab.classList.toggle("active", !isLogin);
    loginTab.classList.toggle("active", isLogin);
    registerTab.setAttribute("aria-selected", String(!isLogin));
    loginTab.setAttribute("aria-selected", String(isLogin));
    authTitle.textContent = isLogin ? "Selamat datang kembali" : "Mulai belajar bersama MyAcademy";
    authSubtitle.textContent = isLogin
        ? "Masuk untuk melanjutkan perjalanan belajar Anda."
        : "Daftar gratis dan nikmati pengalaman belajar yang lebih terarah.";
    authMessage.textContent = "";
    authMessage.classList.remove("error");
}

function showMessage(message, isError = false) {
    authMessage.textContent = message;
    authMessage.classList.toggle("error", isError);
}

document.getElementById("trialButton").addEventListener("click", () => openAuth("register"));
document.querySelector(".login-trigger").addEventListener("click", () => openAuth("login"));
document.getElementById("closeModal").addEventListener("click", closeAuth);
registerTab.addEventListener("click", () => setAuthMode("register"));
loginTab.addEventListener("click", () => setAuthMode("login"));

authModal.addEventListener("click", (event) => {
    if (event.target === authModal) closeAuth();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && authModal.classList.contains("open")) closeAuth();
});

registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(registerForm);
    const name = formData.get("name").trim();
    const email = formData.get("email").trim().toLowerCase();
    const password = formData.get("password");
    const users = getUsers();

    if (users.some((user) => user.email === email)) {
        showMessage("Email sudah terdaftar. Silakan masuk.", true);
        setAuthMode("login");
        document.getElementById("loginEmail").value = email;
        return;
    }

    users.push({
        name,
        email,
        password,
        registeredAt: new Date().toISOString()
    });

    if (!saveUsers(users)) {
        showMessage("Data belum tersimpan. Silakan coba lagi.", true);
        return;
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify({ name, email }));
    window.location.href = "home.html";
});

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const email = formData.get("email").trim().toLowerCase();
    const password = formData.get("password");
    const user = getUsers().find((item) => item.email === email && item.password === password);

    if (!user) {
        showMessage("Email atau kata sandi tidak sesuai.", true);
        return;
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email }));
    window.location.href = "home.html";
});