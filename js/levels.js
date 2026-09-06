// levels.js
function getSafePos(level) {
    const w = W(), h = H();
    const pos = {
        1: {x: w*0.07, y: h*0.58},
        2: {x: w*0.25, y: h*0.22},
        3: {x: w*0.13, y: h*0.2},
        4: {x: w*0.35, y: h*0.55},
        5: {x: w*0.12, y: h*0.4}
    };
    return pos[level] || {x: w*0.1, y: h*0.5};
}

function loadLevel(level) {
    const w = W(), h = H();
    enemies = [];
    bullets = [];
    enemyBullets = [];
    diamondItems = [];
    platforms = [];
    spikes = [];
    waterZones = [];
    levelEnemiesDefeated = 0;
    bossDefeated = false;

    if (!player) {
        player = new Player(w*0.1, h*0.5);
        player.health = 10;
    } else {
        player.vx = 0;
        player.vy = 0;
        player.invincible = 0;
        player.onGround = false;
        player.respawnTimer = 0;
        healthSpan.textContent = player.health;
        player.w = Math.min(60, w * 0.07);
        player.h = Math.min(80, h * 0.13);
    }

    switch(level) {
        case 1: loadLevel1(); break;
        case 2: loadLevel2(); break;
        case 3: loadLevel3(); break;
        case 4: loadLevel4(); break;
        case 5: loadLevel5(); break;
    }

    enemiesRequired = enemies.length;
    currentLevel = level;
    gameRunning = true;
    gameOverShown = false;
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('victoryScreen').classList.add('hidden');
    mainMenu.classList.add('hidden');
    instructionsScreen.classList.add('hidden');
    
    if (!soundManager.musicPlaying) {
        soundManager.playMusic();
    }
}

function loadLevel1() {
    const w = W(), h = H();
    player.x = w*0.07;
    player.y = h*0.58;
    
    platforms.push({x: w*0.06, y: h*0.67, w: w*0.17, h: h*0.027});
    platforms.push({x: w*0.39, y: h*0.67, w: w*0.17, h: h*0.027});
    platforms.push({x: w*0.67, y: h*0.67, w: w*0.17, h: h*0.027});
    platforms.push({x: w*0.39, y: h*0.47, w: w*0.17, h: h*0.027});
    platforms.push({x: w*0.67, y: h*0.47, w: w*0.17, h: h*0.027});
    platforms.push({x: w*0.22, y: h*0.30, w: w*0.17, h: h*0.027});
    platforms.push({x: w*0.61, y: h*0.30, w: w*0.17, h: h*0.027});
    
    enemies.push(new Enemy(w*0.44, h*0.58, 'terrestre'));
    enemies.push(new Enemy(w*0.72, h*0.58, 'terrestre'));
    enemies.push(new Enemy(w*0.44, h*0.38, 'terrestre'));
    enemies.push(new Enemy(w*0.72, h*0.38, 'terrestre'));
    enemies.push(new Enemy(w*0.28, h*0.22, 'libelula'));
}

function loadLevel2() {
    const w = W(), h = H();
    player.x = w*0.25;
    player.y = h*0.22;
    
    platforms.push({x: w*0.06, y: h*0.67, w: w*0.17, h: h*0.027});
    platforms.push({x: w*0.39, y: h*0.67, w: w*0.17, h: h*0.027});
    platforms.push({x: w*0.67, y: h*0.67, w: w*0.17, h: h*0.027});
    platforms.push({x: w*0.39, y: h*0.47, w: w*0.17, h: h*0.027});
    platforms.push({x: w*0.67, y: h*0.47, w: w*0.17, h: h*0.027});
    platforms.push({x: w*0.22, y: h*0.30, w: w*0.17, h: h*0.027});
    platforms.push({x: w*0.56, y: h*0.30, w: w*0.17, h: h*0.027});
    
    spikes.push({x: w*0.22, y: h*0.64, w: 18, h: 18, dir: 'up'});
    spikes.push({x: w*0.44, y: h*0.64, w: 18, h: 18, dir: 'up'});
    spikes.push({x: w*0.67, y: h*0.64, w: 18, h: 18, dir: 'up'});
    spikes.push({x: w*0.44, y: h*0.44, w: 18, h: 18, dir: 'up'});
    spikes.push({x: w*0.72, y: h*0.44, w: 18, h: 18, dir: 'up'});
    
    enemies.push(new Enemy(w*0.44, h*0.58, 'terrestre'));
    enemies.push(new Enemy(w*0.72, h*0.58, 'terrestre'));
    enemies.push(new Enemy(w*0.61, h*0.22, 'libelula'));
    enemies.push(new Enemy(w*0.44, h*0.17, 'libelula'));
    enemies.push(new Enemy(w*0.72, h*0.22, 'libelula'));
}

