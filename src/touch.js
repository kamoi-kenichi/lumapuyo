class TouchInput {
  static installed = false;

  static install(targetEl) {
    if (TouchInput.installed) return;
    if (!targetEl) return;
    TouchInput.installed = true;

    targetEl.style.touchAction = "none";

    const swipeThreshold = 24; 
    const tapMaxMove = 10;     
    const longPressMs = 220;   
    const quickDropMs = 140;   

    let sx = 0, sy = 0;
    let lx = 0, ly = 0;
    let moved = false;

    let longTimer = null;
    let longActive = false;

    const clearLong = () => {
      if (longTimer) {
        clearTimeout(longTimer);
        longTimer = null;
      }
    };

    targetEl.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      sx = lx = t.clientX;
      sy = ly = t.clientY;
      moved = false;
      longActive = false;

      clearLong();
      longTimer = setTimeout(() => {
        longActive = true;
        Player.setDown(true); 
      }, longPressMs);
    }, { passive: false });

    targetEl.addEventListener("touchmove", (e) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      lx = t.clientX;
      ly = t.clientY;

      const dx = lx - sx;
      const dy = ly - sy;

      if (Math.abs(dx) > tapMaxMove || Math.abs(dy) > tapMaxMove) {
        moved = true;
        clearLong(); 
      }

      e.preventDefault();
    }, { passive: false });

    targetEl.addEventListener("touchend", () => {
      clearLong();

      if (longActive) {
        Player.setDown(false);
        longActive = false;
        return;
      }

      const dx = lx - sx;
      const dy = ly - sy;
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);

      if (!moved || (ax < tapMaxMove && ay < tapMaxMove)) {
        Player.rotateOnceCW();
        return;
      }

      if (ax > ay && ax >= swipeThreshold) {
        if (dx > 0) Player.moveOnceRight();
        else Player.moveOnceLeft();
        return;
      }

      if (ay > ax && ay >= swipeThreshold) {
        if (dy > 0) Player.quickDrop(quickDropMs); 
        return;
      }
    }, { passive: false });

    targetEl.addEventListener("touchcancel", () => {
      clearLong();
      Player.setDown(false);
      longActive = false;
    }, { passive: false });
  }
}