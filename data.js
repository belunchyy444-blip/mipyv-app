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
  { id: "PRD-06", nombre: "K-Othrina o similar", color: "#4A7A9E", icono: "spray" },
  { id: "PRD-07", nombre: "Huagro Chipre o similar", color: "#5A9E7A", icono: "spray" },
  { id: "PRD-08", nombre: "Aquiles o similar", color: "#8A6F52", icono: "pellet" },
  { id: "PRD-09", nombre: "Geltex / Gel hormiguicida", color: "#8A5A2E", icono: "pellet" },
  { id: "PRD-10", nombre: "Chemoxane F / FumiXan Pro", color: "#6E4A8A", icono: "spray" },
  { id: "PRD-11", nombre: "Ultra Plus / Biorat pellet", color: "#0D313F", icono: "pellet" },
  { id: "PRD-12", nombre: "Huagro Rat o similar", color: "#5A5A5A", icono: "pellet" },
  { id: "PRD-13", nombre: "Exclusión física", color: "#2E9E5B", icono: "shield" },
];

// Catálogo técnico dosis/frecuencia por combinación plaga+producto (editable solo por HyS)
// Corregido con los datos reales del POE 2023 (ver Correccion_Catalogos.gs)
const DOSIS_FRECUENCIA = {
  "PLA-01|PRD-02": { dosis: "100-150 ml cada 5 L de agua", frecuencia: "Según necesidad", puntos: "Rincones, grietas, detrás de mobiliario" },
  "PLA-01|PRD-06": { dosis: "100-150 ml cada 5 L de agua", frecuencia: "Según necesidad", puntos: "Rincones, grietas, detrás de mobiliario" },
  "PLA-01|PRD-07": { dosis: "20 ml cada 5 L de agua", frecuencia: "Según necesidad", puntos: "Rincones, grietas, detrás de mobiliario" },
  "PLA-02|PRD-02": { dosis: "100-150 ml cada 5 L de agua", frecuencia: "Según necesidad", puntos: "Depósitos, exteriores, cañerías, rincones oscuros y secos" },
  "PLA-02|PRD-06": { dosis: "100-150 ml cada 5 L de agua", frecuencia: "Según necesidad", puntos: "Depósitos, exteriores, cañerías, rincones oscuros y secos" },
  "PLA-02|PRD-07": { dosis: "20 ml cada 5 L de agua", frecuencia: "Según necesidad", puntos: "Depósitos, exteriores, cañerías, rincones oscuros y secos" },
  "PLA-03|PRD-08": { dosis: "Aplicación puntual en grietas, zócalos, bajo mesadas y sitios estratégicos", frecuencia: "Según necesidad", puntos: "Cocinas, zócalos, desagües, bajo mesadas, motores, grietas" },
  "PLA-04|PRD-01": { dosis: "Colocación en cebaderas y trampas rodenticidas", frecuencia: "Cada 10 días", puntos: "Depósitos, residuos, cañerías, perímetro, accesos" },
  "PLA-04|PRD-11": { dosis: "Colocación en cebaderas y trampas rodenticidas", frecuencia: "Cada 10 días", puntos: "Depósitos, residuos, cañerías, perímetro, accesos" },
  "PLA-04|PRD-12": { dosis: "Colocación en cebaderas y trampas rodenticidas", frecuencia: "Cada 10 días", puntos: "Depósitos, residuos, cañerías, perímetro, accesos" },
  "PLA-05|PRD-02": { dosis: "75-100 ml cada 5 L de agua", frecuencia: "Según necesidad", puntos: "Residuos, patios, cocina, aberturas, lavaderos" },
  "PLA-05|PRD-06": { dosis: "75-100 ml cada 5 L de agua", frecuencia: "Según necesidad", puntos: "Residuos, patios, cocina, aberturas, lavaderos" },
  "PLA-05|PRD-07": { dosis: "10 ml cada 5 L de agua", frecuencia: "Según necesidad", puntos: "Residuos, patios, cocina, aberturas, lavaderos" },
  "PLA-06|PRD-02": { dosis: "75-100 ml cada 5 L de agua", frecuencia: "Según necesidad", puntos: "Patios, desagües, recipientes, áreas húmedas" },
  "PLA-06|PRD-06": { dosis: "75-100 ml cada 5 L de agua", frecuencia: "Según necesidad", puntos: "Patios, desagües, recipientes, áreas húmedas" },
  "PLA-06|PRD-07": { dosis: "10 ml cada 5 L de agua", frecuencia: "Según necesidad", puntos: "Patios, desagües, recipientes, áreas húmedas" },
  "PLA-07|PRD-13": { dosis: "Sellado de ingresos, barreras físicas y saneamiento", frecuencia: "Según necesidad", puntos: "Aleros, techos, cornisas, patios de aire" },
  "PLA-08|PRD-02": { dosis: "100-150 ml cada 5 L de agua", frecuencia: "Según necesidad", puntos: "Nidos, techos, cornisas, áreas próximas a palomares" },
  "PLA-08|PRD-06": { dosis: "100-150 ml cada 5 L de agua", frecuencia: "Según necesidad", puntos: "Nidos, techos, cornisas, áreas próximas a palomares" },
  "PLA-08|PRD-07": { dosis: "20 ml cada 5 L de agua", frecuencia: "Según necesidad", puntos: "Nidos, techos, cornisas, áreas próximas a palomares" },
  "PLA-09|PRD-10": { dosis: "25 ml por litro de agua", frecuencia: "Cada 10 días", puntos: "Camas, colchones, grietas, textiles, áreas de descanso" },
  "PLA-10|PRD-13": { dosis: "Sellado de ingresos y derivación a autoridad competente", frecuencia: "Según necesidad", puntos: "Entretechos, aleros, cámaras técnicas, cielorrasos" },
  "PLA-11|PRD-02": { dosis: "100-150 ml cada 5 L de agua", frecuencia: "Según necesidad", puntos: "Patios, bordes, grietas, sectores húmedos" },
  "PLA-11|PRD-06": { dosis: "100-150 ml cada 5 L de agua", frecuencia: "Según necesidad", puntos: "Patios, bordes, grietas, sectores húmedos" },
  "PLA-11|PRD-07": { dosis: "20 ml cada 5 L de agua", frecuencia: "Según necesidad", puntos: "Patios, bordes, grietas, sectores húmedos" },
  "PLA-12|PRD-05": { dosis: "Aplicación puntual en trayectorias, grietas y puntos de ingreso", frecuencia: "Cada 10 días", puntos: "Cocinas, grietas, zócalos, marcos de puertas y puntos de ingreso" },
  "PLA-12|PRD-09": { dosis: "Aplicación puntual en trayectorias, grietas y puntos de ingreso", frecuencia: "Cada 10 días", puntos: "Cocinas, grietas, zócalos, marcos de puertas y puntos de ingreso" },
};
const DOSIS_DEFAULT = { dosis: "Consultar a HyS — combinación sin definir", frecuencia: "Consultar a HyS", puntos: "—" };

