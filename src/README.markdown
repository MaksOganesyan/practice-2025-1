# Руководство по созданию игры Snake

Это пошаговое руководство поможет вам создать игру Snake с нуля, используя HTML, CSS и JavaScript. Вы научитесь управлять змейкой, добавлять еду и реализовать бонусы (ускорение и дополнительные очки). Руководство подходит для новичков и объясняет всё просто.

## Содержание
1. [Введение](#введение)
2. [Требования](#требования)
3. [Пошаговая инструкция](#пошаговая-инструкция)
4. [Бонусы](#бонусы)
5. [Диаграммы](#диаграммы)
6. [Заключение](#заключение)

## Введение
Snake — классическая игра, где вы управляете змейкой, которая ест еду и растёт. Если она врезается в стены или свой хвост, игра сбрасывается. Мы добавили:
- **Бонусы**: Ускорение (змейка быстрее на 5 секунд) и +50 очков.
- **Улучшения**: Экран "Game Over" и сохранение лучшего счёта.
Игра использует HTML5 Canvas для графики, JavaScript для логики и CSS для стилей. Поле — 400x400 пикселей, разделено на клетки 20x20.

**Иллюстрация 1: Игровое поле**  
![Игровое поле](images/snake-game-board.png)

## Требования
Вам понадобятся:
- **Редактор кода**: Visual Studio Code ([скачать](https://code.visualstudio.com/)).
- **Браузер**: Chrome или Firefox.
- **Знания**:
  - HTML: создание страницы.
  - CSS: центрирование и рамки.
  - JavaScript: переменные, функции, события.
- **Папка проекта**: Создайте папку `snake-game` с файлами:
  - `index.html`
  - `styles.css`
  - `script.js`

## Пошаговая инструкция

### Шаг 1: Создание страницы
Файл `index.html` задаёт поле игры и место для счёта.

**index.html**:
```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Игра Snake</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <canvas id="gameCanvas" width="400" height="400"></canvas>
    <div id="score">Счет: 0</div>
  </div>
  <script src="script.js"></script>
</body>
</html>
```

- `<canvas>` — область для рисования змейки, еды и бонусов.
- `<div id="score">` — показывает счёт и лучший результат.
- `<link>` и `<script>` подключают стили и логику.

### Шаг 2: Стилизация
Файл `styles.css` центрирует поле и добавляет рамку.

**styles.css**:
```css
body {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  background-color: #f0f0f0;
}
.container {
  text-align: center;
}
#gameCanvas {
  border: 2px solid black;
}
#score {
  font-size: 24px;
  margin-top: 10px;
}
```

- `display: flex` центрирует содержимое.
- `border` делает поле заметным.

**Иллюстрация 2: Стилизованное поле**  
![Стилизованное поле](images/snake-game-board.png)

### Шаг 3: Базовая игра
Файл `script.js` создаёт змейку, еду, управление и проверяет столкновения.

**script.js** (базовая часть):
```javascript
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

const gridSize = 20;
const tileCount = canvas.width / gridSize;
let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let powerUp = null;
let dx = 0;
let dy = 0;
let score = 0;
let gameSpeed = 100;
let gameOver = false;
let highScore = localStorage.getItem('highScore') || 0;
let gameInterval = setInterval(gameLoop, gameSpeed);
let speedTimeout = null;

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
  updateGameSpeed(gameSpeed);
  setTimeout(() => gameOver = false, 1000);
}

function gameLoop() {
  if (gameOver) return;
  moveSnake();
  checkCollision();
  drawGame();
}
```

**Как это работает**:
- Змейка начинается в центре, еда — в случайной клетке.
- Стрелки управляют движением, еда даёт +10 очков.
- При столкновении игра сбрасывается.

### Шаг 4: Бонусы и улучшения
Добавим бонусы (ускорение, очки), экран "Game Over" и лучший счёт.

**Добавьте в `script.js`**:
```javascript
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

function gameLoop() {
  if (gameOver) return;
  moveSnake();
  checkCollision();
  checkPowerUp();
  generatePowerUp();
  drawGame();
}
```

**Что добавлено**:
- **Бонусы**: Жёлтые квадраты появляются с шансом 10%, исчезают через 10 секунд.
  - "speed": Ускоряет игру (50 мс) на 5 секунд.
  - "points": Даёт +50 очков.
- **Экран "Game Over"**: Показывается на 1 секунду при сбросе.
- **Лучший счёт**: Сохраняется в браузере (`localStorage`).
- Бонусы не появляются на змейке или еде.

**Иллюстрация 3: Бонус**  
![Бонус](images/power-up-effect.png)

### Шаг 5: Тестирование
1. Сохраните `index.html`, `styles.css`, `script.js` в папке `snake-game`.
2. Откройте `index.html` в браузере (дважды кликните или используйте Live Server в VS Code).
3. Проверьте:
   - Змейка движется стрелками.
   - Еда (красная) даёт +10 очков.
   - Бонусы (жёлтые) дают ускорение или +50 очков.
   - При столкновении появляется "Game Over", игра останавливается на 1 секунду.
   - Лучший счёт сохраняется.
4. Если не работает:
   - Нажмите F12, откройте Console.
   - Напишите, какие ошибки видите.

## Диаграммы
Диаграммы помогают понять игру:

**Иллюстрация 4: Диаграмма классов**  
![Диаграмма классов](images/class-diagram.png)  
Показывает объекты: `Snake`, `Food`, `PowerUp`.

**Иллюстрация 5: Блок-схема столкновений**  
![Блок-схема](images/collision-flowchart.png)  
Объясняет проверку столкновений.

**Иллюстрация 6: Блок-схема игрового цикла**  
![Блок-схема цикла](images/game-loop-flowchart.png)  
Показывает порядок действий в `gameLoop`.

## Заключение
Вы создали игру Snake с бонусами и улучшениями! Вы научились:
- Работать с Canvas.
- Обрабатывать клавиши.
- Создавать бонусы и сохранять счёт.
Код на GitHub: [https://github.com/MaksOganesyan/practice-mospl/tree/main/src](#).  

**Идеи для улучшения**:
- Добавить паузу (клавиша Space).
- Показывать тип бонуса на экране.
- Создать таблицу лидеров.


