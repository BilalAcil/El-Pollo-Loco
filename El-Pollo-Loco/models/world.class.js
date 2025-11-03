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
  maracas = null; // Noch nicht sichtbar, wird erst nach Boss-Tod erzeugt
  corncob = new Corncob();
  chickenNest = new ChickenNest();
  coins = []; // mehrere Münzen statt einer
  salsas = []; // mehrere Salsaflaschen
  throwableObjects = [];


  constructor(canvas, keyboard) {
    this.ctx = canvas.getContext("2d");
    this.canvas = canvas;
    this.keyboard = keyboard;
    this.draw();
    this.setWorld();
    this.countdown.world = this; // Welt-Referenz setzen, damit Countdown Charakter beeinflussen kann
    this.checkCollisions();
    this.lastEnemyHit = 0;    // Zeitpunkt des letzten Gegner-Treffers
    this.lastEndbossHit = 0;  // Zeitpunkt des letzten Endboss-Treffers


    // Vorladen des Heilungssounds
    this.healSound = new Audio('audio/heart-1.mp3');
    this.healSound.volume = 0.5;
    this.healSound.load(); // sorgt dafür, dass die Datei vorgeladen wird

    // Sound für Endboss-Schaden
    this.endbossHurtSound = new Audio('audio/endboss-hurt.mp3'); // oder 'audio/endboss-hurt.mp3'
    this.endbossHurtSound.volume = 0.6;
    this.endbossHurtSound.load();


  }

  setWorld() {
    this.character.world = this;
    this.coins = this.generateCoins();
    this.salsas = this.generateSalsas();

    // Endboss & StatusBar Referenz setzen
    this.endboss = this.level.enemies.find(e => e instanceof Endboss);
    this.endbossBar = this.level.enemies.find(e => e instanceof EndBossStatusBar);

    if (this.endboss) {
      this.endboss.world = this; // ✅ WICHTIG! Damit Endboss auf this.world zugreifen kann
    }

    if (this.endbossBar) {
      this.endbossBar.world = this;
    }
  }


  checkCollisions() {
    setInterval(() => {
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
              this.lastEndbossBounce = Date.now(); // ← Immunität für 400 ms aktivieren


              if (this.endbossBar) {
                this.endbossBar.setPercentage(enemy.energy);
              }

              this.character.speedY = 20;

              if (enemy.energy <= 0 && !enemy.isDead) {
                enemy.isDead = true;
                console.log("💀 Endboss besiegt – startet Todesanimation");

                // 👉 Maracas erscheinen nach 1 Sekunde (während Boss stirbt)
                if (enemy.onDeath) {
                  enemy.onDeath();
                }
              }

            }
          }

          // 🟨 FALL 2: Normale Gegner (Chicken usw.) - AUSSCHLIESSEN von StatusBars und anderen Objekten
        } else {
          if (this.isActualEnemy(enemy) && this.character.isColliding(enemy) && !enemy.isDead) {
            collidedEnemies.push({ enemy, index });
          }
        }
      });

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

              this.character.hit();
              this.statusBar.setPercentage(this.character.energy);

              // 🧩 HIER NEU:
              if (this.character.energy <= 0) {
                this.character.isDead = true;
                this.statusBar.setPercentage(0);

                // 👉 Todesanimation + Fallen starten
                this.character.playDeathAnimation();
                this.character.startFallingWhenDead();
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
              this.character.lastGlobalHit = now; // 🕒 Zeitpunkt global speichern

              this.character.hit();
              this.statusBar.setPercentage(this.character.energy);

              if (this.character.energy <= 0) {
                this.character.isDead = true;
                this.statusBar.setPercentage(0);

                // 👉 Death animation + falling start
                this.character.playDeathAnimation();
                this.character.startFallingWhenDead();
              }

            }
            return;
          }
        });
      }


      // 💥 Salsa-Flaschen treffen Gegner (Endboss, Chicken, Küken)
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
                console.log("💀 Endboss wurde durch Salsa besiegt!");
                if (enemy.onDeath) enemy.onDeath();
              }

            } else if (enemy instanceof Chicken || enemy instanceof ChickenSmall) {
              // 🐔 Salsa-Todesanimation mit Blinken
              enemy.isDead = true;

              // Bild setzen
              if (enemy instanceof Chicken) {
                enemy.loadImage('img/3_enemies_chicken/chicken_normal/2_dead/salsa-dead/dead-1.png');
              } else {
                enemy.loadImage('img/3_enemies_chicken/chicken_small/salsa-dead/dead.png');
              }

              // 🔆 Sichtbarkeit toggeln (blinken)
              let blinkCount = 0;
              const blinkInterval = setInterval(() => {
                enemy.visible = !enemy.visible; // Einfaches Sichtbarkeits-Flag
                blinkCount++;
                if (blinkCount >= 4) { // 4 Wechsel = 2x Blinken (an-aus-an-aus)
                  clearInterval(blinkInterval);
                  enemy.visible = true; // Am Ende wieder sichtbar lassen
                }
              }, 250); // alle 250ms wechseln → 2x in ca. 1 Sekunde

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
        // Maracas verschwindet
        this.maracas = null;

        // Sound abspielen
        const maracasSound = new Audio('audio/maracas.mp3');
        maracasSound.volume = 0.6;
        maracasSound.playbackRate = 1.0;
        maracasSound.play().catch(e => console.warn('Maracas sound error:', e));

        // Optional: hier kannst du ein Power-up, Punkte oder Animation einbauen
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
    this.addToMap(this.chickenNest);
    if (this.maracas) {
      this.addToMap(this.maracas);
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

  addObjectsToMap(objects) {
    objects.forEach(o => {
      this.addToMap(o);
    });
  }

  addToMap(mo) {
    // 👇 NEU: Wenn das Objekt gerade unsichtbar (z. B. beim Blinken) ist → nicht zeichnen
    if (mo.visible === false) return;

    this.ctx.save();

    // Wenn das Objekt gedreht werden soll:
    const rotation = mo.rotation ? mo.rotation * Math.PI / 180 : 0;

    if (mo.otherDirection) {
      // 🔄 Gespiegelte (nach links schauende) Variante
      this.ctx.translate(mo.x + mo.width / 2, mo.y + mo.height / 2);
      this.ctx.scale(-1, 1); // horizontal spiegeln
      this.ctx.rotate(rotation);
      this.ctx.translate(-mo.width / 2, -mo.height / 2);
    } else {
      // 🔄 Normale Richtung
      this.ctx.translate(mo.x + mo.width / 2, mo.y + mo.height / 2);
      this.ctx.rotate(rotation);
      this.ctx.translate(-mo.width / 2, -mo.height / 2);
    }

    // Bild zeichnen
    mo.draw(this.ctx);
    mo.drawFrame(this.ctx); // optionaler Rahmen

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
      let salsaX = 500 + Math.random() * 4000; // zufällige Position im Level
      let salsaY = 380 + Math.random() * 30;   // leicht variierende Höhe
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
}