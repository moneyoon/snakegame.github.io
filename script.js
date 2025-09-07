const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}];
let direction = {x: 1, y: 0}; // 让蛇初始向右自动行走
do {
    food = {x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount)};
} while (snake.some(segment => segment.x === food.x && segment.y === food.y));
let score = 0;
let isPaused = false;
let saveCode = '';
let partialTailLength = 0;
let difficulty = 1;
const difficultyLevels = { 1: 160, 2: 125, 3: 75 };

function gameLoop() {
    if (!isPaused) {
        update();
        draw();
    }
    setTimeout(gameLoop, difficultyLevels[difficulty]);
}

function update() {
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};

    // 碰撞检测
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount || snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        resetGame();
        return;
    }

    snake.unshift(head);

    // 吃到食物
    if (head.x === food.x && head.y === food.y) {
        score++;
        document.getElementById('score').textContent = '得分: ' + score;
        do {
    food = {x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount)};
} while (snake.some(segment => segment.x === food.x && segment.y === food.y));
    } else {
        snake.pop();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 画蛇头
    ctx.fillStyle = 'lightgreen';
    ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize, gridSize);

    // 画蛇身
    ctx.fillStyle = 'green';
    const displayLength = partialTailLength > 0 ? Math.min(partialTailLength, snake.length) : snake.length;
    for (let i = 1; i < displayLength; i++) {
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
    }

    // 画食物
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

function resetGame() {
    snake = [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}];
    direction = {x: 1, y: 0}; // 让蛇重启后初始向右自动行走
    score = 0;
    document.getElementById('score').textContent = '得分: 0';
}

// 保留原有的按键监听，可根据需要调整
// 显示游戏说明的函数
function showInstructions() {
    alert('游戏说明：使用方向键控制蛇移动，按 p 键暂停，按 1、2、3 键调整难度。蛇吃到食物会变长，撞到边界或自己身体则游戏重置。');
}

// 生成加密存档码函数
function generateSaveCode(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  let value = length;
  for (let i = 0; i < 5; i++) {
    const index = value % characters.length;
    code += characters[index];
    value = Math.floor(value / characters.length);
  }
  return code;
}

// 读取存档码函数
function readSaveCode(code) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  if (!code || code.split('').some(char => !characters.includes(char))) {
    alert('存档码无效');
    return;
  }
  let length = 0;
  for (let i = 0; i < code.length; i++) {
    const index = characters.indexOf(code[i]);
    length += index * Math.pow(characters.length, i);
  }
  // 计算需要增加的长度
  const additionalLength = length - snake.length;
  if (additionalLength > 0) {
    const lastSegment = snake[snake.length - 1];
    for (let i = 0; i < additionalLength; i++) {
      snake.push({...lastSegment});
    }
    // 更新分数
    score += additionalLength;
    document.getElementById('score').textContent = '得分: ' + score;
  }
  partialTailLength = length;
}

// 为存档码按钮添加点击事件监听器
const saveCodeBtn = document.getElementById('save-code-btn');
if (saveCodeBtn) {
  saveCodeBtn.addEventListener('click', () => {
    if (isPaused) {
      const inputCode = prompt('请输入存档码:');
      if (inputCode) {
        readSaveCode(inputCode);
      }
    }
  });
}

// 为说明按钮添加点击事件监听器
const instructionsBtn = document.getElementById('instructions-btn');
if (instructionsBtn) {
    instructionsBtn.addEventListener('click', showInstructions);
}

window.addEventListener('keydown', e => {
    // 防止快速按键造成异常
    if (e.repeat) return;
    // 保留原有的按键逻辑，可根据需要调整
    switch (e.key) {
        case 'p':
          isPaused = !isPaused;
          if (isPaused) {
            saveCode = generateSaveCode(snake.length);
            alert('存档码: ' + saveCode);
          }
          break;
        case 'ArrowUp': if (direction.y !== 1) direction = {x: 0, y: -1}; break;
        case 'ArrowDown': if (direction.y !== -1) direction = {x: 0, y: 1}; break;
        case 'ArrowLeft': if (direction.x !== 1) direction = {x: -1, y: 0}; break;
        case 'ArrowRight': if (direction.x !== -1) direction = {x: 1, y: 0}; break;
        case '1': difficulty = 1; break;
        case '2': difficulty = 2; break;
        case '3': difficulty = 3; break;
    }
});

showInstructions();
gameLoop();