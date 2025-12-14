// js/audio-manager.js

// globaler Mute-Status
window.isMuted = false;

// Liste aller Audio-Objekte
window.allGameAudio = [];

(function () {
  const OriginalAudio = window.Audio;

  // ✅ Wrapper für new Audio(...)
  window.Audio = function (...args) {
    const audio = new OriginalAudio(...args);

    // in globale Liste packen
    window.allGameAudio.push(audio);

    // aktuellen Mute-Status anwenden
    audio.muted = window.isMuted;

    return audio;
  };

  // Prototyp beibehalten
  window.Audio.prototype = OriginalAudio.prototype;

  // Globale Mute-Funktion
  window.setGlobalMute = function (muted) {
    window.isMuted = muted;
    window.allGameAudio.forEach(a => {
      a.muted = muted;
    });
  };
})();
