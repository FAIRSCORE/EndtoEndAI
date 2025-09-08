document.addEventListener('DOMContentLoaded', function() {
            const translateBtn = document.getElementById('translateBtn');
            const translatorInput = document.getElementById('translatorInput');
            const languageSelect = document.getElementById('language-select');
            const translationOutput = document.getElementById('translation-output');
            const notification = document.getElementById('notification');
            const micBtn = document.getElementById('micBtn');
            const micStatus = document.getElementById('micStatus');
            const themeToggle = document.getElementById('themeToggle');
            
            // Check browser support for speech recognition
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            let recognition = null;
            
            if (SpeechRecognition) {
                recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.lang = 'en-US';
                recognition.interimResults = false;
                recognition.maxAlternatives = 1;
            } else {
                micBtn.disabled = true;
                micStatus.textContent = "Speech recognition not supported in this browser";
            }
            
            // Show notification function
            function showNotification(message) {
                notification.textContent = message;
                notification.classList.add('show');
                
                setTimeout(() => {
                    notification.classList.remove('show');
                }, 3000);
            }
            
            // Language names for display
            const languageNames = {
                en: "English",
                es: "Spanish",
                fr: "French",
                de: "German",
                pt: "Portuguese",
                nl: "Dutch"
            };
            
           // Translation function using unofficial API
async function translateText(text, targetLang) {
    try {
        // Using AllOrigins proxy
        const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;

        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error(`Translation API error: ${response.status}`);
        }

        const proxyData = await response.json();
        const data = JSON.parse(proxyData.contents);  // AllOrigins wraps response inside "contents"

        let translatedText = '';
        if (data && data[0]) {
            data[0].forEach(item => {
                if (item[0]) {
                    translatedText += item[0];
                }
            });
        }

        return translatedText || text;
    } catch (error) {
        console.error("Translation error:", error);
        throw new Error("Failed to translate text. Please try again later.");
    }
}

            
            // Translate Button
            if (translateBtn) {
                translateBtn.addEventListener("click", async () => {
                    const text = translatorInput.value.trim();
                    const targetLang = languageSelect.value;
                    
                    if (!text) {
                        showNotification("Please enter text to translate.");
                        return;
                    }
                    
                    if (!targetLang) {
                        showNotification("Please select a target language.");
                        return;
                    }
                    
                    try {
                        // Show loading state
                        translationOutput.innerHTML = `
                            <h3>Translating...</h3>
                            <p>Please wait while we translate your text.</p>
                        `;
                        translationOutput.style.display = 'block';
                        
                        // Get translation from API
                        const translation = await translateText(text, targetLang);
                        
                        // Display translation
                        translationOutput.innerHTML = `
                            <h3>Translation:</h3>
                            <p class="original-text">Original: ${text}</p>
                            <p class="translated-text">Translation: ${translation}</p>
                            <div class="language-info">
                                <span>From: Auto-detected</span>
                                <span>To: ${languageNames[targetLang]}</span>
                            </div>
                        `;
                        // Save to history
let history = JSON.parse(localStorage.getItem("translationHistory") || "[]");
history.unshift({
    original: text,
    translation: translation,
    language: targetLang,
    timestamp: Date.now()
});

// Keep only last 20 items
history = history.slice(0, 20);

localStorage.setItem("translationHistory", JSON.stringify(history));

                        
                    } catch (error) {
                        console.error("Translation error:", error);
                        translationOutput.innerHTML = `
                            <p>Error occurred during translation: ${error.message}</p>
                            <p>Please try again later or check your internet connection.</p>
                        `;
                        translationOutput.style.display = 'block';
                    }
                });
            }
            
            // Voice to Text functionality
            if (micBtn && recognition) {
                micBtn.addEventListener('click', () => {
                    if (micBtn.classList.contains('listening')) {
                        // Stop listening if already listening
                        recognition.stop();
                        micBtn.classList.remove('listening');
                        micStatus.textContent = "";
                    } else {
                        // Start listening
                        try {
                            recognition.start();
                            micBtn.classList.add('listening');
                            micStatus.textContent = "Listening... Speak now";
                            micStatus.style.color = "#ff4757";
                            
                            // Set a timeout to stop listening after 10 seconds
                            setTimeout(() => {
                                if (micBtn.classList.contains('listening')) {
                                    recognition.stop();
                                    micBtn.classList.remove('listening');
                                    micStatus.textContent = "Listening stopped after 10 seconds";
                                    setTimeout(() => { micStatus.textContent = ""; }, 3000);
                                }
                            }, 10000);
                        } catch (err) {
                            console.error("Speech recognition error:", err);
                            micStatus.textContent = "Error accessing microphone";
                            setTimeout(() => { micStatus.textContent = ""; }, 3000);
                        }
                    }
                });
                
                // Speech recognition event handlers
                recognition.onresult = function(event) {
                    const transcript = event.results[0][0].transcript;
                    translatorInput.value = transcript;
                    micStatus.textContent = "Speech recognized";
                    micStatus.style.color = "#28a745";
                    setTimeout(() => { micStatus.textContent = ""; }, 3000);
                };
                
                recognition.onerror = function(event) {
                    console.error('Speech recognition error', event.error);
                    micBtn.classList.remove('listening');
                    micStatus.textContent = `Error: ${event.error}`;
                    setTimeout(() => { micStatus.textContent = ""; }, 3000);
                };
                
                recognition.onend = function() {
                    micBtn.classList.remove('listening');
                };
            } else if (micBtn) {
                // If speech recognition is not supported
                micBtn.addEventListener('click', () => {
                    showNotification("Speech recognition is not supported in your browser");
                });
            }     
  // Load dark mode preference if exists
         if (localStorage.getItem("darkMode") === "true") {
              document.body.classList.add("dark");
            }
        });