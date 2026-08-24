// ============================================================
// ESTADO GENERAL
// ============================================================
let currentModule = null; // "mipyv" | "saneamiento"
let currentOperario = null; // { id, nombre }

let stepList = [];
let stepIndex = 0;

let visita = {};
let fotosDataUrls = []; // hasta 5
let intervencion = {}; // { protocolo, esNueva, id_establecimiento, establecimiento, tipo_establecimiento, id_plaga, tipo_plaga }

let trabajo = {};
let avance = {};
let sFotosDataUrls = []; // hasta 5
let operarioAcompanante = null; // nombre del otro operario, o null si trabajó solo/a
let acompananteRespondido = false;
let detalleExtraTextos = {}; // texto extra por cada chip de DETALLE_CHIPS_SANEAMIENTO que lo requiera

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
    epp_utilizado: [], // [{nombre, cantidad}]
    resultado: null,
    observaciones: "",
    protocolo_existente: null,
    operario_acompanante: null,
    hora_inicio: null, hora_fin: null,
    hora_inicio_acompanante: null, hora_fin_acompanante: null,
  };
  fotosDataUrls = [];
}

function resetIntervencion() {
  intervencion = { protocolo: null, esNueva: true, id_establecimiento: null, establecimiento: null, tipo_establecimiento: null, id_plaga: null, tipo_plaga: null };
}

