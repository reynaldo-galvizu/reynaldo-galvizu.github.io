/* Órbita: a small, grounded portfolio guide. No keys, cookies or persistent chat storage. */
(() => {
  "use strict";

  if (document.getElementById("portfolio-companion")) return;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const clean = value => String(value || "").replace(/\s+/g, " ").trim();
  const text = node => clean(node?.innerText || node?.textContent);
  const normalize = value => clean(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const make = (tag, className, content) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  };

  // All navigation is restricted to destinations already present in the CV.
  const allowedLinks = new Set(["#inicio", "#trayectoria", "#skills", "#proyectos", "#formacion", "#contacto"]);
  document.querySelectorAll("#proyectos a[href], #formacion a[href], #contacto a[href]").forEach(link => {
    const href = link.getAttribute("href");
    try {
      const url = new URL(href, document.baseURI);
      if (url.protocol === "https:" || url.protocol === "mailto:" || (url.origin === location.origin && /\.pdf$/i.test(url.pathname))) allowedLinks.add(href);
    } catch { /* Malformed source links are ignored. */ }
  });
  const linkData = (label, href) => ({ label, href });
  const linksFor = selector => Array.from(document.querySelectorAll(selector)).map(link => linkData(text(link), link.getAttribute("href"))).filter(link => allowedLinks.has(link.href));
  const knowledge = () => {
    const entries = [];
    const seen = new Set();
    document.querySelectorAll("#skills .skill-node[data-skill]").forEach(button => {
      const key = button.dataset.skill;
      if (!key || seen.has(key)) return;
      seen.add(key);
      // The source object is also used by the public skill cards in script.js.
      let source;
      try { source = typeof skills === "object" ? skills[key] : null; } catch { source = null; }
      if (source?.description) entries.push({ key, title: clean(source.title), description: clean(source.description), context: clean(source.context) });
      else entries.push({ key, title: clean(button.lastChild?.textContent || text(button)), description: "", context: "" });
    });
    return entries;
  };

  const root = make("aside", "companion");
  root.id = "portfolio-companion";
  root.setAttribute("aria-label", "Órbita, guía del portfolio");
  const panel = make("section", "companion-panel");
  panel.id = "companion-panel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "false");
  panel.setAttribute("aria-labelledby", "companion-title");
  panel.setAttribute("aria-describedby", "companion-grounding");
  const header = make("div", "companion-header");
  const headingGroup = make("div", "companion-heading");
  const title = make("h2", "", "Órbita");
  title.id = "companion-title";
  const mode = make("span", "companion-mode", "Guía del portfolio");
  headingGroup.append(title, mode);
  const close = make("button", "companion-close", "×");
  close.type = "button";
  close.setAttribute("aria-label", "Cerrar guía del portfolio");
  header.append(headingGroup, close);
  const grounding = make("p", "companion-grounding", "Respuestas basadas en el CV publicado.");
  grounding.id = "companion-grounding";
  const messages = make("div", "companion-messages");
  messages.id = "companion-messages";
  messages.setAttribute("role", "log");
  messages.setAttribute("aria-live", "polite");
  messages.setAttribute("aria-relevant", "additions");
  messages.setAttribute("aria-label", "Conversación con la guía del portfolio");
  messages.tabIndex = 0;
  const suggestions = make("div", "companion-suggestions");
  suggestions.setAttribute("role", "group");
  suggestions.setAttribute("aria-label", "Preguntas sugeridas");
  const suggested = [
    ["Habilidades", "¿Qué conocimientos tiene Reynaldo?"],
    ["Proyectos", "¿Qué proyectos puedo explorar?"],
    ["Formación", "¿Cuál es su formación?"],
    ["Contacto", "¿Cómo puedo contactar con Reynaldo?"]
  ];
  suggested.forEach(([label, question]) => {
    const button = make("button", "", label);
    button.type = "button";
    button.addEventListener("click", () => submitMessage(question));
    suggestions.append(button);
  });

  const form = make("form", "companion-form");
  const label = make("label", "sr-only", "Tu pregunta sobre el CV");
  label.htmlFor = "companion-question";
  const inputRow = make("div", "companion-input-row");
  const input = make("input", "companion-input");
  input.id = "companion-question";
  input.name = "question";
  input.type = "text";
  input.maxLength = 600;
  input.placeholder = "Pregunta por mi trayectoria…";
  input.autocomplete = "off";
  input.setAttribute("enterkeyhint", "send");
  const send = make("button", "companion-send", "↗");
  send.type = "submit";
  send.setAttribute("aria-label", "Enviar pregunta");
  inputRow.append(input, send);
  form.append(label, inputRow);
  form.append(make("p", "companion-private-note", "La conversación permanece en esta pestaña."));
  const status = make("p", "companion-status");
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  panel.append(header, grounding, messages, suggestions, form, status);

  const launcher = make("button", "companion-launcher");
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Abrir guía del portfolio");
  launcher.setAttribute("aria-expanded", "false");
  launcher.setAttribute("aria-controls", panel.id);
  const mascot = make("span", "companion-mascot");
  mascot.setAttribute("aria-hidden", "true");
  const svgNS = "http://www.w3.org/2000/svg";
  const svgElement = (tag, attributes, parent) => {
    const node = document.createElementNS(svgNS, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    if (parent) parent.append(node);
    return node;
  };
  const svg = svgElement("svg", { viewBox: "0 0 112 112", fill: "none", focusable: "false" });
  const defs = svgElement("defs", {}, svg);
  const hull = svgElement("linearGradient", { id: "orbita-hull", x1: "35", y1: "18", x2: "80", y2: "96", gradientUnits: "userSpaceOnUse" }, defs);
  svgElement("stop", { "stop-color": "#e3f7ed" }, hull);
  svgElement("stop", { offset: ".5", "stop-color": "#bce9cd" }, hull);
  svgElement("stop", { offset: "1", "stop-color": "#5c9c90" }, hull);
  const glass = svgElement("linearGradient", { id: "orbita-glass", x1: "35", y1: "35", x2: "78", y2: "66", gradientUnits: "userSpaceOnUse" }, defs);
  svgElement("stop", { "stop-color": "#243e4c" }, glass);
  svgElement("stop", { offset: "1", "stop-color": "#101c2c" }, glass);
  svgElement("ellipse", { cx: "56", cy: "97", rx: "27", ry: "4", fill: "#bce9cd", opacity: ".12", class: "companion-shadow" }, svg);
  const floating = svgElement("g", { class: "companion-float" }, svg);
  svgElement("path", { d: "M55 28V17M21 50L13 45M91 50l8-5", stroke: "#8ccdb7", "stroke-width": "3", "stroke-linecap": "round" }, floating);
  svgElement("circle", { cx: "55", cy: "15", r: "4", fill: "#ffae8e", class: "companion-beacon" }, floating);
  svgElement("path", { d: "M26 54L12 58v20l17-4M86 54l14 4v20l-17-4", fill: "#294456", stroke: "#77adc3", "stroke-width": "1.5", "stroke-linejoin": "round" }, floating);
  svgElement("path", { d: "M18 57v19M24 55v19M13 64l15-4M13 71l15-4M94 57v19M88 55v19M99 64l-15-4M99 71l-15-4", stroke: "#72a6bb", "stroke-width": "1", opacity: ".8" }, floating);
  svgElement("rect", { x: "37", y: "65", width: "38", height: "23", rx: "11", fill: "url(#orbita-hull)" }, floating);
  svgElement("path", { d: "M44 86l-4 5M68 86l4 5", stroke: "#8bc4b1", "stroke-width": "4", "stroke-linecap": "round" }, floating);
  svgElement("rect", { x: "24", y: "28", width: "64", height: "46", rx: "22", fill: "url(#orbita-hull)", stroke: "#d6eee2", "stroke-width": "1.5" }, floating);
  svgElement("rect", { x: "30", y: "35", width: "52", height: "30", rx: "14", fill: "url(#orbita-glass)" }, floating);
  svgElement("path", { d: "M37 42c4-3 8-4 13-4", stroke: "#c6ebe4", opacity: ".25", "stroke-width": "2", "stroke-linecap": "round" }, floating);
  const eyes = svgElement("g", { class: "companion-eyes" }, floating);
  svgElement("rect", { x: "40", y: "46", width: "6", height: "9", rx: "3", fill: "#bce9cd" }, eyes);
  svgElement("rect", { x: "66", y: "46", width: "6", height: "9", rx: "3", fill: "#bce9cd" }, eyes);
  svgElement("path", { d: "M51 56q5 4 10 0", stroke: "#bce9cd", "stroke-width": "1.7", "stroke-linecap": "round" }, floating);
  svgElement("circle", { cx: "56", cy: "79", r: "3", fill: "#375d61" }, floating);
  svgElement("circle", { cx: "56", cy: "79", r: "1.3", fill: "#e2f5ce" }, floating);
  mascot.append(svg);
  const launcherCopy = make("span", "companion-launcher-copy");
  launcherCopy.append(make("strong", "", "Órbita"), make("span", "", "Guía del portfolio"));
  const launcherGlyph = make("span", "companion-launcher-glyph", "+");
  launcherGlyph.setAttribute("aria-hidden", "true");
  launcher.append(mascot, launcherCopy, launcherGlyph);
  root.append(panel, launcher);
  document.body.append(root);

  let open = false;
  const scrollMessages = () => { messages.scrollTop = messages.scrollHeight; };

  function appendMessage(role, content, actions = []) {
    const article = make("div", "companion-message companion-message--" + role);
    article.append(make("span", "companion-speaker", role === "user" ? "Tú" : "Órbita"));
    const body = make("p", "", content);
    article.append(body);
    if (actions.length) {
      const nav = make("div", "companion-message-links");
      actions.slice(0, 4).forEach(action => {
        if (!allowedLinks.has(action.href)) return;
        const anchor = make("a", "", action.label);
        anchor.setAttribute("href", action.href);
        if (/^https:/i.test(action.href) || /\.pdf(?:$|[?#])/i.test(action.href)) {
          anchor.target = "_blank";
          anchor.rel = "noopener noreferrer";
          anchor.setAttribute("aria-label", action.label + " (abre en otra pestaña)");
        }
        if (action.href.startsWith("#")) anchor.addEventListener("click", () => setOpen(false, false));
        nav.append(anchor);
      });
      article.append(nav);
    }
    messages.append(article);
    // Bounded DOM and in-memory history. Nothing is saved beyond this page session.
    while (messages.children.length > 31) messages.firstElementChild.remove();
    scrollMessages();
  }

  function localAnswer(question) {
    // Ignore punctuation and accents without changing the visitor's displayed message.
    const query = normalize(question).replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
    const ownerName = text($(".hero-name")).replace(/^soy\s+/i, "").replace(/[.!]+$/, "") || "Reynaldo Galvizu Sánchez";
    const allSkills = knowledge();
    const skillMap = {
      python: /\bpython\b|\bpy\b/,
      java: /\bjava\b/,
      postgres: /postgres|\bsql\b|base[ s]*de datos/,
      docker: /docker|contenedor/,
      micro: /microservicio|arquitectura/,
      ai: /\bia\b|inteligencia artificial|chatgpt|copilot|claude|herramientas de ia/
    };
    const matches = allSkills.filter(skill => skillMap[skill.key]?.test(query));
    const projectCards = Array.from(document.querySelectorAll("#proyectos .project-card"));
    const educationCards = Array.from(document.querySelectorAll("#formacion .education-card"));
    const contactActions = linksFor("#contacto .email-link, #contacto .contact-socials a[href*='linkedin']");
    const email = text($("#contacto .email-link")).replace(/\s*↗$/, "");
    const availability = text($("#contacto .availability"));
    const degree = educationCards.find(card => /ingenieria informatica/.test(normalize(text($("h3", card)))));
    const educationText = card => text($("h3", card)) + ": " + text($("p", card));

    // Read the clock when the question is asked; never bake a build date into the CV.
    const asksAboutPastCV = /certific|estudi|complet|termin|gradu|practic|trabaj|curso|nacim|cumple|emple|ingles|actic/.test(query);
    const asksTime = !asksAboutPastCV && /\b(que hora|la hora|hora actual|hora es|hora tenemos|fecha y hora)\b|\bhora$/.test(query);
    const asksDate = (!asksAboutPastCV && /\b(que dia es|que dia estamos|en que dia|que fecha|a cuantos estamos|fecha actual|fecha de hoy|dia de hoy|dia de la semana|que mes es|que ano es|en que ano estamos|hoy que|hoy es)\b|\bhoy$/.test(query)) || (asksTime && /\b(fecha|dia|hoy)\b/.test(query));
    if (asksTime || asksDate) {
      const now = new Date();
      const zone = "Europe/Madrid";
      const date = new Intl.DateTimeFormat("es-ES", { timeZone: zone, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now);
      const time = new Intl.DateTimeFormat("es-ES", { timeZone: zone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(now);
      return {
        reply: (asksDate ? "Hoy es " + date + ". " : "") + (asksTime ? "Son las " + time + ". " : "") + "Referencia: hora de Madrid (Europe/Madrid).",
        actions: []
      };
    }

    if (/quien eres|como (te llamas|funcionas)|tu nombre|eres (una? )?(ia|inteligencia|chatbot)|eres reynaldo|tus datos|privacidad|\bapi\b|modelo de (ia|lenguaje)/.test(query)) return {
      reply: "Soy Órbita, la guía de este portfolio. Puedo contarte quién es " + ownerName + ", qué ha estudiado, qué conocimientos y proyectos publica y cómo contactar con él. Uso respuestas locales basadas en este CV; la conversación permanece en esta pestaña.",
      actions: [linkData("Explorar habilidades", "#skills"), linkData("Ver proyectos", "#proyectos")]
    };
    if (/como me llamo|cual es mi nombre|quien soy|mi nombre completo/.test(query)) return {
      reply: "El nombre que figura en este CV es " + ownerName + ". Si preguntas por tu nombre como visitante, no lo conozco: esta página no te identifica.",
      actions: [linkData("Ver su perfil", "#inicio")]
    };
    if (/nombre completo|su nombre|nombre de reynaldo|como se llama|apellido|quien es reynaldo|quien es el|de quien es (este|el) (cv|portfolio|portafolio)/.test(query)) return {
      reply: "Este es el portfolio de " + ownerName + ". " + text($(".hero .lead")),
      actions: [linkData("Conocer su recorrido", "#trayectoria"), linkData("Contactar", "#contacto")]
    };
    if (/salari|sueldo|remuneracion|pretension|\bedad\b|nacimiento|telefono|movil|direccion|\bdni\b|casado|soltero|familia|nacionalidad/.test(query)) return {
      reply: "Ese dato no aparece en el CV publicado. Puedes preguntar directamente a Reynaldo por email o LinkedIn.",
      actions: contactActions
    };
    if (/contact|correo|e\s?mail|linked\s?in|contrat|hablar con|escrib|entrevista|mandar(le)? (un )?mensaje|enviar(le)? (un )?mensaje/.test(query)) return {
      reply: ["Puedes contactar con " + ownerName + " por email o LinkedIn.", email, availability, "El enlace de email prepara el correo en tu aplicación; el de LinkedIn abre su perfil."].filter(Boolean).join("\n"),
      actions: contactActions
    };
    if (/disponib|incorporacion|jornada|horario|remoto|presencial|hibrid|ubicacion|donde vive/.test(query)) return {
      reply: availability + ". Para acordar modalidad, ubicación o detalles de la oportunidad, contacta con Reynaldo.",
      actions: contactActions
    };
    if (/certific|ingles|idioma|\bb2\b|actic|acredit|castellano|espanol|catalan|competencias (digitales|tic)/.test(query)) {
      const relevant = educationCards.filter(card => /certificado|acreditacion/.test(normalize(text(card))));
      const selected = relevant.filter(card => /actic|competencias (digitales|tic)/.test(query) ? /actic/.test(normalize(text(card))) : /ingles|\bb2\b|idioma|castellano|espanol|catalan/.test(query) ? /ingles/.test(normalize(text(card))) : true);
      return {
        reply: selected.map(card => text($("h3", card)) + ": " + text($("p", card))).join("\n\n") || "Los certificados publicados están en la sección de formación.",
        actions: selected.flatMap(card => Array.from(card.querySelectorAll("a[href]")).map(link => linkData("Certificado · " + text($("h3", card)), link.getAttribute("href"))))
      };
    }
    if (/proyecto|repositorio|github|codigo|toolkit|portfolio|portafolio|aplicacion|demo/.test(query)) return {
      reply: "En la galería hay " + projectCards.length + " proyectos publicados:\n\n" + projectCards.map(card => text($("h3", card)) + ": " + text($(".project-info p", card))).join("\n\n"),
      actions: projectCards.map(card => linkData(text($("h3", card)), $(".project-bottom a", card)?.getAttribute("href"))).concat(linksFor("#contacto .contact-socials a[href*='github']"), linkData("Ver galería", "#proyectos"))
    };
    if (matches.length) return {
      reply: matches.map(skill => skill.description || skill.title + " figura entre sus conocimientos publicados.").join("\n\n") + (/nivel|experto|senior|profesional|experiencia/.test(query) ? "\n\nEl CV no atribuye niveles o experiencia profesional adicionales a estas competencias." : ""),
      actions: [linkData("Explorar habilidades", "#skills")]
    };
    if (/habilidad|conocim|tecnologi|lenguaje|herramienta|competenc|stack|que (sabe|puede hacer|domina)|capacida/.test(query)) return {
      reply: "Sus conocimientos publicados incluyen " + allSkills.filter(skill => skill.key !== "ai").map(skill => skill.title).join(", ") + ", adquiridos durante el grado. Además, cuenta con dominio de herramientas de inteligencia artificial. Puedes preguntarme por una tecnología concreta.",
      actions: [linkData("Explorar habilidades", "#skills")]
    };
    if (/que le falta|pendiente|termin|acabad|complet|finaliz|graduad/.test(query) && degree) return {
      reply: educationText(degree),
      actions: [linkData("Ver formación", "#formacion")]
    };
    if (/formacion|estudi|universidad|uoc|carrera|grado|practica|titula|academ|electrica|curso/.test(query)) return {
      reply: (/electrica|urv|ascensor/.test(query) ? educationCards.filter(card => /otras etapas/.test(normalize(text($("h3", card))))) : educationCards).map(educationText).join("\n\n"),
      actions: [linkData("Ver formación y certificados", "#formacion")]
    };
    if (/busca|buscando|objetivo|oportunidad|incorporar|que (aporta|ofrece)|interes/.test(query)) return {
      reply: text($(".hero .lead")) + " " + availability + ".",
      actions: contactActions
    };
    if (/experiencia|recorrido|trayectoria|trabaj|empleo|orona|eninter|mantenim|empresa|anterior|ascensor|profesional/.test(query)) {
      const timeline = Array.from(document.querySelectorAll("#trayectoria .timeline-item"));
      const target = /orona|eninter|mantenim|ascensor|experiencia|anterior|trabajado|empresa/.test(query) ? timeline.filter(item => /2020|2018/.test(text($(".timeline-date", item)))) : timeline;
      return {
        reply: target.map(item => text($(".timeline-date", item)) + " · " + text($("h3", item)) + ". " + Array.from(item.querySelectorAll("p")).map(text).join(" ")).join("\n\n"),
        actions: [linkData("Ver su recorrido", "#trayectoria"), linkData("Contactar", "#contacto")]
      };
    }
    if (/reynaldo|quien es|perfil|presenta|resumen|cuentame|sobre el|curriculum|\bcv\b/.test(query)) return {
      reply: ownerName + ". " + text($(".hero .lead")) + (degree ? " " + educationText(degree) : ""),
      actions: [linkData("Ver su recorrido", "#trayectoria"), linkData("Contactar", "#contacto")]
    };
    if (/^(hola|buenas|buenos dias|buenas tardes|hey|hello|saludos)[!?.\s]*$/.test(query)) return {
      reply: "¡Hola! Soy Órbita. Puedo orientarte por los conocimientos, los proyectos, la formación y el contacto de Reynaldo. ¿Qué te gustaría explorar?",
      actions: [linkData("Conocimientos", "#skills"), linkData("Proyectos", "#proyectos")]
    };
    if (/gracias|perfecto|genial|adios|hasta luego/.test(query)) return {
      reply: "¡Gracias por explorar el portfolio! Si quieres seguir la conversación con Reynaldo, tienes su email y LinkedIn en contacto.",
      actions: [linkData("Hablemos", "#contacto")]
    };
    return {
      reply: "Puedo orientarte sobre el CV publicado: conocimientos, proyectos, formación, trayectoria y contacto. Para esa pregunta no encuentro información suficiente aquí. Prueba con una de las opciones o consulta a Reynaldo directamente.",
      actions: [linkData("Habilidades", "#skills"), linkData("Proyectos", "#proyectos"), linkData("Contacto", "#contacto")]
    };
  }

  function setOpen(next, restoreFocus = true) {
    open = next;
    panel.hidden = !next;
    launcher.setAttribute("aria-expanded", String(next));
    launcher.setAttribute("aria-label", next ? "Cerrar guía del portfolio" : "Abrir guía del portfolio");
    launcherGlyph.textContent = next ? "−" : "+";
    root.classList.toggle("is-open", next);
    if (next) {
      scrollMessages();
      input.focus({ preventScroll: true });
    } else if (restoreFocus) launcher.focus({ preventScroll: true });
  }

  function submitMessage(raw) {
    const question = clean(raw).slice(0, 600);
    if (!question) return;
    appendMessage("user", question);
    input.value = "";
    const answer = localAnswer(question);
    appendMessage("assistant", answer.reply, answer.actions);
  }

  appendMessage("assistant", "¡Hola! Soy Órbita, tu guía por el universo de Reynaldo. Puedo ayudarte a encontrar sus conocimientos, proyectos, formación o vías de contacto. ¿Por dónde empezamos?");
  launcher.addEventListener("click", () => setOpen(!open));
  close.addEventListener("click", () => setOpen(false));
  form.addEventListener("submit", event => {
    event.preventDefault();
    submitMessage(input.value);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  });
  document.addEventListener("visibilitychange", () => root.classList.toggle("is-idle", document.hidden));
  root.classList.toggle("is-idle", document.hidden);
  const menuButton = $(".menu-toggle");
  if (menuButton) {
    const syncMenu = () => {
      const menuOpen = menuButton.getAttribute("aria-expanded") === "true";
      if (menuOpen && open) setOpen(false, false);
      root.hidden = menuOpen;
    };
    new MutationObserver(syncMenu).observe(menuButton, { attributes: true, attributeFilter: ["aria-expanded"] });
    syncMenu();
  }
})();
