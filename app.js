// ============================================================
// ESTADO GENERAL
// ============================================================
let currentModule = null; // "mipyv" | "saneamiento"
let currentOperario = null; // { id, nombre }

const MIPYV_STEPS = ["quien","m-establecimiento","m-sector","m-plaga","m-producto","m-dosis","m-epp","m-resultado","m-foto","m-obs","m-confirm","m-sent"];

let stepList = [];
let stepIndex = 0;

let visita = {};
let photoDataUrl = null;

let trabajo = {}; // { id_trabajo, id_establecimiento, establecimiento, fecha_inicio, estado }
let avance = {};  // { id_avance, tareas:[], detalle, foto }
let sPhotoDataUrl = null;

function resetVisita() {
  visita = {
    id_visita: "V-" + Date.now(),
    fecha: new Date().toISOString(),
    id_operario: null, operario: null,
    id_establecimiento: null, establecimiento: null, tipo_establecimiento: null,
    sector: null,
    id_plaga: null, tipo_plaga: null,
    id_producto: null, producto: null,
    dosis_aplicada: null, frecuencia_recomendada: null, puntos_criticos: null,
    epp_utilizado: [],
    resultado: null,
    observaciones: "",
  };
  photoDataUrl = null;
}

function resetSaneamiento() {
  trabajo = { id_trabajo: null, id_establecimiento: null, establecimiento: null, fecha_inicio: null, estado: null, esNuevo: true };
  avance = { tareas: [], detalle: "" };
  sPhotoDataUrl = null;
}

// ============================================================
// NAVEGACIÓN
// ============================================================
const screensEl = document.getElementById("screens");
const progressFill = document.getElementById("progressFill");
const progressWrap = document.getElementById("progressWrap");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const bottomBar = document.getElementById("bottomBar");
const brandLabel = document.getElementById("brandLabel");
const homeBtn = document.getElementById("homeBtn");

function goHome() {
  currentModule = null;
  document.body.classList.remove("mode-saneamiento");
  brandLabel.textContent = "Red HZT";
  progressWrap.style.display = "none";
  bottomBar.style.display = "none";
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.querySelector('.screen[data-step="home"]').classList.add("active");
  screensEl.scrollTop = 0;
}
homeBtn.addEventListener("click", goHome);

function enterModule(mod) {
  currentModule = mod;
  resetVisita();
  resetSaneamiento();
  if (mod === "saneamiento") {
    document.body.classList.add("mode-saneamiento");
    brandLabel.textContent = "Saneamiento · Área Externa";
    stepList = ["quien", "s-tipo"]; // el resto se arma dinámicamente según nuevo/continuar
  } else {
    document.body.classList.remove("mode-saneamiento");
    brandLabel.textContent = "MIPyV · HZT Red";
    stepList = [...MIPYV_STEPS];
  }
  progressWrap.style.display = "block";
  bottomBar.style.display = "flex";
  stepIndex = 0;
  showStep(stepList[0]);
}

document.getElementById("goMipyv").addEventListener("click", () => enterModule("mipyv"));
document.getElementById("goSaneamiento").addEventListener("click", () => enterModule("saneamiento"));

function showStep(name) {
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.toggle("active", s.dataset.step === name);
  });
  const pos = stepList.indexOf(name) + 1;
  progressFill.style.width = Math.max(8, (pos / stepList.length) * 100) + "%";
  backBtn.style.visibility = pos <= 1 ? "hidden" : "visible";
  const isSentScreen = name === "m-sent" || name === "s-sent";
  bottomBar.style.display = isSentScreen ? "none" : "flex";
  nextBtn.disabled = !canAdvance(name);
  const isConfirm = name === "m-confirm" || name === "s-confirm";
  nextBtn.textContent = isConfirm ? "Enviar" : "Siguiente";
  screensEl.scrollTop = 0;

  if (name === "m-confirm") renderResumenMipyv();
  if (name === "s-confirm") renderResumenSaneamiento();
  if (name === "s-cap-continuar") renderTrabajosAbiertos();
}

function canAdvance(name) {
  switch (name) {
    case "quien": return !!currentOperario;
    case "m-establecimiento": return !!visita.id_establecimiento;
    case "m-sector": return !!visita.sector;
    case "m-plaga": return !!visita.id_plaga;
    case "m-producto": return !!visita.id_producto;
    case "m-resultado": return !!visita.resultado;
    case "s-tipo": return false; // avanza por botón propio, no por "Siguiente"
    case "s-cap-nuevo": return !!trabajo.id_establecimiento;
    case "s-cap-continuar": return !!trabajo.id_trabajo;
    case "s-tareas": return avance.tareas.length > 0;
    case "s-cierre": return !!avance.cierre;
    default: return true;
  }
}

