# Una nueva órbita — Portfolio de Reynaldo Galvizu

## Concepto editorial
La experiencia técnica es el punto de partida; informática e IA representan la siguiente etapa. El motivo orbital conecta la portada con la galaxia de habilidades. Las capacidades se describen sin porcentajes ni experiencia profesional inventada. Los proyectos se basan en los dos repositorios públicos verificados el 15 de octubre de 2026.

## Archivos y ejecución
- index.html: todo el contenido, trayectoria, proyectos, formación y contacto.
- styles.css: diseño, responsive, estados interactivos e impresión.
- script.js: habilidades, filtros, menú, formulario y GSAP.
- brand-effects.css / brand-effects.js: recorte y marco del retrato, zoom y resolución breve de letras.
- solar-system.css / solar-system.js: observatorio 3D, controles, órbitas y conexión con contenidos.
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
El marco circular de la foto tiene un borde blanco de 2 px; el recorte se ajusta mediante CSS y no altera el archivo original. El nombre conserva su texto accesible mientras una capa visual resuelve caracteres durante unos 650 ms. La secuencia se cancela al retirar el cursor o perder el foco.

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