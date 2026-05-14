const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === 'switch') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    } else if (type === 'score' || type === 'perfect') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.setValueAtTime(1200, now + 0.1);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    } else if (type === 'coin') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.setValueAtTime(1600, now + 0.1);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    } else if (type === 'ice' || type === 'shield') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.exponentialRampToValueAtTime(2000, now + 0.3);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    } else if (type === 'shield_break' || type === 'explosion') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    } else if (type === 'crash') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    }
    osc.start(now);
    osc.stop(now + 0.4);
}

const FIREBASE_URL = "https://switch-master-687ff-default-rtdb.europe-west1.firebasedatabase.app/scores.json";

function loadScores() {
    const scoreList = document.getElementById("scoreList");
    if (!scoreList) return;
    scoreList.innerHTML = "Yükleniyor...";
    fetch(FIREBASE_URL).then(res => res.json()).then(data => {
        if (!data) {
            scoreList.innerHTML = "Henüz skor yok!";
            return;
        }
        let scoresArray = Object.values(data).sort((a, b) => b.score - a.score).slice(0, 5);
        let listHTML = "";
        scoresArray.forEach(entry => {
            listHTML += `<li><b>${entry.name}</b>: ${entry.score}</li>`;
        });
        scoreList.innerHTML = listHTML;
    }).catch(err => console.error(err));
}

function submitScoreAndReturn() {
    const nameInput = document.getElementById("playerNameInput");
    const name = nameInput ? nameInput.value.trim() : "";
    if (name !== "") {
        fetch(FIREBASE_URL, {
            method: "POST",
            body: JSON.stringify({
                name: name,
                score: score
            })
        }).then(() => {
            loadScores();
            returnToMenu();
        }).catch(err => console.error(err));
    } else {
        returnToMenu();
    }
}

let totalCoins = parseInt(localStorage.getItem('sm_totalCoins')) || 0;
let ownedTrains = JSON.parse(localStorage.getItem('sm_ownedTrains')) || ['classic'];
let activeTrain = localStorage.getItem('sm_activeTrain') || 'classic';
let trainUpgrades = JSON.parse(localStorage.getItem('sm_trainUpgrades')) || {};

window.onload = function() {
    let mC = document.getElementById("menuCoinDisplay");
    if (mC) mC.innerText = totalCoins;
    loadScores();
};

function saveMarketData() {
    localStorage.setItem('sm_totalCoins', totalCoins);
    localStorage.setItem('sm_ownedTrains', JSON.stringify(ownedTrains));
    localStorage.setItem('sm_activeTrain', activeTrain);
    localStorage.setItem('sm_trainUpgrades', JSON.stringify(trainUpgrades));
}

function openMarket() {
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("marketScreen").classList.remove("hidden");
    updateMarketUI();
}

function closeMarket() {
    document.getElementById("marketScreen").classList.add("hidden");
    document.getElementById("startScreen").classList.remove("hidden");
    let mC = document.getElementById("menuCoinDisplay");
    if (mC) mC.innerText = totalCoins;
}

function updateMarketUI() {
    let mD = document.getElementById("marketCoinDisplay");
    if (mD) mD.innerText = totalCoins;

    const setBtnState = (selector, isSelected, isOwned, price) => {
        let btn = document.querySelector(selector);
        if (!btn) return;
        if (isSelected) {
            btn.innerText = "SEÇİLDİ";
            btn.style.background = "#00ff88";
            btn.style.color = "#000";
        } else if (isOwned) {
            btn.innerText = "SEÇ";
            btn.style.background = "rgba(0, 255, 136, 0.1)";
            btn.style.color = "#00ff88";
        } else {
            btn.innerText = price + " 💰";
            btn.style.background = "rgba(0, 255, 136, 0.1)";
            btn.style.color = "#00ff88";
        }
    };

    setBtnState("#card-speedster button", activeTrain === 'speedster', ownedTrains.includes('speedster'), "3000");
    setBtnState("#card-armored button", activeTrain === 'armored', ownedTrains.includes('armored'), "5000");
    setBtnState(".market-items .item-card:nth-child(1) button", activeTrain === 'classic', true, "");

    let upCls = document.querySelector("#upgrade-classic button");
    if (upCls) {
        if (trainUpgrades['classic_brake']) {
            upCls.innerText = "AKTİF";
            upCls.disabled = true;
            upCls.style.background = "transparent";
            upCls.style.color = "#888";
            upCls.style.border = "1px solid #555";
        } else {
            upCls.innerText = "2000 💰";
            upCls.disabled = false;
        }
    }

    let upSpd = document.querySelector("#upgrade-speedster button");
    if (upSpd) {
        if (trainUpgrades['speedster_brake']) {
            upSpd.innerText = "AKTİF";
            upSpd.disabled = true;
            upSpd.style.background = "transparent";
            upSpd.style.color = "#888";
            upSpd.style.border = "1px solid #555";
        } else {
            upSpd.innerText = "2500 💰";
            upSpd.disabled = false;
        }
    }
}

let tunnelsBack, tunnelsFront;

function buyTrain(trainId, price) {
    if (totalCoins >= price && !ownedTrains.includes(trainId)) {
        totalCoins -= price;
        ownedTrains.push(trainId);
        saveMarketData();
        return true;
    }
    return false;
}

function buyUpgrade(trainId, price) {
    let upgradeKey = trainId + "_brake";
    if (totalCoins >= price && ownedTrains.includes(trainId) && !trainUpgrades[upgradeKey]) {
        totalCoins -= price;
        trainUpgrades[upgradeKey] = true;
        saveMarketData();
        updateMarketUI();
        return true;
    }
    return false;
}

function selectTrain(trainId) {
    if (ownedTrains.includes(trainId)) {
        activeTrain = trainId;
        saveMarketData();
        applyTrainVisuals();
        updateMarketUI();
        return true;
    }
    return false;
}

let isPaused = false;

function pauseGame(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    if (!game || !gameStarted || isGameOver || isPaused) return;

    isPaused = true;
    game.scene.pause('PlayScene');
    document.getElementById("pauseScreen").classList.remove("hidden");
    document.getElementById("pauseBtn").classList.add("hidden");
}

function resumeGame(e) {
    if (e) e.stopPropagation();
    if (!isPaused) return;
    isPaused = false;
    game.scene.resume('PlayScene');
    document.getElementById("pauseScreen").classList.add("hidden");
    document.getElementById("pauseBtn").classList.remove("hidden");
}

function quitToMenuFromPause(e) {
    if (e) e.stopPropagation();
    resumeGame();
    returnToMenu();
}

