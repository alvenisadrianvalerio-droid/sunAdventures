/* ============================================================
   SPRITE-NAMES.JS — Nombres coherentes para el sprite sheet
   Basado en Admurin's Armory (itch.io)
   Formato: "col,row": { nombre, tipo, rar, icono, desc, consumible? }
   Tipos:  atk · def · hp · key · util
   Rarezas: comun · raro · epico · legendario
   ============================================================ */
(function () {
    "use strict";

    window.SPRITE_NAMES = {

        // --- MAPEO GENERADO ---
        "0,0": { nombre: "Espada simple.", rar: "comun", icono: "espada", desc: "No es tan fuerte, apenas y puede hacerle un rasguño a los girasoles.", stats: { atk: 2, def: 1 } },
        "1,0": { nombre: "Espada de guerrero.", rar: "raro", icono: "espada", desc: "Una buena espada, simple y bastante robusta. Ataque y defensa, lo mejor de los dos mundos. Pero apenas puede hacerle frente a los girasoles.", stats: { def: 3, atk: 3 } },
        "2,0": { nombre: "Daga", rar: "raro", icono: "espada", desc: "Muy rápida, es el arma favorita del mapache.", stats: { oro: 5, atk: 3 } },
        "3,0": { nombre: "Espada de pirata.", rar: "epico", icono: "espada", desc: "El mapache la robó en su última travesía por las ruinas desérticas. Increíblemente eficaz para conseguir un poco más de beneficios como todo buen pirata.", stats: { atk: 5, oro: 10, esq: 5 } },
        "4,0": { nombre: "Espada de marine", rar: "epico", icono: "espada", desc: "Si portas esta arma, más te vale no ser Armstrong, o estarás en graves problemas.", stats: { atk: 5, def: 5, hp: 10 } },
        "5,0": { nombre: "Espada flora.", rar: "legendario", icono: "espada", desc: "Esta espada no es para luchar, esta espada lleva el corazón de un girasol dentro. Quien la porte tendrá la bendición de las inflorescencias.", stats: { def: 10, regen: 10, hp: 50 }, habilidades: [{ nombre: "Bendición de las inflorescencias.", tipo: "pasiva", val: 1, desc: "Cura al portador 5% de su vida por turno." }] },
        "6,0": { nombre: "Espada fauna.", rar: "mitico", icono: "espada", desc: "Todo lo contrario a la espada flora.  Quien porte esta espada poseerá el poder de los espíritus del bosque embrujado. Almas de animales que ya no están acá.", stats: { atk: 10, lifesteal: 10, hp: 50, veneno: 10 }, habilidades: [{ nombre: "Alma animal.", tipo: "daño_indirecto", val: 30, desc: "Drena el alma del enemigo cada turno." }] },
        "7,0": { nombre: "Espada Girasol.", rar: "mitico", icono: "espada", desc: "El poder absoluto, nada más y nada menos. Aquel que la empuñe no solo tendrá control absoluto sobre flora y fauna, tendrá el control sobre todo lo vivo.", stats: { thorns: 20, lifesteal: 10, regen: 10, hp: 50, def: 20, atk: 20 }, habilidades: [{ nombre: "Alma animal.", tipo: "daño_indirecto", val: 30, desc: "Drena el alma del enemigo." }, { nombre: "Bendición de las inflorescencias.", tipo: "pasiva", val: 0, desc: "Cura 7% de la vida máxima por turno." }, { nombre: "Poder absoluto.", tipo: "pasiva", val: 0, desc: "Al vencer a un enemigo el portador se cura todo el daño del golpe final inflingido." }] },
        "0,1": { nombre: "Lanza", rar: "comun", icono: "espada", desc: "Un arma sencilla pero punzante, eficaz para mantener distancia.", stats: { atk: 3, def: 1 } },
        "1,1": { nombre: "Lanza reforzada", rar: "raro", icono: "espada", desc: "Un poco más fuerte que una lanza normal, pero no es rival para los girasoles.", stats: { def: 6, atk: 2 } }, // --- MAPEO GENERADO ---
        "2,1": { nombre: "Tridente", rar: "legendario", icono: "espada", desc: "El poseedor tendrá un poquitito de la fuerza de los mares, solo un poquitito.", stats: { atk: 2, def: 10, regen: 5 }, habilidades: [{ nombre: "Furia de los mares.", tipo: "boost", val: 0, desc: "Cada 2 turnos el usuario gana 3 de ataque hasta un máximo de 15" }] },
        "3,1": { nombre: "Filo grueso.", rar: "legendario", icono: "espada", desc: "Un arma muy robusta, se rumora que quien la empuñe arderá en llamas.", stats: { atk: 5, lifesteal: 5, hp: 50 }, habilidades: [{ nombre: "Corte ardiente.", tipo: "daño_indirecto", val: 30, desc: "Hace daño todos los turnos." }] },
        "4,1": { nombre: "Hachita.", rar: "epico", icono: "espada", desc: "Un hacha lo suficientemente poderosa como para hacerle frente a los murciélagos.", stats: { atk: 15 } },
        "5,1": { nombre: "Mazo", rar: "epico", icono: "espada", desc: "Un arma lo suficientemente fuerte como para aguantar un hachazo de un hacha lo suficientemente fuerte como para hacerle frente a los murciélagos.", stats: { def: 10 } },
        "6,1": { nombre: "Oda a la guerra.", rar: "legendario", icono: "espada", desc: "No hay un boss que resista la llamada a la guerra.", stats: { atk: 10, lifesteal: 10, def: 5 }, habilidades: [{ nombre: "Oneshot.", tipo: "defensa", val: 100, desc: "El usuario gana 100 de escudo todos los turnos, si oneshotean al portador, este revive con 60% de la vida máxima." }] },
        "7,1": { nombre: "Rebanadora.", rar: "mitico", icono: "espada", desc: "No solo corta pan, dicen que es capaz de rebanar el viento.", stats: { atk: 10, esq: 10, regen: 100, hp: 100 } },
        "0,2": { nombre: "Arco endeble", rar: "comun", icono: "espada", desc: "Poco util, no hace mucho daño.", stats: { atk: 2, crit: 2 } },
        "1,2": { nombre: "Arco reforzado", rar: "raro", icono: "espada", desc: "Un arco un poco mejor, sus flechas pueden perforar pétalos de girasol.", stats: { atk: 3, crit: 4 } },
        "2,2": { nombre: "Arco arpa", rar: "legendario", icono: "espada", desc: "Difícil de usar, pero muy gratificante.", stats: { thorns: 100, regen: 100, lifesteal: 10 } },
        "3,2": { nombre: "Arco profesional.", rar: "legendario", icono: "espada", desc: "Un muy buen arco, cuesta una fortuna en los mercados locales, el mapache lo quiere.", stats: { atk: 10, crit: 10 }, habilidades: [{ nombre: "Ojo en el blanco", tipo: "daño", val: 200, desc: "Cuando el portador falla un crítico inflige 200 de daño directo." }] },
        "4,2": { nombre: "Bastón venenoso.", rar: "legendario", icono: "espada", desc: "Ideal para los aquellos que le teman al combate cuerpo a cuerpo.", stats: { veneno: 100, lifesteal: 10, xp: 10 }, habilidades: [{ nombre: "Veneno de unicornio.", tipo: "daño_indirecto", val: 100, desc: "Cada turno el enemigo recibe 100 de daño" }] },
        "5,2": { nombre: "Naturaleza.", rar: "mitico", icono: "espada", desc: "Cada golpe hace temblar el suelo. Alejen al mapache de esta arma.", stats: { atk: 10, veneno: 100, thorns: 100, hp: 200 }, habilidades: [{ nombre: "Naturaleza amenazante.", tipo: "debuff", val: 30, desc: "Disminuye la defensa del rival cuando daña al portador." }] },
        "6,2": { nombre: "Astrología.", rar: "mitico", icono: "espada", desc: "Los signos zodiacales no pegan tan fuerte como las estrellas, pero esto no es un signo zodiacal.", stats: { atk: 20, crit: 20, esq: 20, hp: 200 }, habilidades: [{ nombre: "Zodiaco.", tipo: "boost", val: 10, desc: "Todos los turnos el usuario gana una estadística aleatoria." }] },
        "7,2": { nombre: "Astronomía.", rar: "tornasol", icono: "espada", desc: "Todo el poder de una estrella concentrado en una semilla galáctica. REPITO. ¡NO DEJAR QUE EL MAPACHE TOQUE ESTO!", stats: { atk: 30, crit: 30, lifesteal: 10, oro: 10, xp: 10 }, habilidades: [{ nombre: "Cometa.", tipo: "daño", val: 500, desc: "Inflinge 500 de daño base al enemigo." }] },
        "0,3": { nombre: "Escudito escudiro.", rar: "comun", icono: "espada", desc: "Un escudito humilde de madera.", stats: { def: 5, hp: 10 } },
        "1,3": { nombre: "Escudiro hierriro", rar: "raro", icono: "espada", desc: "Un poco más fuerte que un escudo normal, no aguanta un girasolazo.", stats: { def: 10, hp: 10 } },
        "2,3": { nombre: "Escudito boladiro.", rar: "epico", icono: "espada", desc: "Un simple escudo redondo, poco más que agregar.", stats: { def: 15, hp: 15 } },
        "3,3": { nombre: "Semilla de girasol.", rar: "legendario", icono: "espada", desc: "Aunque sea dorada sigue siendo una semilla de girasol, es capaz de soportar el impacto de un cometa.", stats: { hp: 30, def: 30 }, habilidades: [{ nombre: "Escudo inflorescencia.", tipo: "defensa", val: 300, desc: "El usuario gana 300 de escudo cada 2 turnos." }] },
        "4,3": { nombre: "mini poción", rar: "comun", icono: "espada", desc: "Cura poca vida.", consumible: true, stats: { hp: 50 }, habilidades: [{ nombre: "Cura.", tipo: "soporte", val: 100, desc: "Cura 100 de vida." }] },
        "5,3": { nombre: "Poción.", rar: "raro", icono: "espada", desc: "Cura un poco más.", consumible: true, stats: { hp: 100 }, habilidades: [{ nombre: "Cura.", tipo: "soporte", val: 200, desc: "Cura 200 de vida." }] },
        "6,3": { nombre: "Poción de escudo.", rar: "epico", icono: "espada", desc: "Cura 100 de vida y da 200 de escudo.", stats: { atk: 1 }, habilidades: [{ nombre: "Cura 100 de vida.", tipo: "soporte", val: 100, desc: "Cura 100 de vida y da 200 de escudo." }, { nombre: "Da 200 de escudo.", tipo: "defensa", val: 200, desc: "Cura 100 de vida y da 200 de escudo." }] },
        "7,3": { nombre: "Elixir azul.", rar: "legendario", icono: "espada", desc: "Cura toda la vida y da 30% de la vida máxima como escudo.", stats: { hp: 300 }, habilidades: [{ nombre: "Cura toda la vida.", tipo: "soporte", val: 999999, desc: "Cura toda la vida." }, { nombre: "Da un 30% de la vida máxima como escudo.", tipo: "defensa", val: 0, desc: "Da un 30% de la vida máxima como escudo." }] },
        "0,4": { nombre: "Colgante de escudo.", rar: "mitico", icono: "espada", desc: "Una lágrima de girasol encapsulada.", stats: { def: 50 }, habilidades: [{ nombre: "Lágrima.", tipo: "defensa", val: 300, desc: "Da 300 de escudos todos los turnos." }, { nombre: "Forja.", tipo: "boost", val: 10, desc: "Aumenta la defensa en 10 cada 2 turnos." }] },
        "1,4": { nombre: "Estrella encapsulada.", rar: "mitico", icono: "espada", desc: "Mientras más tiempo pasa encapsulada, más incontrolable se vuelve.", stats: { atk: 20, xp: 20, lifesteal: 10 }, habilidades: [{ nombre: "Liberación.", tipo: "ultimate", val: 300, desc: "Aumenta el ataque del portador en 300" }] },
        "2,4": { nombre: "Colmillo.", rar: "mitico", icono: "espada", desc: "Un colgante hecho con el colmillo de un vampiro, cuidado te pinchas.", stats: { lifesteal: 50 }, habilidades: [{ nombre: "Vampirización.", tipo: "ultimate", val: 100, desc: "Da 100% de robo de vida y 30% del daño del poseedor." }] },
        "3,4": { nombre: "Calavera encapsulada.", rar: "mitico", icono: "espada", desc: "Huele muy mal, ni el mapache quiere este objeto.", stats: { veneno: 500 }, habilidades: [{ nombre: "Putrefacción.", tipo: "debuff", val: 30, desc: "baja el 30 el ataque del rival todos los turnos." }] },
        "4,4": { nombre: "Pergamino de escudo.", rar: "mitico", icono: "espada", desc: "Al leer este pergamino desbloqueas el total conocimiento sobre los escudos.", stats: { def: 100, xp: 40 }, habilidades: [{ nombre: "Conocimiento.", tipo: "boost", val: 50, desc: "cada turno el portador gana 50 de esquivas durante el turno siguiente, dura 1 turno." }] },
        "5,4": { nombre: "Origen de la vida.", rar: "tornasol", icono: "espada", desc: "He acá el inicio de todo.", stats: { hp: 1500 }, habilidades: [{ nombre: "Conocimiento absoluto.", tipo: "pasiva", val: 200, desc: "Todos los turnos el portador se cura 200 de vida." }] },
        "6,4": { nombre: "La experiencia en una tabla.", rar: "legendario", icono: "espada", desc: "Con este pergamino subirás de nivel mucho más rápido.", stats: { xp: 70 } },
        "7,4": { nombre: "Guía de finanzas.", rar: "legendario", icono: "espada", desc: "Con estas clases aprenderás el valor real del suncoin.", stats: { oro: 70 } },
        "0,5": { nombre: "Anillo dorado", rar: "epico", icono: "espada", desc: "Un lujito que te puedes permitir.", stats: { oro: 30 } },
        "1,5": { nombre: "Joya de matrimonio.", rar: "legendario", icono: "espada", desc: "Un lujo que es más doloroso de permitirse, no aprobado por el mapache.", stats: { oro: 40, xp: 10 } },
        "2,5": { nombre: "Anillo de promesa.", rar: "epico", icono: "espada", desc: "Detrás de cada promesa hay un esfuerzo, el mapache lo aprueba.", stats: { oro: 20, xp: 20 } },
        "3,5": { nombre: "Jade.", rar: "legendario", icono: "espada", desc: "Un auténtico anillo de oro y jade, aléjenlo del mapache a toda costa.", stats: { regen: 100, suerte: 20, thorns: 100 } },
        "4,5": { nombre: "Casco de hierro.", rar: "raro", icono: "espada", desc: "Meh, no es muy fuerte.", stats: { def: 10 } },
        "5,5": { nombre: "Casco de guerrero.", rar: "epico", icono: "espada", desc: "Un poco mejor que el casco de hierro.", stats: { def: 10, hp: 10 } },
        "6,5": { nombre: "Ruiseñor.", rar: "legendario", icono: "espada", desc: "Un tanque total, casi impenetrable.", stats: { def: 20, hp: 200, regen: 50 } },
        "7,5": { nombre: "Oda a la incertidumbre.", rar: "mitico", icono: "espada", desc: "El mejor compañero de la oda a la guerra.", stats: { hp: 300, def: 50, thorns: 300, esq: 20 }, habilidades: [{ nombre: "Incertidumbre.", tipo: "boost", val: 10, desc: "Todos los turnos aumenta la defensa en 10" }] },
        "0,6": { nombre: "Botas de cuero.", rar: "comun", icono: "espada", desc: "Poco útiles, pero no irás descalzo.", stats: { hp: 5 } },
        "1,6": { nombre: "Botas de hierro.", rar: "raro", icono: "espada", desc: "Un poco más útiles, desprenden algo de brillo.", stats: { hp: 10 } },
        "2,6": { nombre: "Botas doradas.", rar: "legendario", icono: "espada", desc: "Deslumbran a donde sea que pisen.", stats: { hp: 50, esq: 30 } },
        "3,6": { nombre: "Zapatos de mago.", rar: "mitico", icono: "espada", desc: "Con estos zapatos serás casi invencible, casi...", stats: { esq: 50, def: 50, hp: 100 }, habilidades: [{ nombre: "El magooooooooo", tipo: "boost", val: 5, desc: "Todos los turnos el portador gana 5 de esquivas por 2 turnos." }] },
        "4,6": { nombre: "Maguito Manguito.", rar: "tornasol", icono: "espada", desc: "Un objeto tornasol.", stats: { crit: 50, atk: 50, def: -300, esq: 20 }, habilidades: [{ nombre: "El magooooooooooooooooooooo", tipo: "pasiva", val: 0, desc: "Todos los turnos el portador pierde 5 de defensa a cambio de ganar % de crítico y 5% de esquivas." }] },
        "5,6": { nombre: "Capa de Mago Arcano.", rar: "epico", icono: "espada", desc: "Tejida con hilos de maná puro. Repele hechizos y maleficios de brujas.", stats: { def: 18, mana: 30, esq: 15 } },
        "6,6": { nombre: "Máscara de los Susurros.", rar: "epico", icono: "espada", desc: "Oculta tu rostro y confunde a los enemigos en la espesura del bosque.", stats: { def: 15, crit: 20, esq: 25 } },
        "7,6": { nombre: "Capa de Sombras Nocturna.", rar: "legendario", icono: "espada", desc: "Manto tejido con la misma oscuridad nocturna. Te vuelve casi invisible ante cualquier amenaza.", stats: { def: 35, esq: 45, hp: 120 }, habilidades: [{ nombre: "Fusión Sombría.", tipo: "defensa", val: 150, desc: "Otorga 150 de escudo y 30% de esquiva por 3 turnos." }] },
        "0,7": { nombre: "Capucha de bandido.", rar: "epico", icono: "espada", desc: "Extremadamente útil si eres un mapache.", stats: { oro: 49 } },
        "1,7": { nombre: "Peto de hierro", rar: "epico", icono: "espada", desc: "Bastante útil si te gusta pelear cuerpo a cuerpo.", stats: { esq: 10, def: 10 } },
        "2,7": { nombre: "Oda a la miseria.", rar: "mitico", icono: "espada", desc: "Junto a la oda a la guerra y la oda a la incertidumbre es imparable.", stats: { esq: 40, thorns: 200, veneno: 100, lifesteal: 10 }, habilidades: [{ nombre: "Miseria.", tipo: "daño_indirecto", val: 300, desc: "Cada 3 turnos el enemigo pierden 300 de vida." }] },
        "3,7": { nombre: "Armadura Dorada del Rey Girasol.", rar: "legendario", icono: "espada", desc: "Forjada con oro fundido y resina sagrada de girasol. Resiste hasta el embate de un dragón.", stats: { def: 60, hp: 250, regen: 40 }, habilidades: [{ nombre: "Aura Dorada.", tipo: "boost", val: 25, desc: "Aumenta la defensa en 25 permanentemente durante el combate." }] },
        "4,7": { nombre: "Mano de mono.", rar: "mitico", icono: "espada", desc: "Extremadamente útil si eres un mapache.", stats: { oro: 100 } },
        "5,7": { nombre: "Guantelete Umbrío.", rar: "epico", icono: "espada", desc: "Canaliza energía sombría hacia las puntas de los dedos para asestar golpes letales.", stats: { def: 20, atk: 25, lifesteal: 15 } },
        "6,7": { nombre: "Garra de Bestia Feroz.", rar: "epico", icono: "espada", desc: "Afilada como navaja, arrebatada a una quimera en combate singular.", stats: { atk: 35, crit: 25, sangrado: 20 }, habilidades: [{ nombre: "Desgarro Sangriento.", tipo: "pasiva", val: 20, desc: "Tus ataques provocan sangrado al enemigo, causándole daño en cada turno." }] },
        "7,7": { nombre: "Guantelete del Poder Titánico.", rar: "legendario", icono: "espada", desc: "Otorga una fuerza sobrehumana capaz de quebrar la roca más densa con un solo puñetazo.", stats: { atk: 45, def: 30, hp: 150 }, habilidades: [{ nombre: "Golpe Titánico.", tipo: "daño", val: 250, desc: "Asesta un impacto devastador de 250 de daño directo." }] },
        "0,8": { nombre: "Manzana verde.", rar: "epico", icono: "espada", desc: "Sube el ataque y cura 100 de vida.", consumible: true, stats: { atk: 10 }, habilidades: [{ nombre: "Dulzor.", tipo: "soporte", val: 100, desc: "Cura 100 de vida." }] },
        "1,8": { nombre: "Queso para dragones.", rar: "mitico", icono: "espada", desc: "Si no eres un dragón ni te acerques.", stats: { atk: 10 }, habilidades: [{ nombre: "Queso divino.", tipo: "ultimate", val: 0, desc: "Cura toda la vida y sube el ataque en 50 si eres un dragón." }] },
        "2,8": { nombre: "Buebito fiito.", rar: "comun", icono: "espada", desc: "Cura un poco.", stats: { hp: 100 }, habilidades: [{ nombre: "Cura Buebito fito.", tipo: "soporte", val: 100, desc: "Cura 100 de vida." }] },
        "3,8": { nombre: "Tarta demorah.", rar: "legendario", icono: "espada", desc: "Un objeto legendario.", stats: { esq: 20 }, habilidades: [{ nombre: "Demorah", tipo: "ultimate", val: 100, desc: "Da 100 de esquivas por 2 turnos." }] },
        "4,8": { nombre: "Llave dorada.", rar: "epico", icono: "espada", desc: "Sirve para abrir el Cofre Dorado.", consumible: true, stats: { crit: 10 } },
        "5,8": { nombre: "Llave común.", rar: "raro", icono: "espada", desc: "Sirve para abrir el Cofre Plateado (de hierro).", consumible: true, stats: { oro: 10 } },
        "6,8": { nombre: "Vela de mucha gracia.", rar: "tornasol", icono: "espada", desc: "Si estás cerca de esta vela ningún mal económico te perseguirá.", stats: { oro: 200 } },
        "7,8": { nombre: "Caldo de pollo.", rar: "tornasol", icono: "espada", desc: "Inteligencia absoluta en un solo saldo.", stats: { xp: 200 } }

    };

    /* ============================================
       Helper: obtener info de un sprite
       ============================================ */
    window.getSpriteInfo = function (col, row) {
        return window.SPRITE_NAMES[`${col},${row}`] || null;
    };

    /* ============================================
       Helper: obtener nombre legible
       ============================================ */
    window.getSpriteName = function (col, row) {
        const info = window.getSpriteInfo(col, row);
        return info ? info.nombre : `Objeto [${col},${row}]`;
    };

    console.log("✅ sprite-names.js cargado ·", Object.keys(window.SPRITE_NAMES).length, "objetos nombrados");
})();