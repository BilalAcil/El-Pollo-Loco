let isMuted = false;
let canvas;
let world;
let keyboard = new Keyboard();
let gameInitialized = false;

/**
 * Wird ausgeführt, sobald DOM geladen ist.
 */
window.addEventListener("DOMContentLoaded", init);

/**
 * Initialisiert die Seite, aber startet das Spiel noch nicht.
 * Hier wird nur der Startbildschirm vorbereitet.
 */
function init() {
  canvas = document.getElementById('canvas');

  if (!canvas) {
    console.error("❌ Canvas nicht gefunden!");
    return;
  }

  // Startscreen anzeigen, Spielbereich verstecken
  document.getElementById('start-screen').classList.remove('hidden');
  document.getElementById('canvas').style.display = 'none';
  document.getElementById('game-name').style.display = 'none';
  document.getElementById('end-screen').classList.add('hidden');
}

/**
 * Erzeugt einmalig die World, damit ALLE Assets (Pepe, Statusbars, Coins, etc.)
 * schon beim Laden der Seite vorgeladen werden.
 */
function preloadWorld() {
  if (gameInitialized) return; // nur einmal ausführen
  gameInitialized = true;

  canvas = document.getElementById('canvas');
  if (!canvas) {
    console.error('❌ Canvas nicht gefunden (preloadWorld)!');
    return;
  }

  // ⬇️ deine bisherige Spiel-Initialisierung
  startGameLogic();            // erstellt world = new World(...)

  // ⏸️ direkt pausieren, damit nichts "losläuft", bevor der Spieler startet
  if (world && typeof world.pauseGame === 'function') {
    // 🔥 pausieren OHNE Pause-/Play-Symbol
    world.pauseGame(false);
  } else if (world) {
    world.isPaused = true;
  }

}


/**
 * Startet das Spiel, wenn "Spielen" gedrückt wird.
 */
