# Una nueva órbita — Portfolio de Reynaldo Galvizu

## Concepto editorial
La experiencia técnica es el punto de partida; informática e IA representan la siguiente etapa. El motivo orbital conecta la portada con la galaxia de habilidades. Las capacidades se describen sin porcentajes ni experiencia profesional inventada. Los proyectos se basan en los dos repositorios públicos verificados el 15 de octubre de 2026.

## Archivos y ejecución
- index.html: todo el contenido, trayectoria, proyectos, formación y contacto.
- styles.css: diseño, responsive, estados interactivos e impresión.
- script.js: habilidades, filtros, menú, formulario y GSAP.
- brand-effects.css: recorte y marco del retrato, zoom del nombre completo y acento de luz al interactuar.
- solar-system.css / solar-system.js: observatorio 3D, controles, órbitas, satélites con paneles solares y conexión con contenidos.
- skills-orbit.css / skills-orbit.js: segundo sistema 3D para las seis habilidades; carga diferida al acercarse a la sección.
- cosmic-background.css / cosmic-background.js: cielo estelar, nebulosidad diagonal, destellos suaves y estrellas fugaces.
- cosmic-ui.css / cosmic-ui.js: selectores planetarios, colores al pasar el cursor y latido continuo de Ahora.
- pulse-effects.css: latido suave compartido por los indicadores de estado y la mascota.
- connection-globe.css / connection-globe.js: Tierra punteada con conexiones ilustrativas.
- companion.css / companion.js: mascota Órbita y conversación gratuita basada en los contenidos del CV.
- assets/favicon.svg, favicon-32.png y favicon-180.png: emblema RG para pestañas y accesos directos. logo-mark.svg se usa en la web.
- assets/vendor/: GSAP 3.13.0, ScrollTrigger y Three.js 0.180.0. Se conservan las cabeceras de licencia y THREE-LICENSE.txt.
- assets/foto-cv.png: foto solo en cabecera; zoom discreto al pasar el cursor.
- assets/certificado-ingles-b2-uoc.pdf: certificado existente.

Servir esta carpeta mediante un servidor estático para activar la escena 3D. Al abrir index.html directamente con file://, el navegador restringe los módulos y se muestra la vista simplificada. No requiere compilación, npm ni servidor de formularios. Compatible con GitHub Pages. Sitio de publicación: https://reynaldo-galvizu.github.io · Repositorio: https://github.com/reynaldo-galvizu/reynaldo-galvizu.github.io

## Sistema visual
| Token | Color | Uso |
|---|---|---|
| --bg | #10151c | Fondo azul carbón |
| --surface | #171e27 | Paneles |
| --ink | #f1eee7 | Texto marfil |
| --muted | #a8b2c0 | Texto secundario |
| --coral | #ff977e | Énfasis editorial |
| --mint | #bce9cd | Interacción y acentos |
| --line | #303943 | Bordes |

Tipografía sin descargas externas:
- Segoe UI / Arial: interfaz, cuerpo y encabezados.
- Georgia: palabras destacadas en cursiva.
- Consolas / Courier New: fechas, categorías y pequeños rótulos.
Tamaños fluidos con clamp; títulos compactos y cuerpo de 16 px.

## Personalización
Editar el contenido directamente en HTML. Para añadir habilidades, crear un botón data-skill, una entrada en el objeto skills de script.js y una posición en CSS. No asociar tamaños a niveles de dominio.
Para añadir proyectos, duplicar un article.project-card, asignar data-category y enlaces verificables. Añadir un filtro data-filter coincidente; actualizar el contador visual de Todos. Añadir descripciones del problema, contribución propia y resultado cuando estén confirmados.
Las ilustraciones de proyectos son gráficos CSS del portfolio y toolkit; no pretenden ser capturas reales de aplicaciones.
Las animaciones usan GSAP + ScrollTrigger local: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
El contenido permanece visible si GSAP no carga. prefers-reduced-motion desactiva animaciones y zoom. No se altera el desplazamiento nativo.
La galería y la galaxia admiten teclado; los cambios tienen estados accesibles y anuncios. El menú móvil cierra con Escape.

## Interacciones de identidad y sistema solar
El marco circular de la foto tiene un borde blanco de 2 px; el recorte se ajusta mediante CSS y no altera el archivo original. El nombre completo aumenta un 5,5 % al pasar el cursor o recibir foco de teclado, con un acento de luz y una línea tenue. Vuelve suavemente a su tamaño al salir. El texto permanece intacto, sin secuencias por letras ni desplazamiento del contenido.

Three.js renderiza esferas iluminadas, el núcleo RG, anillos y un cinturón de asteroides. Las órbitas son elipses coplanares calculadas con la ecuación de Kepler y velocidades relativas proporcionales a a^(-3/2). Es una representación idealizada de gravedad central, no una simulación N-body ni un sistema solar a escala.

- Arrastrar la escena cambia la perspectiva con amortiguación.
- Flechas del teclado al enfocar la escena cambian el ángulo; Home restablece la vista y Espacio pausa/reanuda.
- Los seis botones y la selección directa de esferas muestran contextos reales de habilidades/proyectos.
- Explorar navega a la habilidad correspondiente o a los proyectos.
- Pausa y reinicio permiten observar la escena con calma.
- Se detiene al salir de pantalla o esconder la pestaña. Movimiento reducido ofrece una vista estática con selección funcional.
- Si WebGL falla, se conserva una ilustración CSS y todos los accesos al contenido.

