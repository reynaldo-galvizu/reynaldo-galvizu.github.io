# Una nueva órbita — Portfolio de Reynaldo Galvizu

## Concepto editorial
La experiencia técnica es el punto de partida; informática e IA representan la siguiente etapa. El motivo orbital conecta la portada con la galaxia de habilidades. Las capacidades se describen sin porcentajes ni experiencia profesional inventada. Los proyectos se basan en los dos repositorios públicos verificados el 15 de octubre de 2026.

## Archivos y ejecución
- index.html: todo el contenido, trayectoria, proyectos, formación y contacto.
- styles.css: diseño, responsive, estados interactivos e impresión.
- script.js: habilidades, filtros, menú, formulario y GSAP.
- assets/vendor/: GSAP 3.13.0 y ScrollTrigger, con sus cabeceras de licencia originales.
- assets/foto-cv.png: foto solo en cabecera; zoom discreto al pasar el cursor.
- assets/certificado-ingles-b2-uoc.pdf: certificado existente.

Abrir index.html o servir esta carpeta mediante un servidor estático. No requiere compilación, npm ni servidor de formularios. Compatible con GitHub Pages. Sitio de publicación: https://reynaldo-galvizu.github.io · Repositorio: https://github.com/reynaldo-galvizu/reynaldo-galvizu.github.io

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
Destino de publicación elegido: reynaldo-galvizu/reynaldo-galvizu.github.io. Los enlaces a proyectos de reynaldo1992 se conservan porque allí están los repositorios verificados.