function goNext() {
  const current = stepList[stepIndex];
  if (!canAdvance(current)) return;
  if (current === "m-confirm") { sendVisita(); return; }
  if (current === "s-confirm") { sendAvance(); return; }
  if (stepIndex < stepList.length - 1) stepIndex++;
  showStep(stepList[stepIndex]);
}
function goBack() {
  if (stepIndex > 0) stepIndex--;
  showStep(stepList[stepIndex]);
}
nextBtn.addEventListener("click", goNext);
backBtn.addEventListener("click", goBack);

// ============================================================
// PASO COMPARTIDO — QUIEN SOS
// ============================================================
const operarioGrid = document.getElementById("operarioGrid");
OPERARIOS.forEach(op => {
  const btn = document.createElement("button");
  btn.className = "tile big person-tile";
  btn.innerHTML = `<div class="avatar">${op.inicial}</div><div class="label">${op.nombre}</div>`;
  btn.onclick = () => {
    currentOperario = op;
    visita.id_operario = op.id; visita.operario = op.nombre;
    [...operarioGrid.children].forEach(c => c.classList.remove("selected"));
    btn.classList.add("selected");
    nextBtn.disabled = false;
    setTimeout(goNext, 180);
  };
  operarioGrid.appendChild(btn);
});

// ============================================================
// MIPyV — PASO 2: ESTABLECIMIENTO
// ============================================================
const tipoChips = document.getElementById("tipoChips");
const establecimientoGrid = document.getElementById("establecimientoGrid");
const TIPOS = ["Todos", "Hospital", "Dependencia", "CAP"];
let tipoFiltro = "Todos";

TIPOS.forEach(t => {
  const chip = document.createElement("button");
  chip.className = "chip" + (t === "Todos" ? " active" : "");
  chip.textContent = t === "CAP" ? "CAPS" : t;
  chip.onclick = () => {
    tipoFiltro = t;
    [...tipoChips.children].forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    renderEstablecimientos();
  };
  tipoChips.appendChild(chip);
});

function renderEstablecimientos() {
  establecimientoGrid.innerHTML = "";
  const iconFor = { Hospital: "hospital", Dependencia: "building", CAP: "cap" };
  ESTABLECIMIENTOS.filter(e => tipoFiltro === "Todos" || e.tipo === tipoFiltro).forEach(est => {
    const btn = document.createElement("button");
    btn.className = "tile";
    btn.innerHTML = `${renderIcon(iconFor[est.tipo])}<div class="label">${est.nombre}</div>`;
    if (visita.id_establecimiento === est.id) btn.classList.add("selected");
    btn.onclick = () => {
      visita.id_establecimiento = est.id; visita.establecimiento = est.nombre; visita.tipo_establecimiento = est.tipo;
      [...establecimientoGrid.children].forEach(c => c.classList.remove("selected"));
      btn.classList.add("selected");
      renderSectores();
      nextBtn.disabled = false;
      setTimeout(goNext, 180);
    };
    establecimientoGrid.appendChild(btn);
  });
}
renderEstablecimientos();

// ============================================================
// MIPyV — PASO 3: SECTOR
// ============================================================
const sectorGrid = document.getElementById("sectorGrid");
const sectorSub = document.getElementById("sectorSub");
const sectorLibreWrap = document.getElementById("sectorLibreWrap");
const sectorChipsSugeridos = document.getElementById("sectorChipsSugeridos");
const sectorInput = document.getElementById("sectorInput");

