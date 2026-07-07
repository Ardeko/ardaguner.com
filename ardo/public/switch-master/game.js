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
let minHighScore = 0;
let totalScoreCount = 0;

function loadScores() {
    const scoreListGameOver = document.getElementById("scoreList");
    const scoreListMain = document.getElementById("mainScoreList");

    if (scoreListGameOver) scoreListGameOver.innerHTML = "Yükleniyor...";
    if (scoreListMain) scoreListMain.innerHTML = "<div class='loading-pulse'>Veriler Çekiliyor...</div>";

    fetch(FIREBASE_URL).then(res => res.json()).then(data => {
        if (!data) {
            if (scoreListGameOver) scoreListGameOver.innerHTML = "Henüz skor yok!";
            if (scoreListMain) scoreListMain.innerHTML = "<div class='empty-state'>Henüz skor yok!</div>";
            minHighScore = 0;
            totalScoreCount = 0;
            return;
        }

        let allScores = Object.values(data).sort((a, b) => b.score - a.score);
        totalScoreCount = allScores.length;

        if (allScores.length >= 5) {
            minHighScore = allScores[4].score;
        } else {
            minHighScore = 0;
        }

        let scoresArray = allScores.slice(0, 5);
        let listHTML = "";
        let mainListHTML = "";

        scoresArray.forEach((entry, index) => {
            listHTML += `<li><b>${entry.name}</b>: ${entry.score}</li>`;

            let delay = index * 0.1;
            let rankClass = index === 0 ? 'rank-first' : index === 1 ? 'rank-second' : index === 2 ? 'rank-third' : '';
            
            mainListHTML += `
            <li class="score-item ${rankClass}" style="animation-delay: ${delay}s">
                <div class="score-rank">#${index + 1}</div>
                <div class="score-name">${entry.name}</div>
                <div class="score-value">${entry.score}</div>
            </li>`;
        });

        if (scoreListGameOver) scoreListGameOver.innerHTML = listHTML;
        if (scoreListMain) scoreListMain.innerHTML = mainListHTML;
    }).catch(err => console.error(err));
}

window.openHighScores = function() {
    if (navigator.vibrate) {
        navigator.vibrate(40);
    }
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("highScoreScreen").classList.remove("hidden");
    loadScores();
};

window.closeHighScores = function() {
    if (navigator.vibrate) {
        navigator.vibrate(25);
    }
    document.getElementById("highScoreScreen").classList.add("hidden");
    document.getElementById("startScreen").classList.remove("hidden");
};

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
let globalVolume = parseFloat(localStorage.getItem('sm_volume'));
if (isNaN(globalVolume)) globalVolume = 1.0;

window.openSettings = function() {
    if (navigator.vibrate) navigator.vibrate(25);
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("settingsScreen").classList.remove("hidden");
    document.getElementById("volumeSlider").value = globalVolume;
};

window.closeSettings = function() {
    if (navigator.vibrate) navigator.vibrate(25);
    document.getElementById("settingsScreen").classList.add("hidden");
    document.getElementById("startScreen").classList.remove("hidden");
};

window.changeVolume = function(val) {
    globalVolume = parseFloat(val);
    localStorage.setItem('sm_volume', globalVolume);
    if (game && game.sound) {
        game.sound.volume = globalVolume;
    }
};
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

window.switchMarketTab = function(tabId) {
    document.getElementById("tab-trains").classList.add("hidden");
    document.getElementById("tab-upgrades").classList.add("hidden");
    document.getElementById("btn-tab-trains").classList.remove("active-tab");
    document.getElementById("btn-tab-upgrades").classList.remove("active-tab");

    document.getElementById("tab-" + tabId).classList.remove("hidden");
    document.getElementById("btn-tab-" + tabId).classList.add("active-tab");
};

window.openInfo = function() {
    document.getElementById("infoScreen").classList.remove("hidden");
};

window.closeInfo = function() {
    document.getElementById("infoScreen").classList.add("hidden");
};

window.openStoryMenu = function() {
    if (navigator.vibrate) {
        navigator.vibrate(40);
    }
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("storyMenuScreen").classList.remove("hidden");
};

window.closeStoryMenu = function() {
    if (navigator.vibrate) {
        navigator.vibrate(25);
    }
    document.getElementById("storyMenuScreen").classList.add("hidden");
    document.getElementById("startScreen").classList.remove("hidden");
};

