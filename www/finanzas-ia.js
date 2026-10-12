/**
 * finanzas-ia.js - Motor de Asistente e Inteligencia Artificial Financiera de la Mascota
 * Versión 3.0 Ultra Inteligente:
 * - Comprensión de lenguaje natural avanzado (NLP local robusto con tokenización y semántica)
 * - Registro múltiple / por lotes ("gasté 15 en taxi y 25 en supermercado")
 * - Detección de fechas relativas ("ayer", "hace 2 días", "el 5 de este mes")
 * - Diagnóstico financiero completo: Regla 50/30/20, Tasa de Ahorro, Runway/Fondo de Emergencia
 * - Presupuesto diario disponible para llegar a fin de mes ("¿cuánto puedo gastar al día?")
 * - Auditoría de fugas de dinero y gastos hormiga ("¿en qué he gastado más?", "¿dónde recortar?")
 * - Proyecciones y simulaciones de metas ("¿en cuánto tiempo alcanzo mi meta?")
 * - Asesoramiento financiero conversacional (inversión, deudas, tips de ahorro)
 * - Gestión completa de inventario, stock y cálculo de márgenes
 */
(() => {
  "use strict";

  // Diccionario semántico enriquecido para categorías
  const CATEGORIA_KEYWORDS = {
    comida: [
      "comida", "super", "supermercado", "almuerzo", "cena", "desayuno", "restaurante",
      "cafe", "café", "pizza", "mercado", "hamburguesa", "panadería", "panaderia",
      "bodega", "snack", "dulces", "delivery", "pedidosya", "rappi", "ubereats", "groceries"
    ],
    transporte: [
      "transporte", "gasolina", "gas", "combustible", "uber", "taxi", "didi", "cabify",
      "metro", "bus", "pasaje", "estacionamiento", "parqueo", "peaje", "taller", "mantenimiento"
    ],
    vivienda: [
      "vivienda", "alquiler", "renta", "luz", "agua", "internet", "wifi", "electricidad",
      "condominio", "gas doméstico", "servicio", "servicios", "mantenimiento hogar"
    ],
    salud: [
      "salud", "medico", "médico", "medicina", "farmacia", "dentista", "odontólogo",
      "consulta", "pastillas", "remedio", "terapia", "psicólogo", "seguro médico", "clínica"
    ],
    ocio: [
      "ocio", "cine", "salida", "juegos", "videojuegos", "fiesta", "bar", "cerveza", "tragos",
      "viaje", "paseo", "vacaciones", "diversion", "diversión", "steam", "playstation", "netflix",
      "spotify", "disney", "suscripcion", "suscripción", "hobby", "concierto"
    ],
    educacion: [
      "educacion", "educación", "curso", "libro", "universidad", "colegio", "taller", "udemy",
      "certificación", "clases", "material escolar"
    ],
    ropa: [
      "ropa", "calzado", "zapatos", "vestido", "camisa", "pantalón", "pantalon", "zapatillas",
      "moda", "tienda de ropa"
    ],
    ingreso: [
      "sueldo", "salario", "nómina", "nomina", "honorarios", "freelance", "depósito", "deposito",
      "comisión", "comision", "bono", "extra", "quincena", "pago", "cobro", "dividendo", "intereses"
    ]
  };

  // Nombres de mascotas amigables
  const MASCOTAS_NOMBRES = {
    mapache: "Mapache",
    gatito: "Gatito",
    "gatito-negro": "Gatito Negro",
    perrito: "Perrito",
    pollito: "Pollito",
    jirafa: "Jirafa",
    unicornio: "Unicornio",
    conejo: "Conejito",
    "dragon-bebe": "Dragón Bebé",
    "dragon-anciano": "Dragón Anciano"
  };

  /**
   * Resuelve fechas relativas a partir de texto
   */
  function resolverFecha(texto, defaultToday) {
    const t = texto.toLowerCase();
    const hoy = new Date();
    
    if (t.includes("anteayer") || t.includes("antier") || t.includes("hace 2 dias") || t.includes("hace 2 días")) {
      const d = new Date(hoy);
      d.setDate(d.getDate() - 2);
      return d.toISOString().slice(0, 10);
    }
    if (t.includes("ayer")) {
      const d = new Date(hoy);
      d.setDate(d.getDate() - 1);
      return d.toISOString().slice(0, 10);
    }
    const matchDias = t.match(/hace\s+(\d+)\s+d[ií]as/);
    if (matchDias) {
      const cant = parseInt(matchDias[1]);
      if (cant > 0 && cant < 90) {
        const d = new Date(hoy);
        d.setDate(d.getDate() - cant);
        return d.toISOString().slice(0, 10);
      }
    }
    const matchDiaMes = t.match(/el\s+(\d{1,2})\s+(?:de\s+este\s+mes)?/);
    if (matchDiaMes) {
      const dia = parseInt(matchDiaMes[1]);
      if (dia >= 1 && dia <= 31) {
        const y = hoy.getFullYear();
        const m = String(hoy.getMonth() + 1).padStart(2, "0");
        return `${y}-${m}-${String(dia).padStart(2, "0")}`;
      }
    }
    return defaultToday();
  }

  /**
   * Encuentra la mejor categoría para un concepto y tipo
   */
  function clasificarCategoria(texto, tipo, categories) {
    const t = texto.toLowerCase();
    const disponibles = categories.filter(c => c.tipo === tipo);
    if (!disponibles.length) return { id: null, nombre: tipo === "ingreso" ? "Ingresos" : "General" };

    // 1. Coincidencia exacta o parcial con nombres de categorías del usuario
    for (const cat of disponibles) {
      const nombreCat = (cat.nombre || "").toLowerCase();
      if (t.includes(nombreCat)) {
        return { id: cat.id, nombre: cat.nombre };
      }
    }

    // 2. Diccionario semántico
    for (const [keyGroup, keywords] of Object.entries(CATEGORIA_KEYWORDS)) {
      if (keywords.some(kw => t.includes(kw))) {
        const target = disponibles.find(c => {
          const cName = (c.nombre || "").toLowerCase();
          return cName.includes(keyGroup) || keywords.some(kw => cName.includes(kw));
        });
        if (target) return { id: target.id, nombre: target.nombre };
      }
    }

    // 3. Fallback inteligente
    const defaultCat = disponibles[0];
    return { id: defaultCat.id, nombre: defaultCat.nombre };
  }

  /**
   * Analiza oraciones compuestas con múltiples movimientos
   * Ej: "gasté 20 en taxi y 15 en comida", "cobré 400 y pagué 50 de internet"
   */
  function extraerMultiplesMovimientos(texto) {
    // Segmentar por conectores como ' y ', ' e ', ';', ',', ' además ', ' tambien '
    const segmentos = texto.split(/(?:\s+y\s+|\s+e\s+|;|\s+adem[aá]s\s+|\s+tambi[eé]n\s+)/i);
    const movimientos = [];

    for (const seg of segmentos) {
      const s = seg.trim();
      if (!s) continue;

      const esIngreso = /(ingres[eéóo]|cobr[eéóo]|recib[eéíi]|gan[eéóo]|sueldo|salario|n[oó]mina|dep[oó]sito|freelance|honorarios|me pagaron)/i.test(s);
      const esGasto = /(gast[eéóo]|pagu[eéóo]|compr[eéóo]|consum[ií]|pagar|deducir)/i.test(s);

      // Buscar monto
      const matchMonto = s.match(/(?:(?:[\$€]|usd|ves|eur)?\s*)(\d+(?:[.,]\d{1,2})?)(?:\s*(?:[\$€]|usd|ves|eur|dolares|dólares|euros|bolivares|bolívares))?/i);
      if (matchMonto) {
        const monto = parseFloat(matchMonto[1].replace(",", "."));
        if (monto > 0) {
          // Extraer descripción limpia
          let desc = s
            .replace(/(?:gast[eéóo]|pagu[eéóo]|compr[eéóo]|ingres[eéóo]|cobr[eéóo]|recib[eéíi]|anota|registra|pon|apunta|ayer|antier|anteayer)\s+/gi, " ")
            .replace(new RegExp(String(matchMonto[1]).replace(".", "\\."), "g"), " ")
            .replace(/(?:en|de|por|un|una|el|la|los|las|dolares|dólares|euros|pesos|bolivares|bolívares|ves|usd|eur|\$|€)\s*/gi, " ")
            .trim();
          
          if (!desc || desc.length < 2) {
            desc = esIngreso ? "Ingreso" : "Gasto";
          }
          desc = desc.charAt(0).toUpperCase() + desc.slice(1);

          movimientos.push({
            tipo: esIngreso ? "ingreso" : "gasto",
            monto,
            descripcion: desc,
            rawSegment: s
          });
        }
      }
    }

    return movimientos;
  }

  window.FinanzasIA = {
    /**
     * Procesa una instrucción en lenguaje natural para finanzas personales o compartidas
     * @param {string} instruccion
     * @param {string} scope ("personal" | "pareja")
     * @param {object} context Contexto con state, money, today, loadInventory, saveInventory, checked, rowScope
     * @returns {Promise<{ ok: boolean, recargar: boolean, mensaje: string }>}
     */
    async procesar(instruccion, scope, ctx) {
      const { state, money, today, loadInventory, saveInventory, checked, rowScope } = ctx;
      const raw = (instruccion || "").trim();
      const texto = raw.toLowerCase();
      const data = state.data[scope] || { movements: [], categories: [], goals: [], budgets: [] };
      const mId = localStorage.getItem("mascota_actual") || "mapache";
      const mascNombre = MASCOTAS_NOMBRES[mId] || "Mascota";
      const rowsPeriodo = (data.movements || []).filter(r => (r.fecha || "").slice(0, 7) === state.period);
      const incomes = rowsPeriodo.filter(r => r.tipo === "ingreso");
      const expenses = rowsPeriodo.filter(r => r.tipo === "gasto");
      const totIncome = incomes.reduce((s, r) => s + Number(r.monto), 0);
      const totExpense = expenses.reduce((s, r) => s + Number(r.monto), 0);
      const balance = totIncome - totExpense;

      // =========================================================================
      // 1. ANÁLISIS 50/30/20 (REGLA DE ORO FINANCIERA)
      // =========================================================================
      if (/(50\/30\/20|regla 50 30 20|diagnostico|diagnóstico|salud financiera|reparto|distribucion de ingresos|distribución)/i.test(texto)) {
        if (totIncome <= 0) {
          return {
            ok: true,
            recargar: false,
            mensaje: `[DIAGNÓSTICO 50/30/20 - ${mascNombre.toUpperCase()}]
Aún no has registrado ingresos en el período ${state.period}.
La regla 50/30/20 recomienda distribuir tus ingresos netos así:
• 50% Necesidades básicas (Vivienda, comida, salud, transporte)
• 30% Deseos y calidad de vida (Ocio, compras, salidas)
• 20% Ahorro e inversión (Metas de futuro y fondo de emergencia)

Registra tus ingresos (ej: "Cobré 800 de sueldo") para generar tu radiografía exacta.`
          };
        }

        const objetivoNecesidades = totIncome * 0.50;
        const objetivoDeseos = totIncome * 0.30;
        const objetivoAhorro = totIncome * 0.20;

        let gastoNecesidades = 0;
        let gastoDeseos = 0;

        expenses.forEach(e => {
          const cat = (data.categories.find(c => c.id === e.categoria_id)?.nombre || "").toLowerCase();
          const desc = (e.descripcion || "").toLowerCase();
          if (/(vivienda|alquiler|luz|agua|super|comida|mercado|salud|farmacia|transporte|gasolina)/.test(cat + " " + desc)) {
            gastoNecesidades += Number(e.monto);
          } else {
            gastoDeseos += Number(e.monto);
          }
        });

        const ahorroActual = Math.max(0, balance);
        const pctNec = ((gastoNecesidades / totIncome) * 100).toFixed(1);
        const pctDes = ((gastoDeseos / totIncome) * 100).toFixed(1);
        const pctAho = ((ahorroActual / totIncome) * 100).toFixed(1);

        const dictamenNec = gastoNecesidades <= objetivoNecesidades ? "✅ Bajo control" : "⚠️ Excedido";
        const dictamenDes = gastoDeseos <= objetivoDeseos ? "✅ Equilibrado" : "⚠️ Alto consumo";
        const dictamenAho = ahorroActual >= objetivoAhorro ? "🌟 Excelente capacidad" : "💡 Oportunidad de ahorro";

        return {
          ok: true,
          recargar: false,
          mensaje: `[ANÁLISIS DE REGLA 50/30/20 - ${mascNombre.toUpperCase()}]
Base de ingresos de ${state.period}: ${money(totIncome)}

1. 🏠 NECESIDADES BÁSICAS (Tope 50% = ${money(objetivoNecesidades)})
   • Gastado: ${money(gastoNecesidades)} (${pctNec}%) -> ${dictamenNec}

2. 🍿 DESEOS Y OCIO (Tope 30% = ${money(objetivoDeseos)})
   • Gastado: ${money(gastoDeseos)} (${pctDes}%) -> ${dictamenDes}

3. 💰 AHORRO E INVERSIÓN (Objetivo 20% = ${money(objetivoAhorro)})
   • Flujo sobrante actual: ${money(ahorroActual)} (${pctAho}%) -> ${dictamenAho}

💡 Veredicto de ${mascNombre}: ${ahorroActual >= objetivoAhorro ? "Tus finanzas tienen una estructura óptima. Aprovecha para enviar fondos a tus Metas." : "Tus egresos están absorbiendo tu capacidad de ahorro. Conviene topar las salidas de ocio y gastos variables."}`
        };
      }

      // =========================================================================
      // 2. DISPONIBLE DIARIO Y PROYECCIÓN HASTA FIN DE MES
      // =========================================================================
      if (/(cuanto puedo gastar al dia|cuánto puedo gastar al día|presupuesto diario|gasto diario|llegar a fin de mes|para terminar el mes|diario)/i.test(texto)) {
        const hoy = new Date();
        const diasEnMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
        const diaActual = hoy.getDate();
        const diasRestantes = Math.max(1, diasEnMes - diaActual + 1);

        if (balance <= 0) {
          return {
            ok: true,
            recargar: false,
            mensaje: `[PRESUPUESTO DIARIO - ${mascNombre.toUpperCase()}]
Actualmente estás en déficit operativo (${money(balance)}) o sin saldo positivo registrado en ${state.period}.
• Días restantes en el mes: ${diasRestantes} días.
Recomendación urgente: Prioriza frenar gastos no esenciales y asentar cualquier ingreso pendiente para estabilizar el flujo de caja.`
          };
        }

        const diarioDisponible = balance / diasRestantes;
        return {
          ok: true,
          recargar: false,
          mensaje: `[PRESUPUESTO DIARIO DISPONIBLE - ${mascNombre.toUpperCase()}]
• Flujo disponible actual: ${money(balance)}
• Días restantes para fin de mes: ${diasRestantes} días (hasta el día ${diasEnMes}).
• Límite seguro de gasto diario: 👉 ${money(diarioDisponible)} por día.

Si te mantienes por debajo de ${money(diarioDisponible)} al día, cerrarás el mes con saldo positivo sin comprometer tu estabilidad.`
        };
      }

      // =========================================================================
      // 3. FONDO DE EMERGENCIA Y RUNWAY
      // =========================================================================
      if (/(fondo de emergencia|runway|cuantos meses puedo vivir|cuánto puedo aguantar|meses de ahorro|reserva de emergencia)/i.test(texto)) {
        const gastoPromedio = totExpense > 0 ? totExpense : 1;
        const totalAhorradoEnMetas = (data.goals || []).reduce((acc, g) => acc + (Number(g.acumulado) || 0), 0);
        const reservaTotal = Math.max(0, balance) + totalAhorradoEnMetas;
        const mesesRunway = (reservaTotal / gastoPromedio).toFixed(1);

        return {
          ok: true,
          recargar: false,
          mensaje: `[AUDITORÍA DE FONDO DE EMERGENCIA - ${mascNombre.toUpperCase()}]
• Gasto mensual base registrado: ${money(totExpense)}
• Liquidez estimada (Disponible + Metas): ${money(reservaTotal)}
• Cobertura de supervivencia (Runway): ${mesesRunway} meses de gastos cubiertos.

Recomendación estándar: Lo ideal es contar con entre 3 y 6 meses de gastos ahorrados (${money(totExpense * 3)} - ${money(totExpense * 6)}) ante cualquier imprevisto laboral o de salud.`
        };
      }

      // =========================================================================
      // 4. DETECCIÓN DE FUGA DE DINERO Y GASTOS HORMIGA
      // =========================================================================
      if (/(en que he gastado mas|en qué he gastado más|donde recortar|dónde recortar|fuga de dinero|gastos hormiga|en que se me va el dinero|en qué se me va)/i.test(texto)) {
        if (!expenses.length) {
          return {
            ok: true,
            recargar: false,
            mensaje: `[AUDITORÍA DE GASTOS - ${mascNombre.toUpperCase()}]\nAún no has registrado gastos en el período ${state.period}.`
          };
        }

        const catMap = {};
        expenses.forEach(e => {
          const cat = data.categories.find(c => c.id === e.categoria_id)?.nombre || "General";
          catMap[cat] = (catMap[cat] || 0) + Number(e.monto);
        });

        const ordenadas = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
        const top3 = ordenadas.slice(0, 3);
        const topTexto = top3.map(([c, m], idx) => `${idx + 1}. **${c}**: ${money(m)} (${((m / totExpense) * 100).toFixed(1)}% del total)`).join("\n");

        // Gastos pequeños recurrentes (< 15)
        const hormiga = expenses.filter(e => Number(e.monto) <= 15);
        const totHormiga = hormiga.reduce((s, e) => s + Number(e.monto), 0);

        return {
          ok: true,
          recargar: false,
          mensaje: `[ANÁLISIS DE FUGAS Y CONCENTRACIÓN - ${mascNombre.toUpperCase()}]
Total egresos en ${state.period}: ${money(totExpense)}

🏆 Mayor consumo por categorías:
${topTexto}

🐜 Impacto de microgastos / "gastos hormiga" (≤ ${money(15)}):
• ${hormiga.length} microtransacciones detectadas sumando ${money(totHormiga)} (${totExpense > 0 ? ((totHormiga / totExpense) * 100).toFixed(1) : 0}% de tus gastos).

💡 Consejo para recortar: Fija un presupuesto en tu categoría número 1 ("${top3[0]?.[0] || "General"}") o reduce los microconsumos no esenciales.`
        };
      }

      // =========================================================================
      // 5. CONSEJOS Y CONSULTORÍA FINANCIERA CONVERSACIONAL
      // =========================================================================
      if (/(consejo|consejos|tips|recomendacion|recomendación|como ahorrar|cómo ahorrar|invertir|inversion|inversión|deuda|deudas)/i.test(texto) && !/(gaste|gasté|ingrese|ingresé|\d+)/i.test(texto)) {
        let tema = "general";
        if (/(invertir|inversion|inversión)/i.test(texto)) tema = "inversion";
        else if (/(deuda|deudas|tarjeta|préstamo|prestamo)/i.test(texto)) tema = "deudas";

        if (tema === "inversion") {
          return {
            ok: true,
            recargar: false,
            mensaje: `[ESTRATEGIA DE INVERSIÓN - ${mascNombre.toUpperCase()}]
Antes de invertir, sigue esta regla de oro en 3 pasos:
1. Elimina deudas de alto interés (tarjetas de crédito, préstamos rápidos).
2. Construye tu fondo de emergencia de 3 a 6 meses de gastos (${money(totExpense * 3 || 1000)} aprox).
3. Diversifica: Invierte solo el excedente en instrumentos indexados (ETFs como S&P 500), bonos o proyectos con rentabilidad comprobada.
¡Nunca inviertas dinero que vayas a necesitar en los próximos 12 meses!`
          };
        }

        if (tema === "deudas") {
          return {
            ok: true,
            recargar: false,
            mensaje: `[ESTRATEGIA PARA SALIR DE DEUDAS - ${mascNombre.toUpperCase()}]
Aplica uno de estos dos métodos probados:
• Método Avalancha (Mayor ahorro): Paga el mínimo de todas las deudas y enfoca todo el dinero extra en la que tenga la tasa de interés más alta.
• Método Bola de Nieve (Mayor motivación): Liquida primero la deuda de menor monto para ganar victorias psicológicas rápidas.
💡 Regla clave: No contraigas nuevas deudas hasta liquidar los pasivos corrientes.`
          };
        }

        return {
          ok: true,
          recargar: false,
          mensaje: `[CONSEJOS DE AHORRO INTELIGENTE - ${mascNombre.toUpperCase()}]
1. Regla de las 72 horas: Espera 3 días antes de realizar cualquier compra impulsiva no esencial.
2. Págate a ti primero: Apenas cobres tus ingresos, destina el 10% a 20% a tus Metas antes de empezar a gastar.
3. Auditoría de suscripciones: Revisa plataformas de streaming y apps que no utilices semanalmente.
4. Cocina por lotes: El delivery suele ser la principal fuga de dinero en la categoría Comida.`
        };
      }

      // =========================================================================
      // 6. PROYECCIÓN DE METAS DE AHORRO EN TIEMPO
      // =========================================================================
      if (/(en cuanto tiempo|en cuántos meses|cuando llego|cuándo llego|proyeccion de meta|proyección de meta|alcanzar mi meta)/i.test(texto)) {
        const metas = data.goals || [];
        if (!metas.length) {
          return {
            ok: true,
            recargar: false,
            mensaje: `[SIMULADOR DE METAS - ${mascNombre.toUpperCase()}]\nAún no tienes metas creadas. Puedes decirme: "Crear meta de 500 para Laptop" para empezar.`
          };
        }

        const metaObj = metas[0];
        const faltante = Math.max(0, Number(metaObj.objetivo) - (Number(metaObj.acumulado) || 0));
        const ahorroMensualEstimado = Math.max(1, balance > 0 ? balance : 50);
        const meses = Math.ceil(faltante / ahorroMensualEstimado);

        return {
          ok: true,
          recargar: false,
          mensaje: `[PROYECCIÓN DE METAS - ${mascNombre.toUpperCase()}]
• Meta analizada: "${metaObj.nombre}"
• Objetivo: ${money(metaObj.objetivo)} | Ahorrado: ${money(metaObj.acumulado || 0)}
• Faltante: ${money(faltante)}
• Con tu ritmo mensual actual (${money(ahorroMensualEstimado)}/mes), alcanzarás tu meta en aproximadamente **${meses} mes${meses > 1 ? "es" : ""}**.

💡 Consejo: Si aportas ${money(Math.ceil(faltante / 3))} al mes, la conseguirás en tan solo 3 meses.`
        };
      }

      // =========================================================================
      // 7. CONSULTA DE RESUMEN / BALANCE / "¿CÓMO VOY?"
      // =========================================================================
      const esPreguntaResumen = /(como voy|cómo voy|como van|cómo van|cuanto tengo|cuánto tengo|balance|resumen|disponible|estado|cuanto gaste|cuánto gasté|cuanto he gastado|cuánto he gastado)/i.test(texto);
      if (esPreguntaResumen && !/(gaste|gasté|ingrese|ingresé|pague|pagué)\s+\d+/i.test(texto)) {
        const estado = balance >= 0 ? "con saldo positivo y superávit" : "en déficit respecto a tus ingresos";
        return {
          ok: true,
          recargar: false,
          mensaje: `[ANÁLISIS FINANCIERO - ${mascNombre.toUpperCase()}]
• Período actual: ${state.period}
• Ingresos registrados: ${money(totIncome)}
• Gastos acumulados: ${money(totExpense)}
• Balance neto disponible: ${money(balance)} (${estado})
• Total de operaciones auditadas: ${rowsPeriodo.length} movimientos.

Recomendación del asistente: ${balance >= 0 ? "Buen control operativo. Considera destinar un porcentaje a tus Metas de Ahorro." : "Los egresos superan los ingresos de este ciclo. Revisa la pestaña 'Límites' para contener gastos en categorías variables."}`
        };
      }

      // =========================================================================
      // 8. CONSULTA DE INVENTARIO Y STOCK AUDIT
      // =========================================================================
      const esConsultaInventario = /(inventario|que tengo en stock|qué tengo en stock|cuanto tengo en stock|cuánto tengo en stock|stock|productos disponibles|ganancia de productos|ganancia total)/i.test(texto);
      if (esConsultaInventario && !/(vendi|vendí|agregar|agrega|comprar|compra)/i.test(texto)) {
        const items = loadInventory ? loadInventory(scope) : [];
        if (!items.length) {
          return {
            ok: true,
            recargar: false,
            mensaje: `[INVENTARIO - ${mascNombre.toUpperCase()}]
Aún no tienes artículos registrados en tu inventario.
Puedes indicarme:
• "Agrega 20 tortas al inventario a 15 de venta y 6 de materia prima"
• "Nuevo producto: Camisa, stock 10, precio 25, costo 10"`
          };
        }
        const totalStock = items.reduce((s, i) => s + (Number(i.stock) || 0), 0);
        const totalVenta = items.reduce((s, i) => s + (Number(i.stock) || 0) * (Number(i.precioVenta) || 0), 0);
        const totalCosto = items.reduce((s, i) => s + (Number(i.stock) || 0) * (Number(i.costoMateria) || 0), 0);
        const gananciaPotencial = totalVenta - totalCosto;

        const resumenArticulos = items.map(i => {
          const gananciaU = (Number(i.precioVenta) || 0) - (Number(i.costoMateria) || 0);
          return `• ${i.nombre}: ${i.stock} en stock | Venta: ${money(i.precioVenta)} | Costo materia: ${money(i.costoMateria)} | Margen: +${money(gananciaU)} c/u`;
        }).join("\n");

        return {
          ok: true,
          recargar: false,
          mensaje: `[AUDITORÍA DE INVENTARIO Y GANANCIAS - ${mascNombre.toUpperCase()}]
Total de artículos: ${items.length} productos (${totalStock} unidades en stock).
• Inversión en materia prima: ${money(totalCosto)}
• Valor de venta proyectado: ${money(totalVenta)}
• Ganancia neta potencial completa: +${money(gananciaPotencial)}

Desglose de productos:
${resumenArticulos}`
        };
      }

      // =========================================================================
      // 9. REGISTRO DE VENTA CON DEDUCCIÓN DE STOCK Y GANANCIA
      // =========================================================================
      const esRegistroVenta = /(vendi|vendí|venta de|vender|despache|despaché)\s+/i.test(texto);
      if (esRegistroVenta) {
        const items = loadInventory ? loadInventory(scope) : [];
        const matchCant = texto.match(/(?:vendi|vendí|venta de|despache|despaché)\s+(\d+)/i) || texto.match(/(\d+)\s+(?:unidades|u\b|articulos|artículos)?/i);
        const cantidad = matchCant ? Math.max(1, parseInt(matchCant[1])) : 1;

        let prodEncontrado = null;
        for (const it of items) {
          if (texto.includes(it.nombre.toLowerCase())) {
            prodEncontrado = it;
            break;
          }
        }

        const matchPrecios = texto.match(/(?:a|por|precio|en)\s+(\d+(?:[.,]\d+)?)/i);
        const matchCosto = texto.match(/(?:costo|materia prima|insumo|costo de|gastando)\s+(?:de\s+)?(\d+(?:[.,]\d+)?)/i);

        if (prodEncontrado) {
          if (prodEncontrado.stock < cantidad) {
            return {
              ok: false,
              recargar: false,
              mensaje: `[INVENTARIO INSUFICIENTE - ${mascNombre.toUpperCase()}]\nSolo dispones de ${prodEncontrado.stock} unidades de "${prodEncontrado.nombre}" en stock (intentaste registrar la venta de ${cantidad}).`
            };
          }
          prodEncontrado.stock -= cantidad;
          prodEncontrado.ventasTotales = (prodEncontrado.ventasTotales || 0) + cantidad;

          const pVentaTotal = (Number(prodEncontrado.precioVenta) || 0) * cantidad;
          const cMateriaTotal = (Number(prodEncontrado.costoMateria) || 0) * cantidad;
          const gananciaTotal = pVentaTotal - cMateriaTotal;
          prodEncontrado.gananciaAcumulada = (prodEncontrado.gananciaAcumulada || 0) + gananciaTotal;
          if (saveInventory) saveInventory(scope, items);

          const catIngreso = clasificarCategoria(prodEncontrado.nombre, "ingreso", data.categories);

          await window._supabase.from("finanzas_movimientos").insert({
            user_id: state.userId,
            grupo_id: scope === "pareja" ? state.groupId : null,
            miembro_id: state.userId,
            categoria_id: catIngreso.id,
            tipo: "ingreso",
            monto: pVentaTotal,
            fecha: resolverFecha(texto, today),
            descripcion: `Venta ${cantidad}x ${prodEncontrado.nombre} (Costo insumos: ${money(cMateriaTotal)} | Ganancia neta: ${money(gananciaTotal)})`
          });

          return {
            ok: true,
            recargar: true,
            mensaje: `[VENTA Y GANANCIA CALCULADA - ${mascNombre.toUpperCase()}]
• Producto vendido: "${prodEncontrado.nombre}" (${cantidad} unidad${cantidad > 1 ? "es" : ""})
• Ingreso bruto por venta: +${money(pVentaTotal)}
• Costo deducido de materia prima: -${money(cMateriaTotal)} (${money(prodEncontrado.costoMateria)} c/u)
• GANANCIA COMPLETA NETA: +${money(gananciaTotal)}
• Stock remanente en almacén: ${prodEncontrado.stock} unidades.

He deducido las existencias del inventario y asentado el ingreso correspondiente en tus movimientos contables.`
          };
        } else if (matchPrecios) {
          const pVentaUnit = parseFloat(matchPrecios[1].replace(",", "."));
          const cMateriaUnit = matchCosto ? parseFloat(matchCosto[1].replace(",", ".")) : 0;
          const pVentaTotal = pVentaUnit * cantidad;
          const cMateriaTotal = cMateriaUnit * cantidad;
          const gananciaTotal = pVentaTotal - cMateriaTotal;

          let concepto = raw.replace(/(?:vendi|vendí|venta de|despache|despaché|\d+|por|a|en|con costo de|materia prima|insumo|\$|€|usd|ves|eur)\s*/gi, " ").trim();
          if (!concepto || concepto.length < 2) concepto = "Producto";
          concepto = concepto.charAt(0).toUpperCase() + concepto.slice(1);

          const catIngreso = clasificarCategoria(concepto, "ingreso", data.categories);

          await window._supabase.from("finanzas_movimientos").insert({
            user_id: state.userId,
            grupo_id: scope === "pareja" ? state.groupId : null,
            miembro_id: state.userId,
            categoria_id: catIngreso.id,
            tipo: "ingreso",
            monto: pVentaTotal,
            fecha: resolverFecha(texto, today),
            descripcion: `Venta ${cantidad}x ${concepto} (Materia prima: ${money(cMateriaTotal)} | Ganancia neta: ${money(gananciaTotal)})`
          });

          return {
            ok: true,
            recargar: true,
            mensaje: `[VENTA Y GANANCIA REGISTRADA - ${mascNombre.toUpperCase()}]
• Artículo: "${concepto}" (${cantidad} u.)
• Total ingresado por venta: +${money(pVentaTotal)}
• Deducción de materia prima: -${money(cMateriaTotal)}
• GANANCIA NETA COMPLETA: +${money(gananciaTotal)}

El importe fue sumado a tus finanzas de ${state.period}.`
          };
        }
      }

      // =========================================================================
      // 10. AGREGAR PRODUCTO A INVENTARIO
      // =========================================================================
      const esAgregarInventario = /(agregar al inventario|agrega al inventario|añadir al inventario|meter al inventario|nuevo producto|registrar producto|inventario de)/i.test(texto);
      if (esAgregarInventario) {
        const nums = texto.match(/\d+(?:[.,]\d+)?/g);
        if (!nums || !nums.length) {
          return {
            ok: false,
            recargar: false,
            mensaje: `[INVENTARIO - ${mascNombre.toUpperCase()}]\nPara agregar un producto indícame los datos, por ejemplo:\n• "Agrega 15 hamburguesas al inventario a 10 de venta y 4 de materia prima"`
          };
        }

        const stock = parseInt(nums[0]) || 1;
        const precioVenta = nums[1] ? parseFloat(nums[1].replace(",", ".")) : 10;
        const costoMateria = nums[2] ? parseFloat(nums[2].replace(",", ".")) : 0;

        let nombreProd = raw
          .replace(/(?:agrega|agregar|añadir|añade|meter|nuevo producto|al inventario|inventario|stock|a|de venta|venta|materia prima|costo|insumo)\s*/gi, " ")
          .replace(/\d+(?:[.,]\d+)?/g, " ")
          .replace(/(?:unidades|pesos|dolares|dólares|euros|usd|ves|eur|\$|€)/gi, " ")
          .trim();
        if (!nombreProd || nombreProd.length < 2) nombreProd = "Artículo";
        nombreProd = nombreProd.charAt(0).toUpperCase() + nombreProd.slice(1);

        const items = loadInventory ? loadInventory(scope) : [];
        const existe = items.find(i => i.nombre.toLowerCase() === nombreProd.toLowerCase());
        if (existe) {
          existe.stock += stock;
          existe.precioVenta = precioVenta;
          existe.costoMateria = costoMateria;
        } else {
          items.unshift({
            id: "prod_" + Date.now(),
            nombre: nombreProd,
            stock,
            precioVenta,
            costoMateria,
            ventasTotales: 0,
            gananciaAcumulada: 0,
            fecha: today()
          });
        }
        if (saveInventory) saveInventory(scope, items);
        const gananciaU = precioVenta - costoMateria;

        return {
          ok: true,
          recargar: true,
          mensaje: `[PRODUCTO INGRESADO AL INVENTARIO - ${mascNombre.toUpperCase()}]
• Artículo: "${nombreProd}"
• Cantidad en almacén: ${stock} unidades
• Precio de Venta: ${money(precioVenta)} c/u
• Costo de Materia Prima: ${money(costoMateria)} c/u
• Margen de Ganancia Neta: +${money(gananciaU)} por unidad (${Math.round((gananciaU / precioVenta) * 100)}%)

El producto quedó registrado en tu pestaña "Inventario".`
        };
      }

      // =========================================================================
      // 11. REGISTRO MÚLTIPLE DE MOVIMIENTOS EN BATCH
      // =========================================================================
      const multiMovs = extraerMultiplesMovimientos(texto);
      if (multiMovs.length > 1) {
        const fechaOperacion = resolverFecha(texto, today);
        const resultadosDetalle = [];

        for (const mov of multiMovs) {
          const catInfo = clasificarCategoria(mov.descripcion, mov.tipo, data.categories);
          await window._supabase.from("finanzas_movimientos").insert({
            user_id: state.userId,
            grupo_id: scope === "pareja" ? state.groupId : null,
            miembro_id: state.userId,
            categoria_id: catInfo.id,
            tipo: mov.tipo,
            monto: mov.monto,
            fecha: fechaOperacion,
            descripcion: mov.descripcion.slice(0, 120)
          });
          resultadosDetalle.push(`• ${mov.tipo === "ingreso" ? "🟢 Ingreso" : "🔴 Gasto"}: ${money(mov.monto)} en "${catInfo.nombre}" (${mov.descripcion})`);
        }

        return {
          ok: true,
          recargar: true,
          mensaje: `[REGISTRO MÚLTIPLE INTELIGENTE - ${mascNombre.toUpperCase()}]
He procesado ${multiMovs.length} transacciones simultáneas con fecha ${fechaOperacion}:
${resultadosDetalle.join("\n")}

Tus métricas y balances se han recalculado de inmediato.`
        };
      }

      // =========================================================================
      // 12. OPERACIONES INDIVIDUALES (EXTRACCIÓN DE MONTO)
      // =========================================================================
      const matchMonto = texto.match(/(?:(?:[\$€]|usd|ves|eur)?\s*)(\d+(?:[.,]\d{1,2})?)(?:\s*(?:[\$€]|usd|ves|eur|dolares|dólares|euros|bolivares|bolívares))?/i);
      const monto = matchMonto ? Number(matchMonto[1].replace(",", ".")) : null;

      // 12.A CREAR NUEVA META DE AHORRO
      const esCrearMeta = /(crear meta|nueva meta|agrega(?:r)? una meta|agrega(?:r)? meta|pon(?:er)? una meta|fija(?:r)? una meta|establece(?:r)? una meta|meta de \d+|meta para (?:un|una|\w+))/i.test(texto);
      if (esCrearMeta && monto && monto > 0) {
        let nombreMeta = raw
          .replace(/(?:crear|agregar|agrega|pon|poner|fijar|fija|establecer|establece)?\s*(?:una)?\s*meta\s*(?:de\s*\d+(?:[.,]\d+)?\s*(?:usd|ves|eur|\$|€|dolares|dólares|euros)?)?\s*(?:para|de)?\s*/gi, "")
          .replace(new RegExp(String(monto).replace(".", "\\."), "g"), "")
          .replace(/(?:usd|ves|eur|\$|€|dolares|dólares|euros|bolivares|bolívares)\s*/gi, "")
          .trim();
        
        nombreMeta = nombreMeta.replace(/^(para|de|un|una|el|la)\s+/i, "").trim();
        if (!nombreMeta || nombreMeta.length < 2) nombreMeta = "Meta de ahorro";
        nombreMeta = nombreMeta.charAt(0).toUpperCase() + nombreMeta.slice(1);

        const r = await window._supabase.from("finanzas_metas").insert({
          user_id: state.userId,
          grupo_id: scope === "pareja" ? state.groupId : null,
          nombre: nombreMeta,
          objetivo: monto,
          moneda: state.currency,
          fecha_objetivo: null
        });
        if (r.error) throw r.error;

        return {
          ok: true,
          recargar: true,
          mensaje: `[NUEVA META CREADA - ${mascNombre.toUpperCase()}]
• Nombre de la meta: "${nombreMeta}"
• Objetivo de ahorro: ${money(monto)}
• Moneda: ${state.currency}
• Ámbito: ${scope === "pareja" ? "Finanzas Compartidas" : "Finanzas Personales"}

He configurado la meta en la pestaña "Ahorros".`
        };
      }

      // 12.B APORTAR A META DE AHORRO EXISTENTE O CREAR AL VUELO
      const esAporteMeta = /(ahorrar|ahorro|guardar|aportar|aporte|sumar ahorro|destinar a la meta|guarde|guardé)\s+/i.test(texto);
      if (esAporteMeta && monto && monto > 0 && !/(limite|límite|tope|presupuesto)/i.test(texto)) {
        if (!data.goals || !data.goals.length) {
          const nombreMeta = raw.replace(/(?:ahorrar|guardar|aportar|meta para|para)\s+/gi, "").trim() || "Ahorro General";
          const r = await window._supabase.from("finanzas_metas").insert({
            user_id: state.userId,
            grupo_id: scope === "pareja" ? state.groupId : null,
            nombre: nombreMeta,
            objetivo: monto * 5,
            moneda: state.currency,
            fecha_objetivo: null
          });
          if (r.error) throw r.error;
          return {
            ok: true,
            recargar: true,
            mensaje: `[NUEVA META CREADA - ${mascNombre.toUpperCase()}]\nNo tenías metas activas, así que creé "${nombreMeta}" con un objetivo de ${money(monto * 5)} en ${state.currency}.`
          };
        }

        let metaEncontrada = data.goals.find(g => texto.includes(g.nombre.toLowerCase()));
        if (!metaEncontrada) {
          for (const g of data.goals) {
            const palabras = g.nombre.toLowerCase().split(/\s+/).filter(p => p.length > 2);
            if (palabras.some(p => texto.includes(p))) {
              metaEncontrada = g;
              break;
            }
          }
        }

        if (!metaEncontrada) metaEncontrada = data.goals[0];

        const rAporte = await window._supabase.from("finanzas_aportes").insert({
          meta_id: metaEncontrada.id,
          user_id: state.userId,
          grupo_id: scope === "pareja" ? state.groupId : null,
          monto: monto
        });
        if (rAporte.error) throw rAporte.error;

        return {
          ok: true,
          recargar: true,
          mensaje: `[APORTE REGISTRADO - ${mascNombre.toUpperCase()}]\nHe sumado ${money(monto, metaEncontrada.moneda || state.currency)} a tu meta "${metaEncontrada.nombre}". ¡El progreso hacia tu objetivo ha aumentado!`
        };
      }

      // 12.C FIJAR PRESUPUESTO / LÍMITE
      const esLimite = /(limite|límite|tope|presupuesto|fijar límite|poner límite)\s+/i.test(texto);
      if (esLimite && monto && monto > 0) {
        const catInfo = clasificarCategoria(texto, "gasto", data.categories);
        if (!catInfo.id) throw new Error("No encontré una categoría de gasto adecuada para aplicar el límite.");

        const args = rowScope(scope);
        let ex = window._supabase.from("finanzas_presupuestos").select("id").eq("periodo", `${state.period}-01`).eq("categoria_id", catInfo.id);
        ex = args.grupo_id ? ex.eq("grupo_id", args.grupo_id) : ex.eq("user_id", state.userId).is("grupo_id", null);
        const found = await checked(ex.limit(1));
        const r = found.length
          ? await window._supabase.from("finanzas_presupuestos").update({ limite: monto }).eq("id", found[0].id).eq("user_id", state.userId)
          : await window._supabase.from("finanzas_presupuestos").insert({
              user_id: state.userId, grupo_id: scope === "pareja" ? state.groupId : null,
              categoria_id: catInfo.id, periodo: `${state.period}-01`, limite: monto
            });
        if (r.error) throw r.error;

        return {
          ok: true,
          recargar: true,
          mensaje: `[LÍMITE ESTABLECIDO - ${mascNombre.toUpperCase()}]\nHe fijado un presupuesto máximo de ${money(monto)} para la categoría "${catInfo.nombre}" en ${state.period}. Te avisaré si te aproximas al tope.`
        };
      }

      // 12.D SI NO HUBO MONTO -> ASISTENTE INTELIGENTE CONVERSACIONAL Y DIAGNÓSTICO
      if (!monto || monto <= 0) {
        const metas = data.goals || [];
        const presupuestos = data.budgets || [];
        const items = loadInventory ? loadInventory(scope) : [];

        const gastoPorCat = {};
        expenses.forEach(e => {
          const cat = data.categories.find(c => c.id === e.categoria_id)?.nombre || "General";
          gastoPorCat[cat] = (gastoPorCat[cat] || 0) + Number(e.monto);
        });
        const topCategorias = Object.entries(gastoPorCat)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([c, m]) => `• **${c}:** ${money(m)} (${totExpense > 0 ? ((m / totExpense) * 100).toFixed(1) : 0}%)`)
          .join("\n");

        return {
          ok: true,
          recargar: false,
          mensaje: `### 🎯 Asistente Financiero Inteligente - ${mascNombre.toUpperCase()}
He analizado tu mensaje: *"${raw}"*.

---

### 📊 Estado Actual de tu Período (${state.period})
* **Flujo Neto Disponible:** ${money(balance)} ${balance >= 0 ? "*(Superávit)*" : "*(Déficit)*"}
* **Ingresos vs Gastos:** ${money(totIncome)} ingresados | ${money(totExpense)} gastados
* **Metas Activas:** ${metas.length} objetivos registrados
* **Límites de Presupuesto:** ${presupuestos.length} techos fijados
* **Inventario:** ${items.length} productos en almacén

${topCategorias ? `### 🔍 Categorías con Mayor Gasto:\n${topCategorias}\n` : ""}
---

### 💡 Cosas inteligentes que puedo hacer por ti:
1. **Registros rápidos o múltiples:**
   • *"Gasté 15 en taxi y 25 en supermercado"*
   • *"Cobré 600 de nómina y gasté 40 en cena ayer"*
2. **Consultoría y análisis avanzado:**
   • *"Diagnóstico 50/30/20"* (analiza si cumples la regla de oro)
   • *"¿Cuánto puedo gastar al día?"* (calcula presupuesto diario hasta fin de mes)
   • *"¿En qué he gastado más?"* o *"Gastos hormiga"*
   • *"Fondo de emergencia"* o *"Consejos para ahorrar"*
3. **Gestión de metas e inventario:**
   • *"Ahorrar 50 para viaje"* | *"Crear meta de 200 para teléfono"*
   • *"Venta de 3 tortas a 15"* (descuenta stock y calcula ganancia neta)`
        };
      }

      // =========================================================================
      // 13. REGISTRO INDIVIDUAL DE INGRESO O GASTO CON FECHA INTELIGENTE
      // =========================================================================
      const esIngreso = /(ingres[eéóo]|cobr[eéóo]|recib[eéíi]|gan[eéóo]|sueldo|salario|n[oó]mina|dep[oó]sito|freelance|honorarios|me pagaron|ingreso)/i.test(texto);
      const tipo = esIngreso ? "ingreso" : "gasto";
      const catInfo = clasificarCategoria(texto, tipo, data.categories);
      const fechaOperacion = resolverFecha(texto, today);

      let desc = raw
        .replace(/(?:gast[eéóo]|pagu[eéóo]|compr[eéóo]|ingres[eéóo]|cobr[eéóo]|recib[eéíi]|anota|registra|pon|apunta|ayer|antier|anteayer)\s+/gi, "")
        .replace(new RegExp(String(monto).replace(".", "\\."), "g"), "")
        .replace(/(?:en|de|por|un|una|el|la|los|las|dolares|dólares|euros|pesos|bolivares|bolívares|ves|usd|eur|\$|€)\s*/gi, " ")
        .trim();
      
      if (!desc || desc.length < 2) {
        desc = catInfo.nombre || (tipo === "ingreso" ? "Ingreso registrado" : "Gasto registrado");
      }
      desc = desc.charAt(0).toUpperCase() + desc.slice(1);

      const movRow = {
        user_id: state.userId,
        grupo_id: scope === "pareja" ? state.groupId : null,
        miembro_id: state.userId,
        categoria_id: catInfo.id,
        tipo: tipo,
        monto: monto,
        fecha: fechaOperacion,
        descripcion: desc.slice(0, 120)
      };

      const rMov = await window._supabase.from("finanzas_movimientos").insert(movRow);
      if (rMov.error) throw rMov.error;

      return {
        ok: true,
        recargar: true,
        mensaje: `[MOVIMIENTO REGISTRADO - ${mascNombre.toUpperCase()}]
• Operación: ${tipo === "ingreso" ? "🟢 Ingreso (+)" : "🔴 Gasto (−)"}
• Monto: ${money(monto)}
• Categoría asignada: "${catInfo.nombre}"
• Concepto / Detalle: "${desc}"
• Fecha: ${fechaOperacion} (${scope === "pareja" ? "Finanzas Compartidas" : "Finanzas Personales"})

Tus balances y reportes han sido actualizados en tiempo real.`
      };
    }
  };
})();