function renderSectores() {
  const esHZT = visita.tipo_establecimiento === "Hospital";
  sectorGrid.style.display = esHZT ? "grid" : "none";
  sectorLibreWrap.style.display = esHZT ? "none" : "block";

  if (esHZT) {
    sectorSub.textContent = "Elegí dónde interviniste";
    sectorGrid.innerHTML = "";
    SECTORES_HZT.forEach(sec => {
      const btn = document.createElement("button");
      btn.className = "tile";
      btn.style.minHeight = "84px";
      btn.innerHTML = `<div class="label">${sec}</div>`;
      if (visita.sector === sec) btn.classList.add("selected");
      btn.onclick = () => {
        visita.sector = sec;
        [...sectorGrid.children].forEach(c => c.classList.remove("selected"));
        btn.classList.add("selected");
        nextBtn.disabled = false;
        setTimeout(goNext, 180);
      };
      sectorGrid.appendChild(btn);
    });
  } else {
    sectorSub.textContent = "Cada CAP es distinto — tocá un sector frecuente o escribilo/decilo";
    sectorInput.value = visita.sector || "";
    sectorChipsSugeridos.innerHTML = "";
    SECTORES_DEPENDENCIAS.forEach(sec => {
      const chip = document.createElement("button");
      chip.className = "chip";
      chip.textContent = sec;
      if (visita.sector === sec) chip.classList.add("active");
      chip.onclick = () => {
        [...sectorChipsSugeridos.children].forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        sectorInput.value = sec;
        visita.sector = sec;
        nextBtn.disabled = false;
        setTimeout(goNext, 180);
      };
      sectorChipsSugeridos.appendChild(chip);
    });
  }
}

sectorInput.addEventListener("input", () => {
  visita.sector = sectorInput.value.trim();
  nextBtn.disabled = !canAdvance("m-sector");
  [...sectorChipsSugeridos.children].forEach(c => c.classList.toggle("active", c.textContent === visita.sector));
});

setupVoiceButton("sectorVoiceBtn", "sectorVoiceResult", (texto) => {
  sectorInput.value = texto;
  visita.sector = texto.trim();
  nextBtn.disabled = !canAdvance("m-sector");
});

// ============================================================
// MIPyV — PASO 4: PLAGA
// ============================================================
const plagaGrid = document.getElementById("plagaGrid");
PLAGAS.forEach(pl => {
  const btn = document.createElement("button");
  btn.className = "tile";
  btn.innerHTML = `${renderIcon(pl.icono)}<div class="label">${pl.nombre}</div>`;
  btn.onclick = () => {
    visita.id_plaga = pl.id; visita.tipo_plaga = pl.nombre;
    [...plagaGrid.children].forEach(c => c.classList.remove("selected"));
    btn.classList.add("selected");
    nextBtn.disabled = false;
    setTimeout(goNext, 180);
  };
  plagaGrid.appendChild(btn);
});

// ============================================================
// MIPyV — PASO 5: PRODUCTO
// ============================================================
const productoGrid = document.getElementById("productoGrid");
PRODUCTOS.forEach(pr => {
  const btn = document.createElement("button");
  btn.className = "tile";
  btn.innerHTML = `${renderIcon(pr.icono, null, pr.color)}<div class="label">${pr.nombre}</div>`;
  btn.onclick = () => {
    visita.id_producto = pr.id; visita.producto = pr.nombre;
    [...productoGrid.children].forEach(c => c.classList.remove("selected"));
    btn.classList.add("selected");
    applyDosisFrecuencia();
    nextBtn.disabled = false;
    setTimeout(goNext, 180);
  };
  productoGrid.appendChild(btn);
});

function applyDosisFrecuencia() {
  const key = `${visita.id_plaga}|${visita.id_producto}`;
  const d = DOSIS_FRECUENCIA[key] || DOSIS_DEFAULT;
  visita.dosis_aplicada = d.dosis;
  visita.frecuencia_recomendada = d.frecuencia;
  visita.puntos_criticos = d.puntos;
  document.getElementById("dosisTxt").textContent = d.dosis;
  document.getElementById("frecTxt").textContent = d.frecuencia;
  document.getElementById("puntosTxt").textContent = d.puntos;
}

// ============================================================
// MIPyV — PASO 7: EPP
// ============================================================
const eppGrid = document.getElementById("eppGrid");
EPP.forEach(item => {
  const btn = document.createElement("button");
  btn.className = "tile epp-tile";
  btn.innerHTML = `<div class="epp-check"></div>${renderIcon(item.icono)}<div class="label">${item.nombre}</div>`;
  btn.onclick = () => {
    btn.classList.toggle("selected");
    if (btn.classList.contains("selected")) visita.epp_utilizado.push(item.nombre);
    else visita.epp_utilizado = visita.epp_utilizado.filter(x => x !== item.nombre);
  };
  eppGrid.appendChild(btn);
});

