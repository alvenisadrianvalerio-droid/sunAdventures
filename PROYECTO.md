# ☀️ SunAdventures — Documentación del Proyecto y Arquitectura

Bienvenido a la documentación técnica de **SunAdventures**, una aplicación web progresiva (PWA) híbrida (empaquetada también para Android con Capacitor) con una rica experiencia interactiva, gamificación, redes sociales/álbum colaborativo, finanzas y un completo ecosistema **RPG Roguelike**.

---

## 🧭 1. Visión General del Proyecto

SunAdventures combina la utilidad diaria con una experiencia de videojuego retro pixel-art:
- **Álbum de Recuerdos y Social**: Álbumes de fotos, notas, amigos, grupos compartidos y watch parties en tiempo real.
- **Finanzas Personales**: Registro de gastos e ingresos, gráficos, presupuestos y recordatorios.
- **Mascotas Virtuales & Tienda**: Personalización, cuidado de mascotas virtuales y compra de accesorios y cosméticos.
- **Minijuegos Arcade**: Varios juegos interactivos para ganar monedas del juego.
- **Sistema RPG Completo (Roguelike)**: Combates por turnos/tiempo real, biomas, mazmorras procedurales, forja, encantamientos, colección de botín (loot), loadout de habilidades y partículas interactivas.
- **Música Local & Multimedia**: Reproductor de música offline, integración de metadatos de YouTube y Spotify.

---

## 🛠️ 2. Stack Tecnológico y Filosofía de Código

El proyecto sigue una arquitectura **Vanilla Modular / Front-end Nativo** de alto rendimiento:

| Capa | Tecnologías | Enfoque de Diseño |
| :--- | :--- | :--- |
| **Núcleo Front-end** | HTML5 Semántico + JavaScript ES6+ Nativo | Sin frameworks pesados (No React/Vue). Máximo rendimiento y carga instantánea. |
| **Estilos y UI** | Vanilla CSS3 puro + Custom Properties (Variables CSS) | Glassmorphism, temas dinámicos (oscuro/claro/retro), animaciones CSS y pixel-art. |
| **Backend & Base de Datos** | Supabase (PostgreSQL, Auth, Realtime, Storage) | Autenticación de usuarios, suscripciones en tiempo real y sincronización en la nube. |
| **Persistencia Local** | `localStorage` + `IndexedDB` | Soporte offline first; todo el progreso se preserva localmente aunque no haya conexión. |
| **PWA & Offline** | Service Worker + Web App Manifest | Caché de assets, funcionamiento sin conexión e instalación como app de escritorio/móvil. |
| **Mobile Runtime** | Capacitor (`@capacitor/core`, `@capacitor/android`) | Empaquetado nativo para Android. |
| **Multimedia y Canvas** | HTML5 Canvas API + Web Audio API | Renderizado de efectos visuales (partículas/combate) y generación procedural de audio sintetizado. |

---

## 🧩 3. Módulos y Funcionalidades del Proyecto

### 🎮 A. Ecosistema RPG (Juego de Rol y Aventura)

El módulo RPG es uno de los componentes más avanzados del proyecto y está compuesto por subsistemas especializados:

1. **Núcleo de Combate y Zonas (`rpg.js`)**:
   - Sistema de combate con héroe, mascota y enemigos.
   - Cálculo dinámico de estadísticas (`ATK`, `DEF`, `HP`, `CRIT`, `ESQ`, `Vampirismo`, `Regeneración`).
   - Gestión de biomas, regiones, jefes y recompensas.
2. **Modo Roguelike (`rpg-roguelike.js`)**:
   - Generación de mazmorras procedurales con salas de monstruos, cofres, fuentes curativas y jefes de piso.
3. **Colección y Sistema de Botín (`rpg-loot.js`, `rpg-loot.css`)**:
   - Pool de objetos con rarezas jerárquicas: *Común*, *Raro*, *Épico*, *Legendario*, *Mítico* y *Tornasol*.
   - Apertura de cofres animados con spritesheets y probabilidades ponderadas.
   - Mecánica de reroll de objetos mediante monedas del juego.
4. **Items Dinámicos y Spritesheets (`rpg-items-dinamicos.js`, `sprites-config.js`, `sprites-names.js`)**:
   - Generación paramétrica de items combinando coordenadas de spritesheets (`loot-1.png`, `loot-2.png`, etc.) con nombres y habilidades.
5. **Loadout de Habilidades (`rpg-loadout.js`)**:
   - Selector estratégico donde el jugador puede equipar un máximo de 4 habilidades activas para llevar a combate.
6. **Mecánicas Avanzadas de Progresión**:
   - **Forja (`rpg-forja.js`)**: Fusión de 3 items iguales para subir al siguiente nivel de rareza.
   - **Encantamiento (`rpg-encantamiento.js`)**: Aplicación de encantamientos arcanos con oro para añadir modificadores de estadísticas.
   - **Set Bonus (`rpg-set-bonus.js`)**: Bonificaciones pasivas al equipar conjuntos de 3 objetos del mismo tipo (Guerrero, Guardián, etc.).