function showFloatingText(x, y, message, colorStr) {
    if (!gameScene) return;
    let ft = gameScene.add.text(x, y - 20, message, {
        fontSize: "24px",
        fill: colorStr,
        fontStyle: "bold",
        stroke: "#000",
        strokeThickness: 4
    }).setOrigin(0.5).setDepth(150);
    gameScene.tweens.add({
        targets: ft,
        y: ft.y - 50,
        alpha: 0,
        duration: 1200,
        ease: 'Power1',
        onComplete: () => ft.destroy()
    });
}

let train, graphics, scoreText, phaseText, vagonText, obstacles;
let switchBase, switchHandle, headlight, headlineCore, farGlow;
let itemGraphic, itemType = 0;
let trainShieldCircle, backgroundGroup, midgroundGroup;
let farMountains, midTrees, solidGround;
let brakeBtnObj, brakeBtnText, brakeBarBg, brakeBarFill;
let isBraking = false, brakeHeat = 0, brakeCooldown = false, chillTimer = 0;
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
let currentSkyPhase = 1;
let classicTrainGroup = [];
let yhtTrainGroup = [];
let armoredTrainGroup = [];
let metalShieldBase, metalShieldSpike1, metalShieldSpike2, metalShieldCrack;
let shieldDurability = 0;

const p1Top = [ { x: -150, y: 300 }, { x: 300, y: 300 }, { x: 500, y: 200 }, { x: 1000, y: 200 } ];
const p1Bot = [ { x: -150, y: 300 }, { x: 300, y: 300 }, { x: 500, y: 400 }, { x: 1000, y: 400 } ];
const p2Top = [ { x: -150, y: 300 }, { x: 300, y: 300 }, { x: 500, y: 150 }, { x: 1000, y: 150 } ];
const p2Mid = [ { x: -150, y: 300 }, { x: 300, y: 300 }, { x: 500, y: 300 }, { x: 1000, y: 300 } ];
const p2Bot = [ { x: -150, y: 300 }, { x: 300, y: 300 }, { x: 500, y: 450 }, { x: 1000, y: 450 } ];
let gameScene;

function applyTrainVisuals() {
    classicTrainGroup.forEach(p => p.setVisible(activeTrain === 'classic'));
    yhtTrainGroup.forEach(p => p.setVisible(activeTrain === 'speedster'));
    armoredTrainGroup.forEach(p => p.setVisible(activeTrain === 'armored'));

    if (activeTrain === 'armored') {
        if (shieldDurability === 2) {
            metalShieldBase.setVisible(true);
            metalShieldSpike1.setVisible(true);
            metalShieldSpike2.setVisible(true);
            metalShieldCrack.setVisible(false);
        } else if (shieldDurability === 1) {
            metalShieldBase.setVisible(true);
            metalShieldSpike1.setVisible(false);
            metalShieldSpike2.setVisible(false);
            metalShieldCrack.setVisible(true);
        } else {
            metalShieldBase.setVisible(false);
            metalShieldSpike1.setVisible(false);
            metalShieldSpike2.setVisible(false);
            metalShieldCrack.setVisible(false);
        }
    }
}