// ============================================================
// MIPyV — PASO 8: RESULTADO
// ============================================================
document.querySelectorAll('[data-resultado]').forEach(btn => {
  btn.onclick = () => {
    visita.resultado = btn.dataset.resultado;
    document.querySelectorAll('[data-resultado]').forEach(b => b.style.outline = "none");
    btn.style.outline = "4px solid #0D313F";
    nextBtn.disabled = false;
    setTimeout(goNext, 200);
  };
});

// ============================================================
// MIPyV — PASO 9: FOTO
// ============================================================
const photoBox = document.getElementById("photoBox");
const photoInput = document.getElementById("photoInput");
function handlePhotoChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    photoDataUrl = ev.target.result;
    photoBox.innerHTML = `<img src="${photoDataUrl}" alt="foto sector">`;
  };
  reader.readAsDataURL(file);
}
photoBox.addEventListener("click", () => photoInput.click());
photoInput.addEventListener("change", handlePhotoChange);

// ============================================================
// MIPyV — PASO 10: OBSERVACIONES
// ============================================================
const obsChips = document.getElementById("obsChips");
let obsSeleccionadas = [];
OBSERVACIONES_CHIPS.forEach(txt => {
  const chip = document.createElement("button");
  chip.className = "chip";
  chip.textContent = txt;
  chip.onclick = () => {
    chip.classList.toggle("active");
    if (chip.classList.contains("active")) obsSeleccionadas.push(txt);
    else obsSeleccionadas = obsSeleccionadas.filter(x => x !== txt);
    visita.observaciones = obsSeleccionadas.join(" · ");
  };
  obsChips.appendChild(chip);
});

function setupVoiceButton(btnId, resultId, onText) {
  const btn = document.getElementById(btnId);
  const result = document.getElementById(resultId);
  btn.addEventListener("click", () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { result.textContent = "Dictado por voz no disponible en este dispositivo."; return; }
    const rec = new SR();
    rec.lang = "es-AR";
    rec.onresult = (e) => {
      const texto = e.results[0][0].transcript;
      onText(texto);
      result.textContent = "Grabado: “" + texto + "”";
    };
    rec.onerror = () => { result.textContent = "No se pudo grabar. Probá de nuevo."; };
    const originalLabel = btn.textContent;
    btn.textContent = "🎙️ Escuchando…";
    rec.start();
    rec.onend = () => { btn.textContent = originalLabel; };
  });
}
setupVoiceButton("voiceBtn", "voiceResult", (texto) => {
  obsSeleccionadas.push(texto);
  visita.observaciones = obsSeleccionadas.join(" · ");
});

// ============================================================
// MIPyV — PASO 11: RESUMEN
// ============================================================
function renderResumenMipyv() {
  const rows = [
    ["Operario", visita.operario],
    ["Establecimiento", visita.establecimiento],
    ["Sector", visita.sector],
    ["Plaga", visita.tipo_plaga],
    ["Producto", visita.producto],
    ["Resultado", visita.resultado],
  ];
  document.getElementById("summaryList").innerHTML = rows.map(([k, v]) => `
    <div class="summary-card">
      ${renderIcon("generic", 34)}
      <div class="txt"><b>${k}</b><span>${v || "—"}</span></div>
    </div>`).join("");
}

// ============================================================
// SANEAMIENTO — s-tipo (nuevo / continuar)
// ============================================================
document.getElementById("sNuevoBtn").addEventListener("click", () => {
  trabajo.esNuevo = true;
  stepList = ["quien", "s-tipo", "s-cap-nuevo", "s-tareas", "s-detalle", "s-cierre", "s-confirm", "s-sent"];
  stepIndex = stepList.indexOf("s-cap-nuevo");
  showStep("s-cap-nuevo");
});
document.getElementById("sContinuarBtn").addEventListener("click", () => {
  trabajo.esNuevo = false;
  stepList = ["quien", "s-tipo", "s-cap-continuar", "s-tareas", "s-detalle", "s-cierre", "s-confirm", "s-sent"];
  stepIndex = stepList.indexOf("s-cap-continuar");
  showStep("s-cap-continuar");
});