Las órbitas y sus etiquetas se proyectan desde las mismas coordenadas 3D. La escala de planetas es visual, no un indicador del nivel de dominio de una habilidad.
Three.js: https://threejs.org/docs/

## Cielo, identidad e instrumentos
El logo vectorial RG combina las iniciales con una órbita en menta y coral. La pestaña usa iconos estáticos SVG/PNG por compatibilidad; la versión dentro de la web tiene una órbita animada.
El fondo es un canvas 2D con 650–1800 estrellas según el viewport, una banda de nebulosidad y unas pocas estrellas que varían suavemente de brillo. La capa base se dibuja una vez por tamaño. Se limita a 1,35 DPR y aproximadamente 24 fps; no captura clics ni envía datos.
Una primera estrella fugaz aparece tras unos seis segundos activos; las siguientes se espacian 10–19 segundos. La animación se detiene con la pestaña oculta y con movimiento reducido.
El punto de Ahora tiene un latido doble continuo, independiente de las animaciones GSAP de entrada. Solo se suspende cuando no se ve, la pestaña está oculta o el visitante pide reducir movimiento.
Los seis botones de selección animan a la vez su superficie, anillo y satélite, con pequeños desfases. Todos los planetas 3D mantienen su órbita y giro al interactuar con los controles. Pausar la escena también pausa las decoraciones del selector; el acento cambia con la selección.
El sistema de habilidades conserva los seis botones HTML y los textos originales como fuente. WebGL se carga al acercarse a la sección; sin soporte se mantiene la galaxia y sus controles en HTML/CSS. Esferas, materiales, satélites, anillos y lunas son gráficos generados en código.

## Órbita: guía gratuita del CV
La mascota abre una conversación solo al pulsarla. Reconoce preguntas sencillas sobre la identidad de Reynaldo, conocimientos, proyectos, formación, certificados, experiencia, disponibilidad y redes de contacto. Lee los contenidos semánticos publicados; una pregunta sin datos suficientes remite al contacto, sin inventar. Puede facilitar enlaces directos de email y LinkedIn. La fecha y hora se calculan al responder con el reloj del dispositivo, en la zona Europe/Madrid; no se guardan fechas fijas en el código.
Funciona en el navegador, sin API, modelo de pago, registro, cookies ni almacenamiento persistente. El historial vive exclusivamente en esta pestaña. Los mensajes se insertan como texto, y los enlaces se restringen a destinos reales del CV. No prepara ni envía mensajes a terceros.
Escape cierra el panel; se restaura el foco. En móvil se oculta cuando el menú principal está abierto. En impresión se excluye.
No se presenta como IA generativa: es una guía por temas con enlaces y respuestas extraídas del portfolio.

## Globo de conexiones
El globo usa una distribución uniforme de puntos sobre los continentes, atmósfera, una malla geodésica tenue y arcos con estelas luminosas. Los nodos emiten aros suaves; las conexiones siguen viajando durante el arrastre. Pausa y movimiento reducido detienen el conjunto. Sus conexiones son una ilustración, no métricas de visitas ni ubicaciones personales.
Geografía: [Natural Earth, dominio público](https://www.naturalearthdata.com/about/terms-of-use/), incluida localmente como assets/world-land.geojson. No se reutilizan activos ni marcas de Cloudflare.
Incluye arrastre, teclado, pausa, carga al acercarse a la sección y alternativas estáticas cuando WebGL no está disponible. Respeta movimiento reducido y deja de renderizar fuera de pantalla.

## Contacto
El formulario valida los campos y prepara un enlace mailto. NO envía mensajes por sí solo, no guarda datos y no comunica éxito de envío. Requiere una aplicación de correo configurada. El email y LinkedIn son alternativas permanentes.
Para recibir mensajes directamente desde la web se necesita un backend o proveedor de formularios, con configuración de privacidad y protección antispam. No añadir claves secretas al JavaScript público.

## PDF interno
Ctrl+P → Guardar como PDF genera el CV desde el contenido actual. La hoja de impresión muestra habilidades como lista, todos los proyectos y los detalles de formación/experiencia. No hay botones públicos de PDF. El PDF antiguo permanece en disco, pero no está enlazado.
Es un flujo de impresión manual desde una fuente única, no un archivo PDF regenerado automáticamente en GitHub.

## Medios personales
- Mantener la foto en cabecera; una versión WebP de 150–250 px sería suficiente y reduciría el peso de los 3,4 MB actuales.
- Sustituir las ilustraciones de proyectos por capturas reales 16:10 cuando aporten contexto. Usar imágenes WebP, dimensiones explícitas, alt descriptivo y loading="lazy".
- Para demos, usar clips breves con controls, preload="none", poster y subtítulos. Evitar reproducción automática con sonido.
- No añadir otra foto grande en portada, teléfono, nacimiento, permiso de conducir ni controles públicos internos.
- El certificado contiene datos personales: revisar una copia preparada para publicación antes del despliegue.

## Revisión de contenido pendiente
Confirmar niveles de castellano/catalán y disponibilidad; concretar herramientas de IA y usos reales cuando se conozcan. No se han inventado nombres de herramientas ni resultados.
Destino de publicación elegido: reynaldo-galvizu/reynaldo-galvizu.github.io. El portfolio y rg-toolkit están alojados en reynaldo-galvizu; todos los enlaces públicos apuntan a esa cuenta.
