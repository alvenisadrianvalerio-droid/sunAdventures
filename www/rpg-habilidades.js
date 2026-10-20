/* ============================================================
   RPG-HABILIDADES.JS — 8 a 9 ataques por mascota + pasiva
   Aprendidos por progresión de nivel: 1, 3, 5, 7, 9, 12, 16, 22, 30
   Tipos: daño · boost · soporte · daño_indirecto
   Escalado híbrido: potencia base + sinergia con nivel y stats
   ============================================================ */
window.RpgHabilidades = (function () {

  const HABILIDADES = {

    /* 🦝 MAPACHE — Equilibrado, robo de recursos, golpes tácticos */
    mapache: {
      pasiva: { id:"ladron", desc:"+15% monedas al vencer", tipo:"monedas_victoria", val:15 },
      ataques: [
        { id:"zarpazo",       lv:1,  tipo:"daño",     alcance:"uno",   nombre:"Zarpazo",           mult:1.0, desc:"Arañazo básico. [Objetivo: 1 enemigo]" },
        { id:"robo",          lv:3,  tipo:"daño",     alcance:"uno",   nombre:"Robo rápido",        mult:1.2, robo:10, desc:"Ataca y roba monedas. [Objetivo: 1 enemigo]" },
        { id:"escondite",     lv:5,  tipo:"boost",    alcance:"uno",   nombre:"Escondite",          buff:{def:10,dur:3}, desc:"+DEF por 3 turnos (escala con stats)." },
        { id:"doble-mordida", lv:7,  tipo:"daño",     alcance:"uno",   nombre:"Doble mordida",      mult:0.95, hits:2, desc:"Dos mordidas feroces. [Objetivo: 1 enemigo]" },
        { id:"cura-basura",   lv:9,  tipo:"soporte",  alcance:"uno",   nombre:"Cura de basurero",   heal:0.35, desc:"Recupera HP sustancial." },
        { id:"tornado",       lv:12, tipo:"daño",     alcance:"todos", nombre:"Tornado de chatarra",mult:2.0, desc:"Daño masivo arrojando chatarra. 🌪️ [DAÑO EN ÁREA: Golpea a TODOS]" },
        { id:"emboscada",     lv:16, tipo:"daño",     alcance:"uno",   nombre:"Emboscada sombría",  mult:2.4, desc:"Ataque sorpresa con alto impacto crítico. 🗡️ [Objetivo: 1 enemigo]" },
        { id:"bomba-humo",    lv:22, tipo:"boost",    alcance:"uno",   nombre:"Bomba de humo",      buff:{esq:30,crit:15,dur:3}, desc:"+30% evasión y +15% crítico por 3 turnos." },
        { id:"saqueo-maestro",lv:30, tipo:"daño",     alcance:"todos", nombre:"Saqueo maestro",     mult:2.8, robo:35, desc:"Tifón de garras que asalta y despoja a cada rival. 👑 [DAÑO EN ÁREA: Afecta a TODOS]" }
      ]
    },

    /* 🌻 GIRASOL — Magia solar, quemadura continua y purificación */
    girasol: {
      pasiva: { id:"fotosintesis", desc:"+5 HP al inicio de cada turno", tipo:"regen_turno", val:5 },
      ataques: [
        { id:"rayo-solar",   lv:1,  tipo:"daño",           alcance:"uno",   nombre:"Rayo solar",         mult:1.1, desc:"Rayo de luz solar concentrado. [Objetivo: 1 enemigo]" },
        { id:"semillas",     lv:3,  tipo:"daño_indirecto", alcance:"todos", nombre:"Semillas explosivas",dmgInd:0.15, dur:3, desc:"Esparce semillas ígneas. 💥 [DAÑO EN ÁREA: Afecta a TODOS]" },
        { id:"escudo-flor",  lv:5,  tipo:"boost",          alcance:"uno",   nombre:"Escudo vegetal",     buff:{def:14,dur:3}, desc:"+DEF vegetal por 3 turnos." },
        { id:"eclipse",      lv:7,  tipo:"daño",           alcance:"uno",   nombre:"Eclipse",            mult:1.6, desc:"Oscurece y ciega al rival. [Objetivo: 1 enemigo]" },
        { id:"bendicion",    lv:9,  tipo:"soporte",        alcance:"uno",   nombre:"Bendición floral",   heal:0.42, limpia:true, desc:"Cura HP y limpia estados alterados." },
        { id:"supernova",    lv:12, tipo:"daño",           alcance:"todos", nombre:"Supernova",          mult:2.4, desc:"Explosión cósmica colosal. ☀️ [DAÑO EN ÁREA: Arrasa a TODOS]" },
        { id:"llamarada-zen",lv:16, tipo:"daño",           alcance:"uno",   nombre:"Llamarada zen",      mult:2.7, desc:"Haz solar puro que perfora defensas. 🔆 [Objetivo: 1 enemigo]" },
        { id:"polen-sagrado",lv:22, tipo:"soporte",        alcance:"uno",   nombre:"Polen milagroso",    heal:0.55, buff:{def:15,dur:3}, desc:"Gran curación y barrera protectora de polen." },
        { id:"ira-helios",   lv:30, tipo:"daño",           alcance:"todos", nombre:"Ira de Helios",      mult:3.1, desc:"El sol mismo desciende calcinando el campo de batalla. 🔥☀️ [DAÑO EN ÁREA: Masivo sobre TODOS]" }
      ]
    },

    /* 🐱 SIAMESA — Rápida, golpes críticos y sangrado letal */
    gatito: {
      pasiva: { id:"reflejos", desc:"+10% crítico", tipo:"crit_pct", val:10 },
      ataques: [
        { id:"zarpazo-rapido", lv:1, tipo:"daño",          alcance:"uno",   nombre:"Zarpazo rápido",   mult:1.0, desc:"Veloz zarpazo certero. [Objetivo: 1 enemigo]" },
        { id:"enfoque",        lv:3, tipo:"boost",         alcance:"uno",   nombre:"Enfoque felino",   buff:{crit:20,dur:3}, desc:"+20% crítico 3 turnos." },
        { id:"bola-pelo",      lv:5, tipo:"daño_indirecto",alcance:"uno",   nombre:"Bola de pelo",     dmgInd:0.14, dur:2, desc:"Asfixia con bola de pelo. [Objetivo: 1 enemigo]" },
        { id:"doble-garra",    lv:7, tipo:"daño",          alcance:"uno",   nombre:"Doble garra",      mult:0.9, hits:2, desc:"Dos ataques de garra veloces. [Objetivo: 1 enemigo]" },
        { id:"lamida",         lv:9, tipo:"soporte",       alcance:"uno",   nombre:"Lamida curativa",  heal:0.35, desc:"Cura HP lamiendo sus heridas." },
        { id:"furia-9",        lv:12,tipo:"daño",          alcance:"todos", nombre:"Furia de 9 vidas", mult:0.65, hits:4, desc:"Ráfaga veloz en todas direcciones. 🐾 [DAÑO EN ÁREA: 4 golpes a TODOS]" },
        { id:"caceria-nocturna",lv:16,tipo:"daño",         alcance:"uno",   nombre:"Cacería nocturna", mult:2.5, desc:"Salto acrobático que desgarra al oponente. 🐾 [Objetivo: 1 enemigo]" },
        { id:"instinto-salvaje",lv:22,tipo:"boost",        alcance:"uno",   nombre:"Instinto salvaje", buff:{atk:25,crit:25,dur:3}, desc:"+ATK y +CRIT devastador por 3 turnos." },
        { id:"danza-filos",    lv:30,tipo:"daño",          alcance:"todos", nombre:"Danza de las 9 colas",mult:0.75, hits:5, desc:"Torbellino de zarpazos imparables. ⚡🐾 [DAÑO EN ÁREA: 5 golpes a TODOS]" }
      ]
    },

    /* 🐈‍⬛ GATO NEGRO — Debuff, drenaje vampírico y sombras */
    "gatito-negro": {
      pasiva: { id:"mala-suerte", desc:"+12% prob. esquivar", tipo:"esquivar", val:12 },
      ataques: [
        { id:"aranazo",        lv:1,  tipo:"daño",          alcance:"uno",   nombre:"Arañazo sombrío",   mult:1.0, desc:"Arañazo con sombras oscuras. [Objetivo: 1 enemigo]" },
        { id:"maldicion",      lv:3,  tipo:"daño_indirecto",alcance:"todos", nombre:"Maldición",         dmgInd:0.15, dur:3, desc:"Onda maldita espectral. 👁️ [DAÑO EN ÁREA: Maldice a TODOS]" },
        { id:"camuflaje",      lv:5,  tipo:"boost",         alcance:"uno",   nombre:"Camuflaje",         buff:{esq:25,dur:3}, desc:"+25% esquivar 3 turnos." },
        { id:"mordida-sombra", lv:7,  tipo:"daño",          alcance:"uno",   nombre:"Mordida de sombra", mult:1.55, drain:0.35, desc:"Drena daño como HP. [Objetivo: 1 enemigo]" },
        { id:"novena-vida",    lv:9,  tipo:"soporte",       alcance:"uno",   nombre:"Novena vida",       heal:0.5, desc:"Poderosa regeneración espiritual." },
        { id:"eclipse-felino", lv:12, tipo:"daño",          alcance:"todos", nombre:"Eclipse felino",    mult:2.35, debuff:{atk:18,dur:3}, desc:"Velo tenebroso que reduce ATK rival. 🌑 [DAÑO EN ÁREA: Daña a TODOS]" },
        { id:"devorador-almas",lv:16, tipo:"daño",          alcance:"uno",   nombre:"Devorador de almas",mult:2.6, drain:0.45, desc:"Arranca el ánima del rival curándote un 45% del daño. 🖤 [Objetivo: 1 enemigo]" },
        { id:"pesar-abismal",  lv:22, tipo:"daño_indirecto",alcance:"todos", nombre:"Pesar abismal",     dmgInd:0.22, debuff:{def:20,dur:3}, dur:4, desc:"Neblina oscura que corroe y marchita a toda la horda. 💀" },
        { id:"vacio-absoluto", lv:30, tipo:"daño",          alcance:"todos", nombre:"Vacío absoluto",    mult:3.0, drain:0.3, desc:"Implosión de antimateria que drena vida a cada criatura enemiga. 🌌 [DAÑO EN ÁREA]" }
      ]
    },

    /* 🍔 HAMBURGUESA — Tanque brutal, golpes de peso y saturación */
    hamburguesa: {
      pasiva: { id:"grasa", desc:"+20 HP máximo", tipo:"hp_max", val:20 },
      ataques: [
        { id:"embestida",     lv:1,  tipo:"daño",          alcance:"uno",   nombre:"Embestida",         mult:1.0, desc:"Golpe directo pesado. [Objetivo: 1 enemigo]" },
        { id:"salsa-picante", lv:3,  tipo:"daño_indirecto",alcance:"todos", nombre:"Salsa picante",     dmgInd:0.14, dur:3, desc:"Salpica salsa ardiente. 🌶️ [DAÑO EN ÁREA: Quema a TODOS]" },
        { id:"queso-escudo",  lv:5,  tipo:"boost",         alcance:"uno",   nombre:"Queso derretido",   buff:{def:16,dur:3}, desc:"+DEF por 3 turnos." },
        { id:"doble-carne",   lv:7,  tipo:"daño",          alcance:"uno",   nombre:"Doble carne",       mult:1.05, hits:2, desc:"Dos golpes demoledores. [Objetivo: 1 enemigo]" },
        { id:"combo",         lv:9,  tipo:"soporte",       alcance:"uno",   nombre:"Combo completo",    heal:0.42, buff:{atk:10,dur:2}, desc:"Cura y aumenta ATK." },
        { id:"mega-burger",   lv:12, tipo:"daño",          alcance:"todos", nombre:"Mega burger",       mult:2.5, desc:"Salto y aplastamiento sísmico. 🍔 [DAÑO EN ÁREA: Aplasta a TODOS]" },
        { id:"crujido-bacon", lv:16, tipo:"daño",          alcance:"uno",   nombre:"Impacto crujiente", mult:2.7, desc:"Golpe contundente con peso extra de panceta. 🥓 [Objetivo: 1 enemigo]" },
        { id:"capa-extra",    lv:22, tipo:"boost",         alcance:"uno",   nombre:"Coraza de sésamo",  buff:{def:28,dur:3}, desc:"Armadura densa que resiste castigos masivos." },
        { id:"aplastamiento-gourmet",lv:30,tipo:"daño",    alcance:"todos", nombre:"Festín colosal",    mult:3.2, desc:"Terremoto de proporciones gigantescas que aplasta toda resistencia. 🍔💥 [DAÑO EN ÁREA]" }
      ]
    },

    /* 🐑 OVEJA — Tanque defensiva, repulsión y barreras de lana */
    oveja: {
      pasiva: { id:"lana", desc:"+3 DEF fijo", tipo:"def_fijo", val:3 },
      ataques: [
        { id:"cabezazo",    lv:1,  tipo:"daño",           alcance:"uno",   nombre:"Cabezazo",           mult:1.0, desc:"Fuerte golpe de cuernos. [Objetivo: 1 enemigo]" },
        { id:"lana-gruesa", lv:3,  tipo:"boost",          alcance:"uno",   nombre:"Lana gruesa",        buff:{def:18,dur:3}, desc:"+DEF considerable 3 turnos." },
        { id:"balido",      lv:5,  tipo:"daño_indirecto", alcance:"todos", nombre:"Balido atronador",   debuff:{atk:20,dur:3}, dmgInd:0.08, dur:3, desc:"Grito ensordecedor que baja ATK. 📢 [DAÑO EN ÁREA]" },
        { id:"sueno",       lv:7,  tipo:"soporte",        alcance:"uno",   nombre:"Sueño reparador",    heal:0.52, desc:"Recupera abundante salud durmiendo." },
        { id:"rebano",      lv:9,  tipo:"boost",          alcance:"uno",   nombre:"Rebaño unido",       buff:{atk:18,def:18,dur:3}, desc:"+ATK y DEF 3 turnos." },
        { id:"torbellino",  lv:12, tipo:"daño",           alcance:"todos", nombre:"Torbellino de lana", mult:2.1, desc:"Tromba de lana imparable. 🌀 [DAÑO EN ÁREA: Golpea a TODOS]" },
        { id:"pison-ovino", lv:16, tipo:"daño",           alcance:"uno",   nombre:"Pisotón montés",     mult:2.6, desc:"Cuernazo desde un risco que parte armaduras. 🏔️ [Objetivo: 1 enemigo]" },
        { id:"vello-espinoso",lv:22,tipo:"boost",         alcance:"uno",   nombre:"Vellón blindado",    buff:{def:35,dur:3}, desc:"La lana se endurece como granito (+35 DEF)." },
        { id:"estampida-rebaño",lv:30,tipo:"daño",        alcance:"todos", nombre:"Estampida de las cumbres",mult:3.0, desc:"Manada ancestral que arrolla las filas enemigas. 🐑🐑🐑 [DAÑO EN ÁREA]" }
      ]
    },

    /* 🐤 POLLITO — Multi-hit veloz, esquiva y ráfagas de picos */
    pollito: {
      pasiva: { id:"agil", desc:"+15% esquivar", tipo:"esquivar", val:15 },
      ataques: [
        { id:"picotazo",      lv:1,  tipo:"daño",           alcance:"uno",   nombre:"Picotazo",           mult:0.95, hits:2, desc:"Dos picotazos punzantes. [Objetivo: 1 enemigo]" },
        { id:"aleteo",        lv:3,  tipo:"boost",          alcance:"uno",   nombre:"Aleteo",             buff:{esq:30,dur:3}, desc:"+30% esquivar 3 turnos." },
        { id:"pio-explosivo", lv:5,  tipo:"daño_indirecto", alcance:"todos", nombre:"Pío explosivo",      dmgInd:0.16, dur:3, desc:"Onda sónica aturdidora. 🔊 [DAÑO EN ÁREA]" },
        { id:"circulos",      lv:7,  tipo:"daño",           alcance:"uno",   nombre:"Correr en círculos", mult:0.75, hits:3, desc:"Tres picotazos veloces. [Objetivo: 1 enemigo]" },
        { id:"cuidado",       lv:9,  tipo:"soporte",        alcance:"uno",   nombre:"Cuidado materno",    heal:0.45, desc:"Cura salud y reconforta." },
        { id:"tormenta",      lv:12, tipo:"daño",           alcance:"todos", nombre:"Tormenta de plumas", mult:0.6, hits:5, desc:"Tornado de afiladas plumas. 🪶 [DAÑO EN ÁREA: 5 ráfagas a TODOS]" },
        { id:"aguijon-celeste",lv:16,tipo:"daño",           alcance:"uno",   nombre:"Aguijón celeste",    mult:1.0, hits:3, desc:"Tres estocadas aéreas consecutivas. ⚡ [Objetivo: 1 enemigo]" },
        { id:"frenesi-plumado",lv:22,tipo:"boost",          alcance:"uno",   nombre:"Frenesí alado",      buff:{esq:35,crit:20,dur:3}, desc:"+35% evasión y +20% crítico por 3 turnos." },
        { id:"huracan-dorado",lv:30, tipo:"daño",           alcance:"todos", nombre:"Ciclón del amanecer",mult:0.65, hits:6, desc:"Vórtice vertiginoso de plumas de oro. 🌪️🐥 [DAÑO EN ÁREA: 6 golpes a TODOS]" }
      ]
    },

    /* 🦒 JIRAFA — Alcance épico, precisión y derribos sísmicos */
    jirafa: {
      pasiva: { id:"cuello", desc:"+5 ATK fijo", tipo:"atk_fijo", val:5 },
      ataques: [
        { id:"patada",     lv:1,  tipo:"daño",           alcance:"uno",   nombre:"Patada larga",       mult:1.1, desc:"Patada telescópica desde lejos. [Objetivo: 1 enemigo]" },
        { id:"vista",      lv:3,  tipo:"boost",          alcance:"uno",   nombre:"Vista panorámica",   buff:{crit:25,dur:3}, desc:"+25% crítico." },
        { id:"coz",        lv:5,  tipo:"daño",           alcance:"uno",   nombre:"Coz relámpago",      mult:1.55, desc:"Coz brutal demoledora. [Objetivo: 1 enemigo]" },
        { id:"aplastar",   lv:7,  tipo:"daño_indirecto", alcance:"todos", nombre:"Pisotón sísmico",    dmgInd:0.18, dur:2, desc:"Quebrazón de tierra. 🌍 [DAÑO EN ÁREA: Sacude a TODOS]" },
        { id:"sombrilla",  lv:9,  tipo:"soporte",        alcance:"uno",   nombre:"Sombrilla natural",  heal:0.42, buff:{def:12,dur:2}, desc:"Cura y aporta DEF." },
        { id:"caida-alta", lv:12, tipo:"daño",           alcance:"uno",   nombre:"Aplastamiento alto", mult:2.65, desc:"Caída desde las nubes directo al líder. ⚡ [Objetivo: 1 enemigo]" },
        { id:"impacto-estratosfera",lv:16,tipo:"daño",    alcance:"uno",   nombre:"Golpe estratosférico",mult:2.9, desc:"Cabezazo con impulso orbital devastador. 💫 [Objetivo: 1 enemigo]" },
        { id:"presencia-alta",lv:22,tipo:"boost",         alcance:"uno",   nombre:"Mirada dominante",   buff:{atk:30,crit:15,dur:3}, desc:"Infunde respeto elevando el ataque en gran medida." },
        { id:"cataclismo-savana",lv:30,tipo:"daño",       alcance:"todos", nombre:"Cataclismo de la Sabana",mult:3.15, desc:"Marcha titánica que agrieta el continente. 🦒💥 [DAÑO EN ÁREA: Golpea a TODOS]" }
      ]
    },

    /* 🦄 UNICORNIO — Mago legendario, auras celestiales y bendición */
    unicornio: {
      pasiva: { id:"magia", desc:"+20% XP extra", tipo:"xp_extra", val:20 },
      ataques: [
        { id:"cuerno",         lv:1,  tipo:"daño",           alcance:"uno",   nombre:"Cuerno brillante",     mult:1.2, desc:"Estocada mágica con el cuerno. [Objetivo: 1 enemigo]" },
        { id:"polvo-estrellas",lv:3,  tipo:"daño_indirecto", alcance:"todos", nombre:"Polvo de estrellas",   dmgInd:0.16, debuff:{def:12,dur:3}, dur:3, desc:"Lluvia estelar (-DEF). ✨ [DAÑO EN ÁREA]" },
        { id:"bendicion",      lv:5,  tipo:"boost",          alcance:"uno",   nombre:"Bendición celestial",  buff:{atk:16,def:16,dur:3}, desc:"+ATK y +DEF 3 turnos." },
        { id:"arcoiris",       lv:7,  tipo:"daño",           alcance:"todos", nombre:"Destello arcoíris",    mult:1.75, desc:"Haz de luz que atraviesa las filas. 🌈 [DAÑO EN ÁREA]" },
        { id:"cura-pura",      lv:9,  tipo:"soporte",        alcance:"uno",   nombre:"Curación pura",        heal:0.62, limpia:true, desc:"Cura y limpia DoT." },
        { id:"juicio",         lv:12, tipo:"daño",           alcance:"todos", nombre:"Juicio del arcoíris",  mult:2.85, desc:"Castigo celestial definitivo. ⚔️✨ [DAÑO EN ÁREA]" },
        { id:"rayo-estelar",   lv:16, tipo:"daño",           alcance:"uno",   nombre:"Lanza de Andrómeda",   mult:3.0, desc:"Poder astral condensado en un solo rayo. 🌠 [Objetivo: 1 enemigo]" },
        { id:"aura-inmortal",  lv:22, tipo:"soporte",        alcance:"uno",   nombre:"Aura de inmortalidad", heal:0.5, buff:{def:25,dur:3}, desc:"Restaura vida y envuelve al héroe en un escudo estelar." },
        { id:"genesis-cosmico",lv:30, tipo:"daño",           alcance:"todos", nombre:"Génesis del Cosmos",   mult:3.35, desc:"Invocación de la creación primigenia que borra la oscuridad. 🦄✨🌌 [DAÑO EN ÁREA: Afecta a TODOS]" }
      ]
    },

    /* 🐰 CONEJO — Doble ataque, agilidad frenética y supervivencia */
    conejo: {
      pasiva: { id:"brinco", desc:"25% prob. de atacar 2 veces cada turno", tipo:"doble_ataque", val:25 },
      ataques: [
        { id:"brinquito",     lv:1,  tipo:"daño",    alcance:"uno",   nombre:"Brinquito",              mult:0.75, hits:2, desc:"Dos saltitos rápidos. [Objetivo: 1 enemigo]" },
        { id:"zanahoria",     lv:3,  tipo:"soporte", alcance:"uno",   nombre:"Zanahoria energética",   heal:0.42, desc:"Cura salud rápidamente." },
        { id:"esquiva-agil",  lv:5,  tipo:"boost",   alcance:"uno",   nombre:"Esquiva ágil",           buff:{esq:35,dur:3}, desc:"+35% esquivar 3 turnos." },
        { id:"patada-rapida", lv:7,  tipo:"daño",    alcance:"uno",   nombre:"Patada rápida",          mult:0.6, hits:3, desc:"Tres patadas concentradas. [Objetivo: 1 enemigo]" },
        { id:"madriguera",    lv:9,  tipo:"soporte", alcance:"uno",   nombre:"Madriguera segura",      heal:0.38, buff:{def:22,dur:3}, desc:"Cura y aporta gran DEF." },
        { id:"rafaga-saltos", lv:12, tipo:"daño",    alcance:"todos", nombre:"Ráfaga de saltos",       mult:0.5, hits:6, desc:"Rebota frenéticamente entre los monstruos. 🌪️ [DAÑO EN ÁREA]" },
        { id:"colmillo-liebre",lv:16,tipo:"daño",    alcance:"uno",   nombre:"Estocada de la liebre",  mult:1.05, hits:3, desc:"Tres golpes que atraviesan blindaje. 🐇 [Objetivo: 1 enemigo]" },
        { id:"furia-conejil", lv:22, tipo:"boost",   alcance:"uno",   nombre:"Furia de la madriguera", buff:{atk:25,esq:25,dur:3}, desc:"+25 ATK y +25% esquiva durante 3 rondas." },
        { id:"bestia-apocaliptica",lv:30,tipo:"daño",alcance:"todos", nombre:"Cólera de la Máxima Bestia",mult:0.6, hits:7, desc:"¡La legendaria bestia desata un frenesí de 7 impactos sobre toda la horda! 🐰🔥🌪️ [DAÑO EN ÁREA]" }
      ]
    },

    /* 🐲 DRAGÓN BEBÉ — Llamaradas ardientes, incineración y escamas */
    "dragon-bebe": {
      pasiva: { id:"fuego", desc:"+8 daño de fuego por ataque", tipo:"fuego_atk", val:8 },
      ataques: [
        { id:"chispita",        lv:1,  tipo:"daño",           alcance:"uno",   nombre:"Chispita",                 mult:1.05, desc:"Llamarada directa. [Objetivo: 1 enemigo]" },
        { id:"aliento",         lv:3,  tipo:"daño_indirecto", alcance:"todos", nombre:"Aliento ardiente",         dmgInd:0.18, dur:3, desc:"Cono de fuego continuo. 🔥 [DAÑO EN ÁREA: Quema a TODOS]" },
        { id:"escamas",         lv:5,  tipo:"boost",          alcance:"uno",   nombre:"Escamas duras",            buff:{def:15,dur:3}, desc:"+DEF por 3 turnos." },
        { id:"bola-fuego",      lv:7,  tipo:"daño",           alcance:"uno",   nombre:"Bola de fuego",            mult:1.75, desc:"Proyectil concentrado de fuego. [Objetivo: 1 enemigo]" },
        { id:"regen",           lv:9,  tipo:"soporte",        alcance:"uno",   nombre:"Regeneración draconiana",  heal:0.5, desc:"Cura regenerativa de dragón." },
        { id:"fuego-ancestral", lv:12, tipo:"daño",           alcance:"todos", nombre:"Fuego ancestral",          mult:2.65, desc:"Marea de llamas de dragón. 🌋 [DAÑO EN ÁREA: Incinera a TODOS]" },
        { id:"garras-ignicion", lv:16, tipo:"daño",           alcance:"uno",   nombre:"Garras de magma",          mult:1.45, hits:2, desc:"Dos desgarres de magma puro. 🌋 [Objetivo: 1 enemigo]" },
        { id:"resplandor-draconico",lv:22,tipo:"boost",       alcance:"uno",   nombre:"Corazón de volcán",        buff:{atk:30,def:15,dur:3}, desc:"Despierta el calor interno de un dragón adulto." },
        { id:"inferno-total",   lv:30, tipo:"daño",           alcance:"todos", nombre:"Infierno primordial",      mult:3.25, desc:"Tormenta de fuego y azufre que no deja enemigo en pie. 🐲🔥 [DAÑO EN ÁREA]" }
      ]
    },

    /* 🐉 DRAGÓN ANCIANO — Poder apocalíptico, meteoros y cataclismo */
    "dragon-anciano": {
      pasiva: { id:"sabiduria", desc:"+10% daño contra jefes", tipo:"crit_jefe", val:10 },
      ataques: [
        { id:"rugido",        lv:1,  tipo:"daño_indirecto", alcance:"todos", nombre:"Rugido ancestral",     dmgInd:0.14, debuff:{atk:18,dur:3}, dur:3, desc:"Bramido que sacude el campo (-ATK). 🐲 [DAÑO EN ÁREA]" },
        { id:"aliento-inf",   lv:3,  tipo:"daño_indirecto", alcance:"todos", nombre:"Aliento infernal",     dmgInd:0.22, dur:4, desc:"Fuego del abismo prolongado. ♨️ [DAÑO EN ÁREA]" },
        { id:"sabiduria-m",   lv:5,  tipo:"boost",          alcance:"uno",   nombre:"Sabiduría milenaria",  buff:{atk:22,def:22,dur:3}, desc:"+22 ATK/DEF." },
        { id:"lluvia-fuego",  lv:7,  tipo:"daño",           alcance:"todos", nombre:"Lluvia de fuego",      mult:1.95, hits:2, desc:"Lluvia de meteoros ardientes. ☄️ [DAÑO EN ÁREA]" },
        { id:"cura-arcana",   lv:9,  tipo:"soporte",        alcance:"uno",   nombre:"Curación arcana",      heal:0.58, limpia:true, desc:"Cura y limpia impurezas." },
        { id:"apocalipsis",   lv:12, tipo:"daño",           alcance:"todos", nombre:"Apocalipsis dracónico",mult:3.25, desc:"Devastación colosal del dragón primigenio. 💥🔥 [DAÑO EN ÁREA]" },
        { id:"cometa-abisal", lv:16, tipo:"daño",           alcance:"uno",   nombre:"Cometa del Vacío",     mult:3.3, desc:"Invoca un aerolito colosal que desintegra al objetivo principal. ☄️ [Objetivo: 1 enemigo]" },
        { id:"reino-cenizas", lv:22, tipo:"boost",          alcance:"uno",   nombre:"Señor de las Eras",    buff:{atk:35,def:25,crit:15,dur:3}, desc:"Aura suprema del dragón anciano." },
        { id:"fin-del-mundo", lv:30, tipo:"daño",           alcance:"todos", nombre:"Fin de los Tiempos",   mult:3.6, desc:"Colapso del plano terrenal. Destrucción cósmica ineludible. 🌌🐉💥 [DAÑO EN ÁREA: Devasta a TODOS]" }
      ]
    }
  };

  /* ---------- API pública ---------- */
  const getHabilidades = id => HABILIDADES[id] || HABILIDADES.mapache;
  const ataquesDesbloqueados = (id, nivel) => getHabilidades(id).ataques.filter(a => a.lv <= nivel);
  const ataquePorId = id => {
    for (const m of Object.values(HABILIDADES)) {
      const a = m.ataques.find(x => x.id === id);
      if (a) return a;
    }
    return null;
  };

  return {
    HABILIDADES,
    getHabilidades,
    ataquesDesbloqueados,
    ataquePorId,
    getPasiva: id => getHabilidades(id).pasiva
  };
})();

console.log("✅ rpg-habilidades.js cargado ·", Object.keys(window.RpgHabilidades.HABILIDADES).length, "mascotas con habilidades expandidas (niveles 1 a 30).");