// ============================================================
// SANEAMIENTO — s-cap-nuevo
// ============================================================
const capGridNuevo = document.getElementById("capGridNuevo");
CAPS_SANEAMIENTO.forEach(cap => {
  const btn = document.createElement("button");
  btn.className = "tile";
  btn.innerHTML = `${renderIcon("cap")}<div class="label">${cap.nombre}</div>`;
  btn.onclick = () => {
    trabajo.id_trabajo = "T-" + Date.now();
    trabajo.id_establecimiento = cap.id;
    trabajo.establecimiento = cap.nombre;
    trabajo.fecha_inicio = new Date().toISOString();
    trabajo.estado = "Abierto";
    [...capGridNuevo.children].forEach(c => c.classList.remove("selected"));
    btn.classList.add("selected");
    nextBtn.disabled = false;
    setTimeout(goNext, 180);
  };
  capGridNuevo.appendChild(btn);
});

// ============================================================
// SANEAMIENTO — s-cap-continuar (trabajos abiertos, cacheados localmente)
// ============================================================
const TRABAJOS_KEY = "mipyv_trabajos_abiertos_v1";
function getTrabajosAbiertos() { return JSON.parse(localStorage.getItem(TRABAJOS_KEY) || "[]"); }
function setTrabajosAbiertos(list) { localStorage.setItem(TRABAJOS_KEY, JSON.stringify(list)); }

function renderTrabajosAbiertos() {
  fetchTrabajosAbiertosRemotos().finally(() => {
    const list = getTrabajosAbiertos();
    const wrap = document.getElementById("trabajosAbiertosList");
    const msg = document.getElementById("sinTrabajosMsg");
    wrap.innerHTML = "";
    if (list.length === 0) { msg.style.display = "block"; return; }
    msg.style.display = "none";
    list.forEach(t => {
      const card = document.createElement("button");
      card.className = "job-card";
      const fecha = new Date(t.fecha_inicio).toLocaleDateString("es-AR");
      card.innerHTML = `<b>${t.establecimiento}</b><span>Iniciado ${fecha}</span>`;
      card.onclick = () => {
        trabajo = { ...t, esNuevo: false };
        [...wrap.children].forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        nextBtn.disabled = false;
        setTimeout(goNext, 180);
      };
      wrap.appendChild(card);
    });
  });
}

// Trae los trabajos abiertos que están en la planilla (por si el otro operario
// inició uno desde su propio celular) y los mezcla con la cache local.
async function fetchTrabajosAbiertosRemotos() {
  if (!navigator.onLine) return;
  if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.includes("PEGAR_ACA")) return;
  try {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL, { method: "GET" });
    const data = await res.json();
    if (!data.trabajos_abiertos) return;
    const local = getTrabajosAbiertos();
    const merged = [...local];
    data.trabajos_abiertos.forEach(remoto => {
      if (!merged.some(t => t.id_trabajo === remoto.id_trabajo)) merged.push(remoto);
    });
    setTrabajosAbiertos(merged);
  } catch (err) {
    console.warn("No se pudieron traer trabajos abiertos remotos.", err);
  }
}

// ============================================================
// SANEAMIENTO — s-tareas
// ============================================================
const tareasGrid = document.getElementById("tareasGrid");
TAREAS_SANEAMIENTO.forEach(t => {
  const btn = document.createElement("button");
  btn.className = "tile multi";
  btn.innerHTML = `<div class="epp-check"></div>${renderIcon(t.icono)}<div class="label">${t.nombre}</div>`;
  btn.onclick = () => {
    btn.classList.toggle("selected");
    if (btn.classList.contains("selected")) avance.tareas.push(t.nombre);
    else avance.tareas = avance.tareas.filter(x => x !== t.nombre);
    nextBtn.disabled = !canAdvance("s-tareas");
  };
  tareasGrid.appendChild(btn);
});

// ============================================================
// SANEAMIENTO — s-detalle (chips + foto + voz)
// ============================================================
const detalleChips = document.getElementById("detalleChips");
let detalleSeleccionados = [];
DETALLE_CHIPS_SANEAMIENTO.forEach(txt => {
  const chip = document.createElement("button");
  chip.className = "chip";
  chip.textContent = txt;
  chip.onclick = () => {
    chip.classList.toggle("active");
    if (chip.classList.contains("active")) detalleSeleccionados.push(txt);
    else detalleSeleccionados = detalleSeleccionados.filter(x => x !== txt);
    avance.detalle = detalleSeleccionados.join(" · ");
  };
  detalleChips.appendChild(chip);
});

