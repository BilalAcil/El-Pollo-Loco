class Endboss extends MovableObject {

  height = 170;
  width = 130;
  y = 280;
  isActivated = false; // Steuert, ob der Boss "getroffen" wurde
  energy = 100;  // Energy Eigenschaft 
  isDead = false; // isDead Eigenschaft

  // Bilder für normale Animation (Idle)
  IMAGES_IDLE = [
    'img/4_enemie_boss_chicken/6_idle/1_Chicken_Idle.png',
    'img/4_enemie_boss_chicken/6_idle/1_z_Chicken_Idle.png',
    'img/4_enemie_boss_chicken/6_idle/2_z_Chicken_Idle.png',
    'img/4_enemie_boss_chicken/6_idle/3_z_Chicken_Idle.png'
  ];

  // Bilder für Hurt-Animation
  IMAGES_HURT = [
    'img/4_enemie_boss_chicken/awake/1_Chicken_awake.png',
    'img/4_enemie_boss_chicken/awake/2_Chicken_awake.png',
    'img/4_enemie_boss_chicken/awake/3_Chicken_awake.png',
    'img/4_enemie_boss_chicken/awake/4_Chicken_awake.png'
  ];

  IMAGES_DEAD = [
    'img/4_enemie_boss_chicken/5_dead/G24.png',
    'img/4_enemie_boss_chicken/5_dead/G25.png',
    'img/4_enemie_boss_chicken/5_dead/G26.png'
  ]

  constructor() {
    super().loadImage(this.IMAGES_IDLE[0]);
    this.loadImages(this.IMAGES_IDLE); // Idle-Bilder laden
    this.loadImages(this.IMAGES_HURT); // Hurt-Bilder laden
    this.loadImages(this.IMAGES_DEAD); // Todes-Bilder laden
    this.x = 4500; // Initial x position
    this.animate();
    this.startFallingWhenDead(); // ← Fall-Animation starten
  }

  animate() {
    this.moveInterval = setInterval(() => {
      if (this.isPaused) return;  // ⏸ Bewegung einfrieren

      if (this.isDead) {
        // Todes-Animation abspielen WÄHREND er fällt
        this.playAnimation(this.IMAGES_DEAD);
      } else if (this.isActivated) {
        // Hurt-Animation
        this.playAnimation(this.IMAGES_HURT);
      } else {
        // Normale Idle-Animation
        this.playAnimation(this.IMAGES_IDLE);
      }
    }, 400);
  }

  // ★★★ NEUE METHODE: Fallen starten wenn tot ★★★
  startFallingWhenDead() {
    this.moveInterval = setInterval(() => {
      if (this.isPaused) return;  // ⏸ Bewegung einfrieren

      if (this.isDead) {
        // Langsam nach unten fallen lassen
        this.y += 3; // Je höher der Wert, desto schneller fällt er

        // Wenn er weit genug gefallen ist (unterhalb des Bildschirms), entfernen
        if (this.y > 600) {
          this.removeFromWorld();
        }
      }
    }, 1000 / 30); // 30 FPS für sanften Fall
  }

  // ★★★ NEUE METHODE: Aus der Welt entfernen ★★★
  removeFromWorld() {
    if (this.world) {
      const index = this.world.level.enemies.indexOf(this);
      if (index > -1) {
        this.world.level.enemies.splice(index, 1);
        console.log("🗑️ Endboss wurde entfernt!");
      }
    }
  }

  onDeath() {
    if (this.world && !this.world.maracas) {
      console.log("🎵 Maracas erscheinen gleich...");
      setTimeout(() => {
        this.world.maracas = new Maracas();
        console.log("🪇 Maracas sind erschienen!");
      }, 800);
    }
  }


  // Methode wird aufgerufen, wenn der Boss getroffen wird
  activate() {
    if (!this.isActivated && !this.isDead) {
      this.isActivated = true;
      setTimeout(() => {
        this.isActivated = false;
      }, 1000);
    }
  }

  // HIER kommt die Kollisionsbox für den Endboss
  get collisionBox() {
    return {
      x: this.x,
      y: this.y + 30, // Hitbox 30 Pixel nach unten verschieben
      width: this.width,
      height: this.height - 30 // Höhe um 30 Pixel reduzieren
    };
  }

  // Und die drawFrame Methode anpassen
  drawFrame(ctx) {
    if (this instanceof Endboss) {
      const box = this.collisionBox;
      ctx.beginPath();
      ctx.lineWidth = "1";
      ctx.strokeStyle = "red";
      // Relative Position zur Hitbox zeichnen
      ctx.rect(box.x - this.x, box.y - this.y, box.width, box.height);
      ctx.stroke();
    }
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

}