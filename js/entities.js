// entities.js
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = Math.min(60, W() * 0.07);
        this.h = Math.min(80, H() * 0.13);
        this.vx = 0;
        this.vy = 0;
        this.speed = 5;
        this.jumpPower = -16;
        this.gravity = 0.32;
        this.onGround = false;
        this.health = 10;
        this.maxHealth = 10;
        this.direction = 1;
        this.shootCooldown = 0;
        this.invincible = 0;
        this.inWater = false;
        this.waterSpeed = 3.5;
        this.respawnTimer = 0;
        this.jumpSoundCooldown = 0;
    }

    update() {
        const w = W(), h = H();
        if (this.respawnTimer > 0) {
            this.respawnTimer--;
            if (this.respawnTimer === 0) {
                let pos = getSafePos(currentLevel);
                this.x = pos.x;
                this.y = pos.y;
                this.vx = 0;
                this.vy = 0;
                this.invincible = 60;
                healthSpan.textContent = this.health;
            }
            return;
        }

        if (this.y > h + 100) {
            this.health--;
            if (this.health <= 0) {
                this.health = 0;
                healthSpan.textContent = 0;
                gameOver();
                return;
            }
            healthSpan.textContent = this.health;
            this.respawnTimer = 30;
            return;
        }

        this.inWater = false;
        for (let w of waterZones) {
            if (this.x + this.w > w.x && this.x < w.x + w.w &&
                this.y + this.h > w.y && this.y < w.y + w.h) {
                this.inWater = true;
                break;
            }
        }

        let speed = this.inWater ? this.waterSpeed : this.speed;

        if (keys['ArrowLeft']) { this.vx = -speed; this.direction = -1; }
        else if (keys['ArrowRight']) { this.vx = speed; this.direction = 1; }
        else { this.vx *= 0.85; if (Math.abs(this.vx) < 0.1) this.vx = 0; }

        if (this.inWater) {
            if (keys['ArrowUp']) { this.vy = -speed; }
            else if (keys['ArrowDown']) { this.vy = speed; }
            else { this.vy *= 0.85; if (Math.abs(this.vy) < 0.1) this.vy = 0; }
            this.vy += 0.02;
        } else {
            if (keys['ArrowUp'] && this.onGround) {
                this.vy = this.jumpPower;
                this.onGround = false;
                if (this.jumpSoundCooldown <= 0) {
                    soundManager.play('jump');
                    this.jumpSoundCooldown = 15;
                }
            }
            this.vy += this.gravity;
            if (this.vy > 12) this.vy = 12;
        }

        if (this.jumpSoundCooldown > 0) this.jumpSoundCooldown--;

        this.x += this.vx;
        this.y += this.vy;

        this.onGround = false;
        for (let p of platforms) {
            if (this.x + this.w > p.x && this.x < p.x + p.w &&
                this.y + this.h > p.y && this.y < p.y + p.h) {
                const overlapX = Math.min(this.x + this.w - p.x, p.x + p.w - this.x);
                const overlapY = Math.min(this.y + this.h - p.y, p.y + p.h - this.y);
                if (overlapX < overlapY) {
                    if (this.x < p.x) this.x = p.x - this.w;
                    else this.x = p.x + p.w;
                    this.vx = 0;
                } else {
                    if (this.y < p.y) {
                        this.y = p.y - this.h;
                        this.vy = 0;
                        if (!this.inWater) this.onGround = true;
                    } else {
                        this.y = p.y + p.h;
                        this.vy = 0;
                    }
                }
            }
        }

        if (this.x < 0) this.x = 0;
        if (this.x + this.w > w) this.x = w - this.w;
        if (this.y < 0) { this.y = 0; this.vy = 0; }

        if (this.shootCooldown > 0) this.shootCooldown--;
        if (this.invincible > 0) this.invincible--;
        healthSpan.textContent = this.health;

        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            const eb = enemyBullets[i];
            if (eb.active && this.x < eb.x + eb.w && this.x + this.w > eb.x &&
                this.y < eb.y + eb.h && this.y + this.h > eb.y) {
                this.takeDamage(1);
                eb.active = false;
                enemyBullets.splice(i, 1);
                break;
            }
        }
    }

    shoot() {
        if (this.shootCooldown <= 0 && gameRunning) {
            bullets.push(new Bullet(
                this.x + (this.direction === 1 ? this.w : 0),
                this.y + this.h/2 - 4,
                this.direction
            ));
            this.shootCooldown = 12;
            soundManager.play('shot');
        }
    }

    takeDamage(dmg = 1) {
        if (this.invincible > 0) return;
        this.health -= dmg;
        this.invincible = 30;
        if (this.health <= 0) {
            this.health = 0;
            gameOver();
        }
        healthSpan.textContent = this.health;
    }

    draw() {
        const w = this.w, h = this.h;
        if (this.respawnTimer > 0) ctx.globalAlpha = 0.3;
        if (playerImg.complete && playerImg.naturalWidth > 0) {
            ctx.save();
            if (this.direction === -1) {
                ctx.translate(this.x + w, this.y);
                ctx.scale(-1, 1);
                ctx.drawImage(playerImg, 0, 0, w, h);
            } else {
                ctx.drawImage(playerImg, this.x, this.y, w, h);
            }
            ctx.restore();
        } else {
            ctx.fillStyle = '#3498db';
            ctx.fillRect(this.x, this.y, w, h);
        }
        if (this.invincible > 0 && this.invincible % 6 < 3) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillRect(this.x, this.y, w, h);
            ctx.globalAlpha = 1;
        }
        ctx.globalAlpha = 1;
    }
}

