class World {
  character = new Character();
  level = level1; // Assuming level1 is defined elsewhere
  canvas;
  ctx;
  keyboard;
  countdown = new Countdown(); // Countdown-Objekt
  camera_x = 0;
  statusBar = new StatusBar(); // Assuming StatusBar is defined elsewhere
  statusBarSalsa = new StatusBarSalsa(); // Assuming StatusBarSalsa is defined elsewhere
  statusBarCoin = new StatusBarCoin(); // Assuming StatusBarCoin is defined elsewhere
  bodyguardStatus = null; // Wird erstellt, wenn Bodyguard erscheint
  maracas = null; // Noch nicht sichtbar, wird erst nach Boss-Tod erzeugt
  corncob = new Corncob();
  chickenNest = new ChickenNest();
  bodyguard = new Bodyguard();
  coins = []; // mehrere Münzen statt einer
  salsas = []; // mehrere Salsaflaschen
  throwableObjects = [];


  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.allowPauseOverlay = false;

    // Welt zeichnen und initialisieren
    this.draw();
    this.setWorld();
    this.bodyguard.world = this; // Bodyguard kennt jetzt die Welt
    this.countdown.world = this; // Countdown kennt jetzt die Welt
    this.checkCollisions();
    this.lastEnemyHit = 0;
    this.lastEndbossHit = 0;

    // 🔊 Sounds vorbereiten
    this.healSound = new Audio('audio/heart-1.mp3');
    this.healSound.volume = 0.5;
    this.healSound.load();

    this.endbossHurtSound = new Audio('audio/endboss-hurt.mp3');
    this.endbossHurtSound.volume = 0.6;
    this.endbossHurtSound.load();

    // 🧊 Spiel startet PAUSIERT
    this.isPaused = true;
    this.pauseAllMovements();

    // Charakter, Endboss und Countdown pausieren
    if (this.character) this.character.pause?.();
    if (this.endboss) this.endboss.pause?.();
    if (this.countdown) {
      this.countdown.pauseAllMusic();
      this.countdown.pauseCountdown();
    }

    // ▶️ Play-Symbol zeigen (damit sichtbar ist, dass man starten kann)
    this.showPlaySymbol();

