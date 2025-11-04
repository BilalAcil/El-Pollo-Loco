class Countdown extends DrawableObject {
  constructor() {
    super();
    this.currentMusic = "normal"; // "normal" oder "endboss"
    this.imagePath = 'img/11_countdown/3208749.png';
    this.loadImage(this.imagePath);

    this.height = 30;
    this.width = 30;
    this.x = 320;
    this.y = 22;

    this.countdownTime = 300; // Countdown time in seconds
    this.countdownInterval = null;

    // 🎶 Zwei Hintergrundmusiken
    this.bgMusic1 = new Audio('audio/background-sound-1.mp3');
    this.bgMusic2 = new Audio('audio/background-sound-2.mp3');

    // Beide Musikstücke auf Dauerschleife und Lautstärke einstellen
    this.bgMusic1.loop = true;
    this.bgMusic2.loop = true;
    this.bgMusic1.volume = 0.4; // etwas leiser
    this.bgMusic2.volume = 0.6; // etwas stärker

    // 🎶 Endboss-Musik
    this.endBossMusic = new Audio('audio/endBoss-breich.mp3');
    this.endBossMusic.loop = true;
    this.endBossMusic.volume = 0.7;

    this.startCountdown();
  }

  startCountdown() {
    // 🎵 Beide Hintergrundmusiken gleichzeitig starten
    this.playBackgroundMusic();

    this.countdownInterval = setInterval(() => {
      this.countdownTime--;

      if (this.countdownTime <= 0) {
        this.stopCountdown(); // Countdown & Musik stoppen

        // Wenn Welt existiert → Charakter "stirbt"
        if (this.world && this.world.character) {
          this.world.character.energy = 0;
          this.world.character.isDead = true;
          this.world.character.playAnimation(this.world.character.IMAGES_DEAD);
          this.world.statusBar.setPercentage(0);
        }
      }
    }, 1000);
  }

  // 🎧 Hintergrundmusik starten
  playBackgroundMusic() {
    this.currentMusic = "normal";

    this.bgMusic1.currentTime = 0;
    this.bgMusic2.currentTime = 0;
    this.bgMusic1.playbackRate = 1.0;
    this.bgMusic2.playbackRate = 1.0;

    this.bgMusic1.play().catch(e => console.warn(e));
    this.bgMusic2.play().catch(e => console.warn(e));
  }


  // 🛑 Countdown & Musik stoppen
  stopCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this.countdownTime = 0;

    // Musik stoppen
    this.bgMusic1.pause();
    this.bgMusic2.pause();

    // Zeitsprung zurücksetzen, damit sie beim Neustart von vorne beginnen
    this.bgMusic1.currentTime = 0;
    this.bgMusic2.currentTime = 0;
  }

  formatTime() {
    const minutes = Math.floor(this.countdownTime / 60);
    const seconds = this.countdownTime % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }

  // 🔊 Wechselt zur Endboss-Musik
  playEndBossMusic() {
    this.currentMusic = "endboss";

    // Normale Musik stoppen
    this.bgMusic1.pause();
    this.bgMusic2.pause();
    this.bgMusic1.currentTime = 0;
    this.bgMusic2.currentTime = 0;

    // Endboss-Musik starten
    this.endBossMusic.currentTime = 0;
    this.endBossMusic.play().catch(e => console.warn(e));
  }



  draw(ctx) {
    super.draw(ctx);
    ctx.font = "24px comic sans serif";
    ctx.fillStyle = "black";
    ctx.fillText(this.formatTime(), this.x + this.width - 320, this.y + 2);
  }

  // 🛑 Musik pausieren (für Pause)
  pauseAllMusic() {
    this.bgMusic1.pause();
    this.bgMusic2.pause();
    this.endBossMusic.pause();
  }

  // ▶️ Musik fortsetzen (für Resume)
  resumeAllMusic() {
    // Prüfe, welche Musik zuletzt aktiv war
    if (this.currentMusic === "endboss") {
      this.endBossMusic.play().catch(e => console.warn(e));
    } else {
      this.bgMusic1.play().catch(e => console.warn(e));
      this.bgMusic2.play().catch(e => console.warn(e));
    }
  }


  // 🕓 Countdown einfrieren
  pauseCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    console.log("⏸️ Countdown pausiert");
  }

  // ▶️ Countdown fortsetzen
  resumeCountdown() {
    if (this.countdownInterval) return; // schon aktiv

    this.countdownInterval = setInterval(() => {
      this.countdownTime--;

      if (this.countdownTime <= 0) {
        this.stopCountdown(); // Countdown & Musik stoppen
        if (this.world && this.world.character) {
          this.world.character.energy = 0;
          this.world.character.isDead = true;
          this.world.character.playAnimation(this.world.character.IMAGES_DEAD);
          this.world.statusBar.setPercentage(0);
        }
      }
    }, 1000);

    console.log("▶️ Countdown fortgesetzt");
  }


}

