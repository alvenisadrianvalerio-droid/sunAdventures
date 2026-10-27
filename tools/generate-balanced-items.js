const fs = require('fs');

const items = {
    // FILA 0: Espadas y Filos
    '0,0': { id: 'item-0-0', nombre: 'Espada simple.', rar: 'comun', icono: 'espada', desc: 'No es tan fuerte, apenas y puede hacerle un rasguño a los girasoles.', stats: { atk: 5, crit: 2 }, tipo: 'atk' },
    '1,0': { id: 'item-1-0', nombre: 'Espada de guerrero.', rar: 'raro', icono: 'espada', desc: 'Una buena espada, simple y bastante robusta. Ataque y defensa equilibrados.', stats: { atk: 10, def: 5, crit: 4 }, tipo: 'atk' },
    '2,0': { id: 'item-2-0', nombre: 'Daga', rar: 'raro', icono: 'espada', desc: 'Muy rápida, es el arma favorita del mapache.', stats: { atk: 12, esq: 5, oro: 8 }, tipo: 'atk' },
    '3,0': { id: 'item-3-0', nombre: 'Espada de pirata.', rar: 'epico', icono: 'espada', desc: 'Robada en las ruinas desérticas. Eficaz para saquear beneficios.', stats: { atk: 20, crit: 8, oro: 15, esq: 6 }, afijo: 'saqueador', tipo: 'atk' },
    '4,0': { id: 'item-4-0', nombre: 'Espada de marine', rar: 'epico', icono: 'espada', desc: 'Si portas esta arma naval, más te vale estar listo para la batalla.', stats: { atk: 22, def: 12, hp: 60 }, afijo: 'sed_de_sangre', tipo: 'atk' },
    '5,0': { id: 'item-5-0', nombre: 'Espada flora.', rar: 'legendario', icono: 'espada', desc: 'Lleva el corazón de un girasol dentro. Otorga la bendición de las inflorescencias.', stats: { atk: 30, def: 20, regen: 15, hp: 140 }, afijo: 'sobrecarga_solar', tipo: 'atk', habilidades: [{ nombre: 'Bendición de las inflorescencias.', tipo: 'pasiva', val: 1, desc: 'Cura al portador 6% de su vida por turno.' }] },
    '6,0': { id: 'item-6-0', nombre: 'Espada fauna.', rar: 'mitico', icono: 'espada', desc: 'Posee el poder de los espíritus del bosque embrujado.', stats: { atk: 48, lifesteal: 14, veneno: 25, hp: 200 }, afijo: 'sed_de_sangre', tipo: 'atk', habilidades: [{ nombre: 'Alma animal.', tipo: 'daño_indirecto', val: 30, desc: 'Drena el alma del enemigo cada turno.' }] },
    '7,0': { id: 'item-7-0', nombre: 'Espada Girasol.', rar: 'mitico', icono: 'espada', desc: 'El poder absoluto sobre flora y fauna. Control total sobre lo vivo.', stats: { atk: 52, def: 35, regen: 20, lifesteal: 15, thorns: 30, hp: 280 }, afijo: 'sobrecarga_solar', tipo: 'atk', habilidades: [{ nombre: 'Alma animal.', tipo: 'daño_indirecto', val: 30, desc: 'Drena el alma del enemigo.' }, { nombre: 'Bendición de las inflorescencias.', tipo: 'pasiva', val: 0, desc: 'Cura 8% de la vida máxima por turno.' }, { nombre: 'Poder absoluto.', tipo: 'pasiva', val: 0, desc: 'Al vencer a un enemigo te curas todo el daño del golpe final.' }] },

    // FILA 1: Lanzas y Armas Pesadas
    '0,1': { id: 'item-0-1', nombre: 'Lanza', rar: 'comun', icono: 'espada', desc: 'Un arma sencilla pero punzante, eficaz para mantener distancia.', stats: { atk: 6, crit: 3 }, tipo: 'atk' },
    '1,1': { id: 'item-1-1', nombre: 'Lanza reforzada', rar: 'raro', icono: 'espada', desc: 'Más robusta que una lanza normal con punta acerada.', stats: { atk: 12, def: 6, crit: 4 }, tipo: 'atk' },
    '2,1': { id: 'item-2-1', nombre: 'Tridente', rar: 'legendario', icono: 'espada', desc: 'Canaliza la fuerza implacable de las mareas oceánicas.', stats: { atk: 36, def: 18, regen: 12, hp: 120 }, afijo: 'baluarte_espinoso', tipo: 'atk', habilidades: [{ nombre: 'Furia de los mares.', tipo: 'boost', val: 0, desc: 'Cada 2 turnos ganas +5 de ataque acumulativo.' }] },
    '3,1': { id: 'item-3-1', nombre: 'Filo grueso.', rar: 'legendario', icono: 'espada', desc: 'Un filo colosal que enciende las llamas de combate.', stats: { atk: 40, lifesteal: 12, hp: 150, crit: 10 }, afijo: 'sed_de_sangre', tipo: 'atk', habilidades: [{ nombre: 'Corte ardiente.', tipo: 'daño_indirecto', val: 35, desc: 'Inflige daño de fuego abrasador todos los turnos.' }] },
    '4,1': { id: 'item-4-1', nombre: 'Hachita.', rar: 'epico', icono: 'espada', desc: 'Un hacha contundente capaz de quebrar armaduras.', stats: { atk: 24, crit: 8, def: 5 }, afijo: 'sed_de_sangre', tipo: 'atk' },
    '5,1': { id: 'item-5-1', nombre: 'Mazo', rar: 'epico', icono: 'espada', desc: 'Pesado martillo que absorbe y descarga impactos demoledores.', stats: { atk: 18, def: 20, hp: 80 }, afijo: 'baluarte_espinoso', tipo: 'def' },
    '6,1': { id: 'item-6-1', nombre: 'Oda a la guerra.', rar: 'legendario', icono: 'espada', desc: 'Ningún jefe resiste el toque de la marcha marcial.', stats: { atk: 38, def: 22, lifesteal: 12, hp: 180 }, afijo: 'sed_de_sangre', tipo: 'atk', habilidades: [{ nombre: 'Oneshot.', tipo: 'defensa', val: 100, desc: 'Ganas 150 de escudo por turno. Si recibes golpe letal, revives al 50% HP.' }] },
    '7,1': { id: 'item-7-1', nombre: 'Rebanadora.', rar: 'mitico', icono: 'espada', desc: 'No solo corta pan, es capaz de cortar el viento mismo.', stats: { atk: 54, esq: 18, regen: 25, hp: 220, crit: 14 }, afijo: 'velo_espectral', tipo: 'atk' },

    // FILA 2: Arcos y Armas Mágicas
    '0,2': { id: 'item-0-2', nombre: 'Arco endeble', rar: 'comun', icono: 'espada', desc: 'Arco básico de cazador novato.', stats: { atk: 5, crit: 4 }, tipo: 'atk' },
    '1,2': { id: 'item-1-2', nombre: 'Arco reforzado', rar: 'raro', icono: 'espada', desc: 'Tensado con fibras reforzadas para atravesar corazas.', stats: { atk: 11, crit: 7, esq: 4 }, tipo: 'atk' },
    '2,2': { id: 'item-2-2', nombre: 'Arco arpa', rar: 'legendario', icono: 'espada', desc: 'Melodía mortífera que hace sangrar y desgarrar a la distancia.', stats: { atk: 32, regen: 16, lifesteal: 10, thorns: 25, hp: 120 }, afijo: 'sobrecarga_solar', tipo: 'atk' },
    '3,2': { id: 'item-3-2', nombre: 'Arco profesional.', rar: 'legendario', icono: 'espada', desc: 'Precisión milimétrica codiciada en todos los mercados.', stats: { atk: 38, crit: 18, esq: 10 }, afijo: 'velo_espectral', tipo: 'atk', habilidades: [{ nombre: 'Ojo en el blanco', tipo: 'daño', val: 200, desc: 'Cuando fallas un golpe crítico infliges 200 de daño verdadero.' }] },
    '4,2': { id: 'item-4-2', nombre: 'Bastón venenoso.', rar: 'legendario', icono: 'espada', desc: 'Canaliza toxinas arcanas a gran distancia.', stats: { atk: 28, veneno: 30, lifesteal: 10, xp: 20, hp: 100 }, afijo: 'sed_de_sangre', tipo: 'atk', habilidades: [{ nombre: 'Veneno de unicornio.', tipo: 'daño_indirecto', val: 100, desc: 'Aplica 100 de veneno residual al enemigo por turno.' }] },
    '5,2': { id: 'item-5-2', nombre: 'Naturaleza.', rar: 'mitico', icono: 'espada', desc: 'Cada golpe hace temblar la corteza terrestre.', stats: { atk: 44, def: 30, veneno: 35, thorns: 35, hp: 320 }, afijo: 'baluarte_espinoso', tipo: 'atk', habilidades: [{ nombre: 'Naturaleza amenazante.', tipo: 'debuff', val: 30, desc: 'Reduce permanentemente la defensa del rival al impactar.' }] },
    '6,2': { id: 'item-6-2', nombre: 'Astrología.', rar: 'mitico', icono: 'espada', desc: 'Los astros ancestrales guían cada proyectil.', stats: { atk: 46, crit: 22, esq: 16, hp: 260 }, afijo: 'sobrecarga_solar', tipo: 'atk', habilidades: [{ nombre: 'Zodiaco.', tipo: 'boost', val: 10, desc: 'Cada turno ganas una mejora de estadística aleatoria.' }] },
    '7,2': { id: 'item-7-2', nombre: 'Astronomía.', rar: 'tornasol', icono: 'espada', desc: 'La fuerza de una supernova concentrada en un núcleo estelar.', stats: { atk: 85, crit: 30, lifesteal: 18, oro: 40, xp: 40, hp: 450 }, afijo: 'sobrecarga_solar', tipo: 'atk', habilidades: [{ nombre: 'Cometa Astral.', tipo: 'daño', val: 1800, desc: 'Invoca un cometa celestial que inflige 1800 daño e incendia al rival.' }, { nombre: 'Poder Estelar.', tipo: 'boost', val: 35, desc: 'Canaliza radiación cósmica aumentando el daño un +35% acumulativo.' }] },

    // FILA 3: Escudos y Pociones Básicas
    '0,3': { id: 'item-0-3', nombre: 'Escudito escudiro.', rar: 'comun', icono: 'espada', desc: 'Un escudito humilde de madera tallada.', stats: { def: 6, hp: 40 }, tipo: 'def' },
    '1,3': { id: 'item-1-3', nombre: 'Escudiro hierriro', rar: 'raro', icono: 'espada', desc: 'Forjado con placas de hierro remachadas.', stats: { def: 14, hp: 80, thorns: 6 }, tipo: 'def' },
    '2,3': { id: 'item-2-3', nombre: 'Escudito boladiro.', rar: 'epico', icono: 'espada', desc: 'Escudo redondo de justa que desvía estocadas.', stats: { def: 24, hp: 150, thorns: 14 }, afijo: 'baluarte_espinoso', tipo: 'def' },
    '3,3': { id: 'item-3-3', nombre: 'Semilla de girasol.', rar: 'legendario', icono: 'espada', desc: 'Resiste el embate de un cometa gracias a su resina.', stats: { def: 42, hp: 260, regen: 14 }, afijo: 'baluarte_espinoso', tipo: 'def', habilidades: [{ nombre: 'Escudo inflorescencia.', tipo: 'defensa', val: 300, desc: 'Genera 250 de escudo cada 2 turnos.' }] },
    '4,3': { id: 'item-4-3', nombre: 'mini poción', rar: 'comun', icono: 'espada', desc: 'Restaura un 25% de la salud máxima.', consumible: true, stats: { hp: 40 }, tipo: 'hp', cooldown: 3, habilidades: [{ nombre: 'Cura Menor', tipo: 'soporte', val: 25, desc: 'Restaura 25% HP máx (Cooldown: 3 turnos).' }] },
    '5,3': { id: 'item-5-3', nombre: 'Poción.', rar: 'raro', icono: 'espada', desc: 'Restaura un 45% de la salud máxima.', consumible: true, stats: { hp: 90 }, tipo: 'hp', cooldown: 3, habilidades: [{ nombre: 'Cura Media', tipo: 'soporte', val: 45, desc: 'Restaura 45% HP máx (Cooldown: 3 turnos).' }] },
    '6,3': { id: 'item-6-3', nombre: 'Poción de escudo.', rar: 'epico', icono: 'espada', desc: 'Restaura 60% HP y genera una barrera defensiva.', consumible: true, stats: { hp: 160, def: 20 }, tipo: 'hp', cooldown: 3, habilidades: [{ nombre: 'Cura Acorazada', tipo: 'soporte', val: 60, desc: 'Restaura 60% HP y otorga 200 de escudo.' }] },
    '7,3': { id: 'item-7-3', nombre: 'Elixir azul.', rar: 'legendario', icono: 'espada', desc: 'Restaura toda la salud y otorga 40% escudo.', consumible: true, stats: { hp: 300, def: 35 }, tipo: 'hp', cooldown: 4, habilidades: [{ nombre: 'Elixir de Restauración Total', tipo: 'soporte', val: 100, desc: 'Restaura 100% de la vida y otorga 40% como escudo.' }] },

    // FILA 4: Reliquias y Amuletos Míticos
    '0,4': { id: 'item-0-4', nombre: 'Colgante de escudo.', rar: 'mitico', icono: 'espada', desc: 'Una lágrima de girasol encapsulada que blinda el aura.', stats: { def: 55, hp: 350, regen: 22 }, afijo: 'baluarte_espinoso', tipo: 'def', habilidades: [{ nombre: 'Lágrima.', tipo: 'defensa', val: 300, desc: 'Genera 200 de escudo y +15 DEF cada 2 turnos.' }] },
    '1,4': { id: 'item-1-4', nombre: 'Estrella encapsulada.', rar: 'mitico', icono: 'espada', desc: 'Energía lumínica que desata furia estelar en combate.', stats: { atk: 45, lifesteal: 14, xp: 25, hp: 200 }, afijo: 'sobrecarga_solar', tipo: 'atk', habilidades: [{ nombre: 'Liberación.', tipo: 'ultimate', val: 300, desc: 'Incrementa temporalmente el ataque en +120.' }] },
    '2,4': { id: 'item-2-4', nombre: 'Colmillo.', rar: 'mitico', icono: 'espada', desc: 'Arrancado de un conde vampírico milenario.', stats: { atk: 42, lifesteal: 22, crit: 16, hp: 180 }, afijo: 'sed_de_sangre', tipo: 'atk', habilidades: [{ nombre: 'Vampirización.', tipo: 'ultimate', val: 100, desc: 'Robo de vida potenciado al 60% por 3 turnos.' }] },
    '3,4': { id: 'item-3-4', nombre: 'Calavera encapsulada.', rar: 'mitico', icono: 'espada', desc: 'Emana un miasma pestilente que corroe la voluntad del rival.', stats: { def: 35, veneno: 45, thorns: 35, hp: 250 }, afijo: 'baluarte_espinoso', tipo: 'def', habilidades: [{ nombre: 'Putrefacción.', tipo: 'debuff', val: 30, desc: 'Reduce el ataque rival en un 30% continuo.' }] },
    '4,4': { id: 'item-4-4', nombre: 'Pergamino de escudo.', rar: 'mitico', icono: 'espada', desc: 'Doctrina arcana del bloqueo perfecto.', stats: { def: 58, esq: 18, xp: 30, hp: 280 }, afijo: 'velo_espectral', tipo: 'def', habilidades: [{ nombre: 'Conocimiento.', tipo: 'boost', val: 50, desc: 'Otorga +35% de evasión durante el siguiente turno.' }] },
    '5,4': { id: 'item-5-4', nombre: 'Origen de la vida.', rar: 'tornasol', icono: 'espada', desc: 'La chispa original de la creación biológica.', stats: { hp: 850, def: 65, regen: 45, thorns: 40 }, afijo: 'baluarte_espinoso', tipo: 'def', habilidades: [{ nombre: 'Conocimiento absoluto.', tipo: 'pasiva', val: 400, desc: 'Regenera 350 HP y otorga 250 de escudo primordial por turno.' }, { nombre: 'Génesis Cósmica.', tipo: 'soporte', val: 1500, desc: 'Cura 1000 HP al instante y purifica estados alterados.' }] },
    '6,4': { id: 'item-6-4', nombre: 'La experiencia en una tabla.', rar: 'legendario', icono: 'espada', desc: 'Secretos tácticos para acelerar el aprendizaje heroico.', stats: { xp: 45, def: 15, hp: 100 }, tipo: 'util' },
    '7,4': { id: 'item-7-4', nombre: 'Guía de finanzas.', rar: 'legendario', icono: 'espada', desc: 'Enseña a multiplicar cada moneda obtenida.', stats: { oro: 45, atk: 15, hp: 100 }, tipo: 'util' },

    // FILA 5: Joyas y Yelmos
    '0,5': { id: 'item-0-5', nombre: 'Anillo dorado', rar: 'epico', icono: 'espada', desc: 'Sello de nobleza que atrae riqueza.', stats: { oro: 25, atk: 12, hp: 50 }, tipo: 'util' },
    '1,5': { id: 'item-1-5', nombre: 'Joya de matrimonio.', rar: 'legendario', icono: 'espada', desc: 'Promesa inquebrantable de unión y lealtad.', stats: { oro: 35, xp: 25, def: 20, hp: 140 }, afijo: 'sobrecarga_solar', tipo: 'util' },
    '2,5': { id: 'item-2-5', nombre: 'Anillo de promesa.', rar: 'epico', icono: 'espada', desc: 'Testimonio de esfuerzo y devoción.', stats: { oro: 20, xp: 20, atk: 14, hp: 70 }, tipo: 'util' },
    '3,5': { id: 'item-3-5', nombre: 'Jade.', rar: 'legendario', icono: 'espada', desc: 'Piedra imperial con poder regenerativo y espinoso.', stats: { regen: 18, suerte: 15, thorns: 30, hp: 180 }, afijo: 'baluarte_espinoso', tipo: 'def' },
    '4,5': { id: 'item-4-5', nombre: 'Casco de hierro.', rar: 'raro', icono: 'espada', desc: 'Yelmo sólido que protege la cabeza de golpes directos.', stats: { def: 12, hp: 60 }, tipo: 'def' },
    '5,5': { id: 'item-5-5', nombre: 'Casco de guerrero.', rar: 'epico', icono: 'espada', desc: 'Yelmo reforzado con visera de acero templado.', stats: { def: 20, atk: 8, hp: 120 }, afijo: 'sed_de_sangre', tipo: 'def' },
    '6,5': { id: 'item-6-5', nombre: 'Ruiseñor.', rar: 'legendario', icono: 'espada', desc: 'Armadura pesada de baluarte casi impenetrable.', stats: { def: 40, hp: 280, regen: 16 }, afijo: 'baluarte_espinoso', tipo: 'def' },
    '7,5': { id: 'item-7-5', nombre: 'Oda a la incertidumbre.', rar: 'mitico', icono: 'espada', desc: 'Inspiración caótica que refuerza la defensa cada asalto.', stats: { def: 48, hp: 360, thorns: 40, esq: 14 }, afijo: 'baluarte_espinoso', tipo: 'def', habilidades: [{ nombre: 'Incertidumbre.', tipo: 'boost', val: 10, desc: 'Incrementa la defensa en +12 acumulativo cada turno.' }] },

    // FILA 6: Botas, Capas y Magia
    '0,6': { id: 'item-0-6', nombre: 'Botas de cuero.', rar: 'comun', icono: 'espada', desc: 'Calzado ligero para caminar por el campo.', stats: { hp: 35, esq: 3 }, tipo: 'def' },
    '1,6': { id: 'item-1-6', nombre: 'Botas de hierro.', rar: 'raro', icono: 'espada', desc: 'Pasos firmes protegidos con grebas metálicas.', stats: { def: 8, hp: 70, esq: 5 }, tipo: 'def' },
    '2,6': { id: 'item-2-6', nombre: 'Botas doradas.', rar: 'legendario', icono: 'espada', desc: 'Pisadas ágiles que deslumbran al enemigo.', stats: { def: 22, esq: 16, hp: 160, oro: 20 }, afijo: 'velo_espectral', tipo: 'def' },
    '3,6': { id: 'item-3-6', nombre: 'Zapatos de mago.', rar: 'mitico', icono: 'espada', desc: 'Permiten levitar sobre el peligro con reflejos arcanos.', stats: { esq: 22, def: 35, hp: 220, crit: 14 }, afijo: 'velo_espectral', tipo: 'def', habilidades: [{ nombre: 'El magooooooooo', tipo: 'boost', val: 5, desc: 'Ganas +8% de evasión por 2 turnos.' }] },
    '4,6': { id: 'item-4-6', nombre: 'Maguito Manguito.', rar: 'tornasol', icono: 'espada', desc: 'Poder caótico tornasol. Sacrifica defensa por crítico letal.', stats: { atk: 90, crit: 35, esq: 24, def: -25, hp: 380 }, afijo: 'velo_espectral', tipo: 'atk', habilidades: [{ nombre: 'El magooooooooooooooooooooo', tipo: 'pasiva', val: 0, desc: 'Canaliza caos: +15% crítico, +10% esquiva y rayo de 450 daño arcano.' }, { nombre: 'Trascendencia Espectral.', tipo: 'ultimate', val: 1200, desc: '1200 de daño arcano e incrementa la evasión al 100% por 1 turno.' }] },
    '5,6': { id: 'item-5-6', nombre: 'Capa de Mago Arcano.', rar: 'epico', icono: 'espada', desc: 'Tejida con hilos de maná que repelen hechizos.', stats: { def: 18, esq: 12, hp: 90 }, afijo: 'velo_espectral', tipo: 'def' },
    '6,6': { id: 'item-6-6', nombre: 'Máscara de los Susurros.', rar: 'epico', icono: 'espada', desc: 'Oculta la presencia permitiendo ataques sorpresivos.', stats: { atk: 16, crit: 12, esq: 14 }, afijo: 'velo_espectral', tipo: 'atk' },
    '7,6': { id: 'item-7-6', nombre: 'Capa de Sombras Nocturna.', rar: 'legendario', icono: 'espada', desc: 'Manto tejido con oscuridad líquida que te difumina.', stats: { def: 26, esq: 20, hp: 180, crit: 10 }, afijo: 'velo_espectral', tipo: 'def', habilidades: [{ nombre: 'Fusión Sombría.', tipo: 'defensa', val: 150, desc: 'Otorga 180 de escudo y +20% esquiva por 3 turnos.' }] },

    // FILA 7: Guanteletes y Armaduras Colosales
    '0,7': { id: 'item-0-7', nombre: 'Capucha de bandido.', rar: 'epico', icono: 'espada', desc: 'Prenda astuta que multiplica el botín recogido.', stats: { oro: 35, esq: 10, atk: 12 }, tipo: 'util' },
    '1,7': { id: 'item-1-7', nombre: 'Peto de hierro', rar: 'epico', icono: 'espada', desc: 'Placas macizas para combate cuerpo a cuerpo.', stats: { def: 22, hp: 140, esq: 6 }, afijo: 'baluarte_espinoso', tipo: 'def' },
    '2,7': { id: 'item-2-7', nombre: 'Oda a la miseria.', rar: 'mitico', icono: 'espada', desc: 'Castigo implacable que desgasta al rival con espinas y veneno.', stats: { def: 38, thorns: 45, veneno: 30, lifesteal: 14, hp: 280 }, afijo: 'baluarte_espinoso', tipo: 'def', habilidades: [{ nombre: 'Miseria.', tipo: 'daño_indirecto', val: 300, desc: 'Cada 2 turnos el enemigo pierde 200 de vida.' }] },
    '3,7': { id: 'item-3-7', nombre: 'Armadura Dorada del Rey Girasol.', rar: 'legendario', icono: 'espada', desc: 'Forjada con oro solar purificado y savia sagrada.', stats: { def: 44, hp: 320, regen: 18 }, afijo: 'baluarte_espinoso', tipo: 'def', habilidades: [{ nombre: 'Aura Dorada.', tipo: 'boost', val: 25, desc: 'Aumenta la defensa en +25 permanente durante el combate.' }] },
    '4,7': { id: 'item-4-7', nombre: 'Mano de mono.', rar: 'mitico', icono: 'espada', desc: 'Reliquia de fortuna extrema venerada por mapaches.', stats: { oro: 60, suerte: 25, atk: 20 }, afijo: 'sobrecarga_solar', tipo: 'util' },
    '5,7': { id: 'item-5-7', nombre: 'Guantelete Umbrío.', rar: 'epico', icono: 'espada', desc: 'Canaliza sombras cortantes hacia los nudillos.', stats: { atk: 22, def: 14, lifesteal: 10, hp: 80 }, afijo: 'sed_de_sangre', tipo: 'atk' },
    '6,7': { id: 'item-6-7', nombre: 'Garra de Bestia Feroz.', rar: 'epico', icono: 'espada', desc: 'Garras afiladas que causan sangrado profundo.', stats: { atk: 26, crit: 14, hp: 70 }, afijo: 'sed_de_sangre', tipo: 'atk', habilidades: [{ nombre: 'Desgarro Sangriento.', tipo: 'pasiva', val: 20, desc: 'Provoca sangrado letal de 25 daño/turno.' }] },
    '7,7': { id: 'item-7-7', nombre: 'Guantelete del Poder Titánico.', rar: 'legendario', icono: 'espada', desc: 'Fuerza aplastante para demoler cualquier obstáculo.', stats: { atk: 42, def: 24, hp: 180, crit: 10 }, afijo: 'sed_de_sangre', tipo: 'atk', habilidades: [{ nombre: 'Golpe Titánico.', tipo: 'daño', val: 250, desc: 'Impacto demoledor de 250 de daño directo.' }] },

    // FILA 8: Consumibles Mayores y Llaves
    '0,8': { id: 'item-0-8', nombre: 'Manzana verde.', rar: 'epico', icono: 'espada', desc: 'Cura 50% de vida y otorga un buff temporal de ataque.', consumible: true, stats: { hp: 140, atk: 15 }, tipo: 'hp', cooldown: 3, habilidades: [{ nombre: 'Dulzor Revitalizante', tipo: 'soporte', val: 50, desc: 'Cura 50% HP máx y otorga +15 ATK por 3 turnos.' }] },
    '1,8': { id: 'item-1-8', nombre: 'Queso para dragones.', rar: 'mitico', icono: 'espada', desc: 'Manjar para bestias legendarias que restaura la vitalidad.', consumible: true, stats: { hp: 350, atk: 25 }, tipo: 'hp', cooldown: 3, habilidades: [{ nombre: 'Queso Divino', tipo: 'ultimate', val: 80, desc: 'Restaura 80% HP y otorga +30 ATK.' }] },
    '2,8': { id: 'item-2-8', nombre: 'Buebito fiito.', rar: 'comun', icono: 'espada', desc: 'Tentempié humilde pero reconfortante.', consumible: true, stats: { hp: 50 }, tipo: 'hp', cooldown: 3, habilidades: [{ nombre: 'Refrigerio Casero', tipo: 'soporte', val: 30, desc: 'Cura 30% HP máx.' }] },
    '3,8': { id: 'item-3-8', nombre: 'Tarta demorah.', rar: 'legendario', icono: 'espada', desc: 'Receta ancestral que aporta agilidad felina temporal.', consumible: true, stats: { hp: 200, esq: 15 }, tipo: 'hp', cooldown: 3, habilidades: [{ nombre: 'Demorah', tipo: 'ultimate', val: 100, desc: 'Otorga +50% evasión por 2 turnos y cura 60% HP.' }] },
    '4,8': { id: 'item-4-8', nombre: 'Llave dorada.', rar: 'epico', icono: 'espada', desc: 'Sirve exclusivamente para abrir el Cofre Dorado.', consumible: true, stats: { suerte: 15 }, tipo: 'key' },
    '5,8': { id: 'item-5-8', nombre: 'Llave plateada.', rar: 'raro', icono: 'espada', desc: 'Sirve exclusivamente para abrir el Cofre Plateado (hierro).', consumible: true, stats: { oro: 10 }, tipo: 'key' },
    '6,8': { id: 'item-6-8', nombre: 'Vela de mucha gracia.', rar: 'tornasol', icono: 'espada', desc: 'Llama sagrada incombustible que rechaza la muerte súbita.', stats: { oro: 60, def: 55, hp: 650 }, afijo: 'sobrecarga_solar', tipo: 'util', habilidades: [{ nombre: 'Aura de Gracia Infinita.', tipo: 'soporte', val: 1000, desc: 'Crea escudo de 800 y otorga +50% oro en combate.' }, { nombre: 'Milagro de la Gracia.', tipo: 'defensa', val: 500, desc: 'Anula la muerte una vez por combate y revive con 500 HP.' }] },
    '7,8': { id: 'item-7-8', nombre: 'Caldo de pollo.', rar: 'tornasol', icono: 'espada', desc: 'La panacea elaborada con el vapor de mil estrellas.', stats: { xp: 60, atk: 75, hp: 700 }, afijo: 'sed_de_sangre', tipo: 'util', habilidades: [{ nombre: 'Hervor Galáctico.', tipo: 'daño', val: 1400, desc: 'Desata 1400 de daño estelar y aturde 2 turnos al enemigo.' }, { nombre: 'Nutrición Cósmica.', tipo: 'soporte', val: 800, desc: 'Restaura 800 HP y otorga +30 ATK permanente.' }] }
};