class Bullet {
    constructor(x, y, dir) {
        this.x = x;
        this.y = y;
        this.w = 14;
        this.h = 8;
        this.speed = 10 * dir;
        this.dir = dir;
        this.active = true;
        this.trail = [];
    }
    update() {
        this.trail.push({x: this.x, y: this.y});
        if (this.trail.length > 6) this.trail.shift();
        
        let nextX = this.x + this.speed;
        
        for (let p of platforms) {
            if (nextX + this.w > p.x && nextX < p.x + p.w &&
                this.y + this.h > p.y && this.y < p.y + p.h) {
                this.active = false;
                return;
            }
        }
        
        this.x = nextX;
        
        if (this.x < -30 || this.x > W() + 30) this.active = false;

        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            if (e.active && this.x < e.x + e.w && this.x + this.w > e.x &&
                this.y < e.y + e.h && this.y + this.h > e.y) {
                e.takeDamage(1);
                this.active = false;
                break;
            }
        }
    }
    draw() {
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = i / this.trail.length * 0.5;
            ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
            ctx.fillRect(this.trail[i].x - 2, this.trail[i].y, 4, 4);
        }
        ctx.fillStyle = '#ffdd00';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffdd00';
        ctx.beginPath();
        if (this.dir === 1) {
            ctx.moveTo(this.x + this.w, this.y + this.h/2);
            ctx.lineTo(this.x, this.y);
            ctx.lineTo(this.x, this.y + this.h);
        } else {
            ctx.moveTo(this.x, this.y + this.h/2);
            ctx.lineTo(this.x + this.w, this.y);
            ctx.lineTo(this.x + this.w, this.y + this.h);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

class EnemyBullet {
    constructor(x, y, targetX, targetY) {
        this.x = x;
        this.y = y;
        this.w = 16;
        this.h = 16;
        this.speed = 4;
        this.active = true;
        this.trail = [];
        
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > 0) {
            this.vx = (dx / dist) * this.speed;
            this.vy = (dy / dist) * this.speed;
        } else {
            this.vx = 0;
            this.vy = this.speed;
        }
    }
    update() {
        this.trail.push({x: this.x, y: this.y});
        if (this.trail.length > 8) this.trail.shift();
        
        this.x += this.vx;
        this.y += this.vy;
        
        for (let p of platforms) {
            if (this.x + this.w > p.x && this.x < p.x + p.w &&
                this.y + this.h > p.y && this.y < p.y + p.h) {
                this.active = false;
                return;
            }
        }
        
        if (this.x < -50 || this.x > W() + 50 || this.y < -50 || this.y > H() + 50) {
            this.active = false;
        }
    }
    draw() {
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = i / this.trail.length * 0.4;
            ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
            const size = 4 + (i / this.trail.length) * 4;
            ctx.fillRect(this.trail[i].x - size/2, this.trail[i].y - size/2, size, size);
        }
        
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff0000';
        ctx.fillStyle = '#ff2200';
        ctx.beginPath();
        ctx.arc(this.x + this.w/2, this.y + this.h/2, this.w/2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.arc(this.x + this.w/2, this.y + this.h/2, this.w/4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

class Enemy {
    constructor(x, y, type, isBoss = false) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.isBoss = isBoss;
        this.active = true;
        this.hitTimer = 0;
        this.direction = 1;
        this.hitCount = 0;
        this.shootTimer = 0;

        const w = W(), h = H();
        switch(type) {
            case 'terrestre':
                this.w = Math.min(60, w * 0.06);
                this.h = Math.min(40, h * 0.08);
                this.maxHealth = 3;
                this.speed = 1;
                this.gravity = 0.3;
                this.vx = 0; this.vy = 0;
                this.onGround = false;
                break;
            case 'tiburon':
                this.w = Math.min(70, w * 0.08);
                this.h = Math.min(40, h * 0.07);
                this.maxHealth = 3;
                this.speed = 0.8;
                this.gravity = 0;
                this.vx = 0; this.vy = 0;
                this.onGround = false;
                break;
            case 'libelula':
                this.w = Math.min(40, w * 0.05);
                this.h = Math.min(40, h * 0.07);
                this.maxHealth = 3;
                this.speed = 1.0;
                this.gravity = 0;
                this.vx = 0; this.vy = 0;
                this.onGround = false;
                this.patternTimer = 0;
                break;
            case 'jefe':
                this.w = Math.min(210, w * 0.1);
                this.h = Math.min(140, h * 0.18);
                this.maxHealth = 10;
                this.speed = 1.5;
                this.gravity = 0.3;
                this.vx = 0; this.vy = 0;
                this.onGround = false;
                this.chargeTimer = 0;
                this.charging = false;
                this.jumpTimer = 0;
                break;
        }
        this.health = this.maxHealth;
    }

    takeDamage(dmg) {
        this.health -= dmg;
        this.hitCount++;
        this.hitTimer = 10;
        if (this.health <= 0) {
            this.active = false;
            levelEnemiesDefeated++;
            if (this.isBoss) bossDefeated = true;
        }
    }

    update() {
        const h = H();
        if (!this.active) return;
        if (this.hitTimer > 0) this.hitTimer--;

        if (this.y > h + 100) {
            this.active = false;
            levelEnemiesDefeated++;
            return;
        }

        switch(this.type) {
            case 'terrestre': this.updateTerrestre(); break;
            case 'tiburon': this.updateTiburon(); break;
            case 'libelula': this.updateLibelula(); break;
            case 'jefe': this.updateJefe(); break;
        }

        if (player && player.health > 0 &&
            this.x < player.x + player.w && this.x + this.w > player.x &&
            this.y < player.y + player.h && this.y + this.h > player.y) {
            player.takeDamage(1);
            if (this.x < player.x) player.x = this.x + this.w;
            else player.x = this.x - player.w;
        }

        if (this.type !== 'tiburon' && (this.x < -100 || this.x > W() + 100 || this.y > h + 100)) {
            this.active = false;
            levelEnemiesDefeated++;
        }
        
        if (this.type === 'tiburon') {
            let inWater = false;
            for (let w of waterZones) {
                if (this.x + this.w > w.x && this.x < w.x + w.w &&
                    this.y + this.h > w.y && this.y < w.y + w.h) {
                    inWater = true;
                    break;
                }
            }
            if (!inWater) {
                this.active = false;
                levelEnemiesDefeated++;
            }
        }
        
        if (this.type === 'terrestre') {
            let inWater = false;
            for (let w of waterZones) {
                if (this.x + this.w > w.x && this.x < w.x + w.w &&
                    this.y + this.h > w.y && this.y < w.y + w.h) {
                    inWater = true;
                    break;
                }
            }
            if (inWater) {
                this.active = false;
                levelEnemiesDefeated++;
            }
        }
    }

    updateTerrestre() {
        const dx = player ? player.x - this.x : 0;
        const dy = player ? player.y - this.y : 0;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 350) {
            this.direction = dx > 0 ? 1 : -1;
            this.vx = this.direction * this.speed;
            if (this.onGround && dy < -30 && Math.random() < 0.005) {
                this.vy = -5;
                this.onGround = false;
            }
        } else {
            this.vx *= 0.9;
        }
        this.vy += this.gravity;
        if (this.vy > 10) this.vy = 10;
        this.x += this.vx;
        this.y += this.vy;
        this.onGround = false;
        for (let p of platforms) {
            if (this.x + this.w > p.x && this.x < p.x + p.w &&
                this.y + this.h > p.y && this.y < p.y + p.h) {
                const overlapX = Math.min(this.x + this.w - p.x, p.x + p.w - this.x);
                const overlapY = Math.min(this.y + this.h - p.y, p.y + p.h - this.y);
                if (overlapX < overlapY) {
                    if (this.x < p.x) this.x = p.x - this.w;
                    else this.x = p.x + p.w;
                    this.vx = 0;
                } else {
                    if (this.y < p.y) {
                        this.y = p.y - this.h;
                        this.vy = 0;
                        this.onGround = true;
                    } else {
                        this.y = p.y + p.h;
                        this.vy = 0;
                    }
                }
            }
        }
    }

    updateTiburon() {
        if (player) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 400) {
                this.direction = dx > 0 ? 1 : -1;
                if (Math.abs(dx) > 10) this.vx = this.direction * this.speed;
                else this.vx *= 0.9;
                if (Math.abs(dy) > 10) {
                    if (dy < 0) this.vy = -this.speed * 0.8;
                    else this.vy = this.speed * 0.8;
                } else {
                    this.vy *= 0.9;
                }
            } else {
                this.vx *= 0.9;
                this.vy *= 0.9;
            }
        }
        this.x += this.vx;
        this.y += this.vy;

        for (let p of platforms) {
            if (this.x + this.w > p.x && this.x < p.x + p.w &&
                this.y + this.h > p.y && this.y < p.y + p.h) {
                const overlapX = Math.min(this.x + this.w - p.x, p.x + p.w - this.x);
                const overlapY = Math.min(this.y + this.h - p.y, p.y + p.h - this.y);
                if (overlapX < overlapY) {
                    if (this.x < p.x) this.x = p.x - this.w;
                    else this.x = p.x + p.w;
                    this.vx *= -0.5;
                } else {
                    if (this.y < p.y) this.y = p.y - this.h;
                    else this.y = p.y + p.h;
                    this.vy *= -0.5;
                }
            }
        }

        let inWater = false;
        for (let w of waterZones) {
            if (this.x + this.w > w.x && this.x < w.x + w.w &&
                this.y + this.h > w.y && this.y < w.y + w.h) {
                inWater = true;
                if (this.x < w.x) { this.x = w.x; this.vx *= -0.5; }
                if (this.x + this.w > w.x + w.w) { this.x = w.x + w.w - this.w; this.vx *= -0.5; }
                if (this.y < w.y) { this.y = w.y; this.vy *= -0.5; }
                if (this.y + this.h > w.y + w.h) { this.y = w.y + w.h - this.h; this.vy *= -0.5; }
                break;
            }
        }
        if (!inWater) {
            this.active = false;
            levelEnemiesDefeated++;
        }
    }

    updateLibelula() {
        this.patternTimer++;
        const dx = player ? player.x - this.x : 0;
        const dy = player ? player.y - this.y : 0;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 300) {
            this.direction = dx > 0 ? 1 : -1;
            this.vx = this.direction * this.speed * 0.8;
            if (Math.abs(dy) > 20) {
                this.vy = (dy > 0 ? 1 : -1) * this.speed * 0.6;
            } else {
                this.vy *= 0.9;
            }
        } else {
            if (this.patternTimer % 60 === 0) {
                this.vx = (Math.random() - 0.5) * this.speed * 2;
                this.vy = (Math.random() - 0.5) * this.speed * 1.5;
            }
        }
        this.x += this.vx;
        this.y += this.vy;

        for (let p of platforms) {
            if (this.x + this.w > p.x && this.x < p.x + p.w &&
                this.y + this.h > p.y && this.y < p.y + p.h) {
                const overlapX = Math.min(this.x + this.w - p.x, p.x + p.w - this.x);
                const overlapY = Math.min(this.y + this.h - p.y, p.y + p.h - this.y);
                if (overlapX < overlapY) {
                    if (this.x < p.x) this.x = p.x - this.w;
                    else this.x = p.x + p.w;
                    this.vx *= -0.5;
                } else {
                    if (this.y < p.y) this.y = p.y - this.h;
                    else this.y = p.y + p.h;
                    this.vy *= -0.5;
                }
            }
        }

        if (this.x < 0) { this.x = 0; this.vx *= -0.5; }
        if (this.x + this.w > W()) { this.x = W() - this.w; this.vx *= -0.5; }
        if (this.y < 0) { this.y = 0; this.vy *= -0.5; }
        if (this.y + this.h > H()) { this.y = H() - this.h; this.vy *= -0.5; }

        let inWater = false;
        for (let w of waterZones) {
            if (this.x + this.w > w.x && this.x < w.x + w.w &&
                this.y + this.h > w.y && this.y < w.y + w.h) {
                inWater = true;
                break;
            }
        }
        if (inWater) {
            this.active = false;
            levelEnemiesDefeated++;
        }
    }

    updateJefe() {
        if (!player) return;
        
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        this.chargeTimer++;
        this.jumpTimer++;
        this.shootTimer++;
        
        if (this.shootTimer > 40 && this.active) {
            this.shootTimer = 0;
            const targetX = player.x + player.w/2;
            const targetY = player.y + player.h/2;
            enemyBullets.push(new EnemyBullet(
                this.x + this.w/2 - 8,
                this.y + this.h/2 - 8,
                targetX, targetY
            ));
        }
        
        if (this.jumpTimer > 20 && this.onGround && (dy < -50 || dist > 200)) {
            this.vy = -12;
            this.jumpTimer = 0;
        }
        
        this.direction = dx > 0 ? 1 : -1;
        
        if (dist < 500) {
            if (Math.abs(dx) > 20) {
                this.vx = this.direction * this.speed;
            } else {
                this.vx *= 0.9;
            }
            if (dist > 300) {
                this.vx = this.direction * this.speed * 1.3;
            }
        } else {
            this.vx *= 0.9;
        }
        
        this.vy += this.gravity;
        if (this.vy > 12) this.vy = 12;
        
        this.x += this.vx;
        this.y += this.vy;
        
        this.onGround = false;
        for (let p of platforms) {
            if (this.x + this.w > p.x && this.x < p.x + p.w &&
                this.y + this.h > p.y && this.y < p.y + p.h) {
                const overlapX = Math.min(this.x + this.w - p.x, p.x + p.w - this.x);
                const overlapY = Math.min(this.y + this.h - p.y, p.y + p.h - this.y);
                if (overlapX < overlapY) {
                    if (this.x < p.x) this.x = p.x - this.w;
                    else this.x = p.x + p.w;
                    this.vx *= -0.3;
                } else {
                    if (this.y < p.y) {
                        this.y = p.y - this.h;
                        this.vy = 0;
                        this.onGround = true;
                    } else {
                        this.y = p.y + p.h;
                        this.vy = 0;
                    }
                }
            }
        }
        
        if (this.x < 0) { this.x = 0; this.vx *= -0.5; }
        if (this.x + this.w > W()) { this.x = W() - this.w; this.vx *= -0.5; }
        if (this.y < 0) { this.y = 0; this.vy = 0; }
        if (this.y + this.h > H()) { this.y = H() - this.h; this.vy = 0; this.onGround = true; }
    }

    draw() {
        if (!this.active) return;
        let img = null;
        switch(this.type) {
            case 'terrestre': img = enemyImg; break;
            case 'tiburon': img = sharkImg; break;
            case 'libelula': img = libelulaImg; break;
            case 'jefe': img = bossImg; break;
        }
        if (img && img.complete && img.naturalWidth > 0) {
            ctx.save();
            if (this.direction === -1) {
                ctx.translate(this.x + this.w, this.y);
                ctx.scale(-1, 1);
                ctx.drawImage(img, 0, 0, this.w, this.h);
            } else {
                ctx.drawImage(img, this.x, this.y, this.w, this.h);
            }
            ctx.restore();
        } else {
            ctx.fillStyle = this.isBoss ? '#9b59b6' : '#e74c3c';
            ctx.fillRect(this.x, this.y, this.w, this.h);
        }

        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(this.x, this.y - 14, this.w, 8);
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(this.x + 2, this.y - 12, (this.w - 4) * (this.health / this.maxHealth), 4);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y - 14, this.w, 8);

        if (this.hitTimer > 0) {
            ctx.globalAlpha = 0.6;
            ctx.fillStyle = 'white';
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.globalAlpha = 1;
        }
    }
}