function create() {
    gameScene = this;
    gameScene.cameras.main.setBackgroundColor('#87CEEB');
    graphics = this.add.graphics();
    graphics.setDepth(5);
    obstacles = this.physics.add.group();
    this.add.circle(600, 100, 30, 0xffeb3b).setDepth(0);

    gameScene.overlaySunset = this.add.rectangle(400, 300, 2000, 600, 0xfc7b03).setDepth(0.1).setAlpha(0);
    gameScene.overlayNight = this.add.rectangle(400, 300, 2000, 600, 0x111122).setDepth(0.2).setAlpha(0);

    tunnelsBack = this.add.graphics().setDepth(9);
    tunnelsFront = this.add.graphics().setDepth(11);

    window.refreshTunnels = () => {
        if (!tunnelsBack || !tunnelsFront) return;
        tunnelsBack.clear();
        tunnelsFront.clear();
        tunnelsBack.setDepth(4);

        const drawPipe = (x, y, isRightSide) => {
            const radOuter = 28;
            const radInner = 18;
            const archY = y - 8;
            const groundY = y + 12;
            const fadeW = 50;

            tunnelsBack.fillStyle(0x050505, 1);
            tunnelsBack.beginPath();
            tunnelsBack.moveTo(x - radInner, groundY);
            tunnelsBack.lineTo(x - radInner, archY);
            tunnelsBack.arc(x, archY, radInner, Math.PI, 0, false);
            tunnelsBack.lineTo(x + radInner, groundY);
            tunnelsBack.fillPath();

            let rx = isRightSide ? x : 0;
            let rw = isRightSide ? (1000 - x) : x;
            tunnelsBack.fillRect(rx, archY - radInner, rw, radInner + (groundY - archY));

            tunnelsBack.fillStyle(0x5a5a5a, 1);
            tunnelsBack.lineStyle(3, 0x111111);
            tunnelsBack.beginPath();
            if (isRightSide) {
                tunnelsBack.moveTo(x - radOuter, groundY);
                tunnelsBack.lineTo(x - radOuter, archY);
                tunnelsBack.arc(x, archY, radOuter, Math.PI, 1.5 * Math.PI, false);
                tunnelsBack.lineTo(x, archY - radInner);
                tunnelsBack.arc(x, archY, radInner, 1.5 * Math.PI, Math.PI, true);
                tunnelsBack.lineTo(x - radInner, groundY);
            } else {
                tunnelsBack.moveTo(x, archY - radOuter);
                tunnelsBack.arc(x, archY, radOuter, 1.5 * Math.PI, 0, false);
                tunnelsBack.lineTo(x + radOuter, groundY);
                tunnelsBack.lineTo(x + radInner, groundY);
                tunnelsBack.lineTo(x + radInner, archY);
                tunnelsBack.arc(x, archY, radInner, 0, 1.5 * Math.PI, true);
                tunnelsBack.lineTo(x, archY - radInner);
            }
            tunnelsBack.closePath();
            tunnelsBack.fillPath();
            tunnelsBack.strokePath();

            tunnelsFront.fillStyle(0x333333, 1);
            tunnelsFront.fillRect(rx, archY - radOuter, rw, radOuter - radInner);
            tunnelsFront.lineStyle(3, 0x111111);
            tunnelsFront.beginPath();
            tunnelsFront.moveTo(rx, archY - radOuter);
            tunnelsFront.lineTo(rx + rw, archY - radOuter);
            tunnelsFront.strokePath();

            tunnelsFront.fillStyle(0x5a5a5a, 1);
            tunnelsFront.lineStyle(3, 0x111111);
            tunnelsFront.beginPath();
            if (isRightSide) {
                tunnelsFront.moveTo(x, archY - radOuter);
                tunnelsFront.arc(x, archY, radOuter, 1.5 * Math.PI, 0, false);
                tunnelsFront.lineTo(x + radOuter, groundY);
                tunnelsFront.lineTo(x + radInner, groundY);
                tunnelsFront.lineTo(x + radInner, archY);
                tunnelsFront.arc(x, archY, radInner, 0, 1.5 * Math.PI, true);
                tunnelsFront.lineTo(x, archY - radInner);
            } else {
                tunnelsFront.moveTo(x - radOuter, groundY);
                tunnelsFront.lineTo(x - radOuter, archY);
                tunnelsFront.arc(x, archY, radOuter, Math.PI, 1.5 * Math.PI, false);
                tunnelsFront.lineTo(x, archY - radInner);
                tunnelsFront.arc(x, archY, radInner, 1.5 * Math.PI, Math.PI, true);
                tunnelsFront.lineTo(x - radInner, groundY);
            }
            tunnelsFront.closePath();
            tunnelsFront.fillPath();
            tunnelsFront.strokePath();

            if (isRightSide) {
                tunnelsFront.fillGradientStyle(0x050505, 0x050505, 0x050505, 0x050505, 0, 1, 0, 1);
                tunnelsFront.fillRect(x, archY - radInner, fadeW, radInner + (groundY - archY));
                tunnelsFront.fillStyle(0x050505, 1);
                tunnelsFront.fillRect(x + fadeW, archY - radInner, rw - fadeW, radInner + (groundY - archY));
            } else {
                let w = Math.min(fadeW, x);
                tunnelsFront.fillGradientStyle(0x050505, 0x050505, 0x050505, 0x050505, 1, 0, 1, 0);
                tunnelsFront.fillRect(x - w, archY - radInner, w, radInner + (groundY - archY));
                tunnelsFront.fillStyle(0x050505, 1);
                tunnelsFront.fillRect(0, archY - radInner, x - w, radInner + (groundY - archY));
            }
        };

        drawPipe(30, 300, false);
        if (phase === 1) {
            drawPipe(970, 200, true);
            drawPipe(970, 400, true);
        } else {
            drawPipe(970, 150, true);
            drawPipe(970, 300, true);
            drawPipe(970, 450, true);
        }
    };
    window.refreshTunnels();

    let mountainTex = this.make.graphics({ x: 0, y: 0, add: false });
    mountainTex.fillStyle(0x778899, 1);
    mountainTex.beginPath();
    mountainTex.moveTo(0, 300);
    mountainTex.lineTo(100, 150);
    mountainTex.lineTo(200, 250);
    mountainTex.lineTo(300, 100);
    mountainTex.lineTo(400, 200);
    mountainTex.lineTo(500, 180);
    mountainTex.lineTo(600, 300);
    mountainTex.fillPath();
    mountainTex.closePath();
    mountainTex.generateTexture('farMnt', 600, 300);
    farMountains = this.add.tileSprite(400, 450, 2000, 300, 'farMnt').setOrigin(0.5, 0.5).setDepth(1);

    let treeTex = this.make.graphics({ x: 0, y: 0, add: false });
    treeTex.fillStyle(0x1a713b, 1);
    treeTex.beginPath();
    treeTex.moveTo(15, 60);
    treeTex.lineTo(30, 0);
    treeTex.lineTo(45, 60);
    treeTex.fillPath();
    treeTex.closePath();
    treeTex.generateTexture('midTree', 60, 60);
    midTrees = this.add.tileSprite(400, 560, 2000, 60, 'midTree').setOrigin(0.5, 0.5).setDepth(2);
    solidGround = this.add.rectangle(400, 590, 2000, 20, 0x114a24).setDepth(2.5);

    itemGraphic = this.add.container(0, 0).setDepth(8);
    let cOutline = this.add.circle(0, 0, 18, 0xffffff, 0.3);
    let cBody = this.add.circle(0, 0, 14, 0xffffff);
    let cIcon = this.add.text(0, 0, "", { fontSize: '18px', fontStyle: 'bold' }).setOrigin(0.5, 0.5);
    itemGraphic.add([cOutline, cBody, cIcon]);
    itemGraphic.setVisible(false);

    let pStar = this.make.graphics({ x: 0, y: 0, add: false });
    pStar.fillStyle(0x00ffff);
    pStar.beginPath();
    pStar.moveTo(5, 0);
    pStar.lineTo(10, 5);
    pStar.lineTo(5, 10);
    pStar.lineTo(0, 5);
    pStar.closePath();
    pStar.fillPath();
    pStar.generateTexture('pStarTex', 10, 10);
    starEmitter = this.add.particles(0, 0, 'pStarTex', {
        speed: { min: 150, max: 350 },
        angle: { min: 0, max: 360 },
        scale: { start: 1.5, end: 0 },
        lifespan: 600,
        blendMode: 'ADD',
        emitting: false
    }).setDepth(15);

    train = this.add.container(-50, 300).setDepth(10);
    this.physics.add.existing(train);
    train.body.setCircle(25, -25, -25);

    headlight = this.add.graphics();
    headlight.fillStyle(0xffffff, 0.15);
    headlight.fillTriangle(30, 0, 280, -80, 280, 80);
    headlineCore = this.add.circle(30, 0, 6, 0xffffff, 0.8);
    farGlow = this.add.circle(30, 0, 15, 0xffaa00, 0.4);
    headlight.setVisible(false);
    headlineCore.setVisible(false);
    farGlow.setVisible(false);
    trainShieldCircle = this.add.circle(0, 0, 42, 0x00ff88, 0.25).setStrokeStyle(3, 0x00ff88, 1);
    trainShieldCircle.setVisible(false);
    train.add([farGlow, headlineCore, headlight, trainShieldCircle]);

    let clBodyLower = this.add.rectangle(0, 8, 60, 14, 0x111111);
    let clBodyUpper = this.add.rectangle(0, -3, 60, 16, 0x2c3e50);
    let clCabin = this.add.rectangle(-15, -15, 24, 16, 0x1a252f).setStrokeStyle(1, 0x111111);
    let clWindow = this.add.rectangle(-15, -15, 12, 8, 0x00ffff);
    let clFront = this.add.rectangle(30, 0, 8, 16, 0x111111);
    let clBumper = this.add.rectangle(34, 6, 6, 12, 0x555555);
    let clChimney = this.add.rectangle(20, -15, 8, 12, 0x111111);
    let clStripe = this.add.rectangle(0, 1, 60, 2, 0xffaa00);
    classicTrainGroup.push(clBodyLower, clBodyUpper, clCabin, clWindow, clFront, clBumper, clChimney, clStripe);

    let yhtG = this.add.graphics();
    yhtG.fillStyle(0xeeeeee);
    yhtG.beginPath();
    yhtG.moveTo(-30, -10);
    yhtG.lineTo(15, -10);
    yhtG.lineTo(35, 10);
    yhtG.lineTo(-30, 10);
    yhtG.fillPath();
    yhtG.fillStyle(0xff0000);
    yhtG.fillRect(-30, 2, 60, 3);
    yhtG.fillStyle(0x000000);
    yhtG.beginPath();
    yhtG.moveTo(-28, -8);
    yhtG.lineTo(13, -8);
    yhtG.lineTo(25, 0);
    yhtG.lineTo(-28, 0);
    yhtG.fillPath();
    yhtTrainGroup.push(yhtG);

    let arBodyLower = this.add.rectangle(0, 8, 60, 14, 0x222222);
    let arBodyUpper = this.add.rectangle(0, -3, 60, 16, 0x444444);
    let arCabin = this.add.rectangle(-15, -15, 24, 16, 0x333333).setStrokeStyle(1, 0x111111);
    let arWindow = this.add.rectangle(-15, -15, 12, 8, 0x00ffff);
    let arFront = this.add.rectangle(30, 0, 8, 16, 0x111111);
    let arChimney = this.add.rectangle(20, -15, 8, 12, 0x111111);
    let arStripe = this.add.rectangle(0, 1, 60, 2, 0x00ff88);

    metalShieldBase = this.add.graphics();
    metalShieldBase.fillStyle(0x555555);
    metalShieldBase.lineStyle(2, 0x222222);
    metalShieldBase.beginPath();
    metalShieldBase.moveTo(34, -12);
    metalShieldBase.lineTo(44, 0);
    metalShieldBase.lineTo(34, 12);
    metalShieldBase.lineTo(34, -12);
    metalShieldBase.fillPath();
    metalShieldBase.strokePath();

    metalShieldSpike1 = this.add.triangle(45, -5, 0, -4, 0, 4, 8, 0, 0xaaaaaa);
    metalShieldSpike2 = this.add.triangle(45, 5, 0, -4, 0, 4, 8, 0, 0xaaaaaa);

    metalShieldCrack = this.add.graphics();
    metalShieldCrack.lineStyle(2, 0x000000);
    metalShieldCrack.beginPath();
    metalShieldCrack.moveTo(42, 0);
    metalShieldCrack.lineTo(36, -5);
    metalShieldCrack.lineTo(38, 8);
    metalShieldCrack.strokePath();

    armoredTrainGroup.push(arBodyLower, arBodyUpper, arCabin, arWindow, arFront, arChimney, arStripe, metalShieldBase, metalShieldSpike1, metalShieldSpike2, metalShieldCrack);

    train.add([...classicTrainGroup, ...yhtTrainGroup, ...armoredTrainGroup]);
    applyTrainVisuals();

    switchBase = this.add.rectangle(300, 300, 14, 60, 0x555555).setDepth(6);
    switchHandle = this.add.circle(300, 280, 10, 0xff0000).setStrokeStyle(1, 0x000).setDepth(7);
    scoreText = this.add.text(20, 20, "Skor: 0", { fontSize: "32px", fill: "#ffaa00", fontStyle: "bold", stroke: '#000', strokeThickness: 6 }).setDepth(100);
    phaseText = this.add.text(400, 250, "🎟️ ANA HAT KİLİDİ AÇILDI 🎟️\n🔥 3. ŞERİT AKTİF 🔥", { fontSize: "38px", fill: "#ff3300", fontStyle: "bold", align: "center", stroke: "#ffffff", strokeThickness: 6 }).setOrigin(0.5).setDepth(100);
    phaseText.setVisible(false);
    vagonText = this.add.text(400, 200, "🚂 YENİ VAGON EKLENDİ 🚂", { fontSize: "32px", fill: "#00ffff", fontStyle: "bold", align: "center", stroke: "#000", strokeThickness: 6 }).setOrigin(0.5).setDepth(100);
    vagonText.setVisible(false);
    brakeBarBg = this.add.rectangle(700, 490, 120, 15, 0x222222).setOrigin(0.5).setStrokeStyle(2, 0xffffff).setDepth(100);
    brakeBarFill = this.add.rectangle(640, 490, 0, 15, 0xffeb3b).setOrigin(0, 0.5).setDepth(100);

    brakeBtnObj = this.add.rectangle(700, 540, 140, 70, 0xcc0000, 0.9).setInteractive().setStrokeStyle(3, 0xffaa00).setDepth(100);
    brakeBtnText = this.add.text(700, 540, "FREN", { fontSize: '24px', fontStyle: 'bold', color: '#fff' }).setOrigin(0.5).setDepth(100);

    this.input.addPointer(2);

    brakeBtnObj.on('pointerdown', (pointer) => {
        if (!brakeCooldown && gameStarted && !isGameOver && !isPaused) {
            isBraking = true;
            brakeBtnObj.fillColor = 0x990000;
        }
    });

    const stopBraking = () => {
        isBraking = false;
        if (!brakeCooldown) brakeBtnObj.fillColor = 0xcc0000;
    };

    brakeBtnObj.on('pointerup', stopBraking);
    brakeBtnObj.on('pointerout', stopBraking);

    this.input.keyboard.on('keydown-SPACE', () => {
        if (!brakeCooldown && gameStarted && !isGameOver && !isPaused) {
            isBraking = true;
            brakeBtnObj.fillColor = 0x990000;
        }
    });

    this.input.keyboard.on('keyup-SPACE', () => {
        isBraking = false;
        if (!brakeCooldown) brakeBtnObj.fillColor = 0xcc0000;
    });

    this.input.on("pointerdown", (pointer, currentlyOver) => {
        if (!gameStarted || isGameOver || isPaused || currentlyOver.length > 0) return;

        playSound('switch');
        if (navigator.vibrate) navigator.vibrate(40);
        this.cameras.main.shake(50, 0.002);

        let distToSwitch = 300 - train.x;
        if (pathIndex === 1 && distToSwitch > 0 && distToSwitch < 60 && !perfectUsed) {
            perfectUsed = true;
            score += 2;
            scoreText.setText("Skor: " + score);
            playSound('perfect');
            showFloatingText(train.x, train.y - 40, "KUSURSUZ! +2", "#00ffff");
            starEmitter.emitParticleAt(train.x, train.y, 20);
        }

        if (phase === 1) {
            switchState = (switchState === 0) ? 1 : 0;
            this.tweens.add({ targets: switchHandle, y: (switchState === 0 ? 280 : 320), duration: 100 });
        } else {
            switchState = (switchState + 1) % 3;
            this.tweens.add({ targets: switchHandle, y: (275 + (switchState * 25)), duration: 100 });
        }
    });

    this.physics.add.overlap(train, obstacles, (t, obs) => { handleCollision(obs); });
    currentPath = p1Top;
}