function resetSaneamiento() {
  trabajo = { id_trabajo: null, id_establecimiento: null, establecimiento: null, fecha_inicio: null, estado: null, esNuevo: true };
  avance = {
    tareas: [], detalle: "", notas: "",
    epp_utilizado: [], // [{nombre, cantidad}]
    producto_biocida: null, id_producto_biocida: null,
    dosis_biocida: null, frecuencia_biocida: null, puntos_criticos_biocida: null,
  };
  sFotosDataUrls = [];
  detalleExtraTextos = {};
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
  resetIntervencion();
  resetSaneamiento();
  operarioAcompanante = null;
  acompananteRespondido = false;
  if (mod === "saneamiento") {
    document.body.classList.add("mode-saneamiento");
    brandLabel.textContent = "Saneamiento · Área Externa";
    stepList = ["quien", "acompanante", "s-tipo"];
  } else {
    document.body.classList.remove("mode-saneamiento");
    brandLabel.textContent = "MIPyV · HZT Red";
    stepList = ["quien", "acompanante", "m-tipo"];
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
  if (name === "m-continuar-lista") renderIntervencionesAbiertas();
  if (name === "m-seguridad") renderSeguridad();
  if (name === "acompanante") actualizarLabelAcompanante();
  if (name === "horario") actualizarPantallaHorario();
  if (name === "m-foto") renderFotoGrid();
  if (name === "s-detalle") renderSFotoGrid();
  if (name === "m-epp") renderEppGrid();
  if (name === "s-epp") renderSEppGrid();
  if (name === "s-seguridad") renderSSeguridad();
}

function canAdvance(name) {
  switch (name) {
    case "quien": return !!currentOperario;
    case "acompanante": return acompananteRespondido;
    case "horario": return validarHorario();
    case "m-tipo": return false;
    case "m-continuar-lista": return !!intervencion.protocolo;
    case "m-establecimiento": return !!visita.id_establecimiento;
    case "m-sector": return !!visita.sector;
    case "m-plaga": return !!visita.id_plaga;
    case "m-producto": return !!visita.id_producto;
    case "m-epp": return visita.epp_utilizado.length > 0;
    case "m-resultado": return !!visita.resultado;
    case "s-tipo": return false;
    case "s-cap-nuevo": return !!trabajo.id_establecimiento;
    case "s-cap-continuar": return !!trabajo.id_trabajo;
    case "s-producto": return !!avance.id_producto_biocida;
    case "s-tareas": return avance.tareas.length > 0;
    case "s-epp": return avance.epp_utilizado.length > 0;
    case "s-detalle": return validarDetalleSaneamiento();
    case "s-cierre": return !!avance.cierre;
    default: return true;
  }
}

function validarHorario() {
  if (!horaInicioEl.value || !horaFinEl.value) return false;
  if (operarioAcompanante && (!horaInicioAcompEl.value || !horaFinAcompEl.value)) return false;
  return true;
}

function validarDetalleSaneamiento() {
  return detalleSeleccionados
    .filter(txt => CHIPS_CON_DETALLE[txt])
    .every(txt => (detalleExtraTextos[txt] || "").trim().length > 0);
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
// PASO COMPARTIDO — ACOMPAÑANTE (trabajó solo o con el otro operario)
// ============================================================
const acompanadoLabel = document.getElementById("acompanadoLabel");
document.getElementById("soloBtn").addEventListener("click", () => {
  operarioAcompanante = null;
  acompananteRespondido = true;
  setTimeout(goNext, 180);
});
document.getElementById("acompanadoBtn").addEventListener("click", () => {
  const otro = OPERARIOS.find(op => op.id !== currentOperario.id);
  operarioAcompanante = otro ? otro.nombre : null;
  acompananteRespondido = true;
  setTimeout(goNext, 180);
});
function actualizarLabelAcompanante() {
  const otro = OPERARIOS.find(op => currentOperario && op.id !== currentOperario.id);
  acompanadoLabel.textContent = "Trabajé con " + (otro ? otro.nombre : "el otro operario");
}

// ============================================================
// PASO COMPARTIDO — HORARIO (hora de inicio/fin, propia y del acompañante)
// ============================================================
const horaInicioEl = document.getElementById("horaInicio");
const horaFinEl = document.getElementById("horaFin");
const horarioAcompananteWrap = document.getElementById("horarioAcompananteWrap");
const horaInicioAcompLabel = document.getElementById("horaInicioAcompLabel");
const horaFinAcompLabel = document.getElementById("horaFinAcompLabel");
const horaInicioAcompEl = document.getElementById("horaInicioAcomp");
const horaFinAcompEl = document.getElementById("horaFinAcomp");

function actualizarPantallaHorario() {
  const hayAcompanante = !!operarioAcompanante;
  horarioAcompananteWrap.style.display = hayAcompanante ? "block" : "none";
  if (hayAcompanante) {
    horaInicioAcompLabel.textContent = `Hora de inicio de ${operarioAcompanante}`;
    horaFinAcompLabel.textContent = `Hora de finalización de ${operarioAcompanante}`;
  }
}

function guardarHorarios(objetivo) {
  objetivo.hora_inicio = horaInicioEl.value || null;
  objetivo.hora_fin = horaFinEl.value || null;
  objetivo.hora_inicio_acompanante = operarioAcompanante ? (horaInicioAcompEl.value || null) : null;
  objetivo.hora_fin_acompanante = operarioAcompanante ? (horaFinAcompEl.value || null) : null;
}

[horaInicioEl, horaFinEl, horaInicioAcompEl, horaFinAcompEl].forEach(el => {
  el.addEventListener("input", () => {
    if (stepList[stepIndex] === "horario") nextBtn.disabled = !canAdvance("horario");
  });
});

// ============================================================
// MIPyV — m-tipo (nueva / continuar)
// ============================================================
document.getElementById("mNuevaBtn").addEventListener("click", () => {
  intervencion.esNueva = true;
  stepList = ["quien", "acompanante", "m-tipo", "m-establecimiento", "m-sector", "m-plaga", "m-producto", "m-seguridad", "m-dosis", "m-epp", "m-resultado", "m-foto", "m-obs", "horario", "m-confirm", "m-sent"];
  stepIndex = stepList.indexOf("m-establecimiento");
  showStep("m-establecimiento");
});
document.getElementById("mContinuarBtn").addEventListener("click", () => {
  intervencion.esNueva = false;
  stepList = ["quien", "acompanante", "m-tipo", "m-continuar-lista", "m-sector", "m-producto", "m-seguridad", "m-dosis", "m-epp", "m-resultado", "m-foto", "m-obs", "horario", "m-confirm", "m-sent"];
  stepIndex = stepList.indexOf("m-continuar-lista");
  showStep("m-continuar-lista");
});

// ============================================================
// MIPyV — m-continuar-lista (intervenciones abiertas, cacheadas localmente)
// ============================================================
const INTERVENCIONES_KEY = "mipyv_intervenciones_abiertas_v1";
function getIntervencionesAbiertas() { return JSON.parse(localStorage.getItem(INTERVENCIONES_KEY) || "[]"); }
function setIntervencionesAbiertas(list) { localStorage.setItem(INTERVENCIONES_KEY, JSON.stringify(list)); }

function renderIntervencionesAbiertas() {
  pintarIntervencionesAbiertas(); // muestra lo que ya hay en el celular, sin esperar
  fetchIntervencionesAbiertasRemotas().finally(pintarIntervencionesAbiertas);
}

function pintarIntervencionesAbiertas() {
  const list = getIntervencionesAbiertas();
  const wrap = document.getElementById("intervencionesAbiertasList");
  const msg = document.getElementById("sinIntervencionesMsg");
  wrap.innerHTML = "";
  if (list.length === 0) { msg.style.display = "block"; return; }
  msg.style.display = "none";
  list.forEach(iv => {
    const card = document.createElement("button");
    card.className = "job-card";
    card.innerHTML = `<b>${iv.tipo_plaga} — ${iv.establecimiento}</b><span>Sector: ${iv.sector || "—"} · Protocolo ${iv.protocolo}</span>`;
    card.onclick = () => {
      intervencion.protocolo = iv.protocolo;
      intervencion.id_establecimiento = iv.id_establecimiento;
      intervencion.establecimiento = iv.establecimiento;
      intervencion.tipo_establecimiento = iv.tipo_establecimiento;
      intervencion.id_plaga = iv.id_plaga;
      intervencion.tipo_plaga = iv.tipo_plaga;
      visita.id_establecimiento = iv.id_establecimiento;
      visita.establecimiento = iv.establecimiento;
      visita.tipo_establecimiento = iv.tipo_establecimiento;
      visita.id_plaga = iv.id_plaga;
      visita.tipo_plaga = iv.tipo_plaga;
      visita.protocolo_existente = iv.protocolo;
      [...wrap.children].forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      renderSectores();
      nextBtn.disabled = false;
      setTimeout(goNext, 180);
    };
    wrap.appendChild(card);
  });
}

async function fetchIntervencionesAbiertasRemotas() {
  if (!navigator.onLine) return;
  if (!CONFIG.APPS_SCRIPT_URL || CONFIG.APPS_SCRIPT_URL.includes("PEGAR_ACA")) return;
  try {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL, { method: "GET" });
    const data = await res.json();
    if (!data.intervenciones_abiertas) return;
    const local = getIntervencionesAbiertas();
    const merged = [...local];
    data.intervenciones_abiertas.forEach(remoto => {
      if (!merged.some(iv => iv.protocolo === remoto.protocolo)) merged.push(remoto);
    });
    setIntervencionesAbiertas(merged);
  } catch (err) {
    console.warn("No se pudieron traer intervenciones abiertas remotas.", err);
  }
}

// ============================================================
// MIPyV — m-establecimiento
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
      intervencion.id_establecimiento = est.id; intervencion.establecimiento = est.nombre; intervencion.tipo_establecimiento = est.tipo;
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
// MIPyV — m-sector
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
    sectorSub.textContent = "Cada CAP es distinto — tocá un sector frecuente o escribilo";
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

// ============================================================
// MIPyV — m-plaga
// ============================================================
const plagaGrid = document.getElementById("plagaGrid");
PLAGAS.forEach(pl => {
  const btn = document.createElement("button");
  btn.className = "tile";
  btn.innerHTML = `${renderIcon(pl.icono)}<div class="label">${pl.nombre}</div>`;
  btn.onclick = () => {
    visita.id_plaga = pl.id; visita.tipo_plaga = pl.nombre;
    intervencion.id_plaga = pl.id; intervencion.tipo_plaga = pl.nombre;
    [...plagaGrid.children].forEach(c => c.classList.remove("selected"));
    btn.classList.add("selected");
    nextBtn.disabled = false;
    setTimeout(goNext, 180);
  };
  plagaGrid.appendChild(btn);
});

// ============================================================
// MIPyV — m-producto
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
// MIPyV — m-seguridad (recomendaciones según producto)
// ============================================================
function renderSeguridad() {
  const familias = FAMILIA_PRODUCTO[visita.id_producto] || ["general"];
  const wrap = document.getElementById("seguridadCards");
  wrap.innerHTML = familias.map(key => {
    const f = RECOMENDACIONES_SEGURIDAD[key];
    if (!f) return "";
    return `<div class="seg-card"><h4>${f.titulo}</h4><ul>${f.items.map(i => `<li>${i}</li>`).join("")}</ul></div>`;
  }).join("");
}

// ============================================================
// MIPyV — m-epp / SANEAMIENTO — s-epp (con cantidad, ambos comparten lógica)
// ============================================================
const eppGrid = document.getElementById("eppGrid");
const sEppGrid = document.getElementById("sEppGrid");

// arma una grilla de EPP con stepper de cantidad; "getLista"/"setLista" leen y
// escriben el arreglo [{nombre, cantidad}] correspondiente (visita o avance)
function construirEppGrid(container, getLista, setLista) {
  container.innerHTML = "";
  const listaActual = getLista();
  EPP.forEach(item => {
    const existente = listaActual.find(x => x.nombre === item.nombre);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tile epp-tile" + (existente ? " selected" : "");
    btn.innerHTML = `
      <div class="epp-check"></div>
      ${renderIcon(item.icono)}
      <div class="label">${item.nombre}</div>
      <div class="epp-qty">
        <button type="button" class="epp-menos">−</button>
        <span class="epp-cant">${existente ? existente.cantidad : 1}</span>
        <button type="button" class="epp-mas">+</button>
      </div>`;
    btn.addEventListener("click", (e) => {
      if (e.target.closest(".epp-qty")) return; // no togglear si tocó +/-
      btn.classList.toggle("selected");
      let lista = getLista();
      if (btn.classList.contains("selected")) {
        if (!lista.some(x => x.nombre === item.nombre)) lista = [...lista, { nombre: item.nombre, cantidad: 1 }];
      } else {
        lista = lista.filter(x => x.nombre !== item.nombre);
      }
      setLista(lista);
      nextBtn.disabled = !canAdvance(stepList[stepIndex]);
    });
    btn.querySelector(".epp-mas").addEventListener("click", (e) => {
      e.stopPropagation();
      cambiarCantidadEpp(item.nombre, 1, getLista, setLista, btn);
    });
    btn.querySelector(".epp-menos").addEventListener("click", (e) => {
      e.stopPropagation();
      cambiarCantidadEpp(item.nombre, -1, getLista, setLista, btn);
    });
    container.appendChild(btn);
  });
}

function cambiarCantidadEpp(nombre, delta, getLista, setLista, btn) {
  let lista = getLista();
  const idx = lista.findIndex(x => x.nombre === nombre);
  if (idx === -1) return;
  const nuevaCantidad = Math.max(1, lista[idx].cantidad + delta);
  lista = lista.map((x, i) => (i === idx ? { ...x, cantidad: nuevaCantidad } : x));
  setLista(lista);
  btn.querySelector(".epp-cant").textContent = nuevaCantidad;
}

function renderEppGrid() {
  construirEppGrid(eppGrid, () => visita.epp_utilizado, (lista) => { visita.epp_utilizado = lista; });
}
function renderSEppGrid() {
  construirEppGrid(sEppGrid, () => avance.epp_utilizado, (lista) => { avance.epp_utilizado = lista; });
}

// ============================================================
// MIPyV — m-resultado
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
// MIPyV — m-foto (hasta 5 fotos)
// ============================================================
const fotoGrid = document.getElementById("fotoGrid");
const photoInput = document.getElementById("photoInput");
function renderFotoGrid() {
  fotoGrid.innerHTML = "";
  fotosDataUrls.forEach((url, i) => {
    const box = document.createElement("div");
    box.className = "foto-slot filled";
    box.innerHTML = `<img src="${url}" alt="foto ${i + 1}"><button type="button" class="foto-remove" data-i="${i}">×</button>`;
    fotoGrid.appendChild(box);
  });
  if (fotosDataUrls.length < 5) {
    const addBox = document.createElement("button");
    addBox.type = "button";
    addBox.className = "foto-slot add";
    addBox.innerHTML = `<span>+</span><small>${fotosDataUrls.length}/5</small>`;
    addBox.onclick = () => photoInput.click();
    fotoGrid.appendChild(addBox);
  }
  fotoGrid.querySelectorAll(".foto-remove").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      fotosDataUrls.splice(Number(btn.dataset.i), 1);
      renderFotoGrid();
    };
  });
}
photoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    fotosDataUrls.push(ev.target.result);
    renderFotoGrid();
  };
  reader.readAsDataURL(file);
  photoInput.value = "";
});

