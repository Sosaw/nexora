const SUPABASE_URL = "https://fwmwrjcsgtxcniluafva.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_WChsmyEMVESddpu1qw-9jg_Tzv9kYLI";

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

let contents = [];
let currentFilter = "all";
let selected = null;
const listKey = "nexora_my_list";

const $ = (id) => document.getElementById(id);

function escapeHtml(value=""){
  return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
function getList(){ try{return JSON.parse(localStorage.getItem(listKey)||"[]")}catch{return[]}}
function saveList(list){localStorage.setItem(listKey,JSON.stringify(list))}
function inList(title){return getList().includes(title)}
function toggleList(title){
  const list=getList();
  const next=list.includes(title)?list.filter(x=>x!==title):[...list,title];
  saveList(next);
  render();
  if(selected) updateModalButtons();
}
window.toggleList=toggleList;

function gradientFor(item){
  const seeds={
    film:["#3a1f2b","#10151e"],serie:["#172c38","#10121c"],anime:["#3d203d","#11131b"]
  };
  const s=seeds[item.type]||seeds.film;
  return `linear-gradient(135deg,${s[0]},${s[1]})`;
}

function card(item){
  const title=escapeHtml(item.title);
  const meta=[item.year,item.genre,item.rating?`${item.rating}/10`:null].filter(Boolean).join(" · ");
  const poster=item.poster_url ? `background-image:url("${item.poster_url}")` : `background:${gradientFor(item)}`;
  return `<article class="card" data-id="${item.id}">
    <div class="poster" style='${poster}'></div>
    <div class="shade"></div>
    <div class="card-info"><div class="card-title">${title}</div><div class="card-meta">${escapeHtml(meta)}</div></div>
  </article>`;
}

function section(title, items, suffix=""){
  if(!items.length) return "";
  return `<section class="row"><div class="row-head"><h2>${title}</h2><span>${suffix}</span></div><div class="cards">${items.map(card).join("")}</div></section>`;
}

function filtered(){
  if(currentFilter==="mylist"){
    const names=new Set(getList());
    return contents.filter(x=>names.has(x.title));
  }
  if(currentFilter==="film"||currentFilter==="serie"||currentFilter==="anime")
    return contents.filter(x=>x.type===currentFilter);
  if(currentFilter==="new") return contents.filter(x=>x.is_new);
  if(currentFilter==="trend") return contents.filter(x=>x.is_featured || Number(x.rating||0)>=8);
  return contents;
}

function render(){
  const items=filtered();
  if(!items.length){ $("content").innerHTML=`<div class="empty">Aucun contenu ne correspond à cette sélection pour le moment.</div>`; return; }

  if(currentFilter==="all"){
    const featured=contents.filter(x=>x.is_featured);
    const films=contents.filter(x=>x.type==="film");
    const series=contents.filter(x=>x.type==="serie");
    const anime=contents.filter(x=>x.type==="anime");
    const news=contents.filter(x=>x.is_new);
    $("content").innerHTML=
      section("Tendances",featured.length?featured:contents.slice(0,10),"NEXORA")+
      section("Films populaires",films,"Films")+
      section("Séries populaires",series,"Séries")+
      section("Animés populaires",anime,"Animés")+
      section("Nouveautés",news,"Nouveau");
  }else{
    const names={film:"Films",serie:"Séries",anime:"Animés",new:"Nouveautés",trend:"Tendances",mylist:"Ma liste"};
    $("content").innerHTML=section(names[currentFilter]||"NEXORA",items,`${items.length} contenu(s)`);
  }
  document.querySelectorAll(".card").forEach(el=>el.addEventListener("click",()=>openModal(Number(el.dataset.id))));
}

function openModal(id){
  selected=contents.find(x=>x.id===id); if(!selected)return;
  $("modalTitle").textContent=selected.title;
  $("modalType").textContent=({film:"FILM",serie:"SÉRIE",anime:"ANIMÉ"})[selected.type]||selected.type.toUpperCase();
  $("modalMeta").textContent=[selected.year,selected.genre,selected.duration_minutes?`${selected.duration_minutes} min`:null,selected.rating?`${selected.rating}/10`:null].filter(Boolean).join(" · ");
  $("modalDesc").textContent=selected.description||"Aucune description disponible.";
  $("modalPoster").style.background=selected.poster_url?`url("${selected.poster_url}") center/cover`:`${gradientFor(selected)}`;
  updateModalButtons();
  $("modal").classList.remove("hidden");
}
function updateModalButtons(){
  $("modalList").textContent=inList(selected.title)?"✓ Dans ma liste":"＋ Ma liste";
}
function closeModal(){ $("modal").classList.add("hidden"); selected=null; }

$("closeModal").addEventListener("click",closeModal);
$("modal").addEventListener("click",e=>{if(e.target===$("modal"))closeModal()});
$("modalList").addEventListener("click",()=>toggleList(selected.title));
$("modalWatch").addEventListener("click",()=>{
  if(selected?.video_url) window.open(selected.video_url,"_blank");
  else alert("Le lecteur vidéo sera connecté quand une vidéo autorisée sera ajoutée à ce contenu.");
});
$("heroWatch").addEventListener("click",()=>{if(contents[0])openModal(contents[0].id)});
$("heroList").addEventListener("click",()=>{if(contents[0])toggleList(contents[0].title)});

document.querySelectorAll(".nav").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));
  btn.classList.add("active");
  currentFilter=btn.dataset.filter;
  render();
}));

$("search").addEventListener("input",()=>{
  const q=$("search").value.trim().toLowerCase();
  if(!q){render();return}
  const results=contents.filter(x=>[x.title,x.genre,x.description,x.type].some(v=>String(v||"").toLowerCase().includes(q)));
  $("content").innerHTML=section(`Résultats pour « ${escapeHtml(q)} »`,results,`${results.length} résultat(s)`)||`<div class="empty">Aucun résultat.</div>`;
  document.querySelectorAll(".card").forEach(el=>el.addEventListener("click",()=>openModal(Number(el.dataset.id))));
});

async function loadContents(){
  $("status").textContent="Connexion à la base NEXORA…";
  const {data,error}=await db.from("contents").select("*").order("created_at",{ascending:false});
  if(error){
    console.error(error);
    $("status").textContent="Impossible de charger le catalogue. Vérifie la connexion Supabase.";
    $("status").className="status error";
    return;
  }
  contents=data||[];
  $("status").textContent=`✓ Catalogue NEXORA connecté · ${contents.length} contenu(s)`;
  $("status").className="status ok";
  if(contents[0]){
    $("heroTitle").innerHTML=escapeHtml(contents[0].title).replace(/ /g,"<br>");
    $("heroMeta").textContent=[({film:"Film",serie:"Série",anime:"Animé"})[contents[0].type],contents[0].genre,contents[0].year,contents[0].rating?`${contents[0].rating}/10`:null].filter(Boolean).join(" · ");
    $("heroDesc").textContent=contents[0].description||"Découvrez votre catalogue NEXORA.";
  }
  render();
}
loadContents();