const sPhotoBox = document.getElementById("sPhotoBox");
const sPhotoInput = document.getElementById("sPhotoInput");
sPhotoBox.addEventListener("click", () => sPhotoInput.click());
sPhotoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    sPhotoDataUrl = ev.target.result;
    sPhotoBox.innerHTML = `<img src="${sPhotoDataUrl}" alt="foto avance">`;
  };
  reader.readAsDataURL(file);
});

setupVoiceButton("sVoiceBtn", "sVoiceResult", (texto) => {
  detalleSeleccionados.push(texto);
  avance.detalle = detalleSeleccionados.join(" · ");
});

// ============================================================
// SANEAMIENTO — s-cierre
// ============================================================
document.querySelectorAll('[data-cierre]').forEach(btn => {
  btn.onclick = () => {
    avance.cierre = btn.dataset.cierre; // "continua" | "terminado"
    document.querySelectorAll('[data-cierre]').forEach(b => b.style.outline = "none");
    btn.style.outline = "4px solid #2E5233";
    nextBtn.disabled = false;
    setTimeout(goNext, 200);
  };
});

// ============================================================
// SANEAMIENTO — s-confirm
// ============================================================
function renderResumenSaneamiento() {
  const rows = [
    ["Operario", currentOperario ? currentOperario.nombre : "—"],
    ["CAP", trabajo.establecimiento],
    ["Tareas de hoy", avance.tareas.join(", ") || "—"],
    ["Cierre", avance.cierre === "terminado" ? "Trabajo terminado" : "Continúa otro día"],
  ];
  document.getElementById("sSummaryList").innerHTML = rows.map(([k, v]) => `
    <div class="summary-card">
      ${renderIcon("generic", 34)}
      <div class="txt"><b>${k}</b><span>${v || "—"}</span></div>
    </div>`).join("");
}

// ============================================================
// COLA OFFLINE + ENVÍO — MIPyV
// ============================================================
const QUEUE_KEY = "mipyv_queue_v1";
function getQueue() { return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]"); }
function setQueue(q) { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); updateQueueBadge(); }

function sendVisita() {
  const record = { ...visita, foto_base64: photoDataUrl };
  const q = getQueue();
  q.push({ tipo: "visita", data: record });
  setQueue(q);
  document.getElementById("sentSub").textContent = navigator.onLine
    ? "Visita registrada — sincronizando…"
    : "Visita guardada en el celular — se enviará cuando haya señal";
  stepIndex = stepList.length - 1;
  showStep("m-sent");
  trySync();
}

document.getElementById("newVisitBtn").addEventListener("click", () => {
  resetVisita();
  photoBox.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none"><path d="M4 8a2 2 0 012-2h1.5l1-2h7l1 2H18a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" stroke="#5894A7" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.5" stroke="#5894A7" stroke-width="2"/></svg>
    <span>Tocá para sacar la foto</span>
    <input type="file" accept="image/*" capture="environment" id="photoInput" style="display:none">`;
  document.getElementById("photoInput").addEventListener("change", handlePhotoChange);
  obsSeleccionadas = [];
  [...obsChips.children].forEach(c => c.classList.remove("active"));
  [...establecimientoGrid.children].forEach(c => c.classList.remove("selected"));
  document.querySelectorAll(".epp-tile").forEach(c => c.classList.remove("selected"));
  document.querySelectorAll('[data-resultado]').forEach(b => b.style.outline = "none");
  enterModule("mipyv");
});

// ============================================================
// COLA OFFLINE + ENVÍO — SANEAMIENTO
// ============================================================
function sendAvance() {
  const record = {
    id_avance: "A-" + Date.now(),
    id_trabajo: trabajo.id_trabajo,
    fecha: new Date().toISOString(),
    id_operario: currentOperario.id,
    operario: currentOperario.nombre,
    id_establecimiento: trabajo.id_establecimiento,
    establecimiento: trabajo.establecimiento,
    tareas: avance.tareas,
    detalle: avance.detalle,
    foto_base64: sPhotoDataUrl,
    cierre: avance.cierre,
  };

  const q = getQueue();
  // si es trabajo nuevo, primero se registra el trabajo en sí
  if (trabajo.esNuevo) {
    q.push({ tipo: "trabajo_nuevo", data: { ...trabajo, operario_inicio: currentOperario.nombre } });
  }
  q.push({ tipo: "avance", data: record });

  // actualizar/crear cache local de trabajos abiertos
  let abiertos = getTrabajosAbiertos();
  if (avance.cierre === "terminado") {
    abiertos = abiertos.filter(t => t.id_trabajo !== trabajo.id_trabajo);
    q.push({ tipo: "cierre_trabajo", data: { id_trabajo: trabajo.id_trabajo, fecha_fin: new Date().toISOString() } });
  } else {
    const idx = abiertos.findIndex(t => t.id_trabajo === trabajo.id_trabajo);
    const trabajoParaCache = { id_trabajo: trabajo.id_trabajo, id_establecimiento: trabajo.id_establecimiento, establecimiento: trabajo.establecimiento, fecha_inicio: trabajo.fecha_inicio, estado: "Abierto" };
    if (idx >= 0) abiertos[idx] = trabajoParaCache; else abiertos.push(trabajoParaCache);
  }
  setTrabajosAbiertos(abiertos);
  setQueue(q);

  document.getElementById("sSentSub").textContent = navigator.onLine
    ? "Avance registrado — sincronizando…"
    : "Avance guardado en el celular — se enviará cuando haya señal";
  stepIndex = stepList.length - 1;
  showStep("s-sent");
  trySync();
}

document.getElementById("sNewBtn").addEventListener("click", () => {
  resetSaneamiento();
  sPhotoBox.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none"><path d="M4 8a2 2 0 012-2h1.5l1-2h7l1 2H18a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" stroke="#6E8E4E" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.5" stroke="#6E8E4E" stroke-width="2"/></svg>
    <span>Tocá para sacar la foto (recomendado)</span>
    <input type="file" accept="image/*" capture="environment" id="sPhotoInput" style="display:none">`;
  detalleSeleccionados = [];
  [...detalleChips.children].forEach(c => c.classList.remove("active"));
  document.querySelectorAll(".tile.multi").forEach(c => c.classList.remove("selected"));
  document.querySelectorAll('[data-cierre]').forEach(b => b.style.outline = "none");
  [...capGridNuevo.children].forEach(c => c.classList.remove("selected"));
  enterModule("saneamiento");
});

