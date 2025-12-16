/**
 * Wird von ui.js aufgerufen, wenn der Spieler „Start“ klickt
 */
function startGameLogic() {
  canvas = document.getElementById('canvas');
  world = new World(canvas, keyboard);

  // 🖱️ Klick auf Canvas = Pause/Play Toggle
  canvas.onclick = () => {
    if (!world) return;

    // ⛔ Während Maracas-Sequenz keine Pause
    if (world.isMaracasSequence) return;

    if (world.isPaused) world.resumeGame();
    else world.pauseGame();
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
  // 🎚️ Ton an/aus mit Taste „M“ (immer erlaubt, auch ohne World)
  if ((e.key === 'm' || e.key === 'M') && !e.repeat) {
    toggleMute();
  }

  // 👉 Ohne Welt nichts machen (für Bewegungen etc.)
  if (!world) return;

  // ⛔ Während Maracas-Endsequenz ALLE Eingaben ignorieren
  if (world.isMaracasSequence) {
    return;
  }

  if (e.key === 'ArrowRight') keyboard.RIGHT = true;
  if (e.key === 'ArrowLeft') keyboard.LEFT = true;
  if (e.key === 'ArrowUp') keyboard.UP = true;
  if (e.key === 'ArrowDown') keyboard.DOWN = true;
  if (e.key === ' ') keyboard.SPACE = true;
  if (e.key === 'd' || e.key === 'D') keyboard.D = true;

  // 🧩 Pause/Play mit Taste „P“
  if ((e.key === 'p' || e.key === 'P') && !e.repeat) {
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

