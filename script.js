/* Progressive enhancement: content remains readable without JavaScript or GSAP. */
document.documentElement.classList.add("js");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const canAnimate = () => Boolean(window.gsap) && !reduceMotion.matches;
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");
menuButton.hidden = false;
function closeMenu(){navigation.classList.remove("open");menuButton.setAttribute("aria-expanded","false");}
menuButton.addEventListener("click",()=>{
 const open = menuButton.getAttribute("aria-expanded") !== "true";
 menuButton.setAttribute("aria-expanded",String(open));
 navigation.classList.toggle("open",open);
});
navigation.querySelectorAll("a").forEach(a=>a.addEventListener("click",closeMenu));
document.addEventListener("keydown",e=>{if(e.key==="Escape" && menuButton.getAttribute("aria-expanded")==="true"){closeMenu();menuButton.focus();}});
window.matchMedia("(min-width:761px)").addEventListener("change",closeMenu);

const skills = {
 python:{title:"Python",category:"Programación",description:"Conocimientos de Python adquiridos durante el Grado en Ingeniería Informática.",context:"Formación académica · UOC"},
 java:{title:"Java",category:"Programación",description:"Conocimientos de Java adquiridos y utilizados durante las prácticas del grado.",context:"Formación académica · UOC"},
 postgres:{title:"PostgreSQL",category:"Bases de datos",description:"Conocimientos de PostgreSQL como parte de mi formación en bases de datos.",context:"Formación académica · UOC"},
 docker:{title:"Docker",category:"Contenedores",description:"Conocimientos de contenedores Docker adquiridos durante el grado.",context:"Formación académica · UOC"},
 micro:{title:"Microservicios",category:"Arquitectura de software",description:"Conocimientos de arquitectura de microservicios como parte de mi formación en informática.",context:"Formación académica · UOC"},
 ai:{title:"Herramientas de IA",category:"Inteligencia artificial",description:"Dominio de herramientas de inteligencia artificial, una de las capacidades que aporto a mi siguiente etapa profesional.",context:"Competencia personal"}
};
document.querySelectorAll(".skill-node").forEach(button=>{
 button.addEventListener("click",()=>{
  const data=skills[button.dataset.skill];
  document.querySelectorAll(".skill-node").forEach(b=>{b.classList.toggle("selected",b===button);b.setAttribute("aria-pressed",String(b===button));});
  document.querySelector("#skill-title").textContent=data.title;
  document.querySelector("#skill-category").textContent=data.category.toUpperCase();
  document.querySelector("#skill-description").textContent=data.description;
  document.querySelector("#skill-context").textContent=data.context;
  if(canAnimate())gsap.fromTo(".skill-detail",{y:8,opacity:.6},{y:0,opacity:1,duration:.3,overwrite:true,clearProps:"transform,opacity"});
 });
});

document.querySelectorAll("[data-filter]").forEach(button=>{
 button.addEventListener("click",()=>{
  const filter=button.dataset.filter;
  document.querySelectorAll("[data-filter]").forEach(b=>{b.classList.toggle("active",b===button);b.setAttribute("aria-pressed",String(b===button));});
  const visible=[];
  document.querySelectorAll(".project-card").forEach(card=>{
   card.hidden=filter!=="all" && card.dataset.category!==filter;
   if(!card.hidden)visible.push(card);
  });
  document.querySelector("#project-status").textContent=visible.length+" proyecto"+(visible.length===1?" visible":"s visibles");
  if(canAnimate())gsap.fromTo(visible,{y:14,opacity:.4},{y:0,opacity:1,duration:.4,stagger:.08,overwrite:true,clearProps:"transform,opacity"});
  if(window.ScrollTrigger)ScrollTrigger.refresh();
 });
});

const form=document.querySelector("#contact-form");
form.addEventListener("submit",event=>{
 event.preventDefault();
 if(!form.reportValidity())return;
 const name=form.elements.name.value.trim();
 const email=form.elements.email.value.trim();
 const message=form.elements.message.value.trim();
 const status=document.querySelector("#form-status");
 if(!name || message.length<10){status.textContent="Añade tu nombre y un mensaje de al menos 10 caracteres.";return;}
 const subject="Contacto desde el portfolio · "+name;
 const body=["Hola, Reynaldo:","",message,"",name,email].join(String.fromCharCode(10));
 window.location.href="mailto:reynaldo.gs@hotmail.com?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
 status.textContent="Correo preparado. Si no se abre tu aplicación, escríbeme a reynaldo.gs@hotmail.com. El mensaje aún no se ha enviado.";
});
// Prevent a no-JS form from placing contact data in the URL.
form.setAttribute("action","mailto:reynaldo.gs@hotmail.com");
form.setAttribute("method","post");
form.setAttribute("enctype","text/plain");

const sectionObserver=new IntersectionObserver(entries=>{
 entries.forEach(entry=>{
  if(entry.isIntersecting){
   navigation.querySelectorAll("a").forEach(a=>{
    if(a.hash==="#"+entry.target.id)a.setAttribute("aria-current","location");
    else a.removeAttribute("aria-current");
   });
  }
 });
},{rootMargin:"-15% 0px -60% 0px"});
document.querySelectorAll("main section[id]").forEach(section=>sectionObserver.observe(section));

if(window.gsap && window.ScrollTrigger){
 gsap.registerPlugin(ScrollTrigger);
 const media=gsap.matchMedia();
 media.add("(prefers-reduced-motion: no-preference)",()=>{
  gsap.from(".hero-copy > *",{y:24,opacity:0,duration:.75,stagger:.09,ease:"power2.out",clearProps:"transform,opacity"});
  gsap.from(".orbit-art",{scale:.92,opacity:0,duration:1.2,ease:"power2.out",clearProps:"transform,opacity"});
  gsap.utils.toArray(".reveal").forEach(el=>{
   gsap.from(el,{y:28,opacity:0,duration:.7,ease:"power2.out",scrollTrigger:{trigger:el,start:"top 92%",once:true},clearProps:"transform,opacity"});
  });
  gsap.to(".orbit-art",{y:45,rotation:6,ease:"none",scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:1}});
  gsap.to(".reading-progress",{scaleX:1,ease:"none",scrollTrigger:{trigger:document.documentElement,start:0,end:"max",scrub:true}});
 });
}
// Printing is internal: expand details for the PDF, then restore their state.
let closedDetails=[];
window.addEventListener("beforeprint",()=>{closedDetails=[...document.querySelectorAll("details:not([open])")];closedDetails.forEach(d=>d.open=true);});
window.addEventListener("afterprint",()=>closedDetails.forEach(d=>d.open=false));