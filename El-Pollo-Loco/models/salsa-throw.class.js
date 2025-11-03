class SalsaThrow extends MovableObject {
  width = 50;
  height = 50;

  // Startwerte (du kannst hiermit spielen)
  speedX = 8;         // horizontale Geschwindigkeit (weiter = schneller)
  speedY = 10;         // Anfangsbewegung nach oben
  acceleration = 0.45;  // "Gravitation" (größer = fällt schneller)
  direction;           // true = links, false = rechts
  hasHit = false;

  IMAGES_ROTATION = [
    'img/6_salsa_bottle/bottle_rotation/1_bottle_rotation.png',
    'img/6_salsa_bottle/bottle_rotation/2_bottle_rotation.png',
    'img/6_salsa_bottle/bottle_rotation/3_bottle_rotation.png',
    'img/6_salsa_bottle/bottle_rotation/4_bottle_rotation.png'
  ];

  IMAGES_SPLASH = [
    'img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png',
    'img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png',
    'img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png',
    'img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png',
    'img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png'
  ];

  constructor(x, y, direction) {
    super().loadImage(this.IMAGES_ROTATION[0]);
    this.loadImages(this.IMAGES_ROTATION);
    this.loadImages(this.IMAGES_SPLASH);
    this.x = x;
    this.y = y;
    this.direction = direction;

    this.rotationSound = new Audio('audio/throw-sound-2.mp3');
    this.rotationSound.volume = 0.4;

    this.throw();
  }

  /** 🚀 Startet den Wurf **/
  throw() {
    this.rotationSound.currentTime = 0;
    this.rotationSound.play().catch(e => console.warn('Rotation sound error:', e));

    // Bewegung über Intervall
    this.moveInterval = setInterval(() => {
      // Bewegung in X-Richtung (links/rechts)
      if (this.direction) {
        this.x -= this.speedX;
      } else {
        this.x += this.speedX;
      }
      this.speedX *= 0.99; // leichte Verlangsamung pro Frame


      // Bewegung in Y-Richtung (parabolisch)
      this.y -= this.speedY;       // nach oben
      this.speedY -= this.acceleration; // Schwerkraft zieht nach unten

      // optional: Stoppe Wurf, wenn Flasche "auf Boden" fällt
      if (this.y >= 380 && !this.hasHit) {  // <--- Bodenhöhe anpassen
        this.hasHit = true;
        this.splashAnimation();
      }
    }, 25);

    // Dreh-Animation
    this.rotationInterval = setInterval(() => {
      this.playAnimation(this.IMAGES_ROTATION);
    }, 50);
  }

  stopSound() {
    if (this.rotationSound) {
      this.rotationSound.pause();
      this.rotationSound.currentTime = 0;
    }
  }

  /** 💥 Splash-Animation (bei Aufprall) **/
  splashAnimation(callback) {
    this.stopSound();
    clearInterval(this.moveInterval);
    clearInterval(this.rotationInterval);
    this.speedY = 0;
    this.speedX = 0;

    let i = 0;
    const interval = setInterval(() => {
      this.loadImage(this.IMAGES_SPLASH[i]);
      i++;

      // Wenn das letzte Splash-Bild angezeigt wurde:
      if (i >= this.IMAGES_SPLASH.length) {
        clearInterval(interval);

        // ⏳ Kurze Verzögerung, damit das letzte Splash-Bild sichtbar bleibt
        setTimeout(() => {
          // 🔥 Danach: Flasche verschwinden lassen
          this.loadImage('');  // entfernt das Bild komplett
          this.width = 0;
          this.height = 0;

          // Optional: Objekt komplett entfernen, wenn du eine Callback-Logik nutzt
          if (callback) callback();
        }, 200); // 200ms = kurzes Nachleuchten des letzten Splash-Bildes
      }
    }, 100);
  }

}