function setNewCorrectPath() {
    if (phase === 1) {
        correctPathIndex = Math.random() > 0.5 ? 0 : 1;
    } else {
        correctPathIndex = Math.floor(Math.random() * 3);
    }

    if (typeof refreshTunnels === 'function') {
        refreshTunnels();
    }
}

function handleCollision(obs) {
    if (hasShield) {
        playSound('shield_break');
        if (navigator.vibrate) navigator.vibrate(100);
        hasShield = false;
        showFloatingText(train.x, train.y - 40, "ZIRH KIRILDI!", "#ff4444");
        createExplosion(obs.x, obs.y);
        obs.destroy();
        gameScene.cameras.main.shake(200, 0.015);
    } else if (activeTrain === 'armored' && shieldDurability > 0) {
        shieldDurability--;
        playSound('shield_break');
        if (navigator.vibrate) navigator.vibrate(100);
        showFloatingText(train.x, train.y - 40, "ZIRH HASAR ALDI!", "#ff4444");
        createExplosion(obs.x, obs.y);
        obs.destroy();
        gameScene.cameras.main.shake(200, 0.015);
        applyTrainVisuals();
    } else {
        triggerGameOver();
    }
}

function createWagon() {
    let w = gameScene.add.container(-100, 300).setDepth(9);
    gameScene.physics.add.existing(w);
    w.body.setCircle(20, -20, -20);
    if (activeTrain === 'speedster') {
        let body = gameScene.add.rectangle(0, 0, 50, 20, 0xeeeeee);
        let stripe = gameScene.add.rectangle(0, 3, 50, 3, 0xff0000);
        let window = gameScene.add.rectangle(0, -5, 40, 6, 0x000000);
        let w1 = gameScene.add.circle(-15, 10, 5, 0x333);
        let w2 = gameScene.add.circle(15, 10, 5, 0x333);
        w.add([body, stripe, window, w1, w2]);
    } else if (activeTrain === 'armored') {
        let base = gameScene.add.rectangle(0, 5, 50, 14, 0x222222);
        let body = gameScene.add.rectangle(0, -5, 48, 16, 0x444444);
        let roof = gameScene.add.rectangle(0, -15, 50, 6, 0x555555);
        let window1 = gameScene.add.rectangle(-10, -5, 12, 8, 0x00ffff);
        let window2 = gameScene.add.rectangle(10, -5, 12, 8, 0x00ffff);
        let w1 = gameScene.add.circle(-15, 12, 6, 0x111).setStrokeStyle(1, 0x000);
        let w2 = gameScene.add.circle(15, 12, 6, 0x111).setStrokeStyle(1, 0x000);
        w.add([base, body, roof, w1, w2, window1, window2]);
    } else {
        let base = gameScene.add.rectangle(0, 5, 50, 14, 0x111111);
        let body = gameScene.add.rectangle(0, -5, 48, 16, 0x2c3e50);
        let roof = gameScene.add.rectangle(0, -15, 50, 6, 0x888888);
        let window1 = gameScene.add.rectangle(-10, -5, 12, 8, 0x00ffff);
        let window2 = gameScene.add.rectangle(10, -5, 12, 8, 0x00ffff);
        let w1 = gameScene.add.circle(-15, 12, 6, 0x333).setStrokeStyle(1, 0x000);
        let w2 = gameScene.add.circle(15, 12, 6, 0x333).setStrokeStyle(1, 0x000);
        w.add([base, body, roof, w1, w2, window1, window2]);
    }
    gameScene.physics.add.overlap(w, obstacles, (wagon, obs) => {
        handleCollision(obs);
    });
    return w;
}

