// === Globale Variablen ===
var canvas;
var world;
var keyboard = new Keyboard();

/**
 * Wird beim Laden der Seite aufgerufen,
 * aber startet das Spiel noch nicht.
 */
function init() {
  canvas = document.getElementById('canvas');
  if (!canvas) {
    console.error("❌ Canvas nicht gefunden!");
    return;
  }

  console.log("✅ Canvas gefunden:", canvas);
}

/**
 * Wird von ui.js aufgerufen, wenn der Spieler „Start“ klickt
 */
function startGameLogic() {
  canvas = document.getElementById('canvas');
  world = new World(canvas, keyboard);

  canvas.onclick = () => {   // ersetzt alten Listener automatisch!
    if (!world) return;
    world.isPaused ? world.resumeGame() : world.pauseGame();
  };
}


/**
 * Stoppt das Spiel (z. B. bei Game Over)
 */
function stopGame() {
  if (world && world.stop) {
    world.stop();
  }
  // ❗ world NICHT sofort auf null setzen!
}


// === Tasteneingaben erfassen ===
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') keyboard.RIGHT = true;
  if (e.key === 'ArrowLeft') keyboard.LEFT = true;
  if (e.key === 'ArrowUp') keyboard.UP = true;
  if (e.key === 'ArrowDown') keyboard.DOWN = true;
  if (e.key === ' ') keyboard.SPACE = true;
  if (e.key === 'd' || e.key === 'D') keyboard.D = true;

  // 🧩 NEU: Pause/Play mit Taste „P“
  if ((e.key === 'p' || e.key === 'P') && !e.repeat) {
    if (!world) return;

    if (world.isPaused) {
      world.resumeGame();   // ▶️ fortsetzen
    } else {
      world.pauseGame();    // ⏸️ pausieren
    }
  }
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowRight') keyboard.RIGHT = false;
  if (e.key === 'ArrowLeft') keyboard.LEFT = false;
  if (e.key === 'ArrowUp') keyboard.UP = false;
  if (e.key === 'ArrowDown') keyboard.DOWN = false;
  if (e.key === ' ') keyboard.SPACE = false;
  if (e.key === 'd' || e.key === 'D') keyboard.D = false;
});