window.buyNitro = function() {
    if (totalCoins >= 800 && !trainUpgrades['nitro_system']) {
        totalCoins -= 800;
        trainUpgrades['nitro_system'] = true;
        saveMarketData();
        updateMarketUI();
        return true;
    }
    return false;
};

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
    setBtnState("#tab-trains .item-card:nth-child(1) button", activeTrain === 'classic', true, "");

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

    let upNit = document.querySelector("#upgrade-nitro button");
    if (upNit) {
        if (trainUpgrades['nitro_system']) {
            upNit.innerText = "AKTİF";
            upNit.disabled = true;
            upNit.style.background = "transparent";
            upNit.style.color = "#888";
            upNit.style.border = "1px solid #555";
        } else {
            upNit.innerText = "800 💰";
            upNit.disabled = false;
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
    if (gameScene && gameScene.playerTrainSnd) gameScene.playerTrainSnd.pause(); 
    document.getElementById("pauseScreen").classList.remove("hidden");
    document.getElementById("pauseBtn").classList.add("hidden");
}

function resumeGame(e) {
    if (e) e.stopPropagation();
    if (!isPaused) return;
    isPaused = false;
    game.scene.resume('PlayScene');
    if (gameScene && gameScene.playerTrainSnd) gameScene.playerTrainSnd.resume(); 
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
let trainShieldCircle, backgroundGroup, bulldozerAura, midgroundGroup; 
let farMountains, midTrees, solidGround;
let brakeBtnObj, brakeBtnText, brakeBarBg, brakeBarFill;
let isBraking = false, brakeHeat = 0, brakeCooldown = false, chillTimer = 0;
let nitroBtnObj, nitroBtnText, nitroBarBg, nitroBarFill;
let isNitro = false, nitroHeat = 0, nitroCooldown = false;
let gameTime = { scale: 1.0 };
let phase = 1, currentPath, pathIndex = 0;
let baseSpeed = 2.5, speed = baseSpeed, maxSpeed = 12;
let switchState = 0, correctPathIndex = 0, lockedChoice = null;
let score = 0, isGameOver = false, gameStarted = false, hasShield = false;
let bulldozerTimer = 0;
let pulse = 0, currentAngle = 0;
let smokeParticles = [], sparkParticles = [], explosionParticles = [], nitroParticles = [];
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
    if (typeof globalVolume !== 'undefined') {
        gameScene.sound.volume = globalVolume;
    }
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
    bulldozerAura = this.add.graphics();
    bulldozerAura.lineStyle(4, 0xffaa00, 1);
    bulldozerAura.fillStyle(0xff4400, 0.5);
    bulldozerAura.beginPath();
    for (let i = 0; i < 24; i++) {
        let radius = i % 2 === 0 ? 55 : 35;
        let angle = (i / 24) * Math.PI * 2;
        if (i === 0) bulldozerAura.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        else bulldozerAura.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    bulldozerAura.closePath();
    bulldozerAura.fillPath();
    bulldozerAura.strokePath();
    bulldozerAura.setVisible(false);
    train.add([farGlow, headlineCore, headlight, trainShieldCircle, bulldozerAura]);
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
    
    brakeBarBg = this.add.rectangle(900, 490, 120, 15, 0x222222).setOrigin(0.5).setStrokeStyle(2, 0xffffff).setDepth(100);
    brakeBarFill = this.add.rectangle(840, 490, 0, 15, 0xffeb3b).setOrigin(0, 0.5).setDepth(100);

    nitroBarBg = this.add.rectangle(100, 490, 120, 15, 0x222222).setOrigin(0.5).setStrokeStyle(2, 0xffffff).setDepth(100);
    nitroBarFill = this.add.rectangle(40, 490, 0, 15, 0x00ccff).setOrigin(0, 0.5).setDepth(100);
    nitroBarBg.setVisible(false);
    nitroBarFill.setVisible(false);

    let btnGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    btnGraphics.fillStyle(0x1a1a1a, 0.8);
    btnGraphics.fillRoundedRect(0, 0, 140, 60, 30);
    btnGraphics.lineStyle(2, 0xff3333, 0.9);
    btnGraphics.strokeRoundedRect(0, 0, 140, 60, 30);
    btnGraphics.generateTexture('btnIdle', 140, 60);

    btnGraphics.clear();
    btnGraphics.fillStyle(0xcc0000, 0.9);
    btnGraphics.fillRoundedRect(0, 0, 140, 60, 30);
    btnGraphics.generateTexture('btnDown', 140, 60);

    btnGraphics.clear();
    btnGraphics.fillStyle(0x2a2a2a, 0.8);
    btnGraphics.fillRoundedRect(0, 0, 140, 60, 30);
    btnGraphics.lineStyle(2, 0x555555, 0.8);
    btnGraphics.strokeRoundedRect(0, 0, 140, 60, 30);
    btnGraphics.generateTexture('btnCooldown', 140, 60);

    btnGraphics.clear();
    btnGraphics.fillStyle(0x1a1a1a, 0.8);
    btnGraphics.fillRoundedRect(0, 0, 140, 60, 30);
    btnGraphics.lineStyle(2, 0x00ccff, 0.9);
    btnGraphics.strokeRoundedRect(0, 0, 140, 60, 30);
    btnGraphics.generateTexture('btnNitroIdle', 140, 60);

    btnGraphics.clear();
    btnGraphics.fillStyle(0x0066cc, 0.9);
    btnGraphics.fillRoundedRect(0, 0, 140, 60, 30);
    btnGraphics.generateTexture('btnNitroDown', 140, 60);

    btnGraphics.clear();
    btnGraphics.fillStyle(0x2a2a2a, 0.8);
    btnGraphics.fillRoundedRect(0, 0, 140, 60, 30);
    btnGraphics.lineStyle(2, 0x555555, 0.8);
    btnGraphics.strokeRoundedRect(0, 0, 140, 60, 30);
    btnGraphics.generateTexture('btnNitroCooldown', 140, 60);

    brakeBtnObj = this.add.image(900, 540, 'btnIdle').setInteractive().setDepth(100);
    brakeBtnText = this.add.text(900, 540, "FREN", { 
    fontFamily: 'system-ui, -apple-system, sans-serif', 
    fontSize: '20px', fontStyle: 'bold', color: '#ff3333', letterSpacing: 2 
    }).setOrigin(0.5).setDepth(100);

    nitroBtnObj = this.add.image(100, 540, 'btnNitroIdle').setInteractive().setDepth(100);
    nitroBtnText = this.add.text(100, 540, "NİTRO", { 
        fontFamily: 'system-ui, -apple-system, sans-serif', 
        fontSize: '20px', fontStyle: 'bold', color: '#00ccff', letterSpacing: 2 
    }).setOrigin(0.5).setDepth(100);
    nitroBtnObj.setVisible(false);
    nitroBtnText.setVisible(false);

    this.input.addPointer(3);

    brakeBtnObj.on('pointerdown', (pointer) => {
        if (!brakeCooldown && gameStarted && !isGameOver && !isPaused) {
            isBraking = true;
            brakeBtnObj.setTexture('btnDown');
            brakeBtnText.setColor('#ffffff');
            brakeBtnObj.setScale(0.92);
            brakeBtnText.setScale(0.92);
        }
    });

    const stopBraking = () => {
        isBraking = false;
        brakeBtnObj.setScale(1);
        brakeBtnText.setScale(1);
        if (!brakeCooldown) {
            brakeBtnObj.setTexture('btnIdle');
            brakeBtnText.setColor('#ff3333');
        }
    };

    brakeBtnObj.on('pointerup', stopBraking);
    brakeBtnObj.on('pointerout', stopBraking);

    nitroBtnObj.on('pointerdown', (pointer) => {
        if (!nitroCooldown && gameStarted && !isGameOver && !isPaused && trainUpgrades['nitro_system']) {
            isNitro = true;
            nitroBtnObj.setTexture('btnNitroDown');
            nitroBtnText.setColor('#ffffff');
            nitroBtnObj.setScale(0.92);
            nitroBtnText.setScale(0.92);
        }
    });

    const stopNitro = () => {
        isNitro = false;
        nitroBtnObj.setScale(1);
        nitroBtnText.setScale(1);
        if (!nitroCooldown) {
            nitroBtnObj.setTexture('btnNitroIdle');
            nitroBtnText.setColor('#00ccff');
        }
    };

    nitroBtnObj.on('pointerup', stopNitro);
    nitroBtnObj.on('pointerout', stopNitro);

    this.input.keyboard.on('keydown-SPACE', () => {
        if (!brakeCooldown && gameStarted && !isGameOver && !isPaused) {
            isBraking = true;
            brakeBtnObj.setTexture('btnDown');
            brakeBtnText.setColor('#ffffff');
            brakeBtnObj.setScale(0.92);
            brakeBtnText.setScale(0.92);
        }
    });

    this.input.keyboard.on('keyup-SPACE', stopBraking);

    this.input.keyboard.on('keydown-SHIFT', () => {
        if (!nitroCooldown && gameStarted && !isGameOver && !isPaused && trainUpgrades['nitro_system']) {
            isNitro = true;
            nitroBtnObj.setTexture('btnNitroDown');
            nitroBtnText.setColor('#ffffff');
            nitroBtnObj.setScale(0.92);
            nitroBtnText.setScale(0.92);
        }
    });

    this.input.keyboard.on('keyup-SHIFT', stopNitro);

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
    if (obs.sound) obs.sound.stop();
    if (bulldozerTimer > 0) {
        playSound('explosion');
        if (navigator.vibrate) navigator.vibrate(50);
        showFloatingText(obs.x, obs.y - 40, "PARÇALANDI! +5", "#ff4400");
        createExplosion(obs.x, obs.y);
        obs.destroy();
        score += 5;
        if (scoreText) scoreText.setText("Skor: " + score);
        gameScene.cameras.main.shake(100, 0.01);
        return;
    }
    
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

function spawnNitroFlames() {
    for (let i = 0; i < 4; i++) {
        nitroParticles.push({
            x: train.x - 28,
            y: train.y + Phaser.Math.Between(-8, 8),
            vx: -Phaser.Math.FloatBetween(5, 12),
            vy: Phaser.Math.FloatBetween(-2, 2),
            alpha: 1.0,
            size: Phaser.Math.Between(8, 14),
            color: Math.random() > 0.25 ? 0x00ccff : 0x0044ff
        });
    }
}

function updateNitroFlames() {
    for (let i = nitroParticles.length - 1; i >= 0; i--) {
        let p = nitroParticles[i];
        p.x += p.vx * gameTime.scale;
        p.y += p.vy * gameTime.scale;
        p.alpha -= 0.05 * gameTime.scale;
        p.size -= 0.25 * gameTime.scale;
        graphics.fillStyle(p.color, p.alpha);
        graphics.fillCircle(p.x, p.y, Math.max(0.1, p.size));
        if (p.alpha <= 0 || p.size <= 0) {
            nitroParticles.splice(i, 1);
        }
    }
}

function update() {
    if (!gameStarted || isGameOver || isPaused) return;
    

    if (gameScene && gameScene.playerTrainSnd && gameScene.playerTrainSnd.isPlaying) {
        let pitchRate = 0.6 + (speed / maxSpeed) * 0.8; 
        gameScene.playerTrainSnd.setRate(pitchRate);
    }


    farMountains.tilePositionX += 0.1 * (speed / baseSpeed) * gameTime.scale;
    midTrees.tilePositionX += 0.5 * (speed / baseSpeed) * gameTime.scale;
    pulse += 0.05 * gameTime.scale;
    if (score >= 10 && score < 20 && currentSkyPhase === 1) {
        currentSkyPhase = 2;
        document.body.style.backgroundColor = '#fc7b03';
        gameScene.tweens.add({
            targets: gameScene.overlaySunset,
            alpha: 1,
            duration: 3000
        });
    } else if (score >= 20 && currentSkyPhase === 2) {
        currentSkyPhase = 3;
        document.body.style.backgroundColor = '#111122';
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
    if (bulldozerTimer > 0) {
        bulldozerTimer -= gameTime.scale;
        bulldozerAura.rotation += 0.3 * gameTime.scale;
        bulldozerAura.setScale(1 + Math.sin(pulse * 25) * 0.1);
        bulldozerAura.setAlpha(0.6 + Math.sin(pulse * 30) * 0.4);

        if (bulldozerTimer <= 0) {
            bulldozerTimer = 0;
            bulldozerAura.setVisible(false); 
        }
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
            brakeBtnObj.setTexture('btnCooldown');
            brakeBtnObj.setScale(1);
            brakeBtnText.setScale(1);
            brakeBtnText.setText("AŞIRI ISI");
            brakeBtnText.setColor('#888888');
            playSound('shield_break');
        }
    } else if (isNitro && trainUpgrades['nitro_system']) {
        let tSpeed = baseSpeed + (score * 0.2) + 6.0;
        if (activeTrain === 'speedster') tSpeed += 2;
        speed = Math.min(maxSpeed + 4, tSpeed);
        nitroHeat += (2.2 * gameTime.scale);
        spawnNitroFlames();
        if (nitroHeat >= 100) {
            nitroHeat = 100;
            isNitro = false;
            nitroCooldown = true;
            nitroBtnObj.setTexture('btnNitroCooldown');
            nitroBtnObj.setScale(1);
            nitroBtnText.setScale(1);
            nitroBtnText.setText("AŞIRI ISI");
            nitroBtnText.setColor('#888888');
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
                brakeBtnObj.setTexture('btnIdle');
                brakeBtnText.setText("FREN");
                brakeBtnText.setColor('#ff3333');
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
                brakeBtnObj.setTexture('btnIdle');
                brakeBtnText.setText("FREN");
                brakeBtnText.setColor('#ff3333');
            }
        }
    }

    if (!isNitro && nitroHeat > 0) {
        nitroHeat -= (1.2 * gameTime.scale);
        if (nitroHeat <= 0) {
            nitroHeat = 0;
            nitroCooldown = false;
            nitroBtnObj.setTexture('btnNitroIdle');
            nitroBtnText.setText("NİTRO");
            nitroBtnText.setColor('#00ccff');
        }
    }

    brakeBarFill.width = (brakeHeat / 100) * 120;
    if (brakeHeat > 80) brakeBarFill.fillColor = 0xff0000;
    else if (brakeHeat > 50) brakeBarFill.fillColor = 0xffa500;
    else brakeBarFill.fillColor = 0xffeb3b;

    if (trainUpgrades['nitro_system'] && nitroBarFill) {
        nitroBarFill.width = (nitroHeat / 100) * 120;
        if (nitroHeat > 80) nitroBarFill.fillColor = 0xff0055;
        else if (nitroHeat > 50) nitroBarFill.fillColor = 0x0066ff;
        else nitroBarFill.fillColor = 0x00ccff;
    }

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
                brakeBtnObj.setTexture('btnIdle');
                brakeBtnText.setText("FREN");
                brakeBtnText.setColor('#ff3333');
                playSound('ice');
                gameScene.cameras.main.flash(300, 0, 255, 255);
            } else if (itemType === 3) {
                showFloatingText(train.x, train.y - 40, "KALKAN! 🛡️", "#00ff88");
                hasShield = true;
                playSound('shield');
            } else if (itemType === 4) {
                showFloatingText(train.x, train.y - 40, "BULDOZER! PARÇALA +5", "#ff4400");
                bulldozerTimer = 480; 
                bulldozerAura.setVisible(true); 
                playSound('explosion');
                gameScene.cameras.main.shake(300, 0.02);
            }
            itemType = 0;
        }
    }
    drawRails();
    updateSmoke();
    updateSparks();
    updateExplosions();
    updateNitroFlames();
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
                    if (r < 0.30) {
                        itemType = 1;
                        cBody.fillColor = 0xffd700;
                        cOutline.fillColor = 0xb8860b;
                        cIcon.setText("💰");
                        cIcon.setColor("#000");
                    } else if (r < 0.40) {
                        itemType = 2;
                        cBody.fillColor = 0x00bfff;
                        cOutline.fillColor = 0x0000ff;
                        cIcon.setText("❄️");
                        cIcon.setColor("#fff");
                    } else if (r < 0.70) {
                        itemType = 3;
                        cBody.fillColor = 0x32cd32;
                        cOutline.fillColor = 0x008000;
                        cIcon.setText("🛡️");
                        cIcon.setColor("#fff");
                    } else {
                        itemType = 4;
                        cBody.fillColor = 0xff4400;
                        cOutline.fillColor = 0xcc0000;
                        cIcon.setText("💥");
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
        if (obs.x < -100) {
            if (obs.sound) obs.sound.stop(); 
            obs.destroy();
        }
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
        

        if (gameScene && gameScene.sound) {
            let obsSnd = gameScene.sound.add('snd_rogue', { loop: true, volume: 0.4 });
            obsSnd.play();
            obsContainer.sound = obsSnd;
        }


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

function triggerConfetti() {
    for (let i = 0; i < 60; i++) {
        let confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = ['#00ff88', '#00ccff', '#ff0055', '#ffaa00', '#ffff00'][Math.floor(Math.random() * 5)];
        confetti.style.transform = 'scale(' + (Math.random() * 0.8 + 0.2) + ')';
        confetti.style.animationDelay = Math.random() * 1.5 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 4500);
    }
}