function update() {
    if (!gameStarted || isGameOver || isPaused) return;
    farMountains.tilePositionX += 0.1 * (speed / baseSpeed) * gameTime.scale;
    midTrees.tilePositionX += 0.5 * (speed / baseSpeed) * gameTime.scale;
    pulse += 0.05 * gameTime.scale;
    if (score >= 10 && score < 20 && currentSkyPhase === 1) {
        currentSkyPhase = 2;
        gameScene.tweens.add({
            targets: gameScene.overlaySunset,
            alpha: 1,
            duration: 3000
        });
    } else if (score >= 20 && currentSkyPhase === 2) {
        currentSkyPhase = 3;
        gameScene.tweens.add({
            targets: gameScene.overlayNight,
            alpha: 1,
            duration: 3000
        });
        headlight.setVisible(true);
        headlineCore.setVisible(true);
        farGlow.setVisible(true);
    }

    let targetWagonCount = Math.min(Math.floor(score / 20), 4);
    if (trainWagons.length < targetWagonCount) {
        trainWagons.push(createWagon());
        playSound('ice');
        gameScene.cameras.main.flash(300, 0, 255, 255);
        vagonText.setVisible(true).setScale(0.5).setAlpha(1);
        gameScene.tweens.add({
            targets: vagonText,
            scale: 1.2,
            duration: 1500,
            ease: 'Out'
        });
        gameScene.tweens.add({
            targets: vagonText,
            alpha: 0,
            duration: 500,
            delay: 1500
        });
    }
    if (score >= 25 && phase === 1 && pathIndex === 0) {
        phase = 2;
        switchState = 1;
        switchHandle.y = 300;
        playSound('explosion');
        this.cameras.main.flash(800, 255, 100, 0);
        this.cameras.main.shake(800, 0.01);
        gameTime.scale = 0.15;
        phaseText.setVisible(true).setScale(0.5).setAlpha(1);
        this.tweens.add({
            targets: phaseText,
            scale: 1.2,
            duration: 2500,
            ease: 'Out'
        });
        this.tweens.add({
            targets: phaseText,
            alpha: 0,
            duration: 1000,
            delay: 2500
        });
        this.tweens.add({
            targets: gameTime,
            scale: 1.0,
            duration: 3000,
            ease: 'Sine.easeIn',
            delay: 500
        });
        setNewCorrectPath();
    }
    if (hasShield) {
        trainShieldCircle.scale = 1 + Math.sin(pulse * 8) * 0.05;
        trainShieldCircle.setAlpha(0.6 + Math.sin(pulse * 10) * 0.4);
        trainShieldCircle.setVisible(true);
    } else {
        trainShieldCircle.setVisible(false);
    }
    let baseHeatRate = 1.5;
    let upgradeKey = activeTrain + "_brake";
    if (trainUpgrades[upgradeKey]) {
        baseHeatRate = 0.8;
    }

    if (isBraking) {
        speed = 0.5;
        brakeHeat += (baseHeatRate * gameTime.scale);
        spawnBrakeSparks();
        if (brakeHeat >= 100) {
            brakeHeat = 100;
            isBraking = false;
            brakeCooldown = true;
            brakeBtnObj.fillColor = 0x555555;
            brakeBtnText.setText("AŞIRI ISI");
            playSound('shield_break');
        }
    } else if (chillTimer > 0) {
        chillTimer -= gameTime.scale;
        let targetSpeed = 1.2;
        speed += (targetSpeed - speed) * 0.1 * gameTime.scale;
        if (brakeHeat > 0) {
            brakeHeat -= (1.5 * gameTime.scale);
            if (brakeHeat <= 0) {
                brakeHeat = 0;
                brakeCooldown = false;
                brakeBtnObj.fillColor = 0xcc0000;
                brakeBtnText.setText("FREN");
            }
        }
    } else {
        let tSpeed = baseSpeed + (score * 0.2);
        if (activeTrain === 'speedster') tSpeed += 2;
        let targetSpeed = Math.min(maxSpeed, tSpeed);
        speed += (targetSpeed - speed) * 0.1 * gameTime.scale;
        if (brakeHeat > 0) {
            brakeHeat -= (0.6 * gameTime.scale);
            if (brakeHeat <= 0) {
                brakeHeat = 0;
                brakeCooldown = false;
                brakeBtnObj.fillColor = 0xcc0000;
                brakeBtnText.setText("FREN");
            }
        }
    }

    brakeBarFill.width = (brakeHeat / 100) * 120;
    if (brakeHeat > 80) brakeBarFill.fillColor = 0xff0000;
    else if (brakeHeat > 50) brakeBarFill.fillColor = 0xffa500;
    else brakeBarFill.fillColor = 0xffeb3b;
    if (itemGraphic.visible) {
        itemGraphic.scale = 1 + Math.sin(pulse * 4) * 0.1;
        let cx = itemGraphic.x - train.x;
        let cy = itemGraphic.y - train.y;
        if (Math.sqrt(cx * cx + cy * cy) < 25) {
            itemGraphic.setVisible(false);
            if (itemType === 1) {
                score += 3;
                totalCoins += 50;
                saveMarketData();
                showFloatingText(train.x, train.y - 40, "+50 💰", "#ffd700");
                scoreText.setText("Skor: " + score);
                playSound('coin');
                gameScene.tweens.add({
                    targets: scoreText,
                    scale: 1.5,
                    duration: 100,
                    yoyo: true
                });
            } else if (itemType === 2) {
                showFloatingText(train.x, train.y - 40, "SOĞUTMA! ❄️", "#00ffff");
                chillTimer = 180;
                brakeHeat = 0;
                brakeCooldown = false;
                brakeBtnObj.fillColor = 0xcc0000;
                brakeBtnText.setText("FREN");
                playSound('ice');
                gameScene.cameras.main.flash(300, 0, 255, 255);
            } else if (itemType === 3) {
                showFloatingText(train.x, train.y - 40, "KALKAN! 🛡️", "#00ff88");
                hasShield = true;
                playSound('shield');
            }
            itemType = 0;
        }
    }
    drawRails();
    updateSmoke();
    updateSparks();
    updateExplosions();
    let target = currentPath[pathIndex];
    let dx = target.x - train.x;
    let dy = target.y - train.y;
    let dist = Math.sqrt(dx * dx + dy * dy);
    let step = Math.min(speed * gameTime.scale, dist);
    if (dist <= step || dist < 1) {
        train.x = target.x;
        train.y = target.y;
        pathIndex++;
        if (pathIndex === 2) {
            lockedChoice = switchState;
            if (phase === 1) currentPath = (lockedChoice === 0) ? p1Top : p1Bot;
            else currentPath = (lockedChoice === 0) ? p2Top : (lockedChoice === 1) ? p2Mid : p2Bot;
        }
        if (pathIndex >= currentPath.length) {
            if (lockedChoice !== correctPathIndex) {
                if (hasShield) {
                    playSound('shield_break');
                    if (navigator.vibrate) navigator.vibrate(100);
                    hasShield = false;
                    showFloatingText(train.x, train.y - 40, "ZIRH KIRILDI!", "#ff4444");
                    gameScene.cameras.main.shake(200, 0.015);
                    resetTrain(false);
                    setNewCorrectPath();
                } else if (activeTrain === 'armored' && shieldDurability > 0) {
                    shieldDurability--;
                    playSound('shield_break');
                    if (navigator.vibrate) navigator.vibrate(100);
                    showFloatingText(train.x, train.y - 40, "ZIRH HASAR ALDI!", "#ff4444");
                    gameScene.cameras.main.shake(200, 0.015);
                    applyTrainVisuals();
                    resetTrain(false);
                    setNewCorrectPath();
                } else {
                    triggerGameOver();
                }
            } else {
                score++;
                scoreText.setText("Skor: " + score);
                playSound('score');
                resetTrain(false);
                setNewCorrectPath();
                if (Math.random() > 0.5) {
                    let r = Math.random();
                    let cOutline = itemGraphic.list[0];
                    let cBody = itemGraphic.list[1];
                    let cIcon = itemGraphic.list[2];
                    if (r < 0.6) {
                        itemType = 1;
                        cBody.fillColor = 0xffd700;
                        cOutline.fillColor = 0xb8860b;
                        cIcon.setText("💰");
                        cIcon.setColor("#000");
                    } else if (r < 0.8) {
                        itemType = 2;
                        cBody.fillColor = 0x00bfff;
                        cOutline.fillColor = 0x0000ff;
                        cIcon.setText("❄️");
                        cIcon.setColor("#fff");
                    } else {
                        itemType = 3;
                        cBody.fillColor = 0x32cd32;
                        cOutline.fillColor = 0x008000;
                        cIcon.setText("🛡️");
                        cIcon.setColor("#fff");
                    }
                    let spawnPath;
                    if (phase === 1) spawnPath = (correctPathIndex === 0) ? p1Top : p1Bot;
                    else spawnPath = (correctPathIndex === 0) ? p2Top : (correctPathIndex === 1) ? p2Mid : p2Bot;
                    itemGraphic.x = spawnPath[2].x + (spawnPath[3].x - spawnPath[2].x) * 0.6;
                    itemGraphic.y = spawnPath[2].y + (spawnPath[3].y - spawnPath[2].y) * 0.6;
                    itemGraphic.setVisible(true);
                } else {
                    itemGraphic.setVisible(false);
                    itemType = 0;
                }
            }
        }
    } else {
        train.x += (dx / dist) * step;
        train.y += (dy / dist) * step;
        let targetAngle = Math.atan2(dy, dx);
        currentAngle += (targetAngle - currentAngle) * 0.15 * gameTime.scale;
        train.rotation = currentAngle;
        spawnNormalSmoke();
    }
    let lastP = posHistory.length > 0 ? posHistory[0] : null;
    if (!lastP) {
        posHistory.unshift({
            x: train.x,
            y: train.y,
            rot: train.rotation
        });
    } else {
        let mdx = train.x - lastP.x;
        let mdy = train.y - lastP.y;
        let moveDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (moveDist >= 2) {
            let steps = Math.ceil(moveDist / 2);
            let startRot = lastP.rot;
            let endRot = train.rotation;
            let diff = endRot - startRot;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            for (let s = 1; s <= steps; s++) {
                let f = s / steps;
                let nx = lastP.x + mdx * f;
                let ny = lastP.y + mdy * f;
                let nRot = startRot + diff * f;
                posHistory.unshift({
                    x: nx,
                    y: ny,
                    rot: nRot
                });
            }
        }
    }
    let maxHist = 50 + (trainWagons.length * 30);
    if (posHistory.length > maxHist) posHistory.length = maxHist;
    for (let i = 0; i < trainWagons.length; i++) {
        let tIdx = 38 + (i * 28);
        if (tIdx < posHistory.length) {
            trainWagons[i].x = posHistory[tIdx].x;
            trainWagons[i].y = posHistory[tIdx].y;
            trainWagons[i].rotation = posHistory[tIdx].rot;
        } else {
            let last = posHistory[posHistory.length - 1];
            trainWagons[i].x = last.x;
            trainWagons[i].y = last.y;
            trainWagons[i].rotation = last.rot;
        }
    }
    obstacles.getChildren().forEach(obs => {
        obs.x -= (4 + (score * 0.05)) * gameTime.scale;
        if (obs.x < -100) obs.destroy();
        spawnBlackSmoke(obs.x, obs.y);
    });
}

