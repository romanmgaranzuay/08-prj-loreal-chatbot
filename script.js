/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

// Track if it's the first message
let isFirstMessage = true;

// Array to store the conversation context
const conversationContext = [
  {
    role: "system",
    content:
      "You are a helpful skincare and haircare advisor for L'Oréal products. You MUST only answer questions about beauty routines, skincare products, haircare products, and makeup advice. If someone asks about anything else (politics, sports, food, general topics, etc.), politely redirect them back to beauty topics by saying 'I can only help with skincare, haircare, and beauty advice. What would you like to know about your beauty routine?' Stay focused on beauty and L'Oréal product recommendations only.",
  },
];

/* Function to format text with bold and italics */
function formatMessageText(text) {
  // Replace **text** with <strong>text</strong> for bold
  text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // Replace *text* with <em>text</em> for italics
  text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
  return text;
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get user input
  const userMessage = userInput.value.trim();
  if (!userMessage) return;

  // Remove initial message if it's the first user message
  if (isFirstMessage) {
    chatWindow.textContent = ""; // Clear the initial message
    isFirstMessage = false;
  }

  // Add user message to the conversation context
  conversationContext.push({ role: "user", content: userMessage });

  // Display user message in chat window
  chatWindow.innerHTML += `<div class="msg user"><strong>You:</strong> ${formatMessageText(
    userMessage
  )}</div>`;
  userInput.value = ""; // Clear input field

  // Show loading message
  const loadingMessage = document.createElement("div");
  loadingMessage.className = "msg ai loading"; // Add 'loading' class for lighter grey
  loadingMessage.innerHTML = "<em>One moment while I think about your question...</em>";
  chatWindow.appendChild(loadingMessage);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    // Send the conversation context to the API
    const response = await fetch(
      "https://lorealpracticebot.romanmgaranzuay.workers.dev/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o", // Specify the model
          messages: conversationContext, // Send the full conversation context
          max_completion_tokens: 800,
        }),
      }
    );

    const data = await response.json();

    // Remove loading message
    chatWindow.removeChild(loadingMessage);

    // Get AI response and add it to the conversation context
    const aiMessage =
      data.choices[0]?.message?.content || "Sorry, I couldn't understand that.";
    conversationContext.push({ role: "assistant", content: aiMessage });

    // Display AI response in chat window
    chatWindow.innerHTML += `<div class="msg ai">${formatMessageText(
      aiMessage
    )}</div>`;
  } catch (error) {
    // Remove loading message
    chatWindow.removeChild(loadingMessage);

    // Handle errors
    chatWindow.innerHTML += `<div class="msg ai">Oops! Something went wrong. Please try again later.</div>`;
  }

  // Scroll to the latest message
  chatWindow.scrollTop = chatWindow.scrollHeight;
});