// Recomendaciones de seguridad por familia de producto — se muestran al operario
// después de elegir el producto, antes de ver la dosis. Basadas en HDS + historial real.
const RECOMENDACIONES_SEGURIDAD = {
  piretroide: {
    titulo: "Piretroides (voladores/rastreros)",
    items: [
      "Ventilar el ambiente 30-60 min antes de que vuelva a entrar alguien",
      "No aplicar con pacientes, personal o alimentos expuestos en el sector",
      "Usar guantes, barbijo y anteojos durante toda la aplicación",
      "No aplicar cerca de desagües hacia el exterior",
    ],
  },
  gel: {
    titulo: "Cebos en gel (hormigas, cucarachas)",
    items: [
      "No aplicar cerca de alimentos ni utensilios de cocina",
      "Aplicar preferentemente al finalizar las tareas de cocina",
      "Revisar si hay reinfestación a las 72 horas",
      "Mantener fuera del alcance de niños y mascotas",
    ],
  },
  rodenticida: {
    titulo: "Rodenticidas (roedores)",
    items: [
      "No tocar los cebos sin guantes",
      "Señalizar bien los puntos donde se colocó cebo",
      "No dejar cebo cerca de alimentos ni al alcance de mascotas",
      "Ante ingestión accidental: CIATOX 0800-333-0160",
    ],
  },
  fumigeno: {
    titulo: "Fumígeno (chinches de cama)",
    items: [
      "Orden de inspección: baño → cocina → comedor → dormitorio",
      "No sacudir textiles: embolsar en el lugar y cerrar",
      "Ambiente cerrado, puertas internas abiertas, activar y retirarse de inmediato",
      "Ventilar 6-8 horas mínimo antes de limpiar o reingresar",
      "Revisar de nuevo a las 24-72 horas: si persiste, avisar a HyS",
    ],
  },
  fisico: {
    titulo: "Control físico (sin biocida)",
    items: [
      "No se aplican venenos ni biocidas en esta intervención",
      "Usar guantes, protección respiratoria, calzado de seguridad y mameluco",
      "Retirar nidos o excretas con precaución, evitando dispersión",
    ],
  },
  general: {
    titulo: "Cuidados generales",
    items: [
      "No comer, beber ni fumar durante la aplicación",
      "Lavarse las manos bien después de manipular el producto",
      "Guardar el envase cerrado, en lugar fresco y seco",
      "Ante síntomas de intoxicación: CIATOX 0800-333-0160",
    ],
  },
};

