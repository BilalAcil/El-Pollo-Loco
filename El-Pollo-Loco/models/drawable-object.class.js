class DrawableObject {
  // 🔥 NEU: globale Zähler für alle Grafiken
  static totalAssets = 0;
  static loadedAssets = 0;

  x = 120;
  y = 275;
  height = 150;
  width = 100;
  img;
  imageCache = {};
  currentImage = 0;

  /**
   * Einzelnes Bild laden
   */
  loadImage(path) {
    this.img = new Image();

    // wir erwarten ein weiteres Asset
    DrawableObject.totalAssets++;

    this.img.onload = () => {
      DrawableObject.loadedAssets++;
      // console.log("Loaded single image:", path, DrawableObject.loadedAssets, "/", DrawableObject.totalAssets);
    };

    this.img.src = path;
  }

  /**
   * Mehrere Bilder (Animationen etc.) laden
   */
  loadImages(arr) {
    arr.forEach((path) => {
      let img = new Image();

      DrawableObject.totalAssets++;

      img.onload = () => {
        DrawableObject.loadedAssets++;
        // console.log("Loaded image from array:", path, DrawableObject.loadedAssets, "/", DrawableObject.totalAssets);
      };

      img.src = path;
      this.imageCache[path] = img;
    });
  }

  draw(ctx) {
    ctx.drawImage(this.img, 0, 0, this.width, this.height);
  }

  drawFrame(ctx) {
    if (
      this instanceof Character ||
      this instanceof Chicken ||
      this instanceof Endboss ||
      this instanceof ChickenSmall ||
      this instanceof Corncob ||
      this instanceof ChickenCoop ||
      this instanceof Coin ||
      this instanceof Salsa ||
      this instanceof Maracas ||
      this instanceof Bodyguard
    ) {
      ctx.beginPath();
      ctx.lineWidth = "1";
      ctx.strokeStyle = "transparent";

      // 🔥 Nur beim Bodyguard Rahmen etwas nach unten verschieben
      let offsetY = this instanceof Bodyguard ? 30 : 0;

      ctx.rect(0, offsetY, this.width, this.height - offsetY);
      ctx.stroke();
    }
  }

  // 🔥 NEU: Helper, ob aus Sicht aller DrawableObjects alles geladen ist
  static areAllAssetsLoaded() {
    return (
      DrawableObject.totalAssets > 0 &&
      DrawableObject.loadedAssets >= DrawableObject.totalAssets
    );
  }
}
