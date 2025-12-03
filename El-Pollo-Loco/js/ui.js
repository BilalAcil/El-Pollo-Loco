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
  canvas = document.getElementById('canvas');
  document.getElementById('game-name').style.display = 'block';
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('canvas').style.display = 'block';
  document.getElementById('end-screen').classList.add('hidden');

  startGameLogic();

  // 🟢 Nach 200ms Spiel fortsetzen (alles starten)
  setTimeout(() => {
    if (world && world.isPaused) {
      world.resumeGame();
    }
  }, 200);
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
 * @param {boolean} win - true = gewonnen, false = verloren
 */
function showEndScreen(win) {
  // ❗ Daten zuerst retten, bevor die Welt zerstört wird
  const coinCount = world?.statusBarCoin?.coinCount ?? 0;
  const salsaCount = world?.statusBarSalsa?.salsaCount ?? 0;

  stopGame();

  const endScreen = document.getElementById('end-screen');
  const messageEl = document.getElementById('end-message');
  const buttonContainer = endScreen.querySelector('.menu-box');
  const statsBox = document.getElementById('stats-box'); // Element ist im HTML vorhanden!

  document.getElementById('canvas').style.display = 'none';
  document.getElementById('game-name').style.display = 'none';

  // 🧹 StatsBox am Anfang immer leeren
  statsBox.innerHTML = "";

  if (win) {
    messageEl.textContent = '🪇 Du hast die Maracas zurückgeholt! 🪇';

    statsBox.innerHTML = `
  <p><span class="stats-coin">🪙 <b>${world.statusBarCoin.coinCount}</b>x</span></p>
  <p><span class="stats-salsa">🌶️ <b>${world.statusBarSalsa.salsaCount}</b>x</span></p>
`;

    statsBox.classList.remove('hidden');

    // ❗ ZUERST Buttons erzeugen …
    buttonContainer.innerHTML = `
      <h2 id="end-message">🪇 Du hast die Maracas zurückgeholt! 🪇</h2>
      <button onclick="nextLevel()">🎸 Gitarre holen</button>
      <button onclick="returnToHome()">🏠 Zurück zum Start</button>
    `;

    // … DANN statsBox wieder anhängen!
    buttonContainer.appendChild(statsBox);

  } else {
    messageEl.textContent = '💀 Du hast verloren!';
    statsBox.classList.add('hidden');

    buttonContainer.innerHTML = `
      <h2 id="end-message">💀 Du hast verloren!</h2>
      <button onclick="restartGame()">🔁 Nochmal spielen</button>
      <button onclick="returnToHome()">🏠 Zurück zum Start</button>
    `;
  }

  endScreen.classList.remove('hidden');
}


/**
 * Spiel neu starten
 */
function restartGame() {
  console.clear();

  canvas = document.getElementById('canvas');  // 🔥 Garantiert, dass Canvas-Referenz stimmt

  // 🛠 stats-box neu erstellen!
  const oldStatsBox = document.getElementById('stats-box');
  if (oldStatsBox) oldStatsBox.remove();

  const newStatsBox = document.createElement('div');
  newStatsBox.id = "stats-box";
  newStatsBox.classList.add("hidden");
  document.querySelector('#end-screen .menu-box').appendChild(newStatsBox);

  document.getElementById('end-screen').classList.add('hidden');
  startGame();
}





function nextLevel() {
  // document.getElementById('end-screen').classList.add('hidden');
  console.log("🎸 Nächster Level wird geladen...");

  // Hier könntest du dein Level-2-Setup starten:
  // z.B. loadLevel2();
  // oder einfach ein Platzhalter:
  alert("Level 2: Hol dir die Gitarre! (noch in Arbeit 😎)");

}


/**
 * Zurück zum Startscreen
 */
function returnToHome() {
  stopGame();

  // Musik & Timer anhalten (zur Sicherheit)
  if (world && world.countdown) {
    world.countdown.stopCountdown();
  }

  // Endscreen ausblenden (optional – Seite lädt gleich neu)
  document.getElementById('end-screen').classList.add('hidden');
  document.getElementById('canvas').style.display = 'none';
  document.getElementById('game-name').style.display = 'none';
  document.getElementById('start-screen').classList.add('hidden');

  // 🔄 Seite komplett neu laden
  location.reload();
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