// ============================================================
// REDIRECCIÓN — MIPyV Red HZT (12/10/2026)
// La app se mudó a https://hyslhmh-sudo.github.io/manifiestos/mipyv/
// Antes de irse, espera a que este celular no tenga nada sin enviar:
// si hay cargas pendientes, la app sigue funcionando acá hasta que se
// envíen (con señal) y recién después pasa a la dirección nueva.
// ============================================================
(function () {
  var NUEVA = "https://hyslhmh-sudo.github.io/manifiestos/mipyv/";
  function irse() { try { location.replace(NUEVA); } catch (e) { location.href = NUEVA; } }
  function hayViejas() { try { return JSON.parse(localStorage.getItem("mipyv_queue_v1") || "[]").length > 0; } catch (e) { return false; } }
  function revisar() {
    if (hayViejas()) return;
    if (!("indexedDB" in window)) { irse(); return; }
    var req = indexedDB.open("mipyv_db", 1);
    req.onupgradeneeded = function () { var db = req.result; if (!db.objectStoreNames.contains("cola")) db.createObjectStore("cola", { keyPath: "qid", autoIncrement: true }); };
    req.onerror = function () { irse(); };
    req.onsuccess = function () {
      var db = req.result;
      try {
        var c = db.transaction("cola", "readonly").objectStore("cola").count();
        c.onsuccess = function () { db.close(); if (c.result === 0) irse(); };
        c.onerror = function () { db.close(); };
      } catch (e) { db.close(); irse(); }
    };
  }
  revisar();
  setInterval(revisar, 30000);
})();
