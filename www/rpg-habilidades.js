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
        { id:"zarpazo",       lv:1,  tipo:"daño",     nombre:"Zarpazo",           mult:1.0, desc:"Arañazo básico." },
        { id:"robo",          lv:3,  tipo:"daño",     nombre:"Robo rápido",        mult:1.2, robo:8, desc:"Ataca y roba 8 monedas." },
        { id:"escondite",     lv:5,  tipo:"boost",    nombre:"Escondite",          buff:{def:8,dur:3}, desc:"+8 DEF por 3 turnos." },
        { id:"doble-mordida", lv:7,  tipo:"daño",     nombre:"Doble mordida",      mult:0.9, hits:2, desc:"Dos mordidas." },
        { id:"cura-basura",   lv:9,  tipo:"soporte",  nombre:"Cura de basurero",   heal:0.35, desc:"Recupera 35% HP." },
        { id:"tornado",       lv:12, tipo:"daño",     nombre:"Tornado de chatarra",mult:2.0, desc:"Daño masivo." }
      ]
    },

    /* 🌻 GIRASOL — Mago solar, DoT */
    girasol: {
      pasiva: { id:"fotosintesis", desc:"+5 HP al inicio de cada turno", tipo:"regen_turno", val:5 },
      ataques: [
        { id:"rayo-solar",   lv:1,  tipo:"daño",           nombre:"Rayo solar",         mult:1.1, desc:"Rayo de luz." },
        { id:"semillas",     lv:3,  tipo:"daño_indirecto", nombre:"Semillas explosivas",dmgInd:0.15, dur:3, desc:"Daño 15% por 3 turnos." },
        { id:"escudo-flor",  lv:5,  tipo:"boost",          nombre:"Escudo vegetal",     buff:{def:12,dur:3}, desc:"+12 DEF por 3 turnos." },
        { id:"eclipse",      lv:7,  tipo:"daño",           nombre:"Eclipse",            mult:1.6, desc:"Oscurece al enemigo." },
        { id:"bendicion",    lv:9,  tipo:"soporte",        nombre:"Bendición floral",   heal:0.4, limpia:true, desc:"Cura 40% y limpia DoT." },
        { id:"supernova",    lv:12, tipo:"daño",           nombre:"Supernova",          mult:2.4, desc:"Explosión solar devastadora." }
      ]
    },

    /* 🐱 SIAMESA — Rápida, crítico */
    gatito: {
      pasiva: { id:"reflejos", desc:"+10% crítico", tipo:"crit_pct", val:10 },
      ataques: [
        { id:"zarpazo-rapido", lv:1, tipo:"daño",          nombre:"Zarpazo rápido",   mult:1.0, desc:"Veloz zarpazo." },
        { id:"enfoque",        lv:3, tipo:"boost",         nombre:"Enfoque felino",   buff:{crit:20,dur:3}, desc:"+20% crítico 3 turnos." },
        { id:"bola-pelo",      lv:5, tipo:"daño_indirecto",nombre:"Bola de pelo",     dmgInd:0.12, dur:2, desc:"Asfixia al enemigo." },
        { id:"doble-garra",    lv:7, tipo:"daño",          nombre:"Doble garra",      mult:0.85, hits:2, desc:"Dos ataques." },
        { id:"lamida",         lv:9, tipo:"soporte",       nombre:"Lamida curativa",  heal:0.3, desc:"Cura 30%." },
        { id:"furia-9",        lv:12,tipo:"daño",          nombre:"Furia de 9 vidas", mult:0.6, hits:4, desc:"4 golpes." }
      ]
    },

    /* 🐈‍⬛ GATO NEGRO — Debuff / drenaje */
    "gatito-negro": {
      pasiva: { id:"mala-suerte", desc:"+12% prob. esquivar", tipo:"esquivar", val:12 },
      ataques: [
        { id:"aranazo",        lv:1,  tipo:"daño",          nombre:"Arañazo sombrío",   mult:1.0, desc:"Arañazo con sombras." },
        { id:"maldicion",      lv:3,  tipo:"daño_indirecto",nombre:"Maldición",         dmgInd:0.14, dur:3, desc:"Maldice al rival." },
        { id:"camuflaje",      lv:5,  tipo:"boost",         nombre:"Camuflaje",         buff:{esq:25,dur:3}, desc:"+25% esquivar 3 turnos." },
        { id:"mordida-sombra", lv:7,  tipo:"daño",          nombre:"Mordida de sombra", mult:1.5, drain:0.3, desc:"Roba 30% del daño como HP." },
        { id:"novena-vida",    lv:9,  tipo:"soporte",       nombre:"Novena vida",       heal:0.5, desc:"Cura 50% HP." },
        { id:"eclipse-felino", lv:12, tipo:"daño",          nombre:"Eclipse felino",    mult:2.3, debuff:{atk:15,dur:3}, desc:"Daño masivo + -15 ATK." }
      ]
    },

    /* 🍔 HAMBURGUESA — Tanque / multi-hit */
    hamburguesa: {
      pasiva: { id:"grasa", desc:"+20 HP máximo", tipo:"hp_max", val:20 },
      ataques: [
        { id:"embestida",     lv:1,  tipo:"daño",          nombre:"Embestida",         mult:1.0, desc:"Golpe directo." },
        { id:"salsa-picante", lv:3,  tipo:"daño_indirecto",nombre:"Salsa picante",     dmgInd:0.13, dur:3, desc:"Quema al enemigo." },
        { id:"queso-escudo",  lv:5,  tipo:"boost",         nombre:"Queso derretido",   buff:{def:14,dur:3}, desc:"+14 DEF por 3 turnos." },
        { id:"doble-carne",   lv:7,  tipo:"daño",          nombre:"Doble carne",       mult:1.0, hits:2, desc:"Dos golpes." },
        { id:"combo",         lv:9,  tipo:"soporte",       nombre:"Combo completo",    heal:0.4, buff:{atk:8,dur:2}, desc:"Cura 40% y +8 ATK." },
        { id:"mega-burger",   lv:12, tipo:"daño",          nombre:"Mega burger",       mult:2.5, desc:"Aplastamiento total." }
      ]
    },

    /* 🐑 OVEJA — Tanque defensiva */
    oveja: {
      pasiva: { id:"lana", desc:"+3 DEF fijo", tipo:"def_fijo", val:3 },
      ataques: [
        { id:"cabezazo",    lv:1,  tipo:"daño",           nombre:"Cabezazo",           mult:1.0, desc:"Golpe con la testa." },
        { id:"lana-gruesa", lv:3,  tipo:"boost",          nombre:"Lana gruesa",        buff:{def:16,dur:3}, desc:"+16 DEF 3 turnos." },
        { id:"balido",      lv:5,  tipo:"daño_indirecto", nombre:"Balido atronador",   debuff:{atk:20,dur:3}, dmgInd:0.06, dur:3, desc:"-20 ATK del rival." },
        { id:"sueno",       lv:7,  tipo:"soporte",        nombre:"Sueño reparador",    heal:0.5, desc:"Cura 50%." },
        { id:"rebano",      lv:9,  tipo:"boost",          nombre:"Rebaño unido",       buff:{atk:15,def:15,dur:3}, desc:"+15 ATK y DEF 3 turnos." },
        { id:"torbellino",  lv:12, tipo:"daño",           nombre:"Torbellino de lana", mult:2.0, desc:"Gira sin parar." }
      ]
    },

    /* 🐤 POLLITO — Ágil, multi-hit */
    pollito: {
      pasiva: { id:"agil", desc:"+15% esquivar", tipo:"esquivar", val:15 },
      ataques: [
        { id:"picotazo",      lv:1,  tipo:"daño",           nombre:"Picotazo",           mult:0.9, hits:2, desc:"Dos picotazos." },
        { id:"aleteo",        lv:3,  tipo:"boost",          nombre:"Aleteo",             buff:{esq:30,dur:3}, desc:"+30% esquivar 3 turnos." },
        { id:"pio-explosivo", lv:5,  tipo:"daño_indirecto", nombre:"Pío explosivo",      dmgInd:0.16, dur:3, desc:"Estallido sonoro." },
        { id:"circulos",      lv:7,  tipo:"daño",           nombre:"Correr en círculos", mult:0.7, hits:3, desc:"Tres picotazos." },
        { id:"cuidado",       lv:9,  tipo:"soporte",        nombre:"Cuidado materno",    heal:0.45, desc:"Cura 45%." },
        { id:"tormenta",      lv:12, tipo:"daño",           nombre:"Tormenta de plumas", mult:0.55, hits:5, desc:"5 golpes rápidos." }
      ]
    },

    /* 🦒 JIRAFA — Alcance, precisión */
    jirafa: {
      pasiva: { id:"cuello", desc:"+5 ATK fijo", tipo:"atk_fijo", val:5 },
      ataques: [
        { id:"patada",     lv:1,  tipo:"daño",           nombre:"Patada larga",       mult:1.1, desc:"Patada desde lejos." },
        { id:"vista",      lv:3,  tipo:"boost",          nombre:"Vista panorámica",   buff:{crit:25,dur:3}, desc:"+25% crítico." },
        { id:"coz",        lv:5,  tipo:"daño",           nombre:"Coz relámpago",      mult:1.5, desc:"Coz brutal." },
        { id:"aplastar",   lv:7,  tipo:"daño_indirecto", nombre:"Pisotón sísmico",    dmgInd:0.18, dur:2, desc:"Terremoto." },
        { id:"sombrilla",  lv:9,  tipo:"soporte",        nombre:"Sombrilla natural",  heal:0.4, buff:{def:10,dur:2}, desc:"Cura 40% y +10 DEF." },
        { id:"caida-alta", lv:12, tipo:"daño",           nombre:"Aplastamiento alto", mult:2.6, desc:"Caída desde las nubes." }
      ]
    },

    /* 🦄 UNICORNIO — Mago legendario */
    unicornio: {
      pasiva: { id:"magia", desc:"+20% XP extra", tipo:"xp_extra", val:20 },
      ataques: [
        { id:"cuerno",         lv:1,  tipo:"daño",           nombre:"Cuerno brillante",     mult:1.2, desc:"Cornada mágica." },
        { id:"polvo-estrellas",lv:3,  tipo:"daño_indirecto", nombre:"Polvo de estrellas",   dmgInd:0.15, debuff:{def:10,dur:3}, dur:3, desc:"Ciega y quema." },
        { id:"bendicion",      lv:5,  tipo:"boost",          nombre:"Bendición celestial",  buff:{atk:15,def:15,dur:3}, desc:"+15 ATK/DEF 3 turnos." },
        { id:"arcoiris",       lv:7,  tipo:"daño",           nombre:"Destello arcoíris",    mult:1.7, desc:"Rayo multicolor." },
        { id:"cura-pura",      lv:9,  tipo:"soporte",        nombre:"Curación pura",        heal:0.6, limpia:true, desc:"Cura 60% y limpia." },
        { id:"juicio",         lv:12, tipo:"daño",           nombre:"Juicio del arcoíris",  mult:2.8, desc:"Juicio final." }
      ]
    },

    /* 🐰 CONEJO — Sustain + doble ataque (¡MÁXIMA BESTIA!) */
    conejo: {
      pasiva: { id:"brinco", desc:"25% prob. de atacar 2 veces cada turno", tipo:"doble_ataque", val:25 },
      ataques: [
        { id:"brinquito",     lv:1,  tipo:"daño",    nombre:"Brinquito",              mult:0.7, hits:2, desc:"Dos saltitos." },
        { id:"zanahoria",     lv:3,  tipo:"soporte", nombre:"Zanahoria energética",   heal:0.4, desc:"Cura 40%." },
        { id:"esquiva-agil",  lv:5,  tipo:"boost",   nombre:"Esquiva ágil",           buff:{esq:35,dur:3}, desc:"+35% esquivar 3 turnos." },
        { id:"patada-rapida", lv:7,  tipo:"daño",    nombre:"Patada rápida",          mult:0.55, hits:3, desc:"Tres patadas." },
        { id:"madriguera",    lv:9,  tipo:"soporte", nombre:"Madriguera segura",      heal:0.35, buff:{def:20,dur:3}, desc:"Cura 35% y +20 DEF." },
        { id:"rafaga-saltos", lv:12, tipo:"daño",    nombre:"Ráfaga de saltos",       mult:0.45, hits:6, desc:"6 golpes devastadores." }
      ]
    },

    /* 🐲 DRAGÓN BEBÉ — Fuego */
    "dragon-bebe": {
      pasiva: { id:"fuego", desc:"+8 daño de fuego por ataque", tipo:"fuego_atk", val:8 },
      ataques: [
        { id:"chispita",        lv:1,  tipo:"daño",           nombre:"Chispita",                 mult:1.0, desc:"Pequeña llamarada." },
        { id:"aliento",         lv:3,  tipo:"daño_indirecto", nombre:"Aliento ardiente",         dmgInd:0.17, dur:3, desc:"Quema continua." },
        { id:"escamas",         lv:5,  tipo:"boost",          nombre:"Escamas duras",            buff:{def:14,dur:3}, desc:"+14 DEF 3 turnos." },
        { id:"bola-fuego",      lv:7,  tipo:"daño",           nombre:"Bola de fuego",            mult:1.7, desc:"Proyectil ígneo." },
        { id:"regen",           lv:9,  tipo:"soporte",        nombre:"Regeneración draconiana",  heal:0.5, desc:"Cura 50%." },
        { id:"fuego-ancestral", lv:12, tipo:"daño",           nombre:"Fuego ancestral",          mult:2.6, desc:"Llama de dragones." }
      ]
    },

    /* 🐉 DRAGÓN ANCIANO — Apocalíptico */
    "dragon-anciano": {
      pasiva: { id:"sabiduria", desc:"+10% daño contra jefes", tipo:"crit_jefe", val:10 },
      ataques: [
        { id:"rugido",        lv:1,  tipo:"daño_indirecto", nombre:"Rugido ancestral",     dmgInd:0.12, debuff:{atk:15,dur:3}, dur:3, desc:"Rugido que debilita." },
        { id:"aliento-inf",   lv:3,  tipo:"daño_indirecto", nombre:"Aliento infernal",     dmgInd:0.20, dur:4, desc:"Quemadura brutal." },
        { id:"sabiduria-m",   lv:5,  tipo:"boost",          nombre:"Sabiduría milenaria",  buff:{atk:20,def:20,dur:3}, desc:"+20 ATK/DEF." },
        { id:"lluvia-fuego",  lv:7,  tipo:"daño",           nombre:"Lluvia de fuego",      mult:1.9, hits:2, desc:"Meteoros." },
        { id:"cura-arcana",   lv:9,  tipo:"soporte",        nombre:"Curación arcana",      heal:0.55, limpia:true, desc:"Cura 55% y limpia." },
        { id:"apocalipsis",   lv:12, tipo:"daño",           nombre:"Apocalipsis dracónico",mult:3.2, desc:"Furia final." }
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