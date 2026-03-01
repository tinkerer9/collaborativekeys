const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const zombieImg = new Image();
zombieImg.src = "zombiePlayer.png";

function resizeCanvas() {
 canvas.width = window.innerWidth;
 canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let gameOver = false;
let gameWon = false;

const zombies = [];
let zombiesKilled = 0;
const zombiesToWin = 30;

const bullets = [];

const player = {
 x: 100,
 y: 300,
 width: 30,
 height: 50,
 color: "red",
 velocityY: 0,
 onGround: false,
 facing: 1,
 reloadTime: 5000,
 lastShootTime: 0,
 animFrame: 0, 
 animTimer: 0
};

const ground = {
 x: 0,
 y: canvas.height - 50,
 width: canvas.width,
 height: 50,
 color: "green"
};

const platform = {
 x: 300,
 y: canvas.height - 200,
 width: 250,
 height: 20,
 color: "beige"
};

const platform2 = {
 x: 800,
 y: canvas.height - 200,
 width: 250,
 height: 20,
 color: "beige"
};

const shootButton = {
 width: 100,
 height: 50
};

const keys = {
 left: false,
 right: false,
 up: false
};

const gravity = 0.6;
const jumpStrength = -14;

document.addEventListener("keydown", (e) => {
 if (e.code === "ArrowLeft") keys.left = true;
 if (e.code === "ArrowRight") keys.right = true;
 if (e.code === "ArrowUp") keys.up = true;
 if (e.code === "Space") shoot();
});

document.addEventListener("keyup", (e) => {
 if (e.code === "ArrowLeft") keys.left = false;
 if (e.code === "ArrowRight") keys.right = false;
 if (e.code === "ArrowUp") keys.up = false;
});

canvas.addEventListener("click", (e) => {
 const rect = canvas.getBoundingClientRect();
 const mouseX = e.clientX - rect.left;
 const mouseY = e.clientY - rect.top;

 if (
 mouseX > canvas.width - shootButton.width - 20 &&
 mouseX < canvas.width - 20 &&
 mouseY > canvas.height - shootButton.height - 20 &&
 mouseY < canvas.height - 20
 ) {
 shoot();
 }
});

function spawnZombiesWave() {
 const amount = Math.floor(Math.random() * 1) + 1;
 let lastX = canvas.width;

 for (let i = 0; i < amount; i++) {
 lastX += 60 + Math.random() * 40;
 zombies.push({
 width: 40,
 height: 50,
 y: ground.y - 50,
 speed: 1.8,
 x: lastX,
 direction: -1,
 animFrame: 0,
 animTimer: 0
 });
 }
}
setInterval(spawnZombiesWave, 2000);

player.shotsFired = 0;
player.lastShootTime = 0;
player.canShoot = true;

function shoot() {
 if (!player.canShoot) return;

 bullets.push({
 x: player.facing === 1 ? player.x + player.width : player.x - 12,
 y: player.y + player.height / 2 - 4,
 width: 12,
 height: 8,
 speed: 8,
 direction: player.facing
 });

 player.shotsFired++;
 if (player.shotsFired >= 2) {
 player.canShoot = false;
 player.lastShootTime = Date.now();
 setTimeout(() => {
 player.shotsFired = 0;
 player.canShoot = true;
 }, player.reloadTime);
 }
}

function drawReloadIndicator() {
 let currentTime = Date.now();
 let timeSinceLastShot = currentTime - player.lastShootTime;
 let reloadProgress = Math.min(timeSinceLastShot / player.reloadTime, 1);

 ctx.strokeStyle = "white";
 ctx.lineWidth = 5;
 ctx.beginPath();
 ctx.arc(player.x + player.width / 2, player.y - 20, 10, -Math.PI / 2, (-Math.PI / 2) + (reloadProgress * 2 * Math.PI));
 ctx.stroke();
}


function drawPlayer(player) {
 const x = player.x;
 const y = player.y;
 const w = player.width; // 30
 const h = player.height; // 50
 const facing = player.facing; // 1 = right, -1 = left

 // Walk cycle animation
 player.animTimer = (player.animTimer || 0) + 1;
 const isMoving = keys.left || keys.right;
 if (isMoving && player.animTimer > 8) {
 player.animFrame = ((player.animFrame || 0) + 1) % 4;
 player.animTimer = 0;
 } else if (!isMoving) {
 player.animFrame = 0;
 }
 const walkCycle = [0, 3, 0, -3];
 const legSwing = walkCycle[player.animFrame || 0];
 const bodyBob = isMoving ? [0, -1, 0, 1][player.animFrame || 0] : 0;

 ctx.save();

 // ── Proportions ──────────────────────────────────────────
 const cx = x + w / 2; // center x
 const headR = w * 0.55; // head radius
 const headCX = cx;
 const headCY = y + headR + bodyBob;

 const bodyTopY = headCY + headR * 0.85;
 const bodyW = w * 0.75;
 const bodyH = h * 0.38;
 const bodyX = cx - bodyW / 2;

 const legTopY = bodyTopY + bodyH;
 const legH = h * 0.28;
 const legW = w * 0.22;
 const armW = w * 0.2;
 const armH = bodyH * 1.0;

 // ── Shadow ───────────────────────────────────────────────
 ctx.fillStyle = "rgba(0,0,0,0.18)";
 ctx.beginPath();
 ctx.ellipse(cx, y + h + 3, w * 0.45, 5, 0, 0, Math.PI * 2);
 ctx.fill();

 // ── Cape (behind body) ───────────────────────────────────
 ctx.fillStyle = "#8b0000";
 ctx.beginPath();
 ctx.moveTo(bodyX + bodyW * 0.1, bodyTopY);
 ctx.lineTo(bodyX - 4, bodyTopY + bodyH * 0.7 + legH * 0.6);
 ctx.lineTo(bodyX + bodyW + 4, bodyTopY + bodyH * 0.7 + legH * 0.6);
 ctx.lineTo(bodyX + bodyW * 0.9, bodyTopY);
 ctx.closePath();
 ctx.fill();
 // Cape shading
 ctx.fillStyle = "#5a0000";
 ctx.beginPath();
 ctx.moveTo(cx - 2, bodyTopY);
 ctx.lineTo(cx - 5, bodyTopY + bodyH * 0.7 + legH * 0.6);
 ctx.lineTo(cx + 5, bodyTopY + bodyH * 0.7 + legH * 0.6);
 ctx.lineTo(cx + 2, bodyTopY);
 ctx.closePath();
 ctx.fill();

 // ── Back arm ─────────────────────────────────────────────
 const backSide = facing === 1 ? -1 : 1;
 const backArmX = cx + backSide * (bodyW * 0.35);
 ctx.save();
 ctx.translate(backArmX, bodyTopY + 3);
 ctx.rotate(facing * (0.3 + legSwing * 0.03));
 // Pauldron (shoulder pad)
 ctx.fillStyle = "#c8c8d8";
 ctx.beginPath();
 ctx.ellipse(0, 0, armW * 0.9, armW * 0.55, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.strokeStyle = "#888899";
 ctx.lineWidth = 1;
 ctx.stroke();
 // Arm
 ctx.fillStyle = "#a8a8b8";
 ctx.fillRect(-armW / 2, 0, armW, armH);
 // Gauntlet
 ctx.fillStyle = "#888898";
 ctx.fillRect(-armW / 2 - 1, armH - armW * 0.7, armW + 2, armW * 0.7);
 ctx.restore();

 // ── Legs ─────────────────────────────────────────────────
 // Left leg
 ctx.save();
 ctx.translate(bodyX + legW * 0.6, legTopY);
 ctx.rotate(facing * (-legSwing * 0.055));
 ctx.fillStyle = "#444455"; // dark armored greave
 ctx.fillRect(-legW / 2, 0, legW, legH);
 // Knee plate
 ctx.fillStyle = "#aaaabc";
 ctx.fillRect(-legW / 2 - 2, legH * 0.35, legW + 4, legH * 0.2);
 // Boot
 ctx.fillStyle = "#2a2a38";
 ctx.fillRect(-legW / 2 - 2, legH - 6, legW + 6, 7);
 ctx.restore();

 // Right leg
 ctx.save();
 ctx.translate(bodyX + bodyW - legW * 0.6, legTopY);
 ctx.rotate(facing * (legSwing * 0.055));
 ctx.fillStyle = "#444455";
 ctx.fillRect(-legW / 2, 0, legW, legH);
 ctx.fillStyle = "#aaaabc";
 ctx.fillRect(-legW / 2 - 2, legH * 0.35, legW + 4, legH * 0.2);
 ctx.fillStyle = "#2a2a38";
 ctx.fillRect(-legW / 2 - 2, legH - 6, legW + 6, 7);
 ctx.restore();

 // ── Body / Chest Plate ───────────────────────────────────
 ctx.fillStyle = "#c0c0d0";
 ctx.beginPath();
 ctx.roundRect(bodyX, bodyTopY, bodyW, bodyH, [4, 4, 6, 6]);
 ctx.fill();
 // Chest plate detail lines
 ctx.strokeStyle = "#888899";
 ctx.lineWidth = 1.5;
 ctx.beginPath();
 ctx.moveTo(cx, bodyTopY + 3);
 ctx.lineTo(cx, bodyTopY + bodyH - 3);
 ctx.stroke();
 // Belly band
 ctx.fillStyle = "#999aaa";
 ctx.fillRect(bodyX, bodyTopY + bodyH * 0.65, bodyW, bodyH * 0.18);

 // ── Red Cross on chest ───────────────────────────────────
 ctx.fillStyle = "#dd0000";
 const crossW = bodyW * 0.22;
 const crossH = bodyH * 0.42;
 const crossCX = cx + (facing === 1 ? bodyW * 0.18 : -bodyW * 0.18);
 const crossCY = bodyTopY + bodyH * 0.28;
 // Vertical bar
 ctx.fillRect(crossCX - crossW * 0.3, crossCY - crossH / 2, crossW * 0.6, crossH);
 // Horizontal bar
 ctx.fillRect(crossCX - crossW / 2, crossCY - crossH * 0.2, crossW, crossH * 0.4);

 // ── Front arm (gun arm) ──────────────────────────────────
 const frontSide = facing;
 const frontArmX = cx + frontSide * (bodyW * 0.35);
 ctx.save();
 ctx.translate(frontArmX, bodyTopY + 3);
 ctx.rotate(facing * (-0.25 - legSwing * 0.03));
 // Pauldron
 ctx.fillStyle = "#d0d0e0";
 ctx.beginPath();
 ctx.ellipse(0, 0, armW * 0.9, armW * 0.55, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.strokeStyle = "#999aaa";
 ctx.lineWidth = 1;
 ctx.stroke();
 // Arm
 ctx.fillStyle = "#b0b0c0";
 ctx.fillRect(-armW / 2, 0, armW, armH);
 // Gauntlet
 ctx.fillStyle = "#909099";
 ctx.fillRect(-armW / 2 - 1, armH - armW * 0.7, armW + 2, armW * 0.7);
 ctx.restore();

 // ── HEAD — Plague Doctor Helmet ──────────────────────────
 // Helmet bowl
 ctx.fillStyle = "#b8b8c8";
 ctx.beginPath();
 ctx.arc(headCX, headCY, headR, Math.PI, 0);
 ctx.rect(headCX - headR, headCY, headR * 2, headR * 0.5);
 ctx.fill();
 // Helmet top ridge
 ctx.fillStyle = "#d0d0e0";
 ctx.beginPath();
 ctx.ellipse(headCX, headCY - headR * 0.6, headR * 0.25, headR * 0.18, 0, 0, Math.PI * 2);
 ctx.fill();
 // Visor slit (dark)
 ctx.fillStyle = "#1a1a2a";
 ctx.beginPath();
 ctx.roundRect(headCX - headR * 0.55, headCY - headR * 0.15, headR * 1.1, headR * 0.25, 3);
 ctx.fill();
 // Eye glow (red through visor)
 ctx.fillStyle = "rgba(255, 50, 0, 0.7)";
 ctx.beginPath();
 ctx.ellipse(headCX - headR * 0.2, headCY - headR * 0.05, headR * 0.12, headR * 0.08, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.beginPath();
 ctx.ellipse(headCX + headR * 0.2, headCY - headR * 0.05, headR * 0.12, headR * 0.08, 0, 0, Math.PI * 2);
 ctx.fill();

 // Beak / snout (plague doctor)
 const beakDir = facing;
 ctx.fillStyle = "#9a9aaa";
 ctx.save();
 ctx.translate(headCX + beakDir * headR * 0.45, headCY + headR * 0.1);
 ctx.beginPath();
 ctx.moveTo(0, -headR * 0.18);
 ctx.lineTo(beakDir * headR * 0.55, 0);
 ctx.lineTo(0, headR * 0.18);
 ctx.closePath();
 ctx.fill();
 // Beak nostril
 ctx.fillStyle = "#666677";
 ctx.beginPath();
 ctx.ellipse(beakDir * headR * 0.3, 0, 2, 2, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.restore();

 // Helmet brim
 ctx.fillStyle = "#888899";
 ctx.fillRect(headCX - headR * 1.05, headCY + headR * 0.3, headR * 2.1, headR * 0.18);

 // ── Helmet Red Cross ─────────────────────────────────────
 ctx.fillStyle = "#cc0000";
 ctx.fillRect(headCX - headR * 0.07, headCY - headR * 0.85, headR * 0.14, headR * 0.4);
 ctx.fillRect(headCX - headR * 0.22, headCY - headR * 0.72, headR * 0.44, headR * 0.14);

 ctx.restore();
}


function drawZombie(zombie) {
 if (zombieImg.complete && zombieImg.naturalWidth !== 0) {
 ctx.drawImage(zombieImg, zombie.x, zombie.y, zombie.width, zombie.height);
 return;
 }

 const x = zombie.x;
 const y = zombie.y;
 const w = zombie.width;
 const h = zombie.height;

 zombie.animTimer++;
 if (zombie.animTimer > 10) {
 zombie.animFrame = (zombie.animFrame + 1) % 4;
 zombie.animTimer = 0;
 }
 const armSwing = [4, 0, -4, 0][zombie.animFrame];
 const legSwing = [5, 0, -5, 0][zombie.animFrame];

 const headSize = w * 0.55;
 const headX = x + w / 2 - headSize / 2;
 const headY = y;
 const bodyTop = headY + headSize;
 const bodyH = h * 0.4;
 const bodyW = w * 0.55;
 const bodyX = x + w / 2 - bodyW / 2;
 const legTop = bodyTop + bodyH;
 const legH = h * 0.3;
 const legW = w * 0.18;
 const armW = w * 0.14;
 const armH = bodyH * 0.9;

 ctx.save();
 ctx.fillStyle = "rgba(0,0,0,0.2)";
 ctx.beginPath();
 ctx.ellipse(x + w / 2, y + h + 2, w * 0.4, 5, 0, 0, Math.PI * 2);
 ctx.fill();

 ctx.fillStyle = "#5a8a3a";
 const backArmX = bodyX + bodyW - armW;
 ctx.save();
 ctx.translate(backArmX + armW / 2, bodyTop + 2);
 ctx.rotate((-0.7 + armSwing * 0.04) * (zombie.direction === -1 ? 1 : -1));
 ctx.fillRect(-armW / 2, 0, armW, armH);
 ctx.restore();


 ctx.fillStyle = "#3a5a2a";
 ctx.save();
 ctx.translate(bodyX + legW / 2, legTop);
 ctx.rotate((legSwing * 0.05) * (zombie.direction === -1 ? 1 : -1));
 ctx.fillRect(-legW / 2, 0, legW, legH);

 ctx.fillStyle = "#2a3a1a";
 ctx.fillRect(-legW / 2 - 2, legH - 5, legW + 6, 6);
 ctx.restore();

 ctx.fillStyle = "#3a5a2a";
 ctx.save();
 ctx.translate(bodyX + bodyW - legW / 2, legTop);
 ctx.rotate((-legSwing * 0.05) * (zombie.direction === -1 ? 1 : -1));
 ctx.fillRect(-legW / 2, 0, legW, legH);
 ctx.fillStyle = "#2a3a1a";
 ctx.fillRect(-legW / 2 - 2, legH - 5, legW + 6, 6);
 ctx.restore();

 ctx.fillStyle = "#6aaa4a";
 ctx.fillRect(bodyX, bodyTop, bodyW, bodyH);

 ctx.fillStyle = "#4a7a2a";
 ctx.fillRect(bodyX + 3, bodyTop + bodyH * 0.3, 4, bodyH * 0.5);
 ctx.fillRect(bodyX + bodyW - 7, bodyTop + bodyH * 0.2, 4, bodyH * 0.6);

 ctx.fillStyle = "#5a8a3a";
 const frontArmX = bodyX;
 ctx.save();
 ctx.translate(frontArmX + armW / 2, bodyTop + 2);
 ctx.rotate((-0.9 - armSwing * 0.04) * (zombie.direction === -1 ? 1 : -1));
 ctx.fillRect(-armW / 2, 0, armW, armH);

 ctx.fillStyle = "#4a7020";
 ctx.fillRect(-armW / 2 - 2, armH - 4, armW + 4, 5);
 ctx.restore();

 ctx.fillStyle = "#7ac45a";
 ctx.beginPath();
 ctx.roundRect(headX, headY, headSize, headSize, [headSize * 0.3, headSize * 0.3, headSize * 0.15, headSize * 0.15]);
 ctx.fill();

 ctx.fillStyle = "#1a2a0a";
 ctx.beginPath();
 ctx.ellipse(headX + headSize * 0.28, headY + headSize * 0.38, headSize * 0.11, headSize * 0.1, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.beginPath();
 ctx.ellipse(headX + headSize * 0.68, headY + headSize * 0.38, headSize * 0.11, headSize * 0.1, 0, 0, Math.PI * 2);
 ctx.fill();

 ctx.fillStyle = "#ff2200";
 ctx.beginPath();
 ctx.ellipse(headX + headSize * 0.28, headY + headSize * 0.38, headSize * 0.05, headSize * 0.05, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.beginPath();
 ctx.ellipse(headX + headSize * 0.68, headY + headSize * 0.38, headSize * 0.05, headSize * 0.05, 0, 0, Math.PI * 2);
 ctx.fill();

 ctx.fillStyle = "#3a5a2a";
 ctx.fillRect(headX + headSize * 0.42, headY + headSize * 0.5, 3, 4);
 ctx.fillRect(headX + headSize * 0.55, headY + headSize * 0.5, 3, 4);

 ctx.strokeStyle = "#1a2a0a";
 ctx.lineWidth = 1.5;
 ctx.beginPath();
 ctx.moveTo(headX + headSize * 0.2, headY + headSize * 0.7);
 ctx.lineTo(headX + headSize * 0.8, headY + headSize * 0.7);
 ctx.stroke();

 ctx.fillStyle = "#ddeedd";
 for (let t = 0; t < 4; t++) {
 ctx.fillRect(headX + headSize * (0.22 + t * 0.15), headY + headSize * 0.63, headSize * 0.1, headSize * 0.1);
 }

 ctx.fillStyle = "#aa0000";
 ctx.beginPath();
 ctx.ellipse(headX + headSize * 0.7, headY + headSize * 0.15, 5, 4, 0.5, 0, Math.PI * 2);
 ctx.fill();

 ctx.strokeStyle = "#2a1a00";
 ctx.lineWidth = 1.5;
 for (let i = 0; i < 5; i++) {
 ctx.beginPath();
 ctx.moveTo(headX + headSize * (0.15 + i * 0.17), headY + 3);
 ctx.lineTo(headX + headSize * (0.1 + i * 0.18), headY - 5 - Math.random() * 3);
 ctx.stroke();
 }

 ctx.restore();
}

function updateBullets() {
 bullets.forEach((bullet, index) => {
 bullet.x += bullet.speed * bullet.direction;

 ctx.fillStyle = "yellow";
 ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

 if (bullet.x < -20 || bullet.x > canvas.width + 20) {
 bullets.splice(index, 1);
 }
 });
}

function updateZombies() {
 zombies.forEach((zombie, index) => {
 zombie.x += zombie.speed * zombie.direction;

 drawZombie(zombie);

 if (
 zombie.x < player.x + player.width &&
 zombie.x + zombie.width > player.x &&
 zombie.y < player.y + player.height &&
 zombie.y + zombie.height > player.y
 ) {
 gameOver = true;
 }

 bullets.forEach((bullet, bIndex) => {
 if (
 bullet.x < zombie.x + zombie.width &&
 bullet.x + bullet.width > zombie.x &&
 bullet.y < zombie.y + zombie.height &&
 bullet.y + bullet.height > zombie.y
 ) {
 zombies.splice(index, 1);
 bullets.splice(bIndex, 1);
 zombiesKilled++;
 }
 });

 if (zombie.x < -60) {
 zombies.splice(index, 1);
 }
 });
}

function update() {
 if (gameOver) {
 ctx.fillStyle = "red";
 ctx.font = "60px Arial";
 ctx.fillText("GAME OVER", canvas.width / 2 - 200, canvas.height / 2);
 return;
 }

 if (zombiesKilled >= zombiesToWin) {
 ctx.fillStyle = "white";
 ctx.font = "60px Arial";
 ctx.fillText("YOU WIN", canvas.width / 2 - 150, canvas.height / 2);
 return;
 }

 ctx.fillStyle = "lightblue";
 ctx.fillRect(0, 0, canvas.width, canvas.height);

 ground.y = canvas.height - 50;
 ground.width = canvas.width;
 platform.y = canvas.height - 200;
 platform2.y = canvas.height - 200;

 ctx.fillStyle = ground.color;
 ctx.fillRect(ground.x, ground.y, ground.width, ground.height);

 ctx.fillStyle = platform.color;
 ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

 ctx.fillStyle = platform2.color;
 ctx.fillRect(platform2.x, platform2.y, platform2.width, platform2.height);

 player.velocityY += gravity;
 player.y += player.velocityY;
 player.onGround = false;

 if (
 player.y + player.height > platform.y &&
 player.y + player.height < platform.y + platform.height &&
 player.x + player.width > platform.x &&
 player.x < platform.x + platform.width &&
 player.velocityY >= 0
 ) {
 player.y = platform.y - player.height;
 player.velocityY = 0;
 player.onGround = true;
 }

 if (
 player.y + player.height > platform2.y &&
 player.y + player.height < platform2.y + platform2.height &&
 player.x + player.width > platform2.x &&
 player.x < platform2.x + platform2.width &&
 player.velocityY >= 0
 ) {
 player.y = platform2.y - player.height;
 player.velocityY = 0;
 player.onGround = true;
 }

 if (player.y + player.height > ground.y) {
 player.y = ground.y - player.height;
 player.velocityY = 0;
 player.onGround = true;
 }

 const speed = 4;

 if (keys.left) {
 player.x -= speed;
 player.facing = -1;
 }

 if (keys.right) {
 player.x += speed;
 player.facing = 1;
 }

 if (keys.up && player.onGround) {
 player.velocityY = jumpStrength;
 }

 drawPlayer(player);

 drawReloadIndicator();
 updateBullets();
 updateZombies();

 ctx.fillStyle = "white";
 ctx.font = "20px Arial";
 ctx.fillText("Zombies Killed: " + zombiesKilled + " / 30", 20, 40);

 ctx.fillStyle = "black";
 ctx.fillRect(canvas.width - shootButton.width - 20, canvas.height - shootButton.height - 20, shootButton.width, shootButton.height);
 ctx.fillStyle = "white";
 ctx.font = "20px Arial";
 ctx.fillText("SHOOT", canvas.width - shootButton.width + 5 - 20, canvas.height - 35);

 requestAnimationFrame(update);
}

update();