const lines = Object.entries(items).map(([coord, it]) => {
  let s = '        "' + coord + '": { ';
  s += 'id: "' + it.id + '", ';
  s += 'nombre: "' + it.nombre + '", ';
  s += 'rar: "' + it.rar + '", ';
  s += 'icono: "' + it.icono + '", ';
  s += 'tipo: "' + it.tipo + '", ';
  s += 'desc: "' + it.desc + '", ';
  if (it.consumible) s += 'consumible: true, ';
  if (it.cooldown) s += 'cooldown: ' + it.cooldown + ', ';
  if (it.afijo) s += 'afijo: "' + it.afijo + '", ';
  s += 'stats: ' + JSON.stringify(it.stats);
  if (it.habilidades) s += ', habilidades: ' + JSON.stringify(it.habilidades);
  s += ' },';
  return s;
});

const output = `/* ============================================================
   SPRITE-NAMES.JS — Nombres coherentes para el sprite sheet
   Basado en Admurin's Armory (itch.io)
   Formato: "col,row": { id, nombre, rar, icono, tipo, desc, stats, consumible?, afijo?, habilidades? }
   Tipos:  atk · def · hp · key · util
   Rarezas: comun · raro · epico · legendario · mitico · tornasol
   Afijos: sed_de_sangre · baluarte_espinoso · velo_espectral · sobrecarga_solar · saqueador
   ============================================================ */
(function () {
    "use strict";

    window.SPRITE_NAMES = {

        // --- MAPEO REBALANCEADO DE 72 ITEMS (loot-2.png 8x9) ---
${lines.join('\n')}

    };

    /* ============================================
       Helper: obtener info de un sprite
       ============================================ */
    window.getSpriteInfo = function (col, row) {
        return window.SPRITE_NAMES[\`\${col},\${row}\`] || null;
    };

    /* ============================================
       Helper: obtener nombre legible
       ============================================ */
    window.getSpriteName = function (col, row) {
        const info = window.getSpriteInfo(col, row);
        return info ? info.nombre : \`Objeto [\${col},\${row}]\`;
    };

    console.log("✅ sprite-names.js cargado ·", Object.keys(window.SPRITE_NAMES).length, "objetos nombrados y balanceados");
})();
`;

fs.writeFileSync('sprites-names.js', output, 'utf8');
fs.writeFileSync('tools/mapeador-items/data/sprites-names.js', output, 'utf8');
console.log('Saved rebalanced sprites-names.js successfully! Length:', output.length);
