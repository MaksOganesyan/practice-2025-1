const canvas = document.getElementById('gameCanvas');
const scoreDisplay = document.getElementById('score');
if (!canvas || !scoreDisplay) {
  console.error('Canvas или scoreDisplay не найдены');
}
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCount = canvas.width / gridSize;
let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let powerUp = null;
let dx = 0;
let dy = 0;
let score = 0;
let gameSpeed = 300;
let gameOver = false;
let gameInterval = setInterval(gameLoop, gameSpeed);
let speedTimeout = null;
let highScore = localStorage.getItem('highScore') || 0;

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (gameOver) {
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.fillText('Game Over', canvas.width / 4, canvas.height / 2);
    return;
  }
  snake.forEach(segment => {
    ctx.fillStyle = 'green';
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
  });
  ctx.fillStyle = 'red';
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
  if (powerUp) {
    ctx.fillStyle = 'yellow';
    ctx.fillRect(powerUp.x * gridSize, powerUp.y * gridSize, gridSize - 2, gridSize - 2);
  }
  scoreDisplay.textContent = `Счет: ${score} | Лучший: ${highScore}`;
}

document.addEventListener('keydown', e => {
  if (gameOver) return;
  switch (e.key) {
    case 'ArrowUp':
      if (dy !== 1) { dx = 0; dy = -1; }
      break;
    case 'ArrowDown':
      if (dy !== -1) { dx = 0; dy = 1; }
      break;
    case 'ArrowLeft':
      if (dx !== 1) { dx = -1; dy = 0; }
      break;
    case 'ArrowRight':
      if (dx !== -1) { dx = 1; dy = 0; }
      break;
  }
});

function moveSnake() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };
 snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    generateFood();
  } else {
    snake.pop();
  }
}

function generateFood() {
  const freeCells = [];
  for (let x = 0; x < tileCount; x++) {
    for (let y = 0; y < tileCount; y++) {
      if (!snake.some(segment => segment.x === x && segment.y === y)) {
        freeCells.push({ x, y });
      }
    }
  }
  if (freeCells.length === 0) return;
  const index = Math.floor(Math.random() * freeCells.length);
  food = freeCells[index];
}

function checkCollision() {
  const head = snake[0];
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    resetGame();
  }
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      resetGame();
    }
  }
}

function resetGame() {
  highScore = Math.max(score, highScore);
  localStorage.setItem('highScore', highScore);
  gameOver = true;
  snake = [{ x: 10, y: 10 }];
  food = { x: 15, y: 15 };
  powerUp = null;
  dx = 0;
  dy = 0;
  score = 0;
  gameSpeed = 100;
  setTimeout(() => {
    gameOver = false;
    updateGameSpeed(gameSpeed);
  }, 1000);
}

function generatePowerUp() {
  if (!powerUp && Math.random() < 0.1) {
    const x = Math.floor(Math.random() * tileCount);
    const y = Math.floor(Math.random() * tileCount);
    if (snake.some(segment => segment.x === x && segment.y === y) || (food.x === x && food.y === y)) return;
    powerUp = { x, y, type: Math.random() > 0.5 ? 'speed' : 'points' };
    setTimeout(() => powerUp = null, 10000);
  }
}

function checkPowerUp() {
  if (powerUp && snake[0].x === powerUp.x && snake[0].y === powerUp.y) {
    if (powerUp.type === 'speed') {
      if (speedTimeout) clearTimeout(speedTimeout);
      updateGameSpeed(50);
      speedTimeout = setTimeout(() => {
        updateGameSpeed(100);
        speedTimeout = null;
      }, 5000);
    } else {
      score += 50;
    }
    powerUp = null;
  }
}

function updateGameSpeed(newSpeed) {
  clearInterval(gameInterval);
  gameSpeed = newSpeed;
  gameInterval = setInterval(gameLoop, gameSpeed);
}

function gameLoop() {
  if (gameOver) return;
  moveSnake();
  checkCollision();
  checkPowerUp();
  generatePowerUp();
  drawGame();
}

setInterval(gameLoop, gameSpeed);
