// ============================================================
// CONFIGURACIÓN — pegar acá la URL de implementación del Apps Script
// (ver GUIA_DESPLIEGUE.md paso 3)
// ============================================================
const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbzLLhU4Zgb7EsqmkBTfHc_oLxd6rJRNzfy33IRmRbrHuvJo9FD7EWqaaahROhr_Jucwrg/exec",
};

// ============================================================
// CATÁLOGOS — copia local para que la app funcione sin conexión.
// Se pueden refrescar desde la planilla con el botón "Sincronizar".
// ============================================================

const OPERARIOS = [
  { id: "javier", nombre: "Javier Tramaleo", inicial: "J" },
  { id: "paulo", nombre: "Paulo Tramaleo", inicial: "P" },
];

const ESTABLECIMIENTOS = [
  { id: "HZT", nombre: "Hospital Zonal Trelew", tipo: "Hospital" },
  { id: "ADOL", nombre: "Adolescencia", tipo: "Dependencia" },
  { id: "CTUT", nombre: "Casa Tutelada", tipo: "Dependencia" },
  { id: "CDIA", nombre: "Centro de Día", tipo: "Dependencia" },
  { id: "CIT", nombre: "CIT", tipo: "Dependencia" },
  { id: "HCAM", nombre: "Hilando Caminos", tipo: "Dependencia" },
  { id: "ISM", nombre: "Internación de Salud Mental", tipo: "Dependencia" },
  { id: "PANAI", nombre: "Pichi Anai", tipo: "Dependencia" },
  { id: "PROS", nombre: "PROSATE", tipo: "Dependencia" },
  { id: "UGD", nombre: "UGD - Ex APT", tipo: "Dependencia" },
  { id: "VAC", nombre: "Vacunatorio Central", tipo: "Dependencia" },
  { id: "EXADOS", nombre: "Ex Ados", tipo: "Dependencia" },
  { id: "CAP-AMA", nombre: "CAPS Amaya", tipo: "CAP" },
  { id: "CAP-CON", nombre: "CAPS Constitución", tipo: "CAP" },
  { id: "CAP-COR", nombre: "CAPS Corradi", tipo: "CAP" },
  { id: "CAP-DBO", nombre: "CAPS Don Bosco", tipo: "CAP" },
  { id: "CAP-ETC", nombre: "CAPS Etchepare", tipo: "CAP" },
  { id: "CAP-LLO", nombre: "CAPS La Loma", tipo: "CAP" },
  { id: "CAP-PGA", nombre: "CAPS Planta de Gas", tipo: "CAP" },
  { id: "CAP-SMA", nombre: "CAPS San Martín", tipo: "CAP" },
  { id: "CAP-SAR", nombre: "CAPS Sarmiento", tipo: "CAP" },
  { id: "CAP-TFE", nombre: "CAPS Tiro Federal", tipo: "CAP" },
  { id: "CAP-VIT", nombre: "CAPS Villa Italia", tipo: "CAP" },
];

// Sectores completos (HZT) — el resto de dependencias usa el subconjunto reducido
const SECTORES_HZT = [
  "Administración","Admisión","Anatomía Patológica","Bacteriología","Camilleros","Cardiología",
  "Central de Esterilización","Centro Obstétrico / Maternidad","Centro Quirúrgico","Cirugía",
  "Clínica Médica","Clínica Quirúrgica","Cocina","Consultorios Externos","Cuidados Progresivos",
  "Depósito","Diagnóstico por Imágenes","Dirección","Ecografía","Estadística","Farmacia",
  "Hemoterapia","Higiene y Seguridad","Informática / Sistemas","Internación Pediátrica",
  "Kinesiología / Rehabilitación","Laboratorio","Lactario","Lavadero y Ropería",
  "Maestranza / Servicios Generales","Mamografía","Mantenimiento","Mesa de Entradas","Morgue",
  "Mucamas / Servicios Generales","Nefrología","Neonatología / UCIN","Nutrición y Dietoterapia",
  "Oncología","Pediatría","Personal / RRHH","Portería","Psicología","Psiquiatría",
  "Salud Mental","Seguridad / Vigilancia","Terapia Intensiva / UTI Adultos","Trabajo Social",
  "Traumatología","UCIP","UMU / Guardia / Emergencias","Otro",
];

const SECTORES_DEPENDENCIAS = [
  "Administración","Admisión","Consultorios Externos","Depósito","Farmacia","Cocina",
  "Salud Mental","Trabajo Social","Psicología","Portería","Seguridad / Vigilancia",
  "Mantenimiento","Mucamas / Servicios Generales","Otro",
];

