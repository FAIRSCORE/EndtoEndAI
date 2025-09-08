// history.js
document.addEventListener("DOMContentLoaded", function() {
  const historyBox = document.getElementById("historyBox");
  
  // Load dark mode preference if exists
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
  }
  
  if (historyBox) {
    // Load history from localStorage
    const history = JSON.parse(localStorage.getItem("translationHistory") || "[]");
    
    if (history.length === 0) {
      historyBox.innerHTML = "<p>No history yet</p>";
      return;
    }
    
    // Create history list
    const historyList = document.createElement("ul");
    historyList.className = "history-list";
    
    history.forEach(item => {
      const listItem = document.createElement("li");
      listItem.className = "history-item";
      
      const date = new Date(item.timestamp);
      const formattedDate = date.toLocaleDateString() + " " + date.toLocaleTimeString();
      
      listItem.innerHTML = `
        <p><strong>Original:</strong> ${item.original}</p>
        <p><strong>Translation (${item.language.toLowerCase()}):</strong> ${item.translation}</p>
        <small>${formattedDate}</small>
      `;
      
      historyList.appendChild(listItem);
    });
    
    historyBox.innerHTML = "";
    historyBox.appendChild(historyList);
  } 
 
});