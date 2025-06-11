const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game settings
const paddleWidth = 16, paddleHeight = 100, paddleMargin = 16;
const ballSize = 16;

// Left Paddle (Player)
const leftPaddle = {
    x: paddleMargin,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

// Right Paddle (AI)
const rightPaddle = {
    x: canvas.width - paddleMargin - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

// Ball
const ball = {
    x: canvas.width / 2 - ballSize / 2,
    y: canvas.height / 2 - ballSize / 2,
    size: ballSize,
    speed: 6,
    dx: 6 * (Math.random() < 0.5 ? 1 : -1),
    dy: 6 * (Math.random() * 2 - 1)
};

// Scores
let leftScore = 0;
let rightScore = 0;

// Draw everything
function draw() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Middle dashed line
    ctx.setLineDash([16, 20]);
    ctx.strokeStyle = '#fff8';
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = '#fff';
    ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
    ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ball.x + ball.size/2, ball.y + ball.size/2, ball.size/2, 0, Math.PI * 2);
    ctx.fill();

    // Draw scores
    ctx.font = '40px Arial';
    ctx.fillText(leftScore, canvas.width / 2 - 80, 50);
    ctx.fillText(rightScore, canvas.width / 2 + 50, 50);
}

// Ball movement and collision
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top/bottom wall collision
    if (ball.y <= 0) {
        ball.y = 0;
        ball.dy *= -1;
    } else if (ball.y + ball.size >= canvas.height) {
        ball.y = canvas.height - ball.size;
        ball.dy *= -1;
    }

    // Left paddle collision
    if (
        ball.x <= leftPaddle.x + leftPaddle.width &&
        ball.x >= leftPaddle.x &&
        ball.y + ball.size >= leftPaddle.y &&
        ball.y <= leftPaddle.y + leftPaddle.height
    ) {
        ball.x = leftPaddle.x + leftPaddle.width;
        ball.dx *= -1;
        // Add a bit of "spin" based on paddle movement and collision point
        let hitPos = (ball.y + ball.size / 2) - (leftPaddle.y + leftPaddle.height / 2);
        ball.dy = hitPos * 0.25 + leftPaddle.dy * 0.5;
    }

    // Right paddle collision
    if (
        ball.x + ball.size >= rightPaddle.x &&
        ball.x + ball.size <= rightPaddle.x + rightPaddle.width &&
        ball.y + ball.size >= rightPaddle.y &&
        ball.y <= rightPaddle.y + rightPaddle.height
    ) {
        ball.x = rightPaddle.x - ball.size;
        ball.dx *= -1;
        let hitPos = (ball.y + ball.size / 2) - (rightPaddle.y + rightPaddle.height / 2);
        ball.dy = hitPos * 0.25 + rightPaddle.dy * 0.5;
    }

    // Left/right wall: score
    if (ball.x < 0) {
        rightScore++;
        resetBall(-1);
    } else if (ball.x + ball.size > canvas.width) {
        leftScore++;
        resetBall(1);
    }
}

// Reset ball to center, direction: -1 (to left), 1 (to right)
function resetBall(direction) {
    ball.x = canvas.width / 2 - ball.size / 2;
    ball.y = canvas.height / 2 - ball.size / 2;
    ball.dx = ball.speed * direction;
    ball.dy = 6 * (Math.random() * 2 - 1);
}

// Simple AI for right paddle
function updateAIPaddle() {
    const paddleCenter = rightPaddle.y + rightPaddle.height / 2;
    const ballCenter = ball.y + ball.size / 2;
    // Move the AI paddle toward the ball, but limit its speed
    let diff = ballCenter - paddleCenter;
    const aiSpeed = 6;
    if (Math.abs(diff) > aiSpeed) {
        rightPaddle.dy = diff > 0 ? aiSpeed : -aiSpeed;
    } else {
        rightPaddle.dy = diff;
    }
    rightPaddle.y += rightPaddle.dy;

    // Keep inside canvas
    if (rightPaddle.y < 0) rightPaddle.y = 0;
    if (rightPaddle.y + rightPaddle.height > canvas.height) rightPaddle.y = canvas.height - rightPaddle.height;
}

// Player paddle follows mouse Y
function onMouseMove(e) {
    // Get mouse y relative to canvas
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    // Center paddle on mouse
    let targetY = mouseY - leftPaddle.height / 2;
    // Clamp within bounds
    if (targetY < 0) targetY = 0;
    if (targetY > canvas.height - leftPaddle.height) targetY = canvas.height - leftPaddle.height;
    leftPaddle.dy = targetY - leftPaddle.y;
    leftPaddle.y = targetY;
}
canvas.addEventListener('mousemove', onMouseMove);

// Main loop
function loop() {
    updateBall();
    updateAIPaddle();
    draw();
    requestAnimationFrame(loop);
}

// Start game
draw();
loop();