// Mapea cada producto a su(s) familia(s) de recomendaciones de seguridad
const FAMILIA_PRODUCTO = {
  "PRD-01": ["rodenticida", "general"],
  "PRD-02": ["piretroide", "general"],
  "PRD-03": ["piretroide", "general"],
  "PRD-04": ["piretroide", "general"],
  "PRD-05": ["gel", "general"],
  "PRD-06": ["piretroide", "general"],
  "PRD-07": ["piretroide", "general"],
  "PRD-08": ["gel", "general"],
  "PRD-09": ["gel", "general"],
  "PRD-10": ["fumigeno", "general"],
  "PRD-11": ["rodenticida", "general"],
  "PRD-12": ["rodenticida", "general"],
  "PRD-13": ["fisico"],
};

const EPP = [
  { id: "guantes", nombre: "Guantes", icono: "gloves" },
  { id: "barbijo", nombre: "Barbijo / respirador", icono: "mask" },
  { id: "anteojos", nombre: "Anteojos", icono: "goggles" },
  { id: "botas", nombre: "Botas", icono: "boots" },
  { id: "mameluco", nombre: "Mameluco", icono: "coverall" },
  { id: "cofia", nombre: "Cofia", icono: "cap_epp" },
  { id: "cubrezapatos", nombre: "Cubrezapatos", icono: "shoe_covers" },
];

const OBSERVACIONES_CHIPS = [
  "Sin novedad",
  "Mucho tránsito de personal",
  "Personal o pacientes presentes durante la intervención",
  "Zona de difícil acceso",
  "Alimentos expuestos",
  "Agua estancada / humedad",
  "Residuos sin disposición correcta",
  "Puntos de acceso nuevos (grietas/aberturas)",
  "Requiere seguimiento",
  "Falta de limpieza en el sector",
  "Se recomienda sellado de aberturas",
  "Reinfestación detectada",
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
  "Se retiraron residuos / escombros",
  "Agua estancada eliminada",
  "Obstrucción resuelta",
  "Tanque limpio y desinfectado",
  "Poda realizada",
  "Sellado de aberturas realizado",
  "Requiere mantenimiento (reportado)",
  "Cebaderos revisados",
  "Se relevaron nuevos puntos críticos",
  "Acceso restringido durante la tarea",
  "Queda pendiente para otro día",
];
