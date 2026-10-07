const profileForm = document.querySelector("[data-profile-form]");
const profileMessage = document.querySelector("[data-profile-message]");

const fields = {
  nickname: document.querySelector("[data-profile-nickname]"),
  fullName: document.querySelector("[data-profile-full-name]"),
  className: document.querySelector("[data-profile-class]"),
  goal: document.querySelector("[data-profile-goal]"),
  email: document.querySelector("[data-profile-email]")
};

const detailSelectors = {
  nickname: "[data-detail-nickname]",
  fullName: "[data-detail-full-name]",
  className: "[data-detail-class]",
  goal: "[data-detail-goal]",
  email: "[data-detail-email]"
};

function readSavedProfile() {
  return window.myAcademyReadProfile?.() || {};
}

function getInitials(name) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function displayProfile(profile) {
  const displayName = profile.nickname || profile.fullName;
  const details = {
    nickname: profile.nickname || "-",
    fullName: profile.fullName || "-",
    className: profile.className || "-",
    goal: profile.goal || "-",
    email: profile.email || "-"
  };

  document.querySelectorAll("[data-profile-name]").forEach((element) => {
    element.textContent = displayName;
  });
  document.querySelectorAll("[data-profile-avatar]").forEach((element) => {
    element.textContent = getInitials(displayName);
  });

  Object.entries(details).forEach(([key, value]) => {
    const element = document.querySelector(detailSelectors[key]);
    if (element) element.textContent = value;
  });
}

const savedProfile = readSavedProfile();
fields.nickname.value =
  savedProfile.nickname ||
  window.myAcademyCurrentUser?.name ||
  "";
fields.fullName.value = savedProfile.fullName || window.myAcademyCurrentUser?.name || "";
fields.className.value = savedProfile.className || "";
fields.goal.value = savedProfile.goal || "";
fields.email.value = savedProfile.email || window.myAcademyCurrentUser?.email || "";

displayProfile({
  nickname: fields.nickname.value,
  fullName: fields.fullName.value,
  className: fields.className.value,
  goal: fields.goal.value,
  email: fields.email.value
});

profileForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const profile = {
    nickname: fields.nickname.value.trim(),
    fullName: fields.fullName.value.trim(),
    className: fields.className.value.trim(),
    goal: fields.goal.value.trim(),
    email: fields.email.value.trim()
  };

  if (!profile.nickname || !profile.fullName || !profile.email) return;

  localStorage.setItem(window.myAcademyProfileKey, JSON.stringify(profile));
  displayProfile(profile);
  profileMessage.textContent = "Informasi profil berhasil disimpan.";
});
