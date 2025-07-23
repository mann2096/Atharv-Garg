const canvas=document.getElementById("gameCanvas");
const ctx=canvas.getContext("2d");
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;

const ground=new Image();
const trunk=new Image();
const leftbranch=new Image();
const rightbranch=new Image();
const lumberjack=new Image();
const punishedLumberjack=new Image();
const choppingLumberjack=new Image();
const apple=new Image();
const bgmusic=new Audio("assets/bgmusic.mp3");
const choppingtree=new Audio("assets/choppingtree.mp3")

apple.src="assets/apple.png"
ground.src="assets/background.png";
trunk.src="assets/trunk3.png";
leftbranch.src="assets/left-branch.png";
rightbranch.src="assets/right-branch.png";
lumberjack.src="assets/player1.png";
punishedLumberjack.src="assets/player3.png";
choppingLumberjack.src="assets/player2.png";

let segments=1000;
const trunkWidth=300;
const trunkHeight=80;
const treeX=(canvas.width-trunkWidth)/2;

let fulltree=[];
let apples=[];
let playerSide="left";
let isPunished=false;
let isChopping=false;
let elapsedTime=0;
let score=0;
let punishCount=0;
let gameTime=30;
let gameInterval=null;
let timerInterval=null;
let gameEnded=false;
bgmusic.loop=true;
bgmusic.volume=0.5;
let applesCollected=0;

function generateTree(){
  fulltree=[];
  for(let i=0;i<segments;i+=2){
    const side=Math.random()<0.5? "left":"right";
    fulltree.push(side);
    fulltree.push("none");
  }
  fulltree[segments-1]="none";
}

function generateApple(){
  apples=[];
  for(let i=0;i<segments;i+=2){
    const ifapple=Math.random()<0.1?"yes":"no";
    apples.push(ifapple);
    apples.push("no");
  }
  apples[segments-1]="none";
}

function drawLumberjack(){
  const charWidth=200;
  const charHeight=200;
  const baseY=canvas.height - 240;

  let imageToDraw=lumberjack;
  if(isPunished){
    imageToDraw=punishedLumberjack;
  } else if(isChopping){
    imageToDraw=choppingLumberjack;
  }

  if(playerSide==="left"){
    ctx.drawImage(imageToDraw,treeX-30,baseY,charWidth,charHeight);
  }else{
    ctx.save();
    ctx.scale(-1,1);
    const drawX=-(treeX+130+charWidth);
    ctx.drawImage(imageToDraw,drawX,baseY,charWidth,charHeight);
    ctx.restore();
  }
}

function drawScene(){
  ctx.drawImage(ground,0,0,canvas.width,canvas.height);
  const visibletree=fulltree.slice(-8);
  const visibleapples=apples.slice(-8);

  for (let i=0;i<8;i++){
    const type=visibletree[i];
    const addition=visibleapples[i];
    ctx.drawImage(trunk,treeX,i*77,trunkWidth,trunkHeight);
    if(type==="left" && addition==="no"){
      ctx.drawImage(leftbranch,treeX-60,i*78-20,200,120);
    }else if(type==="right" && addition==="no"){
      ctx.drawImage(rightbranch,treeX+165,i*78-20,200,120);
    }else if(type==="left" && addition==="yes"){
      ctx.drawImage(leftbranch,treeX-60,i*78-20,200,120);
      ctx.drawImage(apple,treeX+10,i*78+37,30,24)
    }else if(type==="right" && addition==="yes"){
      ctx.drawImage(rightbranch,treeX+165,i*78-20,200,20);
      ctx.drawImage(apple,treeX+260,i*78+45,30,24)
    }
  }

  ctx.drawImage(trunk,treeX,8*77,trunkWidth,trunkHeight);
  drawLumberjack();
  drawUI();
}

function drawUI(){
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(20,20,250,140);
  ctx.fillStyle="#00ffcc";
  ctx.font="bold 22px 'Segoe UI', sans-serif";
  ctx.textAlign="left";
  ctx.textBaseline="top";
  ctx.fillText(`⏱ Time: ${elapsedTime}s`,30,30);
  ctx.fillText(`🪓 Score: ${score}`,30,60);
  ctx.fillText(`❌ Punish: ${punishCount}`,30,90);
  ctx.fillText(`🍎 remaining: ${applesCollected}`,30,120)
  ctx.restore();
}

function handleChop(side){
  if (isPunished||gameEnded)return;
  const segment1=fulltree[fulltree.length-1];     
  const segment2=fulltree[fulltree.length-2];     
  const apple1=apples[apples.length-1];          
  const apple2=apples[apples.length-2];           

  let isWrong=false;

  if(segment1===side){
    isWrong=true;
  }else if(segment1==="none" && segment2===side){
    isWrong=true;
  }

  if (isWrong){
    if (apple1==="yes"){
      applesCollected++;
      isWrong=false;
      apples[apples.length-1]="no"; 
    }else if(apple2==="yes" && segment1==="none" && segment2===side){
      applesCollected++;
      isWrong=false;
      apples[apples.length-2]="no"; 
    }else if(applesCollected>0) {
      applesCollected--;
      isWrong=false;
    }else{
      isPunished=true;
      punishCount++;
      drawScene();
      setTimeout(()=>{
        isPunished=false;
        drawScene();
      },4000);
      return;
    }
  }
  choppingtree.currentTime=0;
  choppingtree.play();
  fulltree.pop();
  apples.pop();
  playerSide=side;
  score++;
  isChopping=true;
  drawScene();
  setTimeout(()=>{
    isChopping=false;
    drawScene();
  },200);
}



function startGame(){
  gameTime=parseInt(document.getElementById("timeInput").value)||30;
  document.getElementById("startScreen").style.display="none";
  document.getElementById("gameCanvas").style.display="block";
  document.getElementById("endScreen").style.display="none";

  generateTree();
  generateApple();
  applesCollected=0;
  playerSide="left";
  isPunished=false;
  isChopping=false;
  elapsedTime=0;
  score=0;
  punishCount=0;
  gameEnded=false;
  bgmusic.play();

  gameInterval=setTimeout(()=>{
    gameEnded=true;
    clearInterval(timerInterval);
    document.getElementById("gameCanvas").style.display="none";
    document.getElementById("endScreen").style.display="block";
    document.getElementById("finalScore").innerText=
      `🪓 Final Score: ${score}\n❌ Times Punished: ${punishCount}`;
      bgmusic.pause();
      bgmusic.currentTime=0;
  },gameTime*1000);

  timerInterval=setInterval(()=>{
    elapsedTime++;
    drawScene();
  },1000);

  drawScene();
}

function restartGame(){
  clearInterval(timerInterval);
  clearTimeout(gameInterval);
  document.getElementById("endScreen").style.display="none";
  document.getElementById("startScreen").style.display="block";
}

window.addEventListener("keydown",(e)=>{
  if(e.key==="ArrowLeft")handleChop("left");
  else if (e.key==="ArrowRight") handleChop("right");
});

let imagesLoaded=0;
function onImageLoad(){
  imagesLoaded++;
  if(imagesLoaded===8) {
    document.getElementById("startScreen").style.display="block";
    document.getElementById("gameCanvas").style.display="none";
    document.getElementById("endScreen").style.display="none";
  }
}

ground.onload=onImageLoad;
trunk.onload=onImageLoad;
leftbranch.onload=onImageLoad;
rightbranch.onload=onImageLoad;
lumberjack.onload=onImageLoad;
punishedLumberjack.onload=onImageLoad;
choppingLumberjack.onload=onImageLoad;
apple.onload=onImageLoad;