function spawnObstacle() {
    if (score < 5) return;
    if (Math.random() > 0.4) {
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

function spawnNormalSmoke() {
    if (Math.random() > (0.5 * gameTime.scale)) return;
    smokeParticles.push({
        x: train.x - 10,
        y: train.y - 20,
        alpha: 1,
        size: Phaser.Math.Between(4, 8),
        color: 0xdddddd
    });
}

function spawnBlackSmoke(x, y) {
    if (Math.random() > (0.3 * gameTime.scale)) return;
    smokeParticles.push({
        x: x,
        y: y - 10,
        alpha: 1,
        size: Phaser.Math.Between(5, 10),
        color: 0x222222
    });
    if (Math.random() > 0.7) smokeParticles.push({
        x: x,
        y: y,
        alpha: 1,
        size: Phaser.Math.Between(2, 5),
        color: 0xff4400
    });
}

function updateSmoke() {
    for (let i = smokeParticles.length - 1; i >= 0; i--) {
        let p = smokeParticles[i];
        p.y -= (0.5 * gameTime.scale);
        p.alpha -= (0.02 * gameTime.scale);
        graphics.fillStyle(p.color, p.alpha);
        graphics.fillCircle(p.x, p.y, p.size);
        if (p.alpha <= 0) smokeParticles.splice(i, 1);
    }
}

function spawnBrakeSparks() {
    if (Math.random() > gameTime.scale) return;
    for (let i = 0; i < 4; i++) {
        sparkParticles.push({
            x: train.x,
            y: train.y + 12,
            vx: (Math.random() - 0.5) * 6,
            vy: Math.random() * 4,
            life: 1.0
        });
    }
}

function updateSparks() {
    for (let i = sparkParticles.length - 1; i >= 0; i--) {
        let p = sparkParticles[i];
        p.x += (p.vx * gameTime.scale);
        p.y += (p.vy * gameTime.scale);
        p.life -= (0.05 * gameTime.scale);
        graphics.fillStyle(0xffaa00, p.life);
        graphics.fillCircle(p.x, p.y, 4 * p.life);
        if (p.life <= 0) sparkParticles.splice(i, 1);
    }
}

function createExplosion(x, y) {
    for (let i = 0; i < 30; i++) {
        explosionParticles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12,
            life: 1.0,
            size: Math.random() * 15 + 5,
            color: Math.random() > 0.5 ? 0xff4400 : 0x555555
        });
    }
}

