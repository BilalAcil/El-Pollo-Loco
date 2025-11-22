class EndbossKing extends MovableObject {

  height = 190;
  width = 140;
  y = 250;
  speed = 2;
  isAwake = false;
  movingLeft = true;  // Start-Richtung

  IMAGES_WALK = [
    'img/4_enemie_boss_chicken/1_walk/G1.png',
    'img/4_enemie_boss_chicken/1_walk/G2.png',
    'img/4_enemie_boss_chicken/1_walk/G3.png',
    'img/4_enemie_boss_chicken/1_walk/G4.png'
  ];

  constructor() {
    super().loadImage('img/4_enemie_boss_chicken/1_walk/G2.png');
    this.loadImages(this.IMAGES_WALK);
    this.x = 4400;
    this.animate();
  }

  animate() {
    setInterval(() => {
      if (this.world && this.world.character.x >= 3800) {
        this.isAwake = true;
        this.startMoving();
      }

      if (this.isAwake) {
        this.playAnimation(this.IMAGES_WALK);
      }
    }, 180);
  }

  startMoving() {
    if (this.moveInterval) return;

    this.moveInterval = setInterval(() => {
      if (!this.isAwake) return;

      // Wenn nach links laufen soll
      if (this.movingLeft) {
        this.moveLeft();

        if (this.x <= 4000) {            // Grenze erreicht
          this.movingLeft = false;       // Richtung wechseln
        }

      } else {
        this.moveRight();

        if (this.x >= 4400) {            // Grenze erreicht
          this.movingLeft = true;        // Richtung wechseln
        }
      }

    }, 1000 / 60);
  }

}