function loadLevel3() {
    const w = W(), h = H();
    player.x = w*0.13;
    player.y = h*0.2;
    
    let margin = Math.min(w, h) * 0.05;
    let roomW = w - margin * 2;
    let roomH = h - margin * 2;
    
    platforms.push({x: margin, y: margin, w: roomW, h: h*0.027});
    platforms.push({x: margin, y: margin + roomH - h*0.027, w: roomW, h: h*0.027});
    platforms.push({x: margin, y: margin, w: w*0.018, h: roomH});
    platforms.push({x: margin + roomW - w*0.018, y: margin, w: w*0.018, h: roomH});
    
    waterZones.push({x: 0, y: 0, w: w, h: h});
    
    for (let i = margin + 25; i < margin + roomW - 25; i += 35) {
        spikes.push({x: i, y: margin + h*0.027, w: 18, h: 18, dir: 'down', bg: 'water'});
    }
    for (let i = margin + 25; i < margin + roomW - 25; i += 35) {
        spikes.push({x: i, y: margin + roomH - h*0.027 - 18, w: 18, h: 18, dir: 'up', bg: 'water'});
    }
    for (let i = margin + 30; i < margin + roomH - 30; i += 35) {
        spikes.push({x: margin + w*0.018, y: i, w: 18, h: 18, dir: 'right', bg: 'water'});
    }
    for (let i = margin + 30; i < margin + roomH - 30; i += 35) {
        spikes.push({x: margin + roomW - w*0.018 - 18, y: i, w: 18, h: 18, dir: 'left', bg: 'water'});
    }
    
    let sharkPositions = [
        {x: margin + roomW - w*0.17, y: margin + h*0.13},
        {x: margin + roomW - w*0.09, y: margin + h*0.25},
        {x: margin + w*0.11, y: margin + roomH - h*0.17},
        {x: margin + w*0.28, y: margin + roomH - h*0.10},
        {x: margin + roomW - w*0.22, y: margin + roomH - h*0.20},
        {x: margin + roomW - w*0.11, y: margin + h*0.10}
    ];
    
    for (let pos of sharkPositions) {
        enemies.push(new Enemy(pos.x, pos.y, 'tiburon'));
    }
}

function loadLevel4() {
    const w = W(), h = H();
    player.x = w*0.35;
    player.y = h*0.55;
    
    waterZones.push({x: 0, y: h*0.5, w: w, h: h*0.5});
    
    platforms.push({x: w*0.25, y: h*0.47, w: w*0.30, h: h*0.027});
    platforms.push({x: w*0.03, y: h*0.58, w: w*0.15, h: h*0.027});
    platforms.push({x: w*0.70, y: h*0.58, w: w*0.15, h: h*0.027});
    platforms.push({x: w*0.85, y: h*0.58, w: w*0.12, h: h*0.027});
    platforms.push({x: w*0.10, y: h*0.37, w: w*0.17, h: h*0.027});
    platforms.push({x: w*0.60, y: h*0.37, w: w*0.17, h: h*0.027});
    platforms.push({x: w*0.20, y: h*0.22, w: w*0.17, h: h*0.027});
    platforms.push({x: w*0.45, y: h*0.22, w: w*0.17, h: h*0.027});
    platforms.push({x: w*0.70, y: h*0.22, w: w*0.17, h: h*0.027});
    
    enemies.push(new Enemy(w*0.17, h - h*0.13, 'tiburon'));
    enemies.push(new Enemy(w*0.67, h - h*0.10, 'tiburon'));
    enemies.push(new Enemy(w*0.28, h*0.30, 'libelula'));
    enemies.push(new Enemy(w*0.50, h*0.18, 'libelula'));
    enemies.push(new Enemy(w*0.78, h*0.30, 'libelula'));
    enemies.push(new Enemy(w*0.35, h*0.42, 'terrestre'));
}

function loadLevel5() {
    const w = W(), h = H();
    let margin = Math.min(w, h) * 0.06;
    let roomW = w - margin * 2;
    let roomH = h - margin * 2 - h*0.07;
    
    platforms.push({x: margin, y: margin, w: roomW, h: h*0.027});
    platforms.push({x: margin, y: margin + roomH, w: roomW, h: h*0.027});
    platforms.push({x: margin, y: margin, w: w*0.018, h: roomH + h*0.027});
    platforms.push({x: margin + roomW - w*0.018, y: margin, w: w*0.018, h: roomH + h*0.027});
    
    player.x = margin + w*0.07;
    player.y = margin + roomH/2 - h*0.07;
    
    let boss = new Enemy(margin + roomW - w*0.13, margin + roomH/2 - h*0.09, 'jefe', true);
    enemies.push(boss);
}