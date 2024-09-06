import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";
const apiKey = "AIzaSyA3XrIQpI_BS8ECR1hhqhXGJW3GnPOrhgo";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const chat = model.startChat({
  history: [
    { role: "user", parts: [{ text: "Hello" }] },
    {
      role: "model",
      parts: [{ text: "Great to meet you. What would you like to know?" }],
    },
  ],
});

const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector("#userInput");
const sendChatBtn = document.querySelector("#send-btn");

let userMessage = null;
const inputInitHeight = chatInput.scrollHeight;

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" 
        ? `<p></p>` 
        : `<img src="download.png" alt="Bot Image"><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
}

const generateResponse = async (chatElement) => {
    const messageElement = chatElement.querySelector("p");

    try {
        const result = await chat.sendMessage(userMessage);
        let modelResponse = result.response.text();
        modelResponse = markdownToHTML(modelResponse);

        messageElement.innerHTML = modelResponse;
    } catch (error) {
        console.error("Error during chat:", error);
        messageElement.textContent = "Sorry, there was an error.";
    }

    chatbox.scrollTo(0, chatbox.scrollHeight);
}

const handleChat = async () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    // Clear the input textarea and set its height to default
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Append the user's message to the chatbox
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    // Add "Thinking..." message while waiting for the response
    const incomingChatLi = createChatLi("Thinking...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    
    // Generate AI response
    await generateResponse(incomingChatLi);
}

// Convert markdown to HTML
function markdownToHTML(text) {
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.+?)\*/g, '<em>$1</em>')             // Italic
        .replace(/\n\* (.+)/g, '<ul><li>$1</li></ul>')    // Bullet points
        .replace(/\n/g, '<br>');                          // Line breaks
}

// Event listeners
chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
