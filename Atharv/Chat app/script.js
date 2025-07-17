const input = document.querySelector("#user-input");
const enter = document.querySelector("#enter-btn");
const key = document.querySelector("#api-key");
const modelname = document.querySelector("#drop-down");
const chatBox = document.querySelector("#chat-box");
const newChatBtn = document.getElementById("new-chat-btn");
const historyList = document.getElementById("history-list");
let allThreads = JSON.parse(localStorage.getItem("chatThreads")) || [];
let currentThreadIndex = allThreads.length;
let currentChat = [];

window.addEventListener("load", () => {
  updateHistory();
  if (currentThreadIndex < allThreads.length) {
    currentChat = [...allThreads[currentThreadIndex]];
    renderChat(currentChat);
  }
});

enter.addEventListener("click", () => {
  if (!key.value) {
    alert("Please enter the API key first");
    return;
  }
  const userMessage = input.value.trim();
  if (userMessage === "") return;
  input.value = "";
  addMessage("You", userMessage);
  currentChat.push({ sender: "You", message: userMessage });
  dataHandling(userMessage);
});

newChatBtn.addEventListener("click", () => {
  currentChat = [];
  currentThreadIndex = allThreads.length;
  chatBox.innerHTML = "";
  chatBox.scrollTop = 0;
});

async function dataHandling(message) {
  const model = modelname.value;
  const apiKey = key.value;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "http://localhost",
        "X-Title": "LLM Chat App"
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: message }],
        stream: false
      })
    });
    if (!response.ok) {
      const errorText = `API error: ${response.status} ${response.statusText}`;
      addMessage("AI", errorText);
      currentChat.push({ sender: "AI", message: errorText });
      return;
    }
    const data = await response.json();
    const aiReply = data.choices[0].message.content;
    addMessage("AI", aiReply);
    currentChat.push({ sender: "AI", message: aiReply });
    allThreads[currentThreadIndex] = currentChat;
    localStorage.setItem("chatThreads", JSON.stringify(allThreads));
    updateHistory();

  } catch (error) {
    console.error("Fetch error:", error);
    const errorMsg = `Fetch failed: ${error.message}`;
    addMessage("AI", errorMsg);
    currentChat.push({ sender: "AI", message: errorMsg });
  }
}

function addMessage(sender, message) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender === "You" ? "user-message" : "ai-message");
  const messageText = document.createElement("p");
  messageText.innerHTML = marked.parse(message);
  messageDiv.appendChild(messageText);
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function renderChat(messages) {
  chatBox.innerHTML = "";
  messages.forEach(msg => addMessage(msg.sender, msg.message));
  chatBox.scrollTop = chatBox.scrollHeight;
}

function updateHistory() {
  historyList.innerHTML = "";
  allThreads.forEach((thread, index) => {
    const li = document.createElement("li");
    const preview = thread[0]?.message?.slice(0, 20) || "Empty Chat";
    li.textContent = `Chat ${index + 1}: ${preview}`;
    li.addEventListener("click", () => {
      currentThreadIndex = index;
      currentChat = [...thread];
      renderChat(currentChat);
    });
    historyList.appendChild(li);
  });
}
