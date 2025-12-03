class Character extends MovableObject {

  height = 280;
  width = 120;
  y = 0;
  speed = 10;
  isDying = false; // Neue Variable, um mehrfaches Auslösen zu verhindern

  IMAGES_IDLE = [
    'img/2_character_pepe/1_idle/idle/I-1.png',
    'img/2_character_pepe/1_idle/idle/I-2.png',
    'img/2_character_pepe/1_idle/idle/I-3.png',
    'img/2_character_pepe/1_idle/idle/I-4.png',
    'img/2_character_pepe/1_idle/idle/I-5.png',
    'img/2_character_pepe/1_idle/idle/I-6.png',
    'img/2_character_pepe/1_idle/idle/I-7.png',
    'img/2_character_pepe/1_idle/idle/I-8.png',
    'img/2_character_pepe/1_idle/idle/I-9.png',
    'img/2_character_pepe/1_idle/idle/I-10.png'
  ];

  IMAGES_LONG_IDLE = [
    'img/2_character_pepe/1_idle/long_idle/I-11.png',
    'img/2_character_pepe/1_idle/long_idle/I-12.png',
    'img/2_character_pepe/1_idle/long_idle/I-13.png',
    'img/2_character_pepe/1_idle/long_idle/I-14.png',
    'img/2_character_pepe/1_idle/long_idle/I-15.png',
    'img/2_character_pepe/1_idle/long_idle/I-16.png',
    'img/2_character_pepe/1_idle/long_idle/I-17.png',
    'img/2_character_pepe/1_idle/long_idle/I-18.png',
    'img/2_character_pepe/1_idle/long_idle/I-19.png',
    'img/2_character_pepe/1_idle/long_idle/I-20.png'
  ];

  IMAGES_WALKING = [
    'img/2_character_pepe/2_walk/W-21.png',
    'img/2_character_pepe/2_walk/W-22.png',
    'img/2_character_pepe/2_walk/W-23.png',
    'img/2_character_pepe/2_walk/W-24.png',
    'img/2_character_pepe/2_walk/W-25.png',
    'img/2_character_pepe/2_walk/W-26.png',
  ];

  IMAGES_JUMPING = [
    'img/2_character_pepe/3_jump/J-31.png',
    'img/2_character_pepe/3_jump/J-32.png',
    'img/2_character_pepe/3_jump/J-33.png',
    'img/2_character_pepe/3_jump/J-34.png',
    'img/2_character_pepe/3_jump/J-35.png'
  ];

  IMAGES_FALLING = [
    'img/2_character_pepe/3_jump/J-36.png',
    'img/2_character_pepe/3_jump/J-37.png',
    'img/2_character_pepe/3_jump/J-38.png',
    'img/2_character_pepe/3_jump/J-39.png'
  ];

  IMAGES_DEAD = [
    'img/2_character_pepe/5_dead/D-51.png',
    'img/2_character_pepe/5_dead/D-53.png',
    'img/2_character_pepe/5_dead/D-54.png'
  ];

  IMAGES_HURT = [
    'img/2_character_pepe/4_hurt/H-41.png',
    'img/2_character_pepe/4_hurt/H-42.png',
    'img/2_character_pepe/4_hurt/H-43.png'
  ];

  IMAGES_THROW = [
    'img/2_character_pepe/2_walk/W-21.png',
    'img/2_character_pepe/2_walk/W-22.png',
    'img/2_character_pepe/2_walk/W-23.png'
  ];

  world;
  currentAnimation = 'idle';
  animationFinished = true;
  isThrowing = false;         // <<< NEU: Flag während Wurfanimation
  lastActionTime = 0;
  actionCooldown = 500; // Zeit in ms nach der zum Idle gewechselt wird

  constructor() {
    super().loadImage('img/2_character_pepe/1_idle/idle/I-1.png');
    this.loadImages(this.IMAGES_IDLE);
    this.loadImages(this.IMAGES_THROW);
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_DEAD);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_LONG_IDLE); // Long Idle Bilder laden
    this.applyGravity();
    this.atEndboss = false;
    this.animate();
    this.lastGlobalHit = 0;
    this.throwSound = new Audio('audio/throw-sound-1.mp3');
    this.throwSound.volume = 0.4; // etwas leiser
    this.showIdle = false;
    this.lastMoveTime = Date.now();
    this.idleAnimationStarted = false;
    this.longIdleActive = false; // Neue Eigenschaft für Long Idle
    this.longIdleInterval = null; // Für die Long Idle Animation
  }

  pauseStartTime = 0;  // Wann die Pause begonnen hat
  totalPausedTime = 0; // Wie viel Zeit insgesamt pausiert war


  // Kollisionsbox Character
  get collisionBox() {
    return {
      x: this.x + 10, // Etwas von links verschieben
      y: this.y + 100, // Hitbox nach unten verschieben (Kopfbereich ausschließen)
      width: this.width - 20, // Breite reduzieren für schmalere Hitbox
      height: this.height - 110 // Höhe reduzieren (Kopf und Füße ausschließen)
    };
  }

  isAboveGround() {
    // Hier muss der "Boden" definiert werden
    // Wenn du unterschiedliche Bodenhöhen hast, musst du das hier anpassen
    const groundLevel = 155; // oder 156 - je nachdem wo dein Boden ist

    return this.y < groundLevel;
  }


  drawFrame(ctx) {
    if (this instanceof Character) {
      const box = this.collisionBox;
      ctx.beginPath();
      ctx.lineWidth = "1";
      ctx.strokeStyle = "transparent"; // Andere Farbe für Character
      // Relative Position zur Hitbox zeichnen
      ctx.rect(box.x - this.x, box.y - this.y, box.width, box.height);
      ctx.stroke();
    }
  }


  animate() {
    // Bewegung und Kamera
    setInterval(() => {
      if (this.isPaused) return;  // ⏸ Bewegung einfrieren
      if (this.atEndboss) {
        this.world.camera_x = -4100 + 100;
      } else {
        this.world.camera_x = -this.x + 100;
      }

      // 🧩 Knockback-Bewegung automatisch verarbeiten
      if (this.knockbackActive) {
        this.x += this.speedX;

        // Reibung / allmähliches Stoppen
        this.speedX *= 0.9;

        // Wenn fast gestoppt, Knockback beenden
        if (Math.abs(this.speedX) < 1) {
          this.knockbackActive = false;
          this.speedX = 0;
        }

      }

      // 🧩 Bewegung deaktivieren, wenn Welt pausiert ist
      if (this.world.isPaused) return;

      // 🛑 Spieler eingefroren?
      if (this.freezeForBodyguard)
        return;

      // Bewegung
      if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x) {
        this.moveRight();
        this.otherDirection = false;
        this.handleMovement();
      }

      if (
        this.world.keyboard.LEFT &&
        this.x > 0 &&
        (!this.atEndboss || this.x > 3980)
      ) {
        this.moveLeft();
        this.otherDirection = true;
        this.handleMovement();
      }

      if (this.world.keyboard.SPACE && !this.isAboveGround()) {
        this.jump();
        this.handleMovement();
      }

      // 👉 WURF-ANIMATION (Taste D)
      if (this.world.keyboard.D && this.animationFinished) {
        this.throwAnimation();
        this.lastActionTime = Date.now();
        this.lastMoveTime = Date.now();
      }

      // Endboss-Bereich aktivieren
      if (this.x >= 4100 && !this.atEndboss) {
        this.atEndboss = true;

        // Musik abspielen
        if (this.world && this.world.countdown) {
          this.world.countdown.playEndBossMusic();
        }

        // Spieler anhalten
        this.freezeForBodyguard = true;

        // 📌 BODYGUARD herunterspringen lassen
        if (this.world.bodyguard && !this.world.bodyguard.hasJumped) {
          this.world.bodyguard.jumpToEndboss();
          this.world.bodyguard.hasJumped = true;   // verhindert mehrfachen Aufruf
        }

      }



      // Zur Idle-Animation wechseln nach Inaktivität
      if (
        Date.now() - this.lastActionTime > this.actionCooldown &&
        !this.isAboveGround() &&
        !this.isHurt() &&
        !this.isDead() &&
        this.currentAnimation !== 'idle'
      ) {
        this.currentAnimation = 'idle';
      }
    }, 1000 / 60);



    // Animation
    setInterval(() => {
      if (this.isPaused) return;
      if (this.isThrowing) return;

      // 🛑 Wenn Bodyguard landet → Pepe zeigt EIN Standbild
      if (this.freezeForBodyguard) {
        this.loadImage('img/2_character_pepe/3_jump/J-31.png');
        return; // keine Animation abspielen
      }

      // 👉 Berechnung, wie lange der Spieler "effektiv" schon inaktiv ist
      // (also seit der letzten Bewegung)
      let effectiveIdleTime = Date.now() - this.lastMoveTime;

      // Falls pausiert war, wird die Zeit, in der das Spiel pausiert war,
      // von der Inaktivitäts-Zeit abgezogen, damit Pausen nicht als "idle" zählen.
      if (this.isPaused && this.pauseStartTime) {
        effectiveIdleTime -= (Date.now() - this.pauseStartTime);
      }

      // 💤 Logik für Idle-Zustände (stehen) und Long-Idle (lange nichts gemacht)

      // 1. Charakter ist tot → Todesanimation abspielen
      if (this.energy <= 0) {
        this.stopLongIdleAnimation();     // Long-Idle ggf. stoppen
        this.playDeathAnimation();        // Todes-Animation starten

        // 2. Charakter ist verletzt → Hurt-Animation
      } else if (this.isHurt()) {
        this.stopLongIdleAnimation();
        this.playAnimation(this.IMAGES_HURT);

        // 3. Charakter ist in der Luft → Sprung-Animation
      } else if (this.isAboveGround()) {
        this.stopLongIdleAnimation();
        this.handleJumpAnimation();

        // 4. Charakter bewegt sich nach links oder rechts → Lauf-Animation
      } else if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
        this.stopLongIdleAnimation();
        this.playAnimation(this.IMAGES_WALKING);

        // 5. Charakter steht länger als 12 Sekunden rum → Long-Idle-Animation
      } else if (effectiveIdleTime > 12000) {
        // Nur starten, wenn sie noch nicht läuft
        if (!this.longIdleActive) this.startLongIdleAnimation();

        // 6. Charakter steht länger als 10 Sekunden, aber weniger als 12 Sekunden → normale Idle-Animation
      } else if (effectiveIdleTime > 10000) {
        // Nur einmal starten
        if (!this.idleAnimationStarted) this.playIdleAnimation();

        // 7. Standardfall: Charakter steht, aber noch nicht lange genug für Idle/Long-Idle
      } else {
        this.stopLongIdleAnimation();       // sicherstellen, dass Long-Idle gestoppt ist
        this.loadImage(this.IMAGES_IDLE[0]); // erstes Idle-Bild anzeigen
      }

    }, 50); // Animations-Update alle 50ms (~20 FPS)


  }

  // 🧩 Alles pausieren (Animation + Bewegung)
  pause() {
    if (this.isPaused) return;
    this.isPaused = true;
    this.pauseStartTime = Date.now();
  }

  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;

    // Zeitausgleich, damit Idle-Timer korrekt bleibt
    if (this.pauseStartTime) {
      const pausedDuration = Date.now() - this.pauseStartTime;
      this.lastMoveTime += pausedDuration;
    }
  }




  handleJumpAnimation() {
    if (this.speedY > 0) {
      // Springen - zeige Bilder basierend auf Fortschritt
      const progress = Math.min(1, this.speedY / 1); // Angepasst für realistischere Progression
      const frameIndex = Math.floor(progress * (this.IMAGES_JUMPING.length - 1));
      this.loadImage(this.IMAGES_JUMPING[frameIndex]);
    } else if (this.speedY < 0) {
      // Fallen - zeige Bilder basierend auf Fallgeschwindigkeit
      const progress = Math.min(1, Math.abs(this.speedY) / 20);
      const frameIndex = Math.floor(progress * (this.IMAGES_FALLING.length - 1));
      this.loadImage(this.IMAGES_FALLING[frameIndex]);
    } else {
      // Höchster Punkt
      this.loadImage(this.IMAGES_JUMPING[this.IMAGES_JUMPING.length - 1]);
    }
  }

  handleMovement() {
    this.lastMoveTime = Date.now();
    this.idleAnimationStarted = false;
    this.stopLongIdleAnimation();
  }

  throwAnimation() {
    // blockiere weitere Würfe
    if (!this.animationFinished || this.isThrowing) return;

    // 🎯 Prüfen, ob überhaupt Flaschen da sind
    if (this.world.statusBarSalsa.salsaCount <= 0) {
      const failSound = new Audio('audio/Fail.mp3');
      failSound.volume = 0.4;
      failSound.playbackRate = 2; // etwas schneller
      failSound.play().catch(e => console.warn('Fail sound error:', e));

      // ✨ NEU: Salsa-Anzeige blinken lassen
      this.world.statusBarSalsa.blinkOnFail();

      return; // ❌ keine Animation, kein Wurf
    }

    this.animationFinished = false;
    this.isThrowing = true;
    this.lastActionTime = Date.now(); // verhindert, dass sofort Idle startet

    // 🎵 Sound für den eigentlichen Wurf
    this.throwSound.currentTime = 0;
    this.throwSound.play().catch(e => console.warn('Throw sound error:', e));

    const throwImages = this.IMAGES_THROW;
    let current = 0;
    const frameDuration = 50;

    const interval = setInterval(() => {
      const path = throwImages[current];
      if (path) this.loadImage(path);
      current++;

      if (current >= throwImages.length) {
        clearInterval(interval);

        setTimeout(() => {
          // ✅ Nur hier Salsa-Flasche erzeugen, da wir garantiert mindestens 1 hatten
          this.world.statusBarSalsa.salsaCount--;

          const offsetX = this.otherDirection ? -50 : 100;
          const salsa = new SalsaThrow(
            this.x + offsetX,
            this.y + this.height / 2 + 20, // realistischer Startpunkt
            this.otherDirection
          );
          this.world.throwableObjects.push(salsa);

          // Zurück zur Idle-Animation
          this.loadImage(this.IMAGES_IDLE[0]);
          this.animationFinished = true;
          this.isThrowing = false;
        }, 50);
      }
    }, frameDuration);
  }


  startLongIdleAnimation() {
    this.longIdleActive = true;
    this.idleAnimationStarted = false;
    let currentImageIndex = 0;

    this.longIdleInterval = setInterval(() => {
      // ➡️ Wenn das Spiel oder der Charakter pausiert ist, einfach warten
      if (this.isPaused || (this.world && this.world.isPaused)) return;

      // Prüfen ob Bewegung stattfindet
      if (Date.now() - this.lastMoveTime < 12000) {
        this.stopLongIdleAnimation();
        return;
      }

      // Long Idle Animation in Schleife abspielen
      this.loadImage(this.IMAGES_LONG_IDLE[currentImageIndex]);
      currentImageIndex = (currentImageIndex + 1) % this.IMAGES_LONG_IDLE.length;
    }, 200);

  }

  stopLongIdleAnimation() {
    if (this.longIdleInterval) {
      clearInterval(this.longIdleInterval);
      this.longIdleInterval = null;
    }
    this.longIdleActive = false;
  }

  playIdleAnimation() {
    this.idleAnimationStarted = true;
    let currentImage = 0;

    const idleInterval = setInterval(() => {
      // Prüfen ob Bewegung stattfindet oder Long Idle beginnen sollte
      if (Date.now() - this.lastMoveTime < 10000 || Date.now() - this.lastMoveTime > 12000) {
        clearInterval(idleInterval);
        this.idleAnimationStarted = false;
        return;
      }

      if (currentImage < this.IMAGES_IDLE.length) {
        this.loadImage(this.IMAGES_IDLE[currentImage]);
        currentImage++;
      } else {
        // Bei letztem Bild stehen bleiben
        this.loadImage(this.IMAGES_IDLE[this.IMAGES_IDLE.length - 1]);
      }
    }, 200);
  }



  // 🧩 NEU: Todesanimation (Pepe rutscht aus dem Bild)
  playDeathAnimation() {
    if (this.isDying) return; // Mehrfaches Starten verhindern
    this.isDying = true;
    if (this.world) {
      this.world.pauseAllMovements();
    }
    this.animationFinished = false;

    // 🎵 Death-Sound + zusätzlicher Fail-Sound gleichzeitig abspielen
    setTimeout(() => {
      // Haupt-Todessound
      this.deathSound = new Audio('audio/dead-sound.mp3');
      this.deathSound.volume = 0.6;
      this.deathSound.play().catch(e => console.warn('Death sound error:', e));

      // Zusätzlicher Fail-Sound
      this.failSound = new Audio('audio/Fail-2.mp3');
      this.failSound.volume = 0.2;       // etwas lauter als der Todessound
      this.failSound.playbackRate = 0.7; // Geschwindigkeit
      this.failSound.play().catch(e => console.warn('Fail-2 sound error:', e));
    }, 500);

    let frameIndex = 0;
    const frameInterval = 250; // Zeit pro Frame (ms)
    let fallVelocity = 0;
    const gravity = 0.5; // Wie schnell Pepe nach unten fällt

    const deathInterval = setInterval(() => {
      // 1️⃣ Todesbilder nacheinander abspielen
      if (frameIndex < this.IMAGES_DEAD.length) {
        this.loadImage(this.IMAGES_DEAD[frameIndex]);
        frameIndex++;
      }

      // 2️⃣ Pepe langsam nach unten bewegen
      fallVelocity += gravity;
      this.y += fallVelocity;

      // 3️⃣ Wenn Pepe aus dem Bild ist → stoppen
      if (this.y > 480 || frameIndex >= this.IMAGES_DEAD.length) {
        clearInterval(deathInterval);
        this.animationFinished = true;
        this.loadImage(this.IMAGES_DEAD[this.IMAGES_DEAD.length - 1]);
      }
    }, frameInterval);
  }


  // ★★★ NEUE METHODE: Pepe soll fallen, wenn er tot ist ★★★
  startFallingWhenDead() {
    // Verhindert, dass mehrere Intervalle gleichzeitig laufen
    if (this.fallingInterval) return;

    // Intervall starten (30 Mal pro Sekunde)
    this.fallingInterval = setInterval(() => {
      // Wenn Pepe tot oder im Sterben ist …
      if (this.isDead || this.isDying) {
        this.y += 3; // Geschwindigkeit des Fallens

        // Sobald Pepe komplett außerhalb des Bildschirms ist …
        if (this.y > 600) {
          clearInterval(this.fallingInterval); // Intervall stoppen
          this.removeFromWorld(); // Aus der Spielwelt entfernen
        }
      }
    }, 1000 / 30); // 30 FPS (Bilder pro Sekunde)
  }

  // ★★★ NEUE METHODE: Aus der Spielwelt entfernen ★★★
  removeFromWorld() {
    if (this.world) {
      // Index des Gegners im Array finden
      const index = this.world.level.enemies.indexOf(this);

      // Wenn Pepe existiert, entferne ihn aus dem Array
      if (index > -1) {
        this.world.level.enemies.splice(index, 1);
      }
    }
  }




  applyGravity() {
    setInterval(() => {
      // 🧠 Wenn Pepe stirbt oder tot ist → keine Gravitation mehr
      if (this.energy <= 0 || this.isDying) {
        return;
      }

      let previousY = this.y;
      let previousSpeedY = this.speedY;

      // Gravity anwenden
      if (this.isAboveGround() || this.speedY > 0) {
        this.y -= this.speedY;
        this.speedY -= this.acceleration;
      }

      // Character auf Boden-Position fixieren
      if (!this.isAboveGround() && this.speedY <= 0) {
        this.y = 155;
        this.speedY = 0;
      }
    }, 1000 / 25);
  }
}