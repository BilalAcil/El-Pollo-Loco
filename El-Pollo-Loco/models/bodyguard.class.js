class Bodyguard extends MovableObject {

  height = 190;
  width = 140;
  y = 250;
  speed = 2;
  isAwake = false;
  movingLeft = true;

  IMAGES_WALK = [
    'img/4_enemie_boss_chicken/1_walk/G1.png',
    'img/4_enemie_boss_chicken/1_walk/G2.png',
    'img/4_enemie_boss_chicken/1_walk/G3.png',
    'img/4_enemie_boss_chicken/1_walk/G4.png'
  ];

  constructor() {
    super().loadImage(this.IMAGES_WALK[0]);
    this.loadImages(this.IMAGES_WALK);
    this.x = 4400;
    this.animate();    // beim Start alles aktivieren
  }

  animate() {
    this.isAwake = true;
    this.startMoving();
    this.startAnimation();   // Animation separat starten
  }

  /** ➤ Animation separat steuern */
  startAnimation() {
    if (this.animationInterval) return;
    this.animationInterval = setInterval(() => {
      if (this.isAwake) {
        this.playAnimation(this.IMAGES_WALK);
      }
    }, 180);
  }

  /** ➤ Bewegung separat steuern */
  startMoving() {
    if (this.moveInterval) return;
    this.moveInterval = setInterval(() => {
      if (!this.isAwake) return;

      if (this.movingLeft) {
        this.moveLeft();
        this.otherDirection = false;
        if (this.x <= 4000) this.movingLeft = false;
      } else {
        this.moveRight();
        this.otherDirection = true;
        if (this.x >= 4600) this.movingLeft = true;
      }
    }, 1000 / 60);
  }

  /** PAUSE */
  pause() {
    this.isAwake = false;
    clearInterval(this.moveInterval);
    clearInterval(this.animationInterval);
    this.moveInterval = null;
    this.animationInterval = null;
  }

  /** RESUME */
  resume() {
    if (this.isAwake) return;
    this.isAwake = true;

    this.startMoving();      // startet BEWEGUNG
    this.startAnimation();   // startet ANIMATION wieder 🚀
  }
}
