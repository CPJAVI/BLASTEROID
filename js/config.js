// config.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const container = document.getElementById('gameContainer');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const W = () => canvas.width;
const H = () => canvas.height;

const mainMenu = document.getElementById('mainMenu');
const instructionsScreen = document.getElementById('instructionsScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const victoryScreen = document.getElementById('victoryScreen');
const diamondSpan = document.getElementById('diamondValue');
const healthSpan = document.getElementById('healthValue');

// Imágenes
const playerImg = new Image();
playerImg.src = 'images/personaje.png';
const enemyImg = new Image();
enemyImg.src = 'images/enemigo.png';
const bossImg = new Image();
bossImg.src = 'images/jefe.png';
const sharkImg = new Image();
sharkImg.src = 'images/tiburon.png';
const libelulaImg = new Image();
libelulaImg.src = 'images/libelula.png';

// Variables globales del juego
let gameRunning = false;
let currentLevel = 1;
let player = null;
let enemies = [];
let bullets = [];
let enemyBullets = [];
let platforms = [];
let spikes = [];
let waterZones = [];
let diamondItems = [];
let keys = {};
let frameCount = 0;
let levelEnemiesDefeated = 0;
let enemiesRequired = 0;
let bossDefeated = false;
let gameOverShown = false;
let gameStarted = false;
let soundManager = null; // se asignará en main.js