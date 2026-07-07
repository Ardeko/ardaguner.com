const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Yetersiz para — 3'lü "bıp bıp bıp" pattern (her bip ~75ms, arada ~110ms boşluk)
function playInsufficientFundsBeep() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const startTime = audioCtx.currentTime;
    const beepDur = 0.075;
    const gap = 0.110;
    for (let i = 0; i < 3; i++) {
        const t = startTime + i * (beepDur + gap);
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.connect(g); g.connect(audioCtx.destination);
        osc.type = 'square';
        // İkinci ve üçüncüde frekans biraz düşsün — daha "uyarı" hissi
        osc.frequency.setValueAtTime(i === 0 ? 880 : i === 1 ? 740 : 620, t);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.22, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + beepDur);
        osc.start(t);
        osc.stop(t + beepDur + 0.01);
    }
}

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
<<<<<<< HEAD
            
=======

>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
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

<<<<<<< HEAD
function submitScoreAndReturn() {
=======
window.submitScoreAndReturn = function() {
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
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

window.addEventListener('load', function() {
    let mC = document.getElementById("menuCoinDisplay");
    if (mC) mC.innerText = totalCoins;
    loadScores();
    checkDailyReward();
});

function checkDailyReward() {
    let today = new Date().toDateString();
    let lastLogin = localStorage.getItem('sm_lastLoginDate');

    if (lastLogin !== today) {
        document.getElementById("startScreen").classList.add("hidden");
        document.getElementById("dailyRewardScreen").classList.remove("hidden");
    }
}

window.claimDailyReward = function() {
    if (navigator.vibrate) navigator.vibrate(50);

    let today = new Date().toDateString();
    localStorage.setItem('sm_lastLoginDate', today);

    totalCoins += 100;
    saveMarketData();

    let mC = document.getElementById("menuCoinDisplay");
    if (mC) mC.innerText = totalCoins;

    triggerConfetti();
    document.getElementById("dailyRewardScreen").classList.add("hidden");
    document.getElementById("startScreen").classList.remove("hidden");
};

function saveMarketData() {
    localStorage.setItem('sm_totalCoins', totalCoins);
    localStorage.setItem('sm_ownedTrains', JSON.stringify(ownedTrains));
    localStorage.setItem('sm_activeTrain', activeTrain);
    localStorage.setItem('sm_trainUpgrades', JSON.stringify(trainUpgrades));
}

// ── 3D KARUSEL CONTROLLER ─────────────────────────────────
// Tüm market sekmelerini sanal bir çemberin etrafında dizer.
// Sürükle/yön tuşları/noktalar ile aktif kart değişir.
const Carousel = {
    instances: {},

    init(key) {
        const tab = document.getElementById('tab-' + key);
        if (!tab) return;
        const rotor = tab.querySelector('.carousel-rotor');
        if (!rotor) return;

        // Kartları topla (yalnızca direkt çocuklar)
        const cards = Array.from(rotor.children).filter(c => c.classList.contains('item-card'));
        if (!cards.length) return;

        const total = cards.length;
        const step = 360 / total;

        // Yarıçap kart genişliğinden orantılı hesaplanır → ekran küçüldükçe
        // kartlar da küçülür, dağılım her zaman düzgün kalır.
        // Kart sayısı arttıkça komşuların üst üste binmemesi için faktör de artar.
        const cardW = rotor.offsetWidth || 160;
        const factor = total <= 3 ? 1.05 : total <= 4 ? 1.25 : total <= 5 ? 1.45 : 1.65;
        const radius = Math.round(cardW * factor);

        // Her kartı çemberin etrafına yerleştir
        cards.forEach((c, i) => {
            c.style.setProperty('--card-angle', `${i * step}deg`);
            c.style.setProperty('--carousel-radius', `${radius}px`);
        });

        // Noktaları oluştur
        const dotsContainer = tab.querySelector('.carousel-dots');
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            for (let i = 0; i < total; i++) {
                const d = document.createElement('button');
                d.className = 'carousel-dot';
                d.dataset.index = i;
                d.addEventListener('click', () => Carousel.setIndex(key, i));
                dotsContainer.appendChild(d);
            }
        }

        // Yön ok düğmeleri
        tab.querySelectorAll('.carousel-arrow').forEach(a => {
            const dir = a.dataset.dir;
            a.onclick = () => {
                const inst = Carousel.instances[key];
                if (!inst) return;
                Carousel.setIndex(key, inst.index + (dir === 'next' ? 1 : -1));
            };
        });

        // Yan kartlara tıklayınca o karta odaklan
        cards.forEach((c, i) => {
            c.addEventListener('click', (e) => {
                const inst = Carousel.instances[key];
                if (!inst) return;
                if (inst.hasMoved) { e.stopPropagation(); e.preventDefault(); return; }
                if (i !== inst.index) {
                    e.stopPropagation();
                    Carousel.setIndex(key, i);
                }
            }, true);
        });

        // Önceki instance varsa (resize/re-init senaryosu) index'i koru
        const prevIndex = (this.instances[key] && this.instances[key].index) || 0;

        // Instance
        const instance = {
            tab, rotor, cards, total, step, dotsContainer,
            index: 0, isDragging: false, startX: 0, startAngle: 0, hasMoved: false
        };
        this.instances[key] = instance;

        // Sürükleme dinleyicileri (önceki varsa eklemeyelim — re-init durumu için)
        if (!rotor.dataset.carouselBound) {
            rotor.dataset.carouselBound = '1';
            rotor.addEventListener('pointerdown',   e => this.onDown(key, e), { passive: false });
            rotor.addEventListener('pointermove',   e => this.onMove(key, e), { passive: false });
            rotor.addEventListener('pointerup',     e => this.onUp(key, e));
            rotor.addEventListener('pointercancel', e => this.onUp(key, e));
            // pointerleave KALDIRILDI — setPointerCapture varken zaten gereksiz,
            // ve mobilde parmağın hafif kayması rotor sınırına çıkınca drag'i iptal ediyordu.
        }

        this.setIndex(key, prevIndex, true);
    },

    setIndex(key, i, immediate = false) {
        const inst = this.instances[key];
        if (!inst) return;
        i = ((i % inst.total) + inst.total) % inst.total;

        // Target açı her zaman tam -i*step olmalı (kart TAM ortalansın).
        // Sadece 360°'lik tur sayısını mevcut açıya yakın seçerek "kısa yön"den döner.
        const currentAngle = parseFloat(inst.rotor.style.getPropertyValue('--rotor-angle')) || 0;
        let targetAngle = -i * inst.step;
        while (targetAngle - currentAngle > 180)  targetAngle -= 360;
        while (targetAngle - currentAngle < -180) targetAngle += 360;

        if (immediate) {
            inst.rotor.style.transition = 'none';
            inst.rotor.style.setProperty('--rotor-angle', `${targetAngle}deg`);
            // Force reflow then restore transition
            void inst.rotor.offsetWidth;
            inst.rotor.style.transition = '';
        } else {
            inst.rotor.style.setProperty('--rotor-angle', `${targetAngle}deg`);
        }

        const prevIdx = inst.index;
        inst.index = i;
        inst.cards.forEach((c, idx) => c.classList.toggle('card-active', idx === i));

        // Trenler karuselinde: önde kalan kart sahip olunan bir trense, OTOMATİK SEÇ.
        // Upgrades için seçim kavramı yok; o yüzden sadece trains.
        if (key === 'trains' && !immediate && prevIdx !== i) {
            const trainId = inst.cards[i].dataset.train;
            if (trainId && typeof window.selectTrain === 'function' && trainId !== activeTrain) {
                // selectTrain() owned değilse sessizce false döner — güvenli.
                window.selectTrain(trainId);
            }
        }

        if (navigator.vibrate && !immediate) navigator.vibrate(10);
    },

    snapToId(key, id) {
        const inst = this.instances[key];
        if (!inst || !id) return;
        const attr = key === 'trains' ? 'train' : 'upgrade';
        const idx = inst.cards.findIndex(c => c.dataset[attr] === id);
        if (idx >= 0) this.setIndex(key, idx, true);
    },

    onDown(key, e) {
        const inst = this.instances[key];
        if (!inst) return;
        // Buy butonu üzerinde drag başlatma — tıklama olsun
        if (e.target.closest('.buy-btn')) return;
        // preventDefault → tarayıcı tıklama/zoom tetiklemesin, anında drag başlasın
        if (e.cancelable) e.preventDefault();
        inst.isDragging = true;
        inst.hasMoved = false;
        inst.startX = e.clientX;
        inst.startAngle = parseFloat(inst.rotor.style.getPropertyValue('--rotor-angle')) || (-inst.index * inst.step);
        inst.rotor.classList.add('dragging');
        try { inst.rotor.setPointerCapture(e.pointerId); } catch (_) {}
    },

    onMove(key, e) {
        const inst = this.instances[key];
        if (!inst || !inst.isDragging) return;
        if (e.cancelable) e.preventDefault();
        const dx = e.clientX - inst.startX;
        if (Math.abs(dx) > 4) inst.hasMoved = true;
        // Çarpan 0.4 → 0.7: mobilde daha az parmak hareketi yetsin, akıcı hissetsin
        const angle = inst.startAngle + dx * 0.7;
        inst.rotor.style.setProperty('--rotor-angle', `${angle}deg`);
    },

    onUp(key, e) {
        const inst = this.instances[key];
        if (!inst || !inst.isDragging) return;
        inst.isDragging = false;
        inst.rotor.classList.remove('dragging');
        try { inst.rotor.releasePointerCapture(e.pointerId); } catch (_) {}

        const cur = parseFloat(inst.rotor.style.getPropertyValue('--rotor-angle')) || 0;
        const nearestIdx = Math.round(-cur / inst.step);
        this.setIndex(key, nearestIdx);

        // Tıklama olaylarının yanlışlıkla tetiklenmesini engellemek için kısa bir bekleme
        if (inst.hasMoved) {
            setTimeout(() => { inst.hasMoved = false; }, 50);
        }
    }
};

window.openMarket = function() {
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("marketScreen").classList.remove("hidden");
    updateMarketUI();
    // Karuselleri hidden tab dahil başlat — DOM yerleşimi bittikten sonra
    requestAnimationFrame(() => {
        Carousel.init('trains');
        Carousel.init('upgrades');
        Carousel.snapToId('trains', activeTrain);
    });
}

// Modal kenarındaki ok düğmeleri — hangi tab aktifse onun karuselini gezdirir
window.marketNav = function(dir) {
    const trainsHidden = document.getElementById('tab-trains').classList.contains('hidden');
    const key = trainsHidden ? 'upgrades' : 'trains';
    const inst = Carousel.instances[key];
    if (!inst) return;
    Carousel.setIndex(key, inst.index + (dir === 'next' ? 1 : -1));
};

// Pencere yeniden boyutlandırılırsa (cihaz döndürme dahil) kart yarıçapını
// yeni boyutlara göre tekrar hesapla — kartlar her zaman ekrana sığsın.
let _marketResizeTimer = null;
window.addEventListener('resize', () => {
    if (document.getElementById('marketScreen').classList.contains('hidden')) return;
    clearTimeout(_marketResizeTimer);
    _marketResizeTimer = setTimeout(() => {
        // Re-init mevcut index'i korur (Carousel.init içinde prevIndex bakılır)
        Carousel.init('trains');
        Carousel.init('upgrades');
    }, 150);
});

window.closeMarket = function() {
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

<<<<<<< HEAD
window.buyNitro = function() {
    if (totalCoins >= 800 && !trainUpgrades['nitro_system']) {
=======
function triggerInsufficientFunds() {
    let balanceDiv = document.querySelector('.market-balance');
    if (balanceDiv) {
        balanceDiv.classList.remove('shake-red');
        void balanceDiv.offsetWidth;
        balanceDiv.classList.add('shake-red');
        // Animasyon biter bitmez sınıfı kaldır (1.4s = flash duration)
        setTimeout(() => balanceDiv.classList.remove('shake-red'), 1500);
    }

    if (navigator.vibrate) navigator.vibrate([50, 60, 50, 60, 50]);
    playInsufficientFundsBeep();
}

window.buyNitro = function() {
    if (trainUpgrades['nitro_system']) return false;

    if (totalCoins >= 800) {
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
        totalCoins -= 800;
        trainUpgrades['nitro_system'] = true;
        saveMarketData();
        updateMarketUI();
        return true;
<<<<<<< HEAD
    }
    return false;
};

function updateMarketUI() {
=======
    } else {
        triggerInsufficientFunds();
        return false;
    }
};

window.buyTrain = function(trainId, price) {
    if (ownedTrains.includes(trainId)) return false;

    if (totalCoins >= price) {
        totalCoins -= price;
        ownedTrains.push(trainId);
        saveMarketData();
        updateMarketUI();
        return true;
    } else {
        triggerInsufficientFunds();
        return false;
    }
}

window.buyUpgrade = function(trainId, price) {
    let upgradeKey = trainId + "_brake";

    if (trainUpgrades[upgradeKey]) return false;

    if (totalCoins < price) {
        triggerInsufficientFunds();
        return false;
    }
    if (!ownedTrains.includes(trainId)) return false;

    totalCoins -= price;
    trainUpgrades[upgradeKey] = true;
    saveMarketData();
    updateMarketUI();
    return true;
}

// --- market kodunun tamamı ---
window.updateMarketUI = function() {
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
    let mD = document.getElementById("marketCoinDisplay");
    if (mD) mD.innerText = totalCoins;

    const setBtnState = (selector, isSelected, isOwned, price) => {
        let btn = document.querySelector(selector);
        if (!btn) return;
        btn.disabled = false;
        btn.style.border = "none";
        
        if (isSelected) {
            btn.innerText = "SEÇİLDİ";
            btn.style.background = "#ff6600";
            btn.style.color = "#000";
        } else if (isOwned) {
            btn.innerText = "SEÇ";
            btn.style.background = "rgba(255, 102, 0, 0.1)";
            btn.style.color = "#ff6600";
        } else {
            btn.innerText = price + " 💰";
            let numPrice = parseInt(price);
            if (totalCoins >= numPrice) {
                btn.style.background = "rgba(255, 102, 0, 0.1)";
                btn.style.color = "#ff6600";
            } else {
                btn.style.background = "rgba(255, 255, 255, 0.05)";
                btn.style.color = "#888888";
                btn.style.border = "1px solid rgba(255, 255, 255, 0.1)";
            }
        }
    };

    const setupUpgradeBtn = (selector, isOwned, priceStr) => {
        let upBtn = document.querySelector(selector + " button");
        if (!upBtn) return;
        upBtn.disabled = false;
        upBtn.style.border = "none";

        if (isOwned) {
            upBtn.innerText = "AKTİF";
            upBtn.disabled = true;
            upBtn.style.background = "transparent";
            upBtn.style.color = "#888";
            upBtn.style.border = "1px solid #555";
        } else {
            upBtn.innerText = priceStr + " 💰";
            let numPrice = parseInt(priceStr);
            if (totalCoins >= numPrice) {
                upBtn.style.background = "rgba(255, 102, 0, 0.1)";
                upBtn.style.color = "#ff6600";
            } else {
                upBtn.style.background = "rgba(255, 255, 255, 0.05)";
                upBtn.style.color = "#888888";
                upBtn.style.border = "1px solid rgba(255, 255, 255, 0.1)";
            }
        }
    };

    setBtnState("#card-speedster button", activeTrain === 'speedster', ownedTrains.includes('speedster'), "3000");
    setBtnState("#card-armored button", activeTrain === 'armored', ownedTrains.includes('armored'), "5000");
<<<<<<< HEAD
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
=======
    setBtnState("#card-devoria button", activeTrain === 'devoria', ownedTrains.includes('devoria'), "10000");
    setBtnState("#card-tsunami button", activeTrain === 'tsunami', ownedTrains.includes('tsunami'), "6000");
    setBtnState("#card-cyber button", activeTrain === 'cyber', ownedTrains.includes('cyber'), "7500");
    setBtnState("#card-classic button", activeTrain === 'classic', true, "0");

    setupUpgradeBtn("#upgrade-classic", trainUpgrades['classic_brake'], "2000");
    setupUpgradeBtn("#upgrade-speedster", trainUpgrades['speedster_brake'], "2500");
    setupUpgradeBtn("#upgrade-nitro", trainUpgrades['nitro_system'], "800");
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
}

window.selectTrain = function(trainId) {
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
let isStoryMode = false;
let storyProgress = 0;
let isLevelComplete = false;
let progressBarBg, progressBarFill, progressText;
let storyEventsFired = {};
let storyBrakeOverheated = false;
let storyStartTime = 0;
let storyPauseStart = 0; // Pause başlangıç timestamp'i — duraklamada geçen süre 3-yıldız hesabında sayılmaz
window.pauseGame = function(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    if (!game || !gameStarted || isGameOver || isPaused) return;

    isPaused = true;
    storyPauseStart = Date.now();
    game.scene.pause('PlayScene');
<<<<<<< HEAD
    if (gameScene && gameScene.playerTrainSnd) gameScene.playerTrainSnd.pause(); 
=======
    if (gameScene && gameScene.playerTrainSnd) gameScene.playerTrainSnd.pause();
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
    document.getElementById("pauseScreen").classList.remove("hidden");
    document.getElementById("pauseBtn").classList.add("hidden");
}

window.resumeGame = function(e) {
    if (e) e.stopPropagation();
    if (!isPaused) return;
    isPaused = false;
    // Pause süresince geçen wall-clock süresini storyStartTime'a aktar —
    // 3-yıldız zaman sınırı sadece aktif oynanan süreyi sayar.
    if (storyPauseStart > 0) {
        storyStartTime += (Date.now() - storyPauseStart);
        storyPauseStart = 0;
    }
    game.scene.resume('PlayScene');
<<<<<<< HEAD
    if (gameScene && gameScene.playerTrainSnd) gameScene.playerTrainSnd.resume(); 
=======
    if (gameScene && gameScene.playerTrainSnd) gameScene.playerTrainSnd.resume();
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
    document.getElementById("pauseScreen").classList.add("hidden");
    document.getElementById("pauseBtn").classList.remove("hidden");
}

window.quitToMenuFromPause = function(e) {
    if (e) e.stopPropagation();
    // Pause durumunu doğrudan toparla — resumeGame() çağırmak pause butonunu
    // bir an görünür yapıp returnToMenu'nün tekrar gizlemesine yol açıyordu.
    if (isPaused) {
        isPaused = false;
        storyPauseStart = 0;
        if (game && game.scene.isPaused('PlayScene')) game.scene.resume('PlayScene');
        if (gameScene && gameScene.playerTrainSnd) gameScene.playerTrainSnd.resume();
        document.getElementById("pauseScreen").classList.add("hidden");
    }
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
<<<<<<< HEAD
let trainShieldCircle, backgroundGroup, bulldozerAura, midgroundGroup; 
=======
let trainShieldCircle, backgroundGroup, bulldozerAura, midgroundGroup;
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
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
<<<<<<< HEAD
=======
let localBestScore = parseInt(localStorage.getItem('sm_bestScore')) || 0;
let targetRecord = 0, isRecordBroken = false;
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
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
let devoriaTrainGroup = [];
let tsunamiTrainGroup = [];
let cyberTrainGroup   = [];
let devoriaLives      = 0;
let driftBoostTimer   = 0;
let devoriaEmbers     = [];
let cyberDriftParts   = [];
let tunnelsBack, tunnelsFront;
let isStoryMode2 = false;
let story2Progress = 0;
let story2Phase = 0;
let story2EventsFired = {};
let story2BrakeOverheat = false;
let brakeBlastPenaltyTimer = 0;

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
    devoriaTrainGroup.forEach(p => p.setVisible(activeTrain === 'devoria'));
    tsunamiTrainGroup.forEach(p => p.setVisible(activeTrain === 'tsunami'));
    cyberTrainGroup  .forEach(p => p.setVisible(activeTrain === 'cyber'));
    syncDevoriaHUD();

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
<<<<<<< HEAD
=======
    let gw = this.cameras.main.width;

    p1Top[3].x = gw + 50;
    p1Bot[3].x = gw + 50;
    p2Top[3].x = gw + 50;
    p2Mid[3].x = gw + 50;
    p2Bot[3].x = gw + 50;
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
    if (typeof globalVolume !== 'undefined') {
        gameScene.sound.volume = globalVolume;
    }
    gameScene.cameras.main.setBackgroundColor('#87CEEB');
    graphics = this.add.graphics();
    graphics.setDepth(5);
    obstacles = this.physics.add.group();
    this.add.circle(600, 100, 30, 0xffeb3b).setDepth(0);

    gameScene.overlaySunset = this.add.rectangle(gw/2, 300, gw + 2000, 1500, 0xfc7b03).setDepth(0.1).setAlpha(0);
    gameScene.overlayNight = this.add.rectangle(gw/2, 300, gw + 2000, 1500, 0x111122).setDepth(0.2).setAlpha(0);

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

            let tunnelGw = gameScene ? gameScene.cameras.main.width : 1000;
            let rx = isRightSide ? x : -500;
            let rw = isRightSide ? (tunnelGw + 500 - x) : (x + 500);
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
        let endX = (gameScene ? gameScene.cameras.main.width : 1000) - 30;
        if (phase === 1) {
            drawPipe(endX, 200, true);
            drawPipe(endX, 400, true);
        } else {
            drawPipe(endX, 150, true);
            drawPipe(endX, 300, true);
            drawPipe(endX, 450, true);
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
    farMountains = this.add.tileSprite(gw/2, 450, gw + 1000, 300, 'farMnt').setOrigin(0.5, 0.5).setDepth(1);

    let treeTex = this.make.graphics({ x: 0, y: 0, add: false });
    treeTex.fillStyle(0x1a713b, 1);
    treeTex.beginPath();
    treeTex.moveTo(15, 60);
    treeTex.lineTo(30, 0);
    treeTex.lineTo(45, 60);
    treeTex.fillPath();
    treeTex.closePath();
    treeTex.generateTexture('midTree', 60, 60);
    midTrees = this.add.tileSprite(gw/2, 560, gw + 2000, 60, 'midTree').setOrigin(0.5, 0.5).setDepth(2);
    solidGround = this.add.rectangle(gw/2, 590, gw + 2000, 20, 0x114a24).setDepth(2.5);
    this.add.rectangle(gw/2, 700, gw + 2000, 200, 0x3d2817).setDepth(2.5);
    this.add.rectangle(gw/2, 950, gw + 2000, 300, 0x222222).setDepth(2.5);

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

    let dvBodyLow = this.add.rectangle(0, 8, 64, 14, 0x1a0000);
    let dvBodyTop = this.add.rectangle(0,-3, 64, 16, 0x3d0000);
    let dvCabin   = this.add.rectangle(-16,-15, 24, 16, 0x200000).setStrokeStyle(1, 0x000000);
    let dvWindow  = this.add.rectangle(-16,-15, 12,  8, 0xff2200);
    let dvMaw     = this.add.graphics();
    dvMaw.fillStyle(0x660000); dvMaw.beginPath();
    dvMaw.moveTo(22,-12); dvMaw.lineTo(40,0); dvMaw.lineTo(22,12);
    dvMaw.closePath(); dvMaw.fillPath();
    dvMaw.fillStyle(0xff5500,0.9); dvMaw.fillCircle(40,0,5);
    let dvCrack   = this.add.graphics();
    dvCrack.lineStyle(1,0xff5500,0.75); dvCrack.beginPath();
    dvCrack.moveTo(6,-8); dvCrack.lineTo(11,-2); dvCrack.lineTo(9,6);
    dvCrack.strokePath();
    let dvStripe  = this.add.rectangle(0, 1, 64, 2, 0xff2200);
    let dvStack   = this.add.rectangle(18,-15, 8,12, 0x0d0000);
    devoriaTrainGroup.push(dvBodyLow,dvBodyTop,dvCabin,dvWindow,dvMaw,dvCrack,dvStripe,dvStack);

    let tsBodyLow = this.add.rectangle(0, 8, 64, 14, 0x0a1a2a);
    let tsBodyTop = this.add.rectangle(0,-3, 64, 16, 0x0e2d4a);
    let tsCabin   = this.add.rectangle(-16,-15, 24, 16, 0x071525).setStrokeStyle(1, 0x0a3060);
    let tsWindow  = this.add.rectangle(-16,-15, 12,  8, 0x00ccff);
    let tsBow     = this.add.triangle(36, 0, -9,-10, 9,0, -9,10, 0x1a6080);
    let tsWave    = this.add.graphics();
    tsWave.lineStyle(2, 0x00ccff, 0.85); tsWave.beginPath();
    tsWave.moveTo(-28, 4);
    for (let wx = 0; wx <= 56; wx += 4) {
        tsWave.lineTo(-28 + wx, 4 + Math.sin((wx / 4) * Math.PI) * 2.5);
    }
    tsWave.strokePath();
    let tsFoam = this.add.rectangle(30, 0, 8, 16, 0x1a4a6a);
    tsunamiTrainGroup.push(tsBodyLow,tsBodyTop,tsCabin,tsWindow,tsBow,tsWave,tsFoam);

    let cyBodyLow = this.add.rectangle(0, 8, 64, 14, 0x0a0a0a);
    let cyBodyTop = this.add.rectangle(0,-3, 64, 16, 0x111111);
    let cyCabin   = this.add.rectangle(-16,-15, 24, 16, 0x080808).setStrokeStyle(1, 0x00ffff);
    let cyVisor   = this.add.rectangle(-16,-15, 12,  6, 0x001a1a);
    let cyFront   = this.add.graphics();
    cyFront.fillStyle(0x111111); cyFront.fillRect(22,-11,16,22);
    cyFront.lineStyle(2, 0x00ffff); cyFront.strokeRect(22,-11,16,22);
    let cyLed     = this.add.rectangle(35, 0, 4, 10, 0x00ffff);
    let cyNeonT   = this.add.rectangle(0,-12, 64, 2, 0x00ffff);
    let cyNeonB   = this.add.rectangle(0,  5, 64, 2, 0xff00cc);
    cyberTrainGroup.push(cyBodyLow,cyBodyTop,cyCabin,cyVisor,cyFront,cyLed,cyNeonT,cyNeonB);

    train.add([...devoriaTrainGroup, ...tsunamiTrainGroup, ...cyberTrainGroup]);
    applyTrainVisuals();

    switchBase = this.add.rectangle(300, 300, 14, 60, 0x555555).setDepth(6);
    switchHandle = this.add.circle(300, 280, 10, 0xff0000).setStrokeStyle(1, 0x000).setDepth(7);
   scoreText = this.add.text(30, 25, "🏆 0", {
        fontFamily: "'Poppins', sans-serif",
        fontSize: "26px",
        fill: "#ffffff",
        fontStyle: "700",
        shadow: { offsetX: 0, offsetY: 4, color: 'rgba(0,0,0,0.4)', blur: 6, stroke: false, fill: true }
    }).setDepth(100);

    progressBarBg = this.add.rectangle(gw / 2, 40, 300, 20, 0x222222).setDepth(150).setStrokeStyle(2, 0xffffff);
    progressBarFill = this.add.rectangle(gw / 2 - 150, 40, 0, 20, 0x00ff88).setOrigin(0, 0.5).setDepth(150);
    progressText = this.add.text(gw / 2, 40, "%0", {
        fontFamily: "'Poppins', sans-serif",
        fontSize: '14px',
        fill: '#ffffff',
        fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(150);

    progressBarBg.setVisible(false);
    progressBarFill.setVisible(false);
    progressText.setVisible(false);
    phaseText = this.add.text(gw/2, 250, "🎟️ ANA HAT KİLİDİ AÇILDI 🎟️\n🔥 3. ŞERİT AKTİF 🔥", { fontSize: "38px", fill: "#ff3300", fontStyle: "bold", align: "center", stroke: "#ffffff", strokeThickness: 6 }).setOrigin(0.5).setDepth(100);
    phaseText.setVisible(false);
    vagonText = this.add.text(gw/2, 200, "🚂 YENİ VAGON EKLENDİ 🚂", { fontSize: "32px", fill: "#00ffff", fontStyle: "bold", align: "center", stroke: "#000", strokeThickness: 6 }).setOrigin(0.5).setDepth(100);
    vagonText.setVisible(false);
<<<<<<< HEAD
    
    brakeBarBg = this.add.rectangle(900, 490, 120, 15, 0x222222).setOrigin(0.5).setStrokeStyle(2, 0xffffff).setDepth(100);
    brakeBarFill = this.add.rectangle(840, 490, 0, 15, 0xffeb3b).setOrigin(0, 0.5).setDepth(100);

    nitroBarBg = this.add.rectangle(100, 490, 120, 15, 0x222222).setOrigin(0.5).setStrokeStyle(2, 0xffffff).setDepth(100);
    nitroBarFill = this.add.rectangle(40, 490, 0, 15, 0x00ccff).setOrigin(0, 0.5).setDepth(100);
    nitroBarBg.setVisible(false);
    nitroBarFill.setVisible(false);

=======

    brakeBarBg = this.add.rectangle(gw - 100, 490, 120, 15, 0x222222).setOrigin(0.5).setStrokeStyle(2, 0xffffff).setDepth(100);
    brakeBarFill = this.add.rectangle(gw - 160, 490, 0, 15, 0xffeb3b).setOrigin(0, 0.5).setDepth(100);

    nitroBarBg = this.add.rectangle(100, 490, 120, 15, 0x222222).setOrigin(0.5).setStrokeStyle(2, 0xffffff).setDepth(100);
    nitroBarFill = this.add.rectangle(40, 490, 0, 15, 0x00ccff).setOrigin(0, 0.5).setDepth(100);
    nitroBarBg.setVisible(false);
    nitroBarFill.setVisible(false);

>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
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

<<<<<<< HEAD
    brakeBtnObj = this.add.image(900, 540, 'btnIdle').setInteractive().setDepth(100);
    brakeBtnText = this.add.text(900, 540, "FREN", { 
    fontFamily: 'system-ui, -apple-system, sans-serif', 
    fontSize: '20px', fontStyle: 'bold', color: '#ff3333', letterSpacing: 2 
    }).setOrigin(0.5).setDepth(100);

    nitroBtnObj = this.add.image(100, 540, 'btnNitroIdle').setInteractive().setDepth(100);
    nitroBtnText = this.add.text(100, 540, "NİTRO", { 
        fontFamily: 'system-ui, -apple-system, sans-serif', 
        fontSize: '20px', fontStyle: 'bold', color: '#00ccff', letterSpacing: 2 
=======
    brakeBtnObj = this.add.image(gw - 100, 540, 'btnIdle').setInteractive().setDepth(100);
    brakeBtnText = this.add.text(gw - 100, 540, "FREN", {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '20px', fontStyle: 'bold', color: '#ff3333', letterSpacing: 2
    }).setOrigin(0.5).setDepth(100);

    nitroBtnObj = this.add.image(100, 540, 'btnNitroIdle').setInteractive().setDepth(100);
    nitroBtnText = this.add.text(100, 540, "NİTRO", {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '20px', fontStyle: 'bold', color: '#00ccff', letterSpacing: 2
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
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
        let safeZoneY = gameScene.cameras.main.height - 120;
        if (!gameStarted || isGameOver || isPaused || currentlyOver.length > 0 || pointer.y > safeZoneY) return;

        playSound('switch');
        if (navigator.vibrate) navigator.vibrate(40);
        this.cameras.main.shake(50, 0.002);

        let distToSwitch = 300 - train.x;
        if (pathIndex === 1 && distToSwitch > 0 && distToSwitch < 60 && !perfectUsed) {
            perfectUsed = true;
            score += 2;
            scoreText.setText("🏆 " + score);
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

        if (activeTrain === 'cyber' && gameStarted && !isGameOver && !isPaused) {
            driftBoostTimer = 95;
            showFloatingText(train.x, train.y - 44, "DRIFT! ⚡", "#00ffff");
            gameScene.cameras.main.flash(90, 0, 255, 255);
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

<<<<<<< HEAD
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
    
=======
// Çarpışma absorbsiyon mantığı — kalkan/zırh/devoria/gameover branching'i tek noktadan.
// Döndürür: 'shield' | 'armored' | 'devoria' | 'gameover'
function absorbHit() {
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
    if (hasShield) {
        playSound('shield_break');
        if (navigator.vibrate) navigator.vibrate(100);
        hasShield = false;
        showFloatingText(train.x, train.y - 40, "ZIRH KIRILDI!", "#ff4444");
        gameScene.cameras.main.shake(200, 0.015);
        return 'shield';
    }
    if (activeTrain === 'armored' && shieldDurability > 0) {
        shieldDurability--;
        playSound('shield_break');
        if (navigator.vibrate) navigator.vibrate(100);
        showFloatingText(train.x, train.y - 40, "ZIRH HASAR ALDI!", "#ff4444");
        gameScene.cameras.main.shake(200, 0.015);
        applyTrainVisuals();
        return 'armored';
    }
    if (activeTrain === 'devoria' && devoriaLives > 0) {
        devoriaLives--;
        playSound('shield_break');
        if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
        showFloatingText(train.x, train.y - 42, "CAN −1! 💀", "#ff3300");
        gameScene.cameras.main.shake(260, 0.018);
        gameScene.cameras.main.flash(180, 200, 0, 0);
        triggerOrbLoss(3 - devoriaLives);
        syncDevoriaHUD();
        applyTrainVisuals();
        return 'devoria';
    }
    triggerGameOver();
    return 'gameover';
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
        if (scoreText) scoreText.setText("🏆 " + score);
        gameScene.cameras.main.shake(100, 0.01);
        return;
    }

    const result = absorbHit();
    if (result === 'gameover') return;

    if (result === 'devoria') createDevoriaExplosion(obs.x, obs.y);
    else createExplosion(obs.x, obs.y);
    obs.destroy();
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
    } else if (activeTrain === 'devoria') {
        let base  = gameScene.add.rectangle(0, 5, 50, 14, 0x1a0000);
        let body  = gameScene.add.rectangle(0,-5, 48, 16, 0x3d0000);
        let roof  = gameScene.add.rectangle(0,-15, 50, 6, 0x1f0000);
        let crack = gameScene.add.graphics();
        crack.lineStyle(1, 0xff3300, 0.65);
        crack.beginPath(); crack.moveTo(-8,-8); crack.lineTo(-3,0); crack.lineTo(-6,8);
        crack.strokePath();
        let glow  = gameScene.add.rectangle(0, 1, 50, 2, 0xff2200);
        let w1    = gameScene.add.circle(-15,12,6,0x0d0000).setStrokeStyle(1,0x330000);
        let w2    = gameScene.add.circle( 15,12,6,0x0d0000).setStrokeStyle(1,0x330000);
        w.add([base,body,roof,crack,glow,w1,w2]);
    } else if (activeTrain === 'tsunami') {
        let base  = gameScene.add.rectangle(0, 5, 50, 14, 0x0a1a2a);
        let body  = gameScene.add.rectangle(0,-5, 48, 16, 0x0e2d4a);
        let roof  = gameScene.add.rectangle(0,-15, 50, 6, 0x0a1a2a);
        let wl    = gameScene.add.rectangle(-10,-5, 12, 8, 0x00ccff);
        let wr    = gameScene.add.rectangle( 10,-5, 12, 8, 0x00ccff);
        let wave  = gameScene.add.rectangle(0, 4, 50, 2, 0x00ccff);
        let w1    = gameScene.add.circle(-15,12,6,0x071525).setStrokeStyle(1,0x0a3060);
        let w2    = gameScene.add.circle( 15,12,6,0x071525).setStrokeStyle(1,0x0a3060);
        w.add([base,body,roof,w1,w2,wl,wr,wave]);
    } else if (activeTrain === 'cyber') {
        let base  = gameScene.add.rectangle(0, 5, 50, 14, 0x0a0a0a);
        let body  = gameScene.add.rectangle(0,-5, 48, 16, 0x111111);
        let roof  = gameScene.add.rectangle(0,-15, 50, 6, 0x0a0a0a);
        let wl    = gameScene.add.rectangle(-10,-5, 12, 8, 0x001a1a);
        let wr    = gameScene.add.rectangle( 10,-5, 12, 8, 0x001a1a);
        let nt    = gameScene.add.rectangle(0,-12, 50, 2, 0x00ffff);
        let nb    = gameScene.add.rectangle(0,  4, 50, 2, 0xff00cc);
        let w1    = gameScene.add.circle(-15,12,6,0x080808).setStrokeStyle(1,0x00ffff);
        let w2    = gameScene.add.circle( 15,12,6,0x080808).setStrokeStyle(1,0x00ffff);
        w.add([base,body,roof,w1,w2,wl,wr,nt,nb]);
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
<<<<<<< HEAD
    

    if (gameScene && gameScene.playerTrainSnd && gameScene.playerTrainSnd.isPlaying) {
        let pitchRate = 0.6 + (speed / maxSpeed) * 0.8; 
        gameScene.playerTrainSnd.setRate(pitchRate);
    }

=======

    if (isLevelComplete) {
        speed -= 0.08 * gameTime.scale;
        if (speed < 0) speed = 0;
        isNitro = false;
        isBraking = false;
    }

   if (isStoryMode && !isLevelComplete) {
        storyProgress += (speed * 0.012) * gameTime.scale;

        if (!storyEventsFired['e30'] && storyProgress >= 30) {
            storyEventsFired['e30'] = true;
            showStoryEventBanner('⚠️', 'Demiryolunda çalışma ekibi! Dikkat!', 'danger');
        }
        if (!storyEventsFired['e65'] && storyProgress >= 65) {
            storyEventsFired['e65'] = true;
            showStoryEventBanner('🚉', 'Son durak yaklaşıyor, hızlan!', 'success');
        }
        if (!storyEventsFired['e85'] && storyProgress >= 85) {
            storyEventsFired['e85'] = true;
            showStoryEventBanner('🔴', 'Acil fren bölgesi! Yavaşla!', 'danger');
        }

        if (storyProgress >= 100) {
            storyProgress = 100;
            triggerLevelComplete();
        }

        progressBarFill.width = (storyProgress / 100) * 300;
        progressText.setText("%" + Math.floor(storyProgress));

        if (storyProgress > 75) progressBarFill.fillColor = 0x00ff88;
        else if (storyProgress > 40) progressBarFill.fillColor = 0xffd700;
        else progressBarFill.fillColor = 0xffaa00;
    }
    if (isStoryMode2 && !isLevelComplete) {
    updateStory2Logic(gameTime.scale);
}
if (isStoryMode2 && brakeBlastPenaltyTimer > 0) {
    brakeBlastPenaltyTimer -= gameTime.scale;
    speed = Math.max(speed - 0.06 * gameTime.scale, 0.8);
}

    if (gameScene && gameScene.playerTrainSnd && gameScene.playerTrainSnd.isPlaying) {
        let pitchRate = 0.6 + (speed / maxSpeed) * 0.8;
        gameScene.playerTrainSnd.setRate(pitchRate);
    }

    let targetZoom = 1.0 - (0.15 * (speed / maxSpeed));
    gameScene.cameras.main.zoom += (targetZoom - gameScene.cameras.main.zoom) * 0.05 * gameTime.scale;
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3

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

    let targetWagonCount = Math.min(Math.floor(score / 15), 4);
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
<<<<<<< HEAD
            bulldozerAura.setVisible(false); 
        }
    }

    let baseHeatRate = 1.5;
=======
            bulldozerAura.setVisible(false);
        }
    }

   let baseHeatRate = 1.5;
   if (activeTrain === 'tsunami') baseHeatRate *= 0.38;
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
    let upgradeKey = activeTrain + "_brake";
    if (driftBoostTimer > 0 && activeTrain === 'cyber') {
        driftBoostTimer -= gameTime.scale;
        if (!isBraking) speed = Math.min(maxSpeed + 3.5, speed + 0.45 * gameTime.scale);
        spawnCyberDriftParts();
    }
    if (trainUpgrades[upgradeKey]) {
        baseHeatRate = 0.8;
    }

    if (chillTimer > 0) {
        chillTimer -= gameTime.scale;

        if (brakeHeat > 0) brakeHeat = 0;
        if (nitroHeat > 0) nitroHeat = 0;
        brakeCooldown = false;
        nitroCooldown = false;

        brakeBtnObj.setTexture(isBraking ? 'btnDown' : 'btnIdle');
        brakeBtnText.setText("FREN");
        brakeBtnText.setColor(isBraking ? '#ffffff' : '#ff3333');

        if (trainUpgrades['nitro_system']) {
            nitroBtnObj.setTexture(isNitro ? 'btnNitroDown' : 'btnNitroIdle');
            nitroBtnText.setText("NİTRO");
            nitroBtnText.setColor(isNitro ? '#ffffff' : '#00ccff');
        }
    }

    if (isBraking) {
        speed = 0.5;
        if (chillTimer <= 0) {
            brakeHeat += (baseHeatRate * gameTime.scale);
        }
        spawnBrakeSparks();

        if (brakeHeat >= 100) {
            brakeHeat = 100;
             if (isStoryMode) storyBrakeOverheated = true;
             if (isStoryMode2) story2BrakeOverheat = true;
            isBraking = false;
            brakeCooldown = true;
            brakeBtnObj.setTexture('btnCooldown');
            brakeBtnObj.setScale(1);
            brakeBtnText.setScale(1);
            brakeBtnText.setText("AŞIRI ISI");
            brakeBtnText.setColor('#888888');
<<<<<<< HEAD
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
=======
            playSound('shield_break');
        }
    } else if (isNitro && trainUpgrades['nitro_system']) {
        let tSpeed = baseSpeed + (score * 0.2) + 6.0;
        if (activeTrain === 'speedster') tSpeed += 2;
        speed = Math.min(maxSpeed + 4, tSpeed);

        if (chillTimer <= 0) {
            nitroHeat += (2.2 * gameTime.scale);
        }
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
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
        }
    } else {

        let tSpeed = baseSpeed + (score * 0.2);
        if (activeTrain === 'speedster') tSpeed += 2;
        let targetSpeed = Math.min(maxSpeed, tSpeed);
        speed += (targetSpeed - speed) * 0.1 * gameTime.scale;

        if (brakeHeat > 0 && chillTimer <= 0) {
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

<<<<<<< HEAD
    if (!isNitro && nitroHeat > 0) {
=======
    if (!isNitro && nitroHeat > 0 && chillTimer <= 0) {
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
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
<<<<<<< HEAD

    if (itemGraphic.visible) {
=======
if (itemGraphic.visible) {
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
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
                scoreText.setText("🏆 " + score);
                playSound('coin');
                gameScene.tweens.add({
                    targets: scoreText,
                    scale: 1.5,
                    duration: 100,
                    yoyo: true
                });
            } else if (itemType === 2) {
                showFloatingText(train.x, train.y - 40, "OVERCLOCK! ❄️⚡", "#00ffff");
                chillTimer = 240;
                brakeHeat = 0;
                nitroHeat = 0;
                brakeCooldown = false;
<<<<<<< HEAD
                brakeBtnObj.setTexture('btnIdle');
                brakeBtnText.setText("FREN");
                brakeBtnText.setColor('#ff3333');
=======
                nitroCooldown = false;
                brakeBtnObj.setTexture('btnIdle');
                brakeBtnText.setText("FREN");
                brakeBtnText.setColor('#ff3333');
                if (trainUpgrades['nitro_system']) {
                    nitroBtnObj.setTexture('btnNitroIdle');
                    nitroBtnText.setText("NİTRO");
                    nitroBtnText.setColor('#00ccff');
                }
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
                playSound('ice');
                gameScene.cameras.main.flash(300, 0, 255, 255);
            } else if (itemType === 3) {
                showFloatingText(train.x, train.y - 40, "KALKAN! 🛡️", "#00ff88");
                hasShield = true;
                playSound('shield');
            } else if (itemType === 4) {
                showFloatingText(train.x, train.y - 40, "BULDOZER! PARÇALA +5", "#ff4400");
<<<<<<< HEAD
                bulldozerTimer = 480; 
                bulldozerAura.setVisible(true); 
=======
                bulldozerTimer = 480;
                bulldozerAura.setVisible(true);
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
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
<<<<<<< HEAD
=======
    if (activeTrain === 'devoria' && gameStarted && !isGameOver) {
        spawnDevoriaEmber();
        updateDevoriaEmbers();
        if (devoriaLives <= 1 && devoriaLives >= 0) {
            graphics.lineStyle(2.5, 0xff2200, 0.25 + Math.sin(pulse * 16) * 0.3);
            graphics.strokeCircle(train.x, train.y, 34);
        }
    }
    if (activeTrain === 'cyber') updateCyberDriftParts();
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
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
                const result = absorbHit();
                if (result !== 'gameover') {
                    resetTrain(false);
                    setNewCorrectPath();
                }
            } else {
                score++;
                scoreText.setText("🏆 " + score);
                playSound('score');

                if (score > targetRecord && !isRecordBroken) {
                    isRecordBroken = true;
                    showFloatingText(train.x, train.y - 60, "YENİ REKOR! 🏆", "#ffd700");
                    if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
                    gameScene.cameras.main.flash(400, 255, 215, 0);
                    starEmitter.emitParticleAt(train.x, train.y, 30);
                }

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
<<<<<<< HEAD
            if (obs.sound) obs.sound.stop(); 
=======
            if (obs.sound) obs.sound.stop();
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
            obs.destroy();
        }
        spawnBlackSmoke(obs.x, obs.y);
    });
}
function spawnObstacle() {
    if (isLevelComplete) return;
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
        let gw = gameScene.cameras.main.width;
        let obsContainer = gameScene.add.container(gw + 50, obsY).setDepth(10);
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
<<<<<<< HEAD
        
=======
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3

        if (gameScene && gameScene.sound) {
            let obsSnd = gameScene.sound.add('snd_rogue', { loop: true, volume: 0.4 });
            obsSnd.play();
            obsContainer.sound = obsSnd;
        }

<<<<<<< HEAD

=======
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
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

    let rightEdge = (gameScene ? gameScene.cameras.main.width : 1000) + 500;

    if (phase === 1) {
        drawRailSegment(-500, 200, rightEdge, 200);
        drawRailSegment(-500, 400, rightEdge, 400);
    } else {
        drawRailSegment(-500, 150, rightEdge, 150);
        drawRailSegment(-500, 300, rightEdge, 300);
        drawRailSegment(-500, 450, rightEdge, 450);
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

    if (gameScene && gameScene.cameras.main) {
        gameScene.cameras.main.zoom = 1.0;
    }

    if (isFullReset) {
        document.body.style.backgroundColor = "#87CEEB";
        if (gameScene) gameScene.cameras.main.setBackgroundColor('#87CEEB');

<<<<<<< HEAD
=======
        if (farMountains) farMountains.clearTint();
        if (midTrees) midTrees.clearTint();
        if (solidGround) solidGround.fillColor = 0x114a24;

>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
        if (activeTrain === 'armored') {
            shieldDurability = 2;
        } else {
            shieldDurability = 0;
        }
        if (activeTrain === 'devoria') {
            devoriaLives = 3;
        } else {
            devoriaLives = 0;
        }
        driftBoostTimer = 0;
        syncDevoriaHUD();
        hasShield = false;
        bulldozerTimer = 0;
<<<<<<< HEAD
        if (bulldozerAura) bulldozerAura.setVisible(false); 
        
=======
        if (bulldozerAura) bulldozerAura.setVisible(false);

>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
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

<<<<<<< HEAD
function startEndlessMode() {
=======
window.startEndlessMode = function() {
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
    if (audioCtx.state === 'suspended') audioCtx.resume();
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("pauseBtn").classList.remove("hidden");
    gameStarted = true;
    targetRecord = Math.max(minHighScore, localBestScore);
    if (targetRecord < 5) targetRecord = 5;
    isRecordBroken = false;
    resetTrain(true);
    setNewCorrectPath();
<<<<<<< HEAD
    manageTrainSounds(); 
=======
    manageTrainSounds();
}

window.startStoryMode = function() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    document.getElementById("storyMenuScreen").classList.add("hidden");
    showStoryCutscene(function() {
        document.getElementById("startScreen").classList.add("hidden");
        document.getElementById("pauseBtn").classList.remove("hidden");
        gameStarted = true;
        isStoryMode = true;
        storyProgress = 0;
        isLevelComplete = false;
        storyEventsFired = {};
        storyBrakeOverheated = false;
        storyStartTime = Date.now();
        storyPauseStart = 0;
        resetTrain(true);
        setNewCorrectPath();
        manageTrainSounds();
        progressBarBg.setVisible(true);
        progressBarFill.setVisible(true);
        progressText.setVisible(true);
        scoreText.setVisible(false);
    });
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
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

    if (score > localBestScore) {
        localBestScore = score;
        localStorage.setItem('sm_bestScore', localBestScore);
    }

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

function triggerLevelComplete() {
    if (isLevelComplete) return;
    isLevelComplete = true;

    if (gameScene && gameScene.playerTrainSnd) gameScene.playerTrainSnd.stop();
    obstacles.getChildren().forEach(obs => { if (obs.sound) obs.sound.stop(); });
    playSound('perfect');
    document.getElementById("pauseBtn").classList.add("hidden");
    gameScene.cameras.main.flash(700, 0, 255, 136);
    gameScene.cameras.main.shake(300, 0.008);

    let elapsed = Math.floor((Date.now() - storyStartTime) / 1000);
    let brakeOverheated = isStoryMode2 ? story2BrakeOverheat : storyBrakeOverheated;
    let timeLimit = isStoryMode2 ? 120 : 90;
    let stars = 1;
    if (!brakeOverheated) stars = 2;
    if (!brakeOverheated && elapsed < timeLimit) stars = 3;

    let bonusCoins = 200 + (stars * 100);
    totalCoins += bonusCoins;
    saveMarketData();

    let mC = document.getElementById("menuCoinDisplay");
    if (mC) mC.innerText = totalCoins;

    setTimeout(() => {
        triggerConfetti();
        let screen = document.getElementById("levelCompleteScreen");
        screen.classList.remove("hidden");

        let mins = Math.floor(elapsed / 60);
        let secs = elapsed % 60;
        document.getElementById("lcTime").textContent = (mins > 0 ? mins + 'd ' : '') + secs + 's';
        document.getElementById("lcSwitches").textContent = score + ' doğru';
        document.getElementById("lcCoins").textContent = '+' + bonusCoins + ' 💰';

        let starsContainer = document.getElementById("lcStars");
        starsContainer.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            let starEl = document.createElement('span');
            starEl.className = 'lc-star' + (i < stars ? ' earned' : '');
            starEl.textContent = '★';
            starEl.style.animationDelay = (0.25 + i * 0.18) + 's';
            starsContainer.appendChild(starEl);
        }
    }, 700);
}

window.returnToMenu = function() {
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
    devoriaLives    = 0;
    driftBoostTimer = 0;
    syncDevoriaHUD();
    isGameOver = false;
    isPaused = false;
    score = 0;
    storyEventsFired = {};
    storyBrakeOverheated = false;
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

<<<<<<< HEAD
    scoreText.setText("Skor: 0");
    scoreText.setColor("#ffaa00");
=======
    scoreText.setText("🏆 0");
    scoreText.setColor("#ffffff");
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
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

    isStoryMode = false;
    isStoryMode2 = false;
    story2Progress = 0;
    story2Phase = 0;
    story2EventsFired = {};
    story2BrakeOverheat = false;
    brakeBlastPenaltyTimer = 0;
    deactivateFog();
    deactivateSnow();
    isLevelComplete = false;
    storyProgress = 0;
    if (progressBarBg) {
        progressBarBg.setVisible(false);
        progressBarFill.setVisible(false);
        progressText.setVisible(false);
    }
    if (scoreText) scoreText.setVisible(true);
}

function preload() {
    this.load.audio('snd_classic', 'classic-sound.wav');
    this.load.audio('snd_speedster', 'yht-sound.wav');
    this.load.audio('snd_rogue', 'rogue-sound.wav');
}

const PlayScene = {
    key: 'PlayScene',
    preload: preload,
<<<<<<< HEAD
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
=======
    create: create,
    update: update
};

let gameWidth = Math.max(1000, window.innerWidth * (600 / window.innerHeight));
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3

const config = {
    type: Phaser.AUTO,
    backgroundColor: "#87CEEB",
    parent: 'gameWrapper',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: gameWidth,
        height: 600
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
<<<<<<< HEAD
    scene: [PlayScene, StoryScene], 
=======
    scene: [PlayScene],
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
    fps: {
        target: 60,
        forceSetTimeOut: true
    }
};

let game;

function syncDevoriaHUD() {
    let hud = document.getElementById('devoriaLivesHUD');
    if (!hud) return;
    if (activeTrain === 'devoria' && gameStarted && !isGameOver) {
        hud.classList.remove('hidden');
        for (let i = 1; i <= 3; i++) {
            let orb = document.getElementById('dlOrb' + i);
            if (!orb) continue;
            if (i > devoriaLives) {
                orb.classList.add('dl-orb-spent');
            } else {
                orb.classList.remove('dl-orb-spent', 'dl-orb-losing');
            }
        }
    } else {
        hud.classList.add('hidden');
    }
}
 
function triggerOrbLoss(lostIndex) {
    let orb = document.getElementById('dlOrb' + lostIndex);
    if (!orb) return;
    orb.classList.remove('dl-orb-losing');
    void orb.offsetWidth;
    orb.classList.add('dl-orb-losing');
    setTimeout(function() {
        orb.classList.add('dl-orb-spent');
    }, 550);
}
 
function spawnDevoriaEmber() {
    if (Math.random() > 0.45) return;
    devoriaEmbers.push({
        x:     train.x - 10 + Phaser.Math.Between(-5, 5),
        y:     train.y + Phaser.Math.Between(-8, 8),
        vx:    Phaser.Math.FloatBetween(-4, -1.5),
        vy:    Phaser.Math.FloatBetween(-3, 0.4),
        alpha: 1.0,
        size:  Phaser.Math.FloatBetween(2.2, 5.5),
        color: [0xff4400, 0xff7700, 0xffaa00, 0xff2200][Math.floor(Math.random() * 4)]
    });
}
 
function updateDevoriaEmbers() {
    for (let i = devoriaEmbers.length - 1; i >= 0; i--) {
        let p = devoriaEmbers[i];
        p.x += p.vx * gameTime.scale;
        p.y += p.vy * gameTime.scale;
        p.vy -= 0.1 * gameTime.scale;
        p.alpha -= 0.04 * gameTime.scale;
        p.size  -= 0.09 * gameTime.scale;
        graphics.fillStyle(p.color, p.alpha);
        graphics.fillCircle(p.x, p.y, Math.max(0.1, p.size));
        if (p.alpha <= 0 || p.size <= 0) devoriaEmbers.splice(i, 1);
    }
}
 
function createDevoriaExplosion(x, y) {
    for (let i = 0; i < 28; i++) {
        explosionParticles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 14,
            vy: (Math.random() - 0.5) * 14,
            life: 1.0,
            size:  Math.random() * 13 + 4,
            color: [0xff4400, 0xff8800, 0xffcc00, 0xcc0000, 0xff2200][Math.floor(Math.random() * 5)]
        });
    }
}
 
function spawnCyberDriftParts() {
    if (Math.random() > 0.55) return;
    for (let i = 0; i < 3; i++) {
        cyberDriftParts.push({
            x:     train.x - 18 + Phaser.Math.Between(-6, 10),
            y:     train.y + Phaser.Math.Between(-7, 7),
            vx:    Phaser.Math.FloatBetween(-6, -2.5),
            vy:    Phaser.Math.FloatBetween(-1, 1),
            alpha: 0.9,
            w:     Phaser.Math.FloatBetween(3, 8),
            h:     Phaser.Math.FloatBetween(1, 2.5),
            color: Math.random() > 0.5 ? 0x00ffff : 0xff00cc
        });
    }
}
 
function updateCyberDriftParts() {
    for (let i = cyberDriftParts.length - 1; i >= 0; i--) {
        let p = cyberDriftParts[i];
        p.x     += p.vx * gameTime.scale;
        p.y     += p.vy * gameTime.scale;
        p.alpha -= 0.07 * gameTime.scale;
        p.w     -= 0.2  * gameTime.scale;
        graphics.fillStyle(p.color, p.alpha);
        graphics.fillRect(p.x, p.y, Math.max(0.5, p.w), Math.max(0.3, p.h));
        if (p.alpha <= 0 || p.w <= 0) cyberDriftParts.splice(i, 1);
    }
}

function initPhaserGame() {
    if (!game) {
        game = new Phaser.Game(config);
    }
}
<<<<<<< HEAD

=======
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
let menuHeat = 0;
const maxHeat = 100;

window.clickMenuTitle = function() {
<<<<<<< HEAD
    menuHeat = Math.min(maxHeat, menuHeat + 15);
    
=======
    let today = new Date().toDateString();
    let easterEggClaimed = localStorage.getItem('sm_easterEggDate') === today;

    menuHeat = Math.min(maxHeat, menuHeat + 20);

>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
    const title = document.getElementById('menuMainTitle');
    if (!title) return;

    const rect = title.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
<<<<<<< HEAD
    const centerY = rect.top + rect.height / 2;

    const sparkCount = Math.floor(menuHeat / 4) + 15; 
=======

    const sparkCount = Math.floor(menuHeat / 5) + 5;
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
    for (let i = 0; i < sparkCount; i++) {
        createMenuSpark(centerX, rect.bottom - 5);
    }

    if (menuHeat > 50) {
        createMenuSteam(centerX + (Math.random() - 0.5) * rect.width, rect.top);
<<<<<<< HEAD
        if (navigator.vibrate) navigator.vibrate(25);
    }
=======
        if (navigator.vibrate) navigator.vibrate(20);
    }

    if (menuHeat >= maxHeat && !easterEggClaimed) {
        localStorage.setItem('sm_easterEggDate', today);

        totalCoins += 500;
        saveMarketData();

        let mC = document.getElementById("menuCoinDisplay");
        if (mC) mC.innerText = totalCoins;

        triggerConfetti();
        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
        playSound('coin');
        setTimeout(() => playSound('perfect'), 300);

        showSecretText(centerX, rect.top, "ARDEKO GİZLİ KASASI!\n+500 💰");

        menuHeat = 0;
    } else if (menuHeat >= maxHeat && easterEggClaimed) {
        menuHeat = 80;
    }
}

function showSecretText(x, y, text) {
    const el = document.createElement('div');
    el.className = 'secret-float-text';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.innerText = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
}

function createMenuSpark(x, y) {
    const spark = document.createElement('div');
    spark.className = 'menu-spark';
<<<<<<< HEAD
    
=======

>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
    if (menuHeat > 75) {
        spark.classList.add('super-spark');
    }

    spark.style.left = x + 'px';
    spark.style.top = y + 'px';

<<<<<<< HEAD
    const dx = (Math.random() - 0.5) * 380 + 'px'; 
    const dy = (Math.random() - 0.6) * 220 - 60 + 'px'; 
=======
    const dx = (Math.random() - 0.5) * 380 + 'px';
    const dy = (Math.random() - 0.6) * 220 - 60 + 'px';
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
    spark.style.setProperty('--dx', dx);
    spark.style.setProperty('--dy', dy);

    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 800);
}

function createMenuSteam(x, y) {
    const steam = document.createElement('div');
    steam.className = 'menu-steam';
<<<<<<< HEAD
    
    const size = (Math.floor(Math.random() * 16) + 20) + 'px'; 
=======

    const size = (Math.floor(Math.random() * 16) + 20) + 'px';
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
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
<<<<<<< HEAD
    
    const size = (Math.floor(Math.random() * 11) + 15) + 'px';
    smoke.style.width = size;
    smoke.style.height = size;
    
=======

    const size = (Math.floor(Math.random() * 11) + 15) + 'px';
    smoke.style.width = size;
    smoke.style.height = size;

>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
    smoke.style.left = (x + (Math.random() - 0.5) * rectWidth) + 'px';
    smoke.style.top = y + 'px';

    const sdx = (Math.random() - 0.5) * 40 + 'px';
    smoke.style.setProperty('--sdx', sdx);

    document.body.appendChild(smoke);
    setTimeout(() => smoke.remove(), 2200);
}
<<<<<<< HEAD

=======
// Ortak cutscene mantığı — showStoryCutscene ve showStoryCutscene2 için tek noktadan
function runCutscene(config, callback) {
    const steps = config.steps;
    let currentStep = 0;
    let twTimer = null;

    const screen = document.getElementById(config.screenId);
    const speakerEl = document.getElementById(config.speakerId);
    const avatarEl = document.getElementById(config.avatarId);
    const bodyEl = document.getElementById(config.bodyId);
    const btn = document.getElementById(config.btnId);
    const dots = screen.querySelectorAll('.cdot');

    screen.classList.remove('hidden');

    function typeText(text, el, speed) {
        el.textContent = '';
        el.classList.add('typing');
        let i = 0;
        if (twTimer) clearInterval(twTimer);
        twTimer = setInterval(function() {
            el.textContent = text.slice(0, i + 1);
            i++;
            if (i >= text.length) {
                clearInterval(twTimer);
                twTimer = null;
                el.classList.remove('typing');
            }
        }, speed || 28);
    }

    function showStep(index) {
        const s = steps[index];
        speakerEl.textContent = s.speaker;
        avatarEl.textContent = s.avatar;
        dots.forEach(function(d, i) { d.classList.toggle('active', i === index); });
        btn.textContent = index < steps.length - 1 ? 'DEVAM ▶' : 'BAŞLA ▶';
        typeText(s.text, bodyEl, 28);
    }

    showStep(0);

    btn.onclick = function() {
        if (twTimer) {
            clearInterval(twTimer);
            twTimer = null;
            bodyEl.textContent = steps[currentStep].text;
            bodyEl.classList.remove('typing');
            return;
        }
        currentStep++;
        if (currentStep >= steps.length) {
            screen.classList.add('cutscene-exit');
            setTimeout(function() {
                screen.classList.add('hidden');
                screen.classList.remove('cutscene-exit');
                btn.onclick = null;
                callback();
            }, 480);
        } else {
            showStep(currentStep);
        }
    };
}

function showStoryCutscene(callback) {
    runCutscene({
        screenId:  'storyCutsceneScreen',
        speakerId: 'cutsceneSpeaker',
        avatarId:  'cutsceneAvatar',
        bodyId:    'cutsceneBody',
        btnId:     'cutsceneContinueBtn',
        steps: [
            { speaker: 'KONDÜKTÖR',     avatar: '👴', text: 'Merkeze bildiriyorum! Banliyö hattında tanımlanamayan bir sinyal arızası tespit edildi.' },
            { speaker: 'KONDÜKTÖR',     avatar: '👴', text: 'Makasları dikkatli değiştir. Freni aşırı ısıtma, her saniye önemli. İstasyona güvenli ulaş!' },
            { speaker: 'MİSYON HEDEFİ', avatar: '🎯', text: 'İstasyona ulaş. Fren ısısını aşma ve 90 saniyenin altında tamamla → 3 Yıldız.' }
        ]
    }, callback);
}

function applyWinterTheme() {
    if (!gameScene) return;
    
    // Gökyüzünü ve HTML arkaplanını kasvetli gece/kış rengine çevir
    document.body.style.backgroundColor = '#1a202c';
    gameScene.cameras.main.setBackgroundColor('#1a202c');

    // Ağaçları, dağları ve zemini soğuk, donuk renklere boya (YENİ GÖRSEL GEREKTİRMEZ)
    if (farMountains) farMountains.setTint(0x4a5568);
    if (midTrees) midTrees.setTint(0x2d3748); 
    if (solidGround) solidGround.fillColor = 0x1a202c;

    // Ortam karanlık olduğu için tren farlarını baştan aç
    if (headlight) {
        headlight.setVisible(true);
        headlineCore.setVisible(true);
        farGlow.setVisible(true);
    }
}

function showStoryCutscene2(callback) {
    runCutscene({
        screenId:  'storyCutsceneScreen2',
        speakerId: 'cutsceneSpeaker2',
        avatarId:  'cutsceneAvatar2',
        bodyId:    'cutsceneBody2',
        btnId:     'cutsceneContinueBtn2',
        steps: [
            { speaker: 'KONDÜKTÖR',     avatar: '👴', text: 'Gece seferi başlıyor. Dışarıda sis ve kar var, görüş mesafesi çok düşük.' },
            { speaker: 'KONDÜKTÖR',     avatar: '👴', text: 'Fren sistemine dikkat et, soğuk havada ısınması zorlaşıyor. Kontrollü sür!' },
            { speaker: 'MİSYON HEDEFİ', avatar: '🎯', text: 'Gece istasyonuna ulaş. Fren patlamasını önle ve 120 saniyenin altında tamamla → 3 Yıldız.' },
            { speaker: 'SİSTEM',        avatar: '⚠️', text: 'Uyarı: Karlı zemin frenleme mesafesini artırır. Ekstra dikkatli ol!' }
        ]
    }, callback);
}

function showStoryEventBanner(icon, text, type) {
    let banner = document.getElementById("storyEventBanner");
    let iconEl = document.getElementById("storyBannerIcon");
    let textEl = document.getElementById("storyBannerText");

    banner.classList.remove("hidden", "seb-exit", "danger-banner", "success-banner");

    if (type === 'danger') banner.classList.add("danger-banner");
    if (type === 'success') banner.classList.add("success-banner");

    iconEl.textContent = icon;
    textEl.textContent = text;

    setTimeout(function() {
        banner.classList.add("seb-exit");
        setTimeout(function() {
            banner.classList.add("hidden");
            banner.classList.remove("seb-exit", "danger-banner", "success-banner");
        }, 450);
    }, 3200);
}

let snowParticles = [];
let snowCtx = null;
let snowAnimFrame = null;

function activateFog() {
    const fog = document.getElementById('fogOverlay');
    if (fog) fog.classList.add('fog-active');
}

function deactivateFog() {
    const fog = document.getElementById('fogOverlay');
    if (fog) fog.classList.remove('fog-active');
}

function activateSnow() {
    const canvas = document.getElementById('snowCanvas');
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    snowCtx = canvas.getContext('2d');
    snowParticles = [];
    for (let i = 0; i < 140; i++) {
        snowParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 2.5 + 0.8,
            speed: Math.random() * 1.2 + 0.4,
            wind: Math.random() * 0.6 - 0.3,
            alpha: Math.random() * 0.5 + 0.25
        });
    }
    canvas.classList.add('snow-active');
    if (snowAnimFrame) cancelAnimationFrame(snowAnimFrame);
    animateSnow();
}

function animateSnow() {
    const canvas = document.getElementById('snowCanvas');
    if (!canvas || !snowCtx || !canvas.classList.contains('snow-active')) return;
    snowCtx.clearRect(0, 0, canvas.width, canvas.height);
    snowParticles.forEach(p => {
        snowCtx.beginPath();
        snowCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        snowCtx.fillStyle = `rgba(210, 230, 255, ${p.alpha})`;
        snowCtx.fill();
        p.y += p.speed;
        p.x += p.wind;
        if (p.y > canvas.height) { p.y = -5; p.x = Math.random() * canvas.width; }
        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;
    });
    snowAnimFrame = requestAnimationFrame(animateSnow);
}

function deactivateSnow() {
    const canvas = document.getElementById('snowCanvas');
    if (canvas) canvas.classList.remove('snow-active');
    if (snowAnimFrame) { cancelAnimationFrame(snowAnimFrame); snowAnimFrame = null; }
    if (snowCtx && canvas) snowCtx.clearRect(0, 0, canvas.width, canvas.height);
    snowParticles = [];
}

function triggerBrakeBlast() {
    const el = document.getElementById('brakeBlast');
    if (!el) return;
    el.classList.remove('blast-pop');
    void el.offsetWidth;
    el.classList.add('blast-pop');
    setTimeout(() => el.classList.remove('blast-pop'), 600);
}

function updateStory2Logic(dt) {
    story2Progress += (speed * 0.010) * dt;

    if (!story2EventsFired['fog'] && story2Progress >= 12) {
        story2EventsFired['fog'] = true;
        activateFog();
        showStoryEventBanner('🌫️', 'Yoğun sis! Görüş mesafesi azaldı.', 'fog');
    }
    if (!story2EventsFired['snow'] && story2Progress >= 28) {
        story2EventsFired['snow'] = true;
        activateSnow();
        showStoryEventBanner('❄️', 'Kar yağışı başladı! Fren mesafesi arttı.', 'snow');
    }
    if (!story2EventsFired['e50'] && story2Progress >= 50) {
        story2EventsFired['e50'] = true;
        showStoryEventBanner('⚠️', 'Buz tutan raylar! Çok dikkatli fren!', 'danger');
    }
    if (!story2EventsFired['blast'] && story2Progress >= 65) {
        story2EventsFired['blast'] = true;
        triggerBrakeBlast();
        brakeBlastPenaltyTimer = 90;
        // story2BrakeOverheat burada SET EDİLMEZ — bu senaryo gereği bir olay,
        // oyuncu hatası değil. Aşırı ısı bayrağı yalnızca oyuncu freni gerçekten
        // 100'e dayadığında setlenmeli, aksi takdirde 3 yıldız imkansız hale gelirdi.
        showStoryEventBanner('💥', 'Fren patlaması! Hız geçici olarak düşüyor.', 'danger');
    }
    if (!story2EventsFired['e80'] && story2Progress >= 80) {
        story2EventsFired['e80'] = true;
        showStoryEventBanner('🚉', 'Gece istasyonu yaklaşıyor!', 'success');
    }

    if (story2Progress >= 100) {
        story2Progress = 100;
        triggerLevelComplete();
        return;
    }

    progressBarFill.width = (story2Progress / 100) * 300;
    progressText.setText("%" + Math.floor(story2Progress));

    if (story2Progress > 75) progressBarFill.fillColor = 0x64a0ff;
    else if (story2Progress > 40) progressBarFill.fillColor = 0x4070dd;
    else progressBarFill.fillColor = 0x2050bb;
}

window.startStoryMode2 = function() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    document.getElementById('storyMenuScreen').classList.add('hidden');
    showStoryCutscene2(function() {
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('pauseBtn').classList.remove('hidden');
        gameStarted = true;
        isStoryMode2 = true;
        story2Progress = 0;
        story2Phase = 0;
        isLevelComplete = false;
        story2EventsFired = {};
        story2BrakeOverheat = false;
        brakeBlastPenaltyTimer = 0;
        storyStartTime = Date.now();
        storyPauseStart = 0;
        resetTrain(true);
        applyWinterTheme();
        setNewCorrectPath();
        manageTrainSounds();
        progressBarBg.setVisible(true);
        progressBarFill.setVisible(true);
        progressText.setVisible(true);
        scoreText.setVisible(false);
    });
};

window.returnToMenuFromLevelComplete = function() {
    document.getElementById("levelCompleteScreen").classList.add("hidden");
    returnToMenu();
};
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
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
<<<<<<< HEAD
        menuHeat = Math.max(0, menuHeat - 1.2);

        if (menuHeat > 65) {
=======
        menuHeat = Math.max(0, menuHeat - 1);

        title.style.setProperty('--heat', menuHeat / 100);

        if (menuHeat > 70) {
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
            title.classList.add('title-overheated');
        } else {
            title.classList.remove('title-overheated');
        }

<<<<<<< HEAD
        title.style.filter = `drop-shadow(0 0 ${menuHeat / 3}px rgba(255, 68, 0, ${menuHeat / 100})) drop-shadow(0 4px 6px rgba(0,0,0,0.7))`;
    } else {
        title.style.filter = `drop-shadow(0 4px 6px rgba(0, 0, 0, 0.7))`;
    }
}, 50);
=======
        title.style.filter = `drop-shadow(0 ${4 + (menuHeat/15)}px ${6 + (menuHeat/10)}px rgba(255, 68, 0, ${menuHeat / 100}))`;
    } else {
        title.style.setProperty('--heat', 0);
        title.style.filter = `drop-shadow(0 4px 6px rgba(0, 0, 0, 0.7))`;
        title.classList.remove('title-overheated');
    }
}, 50);
>>>>>>> 40b02f449edcf36d870ff2891c3c18255724e7b3
