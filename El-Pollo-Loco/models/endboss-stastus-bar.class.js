class EndBossStatusBar extends DrawableObject {

  IMAGES = [
    'img/7_statusbars/2_statusbar_endboss/blue/blue0.png',
    'img/7_statusbars/2_statusbar_endboss/blue/blue20.png',
    'img/7_statusbars/2_statusbar_endboss/blue/blue40.png',
    'img/7_statusbars/2_statusbar_endboss/blue/blue60.png',
    'img/7_statusbars/2_statusbar_endboss/blue/blue80.png',
    'img/7_statusbars/2_statusbar_endboss/blue/blue100.png'
  ];

  percentage = 100;

  constructor() {
    super();
    this.loadImages(this.IMAGES);
    this.height = 60;
    this.width = 200;
    this.x = 4500;
    this.y = 10;
    this.setPercentage(100);

    // 🎵 Endboss-Hurt-Sound vorbereiten
    this.hurtSound = new Audio('audio/endboss-hurt.mp3');
    this.hurtSound.volume = 0.6;
  }

  setPercentage(percentage) {
    // Prüfe, ob sich die Lebensanzeige wirklich ändert
    if (percentage < this.percentage) {
      // 🎧 Spiele den Sound nur, wenn HP sinken
      this.hurtSound.currentTime = 0;
      this.hurtSound.play().catch(e => console.warn('Endboss Hurt Sound:', e));
    }

    this.percentage = percentage;
    const path = this.IMAGES[this.resolveImageIndex()];
    this.img = this.imageCache[path];
  }

  resolveImageIndex() {
    if (this.percentage == 100) {
      return 5;
    } else if (this.percentage >= 80) {
      return 4;
    } else if (this.percentage >= 60) {
      return 3;
    } else if (this.percentage >= 40) {
      return 2;
    } else if (this.percentage >= 20) {
      return 1;
    } else {
      return 0;
    }
  }
}