7. **Efectos Audiovisuales (`rpg-canvas.js`, `rpg-particulas-loot.js`, `rpg-sonidos-rareza.js`)**:
   - Partículas en Canvas, efectos de lluvia de confeti, flashes de rareza y síntesis de audio nativa con `AudioContext` para cada categoría de botín.

---

### 📸 B. Álbum Social y Colaborativo (`album.js`, `album.css`)

- **Galería Multimedia**: Subida y visualización de fotos, descripciones y fechas.
- **Diseño Polaroid Interactivo**: Tarjetas estilo polaroid con acciones táctiles (fullscreen, edición, eliminación).
- **Grupos y Amigos**: Sistema de invitaciones a grupos compartidos respaldado en Supabase (`supabase-groups.sql`).
- **Watch Party (`watch-party.js`)**: Sincronización de reproducción de video entre amigos.

---

### 💰 C. Finanzas Personales (`finanzas.js`, `finanzas.css`)

- **Control de Presupuesto**: Registro categorizado de ingresos y egresos.
- **Gráficos Estadísticos**: Resúmenes visuales de gastos por período.
- **Recordatorios & Cotizaciones**: Soporte en base de datos para alertas programadas y tasas de cambio (`supabase-finanzas.sql`).

---

### 🐾 D. Mascotas, Tienda y Minijuegos (`script.js`, `tienda.js`, `juegos.js`)

- **Mascota Interactiva**: Sistema de felicidad, hambre y compañía. Las mascotas acompañan al usuario e intervienen en combates RPG.
- **Tienda (`tienda.js`)**: Compra de accesorios cosméticos, alimentos e ítems de aventura usando la economía local.
- **Minijuegos Arcade (`juegos.js`)**: Minijuegos integrados para acumular monedas y subir de nivel.
- **Desafíos Diarios y Logros (`desafios-diarios.js`, `logros-extra.js`)**: Metas diarias y logros desbloqueables para fomentar la retención del usuario.

---

### 🎵 E. Reproductor Multimedia (`musica-local.js`, `player-extras.js`)

- **Reproductor Local**: Carga y reproducción de archivos de audio locales directamente en el navegador sin consumir datos.
- **Metadatos Enriquecidos (`youtube-spotify-metadata.js`)**: Detección y formato de pistas musicales.

---

### 📶 F. Infraestructura Offline y Soporte PWA (`offline.js`, `service-worker.js`)

- **Caché Inteligente**: Service Worker que almacena los recursos estáticos y assets de imágenes para permitir juego sin conexión a internet.
- **Detección de Conexión**: Modos reactivos ante pérdida o recuperación de red con sincronización posterior.

---

## 🏛️ 4. Estructura de Directorios

```text
sunAdventures/
├── android/                    # Proyecto nativo Android generado por Capacitor
├── supabase/                   # Scripts y esquemas SQL de Supabase
├── www/                        # Directorio principal de la aplicación web
│   ├── index.html              # Entrada única (SPA), modales y carga de módulos
│   ├── script.js               # Núcleo base de la app, estado de usuario y tienda API
│   ├── styles.css / temas.css  # Sistema de diseño, temas visuales y tokens CSS
│   ├── rpg*.js / rpg*.css      # Suite completa del sistema RPG Roguelike
│   ├── album.js / album.css    # Módulo de recuerdos, fotos y grupos
│   ├── finanzas.js / .css      # Módulo de gestión económica
│   ├── juegos.js / juegos.css  # Minijuegos arcade
│   ├── service-worker.js       # Soporte PWA y almacenamiento offline
│   ├── img/                    # Spritesheets, iconos y texturas pixel-art
│   └── sounds/                 # Efectos sonoros y audio ambiente
├── package.json                # Configuración de dependencias Capacitor
└── capacitor.config.json       # Configuración del empaquetado móvil
```

---

## 💡 5. Patrones y Estilo de Programación Utilizados

1. **IIFE (Immediately Invoked Function Expressions)**:
   - Casi todos los archivos encapsulan su código dentro de `(function() { ... })();` para proteger el scope global y evitar colisiones de variables.
2. **APIs Públicas en `window`**:
   - Cada módulo expone selectivamente un objeto global bien definido (ej. `window.Rpg`, `window.RpgLoot`, `window._TiendaAPI`, `window.SunModal`) para permitir comunicación desacoplada entre scripts.
3. **Comunicación por Eventos (`CustomEvent`)**:
   - La arquitectura hace un uso intensivo de eventos del navegador como `sunadventures:view-change`, `sunadventures:mascota-cambiada`, `rpg:fx` y `rpg:stats-cambiados` para sincronizar la UI sin acoplar fuertemente los módulos.
4. **Resiliencia y Asincronía**:
   - Patrón de inicialización reactivo con sondeo controlado (`esperarDependencias`), asegurando que módulos independientes arranquen en cuanto sus dependencias estén disponibles sin depender estrictamente del orden del HTML.
