function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => console.log(err));
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "f" || e.key === "F") toggleFullScreen();
});

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if(audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  const now = audioCtx.currentTime;

  if (type === 'switch') {
    osc.type = 'sine'; osc.frequency.setValueAtTime(400, now); osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
    gainNode.gain.setValueAtTime(0.3, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  } else if (type === 'score' || type === 'perfect') {
    osc.type = 'square'; osc.frequency.setValueAtTime(800, now); osc.frequency.setValueAtTime(1200, now + 0.1);
    gainNode.gain.setValueAtTime(0.2, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
  } else if (type === 'coin') {
    osc.type = 'triangle'; osc.frequency.setValueAtTime(1200, now); osc.frequency.setValueAtTime(1600, now + 0.1);
    gainNode.gain.setValueAtTime(0.2, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
  } else if (type === 'ice' || type === 'shield') {
    osc.type = 'sine'; osc.frequency.setValueAtTime(1000, now); osc.frequency.exponentialRampToValueAtTime(2000, now + 0.3);
    gainNode.gain.setValueAtTime(0.3, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
  } else if (type === 'shield_break' || type === 'explosion') {
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(300, now); osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
    gainNode.gain.setValueAtTime(0.4, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
  } else if (type === 'crash') {
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, now); osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
    gainNode.gain.setValueAtTime(0.3, now); gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
  }
  osc.start(now); osc.stop(now + 0.4);
}

const FIREBASE_URL = "https://switch-master-687ff-default-rtdb.europe-west1.firebasedatabase.app/scores.json";

function loadScores() {
  document.getElementById("scoreList").innerHTML = "Yükleniyor...";
  fetch(FIREBASE_URL).then(res => res.json()).then(data => {
      if (!data) { document.getElementById("scoreList").innerHTML = "Henüz skor yok!"; return; }
      let scoresArray = Object.values(data).sort((a, b) => b.score - a.score).slice(0, 5);
      let listHTML = ""; scoresArray.forEach(entry => { listHTML += `<li><b>${entry.name}</b>: ${entry.score}</li>`; });
      document.getElementById("scoreList").innerHTML = listHTML;
    }).catch(err => console.error(err));
}
loadScores();

function submitScoreAndRestart() {
  const name = document.getElementById("playerNameInput").value.trim();
  if (name !== "") {
    fetch(FIREBASE_URL, { method: "POST", body: JSON.stringify({ name: name, score: score }) })
      .then(() => { loadScores(); restartGame(); }).catch(err => console.error(err));
  } else { restartGame(); }
}

let train, graphics, scoreText, phaseText, vagonText, obstacles;
let switchBase, switchHandle, headlight, headlineCore, farGlow;
let itemGraphic, itemType = 0;
let trainShieldCircle, backgroundGroup, midgroundGroup;
let farMountains, midTrees, solidGround;

let brakeBtnObj, brakeBtnText, brakeBarBg, brakeBarFill;
let isBraking = false, brakeHeat = 0, brakeCooldown = false;
let gameTime = { scale: 1.0 };

let phase = 1, currentPath, pathIndex = 0;
let baseSpeed = 2.5, speed = baseSpeed, maxSpeed = 12; 
let switchState = 0, correctPathIndex = 0, lockedChoice = null;
let score = 0, isGameOver = false, gameStarted = false, hasShield = false;
let pulse = 0, currentAngle = 0;

let smokeParticles = [], sparkParticles = [], explosionParticles = [];
let starEmitter, perfectUsed = false;

let trainWagons = [];
let posHistory = [];

const p1Top = [ {x:-50,y:300},{x:300,y:300},{x:500,y:200},{x:700,y:200} ];
const p1Bot = [ {x:-50,y:300},{x:300,y:300},{x:500,y:400},{x:700,y:400} ];
const p2Top = [ {x:-50,y:300},{x:300,y:300},{x:500,y:150},{x:700,y:150} ];
const p2Mid = [ {x:-50,y:300},{x:300,y:300},{x:500,y:300},{x:700,y:300} ];
const p2Bot = [ {x:-50,y:300},{x:300,y:300},{x:500,y:450},{x:700,y:450} ];

let gameScene; 

function create(){
  gameScene = this;
  
  graphics = this.add.graphics();
  graphics.setDepth(5); 
  obstacles = this.physics.add.group();

  this.add.circle(600, 100, 30, 0xffeb3b).setDepth(0);

  let mountainTex = this.make.graphics({x: 0, y: 0, add: false});
  mountainTex.fillStyle(0x778899, 1);
  mountainTex.beginPath(); mountainTex.moveTo(0, 300); mountainTex.lineTo(100, 150); mountainTex.lineTo(200, 250); mountainTex.lineTo(300, 100); mountainTex.lineTo(400, 200); mountainTex.lineTo(500, 180); mountainTex.lineTo(600, 300); mountainTex.fillPath(); mountainTex.closePath();
  mountainTex.generateTexture('farMnt', 600, 300);
  farMountains = this.add.tileSprite(400, 450, 800, 300, 'farMnt').setOrigin(0.5, 0.5).setDepth(1);

  let treeTex = this.make.graphics({x: 0, y: 0, add: false});
  treeTex.fillStyle(0x1a713b, 1);
  treeTex.beginPath(); treeTex.moveTo(15, 60); treeTex.lineTo(30, 0); treeTex.lineTo(45, 60); treeTex.fillPath(); treeTex.closePath();
  treeTex.generateTexture('midTree', 60, 60);
  midTrees = this.add.tileSprite(400, 560, 800, 60, 'midTree').setOrigin(0.5, 0.5).setDepth(2);
  
  solidGround = this.add.rectangle(400, 590, 800, 20, 0x114a24).setDepth(2.5);

  itemGraphic = this.add.container(0, 0).setDepth(8);
  let cOutline = this.add.circle(0, 0, 18, 0xffffff, 0.3);
  let cBody = this.add.circle(0, 0, 14, 0xffffff);
  let cIcon = this.add.text(0, 0, "", {fontSize: '18px', fontStyle: 'bold'}).setOrigin(0.5, 0.5);
  itemGraphic.add([cOutline, cBody, cIcon]);
  itemGraphic.setVisible(false);

  let pStar = this.make.graphics({x:0, y:0, add:false});
  pStar.fillStyle(0x00ffff); pStar.beginPath(); pStar.moveTo(5,0); pStar.lineTo(10,5); pStar.lineTo(5,10); pStar.lineTo(0,5); pStar.closePath(); pStar.fillPath();
  pStar.generateTexture('pStarTex', 10, 10);
  starEmitter = this.add.particles(0, 0, 'pStarTex', { speed: {min: 150, max: 350}, angle: {min: 0, max: 360}, scale: {start: 1.5, end: 0}, lifespan: 600, blendMode: 'ADD', emitting: false }).setDepth(15);

  train = this.add.container(-50,300).setDepth(10);
  this.physics.add.existing(train);
  train.body.setCircle(25, -25, -25);

  headlight = this.add.graphics(); headlight.blendMode = Phaser.BlendModes.ADD; headlight.fillStyle(0xffffff, 0.08); headlight.fillTriangle(10, 0, 250, -80, 250, 80);
  headlineCore = this.add.circle(-22, 0, 6, 0xffffff, 0.5).setBlendMode(Phaser.BlendModes.ADD);
  farGlow = this.add.circle(-22, 0, 15, 0xffaa00, 0.2).setBlendMode(Phaser.BlendModes.ADD);
  headlight.setVisible(false); headlineCore.setVisible(false); farGlow.setVisible(false);

  trainShieldCircle = this.add.circle(0, 0, 42, 0x00ff88, 0.25).setStrokeStyle(3, 0x00ff88, 1); trainShieldCircle.setVisible(false);

  let bodyLower = this.add.rectangle(0, 8, 60, 14, 0x111111); 
  let bodyUpper = this.add.rectangle(0, -3, 60, 16, 0x2c3e50); 
  let cabin = this.add.rectangle(12, -15, 24, 16, 0x1a252f).setStrokeStyle(1, 0x111111); 
  let window = this.add.rectangle(12, -15, 12, 8, 0x00ffff).setBlendMode(Phaser.BlendModes.ADD); 
  let front = this.add.rectangle(-30, 0, 8, 16, 0x111111); 
  let bumper = this.add.rectangle(-34, 6, 6, 12, 0x555555); 
  let chimneyTex = this.add.rectangle(-20, -15, 8, 12, 0x111111); 
  let stripe = this.add.rectangle(0, 1, 60, 2, 0xffaa00); 

  train.add([farGlow, headlineCore, headlight, trainShieldCircle, bodyLower, bodyUpper, cabin, window, front, bumper, chimneyTex, stripe]);

  switchBase = this.add.rectangle(300, 300, 14, 60, 0x555555).setDepth(6);
  switchHandle = this.add.circle(300, 280, 10, 0xff0000).setStrokeStyle(1, 0x000).setDepth(7);

  scoreText = this.add.text(20,20,"Skor: 0",{fontSize:"32px",fill:"#ffaa00", fontStyle:"bold", stroke: '#000', strokeThickness: 6}).setDepth(100);
  
  phaseText = this.add.text(400, 250, "🎟️ ANA HAT KİLİDİ AÇILDI 🎟️\n🔥 3. ŞERİT AKTİF 🔥", { fontSize:"38px", fill:"#ff3300", fontStyle:"bold", align:"center", stroke:"#ffffff", strokeThickness: 6, shadow: { blur: 15, color: '#ffaa00', stroke: true, fill: true } }).setOrigin(0.5).setDepth(100);
  phaseText.setVisible(false);

  vagonText = this.add.text(400, 200, "🚂 YENİ VAGON EKLENDİ 🚂", { fontSize:"32px", fill:"#00ffff", fontStyle:"bold", align:"center", stroke:"#000", strokeThickness: 6, shadow: { blur: 15, color: '#00ffff', stroke: true, fill: true } }).setOrigin(0.5).setDepth(100);
  vagonText.setVisible(false);

  brakeBarBg = this.add.rectangle(700, 490, 120, 15, 0x222222).setOrigin(0.5).setStrokeStyle(2, 0xffffff).setDepth(100);
  brakeBarFill = this.add.rectangle(640, 490, 0, 15, 0xffeb3b).setOrigin(0, 0.5).setDepth(100);
  brakeBtnObj = this.add.rectangle(700, 540, 120, 60, 0xcc0000, 0.9).setInteractive().setStrokeStyle(3, 0xffaa00).setDepth(100);
  brakeBtnText = this.add.text(700, 540, "FREN", { fontSize: '24px', fontStyle: 'bold', color: '#fff' }).setOrigin(0.5).setDepth(100);

  brakeBtnObj.on('pointerdown', () => { if(!brakeCooldown && gameStarted && !isGameOver) { isBraking = true; brakeBtnObj.fillColor = 0x990000; }});
  brakeBtnObj.on('pointerup', () => { isBraking = false; if(!brakeCooldown) brakeBtnObj.fillColor = 0xcc0000; });
  brakeBtnObj.on('pointerout', () => { isBraking = false; if(!brakeCooldown) brakeBtnObj.fillColor = 0xcc0000; });

  this.input.on("pointerdown", (pointer, currentlyOver)=>{
    if(!gameStarted || isGameOver || currentlyOver.length > 0) return; 
    playSound('switch'); this.cameras.main.shake(50, 0.002); 
    
    let distToSwitch = 300 - train.x;
    if (pathIndex === 1 && distToSwitch > 0 && distToSwitch < 60 && !perfectUsed) {
        perfectUsed = true; score += 2; scoreText.setText("Skor: " + score); playSound('perfect');
        let pt = gameScene.add.text(train.x, train.y - 40, "KUSURSUZ! +2", { fontSize: "28px", fill: "#00ffff", fontStyle: "bold", stroke: "#000", strokeThickness: 5 }).setOrigin(0.5).setDepth(100);
        gameScene.tweens.add({ targets: pt, y: pt.y - 60, alpha: 0, duration: 1200, onComplete: () => pt.destroy() });
        starEmitter.emitParticleAt(train.x, train.y, 20);
    }

    if(phase === 1) { switchState = (switchState === 0) ? 1 : 0; this.tweens.add({ targets: switchHandle, y: (switchState === 0 ? 280 : 320), duration: 100 }); } 
    else { switchState = (switchState + 1) % 3; this.tweens.add({ targets: switchHandle, y: (275 + (switchState * 25)), duration: 100 }); }
  });

  this.physics.add.overlap(train, obstacles, (t, obs) => { handleCollision(obs); });
  currentPath = p1Top;
}

function handleCollision(obs) {
    if(hasShield) { playSound('shield_break'); hasShield = false; createExplosion(obs.x, obs.y); obs.destroy(); gameScene.cameras.main.shake(200, 0.015); } 
    else { triggerGameOver(); }
}

function createWagon() {
    let w = gameScene.add.container(-100, 300).setDepth(9);
    gameScene.physics.add.existing(w); w.body.setCircle(20, -20, -20);
    let base = gameScene.add.rectangle(0, 5, 50, 14, 0x111111);
    let body = gameScene.add.rectangle(0, -5, 48, 16, 0x2c3e50);
    let roof = gameScene.add.rectangle(0, -15, 50, 6, 0x888888);
    let w1 = gameScene.add.circle(-15, 12, 6, 0x333).setStrokeStyle(1, 0x000);
    let w2 = gameScene.add.circle(15, 12, 6, 0x333).setStrokeStyle(1, 0x000);
    let window1 = gameScene.add.rectangle(-10, -5, 12, 8, 0x00ffff).setBlendMode(Phaser.BlendModes.ADD);
    let window2 = gameScene.add.rectangle(10, -5, 12, 8, 0x00ffff).setBlendMode(Phaser.BlendModes.ADD);
    w.add([base, body, roof, w1, w2, window1, window2]);
    gameScene.physics.add.overlap(w, obstacles, (wagon, obs) => { handleCollision(obs); });
    return w;
}

function update(){
  if(!gameStarted || isGameOver) return;

  farMountains.tilePositionX += 0.1 * (speed / baseSpeed) * gameTime.scale;
  midTrees.tilePositionX += 0.5 * (speed / baseSpeed) * gameTime.scale;
  pulse += 0.05 * gameTime.scale;
  
  let targetWagonCount = Math.floor(score / 10);
  if (trainWagons.length < targetWagonCount) { 
      trainWagons.push(createWagon()); 
      
      playSound('ice'); 
      gameScene.cameras.main.flash(600, 0, 255, 255); 
      gameTime.scale = 0.3; 
      
      vagonText.setVisible(true);
      vagonText.setScale(0.5);
      vagonText.setAlpha(1);
      
      gameScene.tweens.add({ targets: vagonText, scale: 1.2, duration: 1500, ease: 'Out' });
      gameScene.tweens.add({ targets: vagonText, alpha: 0, duration: 500, delay: 1500 });
      gameScene.tweens.add({ targets: gameTime, scale: 1.0, duration: 2000, ease: 'Sine.easeIn' }); 
  }

  if(score >= 25 && phase === 1 && pathIndex === 0) {
      phase = 2; switchState = 1; switchHandle.y = 300; playSound('explosion'); 
      this.cameras.main.flash(800, 255, 100, 0); this.cameras.main.shake(800, 0.01); gameTime.scale = 0.15;
      phaseText.setVisible(true); phaseText.setScale(0.5); phaseText.setAlpha(1);
      this.tweens.add({ targets: phaseText, scale: 1.2, duration: 2500, ease: 'Out' });
      this.tweens.add({ targets: phaseText, alpha: 0, duration: 1000, delay: 2500 });
      this.tweens.add({ targets: gameTime, scale: 1.0, duration: 3000, ease: 'Sine.easeIn', delay: 500 });
      setNewCorrectPath();
  }

  if(score < 10) { gameScene.cameras.main.setBackgroundColor('#87CEEB'); document.body.style.backgroundColor = '#87CEEB'; headlight.setVisible(false); headlineCore.setVisible(false); farGlow.setVisible(false); } 
  else if (score < 20) { gameScene.cameras.main.setBackgroundColor('#fc7b03'); document.body.style.backgroundColor = '#fc7b03'; headlight.setVisible(false); headlineCore.setVisible(false); farGlow.setVisible(false); } 
  else { gameScene.cameras.main.setBackgroundColor('#111122'); document.body.style.backgroundColor = '#111122'; headlight.setVisible(true); headlineCore.setVisible(true); farGlow.setVisible(true); }

  if(hasShield) { trainShieldCircle.scale = 1 + Math.sin(pulse*8)*0.05; trainShieldCircle.setAlpha(0.6 + Math.sin(pulse*10)*0.4); trainShieldCircle.setVisible(true); } 
  else { trainShieldCircle.setVisible(false); }

  if(isBraking) {
      speed = 0.5; brakeHeat += (1.5 * gameTime.scale); spawnBrakeSparks();
      if(brakeHeat >= 100) { brakeHeat = 100; isBraking = false; brakeCooldown = true; brakeBtnObj.fillColor = 0x555555; brakeBtnText.setText("AŞIRI ISI"); playSound('shield_break'); }
  } else {
      let targetSpeed = Math.min(maxSpeed, baseSpeed + (score * 0.2)); speed += (targetSpeed - speed) * 0.1 * gameTime.scale;
      if(brakeHeat > 0) { brakeHeat -= (0.6 * gameTime.scale); if(brakeHeat <= 0) { brakeHeat = 0; brakeCooldown = false; brakeBtnObj.fillColor = 0xcc0000; brakeBtnText.setText("FREN"); } }
  }

  brakeBarFill.width = (brakeHeat / 100) * 120;
  if(brakeHeat > 80) brakeBarFill.fillColor = 0xff0000; else if(brakeHeat > 50) brakeBarFill.fillColor = 0xffa500; else brakeBarFill.fillColor = 0xffeb3b;

  if(itemGraphic.visible) {
    itemGraphic.scale = 1 + Math.sin(pulse * 4) * 0.1; let cx = itemGraphic.x - train.x; let cy = itemGraphic.y - train.y;
    if(Math.sqrt(cx*cx + cy*cy) < 25) { 
        itemGraphic.setVisible(false);
        if(itemType === 1) { score += 3; scoreText.setText("Skor: " + score); playSound('coin'); gameScene.tweens.add({ targets: scoreText, scale: 1.5, duration: 100, yoyo: true }); } 
        else if(itemType === 2) { speed = 1.0; playSound('ice'); gameScene.cameras.main.flash(300, 0, 255, 255); } 
        else if(itemType === 3) { hasShield = true; playSound('shield'); }
        itemType = 0;
    }
  }

  drawRails(); updateSmoke(); updateSparks(); updateExplosions();

  let target = currentPath[pathIndex];
  let dx = target.x - train.x; let dy = target.y - train.y;
  let dist = Math.sqrt(dx*dx + dy*dy); let step = Math.min(speed * gameTime.scale, dist);

  if(dist <= step || dist < 1){
    train.x = target.x; train.y = target.y; pathIndex++;
    if(pathIndex === 2){ lockedChoice = switchState; if(phase === 1) currentPath = (lockedChoice === 0) ? p1Top : p1Bot; else currentPath = (lockedChoice === 0) ? p2Top : (lockedChoice === 1) ? p2Mid : p2Bot; }
    if(pathIndex >= currentPath.length){
      if(lockedChoice !== correctPathIndex){ 
        if(hasShield) { playSound('shield_break'); hasShield = false; gameScene.cameras.main.shake(200, 0.015); resetTrain(); setNewCorrectPath(); } 
        else triggerGameOver();
      } else { 
        score++; scoreText.setText("Skor: " + score); playSound('score'); resetTrain(); setNewCorrectPath();
        if(Math.random() > 0.5) {
            let r = Math.random(); let cOutline = itemGraphic.list[0]; let cBody = itemGraphic.list[1]; let cIcon = itemGraphic.list[2];
            if(r < 0.6) { itemType = 1; cBody.fillColor = 0xffd700; cOutline.fillColor = 0xb8860b; cIcon.setText("💰"); cIcon.setColor("#000"); } 
            else if(r < 0.8) { itemType = 2; cBody.fillColor = 0x00bfff; cOutline.fillColor = 0x0000ff; cIcon.setText("❄️"); cIcon.setColor("#fff"); } 
            else { itemType = 3; cBody.fillColor = 0x32cd32; cOutline.fillColor = 0x008000; cIcon.setText("🛡️"); cIcon.setColor("#fff"); }
            
            let spawnPath;
            if(phase === 1) spawnPath = (correctPathIndex === 0) ? p1Top : p1Bot;
            else spawnPath = (correctPathIndex === 0) ? p2Top : (correctPathIndex === 1) ? p2Mid : p2Bot;
            
            itemGraphic.x = spawnPath[2].x + (spawnPath[3].x - spawnPath[2].x) * 0.6; 
            itemGraphic.y = spawnPath[2].y + (spawnPath[3].y - spawnPath[2].y) * 0.6; 
            itemGraphic.setVisible(true);
        } else { itemGraphic.setVisible(false); itemType = 0; }
      }
    }
  } else {
    train.x += (dx/dist) * step; train.y += (dy/dist) * step;
    let targetAngle = Math.atan2(dy, dx); currentAngle += (targetAngle - currentAngle) * 0.15 * gameTime.scale; train.rotation = currentAngle;
    spawnNormalSmoke();
  }

  let lastP = posHistory.length > 0 ? posHistory[0] : null;
  if (!lastP) { 
      posHistory.unshift({x: train.x, y: train.y, rot: train.rotation}); 
  } else {
      let mdx = train.x - lastP.x; let mdy = train.y - lastP.y;
      let moveDist = Math.sqrt(mdx*mdx + mdy*mdy);
      if (moveDist >= 2) {
          let steps = Math.ceil(moveDist / 2);
          let startRot = lastP.rot; let endRot = train.rotation;
          let diff = endRot - startRot;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          
          for (let s = 1; s <= steps; s++) {
              let f = s / steps;
              let nx = lastP.x + mdx * f; let ny = lastP.y + mdy * f; let nRot = startRot + diff * f;
              posHistory.unshift({x: nx, y: ny, rot: nRot});
          }
      }
  }
  
  let maxHist = 50 + (trainWagons.length * 30);
  if (posHistory.length > maxHist) posHistory.length = maxHist;

  for(let i=0; i<trainWagons.length; i++) {
      let tIdx = 38 + (i * 28); 
      if(tIdx < posHistory.length) { 
          trainWagons[i].x = posHistory[tIdx].x; trainWagons[i].y = posHistory[tIdx].y; trainWagons[i].rotation = posHistory[tIdx].rot; 
      } else { 
          let last = posHistory[posHistory.length-1]; 
          trainWagons[i].x = last.x; trainWagons[i].y = last.y; trainWagons[i].rotation = last.rot; 
      }
  }

  obstacles.getChildren().forEach(obs => { obs.x -= (4 + (score * 0.05)) * gameTime.scale; if(obs.x < -100) obs.destroy(); spawnBlackSmoke(obs.x, obs.y); });
}

function spawnObstacle() {
    if(score < 5) return; 
    
    if(Math.random() > 0.4) {
        let obsY;
        if (phase === 1) {
            obsY = (correctPathIndex === 0) ? 200 : 400; 
        } else {
            if (correctPathIndex === 0) {
                obsY = 150; 
            } else if (correctPathIndex === 2) {
                obsY = 450; 
            } else {
                obsY = (Math.random() > 0.5) ? 150 : 450;
            }
        }
        
        let obsContainer = gameScene.add.container(900, obsY).setDepth(10);
        gameScene.physics.add.existing(obsContainer); 
        obsContainer.body.setCircle(20, -20, -20);
        
        let cBaseL = gameScene.add.rectangle(0, 5, 35, 10, 0x111111); 
        let cBaseU = gameScene.add.rectangle(0, 0, 35, 10, 0x222222);
        let cCoal = gameScene.add.rectangle(0, -6, 25, 6, 0x000000).setAlpha(0.7);
        let w1 = gameScene.add.circle(-10, 10, 5, 0x111111).setStrokeStyle(1, 0x555555); 
        let w2 = gameScene.add.circle(10, 10, 5, 0x111111).setStrokeStyle(1, 0x555555);
        let percin1 = gameScene.add.circle(-12, -4, 1.5, 0x000000).setAlpha(0.5); 
        let percin2 = gameScene.add.circle(12, -4, 1.5, 0x000000).setAlpha(0.5);
        
        obsContainer.add([cBaseL, cBaseU, cCoal, w1, w2, percin1, percin2]); 
        obstacles.add(obsContainer);
    }
}

function spawnNormalSmoke(){ if(Math.random() > (0.5 * gameTime.scale)) return; smokeParticles.push({ x: train.x - 10, y: train.y - 20, alpha: 1, size: Phaser.Math.Between(4,8), color: 0xdddddd }); }
function spawnBlackSmoke(x, y){ if(Math.random() > (0.3 * gameTime.scale)) return; smokeParticles.push({ x: x, y: y - 10, alpha: 1, size: Phaser.Math.Between(5,10), color: 0x222222 }); if(Math.random() > 0.7) smokeParticles.push({ x: x, y: y, alpha: 1, size: Phaser.Math.Between(2,5), color: 0xff4400 }); }
function updateSmoke(){ for(let i=smokeParticles.length-1;i>=0;i--){ let p = smokeParticles[i]; p.y -= (0.5 * gameTime.scale); p.alpha -= (0.02 * gameTime.scale); graphics.fillStyle(p.color, p.alpha); graphics.fillCircle(p.x,p.y,p.size); if(p.alpha<=0) smokeParticles.splice(i,1); } }
function spawnBrakeSparks() { if(Math.random() > gameTime.scale) return; for(let i=0; i<4; i++) { sparkParticles.push({ x: train.x, y: train.y + 12, vx: (Math.random() - 0.5) * 6, vy: Math.random() * 4, life: 1.0 }); } }
function updateSparks() { for(let i=sparkParticles.length-1;i>=0;i--){ let p = sparkParticles[i]; p.x += (p.vx * gameTime.scale); p.y += (p.vy * gameTime.scale); p.life -= (0.05 * gameTime.scale); graphics.fillStyle(0xffaa00, p.life); graphics.fillCircle(p.x,p.y, 4 * p.life); if(p.life<=0) sparkParticles.splice(i,1); } }
function createExplosion(x, y) { for(let i=0; i<30; i++) { explosionParticles.push({ x: x, y: y, vx: (Math.random()-0.5)*12, vy: (Math.random()-0.5)*12, life: 1.0, size: Math.random()*15+5, color: Math.random()>0.5?0xff4400:0x555555 }); } }
function updateExplosions() { for(let i=explosionParticles.length-1;i>=0;i--){ let p = explosionParticles[i]; p.x += (p.vx * gameTime.scale); p.y += (p.vy * gameTime.scale); p.life -= (0.03 * gameTime.scale); graphics.fillStyle(p.color, p.life); graphics.fillCircle(p.x,p.y, p.size * p.life); if(p.life<=0) explosionParticles.splice(i,1); } }

function drawRails(){ 
    graphics.clear(); graphics.lineStyle(2, 0x555555, 0.4); 
    if (phase === 1) { drawRailSegment(0, 200, 800, 200); drawRailSegment(0, 400, 800, 400); } 
    else { drawRailSegment(0, 150, 800, 150); drawRailSegment(0, 300, 800, 300); drawRailSegment(0, 450, 800, 450); }
    drawRailSegment(-50,300,300,300); 
    if(phase === 1) { drawRailBranch(p1Top); drawRailBranch(p1Bot); highlightRail((switchState===0?p1Top:p1Bot), 0x00ccff); if(correctPathIndex===0) drawWarning(p1Bot); else drawWarning(p1Top); } 
    else { drawRailBranch(p2Top); drawRailBranch(p2Mid); drawRailBranch(p2Bot); highlightRail((switchState===0?p2Top:(switchState===1?p2Mid:p2Bot)), 0x00ccff); if(correctPathIndex !== 0) drawWarning(p2Top); if(correctPathIndex !== 1) drawWarning(p2Mid); if(correctPathIndex !== 2) drawWarning(p2Bot); }
}

function drawRailSegment(x1,y1,x2,y2){ drawRailLine(x1,y1,x2,y2); drawSleepers(x1,y1,x2,y2); }
function drawRailBranch(path){ for(let i=1;i<path.length-1;i++){ drawRailSegment(path[i].x,path[i].y,path[i+1].x,path[i+1].y); } }
function drawRailLine(x1,y1,x2,y2){ let dx=x2-x1, dy=y2-y1; let len=Math.sqrt(dx*dx+dy*dy); let nx=-dy/len*4, ny=dx/len*4;
    graphics.lineStyle(4,0x444444); graphics.beginPath(); graphics.moveTo(x1+nx,y1+ny); graphics.lineTo(x2+nx,y2+ny); graphics.strokePath(); graphics.beginPath(); graphics.moveTo(x1-nx,y1-ny); graphics.lineTo(x2-nx,y2-ny); graphics.strokePath();
    graphics.lineStyle(1.5,0xaaaaaa,0.5); graphics.beginPath(); graphics.moveTo(x1+nx,y1+ny-1); graphics.lineTo(x2+nx,y2+ny-1); graphics.strokePath(); graphics.beginPath(); graphics.moveTo(x1-nx,y1-ny-1); graphics.lineTo(x2-nx,y2-ny-1); graphics.strokePath();
}
function drawSleepers(x1,y1,x2,y2){ let dx=x2-x1, dy=y2-y1; let len=Math.sqrt(dx*dx+dy*dy); let steps=Math.floor(len/20); for(let i=0;i<steps;i++){ let t=i/steps; let x=x1+dx*t; let y=y1+dy*t; let nx=-dy/len*6, ny=dx/len*6; graphics.lineStyle(2,0x3a2e2e,0.9); graphics.beginPath(); graphics.moveTo(x-nx,y-ny); graphics.lineTo(x+nx,y+ny); graphics.strokePath(); } }
function highlightRail(path,color){ graphics.lineStyle(6,color,0.4); for(let i=1;i<path.length-1;i++){ graphics.beginPath(); graphics.moveTo(path[i].x,path[i].y); graphics.lineTo(path[i+1].x,path[i+1].y); graphics.strokePath(); } }
function drawWarning(path){ 
    let p = path[2]; graphics.fillStyle(0x3a2e2e); graphics.fillRect(p.x - 3, p.y + 10, 6, 25); graphics.fillStyle(0x000000,0.5); graphics.fillRect(p.x+3, p.y+13, 6, 25);
    graphics.fillStyle(0x000000,0.5); graphics.beginPath(); graphics.moveTo(p.x+3, p.y - 22); graphics.lineTo(p.x + 25, p.y - 0); graphics.lineTo(p.x+3, p.y + 22); graphics.lineTo(p.x - 19, p.y - 0); graphics.closePath(); graphics.fillPath();
    graphics.fillStyle(0xcc0000); graphics.lineStyle(3, 0xffffff); graphics.beginPath(); graphics.moveTo(p.x, p.y - 25); graphics.lineTo(p.x + 22, p.y - 3); graphics.lineTo(p.x, p.y + 19); graphics.lineTo(p.x - 22, p.y - 3); graphics.closePath(); graphics.fillPath(); graphics.strokePath();
    graphics.lineStyle(4, 0xffffff); graphics.beginPath(); graphics.moveTo(p.x - 8, p.y - 11); graphics.lineTo(p.x + 8, p.y + 5); graphics.moveTo(p.x - 8, p.y + 5); graphics.lineTo(p.x + 8, p.y - 11); graphics.strokePath();
}

function setNewCorrectPath(){ if(phase === 1) correctPathIndex = Math.random()>0.5 ? 0 : 1; else correctPathIndex = Math.floor(Math.random() * 3); }

function resetTrain(){
  train.x=-50; train.y=300; train.rotation=0; currentAngle=0; pathIndex=0; perfectUsed = false;
  if(phase === 1) { switchState = 0; switchHandle.y = 280; currentPath = p1Top; } else { switchState = 1; switchHandle.y = 300; currentPath = p2Mid; } 
  lockedChoice=null; spawnObstacle();
}

function startGame() { if(audioCtx.state === 'suspended') audioCtx.resume(); document.getElementById("startScreen").classList.add("hidden"); gameStarted = true; setNewCorrectPath(); }

function triggerGameOver() {
  if(isGameOver) return; 
  isGameOver = true; playSound('crash'); gameScene.cameras.main.shake(400, 0.02); 
  setTimeout(() => {
    document.getElementById("gameOverScreen").classList.remove("hidden"); document.getElementById("finalScoreDisplay").innerText = "Skor: " + score;
    if(score > 0) { document.getElementById("scoreInputArea").classList.remove("hidden"); document.getElementById("justRestartBtn").classList.add("hidden"); document.getElementById("playerNameInput").value = ""; setTimeout(() => { document.getElementById("playerNameInput").focus(); }, 100); } 
    else { document.getElementById("scoreInputArea").classList.add("hidden"); document.getElementById("justRestartBtn").classList.remove("hidden"); }
  }, 400); 
}

function restartGame() {
  document.getElementById("gameOverScreen").classList.add("hidden");
  score = 0; phase = 1; isGameOver = false; speed = baseSpeed; hasShield = false; brakeHeat = 0; isBraking = false; brakeCooldown = false; gameTime.scale = 1.0;
  brakeBtnObj.fillColor = 0xcc0000; brakeBtnText.setText("FREN"); scoreText.setText("Skor: 0"); scoreText.setColor("#ffaa00"); phaseText.setVisible(false); itemGraphic.setVisible(false); itemType = 0; vagonText.setVisible(false);
  document.body.style.backgroundColor = '#87CEEB'; obstacles.clear(true, true); trainWagons.forEach(w => w.destroy()); trainWagons = []; posHistory = []; resetTrain(); setNewCorrectPath();
}

window.addEventListener('resize', () => { if (game && game.scale) setTimeout(() => { game.scale.refresh(); }, 100); });

const config = { type: Phaser.AUTO, width: 800, height: 600, backgroundColor: "#87CEEB", parent: 'gameWrapper', physics: { default: 'arcade', arcade: { debug: false } }, scene: { create, update }, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, fps: { target: 60, forceSetTimeOut: true } };
const game = new Phaser.Game(config);