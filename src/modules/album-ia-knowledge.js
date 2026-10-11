/* ============================================================
   MÓDULO: BASE DE CONOCIMIENTOS GASTRONÓMICA Y DEPORTIVA (album-ia-knowledge.js)
   Extraído de album-chat.js para modularización y alto rendimiento.
   ============================================================ */
(function () {
  window.AlbumApp = window.AlbumApp || {};

  // Base de datos local de recetas populares en español
  const RECETAS_POPULARES = {
    "tiramisu": {
      titulo: "Tiramisú Tradicional",
      ingredientes: "400g de bizcochos de soletilla, 500g de queso mascarpone, 4 huevos (separar yemas y claras), 100g de azúcar, 1 taza de café fuerte frío, 2 cucharadas de licor Amaretto (opcional) y cacao puro en polvo.",
      pasos: "1. Bate las yemas con el azúcar hasta que blanqueen y añade el mascarpone. 2. Monta las claras a punto de nieve e incorpóralas con movimientos envolventes. 3. Moja los bizcochos en el café con Amaretto y colócalos en la base. 4. Cubre con una capa de crema, repite otra capa de bizcochos y crema. 5. Refrigera mínimo 4 horas y espolvorea abundante cacao antes de servir."
    },
    "pizza": {
      titulo: "Pizza Casera Crujiente",
      ingredientes: "300g de harina de trigo, 175ml de agua tibia, 15g de levadura fresca, 1 cucharadita de sal, 2 cucharadas de aceite de oliva, salsa de tomate frito, queso mozzarella y orégano.",
      pasos: "1. Mezcla harina, levadura disuelta en agua tibia, sal y aceite. Amasa 10 minutos y deja reposar 1 hora hasta duplicar volumen. 2. Estira la masa fina sobre una bandeja. 3. Añade salsa de tomate, abundante mozzarella y tus ingredientes favoritos. 4. Hornea a 220°C durante 12-15 minutos hasta dorar."
    },
    "pancakes": {
      titulo: "Pancakes / Tortitas Esponjosas",
      ingredientes: "200g de harina, 2 huevos, 250ml de leche, 2 cucharadas de azúcar, 1 cucharada de levadura química (polvo para hornear), 30g de mantequilla derretida y una pizca de sal.",
      pasos: "1. Bate los huevos con el azúcar y la leche. 2. Añade la harina tamizada con la levadura y la sal. Agrega la mantequilla derretida. 3. En una sartén antiadherente engrasada a fuego medio, vierte un cucharón de masa. 4. Cuando salgan burbujas en la superficie, dale la vuelta y dora el otro lado 1 minuto. ¡Sirve con miel o sirope!"
    },
    "guacamole": {
      titulo: "Guacamole Mexicano Auténtico",
      ingredientes: "3 aguacates maduros, 1 lima o limón, media cebolla picada finita, 1 tomate picado sin semillas, cilantro fresco picado y sal.",
      pasos: "1. Machaca la pulpa de los aguacates con un tenedor en un bol. 2. Agrega el zumo de la lima de inmediato para que no se oxide. 3. Añade la cebolla, el tomate, el cilantro y la sal al gusto. 4. Mezcla suavemente y sirve con totopos o nachos."
    },
    "brownie": {
      titulo: "Brownies de Chocolate Fudge",
      ingredientes: "200g de chocolate negro, 110g de mantequilla, 3 huevos, 120g de azúcar, 85g de harina y nueces picadas (opcional).",
      pasos: "1. Derrite el chocolate con la mantequilla a fuego suave. 2. Bate los huevos con el azúcar y mezcla con el chocolate tibio. 3. Añade la harina tamizada e incorpora las nueces. 4. Vierte en un molde forrado y hornea a 180°C durante 20-22 minutos (el centro debe quedar tierno)."
    },
    "hot dog": {
      titulo: "Hot Dog Clásico / Perro Caliente",
      ingredientes: "4 panes de perrito caliente alargados, 4 salchichas de tipo Frankfurt o Viena, salsa de tomate (kétchup), mostaza, mayonesa, cebolla picada fina (opcional: pepinillos o chucrut).",
      pasos: "1. Cocina las salchichas: hiérvelas en agua suave durante 4-5 minutos o dóralas en sartén/plancha con una gota de aceite hasta que tomen color. 2. Calienta o tuesta ligeramente los panes al vapor o a la plancha para que queden tiernos y tibios. 3. Abre los panes por la mitad longitudinalmente sin partirlos del todo. 4. Coloca una salchicha en cada pan. 5. Corona con hilos de kétchup, mostaza y mayonesa al gusto, y espolvorea cebolla picadita crujiente por encima."
    },
    "perro caliente": {
      titulo: "Hot Dog Clásico / Perro Caliente",
      ingredientes: "4 panes de perrito caliente alargados, 4 salchichas de tipo Frankfurt o Viena, salsa de tomate (kétchup), mostaza, mayonesa, cebolla picada fina (opcional: pepinillos o chucrut).",
      pasos: "1. Cocina las salchichas: hiérvelas en agua suave durante 4-5 minutos o dóralas en sartén/plancha con una gota de aceite hasta que tomen color. 2. Calienta o tuesta ligeramente los panes al vapor o a la plancha para que queden tiernos y tibios. 3. Abre los panes por la mitad longitudinalmente sin partirlos del todo. 4. Coloca una salchicha en cada pan. 5. Corona con hilos de kétchup, mostaza y mayonesa al gusto, y espolvorea cebolla picadita crujiente por encima."
    },
    "completo": {
      titulo: "Completo / Hot Dog Chileno",
      ingredientes: "Pan de hot dog, salchichas de calidad, 2 aguacates (palta) molidos con sal, 2 tomates picados en cubitos, chucrut o chucrut tibio, mayonesa casera abundante.",
      pasos: "1. Cuece las salchichas en agua caliente o dóralas. 2. Tuesta el pan para que esté firme y caliente. 3. Coloca la salchicha, agrega una capa generosa de tomate picado, luego el chucrut o salsa americana, cubre con abundante puré de aguacate (palta) y corona con una línea abundante de mayonesa."
    },
    "tacos": {
      titulo: "Tacos de Carne Asada Caseros",
      ingredientes: "500g de filete de ternera en tiritas, tortillas de maíz, 1 lima, cebolla y cilantro picados, salsa taquera, sal, pimienta y comino.",
      pasos: "1. Marina la carne 15 min con zumo de lima, sal, pimienta y comino. 2. Cocina la carne a fuego muy vivo en una sartén bien caliente para sellarla jugosa. 3. Calienta las tortillas en un comal o sartén seca. 4. Monta la carne sobre las tortillas dobles, agrega cebolla picada, cilantro fresco y salsa al gusto."
    },
    "carbonara": {
      titulo: "Pasta Carbonara Italiana Auténtica",
      ingredientes: "400g de espaguetis, 150g de guanciale (o panceta curada), 4 yemas de huevo + 1 huevo entero, 80g de queso Pecorino Romano rallado, abundante pimienta negra recién molida.",
      pasos: "1. Dora el guanciale cortado en tiras en una sartén sin aceite añadido hasta que esté dorado y crujiente. Reserva la grasa. 2. Bate las yemas con el huevo, el queso rallado y abundante pimienta hasta formar una crema densa. 3. Hierve la pasta al dente en abundante agua con poca sal. 4. Apaga el fuego de la sartén, echa la pasta escurrida junto con el guanciale y un cucharón de agua de cocción. 5. Vierte la mezcla de huevo fuera del fuego y remueve enérgicamente para emulsionar en una salsa sedosa y brillante sin cuajar el huevo."
    },
    "crepes": {
      titulo: "Crêpes Francesas Caseras",
      ingredientes: "250g de harina, 500ml de leche, 3 huevos, 50g de mantequilla derretida, una pizca de sal (y 1 cucharada de azúcar si son dulces).",
      pasos: "1. Bate los huevos con la leche y la sal. Añade la harina tamizada poco a poco para evitar grumos. 2. Agrega la mantequilla derretida y deja reposar la masa 30 minutos. 3. Engrasa una sartén antiadherente a fuego medio y vierte una capa muy fina de masa repartiéndola bien. 4. Dora 1 minuto, dale la vuelta con espátula y cocina 30 segundos más. Rellena con dulce o salado."
    },
    "quesadillas": {
      titulo: "Quesadillas Doraditas",
      ingredientes: "Tortillas de harina o maíz, queso Oaxaca, mozzarella o cheddar rallado, mantequilla o una gota de aceite.",
      pasos: "1. Coloca la tortilla en un comal o sartén a fuego medio-bajo. 2. Espolvorea abundante queso en una mitad de la tortilla (puedes añadir pollo, jamón o champiñones). 3. Dobla la tortilla por la mitad. 4. Cocina 2 minutos por lado hasta que la tortilla esté crujiente y el queso completamente fundido."
    }
  };

  function obtenerContextoTemporalDeportivo(desplazamientoDias = 0) {
    const d = new Date();
    d.setDate(d.getDate() + desplazamientoDias);
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Santo_Domingo' };
    const fechaFormateada = d.toLocaleDateString('es-ES', opciones);
    const isoFecha = d.toISOString().split('T')[0];
    return {
      fechaFormateada: fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1),
      isoFecha,
      diaSemana: d.toLocaleDateString('es-ES', { weekday: 'long' }),
      anio: d.getFullYear(),
      horaAuditoria: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
  }

  // Base de datos de análisis técnicos verificados multideporte
  const ANALISIS_DEPORTES_VERIFICADOS = {
    "manchester city": {
      deporte: "Fútbol",
      equipo: "Manchester City FC",
      fuente: "Opta Stats / FBref Certificado",
      formacion: "4-3-3 mutando a 3-2-4-1 en fase ofensiva",
      metricas: [
        "Posesión media: 64.8%",
        "xG generado p90: 2.31",
        "PPDA (Intensidad de presión): 8.4",
        "Efectividad en pases: 89.6%"
      ],
      analisisTáctico: "En fase de salida, un lateral invierte su posición hacia el doble pivote para generar superioridad 3+2, fijando los extremos rivales y habilitando a los interiores en los medios espacios.",
      rendimiento: "Máxima eficiencia en control de transiciones y minimización de pérdidas en campo propio."
    },
    "real madrid": {
      deporte: "Fútbol",
      equipo: "Real Madrid CF",
      fuente: "Opta Stats / FBref Certificado",
      formacion: "4-3-1-2 o 4-3-3 fluido con rombo",
      metricas: [
        "Velocidad de transición: 3.4 pases por ataque directo",
        "xG por disparo: 0.16 (Alta calidad de remate)",
        "Goles en últimos 15 min: 28% del total",
        "Presión tras pérdida en campo medio: 58% de recuperaciones"
      ],
      analisisTáctico: "Estructura basada en asimetría funcional; sobrecarga en sector izquierdo para liberar el costado débil con cambios de orientación rasos y ataques al espacio de ruptura.",
      rendimiento: "Dominio letal en transiciones ofensivas y resistencia en bloque medio-bajo durante fases de asedio rival."
    },
    "barcelona": {
      deporte: "Fútbol",
      equipo: "FC Barcelona",
      fuente: "Opta Stats / FBref Certificado",
      formacion: "4-2-3-1 / 4-3-3 con bloque muy alto",
      metricas: [
        "Altura de la línea defensiva: 52.8 metros",
        "Fueras de juego provocados: 4.8 por partido",
        "Posesión media: 63.1%",
        "Recuperaciones en último tercio: 7.1 p90"
      ],
      analisisTáctico: "Presión coordinada hombre a hombre en reinicios rivales y línea de fuera de juego ejecutada milimétricamente al inicio de la carrera del pasador.",
      rendimiento: "Gran producción de ocasiones por robo en salida ajena, requiriendo máxima coordinación de los centrales para defender el espacio a su espalda."
    },
    "arsenal": {
      deporte: "Fútbol",
      equipo: "Arsenal FC",
      fuente: "Opta Stats / FBref Certificado",
      formacion: "4-3-3 con bloque alto zonal",
      metricas: [
        "Goles de balón parado (ABP): 34% del total",
        "xG concedido p90: 0.78 (Líder defensivo)",
        "Presión PPDA: 9.1",
        "Efectividad en duelos aéreos: 57.2%"
      ],
      analisisTáctico: "Diseño perfeccionado en jugadas a balón parado con bloqueos coordinados hacia el segundo poste y repliegue en 4-4-2 hermético sin conceder carriles interiores.",
      rendimiento: "La estructura más sólida de Europa en defensa posicional y neutralización de contragolpes."
    },
    "boston celtics": {
      deporte: "Básquetbol",
      equipo: "Boston Celtics (NBA)",
      fuente: "NBA Advanced Stats / Basketball-Reference",
      formacion: "5-Out (Five-Out Spacing con versatilidad defensiva)",
      metricas: [
        "Offensive Rating (ORtg): 122.2 pts por 100 posesiones (Líder histórico)",
        "Net Rating (NetRtg): +11.6 diferencial neto",
        "Triples intentados (3PA): 42.5 por juego (Tasa de acierto: 38.8%)",
        "True Shooting % (TS%): 60.5%"
      ],
      analisisTáctico: "Ataque posicional basado en spacing total donde los 5 jugadores pueden tirar de 3 y penetrar. En defensa ejecutan cambios continuos (switch all) del 1 al 5 sin perder protección de aro.",
      rendimiento: "Mayor probabilidad de victoria sostenida de la liga debido a la eficiencia de tiro y reducción drástica de pérdidas en crunch time."
    },
    "denver nuggets": {
      deporte: "Básquetbol",
      equipo: "Denver Nuggets (NBA)",
      fuente: "NBA Advanced Stats / Basketball-Reference",
      formacion: "Post-Hub Offense con Nikola Jokić en cabecera",
      metricas: [
        "Assist-to-Turnover Ratio: 2.18",
        "Puntos en la pintura p90: 54.2 pts",
        "Efectividad en Pick and Roll ofensivo: 1.16 puntos por posesión",
        "Rebotes defensivos asegurados: 76.4%"
      ],
      analisisTáctico: "El pívot actúa como distribuidor primario en poste alto facilitando cortes diagonales (backdoor cuts) y juego de bloqueo directo central.",
      rendimiento: "Dominio absoluto de la media cancha con la ofensiva más fluida y menos predecible ante defensas en zona."
    },
    "golden state warriors": {
      deporte: "Básquetbol",
      equipo: "Golden State Warriors (NBA)",
      fuente: "NBA Advanced Stats / Second Spectrum",
      formacion: "Motion Offense con bloqueos indirectos (Split Action)",
      metricas: [
        "Pases por posesión: 4.8 (Top 3 de la liga)",
        "Puntos generados por movimiento sin balón: 18.6 por juego",
        "Tiro efectivo (eFG%): 56.4%",
        "Pace (Ritmo de juego): 100.8 posesiones por 48 min"
      ],
      analisisTáctico: "Circulación constante alrededor de la amenaza perimetral, utilizando bloqueos ciegos y lectura de ventajas inmediatas.",
      rendimiento: "Capacidad explosiva de rachas anotadoras en el 3er cuarto, supeditada al control de pérdidas de balón."
    },
    "los angeles lakers": {
      deporte: "Básquetbol",
      equipo: "Los Angeles Lakers (NBA)",
      fuente: "NBA Advanced Stats",
      formacion: "Drop Coverage con presencia interior y juego de transición",
      metricas: [
        "Puntos en transición (Fastbreak pts): 17.2 por juego",
        "Tiros libres intentados (FTA): 24.5 por partido",
        "Porcentaje defensivo en aro rival: 61.2% concedido"
      ],
      analisisTáctico: "Enfoque de ataque a la pintura buscando faltas personales y transiciones rápidas tras rebote defensivo.",
      rendimiento: "Elevada contundencia en partidos de ritmo físico y control del ritmo en playoffs."
    },
    "los angeles dodgers": {
      deporte: "Béisbol",
      equipo: "Los Angeles Dodgers (MLB)",
      fuente: "MLB Statcast / FanGraphs",
      formacion: "Lineup profundo con rotación analítica de pitcheo",
      metricas: [
        "wOBA ofensivo: .345 (Líder MLB)",
        "Hard-Hit %: 44.2% de contactos superiores a 95 mph",
        "ERA colectivo del bullpen: 3.28",
        "Barrel %: 9.8%"
      ],
      analisisTáctico: "Disciplina en el plato con baja tasa de persecución de pitcheos fuera de zona (Chase Rate bajo) y agresividad selectiva contra rectas en conteos favorables.",
      rendimiento: "Máximo diferencial de carreras esperadas y favoritos constantes por profundidad de plantilla."
    },
    "carlos alcaraz": {
      deporte: "Tenis",
      equipo: "Carlos Alcaraz",
      fuente: "ATP Tour Official Stats / Tennis Abstract",
      formacion: "Estilo agresivo de toda la cancha (All-Court Aggressor)",
      metricas: [
        "Puntos ganados con 1er servicio: 74.2%",
        "Break points convertidos: 43.8%",
        "Velocidad media de derecha (Forehand): 128 km/h",
        "Efectividad en drop shots (dejadas): 68.5% puntos ganados"
      ],
      analisisTáctico: "Genera profundidad con topspin pesado en el drive para forzar respuestas cortas, definiendo con dejadas milimétricas o subidas coordinadas a la red.",
      rendimiento: "Extraordinaria cobertura de pista y aceleración en defensa a contraataque."
    },
    "jannik sinner": {
      deporte: "Tenis",
      equipo: "Jannik Sinner",
      fuente: "ATP Tour Official Stats / Infosys ATP Beyond The Numbers",
      formacion: "Poder de fondo de pista (Baseline Power Hitter)",
      metricas: [
        "Velocidad media de pelota de fondo: 131 km/h (Líder del circuito)",
        "Puntos de quiebre salvados: 71.4%",
        "Efectividad con 2do servicio: 57.8%",
        "Errores no forzados p90 rallies: 1.4 por juego"
      ],
      analisisTáctico: "Golpeo plano y ultra-preciso con transferencias de peso milimétricas desde ambos lados de la pista, negando ángulos al rival.",
      rendimiento: "Máximo ratio de victorias en pistas duras cubiertas y abiertas gracias a su consistencia milimétrica."
    },
    "red bull racing": {
      deporte: "Fórmula 1",
      equipo: "Red Bull Racing (F1)",
      fuente: "F1 Official Telemetry / FIA Data",
      formacion: "Monoplaza aerodinámico con suspensión anti-dive optimizada",
      metricas: [
        "Eficiencia DRS: +24 km/h de ganancia en rectas",
        "Degradación media de neumáticos: 0.045s por vuelta (Mínima del campeonato)",
        "Tiempo promedio de pit stop: 2.15 segundos"
      ],
      analisisTáctico: "Excelente ventana operativa aerodinámica en curvas de media y alta velocidad combinada con gestión de temperatura de gomas.",
      rendimiento: "Dominio sostenido en tandas largas de carrera (Race Pace)."
    }
  };

  // Exportar al ecosistema AlbumApp
  window.AlbumApp.knowledge = {
    RECETAS_POPULARES,
    ANALISIS_DEPORTES_VERIFICADOS,
    obtenerContextoTemporalDeportivo
  };
})();