function resetTrain(isFullReset = false) {
    train.x = -50;
    train.y = 300;
    train.rotation = 0;
    currentAngle = 0;
    pathIndex = 0;
    perfectUsed = false;

    if (isFullReset) {
        document.body.style.backgroundColor = "#87CEEB";
        if (gameScene) gameScene.cameras.main.setBackgroundColor('#87CEEB');

        if (activeTrain === 'armored') {
            shieldDurability = 2;
        } else {
            shieldDurability = 0;
        }
        hasShield = false;
        bulldozerTimer = 0;
        if (bulldozerAura) bulldozerAura.setVisible(false); 
        
        currentSkyPhase = 1;
        if (gameScene.overlaySunset) gameScene.overlaySunset.setAlpha(0);
        if (gameScene.overlayNight) gameScene.overlayNight.setAlpha(0);
        if (headlight) {
            headlight.setVisible(false);
            headlineCore.setVisible(false);
            farGlow.setVisible(false);
        }
    }

    let hasNitro = !!trainUpgrades['nitro_system'];
    if (nitroBtnObj) nitroBtnObj.setVisible(hasNitro);
    if (nitroBtnText) nitroBtnText.setVisible(hasNitro);
    if (nitroBarBg) nitroBarBg.setVisible(hasNitro);
    if (nitroBarFill) nitroBarFill.setVisible(hasNitro);

    isNitro = false;
    nitroHeat = 0;
    nitroCooldown = false;
    if (nitroBtnObj && !nitroCooldown) {
        nitroBtnObj.setTexture('btnNitroIdle');
        nitroBtnText.setText("NİTRO");
        nitroBtnText.setColor('#00ccff');
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

function manageTrainSounds() {
    if (!gameScene || !gameScene.sound) return;
    if (gameScene.playerTrainSnd) gameScene.playerTrainSnd.stop();

    let sndKey = (activeTrain === 'speedster') ? 'snd_speedster' : 'snd_classic';
    gameScene.playerTrainSnd = gameScene.sound.add(sndKey, { loop: true, volume: 0.3 });
    gameScene.playerTrainSnd.play();
}

function startEndlessMode() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("pauseBtn").classList.remove("hidden");
    gameStarted = true;
    resetTrain(true);
    setNewCorrectPath();
    manageTrainSounds(); 
}

function triggerGameOver() {
    if (isGameOver) return;
    isGameOver = true;
    if (gameScene && gameScene.playerTrainSnd) gameScene.playerTrainSnd.stop();
    obstacles.getChildren().forEach(obs => { if (obs.sound) obs.sound.stop(); });
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

        let isTop5 = (score > minHighScore) || (totalScoreCount < 5);

        if (score > 0 && isTop5) {
            document.getElementById("gameOverTitle").innerText = "YENİ REKOR!";
            document.getElementById("scoreInputArea").classList.remove("hidden");
            document.getElementById("justRestartBtn").classList.add("hidden");
            document.getElementById("playerNameInput").value = "";
            triggerConfetti();
            setTimeout(() => {
                document.getElementById("playerNameInput").focus();
            }, 100);
        } else {
            document.getElementById("gameOverTitle").innerText = "KAZA!";
            document.getElementById("scoreInputArea").classList.add("hidden");
            document.getElementById("justRestartBtn").classList.remove("hidden");
        }
    }, 400);
}