function updateExplosions() {
    for (let i = explosionParticles.length - 1; i >= 0; i--) {
        let p = explosionParticles[i];
        p.x += (p.vx * gameTime.scale);
        p.y += (p.vy * gameTime.scale);
        p.life -= (0.03 * gameTime.scale);
        graphics.fillStyle(p.color, p.life);
        graphics.fillCircle(p.x, p.y, p.size * p.life);
        if (p.life <= 0) explosionParticles.splice(i, 1);
    }
}

function drawRails() {
    graphics.clear();
    graphics.lineStyle(2, 0x555555, 0.4);

    if (phase === 1) {
        drawRailSegment(-500, 200, 1500, 200);
        drawRailSegment(-500, 400, 1500, 400);
    } else {
        drawRailSegment(-500, 150, 1500, 150);
        drawRailSegment(-500, 300, 1500, 300);
        drawRailSegment(-500, 450, 1500, 450);
    }

    drawRailSegment(-50, 300, 300, 300);

    if (phase === 1) {
        drawRailBranch(p1Top);
        drawRailBranch(p1Bot);
        highlightRail((switchState === 0 ? p1Top : p1Bot), 0x00ccff);
        if (correctPathIndex === 0) drawWarning(p1Bot);
        else drawWarning(p1Top);
    } else {
        drawRailBranch(p2Top);
        drawRailBranch(p2Mid);
        drawRailBranch(p2Bot);
        highlightRail((switchState === 0 ? p2Top : (switchState === 1 ? p2Mid : p2Bot)), 0x00ccff);
        if (correctPathIndex !== 0) drawWarning(p2Top);
        if (correctPathIndex !== 1) drawWarning(p2Mid);
        if (correctPathIndex !== 2) drawWarning(p2Bot);
    }
}

function drawRailSegment(x1, y1, x2, y2) {
    drawRailLine(x1, y1, x2, y2);
    drawSleepers(x1, y1, x2, y2);
}

function drawRailBranch(path) {
    for (let i = 1; i < path.length - 1; i++) {
        drawRailSegment(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y);
    }
}

function drawRailLine(x1, y1, x2, y2) {
    let dx = x2 - x1, dy = y2 - y1;
    let len = Math.sqrt(dx * dx + dy * dy);
    let nx = -dy / len * 4, ny = dx / len * 4;

    graphics.lineStyle(4, 0x444444);
    graphics.beginPath();
    graphics.moveTo(x1 + nx, y1 + ny);
    graphics.lineTo(x2 + nx, y2 + ny);
    graphics.strokePath();

    graphics.beginPath();
    graphics.moveTo(x1 - nx, y1 - ny);
    graphics.lineTo(x2 - nx, y2 - ny);
    graphics.strokePath();

    graphics.lineStyle(1.5, 0xaaaaaa, 0.5);
    graphics.beginPath();
    graphics.moveTo(x1 + nx, y1 + ny - 1);
    graphics.lineTo(x2 + nx, y2 + ny - 1);
    graphics.strokePath();

    graphics.beginPath();
    graphics.moveTo(x1 - nx, y1 - ny - 1);
    graphics.lineTo(x2 - nx, y2 - ny - 1);
    graphics.strokePath();
}