    this.isMaracasSequence = false; // 👈 Neues Flag
  }


  setWorld() {
    this.character.world = this;
    this.coins = this.generateCoins();
    this.salsas = this.generateSalsas();

    const chickens = this.generateChickens();

    //  Restliche Gegner (z.B. Endboss) + Bodyguard übernehmen:
    this.level.enemies = [
      ...chickens,                                                // 🐔 Chickens
      this.bodyguard,                                             // 🛡️ Bodyguard HINZUFÜGEN
      ...this.level.enemies.filter(e =>
        e instanceof Endboss || e instanceof EndBossStatusBar
      )                                                           // 🦹‍♂️ Endboss + HP-Bar
    ];

    this.endboss = this.level.enemies.find(e => e instanceof Endboss);
    this.endbossBar = this.level.enemies.find(e => e instanceof EndBossStatusBar);

    if (this.endboss) {
      this.endboss.world = this;
      this.endboss.energy = 100;
      this.endboss.isDead = false;
    }

    if (this.endbossBar) {
      this.endbossBar.world = this;
      this.endbossBar.setPercentage(100);
    }
  }



  generateChickens() {
    const chickens = [];

    // z.B. 6 normale + 4 kleine
    for (let i = 0; i < 8; i++) {
      chickens.push(new Chicken());
    }
    for (let i = 0; i < 4; i++) {
      chickens.push(new ChickenSmall());
    }

    return chickens;
  }


  checkCollisions() {
    this.collisionInterval = setInterval(() => {
      if (this.isPaused) return; // während Pause nichts prüfen
      const collidedEnemies = [];
      let characterHitEndbossFromAbove = false;

      this.level.enemies.forEach((enemy, index) => {

        // 🟥 FALL 1: Endboss
        if (enemy instanceof Endboss) {
          if (this.character.isColliding(enemy)) {
            const characterBottom = this.character.y + this.character.height;
            const enemyTop = enemy.y;
            const enemyMiddle = enemy.y + enemy.height / 2;

            const hitFromAbove =
              this.character.isAboveGround() &&
              this.character.speedY < 0 &&
              characterBottom < enemyMiddle &&
              characterBottom > enemyTop - 15;

            if (hitFromAbove) {
              characterHitEndbossFromAbove = true;
              enemy.activate();
              enemy.energy = (enemy.energy || 100) - 20;
              this.lastEndbossBounce = Date.now();

              if (this.endbossBar) {
                this.endbossBar.setPercentage(enemy.energy);
              }

              // Rückstoß nach links
              this.character.speedY = 20;
              this.character.speedX = -15;
              this.character.knockbackActive = true;

              if (enemy.energy <= 0 && !enemy.isDead) {
                enemy.isDead = true;

                if (enemy.onDeath) {
                  enemy.onDeath();
                }

                enemy.startFallingWhenDead();
              }
            }
          }
        }

        // 🟦 FALL 2: BODYGUARD
        else if (enemy instanceof Bodyguard) {
          if (this.character.isColliding(enemy) && !enemy.isDead) {

            const characterBottom = this.character.y + this.character.height;
            const enemyTop = enemy.y;
            const enemyMiddle = enemy.y + enemy.height / 2;

            const hitFromAbove =
              this.character.isAboveGround() &&
              this.character.speedY < 0 &&
              characterBottom < enemyMiddle &&
              characterBottom > enemyTop - 15;

            // 🟢 VON OBEN → Bodyguard bekommt Schaden
            if (hitFromAbove) {
              enemy.hit();

              // 🔄 Zufälliger Rückstoß (links/rechts)
              const randomDirection = Math.random() < 0.5 ? -1 : 1;

              // 🟢 Sanfter Rückstoß als beim Endboss
              this.character.speedY = 18;
              this.character.speedX = 10 * randomDirection;
              this.character.knockbackActive = true;

              // 🚧 X-Grenzen absichern (4100–4570)
              setTimeout(() => {
                if (this.character.x < 4100) this.character.x = 4100;
                if (this.character.x > 4570) this.character.x = 4570;
              }, 20);

              return; // verhindert Mehrfachkollision
            }


            // 🔴 SEITLICH → Spieler bekommt Schaden MIT COOLDOWN
            const now = Date.now();
            if (!this.lastBodyguardHit || now - this.lastBodyguardHit > 1000) {

              this.lastBodyguardHit = now; // COOLDOWN aktivieren!

              this.character.hit(); // -=20%
              this.statusBar.setPercentage(this.character.energy);

              if (this.character.energy <= 0) {
                // Spieler stirbt nur EINMAL – nicht mehrfach!
                this.character.isDead = true;
                this.statusBar.setPercentage(0);
                this.character.playDeathAnimation();
                this.character.startFallingWhenDead();
                this.endGame(false);
              }
            }

          }
        }


        // 🟨 FALL 3: andere Gegner (Chicken usw.)
        else {
          if (this.isActualEnemy(enemy) && this.character.isColliding(enemy) && !enemy.isDead) {
            collidedEnemies.push({ enemy, index });
          }
        }

      }); // forEach ENDE

      // 🔥 VERBESSERTE Logik für normale Gegner
      let characterJumpedOnEnemy = false;

      collidedEnemies.forEach(({ enemy, index }) => {
        const characterBottom = this.character.y + this.character.height;
        const enemyTop = enemy.y;

        // ✳️ NEU: größere Toleranz & sichere Prüfung für "von oben"
        const falling = this.character.speedY < 0;
        const verticalOverlap = Math.abs(characterBottom - enemyTop);

        const jumpedOnEnemy =
          falling &&
          verticalOverlap < 40 && // etwas großzügiger als 10–25
          this.character.y + this.character.height / 2 < enemy.y + enemy.height / 2; // Charakter wirklich oberhalb

        if (jumpedOnEnemy && !enemy.isDead) {

          // Gegner sofort töten
          this.killEnemy(enemy, index);

          // ✳️ Charakter "springt ab" — aber mit leichtem Cooldown
          this.character.speedY = 15;
          this.lastEnemyBounce = Date.now();

          characterJumpedOnEnemy = true;
        }
      });


      // Charakter springt ab
      if (characterJumpedOnEnemy) {
        this.character.speedY = 15;
      }

      // 🔥 KORRIGIERT & VERBESSERT: Endboss mit COOLDOWN und Bounce-Immunität
      const recentlyBouncedOnEndboss =
        this.lastEndbossBounce && Date.now() - this.lastEndbossBounce < 400;

      if (!characterHitEndbossFromAbove && !recentlyBouncedOnEndboss) {
        this.level.enemies.forEach((enemy) => {
          if (enemy instanceof Endboss && this.character.isColliding(enemy) && !enemy.isDead) {
            const now = Date.now();
            if (!this.lastEndbossHit || now - this.lastEndbossHit > 1000) {
              this.lastEndbossHit = now;

              // ⛔ HIER NEU: Heilung abbrechen falls gerade aktiv
              if (this.statusBar.stopBlink) this.statusBar.stopBlink();
              this.healSound.pause();
              this.healSound.currentTime = 0;

              this.character.hit();
              this.statusBar.setPercentage(this.character.energy);

              if (this.character.energy <= 0) {
                this.character.isDead = true;
                this.statusBar.setPercentage(0);

                this.character.playDeathAnimation();
                this.character.startFallingWhenDead();
                this.endGame(false);
              }
            }
          }
        });
      }


      // 🔥 VERBESSERT: Normale Gegner mit COOLDOWN
      // 👇 verhindert, dass sofort nach einem Sprung Schaden ausgelöst wird
      const recentlyBounced = this.lastEnemyBounce && Date.now() - this.lastEnemyBounce < 200;

      if (!characterJumpedOnEnemy && !recentlyBounced) {
        collidedEnemies.forEach(({ enemy }) => {
          if (!enemy.isDead) {
            const now = Date.now();

            // 🛡️ GLOBALER TREFFER-COOLDOWN (gilt für alle Gegner)
            const recentlyHit = this.character.lastGlobalHit && now - this.character.lastGlobalHit < 1300;
            if (recentlyHit) {
              return; // während der Immunzeit kein weiterer Schaden
            }

            // 🔥 Bisheriger Gegner-spezifischer Cooldown
            if (!this.lastEnemyHit || now - this.lastEnemyHit > 800) {
              this.lastEnemyHit = now;
              this.character.lastGlobalHit = now;

              // ⛔ Heilung abbrechen (Blink & Sound stoppen)
              if (this.statusBar.stopBlink) this.statusBar.stopBlink();
              this.healSound.pause();
              this.healSound.currentTime = 0;

              this.character.hit();
              this.statusBar.setPercentage(this.character.energy);

              if (this.character.energy <= 0) {
                this.character.isDead = true;
                this.statusBar.setPercentage(0);

                this.character.playDeathAnimation();
                this.character.startFallingWhenDead();
                this.endGame(false);
              }
            }
            return;
          }
        });
      }


      // 💥 Salsa-Flaschen treffen Gegner (Endboss, Bodyguard, Chicken, Küken)
      this.throwableObjects.forEach((salsa, index) => {
        this.level.enemies.forEach((enemy) => {
          if (
            !enemy.isDead &&
            !salsa.hasHit &&
            salsa.isColliding(enemy)
          ) {
            salsa.hasHit = true;
            salsa.stopSound();

            // 🎵 Treffer-Sound
            const hitSound = new Audio('audio/hit-sound.mp3');
            hitSound.volume = 0.5;
            hitSound.play().catch(e => console.warn('Hit sound error:', e));

            // 💥 Splash-Animation der Flasche
            salsa.splashAnimation(() => {
              this.throwableObjects.splice(index, 1);
            });

            // 🆕 BODYGUARD-SCHADEN
            if (enemy instanceof Bodyguard) {
              enemy.hit();  // Dabei wird das Leben automatisch abgezogen!
              return;
            }

            // 🧩 Je nach Gegnertyp unterschiedlich reagieren
            if (enemy instanceof Endboss) {
              // 🦹‍♂️ Endboss verliert Energie
              enemy.activate();
              enemy.energy = (enemy.energy || 100) - 20;

              if (this.endbossBar) {
                this.endbossBar.setPercentage(enemy.energy);
              }

              if (enemy.energy <= 0 && !enemy.isDead) {
                enemy.isDead = true;

                if (enemy.onDeath) {
                  enemy.onDeath();
                }

                // 💥 Todesfall startet langsames Fallen
                enemy.startFallingWhenDead();
              }


            } else if (enemy instanceof Chicken || enemy instanceof ChickenSmall) {
              // 🐔 Salsa-Todesanimation mit weichem Blinken
              enemy.isDead = true;

              // Bild setzen
              if (enemy instanceof Chicken) {
                enemy.loadImage('img/3_enemies_chicken/chicken_normal/2_dead/salsa-dead/dead-1.png');
              } else {
                enemy.loadImage('img/3_enemies_chicken/chicken_small/salsa-dead/dead.png');
              }

              // Transparenz-Wert (1 = voll sichtbar)
              enemy.alpha = 1.0;

              // ✨ Sanftes Blinken über 1 Sekunde → 2 Zyklen
              let blinkPhase = 0;
              const blinkInterval = setInterval(() => {
                // Sinuswelle für weiches Pulsieren
                const t = (blinkPhase % 20) / 20;          // 0 → 1
                enemy.alpha = 0.3 + Math.abs(Math.sin(t * Math.PI)) * 0.7;
                blinkPhase++;

                if (blinkPhase >= 40) { // ~1 Sekunde (20 Hz × 50 ms)
                  clearInterval(blinkInterval);
                  enemy.alpha = 1.0; // wieder volle Sichtbarkeit
                }
              }, 50);

              // ⏳ Nach 1 Sekunde komplett entfernen
              setTimeout(() => {
                clearInterval(blinkInterval);
                const enemyIndex = this.level.enemies.indexOf(enemy);
                if (enemyIndex > -1) {
                  this.level.enemies.splice(enemyIndex, 1);
                }
              }, 1000);
            }

          }
        });
      });



      // Rest deines Codes für Items...
      if (this.corncob && this.character.isColliding(this.corncob)) {
        this.corncob = null;
        this.healSound.currentTime = 0;
        this.healSound.playbackRate = 1;
        this.healSound.volume = 0.6;
        this.healSound.play().catch(e => console.warn(e));
        this.character.energy = 100;
        this.statusBar.setPercentage(this.character.energy);
        this.statusBar.blinkFullHealth();
      }

      // Münz-Kollision
      this.coins.forEach((coin, index) => {
        if (this.character.isColliding(coin)) {
          this.coins.splice(index, 1);
          this.statusBarCoin.addCoin();
          const coinSound = new Audio('audio/coin.mp3');
          coinSound.volume = 0.3;
          coinSound.playbackRate = 1.2;
          coinSound.play().catch(e => console.warn(e));
        }
      });

      // Salsa-Kollision
      this.salsas.forEach((salsa, index) => {
        if (this.character.isColliding(salsa)) {
          this.salsas.splice(index, 1);
          this.statusBarSalsa.addSalsa();
          const salsaSound = new Audio('audio/salsa.mp3');
          salsaSound.volume = 0.4;
          salsaSound.playbackRate = 2.0;
          salsaSound.play().catch(e => console.warn(e));
        }
      });

      // 🎵 Maracas-Kollision
      if (this.maracas && this.character.isColliding(this.maracas)) {

        this.isMaracasSequence = true;  // 👈 Ab hier: Endsequenz läuft

        // Maracas verschwindet
        this.maracas = null;

        // 🎵 Musik & Countdown stoppen
        if (this.countdown) this.countdown.stopCountdown();

        // 🎵 Sound abspielen
        const maracasSound = new Audio('audio/maracas.mp3');
        maracasSound.volume = 0.6;
        maracasSound.play().catch(e => console.warn('Maracas sound error:', e));

        // ❄️ Alles einfrieren – außer Pepe
        this.level.enemies.forEach(e => {
          clearInterval(e.moveInterval);
          clearInterval(e.animationInterval);
        });
        this.level.clouds.forEach(c => {
          clearInterval(c.moveInterval);
        });
        this.keyboard.RIGHT = false;
        this.keyboard.LEFT = false;
        this.keyboard.SPACE = false;
        this.keyboard.D = false;

        // 🕺 Pepe-Referenz
        const pepe = this.character;

        // ✨ Funktion für Sprung mit Richtung
        const doJump = (direction) => {
          pepe.otherDirection = direction === 'left'; // Blickrichtung setzen
          pepe.speedY = 25; // Sprunghöhe
          pepe.applyGravity();

          // Optional: Sprung-Sound
          const jumpSound = new Audio('audio/jump.mp3');
          jumpSound.volume = 0.5;
          jumpSound.play().catch(() => { });
        };

        // 1️⃣ Sprung nach rechts (sofort)
        doJump('right');

        // 2️⃣ Sprung nach links (nach 600ms)
        setTimeout(() => {
          doJump('left');
        }, 600);

        // 3️⃣ Sprung nach rechts (nach weiteren 600ms)
        setTimeout(() => {
          doJump('right');
        }, 1200);

        // 🚶‍♂️ Nach 1.8 Sekunden automatisch laufen
        setTimeout(() => {
          pepe.otherDirection = false; // schaut nach rechts

          const walkInterval = setInterval(() => {
            pepe.moveRight();                     // nutzt PePes Standardgeschwindigkeit (this.speed)
            pepe.playAnimation(pepe.IMAGES_WALKING);
          }, 1000 / 60); // 60 FPS

          // 🎬 Nach 3 Sekunden Endscreen anzeigen & Bewegung stoppen
          setTimeout(() => {
            clearInterval(walkInterval);
            this.endGame(true);
          }, 500);

        }, 1800);
      }

    }, 50);
  }

  killEnemy(enemy, index) {
    if (!enemy.isDead) {
      enemy.isDead = true;

      // Wechsle zum Todesbild
      if (enemy instanceof Chicken || enemy instanceof ChickenSmall) {
        enemy.loadImage(enemy.IMAGE_DEAD);
      }

      // Entferne den Gegner nach 1/2 Sekunden
      setTimeout(() => {
        const enemyIndex = this.level.enemies.indexOf(enemy);
        if (enemyIndex > -1) {
          this.level.enemies.splice(enemyIndex, 1);
        }
      }, 500);
    }
  }

  /**
   * Spielt den Heilungssound beim Einsammeln eines Maiskolbens ab.
   */
  playHealSound() {
    const healSound = new Audio('audio/heart-1.mp3');
    healSound.volume = 0.5; // Lautstärke (0.0–1.0)
    healSound.playbackRate = 1.2;    // Geschwindigkeit: 1.0 = normal, >1 = schneller, <1 = langsamer
    healSound.play().catch((e) => {
      console.warn('Heilungssound konnte nicht abgespielt werden:', e);
    });
  }

  drawCountdown() {
    this.ctx.font = "30px Arial";
    this.ctx.fillStyle = "white";
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.translate(this.camera_x, 0); // Move the camera

    this.addObjectsToMap(this.level.backgroundObjects);

    this.addObjectsToMap(this.level.clouds);
    this.ctx.translate(-this.camera_x, 0);
    this.addToMap(this.statusBar);
    this.addToMap(this.statusBarSalsa);
    this.addToMap(this.statusBarCoin);
    this.addToMap(this.countdown);
    this.drawCountdown();
    this.ctx.translate(this.camera_x, 0);
    this.addObjectsToMap(this.coins); // 💰 alle Münzen anzeigen
    this.addObjectsToMap(this.salsas);
    this.addToMap(this.bodyguard);
    this.addToMap(this.chickenNest);
    if (this.maracas) {
      this.addToMap(this.maracas);
    }

    if (this.bodyguardStatus) {
      this.addToMap(this.bodyguardStatus);
    }

    if (this.corncob) {
      this.addToMap(this.corncob);
    }

    this.addToMap(this.character);
    this.addObjectsToMap(this.level.enemies);
    this.addObjectsToMap(this.throwableObjects);
    this.ctx.translate(-this.camera_x, 0); // Reset the camera position

    let self = this;
    requestAnimationFrame(function () {
      self.draw();
    });
  }

  /**
 * Stoppt alle Bewegungen und Animationen in der Welt
 * (z. B. wenn Pepe stirbt).
 */
  pauseAllMovements() {
    // 🟦 Clouds
    this.level.clouds.forEach(c => clearInterval(c.moveInterval));

    // 🟥 Gegner
    this.level.enemies.forEach(e => {
      if (e.moveInterval) clearInterval(e.moveInterval);
      if (e.animationInterval) clearInterval(e.animationInterval);
      if (e.fallInterval) clearInterval(e.fallInterval);
    });

    // 🧍 Bodyguard pausieren
    if (this.bodyguard) {
      this.bodyguard.pause();
    }

    // 🟥 Kollisionen
    clearInterval(this.collisionInterval);

    // 🟩 Keyboard deaktivieren
    Object.keys(this.keyboard).forEach(key => this.keyboard[key] = false);

    this.isPaused = true;
  }

  resumeAllMovements() {
    this.isPaused = false;

    this.level.clouds.forEach(c => c.animate());
    this.level.enemies.forEach(e => e.animate && e.animate());

    // 🧍 Bodyguard wieder aktivieren
    if (this.bodyguard) {
      this.bodyguard.resume();
    }

    this.checkCollisions();
  }


  /**
   * Stoppt das Spiel komplett (z. B. bei Game Over).
   */
  stop() {
    this.pauseAllMovements();
  }


  addObjectsToMap(objects) {
    objects.forEach(o => {
      this.addToMap(o);
    });
  }

  addToMap(mo) {
    // 🔒 Unsichtbare Objekte gar nicht zeichnen
    if (mo.visible === false) return;

    this.ctx.save();

    // 🌫 Transparenz (standard = 1.0)
    this.ctx.globalAlpha = mo.alpha !== undefined ? mo.alpha : 1.0;

    const rotation = mo.rotation ? mo.rotation * Math.PI / 180 : 0;

    if (mo.otherDirection) {
      this.ctx.translate(mo.x + mo.width / 2, mo.y + mo.height / 2);
      this.ctx.scale(-1, 1);
      this.ctx.rotate(rotation);
      this.ctx.translate(-mo.width / 2, -mo.height / 2);
    } else {
      this.ctx.translate(mo.x + mo.width / 2, mo.y + mo.height / 2);
      this.ctx.rotate(rotation);
      this.ctx.translate(-mo.width / 2, -mo.height / 2);
    }

    mo.draw(this.ctx);
    mo.drawFrame(this.ctx);

    this.ctx.restore();
  }



  generateCoins() {
    const coins = [];
    let totalCoins = 0;

    while (totalCoins < 10) {
      // zufällige Basisposition
      let baseX = 300 + Math.random() * 4000; // irgendwo im Level
      let groupSize = Math.random() < 0.4 ? 2 + Math.floor(Math.random() * 2) : 1; // 40% Chance auf Gruppe (2–3)

      for (let i = 0; i < groupSize && totalCoins < 10; i++) {
        let coinX = baseX + i * 50; // kleine Abstände
        let coinY = 300 + Math.random() * 50; // leicht unterschiedliche Höhen
        coins.push(new Coin(coinX, coinY));
        totalCoins++;
      }
    }

    return coins;
  }

  generateSalsas() {
    const salsas = [];

    for (let i = 0; i < 5; i++) {
      let salsaX = 500 + Math.random() * 3500; // zufällige Position im Level
      let salsaY = 370 + Math.random() * 20;   // leicht variierende Höhe
      salsas.push(new Salsa(salsaX, salsaY));
    }

    return salsas;
  }

  /**
 * Prüft, ob es sich um einen echten Gegner handelt (keine StatusBars etc.)
 * @param {MovableObject} enemy 
 * @returns {boolean}
 */
  isActualEnemy(enemy) {
    return (enemy instanceof Chicken ||
      enemy instanceof ChickenSmall ||
      enemy instanceof Endboss) &&
      !(enemy instanceof EndBossStatusBar);
  }

  // 🧩 SPIEL PAUSIEREN
  pauseGame(showOverlay = true) {
    // ⛔ Während Bodyguard-Sprung ODER Endboss-Tod keine Pause zulassen
    if (
      (this.bodyguard && this.bodyguard.isJumping) ||                 // Bodyguard springt runter
      (this.character && this.character.freezeForBodyguard) ||        // Spieler ist für Bodyguard gesperrt
      (this.endboss && this.endboss.isDead) ||
      this.isMaracasSequence                     // 👈 NEU
    ) {
      return;
    }

    if (this.isPaused) return;

    this.isPaused = true;

    this.pauseAllMovements();

    if (this.character) this.character.pause();
    if (this.endboss) this.endboss.pause();
    if (this.bodyguard) this.bodyguard.pause();

    if (this.countdown) {
      this.countdown.pauseAllMusic();
      this.countdown.pauseCountdown();
    }

    if (showOverlay && this.allowPauseOverlay) {
      this.showPauseThenPlaySymbol();
    }
  }






  // 🧩 SPIEL FORTSETZEN
  resumeGame() {
    if (!this.isPaused) return;
    this.isPaused = false;

    // ⚡ NEU: Startfall-Animation – nur beim allerersten Start
    if (!this.hasStartedOnce) {
      this.hasStartedOnce = true;

      if (this.character) {
        // 🪂 Pepe zeigt "Fall-Bild" beim Start
        this.character.loadImage('img/2_character_pepe/3_jump/J-37.png');

        // 👇 Überwache, wann er den Boden erreicht
        const landingCheck = setInterval(() => {
          if (!this.character.isAboveGround()) { // = auf Boden gelandet (y >= 150)
            clearInterval(landingCheck);

            // 💥 Kurz Landebild zeigen
            this.character.loadImage('img/2_character_pepe/3_jump/J-38.png');

            // ⏳ Nach 300ms Idle-Animation starten
            setTimeout(() => {
              if (this.character.playIdleAnimation) {
                this.character.playIdleAnimation();
              } else {
                this.character.loadImage(this.character.IMAGES_STANDING[0]);
              }
            }, 300);
          }
        }, 50);
      }
    }

    // Bewegungen wieder starten
    this.resumeAllMovements();

    // Pepe & Endboss fortsetzen
    if (this.character) this.character.resume();
    if (this.endboss) this.endboss.resume();

    // ▶️ Musik und Countdown fortsetzen
    if (this.countdown) {
      if (!this.countdown.isStarted) this.countdown.startCountdown(); // Countdown erst beim Start beginnen
      this.countdown.resumeAllMusic();
      this.countdown.resumeCountdown();
    }

    // Play-Symbol ausblenden
    this.hidePlaySymbol();
  }


  endGame(win = false) {
    // 🛑 Alles einfrieren
    this.pauseAllMovements();

    // ⏱️ Unterschiedliche Verzögerung je nach Ausgang
    const delay = win ? 1000 : 3000; // 1 Sekunde bei Sieg, 3 bei Niederlage

    setTimeout(() => {
      showEndScreen(win); // false = verloren, true = gewonnen
    }, delay);
  }




  // 🧩 ZEIGE PAUSE, DANN PLAY SYMBOL
  showPauseThenPlaySymbol() {

    // ❌ Wenn Startscreen sichtbar ist → GAR NICHTS anzeigen
    const startScreen = document.getElementById('start-screen');
    if (startScreen && !startScreen.classList.contains('hidden')) {
      return;
    }

    // Erst Pause-Symbol kurz anzeigen
    const pauseOverlay = document.createElement("div");
    pauseOverlay.innerHTML = "⏸";
    pauseOverlay.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 100px;
    color: white;
    text-shadow: 0 0 10px black;
    pointer-events: none;
    user-select: none;
    opacity: 0.4;
    transition: opacity 0.5s ease;
    z-index: 9999;
  `;
    document.body.appendChild(pauseOverlay);

    // Nach 1 Sekunde Pause-Symbol ausblenden → Play-Symbol anzeigen
    setTimeout(() => {
      pauseOverlay.style.opacity = "0";
      setTimeout(() => {
        pauseOverlay.remove();
        this.showPlaySymbol(); // dauerhaftes ▶️
      }, 500);
    }, 200);
  }

  // 🧩 DAUERHAFTES PLAY-SYMBOL ZEIGEN
  showPlaySymbol() {

    // ❌ Wenn Startscreen sichtbar ist → NICHT anzeigen
    const startScreen = document.getElementById('start-screen');
    if (startScreen && !startScreen.classList.contains('hidden')) {
      return;
    }

    // Wenn schon vorhanden → nicht doppelt anzeigen
    if (document.getElementById("play-overlay")) return;

    const playOverlay = document.createElement("div");
    playOverlay.id = "play-overlay";
    playOverlay.innerHTML = "▶";
    playOverlay.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 100px;
    color: white;
    text-shadow: 0 0 10px black;
    user-select: none;
    pointer-events: none;
    opacity: 0.4;
    z-index: 9999;
  `;
    document.body.appendChild(playOverlay);
  }

  // 🧩 PLAY-SYMBOL ENTFERNEN
  hidePlaySymbol() {
    const overlay = document.getElementById("play-overlay");
    if (overlay) overlay.remove();
  }



  // ⚡ ALLE Figuren kurz hüpfen lassen (Bodyguard landet)
  jumpFromShock() {
    // 🧍 Pepe
    if (this.character) {
      let bounce = 0;
      const bounceInterval = setInterval(() => {
        this.character.y -= 2;
        bounce++;
        if (bounce >= 4) {
          clearInterval(bounceInterval);
          this.character.y += 8;
        }
      }, 30);
    }

    // 🐔 Endboss Bounce-Effekt
    if (this.level && this.level.enemies) {
      this.level.enemies.forEach(enemy => {
        if (enemy instanceof Endboss) {
          enemy.playAnimation(enemy.IMAGES_HURT);

          let originalY = enemy.y;
          let bounce = 0;
          const bounceInterval = setInterval(() => {
            enemy.y -= 3;
            bounce++;
            if (bounce >= 4) {
              clearInterval(bounceInterval);
              enemy.y = originalY;
            }
          }, 30);
        }
      });
    }

    // 🪺 Chicken-Nest
    if (this.chickenNest) {
      const originalY = this.chickenNest.y;
      this.chickenNest.y -= 10;
      setTimeout(() => {
        this.chickenNest.y = originalY;
      }, 150);
    }

    // 🌽 Corncob → Bounce statt echter Sprung
    if (this.corncob) {
      let originalY = this.corncob.y;
      let bounce = 0;
      const bounceInterval = setInterval(() => {
        this.corncob.y -= 2;
        bounce++;
        if (bounce >= 4) {
          clearInterval(bounceInterval);
          this.corncob.y = originalY;
        }
      }, 30);
    }
  }
}