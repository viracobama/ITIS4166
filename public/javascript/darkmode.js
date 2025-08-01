// public/javascript/darkmode.js
// This script toggles dark mode on and off

document.addEventListener("DOMContentLoaded", function () {
  const checkbox = document.getElementById("darkModeToggle"); 
  const currentTheme = localStorage.getItem("theme");

  if (currentTheme === "dark") {
    document.body.classList.add("dark-mode");
    checkbox.checked = true;
  }

  checkbox.addEventListener("change", function () {
    const isDark = checkbox.checked;
    document.body.classList.toggle("dark-mode", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
});