function returnToMenu() {
    document.getElementById("gameOverScreen").classList.add("hidden");
    if (gameScene && gameScene.playerTrainSnd) gameScene.playerTrainSnd.stop();
    obstacles.getChildren().forEach(obs => { if (obs.sound) obs.sound.stop(); });
    document.getElementById("pauseScreen").classList.add("hidden");
    document.getElementById("startScreen").classList.remove("hidden");
    document.getElementById("pauseBtn").classList.add("hidden");
    document.body.style.backgroundColor = "#87CEEB";

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
    isNitro = false;
    nitroHeat = 0;
    nitroCooldown = false;
    chillTimer = 0;
    gameTime.scale = 1.0;

    brakeBtnObj.setTexture('btnIdle');
    brakeBtnText.setText("FREN");
    brakeBtnText.setColor('#ff3333');

    if (nitroBtnObj) {
        nitroBtnObj.setTexture('btnNitroIdle');
        nitroBtnObj.setVisible(false);
    }
    if (nitroBtnText) {
        nitroBtnText.setText("NİTRO");
        nitroBtnText.setColor('#00ccff');
        nitroBtnText.setVisible(false);
    }
    if (nitroBarBg) nitroBarBg.setVisible(false);
    if (nitroBarFill) nitroBarFill.setVisible(false);

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

function preload() {
    this.load.audio('snd_classic', 'classic-sound.wav');
    this.load.audio('snd_speedster', 'yht-sound.wav');
    this.load.audio('snd_rogue', 'rogue-sound.wav');
}

const PlayScene = {
    key: 'PlayScene',
    preload: preload,
    create: create, 
    update: update  
};

const StoryScene = {
    key: 'StoryScene',
    create: function() {
        this.add.text(400, 300, "MACERA MODU - BÖLÜM 1", { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
    },
    update: function() {}
};

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
    scene: [PlayScene, StoryScene], 
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

let menuHeat = 0;
const maxHeat = 100;

window.clickMenuTitle = function() {
    menuHeat = Math.min(maxHeat, menuHeat + 15);
    
    const title = document.getElementById('menuMainTitle');
    if (!title) return;

    const rect = title.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const sparkCount = Math.floor(menuHeat / 4) + 15; 
    for (let i = 0; i < sparkCount; i++) {
        createMenuSpark(centerX, rect.bottom - 5);
    }

    if (menuHeat > 50) {
        createMenuSteam(centerX + (Math.random() - 0.5) * rect.width, rect.top);
        if (navigator.vibrate) navigator.vibrate(25);
    }
}

function createMenuSpark(x, y) {
    const spark = document.createElement('div');
    spark.className = 'menu-spark';
    
    if (menuHeat > 75) {
        spark.classList.add('super-spark');
    }

    spark.style.left = x + 'px';
    spark.style.top = y + 'px';

    const dx = (Math.random() - 0.5) * 380 + 'px'; 
    const dy = (Math.random() - 0.6) * 220 - 60 + 'px'; 
    spark.style.setProperty('--dx', dx);
    spark.style.setProperty('--dy', dy);

    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 800);
}

function createMenuSteam(x, y) {
    const steam = document.createElement('div');
    steam.className = 'menu-steam';
    
    const size = (Math.floor(Math.random() * 16) + 20) + 'px'; 
    steam.style.width = size;
    steam.style.height = size;
    steam.style.left = x + 'px';
    steam.style.top = y + 'px';

    const sdx = (Math.random() - 0.5) * 80 + 'px';
    steam.style.setProperty('--sdx', sdx);

    document.body.appendChild(steam);
    setTimeout(() => steam.remove(), 700);
}

function createAmbientSmoke(x, y, rectWidth) {
    const smoke = document.createElement('div');
    smoke.className = 'menu-smoke-ambient';
    
    const size = (Math.floor(Math.random() * 11) + 15) + 'px';
    smoke.style.width = size;
    smoke.style.height = size;
    
    smoke.style.left = (x + (Math.random() - 0.5) * rectWidth) + 'px';
    smoke.style.top = y + 'px';

    const sdx = (Math.random() - 0.5) * 40 + 'px';
    smoke.style.setProperty('--sdx', sdx);

    document.body.appendChild(smoke);
    setTimeout(() => smoke.remove(), 2200);
}

let ambientTimer = 0;
setInterval(() => {
    const title = document.getElementById('menuMainTitle');
    if (!title) return;

    const rect = title.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;

    ambientTimer += 50;
    if (ambientTimer >= 300) {
        createAmbientSmoke(centerX, rect.top + 5, rect.width);
        ambientTimer = 0;
    }

    if (menuHeat > 0) {
        menuHeat = Math.max(0, menuHeat - 1.2);

        if (menuHeat > 65) {
            title.classList.add('title-overheated');
        } else {
            title.classList.remove('title-overheated');
        }

        title.style.filter = `drop-shadow(0 0 ${menuHeat / 3}px rgba(255, 68, 0, ${menuHeat / 100})) drop-shadow(0 4px 6px rgba(0,0,0,0.7))`;
    } else {
        title.style.filter = `drop-shadow(0 4px 6px rgba(0, 0, 0, 0.7))`;
    }
}, 50);