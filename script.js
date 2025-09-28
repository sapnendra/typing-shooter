let high = +localStorage.getItem("typerHigh") || 0;
const highEl = document.getElementById("highscore");
highEl.textContent = high;

const startGame = () => {
  const container = document.getElementById("game-container");
  const scoreEl = document.getElementById("score");
  const comboEl = document.getElementById("combo");
  const accEl = document.getElementById("accuracy");
  const livesEl = document.getElementById("lives");
  const overlay = document.getElementById("overlay");
  const gameOverBox = document.getElementById("game-over");
  const finalScore = document.getElementById("final-score");
  const finalHigh = document.getElementById("final-high");
  const restartBtn = document.getElementById("restart-btn");
  const glitch = document.getElementById("glitch");
  const gunAudio = document.getElementById("gun-audio");

  let chars = [],
    score = 0,
    lives = 3;
  let combo = 0,
    hits = 0,
    misses = 0,
    rafId,
    spawnTimeout,
    gameOver = false,
    lastTime = 0;

  // Speed settings
  const baseSpeed = 0.7; // slower than before
  const speedPerScore = 0.05;
  const baseSpawn = 1600,
    minSpawn = 400;

  function randChar() {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
  }
  function createChar() {
    const el = document.createElement("div");
    el.className = "char";
    const ch = randChar();
    el.textContent = ch;
    const x = Math.random() * (window.innerWidth - 40);
    el.style.left = x + "px";
    container.appendChild(el);
    chars.push({
      el,
      ch,
      x,
      y: -60,
      speed: baseSpeed + score * speedPerScore + Math.random() * 0.4,
    });
  }

  function spawn() {
    if (gameOver) return;
    let count = Math.min(1 + Math.floor(score / 100), 2);
    for (let i = 0; i < count; i++) setTimeout(createChar, i * 100);
    let interval = Math.max(minSpawn, baseSpawn - score * 40);
    spawnTimeout = setTimeout(spawn, interval);
  }

  function removeChar(c) {
    try {
      c.el.remove();
    } catch {}
    chars = chars.filter((x) => x !== c);
  }

  function updateHUD() {
    scoreEl.textContent = score;
    comboEl.textContent = combo;
    let total = hits + misses;
    let acc = total ? Math.round((hits / total) * 100) : 100;
    accEl.textContent = acc + "%";
    livesEl.textContent = "❤️".repeat(lives);
  }

  function shootEffect(c) {
    c.el.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.4)", opacity: 0 }],
      { duration: 200 }
    );
  }

  function playShoot() {
    gunAudio.currentTime = 0;
    gunAudio.play().catch(() => {});
  }

  function wrongEffect() {
    glitch.classList.add("visible");
    container.classList.add("shake");
    setTimeout(() => {
      glitch.classList.remove("visible");
      container.classList.remove("shake");
    }, 400);
  }

  document.addEventListener("keydown", (e) => {
    if (gameOver) return;
    const key = e.key.toUpperCase();
    if (!/^[A-Z]$/.test(key)) return;
    let found = chars.find((c) => c.ch === key);
    if (found) {
      playShoot();
      shootEffect(found);
      removeChar(found);
      score++;
      hits++;
      combo++;
      if (score > high) {
        high = score;
        localStorage.setItem("typerHigh", high);
        highEl.textContent = high;
      }
    } else {
      wrongEffect();
      misses++;
      combo = 0;
      lives--;
      if (lives <= 0) endGame();
    }
    updateHUD();
  });

  function update(ts) {
    if (!lastTime) lastTime = ts;
    let dt = (ts - lastTime) / 16.6;
    lastTime = ts;
    for (let i = chars.length - 1; i >= 0; i--) {
      let c = chars[i];
      c.y += c.speed * dt;
      c.el.style.top = c.y + "px";
      if (c.y > window.innerHeight - 40) {
        endGame();
        return;
      }
    }
    rafId = requestAnimationFrame(update);
  }

  function start() {
    chars.forEach((c) => c.el.remove());
    chars = [];
    score = 0;
    combo = 0;
    hits = 0;
    misses = 0;
    lives = 3;
    updateHUD();
    gameOver = false;
    lastTime = 0;
    gameOverBox.style.display = "none";
    spawn();
    rafId = requestAnimationFrame(update);
  }

  function endGame() {
    gameOver = true;
    clearTimeout(spawnTimeout);
    cancelAnimationFrame(rafId);
    finalScore.textContent = "Score: " + score;
    finalHigh.textContent = "High: " + high;
    gameOverBox.style.display = "block";
  }

  restartBtn.onclick = start;
  start();
};

const startBtn = document.querySelector(".start");
startBtn.addEventListener("click", () => {
  startGame();
  startBtn.style.display = "none";
});
