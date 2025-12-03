class Countdown extends DrawableObject {
  constructor() {
    super();
    this.currentMusic = "normal";
    this.imagePath = 'img/11_countdown/3208749.png';
    this.loadImage(this.imagePath);

    this.height = 30;
    this.width = 30;
    this.x = 320;
    this.y = 22;

    this.countdownTime = 120; // Sekunden
    this.countdownInterval = null;
    this.isStarted = false;
    this.isPaused = false;

    // 🎶 Hintergrundmusik
    this.bgMusic1 = new Audio('audio/background-sound-1.mp3');
    this.bgMusic2 = new Audio('audio/background-sound-2.mp3');
    this.bgMusic1.loop = true;
    this.bgMusic2.loop = true;
    this.bgMusic1.volume = 0.4;
    this.bgMusic2.volume = 0.6;

    // 🎶 Endboss-Musik
    this.endBossMusic = new Audio('audio/endBoss-breich.mp3');
    this.endBossMusic.loop = true;
    this.endBossMusic.volume = 0.7;

    // ⏰ NEU: Slow-Clock Sound (bei 1:00)
    this.slowClockSound = new Audio('audio/slow-clock.mp3');
    this.slowClockSound.volume = 0.7;

    // ✨ NEU: Blinken
    this.isBlinking = false;
    this.blinkVisible = true;
  }
  /**
   * Startet den Countdown und die Musik – nur einmal
   */

  startCountdown() {
    if (this.isStarted) return;
    this.isStarted = true;
    this.isPaused = false;
    this.playBackgroundMusic();

    this.countdownInterval = setInterval(() => {
      if (this.isPaused) return;
      this.countdownTime--;

      // ⏰ Trigger bei 1:00 (60 Sekunden)
      if (this.countdownTime === 60) {
        this.triggerOneMinuteWarning();
      }

      // ⏰ NEU: Trigger auch bei 0:07 Sekunden
      if (this.countdownTime === 7) {
        this.triggerOneMinuteWarning();
      }

      if (this.countdownTime <= 0) {
        this.stopCountdown();

        if (this.world && this.world.character && !this.world.character.isDying) {
          const pepe = this.world.character;
          pepe.energy = 0;
          this.world.statusBar.setPercentage(0);
          pepe.isDead = true;

          pepe.playDeathAnimation();
          pepe.startFallingWhenDead();

          // 👉 Einheitlicher Game-Over-Call
          this.world.endGame(false);
        }
      }


    }, 1000);
  }


  /**
   * 🎧 Startet normale Hintergrundmusik
   */
  playBackgroundMusic() {
    this.currentMusic = "normal";
    this.bgMusic1.currentTime = 0;
    this.bgMusic2.currentTime = 0;
    this.bgMusic1.playbackRate = 1.0;
    this.bgMusic2.playbackRate = 1.0;

    this.bgMusic1.play().catch(e => console.warn(e));
    this.bgMusic2.play().catch(e => console.warn(e));
  }

  /**
 * Wird aufgerufen, wenn Countdown bei 1:00 ist
 */
  triggerOneMinuteWarning() {
    if (this.isBlinking) return; // falls bereits aktiv → nicht nochmal starten

    this.isBlinking = true;
    this.slowClockSound.play().catch(e => console.warn(e));

    let blinkCount = 0;
    const blinkInterval = setInterval(() => {
      this.blinkVisible = !this.blinkVisible;
      blinkCount++;
      if (blinkCount >= 7 * 2) { // 7 Blinks (an/aus)
        clearInterval(blinkInterval);
        this.isBlinking = false;
        this.blinkVisible = true;
      }
    }, 500);
  }



  /**
   * 🛑 Countdown & Musik stoppen
   */
  stopCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this.countdownTime = 0;
    this.isStarted = false;

    // 🎵 Alles stoppen
    [this.bgMusic1, this.bgMusic2, this.endBossMusic, this.slowClockSound].forEach(audio => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }


  /**
   * 🔊 Wechselt zur Endboss-Musik
   */
  playEndBossMusic() {
    if (this.currentMusic !== "endboss") {
      this.currentMusic = "endboss";

      // Normale Musik stoppen
      this.bgMusic1.pause();
      this.bgMusic2.pause();

      // Endboss-Musik starten (ohne Reset!)
      this.endBossMusic.play().catch(e => console.warn(e));
    }
  }


  /**
   * ⏸ Musik pausieren
   */
  pauseAllMusic() {
    try {
      if (this.bgMusic1 && !this.bgMusic1.paused) this.bgMusic1.pause();
      if (this.bgMusic2 && !this.bgMusic2.paused) this.bgMusic2.pause();
      if (this.endBossMusic && !this.endBossMusic.paused) this.endBossMusic.pause();
      if (this.slowClockSound && !this.slowClockSound.paused) this.slowClockSound.pause(); // ⬅️ HIER NEU!

    } catch (e) {
      console.warn("Fehler beim Pausieren der Musik:", e);
    }
  }


  resumeAllMusic() {
    try {
      if (this.currentMusic === "endboss") {
        this.endBossMusic.play().catch(e => console.warn("Endboss-Musik Resume-Fehler:", e));
      } else {
        this.bgMusic1.play().catch(e => console.warn("bgMusic1 Resume-Fehler:", e));
        this.bgMusic2.play().catch(e => console.warn("bgMusic2 Resume-Fehler:", e));

        if (this.isBlinking) {  // Nur, wenn Slow-Clock aktiv ist
          this.slowClockSound.play().catch(e => console.warn("slowClock Resume-Fehler:", e));
        }
      }
    } catch (e) {
      console.warn("Fehler beim Fortsetzen der Musik:", e);
    }
  }



  /**
   * 🕓 Countdown einfrieren
   */
  pauseCountdown() {
    this.isPaused = true;
  }

  /**
   * ▶️ Countdown fortsetzen
   */
  resumeCountdown() {
    if (!this.isStarted) {
      this.startCountdown(); // falls noch nicht gestartet → starten
    }
    this.isPaused = false;
  }

  /**
   * ⏱ Zeit formatieren
   */
  draw(ctx) {
    super.draw(ctx);

    // ⏱ Wenn blinkt → nur manchmal anzeigen
    if (!this.isBlinking || this.blinkVisible) {
      ctx.font = "24px comic sans serif";
      ctx.fillStyle = "black";
      ctx.fillText(this.formatTime(), this.x + this.width - 320, this.y + 2);
    }
  }

  formatTime() {
    const minutes = Math.floor(this.countdownTime / 60);
    const seconds = this.countdownTime % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }
}
