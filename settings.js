const passwordForm = document.querySelector("[data-password-form]");
const passwordMessage = document.querySelector("[data-password-message]");
const logoutButton = document.querySelector("[data-logout]");
const logoutMessage = document.querySelector("[data-logout-message]");
const currentPassword = document.querySelector("[data-current-password]");
const newPassword = document.querySelector("[data-new-password]");
const confirmPassword = document.querySelector("[data-confirm-password]");

function showPasswordMessage(message, isError = false) {
  passwordMessage.textContent = message;
  passwordMessage.className = `profile-message${isError ? " error-message" : ""}`;
}

passwordForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const savedPassword = localStorage.getItem("myAcademyPassword") || "myacademy";

  if (currentPassword.value !== savedPassword) {
    showPasswordMessage("Password saat ini salah.", true);
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    showPasswordMessage("Konfirmasi password tidak sama.", true);
    return;
  }

  localStorage.setItem("myAcademyPassword", newPassword.value);
  passwordForm.reset();
  showPasswordMessage("Password berhasil diganti.");
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("myacademy_current_user");
  logoutMessage.textContent = "Anda sudah logout.";

  window.setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 700);
});
