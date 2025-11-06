let isMuted = false;

window.addEventListener("DOMContentLoaded", () => init());


function init() {
  // Beim Laden: Startbildschirm anzeigen
  document.getElementById('start-screen').classList.remove('hidden');
  document.getElementById('canvas').style.display = 'none';
  document.getElementById('game-name').style.display = 'none';
}

/**
 * Startet das Spiel, wenn "Spielen" gedrückt wird
 */
function startGame() {
  document.getElementById('game-name').style.display = 'block';
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('canvas').style.display = 'block';
  document.getElementById('end-screen').classList.add('hidden');

  startGameLogic();
}

/**
 * Anleitung öffnen/schließen
 */
function openInstructions() {
  document.getElementById('instructions').classList.remove('hidden');
}
function closeInstructions() {
  document.getElementById('instructions').classList.add('hidden');
}

/**
 * Ton an/aus
 */
function toggleMute() {
  isMuted = !isMuted;
  document.getElementById('mute-btn').textContent = isMuted ? '🔈 Ton an' : '🔊 Ton aus';

  if (world) {
    if (isMuted) world.muteAllSounds?.();
    else world.unmuteAllSounds?.();
  }
}

/**
 * Zeigt den Endscreen an (wird vom Spiel aufgerufen)
 */
function showEndScreen(win) {
  stopGame(); // beendet den Loop
  const message = win ? '🎉 Du hast gewonnen!' : '💀 Du hast verloren!';
  document.getElementById('end-message').textContent = message;
  document.getElementById('end-screen').classList.remove('hidden');
}

/**
 * Spiel neu starten
 */
function restartGame() {
  document.getElementById('end-screen').classList.add('hidden');
  startGame();
}

/**
 * Zurück zum Startscreen
 */
function returnToHome() {
  stopGame();
  document.getElementById('canvas').style.display = 'none';
  document.getElementById('start-screen').classList.remove('hidden');
}


/**
 * Warten, bis Browser + Spiel intern vollständig geladen sind
 */
window.addEventListener('load', async () => {
  console.log("🌐 Browser vollständig geladen – warte auf interne Spielressourcen...");

  // interne Ressourcen prüfen
  await waitForGameAssets();

  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.classList.remove('loading');
    startBtn.removeAttribute('disabled');
    startBtn.textContent = '🎮 Spiel starten';
    startBtn.onclick = startGame;
    console.log("✅ Alles geladen – Spielstart möglich!");
  }
});

/**
 * Prüft in Intervallen, ob Spielressourcen geladen sind
 */
async function waitForGameAssets() {
  const startTime = Date.now();
  const timeout = 20000; // maximal 20 Sekunden warten

  return new Promise(resolve => {
    const check = setInterval(() => {
      const assetsReady =
        typeof World !== 'undefined' &&
        typeof level1 !== 'undefined' &&
        document.querySelectorAll('img').length > 0;

      if (assetsReady || Date.now() - startTime > timeout) {
        clearInterval(check);
        resolve();
      }
    }, 300);
  });
}
