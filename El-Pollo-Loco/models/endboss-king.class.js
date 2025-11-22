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
    this.isAwake = true;          // sofort startbereit
    this.startMoving();           // Bewegung starten

    setInterval(() => {
      if (this.isAwake) {
        this.playAnimation(this.IMAGES_WALK);
      }
    }, 180);
  }


  startMoving() {
    if (this.moveInterval) return;

    this.moveInterval = setInterval(() => {
      if (!this.isAwake) return;

      if (this.movingLeft) {
        this.moveLeft();
        this.otherDirection = false;        // Blick nach links

        if (this.x <= 4000) {               // Grenze links
          this.movingLeft = false;
        }

      } else {
        this.moveRight();
        this.otherDirection = true;         // Blick nach rechts (SPIEGELUNG!)

        if (this.x >= 4600) {               // Grenze rechts
          this.movingLeft = true;
        }
      }

    }, 1000 / 60);
  }
}