function drawSleepers(x1, y1, x2, y2) {
    let dx = x2 - x1, dy = y2 - y1;
    let len = Math.sqrt(dx * dx + dy * dy);
    let steps = Math.floor(len / 40);

    graphics.lineStyle(2, 0x3a2e2e, 0.9);
    graphics.beginPath();

    for (let i = 0; i < steps; i++) {
        let t = i / steps;
        let x = x1 + dx * t;
        let y = y1 + dy * t;
        let nx = -dy / len * 6, ny = dx / len * 6;
        graphics.moveTo(x - nx, y - ny);
        graphics.lineTo(x + nx, y + ny);
    }

    graphics.strokePath();
}

function highlightRail(path, color) {
    graphics.lineStyle(6, color, 0.4);
    graphics.beginPath();

    for (let i = 1; i < path.length - 1; i++) {
        graphics.moveTo(path[i].x, path[i].y);
        graphics.lineTo(path[i + 1].x, path[i + 1].y);
    }

    graphics.strokePath();
}

function drawWarning(path) {
    let p = path[2];
    graphics.fillStyle(0x3a2e2e);
    graphics.fillRect(p.x - 3, p.y + 10, 6, 25);
    graphics.fillStyle(0x000000, 0.5);
    graphics.fillRect(p.x + 3, p.y + 13, 6, 25);

    graphics.fillStyle(0x000000, 0.5);
    graphics.beginPath();
    graphics.moveTo(p.x + 3, p.y - 22);
    graphics.lineTo(p.x + 25, p.y - 0);
    graphics.lineTo(p.x + 3, p.y + 22);
    graphics.lineTo(p.x - 19, p.y - 0);
    graphics.closePath();
    graphics.fillPath();

    graphics.fillStyle(0xcc0000);
    graphics.lineStyle(3, 0xffffff);
    graphics.beginPath();
    graphics.moveTo(p.x, p.y - 25);
    graphics.lineTo(p.x + 22, p.y - 3);
    graphics.lineTo(p.x, p.y + 19);
    graphics.lineTo(p.x - 22, p.y - 3);
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();

    graphics.lineStyle(4, 0xffffff);
    graphics.beginPath();
    graphics.moveTo(p.x - 8, p.y - 11);
    graphics.lineTo(p.x + 8, p.y + 5);
    graphics.moveTo(p.x - 8, p.y + 5);
    graphics.lineTo(p.x + 8, p.y - 11);
    graphics.strokePath();
}

function resetTrain(isFullReset = false) {
    train.x = -50;
    train.y = 300;
    train.rotation = 0;
    currentAngle = 0;
    pathIndex = 0;
    perfectUsed = false;

    if (isFullReset) {
        if (activeTrain === 'armored') {
            shieldDurability = 2;
        } else {
            shieldDurability = 0;
        }
        hasShield = false;
        currentSkyPhase = 1;
        if (gameScene.overlaySunset) gameScene.overlaySunset.setAlpha(0);
        if (gameScene.overlayNight) gameScene.overlayNight.setAlpha(0);
        if (headlight) {
            headlight.setVisible(false);
            headlineCore.setVisible(false);
            farGlow.setVisible(false);
        }
    }

    applyTrainVisuals();

    if (phase === 1) {
        switchState = 0;
        switchHandle.y = 280;
        currentPath = p1Top;
    } else {
        switchState = 1;
        switchHandle.y = 300;
        currentPath = p2Mid;
    }

    lockedChoice = null;
    spawnObstacle();
}

function startGame() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("pauseBtn").classList.remove("hidden");
    gameStarted = true;
    resetTrain(true);
    setNewCorrectPath();
}

function triggerGameOver() {
    if (isGameOver) return;
    isGameOver = true;
    playSound('crash');
    document.getElementById("pauseBtn").classList.add("hidden");

    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    gameScene.cameras.main.shake(400, 0.02);

    let earnedCoins = Math.floor(score * 10);
    totalCoins += earnedCoins;
    saveMarketData();

    setTimeout(() => {
        document.getElementById("gameOverScreen").classList.remove("hidden");
        document.getElementById("finalScoreDisplay").innerText = "Skor: " + score;

        let coinDisplay = document.getElementById("earnedCoinDisplay");
        if (coinDisplay) coinDisplay.innerText = "+" + earnedCoins + " 💰";

        if (score > 0) {
            document.getElementById("scoreInputArea").classList.remove("hidden");
            document.getElementById("justRestartBtn").classList.add("hidden");
            document.getElementById("playerNameInput").value = "";
            setTimeout(() => {
                document.getElementById("playerNameInput").focus();
            }, 100);
        } else {
            document.getElementById("scoreInputArea").classList.add("hidden");
            document.getElementById("justRestartBtn").classList.remove("hidden");
        }
    }, 400);
}

function returnToMenu() {
    document.getElementById("gameOverScreen").classList.add("hidden");
    document.getElementById("pauseScreen").classList.add("hidden");
    document.getElementById("startScreen").classList.remove("hidden");
    document.getElementById("pauseBtn").classList.add("hidden");

    let mC = document.getElementById("menuCoinDisplay");
    if (mC) mC.innerText = totalCoins;

    gameStarted = false;
    isGameOver = false;
    isPaused = false;
    score = 0;
    phase = 1;
    speed = baseSpeed;
    brakeHeat = 0;
    isBraking = false;
    brakeCooldown = false;
    chillTimer = 0;
    gameTime.scale = 1.0;

    brakeBtnObj.fillColor = 0xcc0000;
    brakeBtnText.setText("FREN");
    scoreText.setText("Skor: 0");
    scoreText.setColor("#ffaa00");
    phaseText.setVisible(false);
    itemGraphic.setVisible(false);
    itemType = 0;
    vagonText.setVisible(false);

    if (gameScene && gameScene.tweens) {
        gameScene.tweens.killAll();
    }

    obstacles.clear(true, true);
    trainWagons.forEach(w => w.destroy());
    trainWagons = [];
    posHistory = [];
    resetTrain(true);
    setNewCorrectPath();

    if (game.scene.isPaused('PlayScene')) {
        game.scene.resume('PlayScene');
    }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: "#87CEEB",
    parent: 'gameWrapper',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1000,
        height: 600
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: {
        key: 'PlayScene',
        create: create,
        update: update
    },
    fps: {
        target: 60,
        forceSetTimeOut: true
    }
};

let game;

function initPhaserGame() {
    if (!game) {
        game = new Phaser.Game(config);
    }
}