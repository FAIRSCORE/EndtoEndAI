// settings.js
document.addEventListener("DOMContentLoaded", function() {
  const darkModeToggle = document.getElementById("darkModeToggle");
  const defaultLanguage = document.getElementById("defaultLanguage");
  const notificationsToggle = document.getElementById("notificationsToggle");
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");

  // Set current values
  if (darkModeToggle) {
    darkModeToggle.checked = localStorage.getItem("darkMode") === "true";
  }
  
  if (defaultLanguage) {
    defaultLanguage.value = localStorage.getItem("defaultLanguage") || "";
  }
  
  if (notificationsToggle) {
    notificationsToggle.checked = localStorage.getItem("notifications") === "true";
  }

  // Dark mode toggle
  if (darkModeToggle) {
    darkModeToggle.addEventListener("change", () => {
      localStorage.setItem("darkMode", darkModeToggle.checked);
      document.body.classList.toggle("dark", darkModeToggle.checked);
    });
  }

  // Default language selection
  if (defaultLanguage) {
    defaultLanguage.addEventListener("change", () => {
      localStorage.setItem("defaultLanguage", defaultLanguage.value);
    });
  }

  // Notifications toggle
  if (notificationsToggle) {
    notificationsToggle.addEventListener("change", () => {
      localStorage.setItem("notifications", notificationsToggle.checked);
      
      if (notificationsToggle.checked) {
        alert("Notifications enabled");
      }
    });
  }

  // Clear history button
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear all translation history?")) {
        localStorage.removeItem("translationHistory");
        alert("History cleared!");
      }
    });
  } 
  
  // Load dark mode preference if exists
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
  }
  
});