/**
 * finanzas-ia.js - Motor de Asistente e Inteligencia Artificial Financiera de la Mascota
 * Extraído de finanzas.js para modularización y arquitectura desacoplada.
 */
(() => {
  "use strict";

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
      const data = state.data[scope];
      const mId = localStorage.getItem("mascota_actual") || "mapache";
      const mascNombre = {
        mapache: "Mapache", gatito: "Gatito", "gatito-negro": "Gatito Negro",
        perrito: "Perrito", pollito: "Pollito", jirafa: "Jirafa",
        unicornio: "Unicornio", conejo: "Conejito", "dragon-bebe": "Dragón Bebé",
        "dragon-anciano": "Dragón Anciano"
      }[mId] || "Mascota";

      // 1. Consulta de Resumen / Balance / "¿Cómo voy?"
      const esPreguntaResumen = /(como voy|cómo voy|como van|cómo van|cuanto tengo|cuánto tengo|balance|resumen|disponible|estado|cuanto gaste|cuánto gasté|cuanto he gastado|cuánto he gastado)/i.test(texto);
      if (esPreguntaResumen && !/(gaste|gasté|ingrese|ingresé|pague|pagué)\s+\d+/i.test(texto)) {
        const rows = (data.movements || []).filter(r => (r.fecha || "").slice(0, 7) === state.period);
        const incomes = rows.filter(r => r.tipo === "ingreso");
        const expenses = rows.filter(r => r.tipo === "gasto");
        const totIncome = incomes.reduce((s, r) => s + Number(r.monto), 0);
        const totExpense = expenses.reduce((s, r) => s + Number(r.monto), 0);
        const balance = totIncome - totExpense;
        const estado = balance >= 0 ? "con saldo positivo y superávit" : "en déficit respecto a tus ingresos";
        return {
          ok: true,
          recargar: false,
          mensaje: `[ANÁLISIS FINANCIERO - ${mascNombre.toUpperCase()}]
• Período actual: ${state.period}
• Ingresos registrados: ${money(totIncome)}
• Gastos acumulados: ${money(totExpense)}
• Balance neto disponible: ${money(balance)} (${estado})
• Total de operaciones auditadas: ${rows.length} movimientos.

Recomendación del asistente: ${balance >= 0 ? "Buen control operativo. Considera destinar un porcentaje a tus Metas de Ahorro." : "Los egresos superan los ingresos de este ciclo. Revisa la pestaña 'Límites' para contener gastos en categorías variables."}`
        };
      }

      // 1.5. Control de Inventario, Registro de Ventas y Deducción de Materia Prima
      const esConsultaInventario = /(inventario|que tengo en stock|qué tengo en stock|cuanto tengo en stock|cuánto tengo en stock|stock|productos disponibles|ganancia de productos|ganancia total)/i.test(texto);
      if (esConsultaInventario && !/(vendi|vendí|agregar|agrega|comprar|compra)/i.test(texto)) {
        const items = loadInventory(scope);
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

      // 1.6 Registro de VENTA con deducción de materia prima y cálculo de ganancia completa
      const esRegistroVenta = /(vendi|vendí|venta de|vender|despache|despaché)\s+/i.test(texto);
      if (esRegistroVenta) {
        const items = loadInventory(scope);
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
          saveInventory(scope, items);

          const catsFiltradas = data.categories.filter(c => c.tipo === "ingreso");
          const catId = catsFiltradas[0]?.id || null;

          await window._supabase.from("finanzas_movimientos").insert({
            user_id: state.userId,
            grupo_id: scope === "pareja" ? state.groupId : null,
            miembro_id: state.userId,
            categoria_id: catId,
            tipo: "ingreso",
            monto: pVentaTotal,
            fecha: today(),
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

          const catsFiltradas = data.categories.filter(c => c.tipo === "ingreso");
          const catId = catsFiltradas[0]?.id || null;

          await window._supabase.from("finanzas_movimientos").insert({
            user_id: state.userId,
            grupo_id: scope === "pareja" ? state.groupId : null,
            miembro_id: state.userId,
            categoria_id: catId,
            tipo: "ingreso",
            monto: pVentaTotal,
            fecha: today(),
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

      // 1.7 Agregar producto a inventario con costo y precio
      const esAgregarInventario = /(agregar al inventario|agrega al inventario|añadir al inventario|a\u00f1ade al inventario|meter al inventario|nuevo producto|registrar producto|inventario de)/i.test(texto);
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

        const items = loadInventory(scope);
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
        saveInventory(scope, items);
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

      // 2. Extraer monto numérico
      const matchMonto = texto.match(/(?:(?:[\$€]|usd|ves|eur)?\s*)(\d+(?:[.,]\d{1,2})?)(?:\s*(?:[\$€]|usd|ves|eur|dolares|dólares|euros|bolivares|bolívares))?/i);
      const monto = matchMonto ? Number(matchMonto[1].replace(",", ".")) : null;

      // 3.A Crear NUEVA Meta de Ahorro explícita
      const esCrearMeta = /(crear meta|nueva meta|agrega(?:r)? una meta|agrega(?:r)? meta|pon(?:er)? una meta|fija(?:r)? una meta|establece(?:r)? una meta|meta de \d+|meta para (?:un|una|\w+))/i.test(texto);
      if (esCrearMeta && monto && monto > 0) {
        let nombreMeta = raw
          .replace(/(?:crear|agregar|agrega|pon|poner|fijar|fija|establecer|establece)?\s*(?:una)?\s*meta\s*(?:de\s*\d+(?:[.,]\d+)?\s*(?:usd|ves|eur|\$|€|dolares|dólares|euros)?)?\s*(?:para|de)?\s*/gi, "")
          .replace(new RegExp(String(monto).replace(".", "\\."), "g"), "")
          .replace(/(?:usd|ves|eur|\$|€|dolares|dólares|euros|bolivares|bolívares)\s*/gi, "")
          .trim();
        
        nombreMeta = nombreMeta.replace(/^(para|de|un|una|el|la)\s+/i, "").trim();
        if (!nombreMeta || nombreMeta.length < 2) {
          nombreMeta = "Meta de ahorro";
        }
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

He configurado la meta en la pestaña "Ahorros". Ya puedes empezar a registrar aportes cuando lo desees.`
        };
      }

      // 3.B Aportar / Sumar a Meta de Ahorro existente
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

        const matchParaNuevo = raw.match(/(?:ahorrar|guardar|para)\s+(?:un|una|el|la)?\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,30})/i);
        if (!metaEncontrada && matchParaNuevo && matchParaNuevo[1]) {
          let candidato = matchParaNuevo[1].replace(new RegExp(String(monto).replace(".", "\\."), "g"), "").trim();
          candidato = candidato.replace(/(?:dolares|dólares|euros|bolivares|usd|eur|ves|\$|€)/gi, "").trim();
          if (candidato.length > 2 && !/(meta|ahorro|cuenta|dinero)/i.test(candidato)) {
            candidato = candidato.charAt(0).toUpperCase() + candidato.slice(1);
            const r = await window._supabase.from("finanzas_metas").insert({
              user_id: state.userId,
              grupo_id: scope === "pareja" ? state.groupId : null,
              nombre: candidato,
              objetivo: monto,
              moneda: state.currency,
              fecha_objetivo: null
            });
            if (r.error) throw r.error;
            return {
              ok: true,
              recargar: true,
              mensaje: `[NUEVA META CREADA - ${mascNombre.toUpperCase()}]\nHe creado la nueva meta "${candidato}" con objetivo de ${money(monto)} en ${state.currency}.`
            };
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

      // 4. Fijar Presupuesto / Límite
      const esLimite = /(limite|límite|tope|presupuesto|fijar límite|poner límite)\s+/i.test(texto);
      if (esLimite && monto && monto > 0) {
        let cat = data.categories.find(c => c.tipo === "gasto" && texto.includes(c.nombre.toLowerCase()));
        if (!cat) {
          cat = data.categories.find(c => c.tipo === "gasto" && (texto.includes("comida") || texto.includes("super") || texto.includes("ocio") || texto.includes("salida"))) || data.categories.find(c => c.tipo === "gasto");
        }
        if (!cat) throw new Error("No encontré una categoría de gasto adecuada para aplicar el límite.");

        const args = rowScope(scope);
        let ex = window._supabase.from("finanzas_presupuestos").select("id").eq("periodo", `${state.period}-01`).eq("categoria_id", cat.id);
        ex = args.grupo_id ? ex.eq("grupo_id", args.grupo_id) : ex.eq("user_id", state.userId).is("grupo_id", null);
        const found = await checked(ex.limit(1));
        const r = found.length
          ? await window._supabase.from("finanzas_presupuestos").update({ limite: monto }).eq("id", found[0].id).eq("user_id", state.userId)
          : await window._supabase.from("finanzas_presupuestos").insert({
              user_id: state.userId, grupo_id: scope === "pareja" ? state.groupId : null,
              categoria_id: cat.id, periodo: `${state.period}-01`, limite: monto
            });
        if (r.error) throw r.error;

        return {
          ok: true,
          recargar: true,
          mensaje: `[LÍMITE ESTABLECIDO - ${mascNombre.toUpperCase()}]\nHe fijado un presupuesto máximo de ${money(monto)} para la categoría "${cat.nombre}" en ${state.period}. Te avisaré cuando te acerques al tope.`
        };
      }

      // DIRECTIVAS OPERATIVAS DEL ASISTENTE DE IA AVANZADO
      const DIRECTIVAS_SISTEMA = {
        rol: "Asistente de IA avanzado, hiperanalítico y altamente competente",
        objetivo: "Proporcionar respuestas precisas, profundas, lógicas y estructuradas",
        directrices: [
          "FASE DE RAZONAMIENTO Y ANÁLISIS: Analizar internamente la intención real, desglosar problemas complejos y evaluar enfoques antes de responder.",
          "PRECISIÓN Y RIGOR TÉCNICO: Priorizar exactitud factual y calidad técnica; verificar consistencia paso a paso; cero alucinaciones.",
          "ORGANIZACIÓN Y CLARIDAD: Jerarquías visuales claras (encabezados, viñetas, negritas); ir directo al grano al inicio y desarrollar el detalle técnico después.",
          "ADAPTABILIDAD Y MEJORA CONTINUA: Calibrar profundidad técnica al tono y contexto, integrando retroalimentación inmediatamente."
        ]
      };

      // 5. Consultas Analíticas, Estratégicas y Asesoramiento Financiero Avanzado
      if (!monto || monto <= 0) {
        // Ejecución de razonamiento y desglose lógico hiperanalítico
        const rows = (data.movements || []).filter(r => (r.fecha || "").slice(0, 7) === state.period);
        const incomes = rows.filter(r => r.tipo === "ingreso");
        const expenses = rows.filter(r => r.tipo === "gasto");
        const totIncome = incomes.reduce((s, r) => s + Number(r.monto), 0);
        const totExpense = expenses.reduce((s, r) => s + Number(r.monto), 0);
        const balance = totIncome - totExpense;
        const metas = data.goals || [];
        const presupuestos = data.budgets || [];
        const items = loadInventory ? loadInventory(scope) : [];

        // Identificar categorías críticas de gasto
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
          mensaje: `### 🎯 Diagnóstico y Respuesta Ejecutiva
He analizado tu solicitud: *"${raw}"*. Para ejecutar registros contables directos requiero una cifra específica, pero he evaluado tu contexto operativo y financiero actual con rigor analítico.

---

### 📊 Desglose Analítico del Período (${state.period})
* **Flujo Neto Disponible:** ${money(balance)} ${balance >= 0 ? "*(Superávit sostenido)*" : "*(Déficit operativo)*"}
* **Razón Ingreso/Gasto:** Ingresos de ${money(totIncome)} vs Gastos de ${money(totExpense)}
* **Metas Activas:** ${metas.length} objetivos registrados (${metas.filter(m => Number(m.acumulado) >= Number(m.meta)).length} completadas)
* **Presupuestos y Límites:** ${presupuestos.length} techos presupuestarios vigentes
* **Artículos en Inventario:** ${items.length} productos registrados

${topCategorias ? `### 🔍 Categorías con Mayor Impacto de Gasto\n${topCategorias}\n` : ""}
---

### 💡 Directrices Operativas Recomendadas
1. **Acción Operativa Inmediata:**
   - Si deseas asentar una operación, indícame la cantidad y concepto: ej. *"Gasté 35 en supermercado"* o *"Cobré 450 de nómina"*.
   - Para inventario o márgenes: *"Venta de 5 tortas a 15 con costo de 6"*.
2. **Optimización Financiera:**
   - ${balance > 0 ? "Tu margen positivo actual te permite derivar excedentes hacia metas de ahorro o reinversión en stock de alta rotación." : "Se recomienda ajustar los techos presupuestarios en las categorías de mayor ponderación para restablecer el equilibrio de caja."}
3. **Precisión y Verificación:**
   - Todos los balances y cálculos reflejan exactamente los registros de la base de datos sin estimaciones ficticias.`
        };
      }

      const esIngreso = /(ingres[eéóo]|cobr[eéóo]|recib[eéíi]|gan[eéóo]|sueldo|salario|n[oó]mina|dep[oó]sito|freelance|honorarios)/i.test(texto);
      const tipo = esIngreso ? "ingreso" : "gasto";

      let categoriaId = null;
      let categoriaNombre = "";

      const catsFiltradas = data.categories.filter(c => c.tipo === tipo);
      for (const c of catsFiltradas) {
        if (texto.includes(c.nombre.toLowerCase())) {
          categoriaId = c.id;
          categoriaNombre = c.nombre;
          break;
        }
      }

      if (!categoriaId) {
        if (tipo === "gasto") {
          if (/(comida|super|supermercado|almuerzo|cena|desayuno|restaurante|cafe|café|pizza|mercado)/i.test(texto)) {
            const c = catsFiltradas.find(x => /comida/i.test(x.nombre));
            if (c) { categoriaId = c.id; categoriaNombre = c.nombre; }
          } else if (/(transporte|gasolina|uber|taxi|metro|bus|pasaje|gas)/i.test(texto)) {
            const c = catsFiltradas.find(x => /transporte/i.test(x.nombre));
            if (c) { categoriaId = c.id; categoriaNombre = c.nombre; }
          } else if (/(vivienda|alquiler|renta|luz|agua|internet|casa|hogar)/i.test(texto)) {
            const c = catsFiltradas.find(x => /vivienda/i.test(x.nombre));
            if (c) { categoriaId = c.id; categoriaNombre = c.nombre; }
          } else if (/(salud|medico|médico|farmacia|medicina|dentista)/i.test(texto)) {
            const c = catsFiltradas.find(x => /salud/i.test(x.nombre));
            if (c) { categoriaId = c.id; categoriaNombre = c.nombre; }
          } else if (/(ocio|cine|salida|juegos|fiesta|bar|viaje|diversion|diversión)/i.test(texto)) {
            const c = catsFiltradas.find(x => /ocio/i.test(x.nombre));
            if (c) { categoriaId = c.id; categoriaNombre = c.nombre; }
          }
        } else {
          const c = catsFiltradas.find(x => /ingreso/i.test(x.nombre)) || catsFiltradas[0];
          if (c) { categoriaId = c.id; categoriaNombre = c.nombre; }
        }
      }

      if (!categoriaId && catsFiltradas.length) {
        categoriaId = catsFiltradas[0].id;
        categoriaNombre = catsFiltradas[0].nombre;
      }

      let desc = raw
        .replace(/(?:gast[eéóo]|pagu[eéóo]|compr[eéóo]|ingres[eéóo]|cobr[eéóo]|recib[eéíi]|anota|registra|pon|apunta)\s+/gi, "")
        .replace(new RegExp(String(monto).replace(".", "\\."), "g"), "")
        .replace(/(?:en|de|por|un|una|el|la|los|las|dolares|dólares|euros|pesos|bolivares|bolívares|ves|usd|eur|\$|€)\s*/gi, " ")
        .trim();
      if (!desc || desc.length < 2) {
        desc = categoriaNombre || (tipo === "ingreso" ? "Ingreso automatizado" : "Gasto general");
      }
      desc = desc.charAt(0).toUpperCase() + desc.slice(1);

      const movRow = {
        user_id: state.userId,
        grupo_id: scope === "pareja" ? state.groupId : null,
        miembro_id: state.userId,
        categoria_id: categoriaId,
        tipo: tipo,
        monto: monto,
        fecha: today(),
        descripcion: desc.slice(0, 120)
      };

      const rMov = await window._supabase.from("finanzas_movimientos").insert(movRow);
      if (rMov.error) throw rMov.error;

      return {
        ok: true,
        recargar: true,
        mensaje: `[MOVIMIENTO REGISTRADO AUTOMÁTICAMENTE - ${mascNombre.toUpperCase()}]
• Operación: ${tipo === "ingreso" ? "Ingreso (+)" : "Gasto (−)"}
• Monto: ${money(monto)}
• Categoría asignada: "${categoriaNombre || "General"}"
• Concepto / Detalle: "${desc}"
• Fecha de registro: ${today()} (${scope === "pareja" ? "Compartidas" : "Personal"})

Tus balances y gráficos han sido recalculados y actualizados en tiempo real.`
      };
    }
  };
})();