// ============================================================
// MIPyV — m-obs (chips + notas de texto libre)
// ============================================================
const obsChips = document.getElementById("obsChips");
const notasOperador = document.getElementById("notasOperador");
let obsSeleccionadas = [];
OBSERVACIONES_CHIPS.forEach(txt => {
  const chip = document.createElement("button");
  chip.className = "chip";
  chip.textContent = txt;
  chip.onclick = () => {
    chip.classList.toggle("active");
    if (chip.classList.contains("active")) obsSeleccionadas.push(txt);
    else obsSeleccionadas = obsSeleccionadas.filter(x => x !== txt);
    actualizarObservaciones();
  };
  obsChips.appendChild(chip);
});
notasOperador.addEventListener("input", actualizarObservaciones);
function actualizarObservaciones() {
  const partes = [...obsSeleccionadas];
  if (notasOperador.value.trim()) partes.push(notasOperador.value.trim());
  visita.observaciones = partes.join(" · ");
}

// ============================================================
// MIPyV — m-confirm (resumen)
// ============================================================
function renderResumenMipyv() {
  guardarHorarios(visita);
  const rows = [
    ["Operario", visita.operario],
    ["Establecimiento", visita.establecimiento],
    ["Sector", visita.sector],
    ["Plaga", visita.tipo_plaga],
    ["Producto", visita.producto],
    ["Resultado", visita.resultado],
    ["Horario", (visita.hora_inicio || "—") + " a " + (visita.hora_fin || "—")],
  ];
  if (operarioAcompanante) rows.splice(1, 0, ["Trabajó junto con", operarioAcompanante]);
  if (visita.protocolo_existente) rows.splice(1, 0, ["Protocolo", visita.protocolo_existente + " (continuación)"]);
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
  stepList = ["quien", "acompanante", "s-tipo", "s-cap-nuevo", "s-tareas", "s-epp", "s-detalle", "horario", "s-cierre", "s-confirm", "s-sent"];
  stepIndex = stepList.indexOf("s-cap-nuevo");
  showStep("s-cap-nuevo");
});
document.getElementById("sContinuarBtn").addEventListener("click", () => {
  trabajo.esNuevo = false;
  stepList = ["quien", "acompanante", "s-tipo", "s-cap-continuar", "s-tareas", "s-epp", "s-detalle", "horario", "s-cierre", "s-confirm", "s-sent"];
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
// SANEAMIENTO — s-cap-continuar
// ============================================================
const TRABAJOS_KEY = "mipyv_trabajos_abiertos_v1";
function getTrabajosAbiertos() { return JSON.parse(localStorage.getItem(TRABAJOS_KEY) || "[]"); }
function setTrabajosAbiertos(list) { localStorage.setItem(TRABAJOS_KEY, JSON.stringify(list)); }

function renderTrabajosAbiertos() {
  pintarTrabajosAbiertos(); // muestra lo que ya hay en el celular, sin esperar
  fetchTrabajosAbiertosRemotos().finally(pintarTrabajosAbiertos);
}

function pintarTrabajosAbiertos() {
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
}

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
// SANEAMIENTO — s-producto / s-seguridad / s-dosis (biocida, opcional)
// ============================================================
const sProductoGrid = document.getElementById("sProductoGrid");
PRODUCTOS.forEach(pr => {
  const btn = document.createElement("button");
  btn.className = "tile";
  btn.innerHTML = `${renderIcon(pr.icono, null, pr.color)}<div class="label">${pr.nombre}</div>`;
  btn.onclick = () => {
    avance.id_producto_biocida = pr.id; avance.producto_biocida = pr.nombre;
    [...sProductoGrid.children].forEach(c => c.classList.remove("selected"));
    btn.classList.add("selected");
    applyDosisFrecuenciaSaneamiento();
    nextBtn.disabled = false;
    setTimeout(goNext, 180);
  };
  sProductoGrid.appendChild(btn);
});

function applyDosisFrecuenciaSaneamiento() {
  // usa la misma tabla de dosis, buscando cualquier plaga que use este producto
  const combo = Object.keys(DOSIS_FRECUENCIA).find(k => k.endsWith("|" + avance.id_producto_biocida));
  const d = combo ? DOSIS_FRECUENCIA[combo] : DOSIS_DEFAULT;
  avance.dosis_biocida = d.dosis;
  avance.frecuencia_biocida = d.frecuencia;
  avance.puntos_criticos_biocida = d.puntos;
  document.getElementById("sDosisTxt").textContent = d.dosis;
  document.getElementById("sFrecTxt").textContent = d.frecuencia;
}

function renderSSeguridad() {
  const familias = FAMILIA_PRODUCTO[avance.id_producto_biocida] || ["general"];
  const wrap = document.getElementById("sSeguridadCards");
  wrap.innerHTML = familias.map(key => {
    const f = RECOMENDACIONES_SEGURIDAD[key];
    if (!f) return "";
    return `<div class="seg-card"><h4>${f.titulo}</h4><ul>${f.items.map(i => `<li>${i}</li>`).join("")}</ul></div>`;
  }).join("");
}

// ============================================================
// SANEAMIENTO — s-tareas
// ============================================================
const tareasGrid = document.getElementById("tareasGrid");
const NOMBRE_TAREA_INSECTICIDA = "Saneamiento con insecticida doméstico";
TAREAS_SANEAMIENTO.forEach(t => {
  const btn = document.createElement("button");
  btn.className = "tile multi";
  btn.innerHTML = `<div class="epp-check"></div>${renderIcon(t.icono)}<div class="label">${t.nombre}</div>`;
  btn.onclick = () => {
    btn.classList.toggle("selected");
    if (btn.classList.contains("selected")) avance.tareas.push(t.nombre);
    else avance.tareas = avance.tareas.filter(x => x !== t.nombre);
    actualizarPasosBiocidaSaneamiento();
    nextBtn.disabled = !canAdvance("s-tareas");
  };
  tareasGrid.appendChild(btn);
});

// Inserta o saca los pasos de producto/seguridad/dosis del biocida, según
// si se marcó la tarea de insecticida. Se llama cada vez que cambian las tareas.
function actualizarPasosBiocidaSaneamiento() {
  const pasosBiocida = ["s-producto", "s-seguridad", "s-dosis"];
  const yaEstan = pasosBiocida.every(p => stepList.includes(p));
  const necesitaBiocida = avance.tareas.includes(NOMBRE_TAREA_INSECTICIDA);
  const idxEpp = stepList.indexOf("s-epp");
  if (necesitaBiocida && !yaEstan) {
    stepList.splice(idxEpp, 0, ...pasosBiocida);
  } else if (!necesitaBiocida && yaEstan) {
    stepList = stepList.filter(p => !pasosBiocida.includes(p));
  }
}

// ============================================================
// SANEAMIENTO — s-detalle (chips + foto)
// ============================================================
const detalleChips = document.getElementById("detalleChips");
const detalleExtra = document.getElementById("detalleExtra");
let detalleSeleccionados = [];
DETALLE_CHIPS_SANEAMIENTO.forEach(txt => {
  const chip = document.createElement("button");
  chip.className = "chip";
  chip.textContent = CHIPS_CON_DETALLE[txt] ? txt + " ❓" : txt;
  chip.onclick = () => {
    chip.classList.toggle("active");
    if (chip.classList.contains("active")) detalleSeleccionados.push(txt);
    else {
      detalleSeleccionados = detalleSeleccionados.filter(x => x !== txt);
      delete detalleExtraTextos[txt];
    }
    actualizarDetalleTexto();
    renderDetalleExtra();
    nextBtn.disabled = !canAdvance("s-detalle");
  };
  detalleChips.appendChild(chip);
});

function renderDetalleExtra() {
  detalleExtra.innerHTML = "";
  detalleSeleccionados.filter(txt => CHIPS_CON_DETALLE[txt]).forEach(txt => {
    const box = document.createElement("div");
    box.className = "detalle-extra-box";
    box.innerHTML = `
      <div class="lbl-extra">${CHIPS_CON_DETALLE[txt]}</div>
      <textarea placeholder="Escribí acá...">${detalleExtraTextos[txt] || ""}</textarea>`;
    box.querySelector("textarea").addEventListener("input", (e) => {
      detalleExtraTextos[txt] = e.target.value;
      actualizarDetalleTexto();
      nextBtn.disabled = !canAdvance("s-detalle");
    });
    detalleExtra.appendChild(box);
  });
}

function actualizarDetalleTexto() {
  const partes = detalleSeleccionados.map(txt => {
    const extra = detalleExtraTextos[txt];
    return extra ? `${txt}: ${extra}` : txt;
  });
  avance.detalle = partes.join(" · ");
}

const sPhotoInput = document.getElementById("sPhotoInput");
const sFotoGrid = document.getElementById("sFotoGrid");
function renderSFotoGrid() {
  sFotoGrid.innerHTML = "";
  sFotosDataUrls.forEach((url, i) => {
    const box = document.createElement("div");
    box.className = "foto-slot filled";
    box.innerHTML = `<img src="${url}" alt="foto ${i + 1}"><button type="button" class="foto-remove" data-i="${i}">×</button>`;
    sFotoGrid.appendChild(box);
  });
  if (sFotosDataUrls.length < 5) {
    const addBox = document.createElement("button");
    addBox.type = "button";
    addBox.className = "foto-slot add";
    addBox.innerHTML = `<span>+</span><small>${sFotosDataUrls.length}/5</small>`;
    addBox.onclick = () => sPhotoInput.click();
    sFotoGrid.appendChild(addBox);
  }
  sFotoGrid.querySelectorAll(".foto-remove").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      sFotosDataUrls.splice(Number(btn.dataset.i), 1);
      renderSFotoGrid();
    };
  });
}
sPhotoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    sFotosDataUrls.push(ev.target.result);
    renderSFotoGrid();
  };
  reader.readAsDataURL(file);
  sPhotoInput.value = "";
});