// ============================================================
// SINCRONIZACIÓN
// ============================================================
function updateQueueBadge() {
  const q = getQueue();
  const badge = document.getElementById("queueBadge");
  if (q.length > 0) { badge.textContent = q.length + " sin enviar"; badge.classList.add("show"); }
  else { badge.classList.remove("show"); }
}

async function trySync() {
  if (!navigator.onLine) return;
  if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.includes("PEGAR_ACA")) return;
  let q = getQueue();
  if (q.length === 0) { showSyncFeedback("Ya está todo sincronizado"); return; }
  const enColaAntes = q.length;
  const pending = [...q];
  const syncBtn = document.getElementById("syncBtn");
  const originalLabel = syncBtn.textContent;
  syncBtn.textContent = "Enviando…";
  for (const item of pending) {
    try {
      await fetch(CONFIG.APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(item),
      });
      q = q.filter(r => r !== item);
      setQueue(q);
    } catch (err) {
      console.warn("Sin conexión real o error de red, se reintenta después.", err);
      break;
    }
  }
  syncBtn.textContent = originalLabel;
  const quedan = getQueue().length;
  if (quedan === 0) showSyncFeedback(`Listo — se enviaron ${enColaAntes} registro(s)`);
  else showSyncFeedback(`Se enviaron algunos, quedan ${quedan} pendientes`);
}

function showSyncFeedback(msg) {
  const badge = document.getElementById("queueBadge");
  const prevText = badge.textContent;
  const prevShow = badge.classList.contains("show");
  badge.textContent = msg;
  badge.classList.add("show");
  setTimeout(() => {
    updateQueueBadge();
  }, 2500);
}

document.getElementById("syncBtn").addEventListener("click", trySync);
window.addEventListener("online", () => { setNetDot(true); trySync(); });
window.addEventListener("offline", () => setNetDot(false));

function setNetDot(online) {
  document.getElementById("netDot").classList.toggle("offline", !online);
}

// ============================================================
// INIT
// ============================================================
document.getElementById("iconBug").innerHTML = renderIcon("bug");
document.getElementById("iconBroom").innerHTML = renderIcon("broom");
document.getElementById("iconNuevo").innerHTML = renderIcon("calendar_new");
document.getElementById("iconContinuar").innerHTML = renderIcon("calendar_continue");

setNetDot(navigator.onLine);
updateQueueBadge();
progressWrap.style.display = "none";
bottomBar.style.display = "none";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
