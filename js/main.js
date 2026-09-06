// main.js
// Funciones de dibujo de fondos y plataformas
function drawWaterBackground(x, y, w, h) {
    let grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, '#0a3d6b');
    grad.addColorStop(0.5, '#0d4e7a');
    grad.addColorStop(1, '#0a2d4a');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
    
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    for (let i = 0; i < 8; i++) {
        let wx = x + (i * 55 + frameCount * 0.3) % (w + 60) - 30;
        let wy = y + 15 + i * 12 + Math.sin(frameCount * 0.02 + i * 0.5) * 4;
        ctx.fillRect(wx, wy, 35, 3);
    }
    
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i < 5; i++) {
        let bx = x + 20 + (i * 80 + frameCount * 0.4) % (w - 40);
        let by = y + 30 + (i * 60 + Math.sin(i * 2 + frameCount * 0.02) * 25) % (h - 60);
        ctx.beginPath();
        ctx.arc(bx, by, 2 + Math.sin(frameCount * 0.03 + i) * 1, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawSkyBackground(x, y, w, h) {
    let grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, '#4fc3f7');
    grad.addColorStop(0.4, '#81d4fa');
    grad.addColorStop(0.7, '#b3e5fc');
    grad.addColorStop(1, '#d4edf8');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
    
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    for (let i = 0; i < 4; i++) {
        let cx = x + 40 + (i * 130 + frameCount * 0.15) % (w - 80);
        let cy = y + 25 + i * 28 + Math.sin(i * 1.5) * 10;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 55 + Math.sin(i) * 20, 14 + Math.cos(i) * 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 32, cy - 12, 42 + Math.cos(i) * 15, 11 + Math.sin(i) * 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx - 28, cy + 8, 38 + Math.sin(i * 2) * 12, 10 + Math.cos(i * 1.5) * 4, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawPlatformTexture(x, y, w, h) {
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(x, y, w, 4);
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(x, y + h - 2, w, 2);
}

// Lógica de actualización
function update() {
    if (!gameRunning || !player) return;
    frameCount++;

    player.update();

    if (keys[' '] || keys['Space']) {
        player.shoot();
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update();
        if (!bullets[i].active) bullets.splice(i, 1);
    }

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBullets[i].update();
        if (!enemyBullets[i].active) {
            enemyBullets.splice(i, 1);
        }
    }

    for (let e of enemies) {
        e.update();
    }
    enemies = enemies.filter(e => e.active);

    for (let i = diamondItems.length - 1; i >= 0; i--) {
        diamondItems[i].update();
        if (!diamondItems[i].active) diamondItems.splice(i, 1);
    }

    if (frameCount % 150 === 0 && Math.random() < 0.3) {
        let x = 40 + Math.random() * (W() - 80);
        let y = 40 + Math.random() * (H() - 80);
        diamondItems.push(new DiamondItem(x, y));
    }

    if (enemies.length === 0 && levelEnemiesDefeated >= enemiesRequired && enemiesRequired > 0) {
        if (currentLevel === 5) {
            victory();
        } else {
            currentLevel++;
            loadLevel(currentLevel);
        }
    }

    for (let s of spikes) {
        if (player.health > 0 && player.respawnTimer === 0 &&
            player.x < s.x + s.w && player.x + player.w > s.x &&
            player.y < s.y + s.h && player.y + player.h > s.y) {
            player.takeDamage(1);
            if (player.x < s.x) player.x = s.x - player.w;
            else player.x = s.x + s.w;
        }
    }
}

// Dibujo
function draw() {
    const w = W(), h = H();
    ctx.clearRect(0, 0, w, h);

    let hasFullWater = false;
    for (let wz of waterZones) {
        if (wz.x === 0 && wz.y === 0 && wz.w === w && wz.h === h) hasFullWater = true;
    }
    
    if (hasFullWater) {
        drawWaterBackground(0, 0, w, h);
    } else {
        drawSkyBackground(0, 0, w, h);
    }

    for (let wz of waterZones) {
        if (!(wz.x === 0 && wz.y === 0 && wz.w === w && wz.h === h)) {
            drawWaterBackground(wz.x, wz.y, wz.w, wz.h);
        }
    }

    for (let p of platforms) {
        drawPlatformTexture(p.x, p.y, p.w, p.h);
    }

    for (let s of spikes) {
        let cx = s.x + s.w/2;
        let cy = s.y + s.h/2;
        
        if (s.bg === 'water') {
            ctx.fillStyle = '#0a3d6b';
            ctx.fillRect(s.x, s.y, s.w, s.h);
        }
        
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        switch(s.dir) {
            case 'up':
                ctx.moveTo(s.x, s.y + s.h);
                ctx.lineTo(cx, s.y);
                ctx.lineTo(s.x + s.w, s.y + s.h);
                break;
            case 'down':
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(cx, s.y + s.h);
                ctx.lineTo(s.x + s.w, s.y);
                break;
            case 'left':
                ctx.moveTo(s.x + s.w, s.y);
                ctx.lineTo(s.x, cy);
                ctx.lineTo(s.x + s.w, s.y + s.h);
                break;
            case 'right':
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(s.x + s.w, cy);
                ctx.lineTo(s.x, s.y + s.h);
                break;
            default:
                ctx.moveTo(s.x, s.y + s.h);
                ctx.lineTo(cx, s.y);
                ctx.lineTo(s.x + s.w, s.y + s.h);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    for (let d of diamondItems) d.draw();
    for (let b of bullets) b.draw();
    for (let eb of enemyBullets) eb.draw();
    for (let e of enemies) e.draw();
    if (player) player.draw();

    ctx.fillStyle = 'white';
    ctx.font = `bold ${Math.min(22, w*0.025)}px Arial`;
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.fillText(`Nivel ${currentLevel}`, 15, 40);
    ctx.font = `bold ${Math.min(18, w*0.02)}px Arial`;
    ctx.fillText(`Enemigos: ${levelEnemiesDefeated}/${enemiesRequired}`, 15, 70);
    ctx.shadowBlur = 0;
}

// Estados del juego
function gameOver() {
    gameRunning = false;
    gameOverShown = true;
    soundManager.stopMusic();
    soundManager.play('defeat');
    gameOverScreen.classList.remove('hidden');
}

function victory() {
    gameRunning = false;
    soundManager.stopMusic();
    soundManager.play('victory');
    victoryScreen.classList.remove('hidden');
}

function restartGame() {
    const w = W(), h = H();
    player = new Player(w*0.1, h*0.5);
    player.health = 10;
    healthSpan.textContent = 10;
    currentLevel = 1;
    diamondSpan.textContent = '0';
    loadLevel(1);
    gameOverScreen.classList.add('hidden');
    victoryScreen.classList.add('hidden');
    mainMenu.classList.add('hidden');
}

// Carga de sonidos
async function loadAllSounds() {
    const soundFiles = {
        'shot': 'audio/shot.m4a',
        'jump': 'audio/jump.mp3',
        'victory': 'audio/victory.m4a',
        'defeat': 'audio/defeat.m4a'
    };
    
    for (const [name, file] of Object.entries(soundFiles)) {
        await soundManager.loadSound(name, file);
    }
    
    await soundManager.loadMusic('audio/music.mp3');
}

// Inicialización
async function initGame() {
    soundManager = new SoundManager();
    await loadAllSounds();
    console.log('✅ Sonidos cargados correctamente');
    gameLoop();
}

// Bucle principal
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Eventos de teclado
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ' || e.key === 'Space') e.preventDefault();
});
document.addEventListener('keyup', (e) => { keys[e.key] = false; });

// Eventos de botones
document.getElementById('playBtn').addEventListener('click', () => {
    const w = W(), h = H();
    player = new Player(w*0.1, h*0.5);
    player.health = 10;
    healthSpan.textContent = 10;
    currentLevel = 1;
    diamondSpan.textContent = '0';
    loadLevel(1);
});

document.getElementById('instructionsBtn').addEventListener('click', () => {
    mainMenu.classList.add('hidden');
    instructionsScreen.classList.remove('hidden');
});
document.getElementById('backFromInstructions').addEventListener('click', () => {
    instructionsScreen.classList.add('hidden');
    mainMenu.classList.remove('hidden');
});

document.getElementById('restartBtn').addEventListener('click', restartGame);
document.getElementById('winRestartBtn').addEventListener('click', () => {
    victoryScreen.classList.add('hidden');
    restartGame();
});

// Arrancar el juego
initGame();

console.log('🎮 Juego listo. Asegúrate de tener:');
console.log('📁 images/ - personaje.png, enemigo.png, jefe.png, tiburon.png, libelula.png');
console.log('📁 audio/ - music.mp3, shot.m4a, jump.mp3, victory.m4a, defeat.m4a');