const notasSaneamiento = document.getElementById("notasSaneamiento");
notasSaneamiento.addEventListener("input", () => {
  avance.notas = notasSaneamiento.value.trim();
});

// ============================================================
// SANEAMIENTO — s-cierre
// ============================================================
document.querySelectorAll('[data-cierre]').forEach(btn => {
  btn.onclick = () => {
    avance.cierre = btn.dataset.cierre;
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
  guardarHorarios(avance);
  const rows = [
    ["Operario", currentOperario ? currentOperario.nombre : "—"],
    ["CAP", trabajo.establecimiento],
    ["Tareas de hoy", avance.tareas.join(", ") || "—"],
    ["Horario", (avance.hora_inicio || "—") + " a " + (avance.hora_fin || "—")],
    ["Cierre", avance.cierre === "terminado" ? "Trabajo terminado" : "Continúa otro día"],
  ];
  if (operarioAcompanante) rows.splice(1, 0, ["Trabajó junto con", operarioAcompanante]);
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
  guardarHorarios(visita);
  const eppTexto = visita.epp_utilizado.map(x => `${x.nombre} x${x.cantidad}`).join(", ");
  const record = { ...visita, epp_utilizado: eppTexto, fotos_base64: fotosDataUrls, operario_acompanante: operarioAcompanante };
  const q = getQueue();
  q.push({ tipo: "visita", data: record });
  setQueue(q);

  // actualizar cache local de intervenciones abiertas
  let abiertas = getIntervencionesAbiertas();
  if (visita.resultado === "Resuelto" || visita.resultado === "No se pudo acceder al sector") {
    if (visita.protocolo_existente) {
      abiertas = abiertas.filter(iv => iv.protocolo !== visita.protocolo_existente);
    }
  } else if (visita.resultado === "Requiere otra visita") {
    const protocoloClave = visita.protocolo_existente || "PENDIENTE-" + visita.id_visita;
    const existente = abiertas.findIndex(iv => iv.protocolo === protocoloClave);
    const registro = {
      protocolo: protocoloClave,
      id_establecimiento: visita.id_establecimiento,
      establecimiento: visita.establecimiento,
      tipo_establecimiento: visita.tipo_establecimiento,
      id_plaga: visita.id_plaga,
      tipo_plaga: visita.tipo_plaga,
      sector: visita.sector,
    };
    if (existente >= 0) abiertas[existente] = registro; else abiertas.push(registro);
  }
  setIntervencionesAbiertas(abiertas);

  document.getElementById("sentSub").textContent = navigator.onLine
    ? "Visita registrada — sincronizando…"
    : "Visita guardada en el celular — se enviará cuando haya señal";
  stepIndex = stepList.length - 1;
  showStep("m-sent");
  trySync();
}

document.getElementById("newVisitBtn").addEventListener("click", () => {
  resetVisita();
  renderFotoGrid();
  obsSeleccionadas = [];
  notasOperador.value = "";
  horaInicioEl.value = ""; horaFinEl.value = "";
  horaInicioAcompEl.value = ""; horaFinAcompEl.value = "";
  [...obsChips.children].forEach(c => c.classList.remove("active"));
  [...establecimientoGrid.children].forEach(c => c.classList.remove("selected"));
  document.querySelectorAll('[data-resultado]').forEach(b => b.style.outline = "none");
  enterModule("mipyv");
});

// ============================================================
// COLA OFFLINE + ENVÍO — SANEAMIENTO
// ============================================================
function sendAvance() {
  guardarHorarios(avance);
  const eppTexto = avance.epp_utilizado.map(x => `${x.nombre} x${x.cantidad}`).join(", ");
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
    notas: avance.notas || "",
    epp_utilizado: eppTexto,
    producto_biocida: avance.producto_biocida || "",
    dosis_biocida: avance.dosis_biocida || "",
    frecuencia_biocida: avance.frecuencia_biocida || "",
    fotos_base64: sFotosDataUrls,
    cierre: avance.cierre,
    operario_acompanante: operarioAcompanante,
    hora_inicio: avance.hora_inicio,
    hora_fin: avance.hora_fin,
    hora_inicio_acompanante: avance.hora_inicio_acompanante,
    hora_fin_acompanante: avance.hora_fin_acompanante,
  };

  const q = getQueue();
  if (trabajo.esNuevo) {
    q.push({ tipo: "trabajo_nuevo", data: { ...trabajo, operario_inicio: currentOperario.nombre } });
  }
  q.push({ tipo: "avance", data: record });

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
  renderSFotoGrid();
  notasSaneamiento.value = "";
  horaInicioEl.value = ""; horaFinEl.value = "";
  horaInicioAcompEl.value = ""; horaFinAcompEl.value = "";
  detalleSeleccionados = [];
  detalleExtra.innerHTML = "";
  [...detalleChips.children].forEach(c => c.classList.remove("active"));
  document.querySelectorAll(".tile.multi").forEach(c => c.classList.remove("selected"));
  [...sProductoGrid.children].forEach(c => c.classList.remove("selected"));
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
  badge.textContent = msg;
  badge.classList.add("show");
  setTimeout(() => { updateQueueBadge(); }, 2500);
}

document.getElementById("syncBtn").addEventListener("click", trySync);
window.addEventListener("online", () => { setNetDot(true); trySync(); });
window.addEventListener("offline", () => setNetDot(false));

function setNetDot(online) {
  document.getElementById("netDot").classList.toggle("offline", !online);
}

// ============================================================
// AYUDA — botón "?" con explicación simple de la pantalla actual
// ============================================================
function showHelp() {
  const pasoActual = currentModule ? stepList[stepIndex] : "home";
  const texto = AYUDA_TEXTOS[pasoActual] || "Tocá las imágenes grandes para avanzar. Si tenés dudas, preguntale a Belén.";
  document.getElementById("helpText").textContent = texto;
  document.getElementById("helpOverlay").classList.add("show");
}
function hideHelp() {
  document.getElementById("helpOverlay").classList.remove("show");
}
document.getElementById("helpBtn").addEventListener("click", showHelp);
document.getElementById("helpCloseBtn").addEventListener("click", hideHelp);
document.getElementById("helpOverlay").addEventListener("click", (e) => {
  if (e.target.id === "helpOverlay") hideHelp();
});

// ============================================================
// INIT
// ============================================================
document.getElementById("iconBug").innerHTML = renderIcon("bug");
document.getElementById("iconBroom").innerHTML = renderIcon("broom");
document.getElementById("iconNuevo").innerHTML = renderIcon("calendar_new");
document.getElementById("iconContinuar").innerHTML = renderIcon("calendar_continue");
document.getElementById("iconNuevaMipyv").innerHTML = renderIcon("calendar_new");
document.getElementById("iconContinuarMipyv").innerHTML = renderIcon("calendar_continue");

setNetDot(navigator.onLine);
updateQueueBadge();
progressWrap.style.display = "none";
bottomBar.style.display = "none";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
