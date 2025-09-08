// app.js
document.addEventListener("DOMContentLoaded", function() {
  // Check if we're on the home page
  const chatBox = document.getElementById("chat-box");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const fileInput = document.getElementById("file-input");

  if (chatBox && userInput && sendBtn) {
    // Home page functionality
    function addMessage(sender, text) {
      const message = document.createElement("div");
      message.className = `message ${sender}`;
      message.innerText = text;
      chatBox.appendChild(message);
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Handle text questions
    sendBtn.addEventListener("click", async () => {
      const query = userInput.value.trim();
      if (!query) return;

      addMessage("user", query);
      userInput.value = "";

      try {
        const res = await fetch("http://localhost:5000/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        const data = await res.json();
        addMessage("bot", data.answer || "⚠️ No answer from server");
      } catch (err) {
        addMessage("bot", "❌ Error connecting to server");
        console.error(err);
      }
    });

    // Handle file uploads
    if (fileInput) {
      fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (file) {
          const message = `📂 File selected: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
          addMessage("user", message);
        }
      });
    }
  }

  // Load dark mode preference if exists
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
  }
  
  // Set default language if exists
  const defaultLanguage = localStorage.getItem("defaultLanguage");
  if (defaultLanguage) {
    const langSelect = document.getElementById("defaultLanguage");
    if (langSelect) {
      langSelect.value = defaultLanguage;
    }
  }
  
  // Set notifications preference if exists
  if (localStorage.getItem("notifications") === "true") {
    const notificationsToggle = document.getElementById("notificationsToggle");
    if (notificationsToggle) {
      notificationsToggle.checked = true;
    }
  }
});