class DiamondItem {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 24;
        this.h = 24;
        this.active = true;
        this.life = 300;
        this.vy = -1.5;
        this.gravity = 0.15;
        this.angle = 0;
    }
    update() {
        this.life--;
        if (this.life <= 0) this.active = false;
        this.angle += 0.03;
        this.vy += this.gravity;
        this.y += this.vy;
        for (let p of platforms) {
            if (this.x + this.w > p.x && this.x < p.x + p.w &&
                this.y + this.h > p.y && this.y < p.y + p.h) {
                this.y = p.y - this.h;
                this.vy = 0;
            }
        }
        if (player && this.active &&
            this.x < player.x + player.w && this.x + this.w > player.x &&
            this.y < player.y + player.h && this.y + this.h > player.y) {
            this.active = false;
            diamondSpan.textContent = parseInt(diamondSpan.textContent) + 1;
        }
    }
    draw() {
        if (!this.active) return;
        ctx.save();
        ctx.translate(this.x + this.w/2, this.y + this.h/2);
        ctx.rotate(this.angle);
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#2ecc71';
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.moveTo(0, -this.h/2);
        ctx.lineTo(this.w/2, 0);
        ctx.lineTo(0, this.h/2);
        ctx.lineTo(-this.w/2, 0);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.moveTo(0, -this.h/3);
        ctx.lineTo(this.w/4, 0);
        ctx.lineTo(0, this.h/4);
        ctx.lineTo(-this.w/4, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}