function startGame() {
  document.getElementById('game-name').style.display = 'block';
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('canvas').style.display = 'block';
  document.getElementById('end-screen').classList.add('hidden');

  setTimeout(() => {
    if (world) {
      // ✅ Ab jetzt dürfen Pause-/Play-Overlays erscheinen
      world.allowPauseOverlay = true;
    }

    if (world && typeof world.resumeGame === 'function') {
      world.resumeGame();
    } else if (world) {
      world.isPaused = false;
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
  // ❗ Daten zuerst retten, bevor die Welt zerstört / gestoppt wird
  const coinCount = world?.statusBarCoin?.coinCount ?? 0;
  const salsaCount = world?.statusBarSalsa?.salsaCount ?? 0;

  // Spiel stoppen (Bewegungen/Intervalle etc.)
  if (typeof stopGame === 'function') {
    stopGame();
  }

  const endScreen = document.getElementById('end-screen');
  if (!endScreen) {
    console.error('❌ end-screen nicht gefunden!');
    return;
  }

  const buttonContainer = endScreen.querySelector('.menu-box');
  if (!buttonContainer) {
    console.error('❌ .menu-box im end-screen nicht gefunden!');
    return;
  }

  // 🧩 Sicherstellen, dass stats-box existiert
  let statsBox = document.getElementById('stats-box');
  if (!statsBox) {
    statsBox = document.createElement('div');
    statsBox.id = 'stats-box';
    statsBox.classList.add('hidden');
    buttonContainer.appendChild(statsBox);
  }

  // 🧹 StatsBox am Anfang immer leeren
  statsBox.innerHTML = "";

  // Canvas + Titel ausblenden
  const canvasEl = document.getElementById('canvas');
  const titleEl = document.getElementById('game-name');
  if (canvasEl) canvasEl.style.display = 'none';
  if (titleEl) titleEl.style.display = 'none';

  if (win) {
    // 🏆 Gewinnscreen
    buttonContainer.innerHTML = `
      <h2 id="end-message">🪇 Du hast die Maracas zurückgeholt! 🪇</h2>
      <button onclick="nextLevel()">🎸 Gitarre holen</button>
      <button onclick="returnToHome()">🏠 Zurück zum Start</button>
    `;

    // statsBox wieder anhängen + füllen
    statsBox.innerHTML = `
      <p><span class="stats-coin">🪙 <b>${coinCount}</b>x</span></p>
      <p><span class="stats-salsa">🌶️ <b>${salsaCount}</b>x</span></p>
    `;
    statsBox.classList.remove('hidden');
    buttonContainer.appendChild(statsBox);

  } else {
    // 💀 Verloren-Screen
    buttonContainer.innerHTML = `
      <h2 id="end-message">💀 Du hast verloren!</h2>
      <button onclick="restartGame()">🔁 Nochmal spielen</button>
      <button onclick="returnToHome()">🏠 Zurück zum Start</button>
    `;

    statsBox.classList.add('hidden'); // hier keine Stats anzeigen
  }

  endScreen.classList.remove('hidden');
}



/**
 * Spiel neu starten
 */
function restartGame() {
  console.clear();

  // 🔧 Sicherstellen, dass Canvas-Referenz stimmt
  canvas = document.getElementById('canvas');

  // 🛑 Alte Welt stoppen (falls stopGame existiert)
  if (typeof stopGame === 'function') {
    stopGame();            // ruft intern vermutlich world.stop()/pauseAllMovements()
  }
  // Referenz auf alte World löschen
  world = null;

  // 🧼 Preload-Flag zurücksetzen, damit preloadWorld erneut eine neue World erzeugt
  gameInitialized = false;

  // 🧠 stats-box aufräumen / neu initialisieren
  const oldStatsBox = document.getElementById('stats-box');
  if (oldStatsBox) {
    oldStatsBox.innerHTML = '';
    oldStatsBox.classList.add('hidden');
  }

  // ENDSCREEN ausblenden, Canvas & Titel wieder zeigen
  document.getElementById('end-screen').classList.add('hidden');
  document.getElementById('canvas').style.display = 'block';
  document.getElementById('game-name').style.display = 'block';

  // 🌍 Neue World erzeugen (wie beim ersten Laden)
  preloadWorld();   // erstellt world = new World(canvas, keyboard) und pausiert sie

  // ⏯️ Kurz warten, dann Spiel wirklich starten
  setTimeout(() => {
    if (world) {
      world.allowPauseOverlay = true; // Pause-Overlay wieder erlauben
      if (typeof world.resumeGame === 'function') {
        world.resumeGame();
      } else {
        world.isPaused = false;
      }
    }
  }, 200);
}






function nextLevel() {
  // document.getElementById('end-screen').classList.add('hidden');

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
  // 🔥 Welt + alle Objekte (Pepe, Statusbars, Coins, etc.) ERZEUGEN
  preloadWorld();

  // 🔥 jetzt lädt DrawableObject alle Bilder dieser Objekte
  await waitForGameAssets();

  const startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.classList.remove('loading', 'hidden');
    startBtn.removeAttribute('disabled');
    startBtn.textContent = '🎮 Spiel starten';
    startBtn.onclick = startGame;
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
      const imagesLoaded = [...document.querySelectorAll('img')].every(img => img.complete);

      const classesReady =
        typeof World !== 'undefined' &&
        typeof level1 !== 'undefined' &&
        typeof Character !== 'undefined' &&
        typeof StatusBar !== 'undefined' &&
        typeof StatusBarCoin !== 'undefined' &&
        typeof StatusBarSalsa !== 'undefined';

      const drawableReady =
        typeof DrawableObject === 'undefined' || DrawableObject.areAllAssetsLoaded();

      const assetsReady =
        classesReady &&
        imagesLoaded &&
        drawableReady;

      if (assetsReady || Date.now() - startTime > timeout) {
        clearInterval(check);
        resolve();
      }
    }, 200);
  });
}


