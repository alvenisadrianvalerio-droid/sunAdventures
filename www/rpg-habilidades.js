/* ============================================================
   RPG-HABILIDADES.JS — 6 ataques por mascota + pasiva
   Aprendidos por nivel: 1, 3, 5, 7, 9, 12
   Tipos: daño · boost · soporte · daño_indirecto
   ============================================================ */
window.RpgHabilidades = (function () {

  const HABILIDADES = {

    /* 🦝 MAPACHE — Equilibrado, roba monedas */
    mapache: {
      pasiva: { id:"ladron", desc:"+15% monedas al vencer", tipo:"monedas_victoria", val:15 },
      ataques: [
        { id:"zarpazo",       lv:1,  tipo:"daño",     alcance:"uno",   nombre:"Zarpazo",           mult:1.0, desc:"Arañazo básico. [Objetivo: 1 enemigo]" },
        { id:"robo",          lv:3,  tipo:"daño",     alcance:"uno",   nombre:"Robo rápido",        mult:1.2, robo:8, desc:"Ataca y roba 8 monedas. [Objetivo: 1 enemigo]" },
        { id:"escondite",     lv:5,  tipo:"boost",    alcance:"uno",   nombre:"Escondite",          buff:{def:8,dur:3}, desc:"+8 DEF por 3 turnos." },
        { id:"doble-mordida", lv:7,  tipo:"daño",     alcance:"uno",   nombre:"Doble mordida",      mult:0.9, hits:2, desc:"Dos mordidas feroces. [Objetivo: 1 enemigo]" },
        { id:"cura-basura",   lv:9,  tipo:"soporte",  alcance:"uno",   nombre:"Cura de basurero",   heal:0.35, desc:"Recupera 35% HP." },
        { id:"tornado",       lv:12, tipo:"daño",     alcance:"todos", nombre:"Tornado de chatarra",mult:2.0, desc:"Daño masivo arrojando chatarra. 🌪️ [DAÑO EN ÁREA: Golpea a TODOS los enemigos de la horda]" }
      ]
    },

    /* 🌻 GIRASOL — Mago solar, DoT */
    girasol: {
      pasiva: { id:"fotosintesis", desc:"+5 HP al inicio de cada turno", tipo:"regen_turno", val:5 },
      ataques: [
        { id:"rayo-solar",   lv:1,  tipo:"daño",           alcance:"uno",   nombre:"Rayo solar",         mult:1.1, desc:"Rayo de luz solar concentrado. [Objetivo: 1 enemigo]" },
        { id:"semillas",     lv:3,  tipo:"daño_indirecto", alcance:"todos", nombre:"Semillas explosivas",dmgInd:0.15, dur:3, desc:"Esparce semillas ígneas (15% dmg por 3 turnos). 💥 [DAÑO EN ÁREA: Afecta a TODOS]" },
        { id:"escudo-flor",  lv:5,  tipo:"boost",          alcance:"uno",   nombre:"Escudo vegetal",     buff:{def:12,dur:3}, desc:"+12 DEF por 3 turnos." },
        { id:"eclipse",      lv:7,  tipo:"daño",           alcance:"uno",   nombre:"Eclipse",            mult:1.6, desc:"Oscurece y ciega al rival. [Objetivo: 1 enemigo]" },
        { id:"bendicion",    lv:9,  tipo:"soporte",        alcance:"uno",   nombre:"Bendición floral",   heal:0.4, limpia:true, desc:"Cura 40% y limpia DoT." },
        { id:"supernova",    lv:12, tipo:"daño",           alcance:"todos", nombre:"Supernova",          mult:2.4, desc:"Explosión cósmica colosal. ☀️ [DAÑO EN ÁREA: Arrasa a TODOS los enemigos de la horda]" }
      ]
    },

    /* 🐱 SIAMESA — Rápida, crítico */
    gatito: {
      pasiva: { id:"reflejos", desc:"+10% crítico", tipo:"crit_pct", val:10 },
      ataques: [
        { id:"zarpazo-rapido", lv:1, tipo:"daño",          alcance:"uno",   nombre:"Zarpazo rápido",   mult:1.0, desc:"Veloz zarpazo certero. [Objetivo: 1 enemigo]" },
        { id:"enfoque",        lv:3, tipo:"boost",         alcance:"uno",   nombre:"Enfoque felino",   buff:{crit:20,dur:3}, desc:"+20% crítico 3 turnos." },
        { id:"bola-pelo",      lv:5, tipo:"daño_indirecto",alcance:"uno",   nombre:"Bola de pelo",     dmgInd:0.12, dur:2, desc:"Asfixia con bola de pelo. [Objetivo: 1 enemigo]" },
        { id:"doble-garra",    lv:7, tipo:"daño",          alcance:"uno",   nombre:"Doble garra",      mult:0.85, hits:2, desc:"Dos ataques de garra. [Objetivo: 1 enemigo]" },
        { id:"lamida",         lv:9, tipo:"soporte",       alcance:"uno",   nombre:"Lamida curativa",  heal:0.3, desc:"Cura 30%." },
        { id:"furia-9",        lv:12,tipo:"daño",          alcance:"todos", nombre:"Furia de 9 vidas", mult:0.6, hits:4, desc:"Ráfaga veloz en todas direcciones. 🐾 [DAÑO EN ÁREA: Golpea 4 veces a TODOS en la horda]" }
      ]
    },

    /* 🐈‍⬛ GATO NEGRO — Debuff / drenaje */
    "gatito-negro": {
      pasiva: { id:"mala-suerte", desc:"+12% prob. esquivar", tipo:"esquivar", val:12 },
      ataques: [
        { id:"aranazo",        lv:1,  tipo:"daño",          alcance:"uno",   nombre:"Arañazo sombrío",   mult:1.0, desc:"Arañazo con sombras oscuras. [Objetivo: 1 enemigo]" },
        { id:"maldicion",      lv:3,  tipo:"daño_indirecto",alcance:"todos", nombre:"Maldición",         dmgInd:0.14, dur:3, desc:"Onda maldita espectral. 👁️ [DAÑO EN ÁREA: Maldice a TODOS los enemigos]" },
        { id:"camuflaje",      lv:5,  tipo:"boost",         alcance:"uno",   nombre:"Camuflaje",         buff:{esq:25,dur:3}, desc:"+25% esquivar 3 turnos." },
        { id:"mordida-sombra", lv:7,  tipo:"daño",          alcance:"uno",   nombre:"Mordida de sombra", mult:1.5, drain:0.3, desc:"Drena 30% del daño como HP. [Objetivo: 1 enemigo]" },
        { id:"novena-vida",    lv:9,  tipo:"soporte",       alcance:"uno",   nombre:"Novena vida",       heal:0.5, desc:"Cura 50% HP." },
        { id:"eclipse-felino", lv:12, tipo:"daño",          alcance:"todos", nombre:"Eclipse felino",    mult:2.3, debuff:{atk:15,dur:3}, desc:"Velo tenebroso que reduce ATK rival. 🌑 [DAÑO EN ÁREA: Daña a TODOS]" }
      ]
    },

    /* 🍔 HAMBURGUESA — Tanque / multi-hit */
    hamburguesa: {
      pasiva: { id:"grasa", desc:"+20 HP máximo", tipo:"hp_max", val:20 },
      ataques: [
        { id:"embestida",     lv:1,  tipo:"daño",          alcance:"uno",   nombre:"Embestida",         mult:1.0, desc:"Golpe directo pesado. [Objetivo: 1 enemigo]" },
        { id:"salsa-picante", lv:3,  tipo:"daño_indirecto",alcance:"todos", nombre:"Salsa picante",     dmgInd:0.13, dur:3, desc:"Salpica salsa ardiente a la multitud. 🌶️ [DAÑO EN ÁREA: Quema a TODOS]" },
        { id:"queso-escudo",  lv:5,  tipo:"boost",         alcance:"uno",   nombre:"Queso derretido",   buff:{def:14,dur:3}, desc:"+14 DEF por 3 turnos." },
        { id:"doble-carne",   lv:7,  tipo:"daño",          alcance:"uno",   nombre:"Doble carne",       mult:1.0, hits:2, desc:"Dos golpes demoledores. [Objetivo: 1 enemigo]" },
        { id:"combo",         lv:9,  tipo:"soporte",       alcance:"uno",   nombre:"Combo completo",    heal:0.4, buff:{atk:8,dur:2}, desc:"Cura 40% y +8 ATK." },
        { id:"mega-burger",   lv:12, tipo:"daño",          alcance:"todos", nombre:"Mega burger",       mult:2.5, desc:"Salto y aplastamiento sísmico. 🍔 [DAÑO EN ÁREA: Aplasta a TODOS los enemigos de la horda]" }
      ]
    },

    /* 🐑 OVEJA — Tanque defensiva */
    oveja: {
      pasiva: { id:"lana", desc:"+3 DEF fijo", tipo:"def_fijo", val:3 },
      ataques: [
        { id:"cabezazo",    lv:1,  tipo:"daño",           alcance:"uno",   nombre:"Cabezazo",           mult:1.0, desc:"Fuerte golpe de cuernos. [Objetivo: 1 enemigo]" },
        { id:"lana-gruesa", lv:3,  tipo:"boost",          alcance:"uno",   nombre:"Lana gruesa",        buff:{def:16,dur:3}, desc:"+16 DEF 3 turnos." },
        { id:"balido",      lv:5,  tipo:"daño_indirecto", alcance:"todos", nombre:"Balido atronador",   debuff:{atk:20,dur:3}, dmgInd:0.06, dur:3, desc:"Grito ensordecedor que baja ATK. 📢 [DAÑO EN ÁREA: Afecta a TODOS]" },
        { id:"sueno",       lv:7,  tipo:"soporte",        alcance:"uno",   nombre:"Sueño reparador",    heal:0.5, desc:"Cura 50%." },
        { id:"rebano",      lv:9,  tipo:"boost",          alcance:"uno",   nombre:"Rebaño unido",       buff:{atk:15,def:15,dur:3}, desc:"+15 ATK y DEF 3 turnos." },
        { id:"torbellino",  lv:12, tipo:"daño",           alcance:"todos", nombre:"Torbellino de lana", mult:2.0, desc:"Gira como tromba de lana imparable. 🌀 [DAÑO EN ÁREA: Golpea a TODOS los enemigos]" }
      ]
    },

    /* 🐤 POLLITO — Ágil, multi-hit */
    pollito: {
      pasiva: { id:"agil", desc:"+15% esquivar", tipo:"esquivar", val:15 },
      ataques: [
        { id:"picotazo",      lv:1,  tipo:"daño",           alcance:"uno",   nombre:"Picotazo",           mult:0.9, hits:2, desc:"Dos picotazos punzantes. [Objetivo: 1 enemigo]" },
        { id:"aleteo",        lv:3,  tipo:"boost",          alcance:"uno",   nombre:"Aleteo",             buff:{esq:30,dur:3}, desc:"+30% esquivar 3 turnos." },
        { id:"pio-explosivo", lv:5,  tipo:"daño_indirecto", alcance:"todos", nombre:"Pío explosivo",      dmgInd:0.16, dur:3, desc:"Onda sónica aturdidora. 🔊 [DAÑO EN ÁREA: Explota dañando a TODOS]" },
        { id:"circulos",      lv:7,  tipo:"daño",           alcance:"uno",   nombre:"Correr en círculos", mult:0.7, hits:3, desc:"Tres picotazos veloces. [Objetivo: 1 enemigo]" },
        { id:"cuidado",       lv:9,  tipo:"soporte",        alcance:"uno",   nombre:"Cuidado materno",    heal:0.45, desc:"Cura 45%." },
        { id:"tormenta",      lv:12, tipo:"daño",           alcance:"todos", nombre:"Tormenta de plumas", mult:0.55, hits:5, desc:"Tornado de afiladas plumas. 🪶 [DAÑO EN ÁREA: 5 ráfagas a TODOS los enemigos]" }
      ]
    },

    /* 🦒 JIRAFA — Alcance, precisión */
    jirafa: {
      pasiva: { id:"cuello", desc:"+5 ATK fijo", tipo:"atk_fijo", val:5 },
      ataques: [
        { id:"patada",     lv:1,  tipo:"daño",           alcance:"uno",   nombre:"Patada larga",       mult:1.1, desc:"Patada telescópica desde lejos. [Objetivo: 1 enemigo]" },
        { id:"vista",      lv:3,  tipo:"boost",          alcance:"uno",   nombre:"Vista panorámica",   buff:{crit:25,dur:3}, desc:"+25% crítico." },
        { id:"coz",        lv:5,  tipo:"daño",           alcance:"uno",   nombre:"Coz relámpago",      mult:1.5, desc:"Coz brutal demoledora. [Objetivo: 1 enemigo]" },
        { id:"aplastar",   lv:7,  tipo:"daño_indirecto", alcance:"todos", nombre:"Pisotón sísmico",    dmgInd:0.18, dur:2, desc:"Golpea el suelo quebrando la tierra. 🌍 [DAÑO EN ÁREA: Sacude a TODOS]" },
        { id:"sombrilla",  lv:9,  tipo:"soporte",        alcance:"uno",   nombre:"Sombrilla natural",  heal:0.4, buff:{def:10,dur:2}, desc:"Cura 40% y +10 DEF." },
        { id:"caida-alta", lv:12, tipo:"daño",           alcance:"uno",   nombre:"Aplastamiento alto", mult:2.6, desc:"Caída desde las nubes directo al líder. ⚡ [Objetivo: 1 enemigo masivo]" }
      ]
    },

    /* 🦄 UNICORNIO — Mago legendario */
    unicornio: {
      pasiva: { id:"magia", desc:"+20% XP extra", tipo:"xp_extra", val:20 },
      ataques: [
        { id:"cuerno",         lv:1,  tipo:"daño",           alcance:"uno",   nombre:"Cuerno brillante",     mult:1.2, desc:"Estocada mágica con el cuerno. [Objetivo: 1 enemigo]" },
        { id:"polvo-estrellas",lv:3,  tipo:"daño_indirecto", alcance:"todos", nombre:"Polvo de estrellas",   dmgInd:0.15, debuff:{def:10,dur:3}, dur:3, desc:"Lluvia estelar mágica (-10 DEF). ✨ [DAÑO EN ÁREA: A TODOS]" },
        { id:"bendicion",      lv:5,  tipo:"boost",          alcance:"uno",   nombre:"Bendición celestial",  buff:{atk:15,def:15,dur:3}, desc:"+15 ATK/DEF 3 turnos." },
        { id:"arcoiris",       lv:7,  tipo:"daño",           alcance:"todos", nombre:"Destello arcoíris",    mult:1.7, desc:"Haz de luz que atraviesa las filas. 🌈 [DAÑO EN ÁREA: Quema a TODOS en la horda]" },
        { id:"cura-pura",      lv:9,  tipo:"soporte",        alcance:"uno",   nombre:"Curación pura",        heal:0.6, limpia:true, desc:"Cura 60% y limpia DoT." },
        { id:"juicio",         lv:12, tipo:"daño",           alcance:"todos", nombre:"Juicio del arcoíris",  mult:2.8, desc:"Castigo celestial definitivo. ⚔️✨ [DAÑO EN ÁREA: Juicio final sobre TODOS]" }
      ]
    },

    /* 🐰 CONEJO — Sustain + doble ataque (¡MÁXIMA BESTIA!) */
    conejo: {
      pasiva: { id:"brinco", desc:"25% prob. de atacar 2 veces cada turno", tipo:"doble_ataque", val:25 },
      ataques: [
        { id:"brinquito",     lv:1,  tipo:"daño",    alcance:"uno",   nombre:"Brinquito",              mult:0.7, hits:2, desc:"Dos saltitos rápidos. [Objetivo: 1 enemigo]" },
        { id:"zanahoria",     lv:3,  tipo:"soporte", alcance:"uno",   nombre:"Zanahoria energética",   heal:0.4, desc:"Cura 40%." },
        { id:"esquiva-agil",  lv:5,  tipo:"boost",   alcance:"uno",   nombre:"Esquiva ágil",           buff:{esq:35,dur:3}, desc:"+35% esquivar 3 turnos." },
        { id:"patada-rapida", lv:7,  tipo:"daño",    alcance:"uno",   nombre:"Patada rápida",          mult:0.55, hits:3, desc:"Tres patadas concentradas. [Objetivo: 1 enemigo]" },
        { id:"madriguera",    lv:9,  tipo:"soporte", alcance:"uno",   nombre:"Madriguera segura",      heal:0.35, buff:{def:20,dur:3}, desc:"Cura 35% y +20 DEF." },
        { id:"rafaga-saltos", lv:12, tipo:"daño",    alcance:"todos", nombre:"Ráfaga de saltos",       mult:0.45, hits:6, desc:"Rebota frenéticamente entre cada mob. 🌪️ [DAÑO EN ÁREA: 6 golpes que azotan a TODOS]" }
      ]
    },

    /* 🐲 DRAGÓN BEBÉ — Fuego */
    "dragon-bebe": {
      pasiva: { id:"fuego", desc:"+8 daño de fuego por ataque", tipo:"fuego_atk", val:8 },
      ataques: [
        { id:"chispita",        lv:1,  tipo:"daño",           alcance:"uno",   nombre:"Chispita",                 mult:1.0, desc:"Pequeña llamarada directa. [Objetivo: 1 enemigo]" },
        { id:"aliento",         lv:3,  tipo:"daño_indirecto", alcance:"todos", nombre:"Aliento ardiente",         dmgInd:0.17, dur:3, desc:"Cono de fuego continuo. 🔥 [DAÑO EN ÁREA: Quema a TODOS los enemigos]" },
        { id:"escamas",         lv:5,  tipo:"boost",          alcance:"uno",   nombre:"Escamas duras",            buff:{def:14,dur:3}, desc:"+14 DEF 3 turnos." },
        { id:"bola-fuego",      lv:7,  tipo:"daño",           alcance:"uno",   nombre:"Bola de fuego",            mult:1.7, desc:"Proyectil concentrado de fuego. [Objetivo: 1 enemigo]" },
        { id:"regen",           lv:9,  tipo:"soporte",        alcance:"uno",   nombre:"Regeneración draconiana",  heal:0.5, desc:"Cura 50%." },
        { id:"fuego-ancestral", lv:12, tipo:"daño",           alcance:"todos", nombre:"Fuego ancestral",          mult:2.6, desc:"Marea de llamas de dragón. 🌋 [DAÑO EN ÁREA: Incinera a TODOS en la horda]" }
      ]
    },

    /* 🐉 DRAGÓN ANCIANO — Apocalíptico */
    "dragon-anciano": {
      pasiva: { id:"sabiduria", desc:"+10% daño contra jefes", tipo:"crit_jefe", val:10 },
      ataques: [
        { id:"rugido",        lv:1,  tipo:"daño_indirecto", alcance:"todos", nombre:"Rugido ancestral",     dmgInd:0.12, debuff:{atk:15,dur:3}, dur:3, desc:"Bramido que sacude el campo (-15 ATK). 🐲 [DAÑO EN ÁREA: Afecta a TODOS]" },
        { id:"aliento-inf",   lv:3,  tipo:"daño_indirecto", alcance:"todos", nombre:"Aliento infernal",     dmgInd:0.20, dur:4, desc:"Fuego del abismo prolongado. ♨️ [DAÑO EN ÁREA: Quema a TODOS 4 turnos]" },
        { id:"sabiduria-m",   lv:5,  tipo:"boost",          alcance:"uno",   nombre:"Sabiduría milenaria",  buff:{atk:20,def:20,dur:3}, desc:"+20 ATK/DEF." },
        { id:"lluvia-fuego",  lv:7,  tipo:"daño",           alcance:"todos", nombre:"Lluvia de fuego",      mult:1.9, hits:2, desc:"Lluvia de meteoros ardientes. ☄️ [DAÑO EN ÁREA: 2 impactos a TODOS los enemigos]" },
        { id:"cura-arcana",   lv:9,  tipo:"soporte",        alcance:"uno",   nombre:"Curación arcana",      heal:0.55, limpia:true, desc:"Cura 55% y limpia." },
        { id:"apocalipsis",   lv:12, tipo:"daño",           alcance:"todos", nombre:"Apocalipsis dracónico",mult:3.2, desc:"Devastación colosal del dragón primigenio. 💥🔥 [DAÑO EN ÁREA: Devasta a TODOS]" }
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

console.log("✅ rpg-habilidades.js cargado ·", Object.keys(window.RpgHabilidades.HABILIDADES).length, "mascotas");