const PLAGAS = [
  { id: "PLA-01", nombre: "Araña de rincón", icono: "spider" },
  { id: "PLA-02", nombre: "Viuda negra", icono: "spider" },
  { id: "PLA-03", nombre: "Cucarachas", icono: "roach" },
  { id: "PLA-04", nombre: "Roedores", icono: "rodent" },
  { id: "PLA-05", nombre: "Moscas", icono: "fly" },
  { id: "PLA-06", nombre: "Mosquitos", icono: "mosquito" },
  { id: "PLA-07", nombre: "Palomas", icono: "pigeon" },
  { id: "PLA-08", nombre: "Piojillo de paloma", icono: "mite" },
  { id: "PLA-09", nombre: "Chinche de cama", icono: "bedbug" },
  { id: "PLA-10", nombre: "Murciélagos", icono: "bat" },
  { id: "PLA-11", nombre: "Tijeretas", icono: "earwig" },
  { id: "PLA-12", nombre: "Hormigas", icono: "ant" },
];

const PRODUCTOS = [
  { id: "PRD-01", nombre: "Panic", color: "#7A4A9E", icono: "bottle" },
  { id: "PRD-02", nombre: "Sipertrin", color: "#2E7D9E", icono: "spray" },
  { id: "PRD-03", nombre: "Keeptrin", color: "#3E8E5B", icono: "spray" },
  { id: "PRD-04", nombre: "Tacazo", color: "#C0453A", icono: "bottle" },
  { id: "PRD-05", nombre: "Glacoxan H", color: "#E3A426", icono: "powder" },
  { id: "PRD-06", nombre: "Biorat pellet", color: "#5A5A5A", icono: "pellet" },
  { id: "PRD-07", nombre: "Ultra Plus", color: "#0D313F", icono: "bottle" },
  { id: "PRD-08", nombre: "Huagro Rat", color: "#8A5A2E", icono: "pellet" },
];

// Catálogo técnico dosis/frecuencia por combinación plaga+producto (editable solo por HyS)
const DOSIS_FRECUENCIA = {
  "PLA-04|PRD-01": { dosis: "1 bloque por cebadera", frecuencia: "Cada 15 días", puntos: "Bajo mesada, esquinas, zócalos, exteriores" },
  "PLA-12|PRD-05": { dosis: "Aplicación puntual en trayectorias/nidos", frecuencia: "Reaplicar si persiste actividad", puntos: "Zócalos, marcos de puertas y ventanas" },
  "PLA-03|PRD-04": { dosis: "Según indicación de etiqueta", frecuencia: "Mensual / según monitoreo", puntos: "Bajo mesadas, cañerías, depósitos" },
};
const DOSIS_DEFAULT = { dosis: "Consultar a HyS — combinación sin definir", frecuencia: "Consultar a HyS", puntos: "—" };

const EPP = [
  { id: "guantes", nombre: "Guantes", icono: "gloves" },
  { id: "barbijo", nombre: "Barbijo / respirador", icono: "mask" },
  { id: "anteojos", nombre: "Anteojos", icono: "goggles" },
  { id: "botas", nombre: "Botas", icono: "boots" },
];

const OBSERVACIONES_CHIPS = [
  "Sin novedad",
  "Mucho tránsito de personal",
  "Puntos de acceso nuevos",
  "Requiere seguimiento",
  "Falta de limpieza en el sector",
];

// ============================================================
// MÓDULO: LIMPIEZA Y SANEAMIENTO (PROP-HYS-045 — Área Externa HZT)
// ============================================================

// Solo los 11 CAPs del Área Externa (alcance de la propuesta)
const CAPS_SANEAMIENTO = ESTABLECIMIENTOS.filter(e => e.tipo === "CAP");

const TAREAS_SANEAMIENTO = [
  { id: "predios", nombre: "Limpieza de predios", icono: "yard" },
  { id: "insecticida", nombre: "Saneamiento con insecticida doméstico", icono: "spray" },
  { id: "canerias", nombre: "Desobstrucción de cañerías", icono: "pipe" },
  { id: "tanques", nombre: "Limpieza de tanques de agua", icono: "tank" },
  { id: "roedores", nombre: "Control de roedores / sellado", icono: "rodent" },
  { id: "pluviales", nombre: "Desagües pluviales", icono: "drain" },
];

const DETALLE_CHIPS_SANEAMIENTO = [
  "Sin novedad",
  "Se retiraron residuos/escombros",
  "Agua estancada eliminada",
  "Obstrucción resuelta",
  "Requiere mantenimiento (reportado)",
  "Tanque limpio y desinfectado",
  "Cebaderos revisados",
  "Queda pendiente para otro día",
];

