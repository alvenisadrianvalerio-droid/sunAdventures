/* ============================================================
   RECETARIO MÁGICO — SunAdventures
   Búsqueda de recetas internacionales (TheMealDB)
   con traducción automática al español (título, categoría,
   ingredientes y paso a paso) y vista interactiva.
   ============================================================ */
window._extraVistas = window._extraVistas || [];
if (!window._extraVistas.includes("recetas")) {
  window._extraVistas.push("recetas");
}

(function () {
  "use strict";

  const $ = id => document.getElementById(id);
  const cacheRecetas = new Map();
  const cacheTraduccion = new Map();

  // Diccionario básico de categorías en español (limpio sin emojis)
  const CATEGORIAS_ES = {
    "Beef": "Carne de Res",
    "Chicken": "Pollo",
    "Dessert": "Postres",
    "Pasta": "Pastas",
    "Pork": "Cerdo",
    "Seafood": "Mariscos",
    "Side": "Guarniciones",
    "Starter": "Entradas",
    "Vegan": "Vegano",
    "Vegetarian": "Vegetariano",
    "Breakfast": "Desayunos",
    "Miscellaneous": "Variados",
    "Lamb": "Cordero",
    "Goat": "Chivo"
  };

  // Caché de SVGs para evitar recalcular strings
  const SVG_ICONS = {
    chicken: `<svg class="receta-tag-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15.5 13a4.5 4.5 0 0 0-4.5-4.5 4.5 4.5 0 0 0-4.5 4.5c0 2 1.5 3.5 3.5 4l-4 4a1.5 1.5 0 0 0 2 2l4-4c.5 2 2 3.5 4 3.5a4.5 4.5 0 0 0 4.5-4.5 4.5 4.5 0 0 0-5-5z"/></svg>`,
    pasta: `<svg class="receta-tag-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 13h18c0 4-3.5 8-9 8s-9-4-9-8z"/><path d="M12 5v5M8 6c0 2.5 1 4 1 4M16 6c0 2.5-1 4-1 4"/></svg>`,
    meat: `<svg class="receta-tag-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 10a5 5 0 0 0-5-5H8a5 5 0 0 0-5 5c0 3 2 6 6 7l2 3h2l2-3c4-1 6-4 6-7z"/><circle cx="8.5" cy="10" r="1.5" fill="currentColor"/></svg>`,
    seafood: `<svg class="receta-tag-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12c4-6 12-6 16 0-4 6-12 6-16 0z"/><circle cx="16" cy="12" r="1" fill="currentColor"/><path d="M2 10l2 2-2 2M20 12l2-2v4l-2-2z"/></svg>`,
    dessert: `<svg class="receta-tag-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20h18v-6l-9-4-9 4v6z"/><path d="M3 14c3 0 3 2 6 2s3-2 6-2 3 2 6 2"/><circle cx="12" cy="7" r="2" fill="currentColor"/></svg>`,
    veg: `<svg class="receta-tag-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21a9 9 0 0 0 9-9c0-5-4-9-9-9S3 7 3 12a9 9 0 0 0 9 9z"/><path d="M12 3v18M3 12c4.5-1 9 1 18 0"/></svg>`,
    breakfast: `<svg class="receta-tag-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="14" rx="9" ry="6"/><ellipse cx="12" cy="10" rx="7.5" ry="4.5"/><ellipse cx="12" cy="7" rx="6" ry="3"/></svg>`,
    generic: `<svg class="receta-tag-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>`
  };

  function getCategoriaIcon(cat) {
    const c = (cat || "").toLowerCase();
    if (c.includes("chicken") || c.includes("pollo")) return SVG_ICONS.chicken;
    if (c.includes("pasta")) return SVG_ICONS.pasta;
    if (c.includes("beef") || c.includes("carne") || c.includes("pork") || c.includes("lamb")) return SVG_ICONS.meat;
    if (c.includes("seafood") || c.includes("marisco")) return SVG_ICONS.seafood;
    if (c.includes("dessert") || c.includes("postre")) return SVG_ICONS.dessert;
    if (c.includes("veg")) return SVG_ICONS.veg;
    if (c.includes("breakfast") || c.includes("desayuno")) return SVG_ICONS.breakfast;
    return SVG_ICONS.generic;
  }

  // Traducción eficiente con caché persistente y manejo de timeouts
  async function traducir(txt, sl = "auto", tl = "es") {
    if (!txt || typeof txt !== "string") return txt;
    const limpio = txt.trim();
    if (!limpio || limpio.length < 2) return txt;
    const cacheKey = `${sl}_${tl}_${limpio}`;
    if (cacheTraduccion.has(cacheKey)) return cacheTraduccion.get(cacheKey);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(limpio)}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        const traducido = (data[0] || []).map(s => s[0]).join("").trim();
        if (traducido) {
          cacheTraduccion.set(cacheKey, traducido);
          return traducido;
        }
      }
    } catch (e) {
      // Si falla o da timeout, retornamos el texto original sin bloquear la interfaz
    }
    return limpio;
  }

  // Estado de recetas activas para paginación progresiva optimizada
  let listaRecetasActiva = [];
  let paginaRecetas = 1;
  const TAM_PAGINA = 12; // Tamaño óptimo para evitar sobrecarga del DOM en gama baja
  let busquedaIdActual = 0;

  function actualizarBarraRecetas(totalVisible, totalGeneral, origen = "") {
    const contador = $("recetas-contador");
    const paginacion = $("recetas-paginacion");
    const btnMasText = $("recetas-btn-mas-text");

    if (contador) {
      if (!totalGeneral) {
        contador.innerHTML = `Sin resultados`;
      } else {
        const textoOrigen = origen ? ` de <strong>${origen}</strong>` : "";
        contador.innerHTML = `Mostrando <strong>${totalVisible}</strong> de <strong>${totalGeneral}</strong> recetas${textoOrigen}`;
      }
    }

    if (paginacion) {
      if (totalVisible < totalGeneral) {
        paginacion.classList.remove("hidden");
        if (btnMasText) {
          const restantes = totalGeneral - totalVisible;
          const siguientes = Math.min(TAM_PAGINA, restantes);
          btnMasText.textContent = `Cargar más recetas (${siguientes} más de ${restantes})`;
        }
      } else {
        paginacion.classList.add("hidden");
      }
    }
  }

  // Recetas asiáticas e internacionales artesanales completas y de alta calidad
  const RECETAS_ASIATICAS_EXTRA = [
    {
      idMeal: "asian_ramen_tonkotsu",
      strMeal: "Tonkotsu Ramen Tradicional",
      strCategory: "Pork",
      strArea: "Japanese",
      strMealThumb: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80",
      strInstructions: "1. Hervir los fideos ramen frescos en agua hirviendo durante 2 minutos hasta que estén al dente y escurrir.\n2. En un tazón hondo, mezclar el caldo concentrado de huesos de cerdo (tonkotsu caliente), la base de salsa tare de soya y un chorrito de aceite de ajo tostado y sésamo.\n3. Incorporar los fideos al caldo caliente doblando suavemente.\n4. Coronar con rebanadas de panceta de cerdo chashu marinada, medio huevo ajitsuke marinado a baja temperatura con yema cremosa, brotes de bambú sazonados (menma) y cebollín fresco picado.\n5. Agregar un alga nori crujiente en el lateral y servir humeante al instante.",
      strIngredient1: "Fideos Ramen Frescos", strMeasure1: "200g",
      strIngredient2: "Caldo Tonkotsu de Cerdo", strMeasure2: "450ml",
      strIngredient3: "Panceta de Cerdo Chashu", strMeasure3: "3 rebanadas",
      strIngredient4: "Huevo Ajitsuke Marinado", strMeasure4: "1 unidad",
      strIngredient5: "Cebollín fresco", strMeasure5: "2 cdas picadas",
      strIngredient6: "Brotes de Bambú (Menma)", strMeasure6: "30g",
      strIngredient7: "Alga Nori", strMeasure7: "1 lámina",
      strIngredient8: "Aceite de Sésamo y Ajo", strMeasure8: "1 cdta"
    },
    {
      idMeal: "asian_sushi_salmon_nigiri",
      strMeal: "Nigiri & Maki Sushi Variado",
      strCategory: "Seafood",
      strArea: "Japanese",
      strMealThumb: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80",
      strInstructions: "1. Lavar el arroz de grano corto japonés hasta que el agua salga clara y cocinarlo al vapor.\n2. Enfriar el arroz suavemente mientras se abanica mezclando con vinagre de arroz sazonado con azúcar y sal marina (shari).\n3. Cortar el lomo de salmón fresco calidad sashimi y atún rojo en láminas oblicuas uniformes de 5mm.\n4. Formar pequeñas porciones cilíndricas de arroz con las manos humedecidas, colocar un toque sutil de wasabi y montar el pescado presionando delicadamente.\n5. Para los makis, colocar arroz sobre media hoja de alga nori, rellenar con aguacate y salmón, enrollar con la esterilla de bambú (makisu) y cortar en 6 bocados.\n6. Degustar con salsa de soya japonesa y jengibre encurtido (gari).",
      strIngredient1: "Arroz de Sushi Japonés", strMeasure1: "300g",
      strIngredient2: "Salmón Fresco Sashimi", strMeasure2: "180g",
      strIngredient3: "Atún Rojo", strMeasure3: "150g",
      strIngredient4: "Vinagre de Arroz", strMeasure4: "3 cdas",
      strIngredient5: "Alga Nori", strMeasure5: "3 láminas",
      strIngredient6: "Aguacate Maduro", strMeasure6: "1 unidad",
      strIngredient7: "Wasabi & Salsa de Soya", strMeasure7: "Al gusto",
      strIngredient8: "Jengibre Gari Encurtido", strMeasure8: "30g"
    },
    {
      idMeal: "asian_gyozas_artesanales",
      strMeal: "Gyozas Crujientes al Sartén",
      strCategory: "Pork",
      strArea: "Japanese",
      strMealThumb: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&auto=format&fit=crop&q=80",
      strInstructions: "1. En un bowl, mezclar la carne molida de cerdo con repollo finamente picado y escurrido, ajo rallado, jengibre fresco, salsa de soya, aceite de sésamo y una pizca de sal.\n2. Colocar una cucharadita de relleno en el centro de cada disco de masa para gyoza.\n3. Humedecer los bordes con agua y doblar pellizcando hacia un lado formando 5 a 6 pliegues tradicionales (pleats) para sellar herméticamente.\n4. Calentar aceite vegetal en una sartén antiadherente a fuego medio y dorar la base de las empanadillas durante 2 minutos hasta que estén bien doradas y crujientes.\n5. Verter 60ml de agua caliente en la sartén, tapar de inmediato y cocinar al vapor durante 4 minutos.\n6. Destapar para evaporar el líquido restante, rociar unas gotas de aceite de sésamo para un dorado final y servir con dip de salsa de soya y vinagre de arroz.",
      strIngredient1: "Carne Molida de Cerdo", strMeasure1: "250g",
      strIngredient2: "Discos de Masa para Gyoza", strMeasure2: "20 unidades",
      strIngredient3: "Repollo Col China", strMeasure3: "150g picado",
      strIngredient4: "Ajo y Jengibre Rallados", strMeasure4: "1 cda de cada uno",
      strIngredient5: "Salsa de Soya", strMeasure5: "1.5 cdas",
      strIngredient6: "Aceite de Sésamo Tostado", strMeasure6: "1 cda",
      strIngredient7: "Cebollino", strMeasure7: "2 cdas picadas"
    },
    {
      idMeal: "asian_korean_bibimbap",
      strMeal: "Bibimbap Coreano en Tazón de Piedra",
      strCategory: "Beef",
      strArea: "Korean",
      strMealThumb: "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=600&auto=format&fit=crop&q=80",
      strInstructions: "1. Saltear individualmente en aceite de sésamo las verduras: espinacas marinadas (namul), zanahorias en juliana fina, calabacín y setas shiitake sazonadas con ajo y sal.\n2. Saltear la carne de res marinada en soya, azúcar morena, ajo y aceite de sésamo hasta caramelizar.\n3. En un tazón de piedra caliente (dolsot) o tazón amplio, untar aceite de sésamo en el fondo y colocar una cama generosa de arroz blanco al vapor.\n4. Distribuir las verduras salteadas y la carne en secciones coloridas sobre el arroz.\n5. Colocar en el centro un huevo frito con la yema tierna.\n6. Servir con salsa gochujang dulce-picante (gochujang, miel, aceite de sésamo y agua) y mezclar vigorosamente todo el tazón antes de comer.",
      strIngredient1: "Arroz Blanco Cocido", strMeasure1: "2 tazas",
      strIngredient2: "Carne de Res Marinada", strMeasure2: "180g",
      strIngredient3: "Espinacas Frescas", strMeasure3: "100g",
      strIngredient4: "Zanahoria & Calabacín", strMeasure4: "1 taza en juliana",
      strIngredient5: "Setas Shiitake", strMeasure5: "80g en láminas",
      strIngredient6: "Pasta Gochujang", strMeasure6: "2 cdas",
      strIngredient7: "Huevo", strMeasure7: "1 unidad",
      strIngredient8: "Semillas de Sésamo Tostadas", strMeasure8: "1 cdta"
    },
    {
      idMeal: "asian_pad_thai_shrimp",
      strMeal: "Pad Thai Tradicional con Camarones",
      strCategory: "Seafood",
      strArea: "Thai",
      strMealThumb: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop&q=80",
      strInstructions: "1. Remojar los fideos planos de arroz en agua tibia durante 20 minutos hasta que estén flexibles.\n2. En un wok a fuego alto con aceite, dorar los camarones durante 2 minutos y reservar.\n3. Saltear dados de tofu firme con ajo picado y chalota.\n4. Empujar los ingredientes a un lado del wok, cascar un huevo y revolver rápidamente hasta cuajar.\n5. Añadir los fideos de arroz escurridos y la salsa Pad Thai casera (pasta de tamarindo, salsa de pescado, azúcar de palma y un toque de chile).\n6. Saltear a fuego vivo integrando todo durante 2 minutos; incorporar brotes de soya y cebollino chino.\n7. Servir caliente espolvoreado con cacahuates tostados triturados y cuartos de lima fresca.",
      strIngredient1: "Fideos Planos de Arroz", strMeasure1: "200g",
      strIngredient2: "Camarones Limpios", strMeasure2: "12 unidades",
      strIngredient3: "Tofu Firme", strMeasure3: "100g en cubos",
      strIngredient4: "Pasta de Tamarindo", strMeasure4: "2 cdas",
      strIngredient5: "Salsa de Pescado", strMeasure5: "2 cdas",
      strIngredient6: "Huevo", strMeasure6: "2 unidades",
      strIngredient7: "Brotes de Soya (Frijol Mungo)", strMeasure7: "1 taza",
      strIngredient8: "Cacahuates Tostados Picados", strMeasure8: "3 cdas",
      strIngredient9: "Lima", strMeasure9: "1 unidad"
    },
    {
      idMeal: "asian_kimchi_jjigae",
      strMeal: "Kimchi Jjigae Estofado Picante",
      strCategory: "Pork",
      strArea: "Korean",
      strMealThumb: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=80",
      strInstructions: "1. En una cazuela de barro, saltear panceta de cerdo en trozos con kimchi fermentado y cebolla durante 5 minutos en aceite de sésamo.\n2. Añadir caldo de anchoas o caldo de verduras, salsa gochujang, polvo de chile coreano (gochugaru), ajo picado y un chorrito de jugo de kimchi.\n3. Llevar a ebullición a fuego alto, luego bajar a fuego medio y cocinar a fuego lento durante 15 minutos para que los sabores se concentren.\n4. Agregar rebanadas gruesas de tofu suave y cebollín en rodajas por encima.\n5. Cocinar 5 minutos más hasta que el tofu absorba el caldo picante.\n6. Servir hirviendo en la mesa acompañado de un bol de arroz blanco recién hecho.",
      strIngredient1: "Kimchi Bien Fermentado", strMeasure1: "300g",
      strIngredient2: "Panceta de Cerdo", strMeasure2: "200g",
      strIngredient3: "Tofu Suave", strMeasure3: "250g en rebanadas",
      strIngredient4: "Caldo de Verduras o Anchoas", strMeasure4: "500ml",
      strIngredient5: "Chile Coreano Gochugaru", strMeasure5: "1.5 cdas",
      strIngredient6: "Pasta Gochujang", strMeasure6: "1 cda",
      strIngredient7: "Ajo Picado", strMeasure7: "1 cda",
      strIngredient8: "Cebollín fresco", strMeasure8: "2 tallos"
    },
    {
      idMeal: "asian_chicken_katsu_curry",
      strMeal: "Pollo Katsu Curry Japonés",
      strCategory: "Chicken",
      strArea: "Japanese",
      strMealThumb: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80",
      strInstructions: "1. En una cacerola, dorar cebolla en juliana hasta caramelizar. Agregar zanahorias y papas en cubos con 600ml de agua o caldo, y cocinar hasta tiernas.\n2. Retirar del fuego, disolver los cubos de curry japonés roux, volver al fuego bajo y espesar durante 5 minutos removiendo constantemente.\n3. Golpear las pechugas de pollo suavemente para emparejar el grosor, sazonar con sal y pimienta.\n4. Pasar el pollo por harina, huevo batido y empanizar abundantemente con panko japonés crujiente.\n5. Freír en abundante aceite a 175°C durante 4 a 5 minutos por lado hasta obtener un dorado dorado perfecto y crujiente. Escurrir y cortar en tiras gruesas.\n6. Servir en un plato amplio con una porción de arroz blanco, colocar el pollo crujiente al lado y bañar con el curry caliente.",
      strIngredient1: "Pechuga de Pollo", strMeasure1: "2 filetes gruesos",
      strIngredient2: "Pan Rallado Japonés Panko", strMeasure2: "1.5 tazas",
      strIngredient3: "Cubos de Curry Japonés Roux", strMeasure3: "3 cubos (75g)",
      strIngredient4: "Papas y Zanahorias", strMeasure4: "2 de cada una",
      strIngredient5: "Cebolla Amarilla", strMeasure5: "1 grande",
      strIngredient6: "Arroz Blanco Cocido", strMeasure6: "2 porciones",
      strIngredient7: "Huevo y Harina", strMeasure7: "Para empanizar",
      strIngredient8: "Aceite para freír", strMeasure8: "Cantidad necesaria"
    },
    {
      idMeal: "asian_tom_yum_goong",
      strMeal: "Sopa Tailandesa Tom Yum Goong",
      strCategory: "Seafood",
      strArea: "Thai",
      strMealThumb: "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=600&auto=format&fit=crop&q=80",
      strInstructions: "1. En una olla, calentar caldo de pollo o camarón e infusionar con tallos de limoncillo (lemongrass) machacados, rodajas de galanga fresca y hojas de lima kaffir rotas durante 6 minutos.\n2. Agregar pasta de chile tailandés (nam prik pao) y setas ostra o champiñones.\n3. Incorporar los camarones limpios y cocinar a fuego medio durante 3 minutos hasta que tomen color rosado.\n4. Retirar del fuego y sazonar inmediatamente con zumo de lima recién exprimido, salsa de pescado y chiles tailandeses triturados al gusto.\n5. Decorar con hojas de cilantro fresco y servir bien caliente con su inigualable equilibrio cítrico, aromático y picante.",
      strIngredient1: "Camarones Frescos", strMeasure1: "300g",
      strIngredient2: "Caldo de Pollo o Camarón", strMeasure2: "700ml",
      strIngredient3: "Limoncillo (Lemongrass)", strMeasure3: "2 tallos",
      strIngredient4: "Galanga o Jengibre", strMeasure4: "4 rodajas",
      strIngredient5: "Hojas de Lima Kaffir", strMeasure5: "4 hojas",
      strIngredient6: "Salsa de Pescado", strMeasure6: "2 cdas",
      strIngredient7: "Zumo de Lima", strMeasure7: "3 cdas",
      strIngredient8: "Champiñones o Setas Ostra", strMeasure8: "120g",
      strIngredient9: "Cilantro Fresco", strMeasure9: "Un manojo"
    },
    {
      idMeal: "asian_dim_sum_baozi",
      strMeal: "Baozi Panecillos Chinos al Vapor",
      strCategory: "Pork",
      strArea: "Chinese",
      strMealThumb: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80",
      strInstructions: "1. Preparar la masa suave de levadura con harina de trigo, agua tibia, levadura seca y una pizca de azúcar; amasar 10 minutos y dejar fermentar 1 hora.\n2. Mezclar el relleno con carne picada de cerdo, cebollín chino, salsa de ostras, salsa de soya, aceite de sésamo y jengibre.\n3. Dividir la masa en bolitas, aplanar en discos dejando el centro más grueso que los bordes.\n4. Colocar una cucharada de relleno en el centro y sellar haciendo pliegues circulares hacia arriba pellizcando la cúspide.\n5. Colocar cada bao sobre un cuadrito de papel vegetal en la vaporera de bambú.\n6. Cocinar al vapor a fuego alto con agua hirviendo durante 15 minutos sin abrir la tapa.\n7. Dejar reposar 2 minutos antes de destapar y disfrutar tiernos, esponjosos y jugosos.",
      strIngredient1: "Harina de Trigo Suave", strMeasure1: "350g",
      strIngredient2: "Levadura Seca", strMeasure2: "5g",
      strIngredient3: "Carne Picada de Cerdo", strMeasure3: "250g",
      strIngredient4: "Salsa de Ostras", strMeasure4: "1.5 cdas",
      strIngredient5: "Salsa de Soya", strMeasure5: "1 cda",
      strIngredient6: "Aceite de Sésamo", strMeasure6: "1 cdta",
      strIngredient7: "Jengibre y Cebollino", strMeasure7: "2 cdas picadas"
    },
    {
      idMeal: "asian_matcha_mochi",
      strMeal: "Mochi Artesanal de Té Matcha",
      strCategory: "Dessert",
      strArea: "Japanese",
      strMealThumb: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop&q=80",
      strInstructions: "1. En un bowl resistente al calor, mezclar harina de arroz glutinoso (mochiko o shiratamako), azúcar, polvo de té verde matcha puro y agua hasta obtener una masa homogénea y sedosa.\n2. Cubrir con film plástico y cocinar en microondas durante 2 minutos a potencia media, remover con espátula mojada y cocinar 1 minuto más hasta que quede brillante y elástica.\n3. Espolvorear abundante fécula de maíz (maicena) en una superficie limpia y volcar la masa caliente.\n4. Extender con un rodillo espolvoreado y dejar enfriar ligeramente.\n5. Cortar círculos, rellenar el centro con bolitas de pasta dulce de judía roja (anko) o fresa fresca, y cerrar uniendo los extremos pellizcando firmemente.\n6. Espolvorear un toque de polvo de matcha por encima y servir a temperatura ambiente.",
      strIngredient1: "Harina de Arroz Glutinoso (Mochiko)", strMeasure1: "150g",
      strIngredient2: "Polvo de Té Verde Matcha", strMeasure2: "1.5 cdas",
      strIngredient3: "Azúcar", strMeasure3: "60g",
      strIngredient4: "Agua", strMeasure4: "180ml",
      strIngredient5: "Pasta de Judía Roja Dulce (Anko)", strMeasure5: "150g",
      strIngredient6: "Fécula de Maíz (Maicena)", strMeasure6: "Para espolvorear"
    }
  ];

  // Buscar recetas con caché (con soporte extendido para recetas asiáticas del mundo)
  async function buscarRecetas(query) {
    const q = (query || "").trim();
    if (!q) return [];

    let qEn = q;
    try {
      qEn = await traducir(q, "es", "en");
    } catch {}

    const cacheKey = `multisearch_${qEn.toLowerCase()}`;
    if (cacheRecetas.has(cacheKey)) return cacheRecetas.get(cacheKey);

    try {
      const qClean = qEn.toLowerCase();
      const qOrig = q.toLowerCase();

      // Consultas paralelas en TheMealDB (búsqueda por nombre, ingrediente, categoría y área)
      const promesas = [
        fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(qClean)}`).then(r => r.ok ? r.json() : {}).catch(() => ({})),
        fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(qClean.replace(/\s+/g, "_"))}`).then(r => r.ok ? r.json() : {}).catch(() => ({})),
        fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(qClean)}`).then(r => r.ok ? r.json() : {}).catch(() => ({})),
        fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(qClean)}`).then(r => r.ok ? r.json() : {}).catch(() => ({}))
      ];

      // Si busca asiático u oriental, expandir automáticamente con cocinas asiáticas clave
      if (qOrig.includes("asiat") || qOrig.includes("asian") || qOrig.includes("orient") || qOrig.includes("japon") || qOrig.includes("chin") || qOrig.includes("corean") || qOrig.includes("thai")) {
        const areasExtra = ["Japanese", "Chinese", "Thai", "Vietnamese", "Filipino", "Malaysian"];
        areasExtra.forEach(a => {
          promesas.push(
            fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${a}`).then(r => r.ok ? r.json() : {}).catch(() => ({}))
          );
        });
      }

      const resultados = await Promise.all(promesas);
      const mapa = new Map();

      // Integrar recetas asiáticas locales que coincidan con la búsqueda
      RECETAS_ASIATICAS_EXTRA.forEach(m => {
        const textoMatch = `${m.strMeal} ${m.strCategory} ${m.strArea} ${m.strInstructions}`.toLowerCase();
        if (
          qOrig.includes("asiat") || qOrig.includes("asian") || qOrig.includes("orient") ||
          textoMatch.includes(qOrig) || textoMatch.includes(qClean) ||
          (qOrig.includes("ramen") && m.strMeal.toLowerCase().includes("ramen")) ||
          (qOrig.includes("sushi") && m.strMeal.toLowerCase().includes("sushi")) ||
          (qOrig.includes("gyoza") && m.strMeal.toLowerCase().includes("gyoza")) ||
          (qOrig.includes("arroz") && textoMatch.includes("arroz")) ||
          (qOrig.includes("pollo") && m.strCategory.toLowerCase().includes("chicken")) ||
          (qOrig.includes("carne") && m.strCategory.toLowerCase().includes("beef")) ||
          (qOrig.includes("marisco") && m.strCategory.toLowerCase().includes("seafood"))
        ) {
          mapa.set(m.idMeal, m);
        }
      });

      // Integrar resultados remotos de TheMealDB
      resultados.forEach(res => {
        (res.meals || []).forEach(m => {
          if (!mapa.has(m.idMeal)) mapa.set(m.idMeal, m);
        });
      });

      const meals = Array.from(mapa.values());
      cacheRecetas.set(cacheKey, meals);
      return meals;
    } catch (e) {
      console.warn("[Recetas] Error en búsqueda:", e);
    }
    return [];
  }

  // Filtrar por categoría o región (soporta categorías estándar y cocinas asiáticas completas)
  async function buscarPorCategoria(cat) {
    const cacheKey = `cat_${cat}`;
    if (cacheRecetas.has(cacheKey)) return cacheRecetas.get(cacheKey);

    try {
      const mapa = new Map();

      // Caso especial: Categoría Asiática General
      if (cat === "Asian" || cat === "Asiática") {
        // Añadir todas nuestras recetas asiáticas artesanales destacadas
        RECETAS_ASIATICAS_EXTRA.forEach(m => mapa.set(m.idMeal, m));

        // Consultar múltiples regiones asiáticas en TheMealDB en paralelo
        const areas = ["Japanese", "Chinese", "Thai", "Vietnamese", "Filipino", "Malaysian"];
        const resAreas = await Promise.all(
          areas.map(a => fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${a}`).then(r => r.ok ? r.json() : {}).catch(() => ({})))
        );
        resAreas.forEach((data, idx) => {
          (data.meals || []).forEach(m => {
            if (!mapa.has(m.idMeal)) {
              mapa.set(m.idMeal, { ...m, strArea: areas[idx] });
            }
          });
        });

        const meals = Array.from(mapa.values());
        cacheRecetas.set(cacheKey, meals);
        return meals;
      }

      // Caso especial: Regiones específicas (Japanese, Chinese, etc.)
      if (["Japanese", "Chinese", "Thai", "Vietnamese", "Korean"].includes(cat)) {
        RECETAS_ASIATICAS_EXTRA.filter(m => m.strArea === cat).forEach(m => mapa.set(m.idMeal, m));
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(cat)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          (data.meals || []).forEach(m => {
            if (!mapa.has(m.idMeal)) mapa.set(m.idMeal, { ...m, strArea: cat });
          });
        }
        const meals = Array.from(mapa.values());
        cacheRecetas.set(cacheKey, meals);
        return meals;
      }

      // Categorías estándar por ingrediente/estilo
      RECETAS_ASIATICAS_EXTRA.filter(m => m.strCategory === cat).forEach(m => mapa.set(m.idMeal, m));
      const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(cat)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        (data.meals || []).forEach(m => {
          if (!mapa.has(m.idMeal)) mapa.set(m.idMeal, { ...m, strCategory: cat });
        });
      }

      const meals = Array.from(mapa.values());
      cacheRecetas.set(cacheKey, meals);
      return meals;
    } catch (e) {
      console.warn("[Recetas] Error por categoría:", e);
    }
    return [];
  }

  // Diccionario básico de ingredientes comunes (Español -> Inglés TheMealDB)
  const DICCIONARIO_INGREDIENTES_ES_EN = {
    "pollo": "chicken", "pechuga de pollo": "chicken breast", "muslo de pollo": "chicken thighs",
    "huevo": "egg", "huevos": "eggs",
    "arroz": "rice", "arroz jazmin": "jasmine rice", "arroz basmati": "basmati rice",
    "carne": "beef", "carne de res": "beef", "res": "beef", "ternera": "beef",
    "cerdo": "pork", "tocino": "bacon", "panceta": "bacon", "jamon": "ham",
    "tomate": "tomato", "tomates": "tomatoes",
    "cebolla": "onion", "cebollas": "onions", "cebolla morada": "red onion", "cebollin": "spring onions",
    "ajo": "garlic", "dientes de ajo": "garlic",
    "papa": "potatoes", "papas": "potatoes", "patata": "potatoes", "patatas": "potatoes",
    "zanahoria": "carrots", "zanahorias": "carrots",
    "queso": "cheese", "queso parmesano": "parmesan", "queso mozzarella": "mozzarella",
    "pasta": "pasta", "espagueti": "spaghetti", "fideos": "noodles",
    "leche": "milk", "mantequilla": "butter", "crema": "cream",
    "harina": "flour", "azucar": "sugar", "sal": "salt", "pimienta": "pepper",
    "aceite": "olive oil", "aceite de oliva": "olive oil", "aceite de sesamo": "sesame oil",
    "limon": "lemon", "lima": "lime",
    "pescado": "salmon", "salmon": "salmon", "atun": "tuna", "camaron": "prawns", "camarones": "prawns", "mariscos": "seafood",
    "champinon": "mushrooms", "champinones": "mushrooms", "setas": "mushrooms",
    "espinaca": "spinach", "espinacas": "spinach",
    "salsa de soja": "soy sauce", "soja": "soy sauce", "soya": "soy sauce",
    "jengibre": "ginger", "aguacate": "avocado", "palta": "avocado",
    "pan": "bread", "chocolate": "chocolate", "vainilla": "vanilla",
    "chile": "chilli", "picante": "chilli"
  };

  // Normalizar cadena para comparación flexible (sin acentos ni mayúsculas)
  function normalizarTexto(txt) {
    return (txt || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  // Traducir o normalizar ingrediente ingresado a término de búsqueda en TheMealDB
  async function normalizarIngredienteABusqueda(ingrediente) {
    const raw = normalizarTexto(ingrediente);
    if (!raw) return "";
    if (DICCIONARIO_INGREDIENTES_ES_EN[raw]) {
      return DICCIONARIO_INGREDIENTES_ES_EN[raw];
    }
    for (const [es, en] of Object.entries(DICCIONARIO_INGREDIENTES_ES_EN)) {
      if (raw.includes(es) || es.includes(raw)) return en;
    }
    try {
      const en = await traducir(raw, "es", "en");
      return normalizarTexto(en);
    } catch {
      return raw;
    }
  }

  // Buscar recetas a partir de una lista de ingredientes que el usuario tiene en casa
  async function buscarRecetasPorIngredientes(listaIngredientesUsuario) {
    if (!listaIngredientesUsuario || !listaIngredientesUsuario.length) return [];

    const normUsuario = listaIngredientesUsuario.map(i => normalizarTexto(i)).filter(Boolean);
    if (!normUsuario.length) return [];

    // Mapear cada ingrediente a su equivalente en inglés
    const terminosBusqueda = await Promise.all(normUsuario.map(i => normalizarIngredienteABusqueda(i)));
    const terminosUnicos = Array.from(new Set(terminosBusqueda.filter(Boolean)));

    const mapaCandidatos = new Map();

    // 1. Integrar recetas asiáticas locales que contengan alguno de los ingredientes del usuario
    RECETAS_ASIATICAS_EXTRA.forEach(m => {
      const ingsMeal = extraerIngredientes(m).map(i => normalizarTexto(i.nombre));
      const tieneAlguno = normUsuario.some(u => ingsMeal.some(im => im.includes(u) || u.includes(im)));
      if (tieneAlguno) {
        mapaCandidatos.set(m.idMeal, m);
      }
    });

    // 2. Consultar en TheMealDB por cada ingrediente principal en paralelo (con límite para cuidar red)
    const topTerminos = terminosUnicos.slice(0, 5);
    const peticiones = topTerminos.map(t =>
      fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(t.replace(/\s+/g, "_"))}`)
        .then(r => r.ok ? r.json() : {})
        .catch(() => ({}))
    );

    const resultados = await Promise.all(peticiones);
    resultados.forEach(res => {
      (res.meals || []).forEach(m => {
        if (!mapaCandidatos.has(m.idMeal)) {
          mapaCandidatos.set(m.idMeal, m);
        }
      });
    });

    // 3. Tomar candidatos y enriquecer con su detalle completo (hasta 30 recetas para fluidez óptima)
    const listaCandidatos = Array.from(mapaCandidatos.values()).slice(0, 30);
    const recetasDetalladas = await Promise.all(
      listaCandidatos.map(async m => {
        if (m.strInstructions && m.strIngredient1) return m; // Ya tiene detalle
        const detalle = await obtenerDetalle(m.idMeal);
        return detalle || m;
      })
    );

    // 4. Analizar coincidencia de ingredientes: los que tengo vs los que me faltarían
    const evaluadas = [];

    for (const meal of recetasDetalladas) {
      if (!meal) continue;
      const ingredientesReceta = extraerIngredientes(meal);
      if (!ingredientesReceta.length) continue;

      const tengo = [];
      const faltan = [];

      ingredientesReceta.forEach(ing => {
        const ingNorm = normalizarTexto(ing.nombre);
        // Comprobar coincidencia con cualquiera de los ingredientes del usuario (español o inglés)
        const coincide = normUsuario.some(u => ingNorm.includes(u) || u.includes(ingNorm)) ||
                         terminosUnicos.some(t => ingNorm.includes(t) || t.includes(ingNorm));

        if (coincide) {
          tengo.push(ing.nombre);
        } else {
          faltan.push(ing.nombre);
        }
      });

      // Si tiene al menos 1 ingrediente de los que pidió, calcular ratio y puntaje
      if (tengo.length > 0) {
        const total = ingredientesReceta.length;
        const pct = Math.round((tengo.length / total) * 100);

        evaluadas.push({
          ...meal,
          _pantryMatch: {
            tengo,
            faltan,
            total,
            pct
          }
        });
      }
    }

    // 5. Ordenar por:
    // a) Mayor cantidad de ingredientes que tengo
    // b) Mayor porcentaje de completitud
    evaluadas.sort((a, b) => {
      const pmA = a._pantryMatch;
      const pmB = b._pantryMatch;
      if (pmB.tengo.length !== pmA.tengo.length) {
        return pmB.tengo.length - pmA.tengo.length;
      }
      return pmB.pct - pmA.pct;
    });

    return evaluadas;
  }

  // Receta aleatoria (incluye recetas de TheMealDB y recetas asiáticas)
  async function recetaAleatoria() {
    try {
      if (Math.random() > 0.4 && RECETAS_ASIATICAS_EXTRA.length) {
        const idx = Math.floor(Math.random() * RECETAS_ASIATICAS_EXTRA.length);
        return RECETAS_ASIATICAS_EXTRA[idx];
      }
      const url = "https://www.themealdb.com/api/json/v1/1/random.php";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return data.meals?.[0] || null;
      }
    } catch (e) {
      console.warn("[Recetas] Error en receta aleatoria:", e);
    }
    return null;
  }

  // Obtener detalle completo de receta por ID
  async function obtenerDetalle(idMeal) {
    // Si es una receta artesanal local, retornarla directamente
    const local = RECETAS_ASIATICAS_EXTRA.find(m => m.idMeal === idMeal);
    if (local) return local;

    const cacheKey = `detail_${idMeal}`;
    if (cacheRecetas.has(cacheKey)) return cacheRecetas.get(cacheKey);

    try {
      const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(idMeal)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const meal = data.meals?.[0] || null;
        if (meal) {
          cacheRecetas.set(cacheKey, meal);
          return meal;
        }
      }
    } catch (e) {
      console.warn("[Recetas] Error en detalle:", e);
    }
    return null;
  }

  // Extraer lista de ingredientes con cantidades
  function extraerIngredientes(meal) {
    const ings = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ing && ing.trim()) {
        ings.push({
          nombre: ing.trim(),
          medida: (measure || "").trim()
        });
      }
    }
    return ings;
  }

  // Dividir instrucciones en pasos limpios
  function dividirEnPasos(instrucciones) {
    if (!instrucciones) return [];
    const partes = instrucciones
      .split(/\r?\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 5);

    if (partes.length >= 2) {
      return partes.map(p => p.replace(/^(step\s*\d+[:.]?|\d+[\.\)-]\s*)/i, "").trim());
    }

    const porPuntos = instrucciones.split(/\.\s+(?=[A-ZÁÉÍÓÚ])/).map(p => p.trim()).filter(p => p.length > 10);
    return porPuntos.length ? porPuntos : [instrucciones];
  }

  // Plantilla HTML de tarjeta optimizada con dimensiones explícitas y decode async sin alterar calidad
  function generarTarjetaHTML(m) {
    const imgUrl = m.strMealThumb || "";
    
    // Si viene de búsqueda por despensa/ingredientes, generar badge de match y desglose
    let pantryHtml = "";
    if (m._pantryMatch) {
      const pm = m._pantryMatch;
      const esTotal = pm.pct >= 85;
      const clasePill = esTotal ? "total" : "parcial";
      const claseBarra = esTotal ? "" : "parcial";
      
      const tengoStr = pm.tengo.length ? pm.tengo.slice(0, 4).join(", ") + (pm.tengo.length > 4 ? ` +${pm.tengo.length - 4}` : "") : "";
      const faltanStr = pm.faltan.length ? pm.faltan.slice(0, 3).join(", ") + (pm.faltan.length > 3 ? ` +${pm.faltan.length - 3}` : "") : "";

      pantryHtml = `
        <div class="receta-despensa-badge-container">
          <div class="receta-despensa-match-row">
            <span class="receta-despensa-match-pill ${clasePill}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Tienes ${pm.tengo.length} de ${pm.total} ingredientes (${pm.pct}%)</span>
            </span>
          </div>
          <div class="receta-despensa-barra">
            <div class="receta-despensa-barra-fill ${claseBarra}" style="width: ${Math.max(12, pm.pct)}%;"></div>
          </div>
          <div class="receta-despensa-desglose">
            ${tengoStr ? `<div>Tus ingredientes: <strong>${tengoStr}</strong></div>` : ""}
            ${faltanStr ? `<div><span class="receta-despensa-extra-label">+ Ingredientes extra:</span> <strong>${faltanStr}</strong></div>` : "<div><strong>¡Tienes todos los ingredientes!</strong></div>"}
          </div>
        </div>
      `;
    }

    return `
      <article class="receta-card" data-ver-receta="${m.idMeal}">
        <div class="receta-img-wrap">
          <img class="receta-img" data-src="${imgUrl}" alt="${m.strMeal}" width="360" height="200" decoding="async" fetchpriority="low">
          ${m.strCategory ? `
            <span class="receta-tag-categoria">
              ${getCategoriaIcon(m.strCategory)}
              <span>${CATEGORIAS_ES[m.strCategory] || m.strCategory}</span>
            </span>` : ""}
          ${m.strArea ? `
            <span class="receta-tag-area">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span>${m.strArea}</span>
            </span>` : ""}
        </div>
        <div class="receta-body">
          <h3 class="receta-titulo" data-traducir-titulo="${m.idMeal}">${m.strMeal}</h3>
          <p class="receta-titulo-orig">Original: ${m.strMeal}</p>
          ${pantryHtml}
          <div class="receta-meta-preview">
            <span class="receta-meta-item">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
                <path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z"/>
              </svg>
              <span>Receta del mundo</span>
            </span>
            <span class="receta-meta-item">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>Paso a paso</span>
            </span>
          </div>
          <button type="button" class="receta-btn-ver" data-ver-receta="${m.idMeal}" aria-label="Ver preparación de ${m.strMeal}">
            <span>Ver Preparación Paso a Paso</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </article>
    `;
  }

  // Renderizar recetas optimizado para evitar jank en gama baja
  function renderRecetas(meals, contId = "recetas-grid", origen = "") {
    const grid = $(contId);
    if (!grid) return;

    busquedaIdActual++;
    const currentRun = busquedaIdActual;

    listaRecetasActiva = meals || [];
    paginaRecetas = 1;

    if (!listaRecetasActiva.length) {
      grid.innerHTML = `
        <div class="receta-vacio">
          <div style="font-size: 2.8rem; margin-bottom: 0.5rem;" aria-hidden="true">🍳</div>
          <h3>No encontramos recetas</h3>
          <p>Prueba buscando con otro ingrediente o plato (ej. pasta, pollo, chocolate, carne, pizza, arroz).</p>
        </div>
      `;
      actualizarBarraRecetas(0, 0, origen);
      return;
    }

    const primerLote = listaRecetasActiva.slice(0, TAM_PAGINA);
    
    // Batch DOM update con template fragment
    const template = document.createElement("template");
    template.innerHTML = primerLote.map(m => generarTarjetaHTML(m)).join("");
    
    // Vaciamos e insertamos en un solo reflow
    grid.innerHTML = "";
    grid.appendChild(template.content);

    actualizarBarraRecetas(primerLote.length, listaRecetasActiva.length, origen);

    // Conectar observador de imágenes de ultra alto rendimiento
    activarLazyLoadingImagenes(grid);

    // Traducir los títulos en segundo plano escalonadamente (non-blocking)
    traducirTitulosEscalonado(grid, primerLote, currentRun);
  }

  // Cargar más recetas en la grilla sin congelar el hilo principal
  function cargarMasRecetas(contId = "recetas-grid") {
    const grid = $(contId);
    if (!grid || !listaRecetasActiva.length) return;

    const inicio = paginaRecetas * TAM_PAGINA;
    const siguienteLote = listaRecetasActiva.slice(inicio, inicio + TAM_PAGINA);
    if (!siguienteLote.length) return;

    paginaRecetas++;
    const currentRun = busquedaIdActual;

    const template = document.createElement("template");
    template.innerHTML = siguienteLote.map(m => generarTarjetaHTML(m)).join("");
    
    requestAnimationFrame(() => {
      grid.appendChild(template.content);
      const totalVisible = Math.min(listaRecetasActiva.length, paginaRecetas * TAM_PAGINA);
      actualizarBarraRecetas(totalVisible, listaRecetasActiva.length);
      activarLazyLoadingImagenes(grid);
      traducirTitulosEscalonado(grid, siguienteLote, currentRun);
    });
  }

  // Traducción escalonada que no satura la red ni bloquea la CPU de teléfonos de gama baja
  function traducirTitulosEscalonado(contenedor, lote, runId) {
    let index = 0;
    function procesarSiguiente() {
      if (runId !== busquedaIdActual || index >= lote.length) return;
      const m = lote[index++];
      const el = contenedor.querySelector(`[data-traducir-titulo="${m.idMeal}"]`);
      if (el) {
        traducir(m.strMeal, "en", "es").then(tr => {
          if (runId === busquedaIdActual && tr && tr !== m.strMeal) {
            el.textContent = tr;
          }
        });
      }
      // Damos 60ms de respiro entre traducciones para mantener 60 FPS estables
      if (index < lote.length) {
        setTimeout(procesarSiguiente, 60);
      }
    }
    setTimeout(procesarSiguiente, 40);
  }

  // Observador de intersección optimizado con decode() asíncrono y desvinculación inmediata
  let imgObserver = null;
  function activarLazyLoadingImagenes(contenedor) {
    const imagenes = contenedor.querySelectorAll("img.receta-img[data-src]");

    if (!("IntersectionObserver" in window)) {
      // Fallback
      imagenes.forEach(img => {
        img.src = img.dataset.src;
        img.classList.add("cargada");
      });
      return;
    }

    if (!imgObserver) {
      imgObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.dataset.src;
            if (src) {
              img.removeAttribute("data-src");
              observer.unobserve(img);

              // Asignar src de alta resolución sin alterar nada de la URL ni compresión
              img.src = src;

              // decodificación asíncrona fuera del hilo de renderizado
              if ("decode" in img) {
                img.decode().then(() => {
                  requestAnimationFrame(() => {
                    img.classList.add("cargada");
                    const wrap = img.closest(".receta-img-wrap");
                    if (wrap) wrap.classList.add("loaded");
                  });
                }).catch(() => {
                  // Fallback normal si decode arroja error menor
                  img.classList.add("cargada");
                  const wrap = img.closest(".receta-img-wrap");
                  if (wrap) wrap.classList.add("loaded");
                });
              } else {
                img.onload = () => {
                  img.classList.add("cargada");
                  const wrap = img.closest(".receta-img-wrap");
                  if (wrap) wrap.classList.add("loaded");
                };
              }
            }
          }
        });
      }, {
        rootMargin: "150px 0px", // Precarga inteligente justo antes del scroll
        threshold: 0.01
      });
    }

    imagenes.forEach(img => imgObserver.observe(img));
  }

  // Abrir modal con detalle completo de receta
  async function abrirModalReceta(idMeal) {
    const modal = $("receta-modal");
    const modalBody = $("receta-modal-body");
    if (!modal || !modalBody) return;

    modal.classList.remove("hidden");
    document.body.classList.add("receta-modal-abierto");

    modalBody.innerHTML = `
      <div class="receta-loading" style="padding: 4rem 1rem;">
        <div class="receta-spinner"></div>
        <p>Cocinando y traduciendo los detalles de la receta...</p>
      </div>
    `;

    const meal = await obtenerDetalle(idMeal);
    if (!meal) {
      modalBody.innerHTML = `<p style="text-align:center; padding: 2rem;">No se pudo cargar la receta.</p>`;
      return;
    }

    const ingredientes = extraerIngredientes(meal);

    // Traducir en paralelo
    const [tituloEs, instruccionesEs, areaEs] = await Promise.all([
      traducir(meal.strMeal, "en", "es"),
      traducir(meal.strInstructions, "en", "es"),
      traducir(meal.strArea || "", "en", "es")
    ]);

    // Traducir ingredientes
    const ingsTraducidos = await Promise.all(
      ingredientes.map(async ing => {
        const nombreEs = await traducir(ing.nombre, "en", "es");
        const medidaEs = ing.medida ? await traducir(ing.medida, "en", "es") : "";
        return { ...ing, nombreEs, medidaEs };
      })
    );

    const pasos = dividirEnPasos(instruccionesEs);

    modalBody.innerHTML = `
      <div class="receta-detalle-head">
        <img class="receta-detalle-img" src="${meal.strMealThumb}" alt="${tituloEs}" width="190" height="190" decoding="async">
        <div class="receta-detalle-info">
          <h2 class="receta-detalle-title">${tituloEs}</h2>
          ${tituloEs !== meal.strMeal ? `<p class="receta-detalle-orig">Nombre original: ${meal.strMeal}</p>` : ""}
          <div class="receta-detalle-tags">
            ${meal.strCategory ? `
              <span class="receta-tag-pill cat">
                ${getCategoriaIcon(meal.strCategory)}
                <span>${CATEGORIAS_ES[meal.strCategory] || meal.strCategory}</span>
              </span>` : ""}
            ${meal.strArea ? `
              <span class="receta-tag-pill area">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                <span>Cocina ${areaEs || meal.strArea}</span>
              </span>` : ""}
            <span class="receta-tag-pill cat">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.3" aria-hidden="true">
                <path d="M9 3h6v4l3 6a6 6 0 0 1-6 6 6 6 0 0 1-6-6l3-6V3z"/>
              </svg>
              <span>${ingsTraducidos.length} ingredientes</span>
            </span>
          </div>
        </div>
      </div>

      <div class="receta-seccion-header">
        <h3 class="receta-seccion-titulo">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
            <path d="M3 13h18c0 4-3.5 8-9 8s-9-4-9-8z"/>
            <path d="M12 5v5M8 6c0 2.5 1 4 1 4M16 6c0 2.5-1 4-1 4"/>
          </svg>
          <span>Ingredientes Requeridos (${ingsTraducidos.length})</span>
        </h3>
        <small style="color: rgba(255,255,255,0.65); font-size: 0.78rem;">Toca un ingrediente para tacharlo</small>
      </div>
      <div class="receta-ingredientes-grid">
        ${ingsTraducidos.map((ing, i) => `
          <button type="button" class="receta-ing-item" data-toggle-ing="${i}" aria-pressed="false">
            <span class="receta-ing-check">✓</span>
            <div class="receta-ing-textos">
              <strong>${ing.medidaEs ? `${ing.medidaEs} de ` : ""}${ing.nombreEs}</strong>
              ${ing.nombreEs !== ing.nombre ? `<span class="receta-ing-orig">(${ing.medida ? `${ing.medida} ` : ""}${ing.nombre})</span>` : ""}
            </div>
          </button>
        `).join("")}
      </div>

      <div class="receta-seccion-header" style="margin-top: 1.8rem;">
        <h3 class="receta-seccion-titulo">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <span>Preparación Paso a Paso (${pasos.length} pasos)</span>
        </h3>
      </div>
      <div class="receta-pasos-lista">
        ${pasos.map((paso, idx) => `
          <div class="receta-paso-card">
            <span class="receta-paso-num">${idx + 1}</span>
            <div class="receta-paso-texto">${paso}</div>
          </div>
        `).join("")}
      </div>

      <div class="receta-acciones-footer">
        ${meal.strYoutube ? `
          <a href="${meal.strYoutube}" target="_blank" rel="noopener noreferrer" class="receta-btn-link">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
            </svg>
            <span>Ver video en YouTube</span>
          </a>
        ` : ""}
        ${meal.strSource ? `
          <a href="${meal.strSource}" target="_blank" rel="noopener noreferrer" class="receta-btn-link receta-btn-link-secundario">
            <span>Fuente original de la receta ↗</span>
          </a>
        ` : ""}
      </div>
    `;

    // Interacción con los ingredientes (toggle interactivo)
    modalBody.querySelectorAll("[data-toggle-ing]").forEach(item => {
      item.addEventListener("click", () => {
        const isMarcado = item.classList.toggle("marcado");
        item.setAttribute("aria-pressed", isMarcado ? "true" : "false");
      });
    });
  }

  function cerrarModalReceta() {
    const modal = $("receta-modal");
    if (modal) {
      modal.classList.add("hidden");
      document.body.classList.remove("receta-modal-abierto");
    }
  }

  // Inicialización de la vista
  async function initRecetas() {
    const form = $("recetas-form");
    const input = $("recetas-input");
    const grid = $("recetas-grid");
    const btnSorpresa = $("recetas-btn-sorpresa");
    const btnMas = $("recetas-btn-mas");

    btnMas?.addEventListener("click", () => {
      cargarMasRecetas();
    });

    // Carga inicial destacada con Cocina Asiática e Internacional
    let iniciales = await buscarPorCategoria("Asian");
    if (!iniciales || !iniciales.length) {
      iniciales = await buscarPorCategoria("Chicken");
    }
    renderRecetas(iniciales, "recetas-grid", "Cocina Asiática");

    // Formulario de búsqueda con debounce
    let debounceTimer = null;
    form?.addEventListener("submit", async e => {
      e.preventDefault();
      const val = input?.value.trim();
      if (!val) return;
      document.querySelectorAll("[data-cat-chip]").forEach(c => c.classList.remove("active"));
      if (grid) {
        grid.innerHTML = `
          <div class="receta-loading">
            <div class="receta-spinner"></div>
            <p>Buscando deliciosas recetas de <strong>«${val}»</strong>...</p>
          </div>
        `;
      }
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        const resultados = await buscarRecetas(val);
        renderRecetas(resultados, "recetas-grid", `«${val}»`);
      }, 150);
    });

    // Botón Sorpresa / Receta Aleatoria
    btnSorpresa?.addEventListener("click", async () => {
      if (grid) {
        grid.innerHTML = `
          <div class="receta-loading">
            <div class="receta-spinner"></div>
            <p>Eligiendo una receta mágica del mundo...</p>
          </div>
        `;
      }
      const random = await recetaAleatoria();
      if (random) {
        renderRecetas([random], "recetas-grid", "Receta Sorpresa");
        abrirModalReceta(random.idMeal);
      }
    });

    // Categorías rápidas
    document.querySelectorAll("[data-cat-chip]").forEach(chip => {
      chip.addEventListener("click", async () => {
        document.querySelectorAll("[data-cat-chip]").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        const cat = chip.dataset.catChip;
        const nombreCat = chip.textContent.trim();
        if (grid) {
          grid.innerHTML = `
            <div class="receta-loading">
              <div class="receta-spinner"></div>
              <p>Cargando recetas de categoría <strong>${nombreCat}</strong>...</p>
            </div>
          `;
        }
        const meals = await buscarPorCategoria(cat);
        renderRecetas(meals, "recetas-grid", nombreCat);
      });
    });

    // Estado de la Despensa de Ingredientes
    const ingredientesDespensa = new Set();

    function renderizarTagsDespensa() {
      const container = $("recetas-tags-container");
      const placeholder = $("recetas-tags-placeholder");
      if (!container) return;

      if (ingredientesDespensa.size === 0) {
        container.innerHTML = `<span class="recetas-tags-placeholder" id="recetas-tags-placeholder">Aún no has agregado ingredientes. Escribe arriba o toca los atajos rápidos de abajo.</span>`;
        return;
      }

      const tagsHtml = Array.from(ingredientesDespensa).map(ing => `
        <span class="receta-tag-ingrediente" data-ing-tag="${ing}">
          <span>${ing}</span>
          <button type="button" class="receta-tag-ingrediente-remove" data-remove-ing="${ing}" aria-label="Eliminar ${ing}">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </span>
      `).join("");

      container.innerHTML = tagsHtml;

      // Listeners para eliminar tags
      container.querySelectorAll("[data-remove-ing]").forEach(btn => {
        btn.addEventListener("click", e => {
          e.stopPropagation();
          const toRemove = btn.dataset.removeIng;
          ingredientesDespensa.delete(toRemove);
          renderizarTagsDespensa();
        });
      });
    }

    function agregarIngredienteDespensa(nombre) {
      const limpio = (nombre || "").trim();
      if (!limpio || limpio.length < 2) return;
      const capitalizado = limpio.charAt(0).toUpperCase() + limpio.slice(1).toLowerCase();
      ingredientesDespensa.add(capitalizado);
      renderizarTagsDespensa();
    }

    async function ejecutarBusquedaDespensa() {
      if (ingredientesDespensa.size === 0) {
        if (grid) {
          grid.innerHTML = `
            <div class="receta-vacio">
              <div style="font-size: 2.8rem; margin-bottom: 0.5rem;" aria-hidden="true">🧺</div>
              <h3>Ingresa al menos 1 ingrediente</h3>
              <p>Escribe qué tienes en casa (ej. pollo, arroz, huevo, tomate) o pulsa sobre las sugerencias rápidas.</p>
            </div>
          `;
          actualizarBarraRecetas(0, 0, "Mis Ingredientes");
        }
        return;
      }

      const lista = Array.from(ingredientesDespensa);
      if (grid) {
        grid.innerHTML = `
          <div class="receta-loading">
            <div class="receta-spinner"></div>
            <p>Buscando recetas mágicas con <strong>${lista.join(", ")}</strong>...</p>
          </div>
        `;
      }

      const resultados = await buscarRecetasPorIngredientes(lista);
      renderRecetas(resultados, "recetas-grid", `Ingredientes (${lista.join(", ")})`);
    }

    // Toggle de Modos: General vs Despensa
    const btnModoGeneral = $("recetas-modo-general");
    const btnModoDespensa = $("recetas-modo-despensa");
    const boxGeneral = $("recetas-box-general");
    const boxDespensa = $("recetas-box-despensa");

    btnModoGeneral?.addEventListener("click", () => {
      btnModoGeneral.classList.add("active");
      btnModoDespensa?.classList.remove("active");
      boxGeneral?.classList.remove("hidden");
      boxDespensa?.classList.add("hidden");
    });

    btnModoDespensa?.addEventListener("click", () => {
      btnModoDespensa.classList.add("active");
      btnModoGeneral?.classList.remove("active");
      boxDespensa?.classList.remove("hidden");
      boxGeneral?.classList.add("hidden");
      $("recetas-ingrediente-input")?.focus();
    });

    // Formulario de agregar ingrediente
    const ingForm = $("recetas-ingrediente-form");
    const ingInput = $("recetas-ingrediente-input");
    ingForm?.addEventListener("submit", e => {
      e.preventDefault();
      const val = ingInput?.value.trim();
      if (val) {
        agregarIngredienteDespensa(val);
        ingInput.value = "";
      }
    });

    // Botón de buscar recetas por despensa
    $("recetas-despensa-buscar-btn")?.addEventListener("click", () => {
      // Si el input tiene algo sin enviar, agregarlo primero
      if (ingInput?.value.trim()) {
        agregarIngredienteDespensa(ingInput.value.trim());
        ingInput.value = "";
      }
      ejecutarBusquedaDespensa();
    });

    // Botón limpiar despensa
    $("recetas-despensa-limpiar")?.addEventListener("click", () => {
      ingredientesDespensa.clear();
      renderizarTagsDespensa();
      if (grid) {
        grid.innerHTML = `
          <div class="receta-vacio">
            <div style="font-size: 2.8rem; margin-bottom: 0.5rem;" aria-hidden="true">🧺</div>
            <h3>Despensa lista</h3>
            <p>Agrega ingredientes para encontrar recetas que puedes cocinar ahora mismo.</p>
          </div>
        `;
        actualizarBarraRecetas(0, 0, "Mis Ingredientes");
      }
    });

    // Chips de sugerencias rápidas
    document.querySelectorAll(".receta-sug-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const ing = chip.dataset.ing;
        if (ing) {
          agregarIngredienteDespensa(ing);
        }
      });
    });

    // Delegación de clics eficiente en contenedor
    document.addEventListener("click", e => {
      const card = e.target.closest("[data-ver-receta]");
      if (card) {
        e.preventDefault();
        const idMeal = card.dataset.verReceta;
        if (idMeal) abrirModalReceta(idMeal);
        return;
      }

      if (e.target.closest("#receta-modal-cerrar") || (e.target.classList && e.target.classList.contains("receta-modal"))) {
        cerrarModalReceta();
        return;
      }
    });

    // Cerrar con Escape
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") cerrarModalReceta();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRecetas);
  } else {
    initRecetas();
  }

  window.SunRecetas = { buscarRecetas, buscarRecetasPorIngredientes, recetaAleatoria, abrirModalReceta };
})();
