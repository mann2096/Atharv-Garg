const input=document.querySelector("#user-input");
const enter=document.querySelector("#enter-btn");
const key=document.querySelector("#api-key");
const modelname=document.querySelector("#drop-down");
const chatBox=document.querySelector("#chat-box");
const newChatBtn=document.querySelector("#new-chat-btn"); 
const historyList=document.querySelector("#history-list");

let allThreads=JSON.parse(localStorage.getItem("chatThreads"))||[];
let currentThreadIndex=allThreads.length;
let currentChat=[];
let decoder=new TextDecoder("utf-8");

window.addEventListener("load",()=>{
  updateHistory();
  if(currentThreadIndex<allThreads.length) {
    currentChat=[...allThreads[currentThreadIndex]];
    renderChat(currentChat);
  }
});

enter.addEventListener("click",()=>{
  if(!key.value) {
    alert("Please enter the API key first");
    return;
  }
  const userMessage=input.value.trim();
  if(userMessage==="")return;
  input.value="";
  addMessage("You",userMessage);
  currentChat.push({sender:"You",message:userMessage});
  dataHandling(userMessage);
});

newChatBtn.addEventListener("click",()=>{
  currentChat=[];
  currentThreadIndex=allThreads.length;
  chatBox.innerHTML="";
  chatBox.scrollTop=0;
});

async function dataHandling(message){
  const model=modelname.value;
  const apiKey=key.value;

  const aiMsgDiv=document.createElement("div");
  aiMsgDiv.classList.add("message","ai-message");
  const aiMsgText=document.createElement("p");
  aiMsgDiv.appendChild(aiMsgText);
  chatBox.appendChild(aiMsgDiv);
  chatBox.scrollTop=chatBox.scrollHeight;
  try{
    const response=await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization":`Bearer ${apiKey}`,
        "X-Title":"LLM Chat App"
      },
      body:JSON.stringify({
        model:model,
        messages:[{role:"user",content:message}],
        stream:true
      })
    });
    if(!response.ok){
      const errorText=`${response.status} ${response.statusText}`;
      addMessage("AI", errorText);
      return;
    }
    const reader=response.body.getReader();
    let fullReply="";
    while(true){
      const{value,done}=await reader.read();
      if(done)break;

     const chunk=decoder.decode(value);
     let lines=chunk.split('\n');
     for(let line of lines){
      if(line.startsWith("data: ")){
        const jsonData=line.replace("data: ","").trim();
        if(jsonData==="[DONE]"){
          break;
        }
        try{
          const parsed=await JSON.parse(jsonData);
          delta=parsed.choices[0]?.delta?.content;
          if(delta){
            aiMsgText.innerHTML+=delta;
            fullReply+=delta;
          }
        }catch(e){
        }
      }
    }
    }
    const aiReply=await markDown(fullReply);
    aiMsgText.innerHTML=aiReply;
    currentChat.push({sender:"AI",message:aiReply});
    allThreads[currentThreadIndex]=currentChat;
    localStorage.setItem("chatThreads",JSON.stringify(allThreads));
    updateHistory();
  }catch(error) {
    console.error("Fetch error:",error);
    const errorMsg =`Fetch failed: ${error.message}`;
    addMessage("AI",errorMsg);
    currentChat.push({sender:"AI",message:errorMsg});
  }
}

async function addMessage(sender, message){
  const messageDiv=document.createElement("div");
  messageDiv.classList.add("message",sender==="You"?"user-message":"ai-message");
  const messageText=document.createElement("p");
  messageText.innerHTML=message;
  messageDiv.appendChild(messageText);
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop=chatBox.scrollHeight;
}

function renderChat(messages){
  chatBox.innerHTML = "";
  messages.forEach(msg => addMessage(msg.sender, msg.message));
  chatBox.scrollTop = chatBox.scrollHeight;
}

function updateHistory(){
  historyList.innerHTML="";
  allThreads.forEach((thread,index)=>{
    const li=document.createElement("li");
    const preview=thread[0]?.message?.slice(0, 30)||"Empty Chat";
    li.textContent=`Chat ${index + 1}: ${preview}`;
    li.addEventListener("click",()=>{
      currentThreadIndex=index;
      currentChat=[...thread];
      renderChat(currentChat);
    });
    historyList.appendChild(li);
  });
}

async function markDown(message){
  const markDownedHTML=await fetch('https://api.github.com/markdown',{
    method:'POST',
    headers:{
      'Content-Type':'application/json'
    },
    body:JSON.stringify({
      text:message,
      model:"markDown"
    })
  })
  let markDownedText=await markDownedHTML.text();
  return markDownedText;
}
