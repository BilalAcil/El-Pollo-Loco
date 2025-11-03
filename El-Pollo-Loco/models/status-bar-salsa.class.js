class StatusBarSalsa extends DrawableObject {
  constructor() {
    super();
    this.imagePath = 'img/6_salsa_bottle/salsa_bottle.png';
    this.loadImage(this.imagePath);

    this.height = 50;
    this.width = 80;
    this.x = 55;
    this.y = 25;
    this.salsaCount = 0;
    this.isBlinking = false; // 👈 Flag, ob gerade geblinkt wird
    this.visible = true;     // 👈 Sichtbarkeit (wird beim Blinken umgeschaltet)
  }

  addSalsa() {
    this.salsaCount++;
  }

  /**
   * 💡 Neue Methode zum Blinken
   */
  blinkOnFail() {
    if (this.isBlinking) return; // vermeidet mehrfaches Auslösen

    this.isBlinking = true;
    let blinkCount = 0;
    const blinkInterval = setInterval(() => {
      this.visible = !this.visible; // Sichtbarkeit wechseln
      blinkCount++;
      if (blinkCount >= 6) { // z. B. 3× an/aus → 6 Wechsel
        clearInterval(blinkInterval);
        this.visible = true;
        this.isBlinking = false;
      }
    }, 120); // Geschwindigkeit des Blinkens (ms)
  }

  draw(ctx) {
    if (!this.visible) return; // 🔥 nur zeichnen, wenn sichtbar

    ctx.drawImage(this.img, this.x, this.y, this.width, this.height);

    ctx.font = '30px "Comic Sans MS"';
    ctx.fillStyle = '#bf0000';
    ctx.fillText(` ${this.salsaCount}`, this.x + 45, this.y + 35);
  }
}
