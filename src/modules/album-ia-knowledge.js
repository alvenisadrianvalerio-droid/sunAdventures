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

  // ============================================================
  // BASE DE CONOCIMIENTO ESPECIALIZADO: CREACIÓN DE CONTENIDO Y VIRALIDAD (NIVEL TOP CREATOR / MRBEAST LAB)
  // ============================================================
  const KNOWLEDGE_CREACION_CONTENIDO = {
    pilaresFundamentales: {
      "anatomia del gancho": "Los primeros 3 segundos determinan el 90% del éxito:\n• Hook Visual: Movimiento inmediato, zoom-in dinámico o elemento discordante que corte el scroll.\n• Hook Verbal (Pregunta polarizante o creencia rota): 'Todo lo que creías saber sobre X es una mentira'.\n• Hook Textual: Texto en negrita con contraste alto (amarillo/blanco con sombra negra) en el tercio superior de la pantalla.",
      "psicologia de retencion": "Cómo mantener a la audiencia hasta el final (Retention Rate > 70%):\n• Micro-bucles narrativos (Open Loops): Plantear una pregunta irresistible y demorar la respuesta hasta el clímax.\n• Cortes de ritmo: Cambios de plano, B-Roll, efectos de sonido (SFX) o zoom cada 2.5 a 4 segundos para reiniciar la atención del cerebro.\n• Payoff proporcional: La recompensa final debe superar la promesa del gancho para evitar el clickbait negativo y ganar seguidores fieles.",
      "algoritmos sociales": "Cómo leen las plataformas el contenido (YouTube, Instagram, TikTok):\n• Instagram: Prioriza 'Saves' (Guardados) y 'Shares' por DM (Compartidos). Un post guardado indica valor eterno; un post compartido indica identidad.\n• TikTok: Prioriza Completion Rate (visto al 100%) y Re-watch Rate (visto más de una vez). Los loops infinitos multiplican el alcance.\n• YouTube / Shorts: Click-Through-Rate (CTR de la miniatura) + Average Percentage Viewed (APV > 100% en Shorts, > 50% en largos).",
      "formatos de alto impacto": "Matriz de formatos ganadores:\n• 1. Carrusel 'Saveable': 5 a 8 láminas con densidad de valor (1 consejo aplicable por slide).\n• 2. Storytelling Personal (Viaje del Héroe): Error catastrófico ➔ Epifanía ➔ Lección aprendida ➔ moraleja aplicable.\n• 3. Listas y Curaduría: 'Las 5 herramientas que parecen ilegales de conocer'.\n• 4. Reacción / Crítica constructiva: Tomar una tendencia viral y aportar un punto de vista disruptivo."
    }
  };

  // ============================================================
  // BASE DE CONOCIMIENTO ESPECIALIZADO: MARKETING DIGITAL, ESTRATÉGICO Y GROWTH (NIVEL CMO / EXPERTO MUNDIAL)
  // ============================================================
  const KNOWLEDGE_MARKETING = {
    conceptosClave: {
      "funnel de ventas": "El embudo de conversión y ciclo de vida del cliente (AIDA / TOFU-MOFU-BOFU / Flywheel):\n• TOFU (Top of Funnel / Conciencia): Tráfico frío captado por contenido de atracción de alta viralidad o intencionalidad (Short-form video, podcasts, SEO técnico pilar, paid ads de awareness). La métrica clave es el CPM, CTR y Hook Rate.\n• MOFU (Middle of Funnel / Consideración y Nutrición): Prospectos tibios que reconocen su problema. Captura con lead magnets hiper-específicos, VSL (Video Sales Letters), secuencias automatizadas de email marketing (Soap Opera Sequences de Russell Brunson) y demostraciones prácticas.\n• BOFU (Bottom of Funnel / Conversión y Cierre): Tráfico caliente. Se elimina toda fricción con 'Grand Slam Offers' (Alex Hormozi), desensamble de objeciones, garantías de inversión de riesgo (Risk Reversal), prueba social irrefutable y urgencia/escasez genuina.\n• Post-Funnel / Retención (Flywheel): Maximización del LTV mediante secuencias de onboarding, Cross-Selling, Up-Selling, programas de lealtad y loops de referidos.",
      "copywriting": "Psicología persuasiva de conversión escrita y verbal:\n• Los 5 Niveles de Conciencia de Eugene Schwartz: Inconsciente (Unaware), Consciente del Problema (Problem-Aware), Consciente de la Solución (Solution-Aware), Consciente del Producto (Product-Aware) y Totalmente Consciente (Most Aware). Adaptar el gancho y el ángulo según este nivel es el 80% del éxito.\n• Fórmulas de Oro: PAS (Problema, Agitación, Solución), AIDA (Atención, Interés, Deseo, Acción), BAB (Before, After, Bridge), QUEST (Qualify, Understand, Educate, Stimulate, Transition) y Star-Story-Solution.\n• Reglas Maestras de Copywriting: 1) Las características informan, pero los beneficios venden, y las transformaciones de estatus obsesionan. 2) Especificidad genera credibilidad ('47.3% más rápido' supera a 'mucho más rápido'). 3) Matar adjetivos vacíos y reemplazarlos por verbos de acción activa y dolor sensorial.",
      "posicionamiento de marca": "Ingeniería de percepción estratégica (Ries & Trout / David Aaker):\n• Ley de la Categoría: Si no puedes ser el primero en una categoría, crea una nueva categoría donde seas el primero (Category King / Piratas de Playbook).\n• Arquetipos de Marca (Jung): Gobernante (Mercedes-Benz, Rolex), Sabio (Google, BBC), Héroe (Nike, FedEx), Mago (Apple, Disney), Forajido/Rebelde (Harley, Virgin, Red Bull), Inocente (Dove), Amigo/Everyman (IKEA).\n• Propuesta Única de Venta (USP) y Matriz de Posicionamiento: Diferenciación radical vs. Comoditización por precio. Quien compite por precio, por precio morirá.",
      "metricas y kpis": "Arquitectura cuantitativa y economía unitaria (Unit Economics):\n• CAC (Customer Acquisition Cost): Gasto comercial y de marketing consolidado / Nuevos clientes adquiridos.\n• LTV / CLV (Customer Lifetime Value): (Ticket promedio × Frecuencia de compra anual) × Vida útil media del cliente en años. En SaaS: ARPU / Churn Rate.\n• Ratio LTV:CAC Saludable: Mínimo 3:1. Un ratio de 5:1 o superior exige acelerar inversión agresiva para no ceder cuota de mercado.\n• CAC Payback Period: Tiempo en meses en que el margen bruto recupera el CAC (ideal < 12 meses en B2B/SaaS, < 3 meses en E-commerce).\n• ROAS vs. MER (Marketing Efficiency Ratio): El ROAS atribuye pauta directa por pixel; el MER (Ingresos Totales / Gasto Total en Pauta) es la métrica de verdad financiera omnicanal que no miente ante restricciones de iOS/cookies.\n• Churn Rate (Logo Churn vs. Revenue Churn): Tasa de atrición. El 'Net Revenue Retention' (NRR) > 110% es el motor de los unicornios tecnológicos.",
      "seo": "Search Engine Optimization y Search Generative Experience (SGE / IA):\n• Topic Clusters y Pillar Pages: Organizar la arquitectura web en núcleos temáticos densos enlazados internamente para transferir PageRank y construir 'Topical Authority'.\n• Intención de Búsqueda (Search Intent): Informativa, Navegacional, Comercial o Transaccional. Google penaliza páginas que no resuelven la intención de forma inmediata en el primer scroll ('Zero-Click Searches').\n• E-E-A-T de Google: Experiencia, Expertise (Pericia), Autoridad y Confiabilidad (Trust). Vital en nichos YMYL (Your Money Your Life).\n• Core Web Vitals técnicos: LCP < 2.5s, INP < 200ms, CLS < 0.1, Schema Markup estructurado (JSON-LD) y optimización crawl budget.",
      "growth hacking": "Metodología científica de experimentación de tracción rápida (Sean Ellis / Andrew Chen):\n• Embudo Pirata AARRR: Acquisiton, Activation (el momento 'Aha!'), Retention (el motor central), Referral (Factor K viral > 1.0) y Revenue.\n• Loops de Crecimiento vs. Embudos Lineales: Productos diseñados para que el output de un ciclo sea el input del siguiente (ej. invitaciones de Dropbox, marcas de agua de TikTok/Canva, enlaces virales de Calendly).\n• Proceso de Experimentación Semanal: Backlog de ideas puntuadas por ICE (Impact, Confidence, Ease), ejecución de sprints y análisis post-mortem riguroso.",
      "oferta irresistible": "Estructura de ofertas de 100 millones de dólares (Alex Hormozi Framework):\n• Ecuación del Valor: (Resultado Soñado × Percepción de Certeza de Logro) / (Demora de Tiempo × Esfuerzo y Sacrificio Percibido). Para maximizar el valor hasta el infinito, debes minimizar el tiempo y el sacrificio a casi cero.\n• Componentes de una Grand Slam Offer: 1) Solución exacta a cada micro-problema del cliente, 2) Bonos irresistibles que valen más que el producto principal, 3) Garantías audaces (incondicional, condicional, basada en resultados o anti-garantía), 4) Escasez y urgencia legítimas.",
      "publicidad paga": "Paid Media y Ecosistema de Pauta (Meta Ads, Google Ads, TikTok Ads):\n• Creative-Led Growth: En Meta Ads moderno (Advantage+), los creativos son el nuevo targeting. El algoritmo segmenta según la temática del video y los primeros 3 segundos de gancho (Hook Rate).\n• Estructura de Campañas de Escalamiento: Campaña CBO/Advantage+ de testing de creativos dinámicos (DCT) + Campaña de escala probada con presupuestos agresivos (Horizontal y Vertical Scaling).\n• Google Ads: Search de alta intención con palabras clave negativas estrictas + Performance Max (PMax) con señales de audiencia hiper-curadas y feed de productos optimizado."
    },
    estrategias: {
      lanzamiento: "Metodología de Lanzamiento Orquestado (Product Launch Formula - Jeff Walker):\n• 1. Pre-Pre-Lanzamiento (Shotgun): Encuestas secretas, detectar objeciones reales y crear lista VIP con escasez.\n• 2. Pre-Lanzamiento (Los 3 Videos de Valor PLC): Video 1 (Oportunidad y por qué el juego cambió), Video 2 (Transformación y caso de estudio), Video 3 (Experiencia de propiedad y cómo ejecutarlo).\n• 3. Lanzamiento (Apertura de Carrito): Ventana limitada de 4 a 7 días con bono exclusivo de primeras 24 horas y webinar de preguntas y respuestas.\n• 4. Cierre de Carrito: Secuencia de urgencia en las últimas 12 y 2 horas, eliminando objeciones de última hora.",
      redesSociales: "Estrategia Omnicanal de Autoridad de Contenido (Content Multiplication Engine):\n• Contenido Pilar de Larga Duración: Un video analítico profundo o podcast a la semana.\n• Micro-Contenido Derivado: 5 Reels/Shorts con ganchos viscerales, 3 carruseles de Instagram con frameworks educativos accionables y 4 hilos en X/LinkedIn.\n• Regla 80/20: 80% valor puro sin pedir nada a cambio, 20% llamadas a la acción claras (CTA) hacia el lead magnet o la oferta."
    }
  };

  // ============================================================
  // BASE DE CONOCIMIENTO ESPECIALIZADO: DISEÑO GRÁFICO, UI/UX Y BRANDING
  // ============================================================
  const KNOWLEDGE_DISENO_GRAFICO = {
    principiosDiseno: {
      "teoria del color": "La ciencia y psicología cromática aplicada:\n• Rueda de color y armonías: Monocromática (elegante y limpia), Análoga (serena y natural), Complementaria (máximo contraste y vibración), Triádica (dinámica y balanceada).\n• Psicología del color: Azul (confianza, seguridad, corporativo), Rojo (urgencia, pasión, apetito), Amarillo (energía, optimismo, alerta), Verde (salud, naturaleza, finanzas), Negro/Dorado (lujo, sofisticación, poder).\n• Regla 60-30-10: 60% color dominante neutro, 30% color secundario/estructural, 10% color de acento/CTA.",
      "tipografia": "Arquitectura tipográfica y legibilidad:\n• Familias: Serif (tradición, autoridad, elegancia editorial), Sans-Serif (modernidad, limpieza digital, accesibilidad), Monospace (código, precisión técnica), Display/Script (personalidad y acento, nunca para párrafos largos).\n• Jerarquía visual: Escala tipográfica armónica (ej. 1.25 Major Third o 1.333 Perfect Fourth), leading (interlineado a 140-160%), kerning (espaciado entre pares) y tracking (espaciado general).\n• Regla tipográfica: No mezclar más de 2 familias tipográficas en una misma identidad (una para titulares, otra para lectura).",
      "composicion y layout": "Leyes de percepción visual y composición:\n• Principios Gestalt: Proximidad (elementos cercanos se perciben juntos), Similitud (mismo estilo = misma función), Continuidad, Cierre y Figura-Fondo.\n• Retículas y Grids: Sistema de 8pt/4pt en diseño UI, cuadrícula de 12 columnas en diseño web, regla de los tercios y proporción áurea (Golden Ratio 1.618).\n• Espacio en Blanco (Negative Space): El elemento más sofisticado del diseño; no es espacio vacío, es el aire que otorga jerarquía y estatus a los elementos clave.",
      "branding e identidad": "Construcción de sistemas de identidad visual consistentes:\n• Manual de Identidad Visual (Brand Guidelines): Logotipo, imagotipo o isotipo, versiones responsivas, zonas de exclusión/respeto, paleta primaria y secundaria (códigos HEX, RGB, CMYK, Pantone) y sistema iconográfico.\n• Coherencia transversal: La marca debe ser reconocible incluso si le quitas el logotipo, a través de sus formas, colores y tono de voz.",
      "diseno ui ux": "Diseño de interfaces de usuario y experiencia centrada en el humano:\n• Ley de Fitts: Los botones más grandes y cercanos son más fáciles y rápidos de tocar.\n• Ley de Hick: A mayor número de opciones, mayor es el tiempo y la fatiga mental para tomar una decisión.\n• Accesibilidad (WCAG 2.1): Contraste mínimo de 4.5:1 para texto normal (AA) y 7:1 (AAA), tamaños de toque táctil mínimo de 44x44px o 48x48px."
    },
    formatosYHerramientas: {
      vectorialVsRaster: "Raster (píxeles: JPG, PNG, WebP) para fotografía y texturas ricas sujetas a resolución (DPI/PPI); Vectorial (matemático: SVG, AI, EPS) para logotipos, iconos e ilustraciones escalables infinitamente sin pérdida.",
      colorPrintVsDigital: "RGB (Red, Green, Blue) aditivo con perfil sRGB/Display P3 para pantallas digitales. CMYK (Cyan, Magenta, Yellow, Key/Black) sustractivo para artes de imprenta."
    }
  };

  // ============================================================
  // BASE DE CONOCIMIENTO ESPECIALIZADO: DESARROLLO, PROGRAMACIÓN Y ARQUITECTURA
  // ============================================================
  const KNOWLEDGE_DESARROLLO_SOFTWARE = {
    principiosIngenieria: {
      cleanCode: "Clean Code & SOLID: Responsabilidad única (SRP), Abierto/Cerrado (OCP), Sustitución de Liskov (LSP), Segregación de Interfaces (ISP), Inversión de Dependencias (DIP). Nombres explícitos, funciones puras con menos de 20 líneas y cero efectos secundarios indeseados.",
      arquitectura: "Patrones arquitectónicos modernos: Arquitectura Hexagonal / Puertos y Adaptadores, Clean Architecture, Microservicios vs. Monolitos Modulares, Event-Driven Architecture (EDA), CQRS y Event Sourcing.",
      depuracionYTesting: "Debugging sistemático: 1) Reproducción mínima reproducible (MRE), 2) Hipótesis y aislamiento binario, 3) Inspección de estado y llamadas asíncronas, 4) Testing piramidal (Unitarios > Integración > E2E con Cypress/Playwright)."
    },
    ecosistemas: {
      javascriptYWeb: "JavaScript ES2026+ / TypeScript: Event Loop (Microtasks vs. Macrotasks), Closures, Prototypes, Garbage Collection, Async/Await concurrency, Streams, Web Workers, Canvas 2D/WebGL y Service Workers para PWAs offline.",
      backendYDatabases: "Node.js / Python / Bases de Datos: Optimización de consultas SQL (PostgreSQL, Supabase RLS, Índices B-Tree, EXPLAIN ANALYZE), NoSQL (MongoDB, Redis caching), RESTful APIs estructuradas, GraphQL y WebSockets en tiempo real.",
      devopsYCloud: "Docker containerization, CI/CD pipelines (GitHub Actions), despliegues cloud (Vercel, AWS, Cloudflare Workers), seguridad OWASP Top 10 (CSRF, XSS, SQL Injection prevention) y JWT / OAuth2."
    }
  };

  // ============================================================
  // BASE DE CONOCIMIENTO ESPECIALIZADO: AYUDANTE DE TRABAJO, REDACCIÓN Y PRODUCTIVIDAD
  // ============================================================
  const KNOWLEDGE_ASISTENTE_TRABAJO = {
    redaccionYComunicacion: {
      emailsEjecutivos: "Estructura BLUF (Bottom Line Up Front): La conclusión, petición o decisión requerida en la primera frase. Contexto justificado en viñetas concisas. Llamada a la acción clara con fecha límite y sin ambigüedad.",
      informesYReportes: "Estructura de Informe de Alto Nivel: Resumen Ejecutivo (Executive Summary), Antecedentes y Metodología, Hallazgos Cuantitativos y Cualitativos, Conclusiones Clave y Hoja de Ruta de Recomendaciones Priorizadas (Matriz Impacto/Esfuerzo).",
      propuestasComerciales: "Propuesta de Servicios Ganadora: 1) Diagnóstico de la situación actual y costo de la inacción, 2) Solución integral y alcance delimitado (Scope of Work), 3) Cronograma y entregables por fases, 4) Inversión escalonada (3 paquetes: Bueno, Mejor, Óptimo) y 5) Términos, garantías y firma."
    },
    gestionProyectosYProductividad: {
      metodologias: "Scrum & Kanban ágil: Sprints de 2 semanas, Daily Standup, Backlog Grooming, Estimación por Story Points (Fibonacci), WIP limits para evitar cuellos de botella y Retrospectivas accionables.",
      marcosDecisiones: "Frameworks estratégicos: Matriz de Eisenhower (Urgente vs. Importante), Primeros Principios (Elon Musk / Aristóteles), Navaja de Ockham, Análisis DAFO/FODA cruzado y Objetivos OKRs (Objectives & Key Results)."
    }
  };

  // ============================================================
  // BASE DE CONOCIMIENTO ESPECIALIZADO: INGENIERÍA DE PROMPTS Y GENERACIÓN DE IMÁGENES POR IA
  // ============================================================
  const KNOWLEDGE_INGENIERIA_PROMPTS_IA = {
    anatomiaPrompt: "Sujeto detallado + Acción/Pose + Entorno/Escenario + Iluminación + Composición/Cámara + Estilo artístico + Render/Calidad + Parámetros técnicos.",
    modelosYParametros: {
      midjourney: "--ar (aspect ratio: 1:1, 16:9, 9:16, 4:5), --v 6.1/7, --style raw (menos sesgo de opinión MJ), --sref (style reference), --cref (character reference), --cw (character weight 0-100), --stylize (0-1000), --chaos (0-100), --weird (0-3000), --no (negative prompt).",
      stableDiffusionYFlux: "CFG Scale (3.5 para Flux, 7 para SD1.5/SDXL), Steps (20-35), Sampler (Euler, DPM++ 2M Karras), LoRA weight (<lora:nombre:0.8>), ControlNet (pose, depth, canny), Negative Prompts estrictos (deformities, bad anatomy, watermarks, lowres).",
      dalleEImagenGemini: "Lenguaje descriptivo en prosa natural en inglés o español, sin flags CLI. Enfoque en relaciones espaciales, texturas, iluminación volumétrica y lentes cinematográficos."
    },
    iluminacionYCamara: {
      iluminacion: "Rembrandt, split lighting, butterfly lighting, golden hour, blue hour, chiaroscuro, volumetric rays, rim light, softbox studio, neon cyberpunk, low-key, high-key.",
      camaraYOptica: "Hasselblad H6D-100c, Sony A7R V, 85mm f/1.4 lens, 35mm street view, 24mm wide angle, macro 100mm, shallow depth of field, creamy bokeh, cinematic color grading, Kodak Portra 400."
    }
  };

  // Exportar al ecosistema AlbumApp
  window.AlbumApp.knowledge = {
    RECETAS_POPULARES,
    ANALISIS_DEPORTES_VERIFICADOS,
    obtenerContextoTemporalDeportivo,
    KNOWLEDGE_CREACION_CONTENIDO,
    KNOWLEDGE_MARKETING,
    KNOWLEDGE_DISENO_GRAFICO,
    KNOWLEDGE_DESARROLLO_SOFTWARE,
    KNOWLEDGE_ASISTENTE_TRABAJO,
    KNOWLEDGE_INGENIERIA_PROMPTS_IA
  };
})();
