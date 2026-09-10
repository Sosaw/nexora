const SUPABASE_URL = "https://fwmwrjcsgtxcniluafva.supabase.co";
const SUPABASE_KEY = "sb_publishable_WChsmyEMVESddpu1qw-9jg_Tzv9kYLI";
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const brandHome = document.getElementById("brandHome");
const $ = id => document.getElementById(id);
let contents=[], currentFilter="all", selected=null, currentUser=null, authMode="login";

// Catalogue de démonstration : affiches de films connus pour donner au prototype un vrai rendu streaming.
// Les affiches sont chargées depuis TMDB. Les vidéos complètes doivent venir de sources que tu as le droit de diffuser.
const demoCatalog = [
  {id:9001,title:"Dune : Deuxième Partie",type:"film",year:2024,genre:"Science-fiction",rating:8.6,duration_minutes:166,poster_url:"https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",backdrop_url:"https://image.tmdb.org/t/p/w1280/7H8w5D3W5W3g5q6Q0n9o4dQvY1.jpg",is_featured:true,is_new:true,description:"Paul Atréides s'unit aux Fremen et prépare sa revanche sur ceux qui ont détruit sa famille."},
  {id:9002,title:"Interstellar",type:"film",year:2014,genre:"Science-fiction",rating:8.7,duration_minutes:169,poster_url:"https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",backdrop_url:"https://image.tmdb.org/t/p/w1280/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",description:"Une équipe traverse un trou de ver pour trouver un nouvel espoir pour l'humanité."},
  {id:9003,title:"Inception",type:"film",year:2010,genre:"Science-fiction",rating:8.8,duration_minutes:148,poster_url:"https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",backdrop_url:"https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",description:"Un voleur spécialisé dans l'extraction de secrets s'aventure dans les rêves les plus profonds."},
  {id:9004,title:"Oppenheimer",type:"film",year:2023,genre:"Drame · Histoire",rating:8.6,duration_minutes:180,poster_url:"https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",backdrop_url:"https://image.tmdb.org/t/p/w1280/f1AQhx6ZfGhPZFTVKgxG91Phwos.jpg",description:"Le parcours du scientifique à la tête du projet Manhattan et les conséquences de ses travaux."},
  {id:9005,title:"Top Gun : Maverick",type:"film",year:2022,genre:"Action",rating:8.2,duration_minutes:131,poster_url:"https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",backdrop_url:"https://image.tmdb.org/t/p/w1280/odJ4hx6g6vBt4lBWKFD1tI8Fq5C.jpg",description:"Après plus de trente ans de service, Maverick revient former une nouvelle génération de pilotes."},
  {id:9006,title:"The Batman",type:"film",year:2022,genre:"Action · Thriller",rating:7.8,duration_minutes:176,poster_url:"https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",backdrop_url:"https://image.tmdb.org/t/p/w1280/b0PlSFdDwbyK8R8R7r9z6YhZ0mA.jpg",description:"Un Batman encore jeune enquête sur une série de crimes qui révèle une corruption profonde à Gotham."},
  {id:9007,title:"Spider-Man : No Way Home",type:"film",year:2021,genre:"Action · Fantastique",rating:8.0,duration_minutes:148,poster_url:"https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",backdrop_url:"https://image.tmdb.org/t/p/w1280/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg",description:"Peter Parker demande de l'aide pour faire oublier son identité secrète, mais le multivers s'en mêle."},
  {id:9008,title:"Titanic",type:"film",year:1997,genre:"Drame · Romance",rating:7.9,duration_minutes:194,poster_url:"https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx1l8KxWc0R7nG.jpg",backdrop_url:"https://image.tmdb.org/t/p/w1280/7B2tHfQdK6L7jvKf8M8G9cY3r5P.jpg",description:"Une histoire d'amour née à bord du paquebot le plus célèbre de l'histoire."},
  {id:9009,title:"Avatar : La Voie de l’eau",type:"film",year:2022,genre:"Science-fiction · Aventure",rating:7.6,duration_minutes:192,poster_url:"https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",description:"Jake Sully et Neytiri construisent leur famille et trouvent refuge auprès d’un nouveau peuple de Pandora."},
  {id:9010,title:"Gladiator II",type:"film",year:2024,genre:"Action · Drame",rating:6.7,duration_minutes:148,poster_url:"https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",description:"Des années après le règne de Maximus, une nouvelle génération entre dans l’arène et doit affronter les ambitions de Rome."}
];

// Séries / animés de démonstration pour donner au catalogue la densité d'une vraie plateforme.
const extraCatalog = [
  {id:9101,title:"Stranger Things",type:"serie",year:2016,genre:"Fantastique · Thriller",rating:8.6,poster_url:"https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg",backdrop_url:"https://image.tmdb.org/t/p/w1280/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",description:"À Hawkins, un groupe d'adolescents se retrouve au cœur d'un mystère surnaturel qui dépasse tout ce qu'ils imaginaient.",is_featured:true},
  {id:9102,title:"Breaking Bad",type:"serie",year:2008,genre:"Drame · Crime",rating:9.5,poster_url:"https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",backdrop_url:"https://image.tmdb.org/t/p/w1280/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",description:"Un professeur de chimie se lance dans une entreprise clandestine qui va bouleverser sa vie et celle de ses proches.",is_featured:true},
  {id:9103,title:"Game of Thrones",type:"serie",year:2011,genre:"Drame · Fantasy",rating:9.2,poster_url:"https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",backdrop_url:"https://image.tmdb.org/t/p/w1280/suopoADq0k8YZr4dQXcX1R1h2jD.jpg",description:"Dans un monde où les familles nobles se disputent le Trône de Fer, alliances et trahisons décident du destin des royaumes.",is_new:true},
  {id:9104,title:"The Last of Us",type:"serie",year:2023,genre:"Drame · Post-apocalyptique",rating:8.7,poster_url:"https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",backdrop_url:"https://image.tmdb.org/t/p/w1280/9n2tJBplPbgR2ca05hS5CK9wE9Q.jpg",description:"Vingt ans après l'effondrement de la civilisation, Joel doit escorter Ellie à travers une Amérique dévastée.",is_new:true},
  {id:9105,title:"Mercredi",type:"serie",year:2022,genre:"Comédie · Fantastique",rating:8.1,poster_url:"https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",backdrop_url:"https://image.tmdb.org/t/p/w1280/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg",description:"Mercredi Addams enquête sur une série de mystères inquiétants au sein de son étrange académie.",is_featured:true},
  {id:9106,title:"La Casa de Papel",type:"serie",year:2017,genre:"Crime · Thriller",rating:8.2,poster_url:"https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg",backdrop_url:"https://image.tmdb.org/t/p/w1280/AbR2eYb8J9H3QY1fJkJ6f7w4xkB.jpg",description:"Un mystérieux stratège réunit une équipe de braqueurs pour réaliser un plan hors norme.",is_featured:true},
];


const demoSeasons={9101:{1:["La disparition de Will Byers","La barjot de Maple Street","Holly, Jolly","Le corps","La puce et l'acrobate"],2:["MADMAX","Des bonbons et un monstre","Le têtard","Will le Sage","Dig Dug"],3:["Suzie, tu es là ?","Le centre commercial","L'affaire de la sauveteuse","Le sauna","L'été de la mort"]},9102:{1:["Le commencement","Le chat dans le sac","...Et le sac dans la rivière","Cancer Man","Gris Matter"],2:["Sept trente-sept","Grillé","Mas","4 jours dehors","Phoenix"],3:["No Más","Caballo Sin Nombre","I.F.T.","Green Light","Mas"]},9103:{1:["L'hiver vient","La Route Royale","Lord Snow","Infirmes, Bâtards et Choses Brisées","Le Loup et le Lion"],2:["Le Nord se souvient","Les terres de la nuit","Ce qui est mort ne saurait mourir","Les jardins d'os","Le fantôme d'Harrenhal"]},9104:{1:["Quand nous sommes dans le besoin","Infection","Long, Long Time","S'il vous plaît, tenez ma main","Endurer et survivre"],2:["Après le temps","Traversée","Qui sommes-nous ?","Les morts-vivants","Lumière"]},9105:{1:["Wednesday's Child Is Full of Woe","Woe Is the Loneliest Number","Friend or Woe","Woe What a Night","You Reap What You Woe"],2:["Here We Woe Again","The Devil You Woe","If These Woes Could Talk","Woe Me the Money","This Means Woe"]},9106:{1:["Efectuar lo acordado","Imprudencias letales","Errar al disparar","Caballo de Troya","El día de la marmota"]}};
function getSeasons(item){return item?.seasons||demoSeasons[item?.id]||null}
function renderEpisodes(item,season=1){const seasons=getSeasons(item);if(!seasons)return"";const keys=Object.keys(seasons).sort((a,b)=>Number(a)-Number(b));const active=seasons[season]||seasons[keys[0]]||[];return `<div class="series-episodes"><div class="season-head"><div><span class="row-eyebrow">ÉPISODES</span><h3>Saison ${season}</h3></div><div class="season-select-wrap"><label for="seasonSelect">Saison</label><select id="seasonSelect">${keys.map(k=>`<option value="${k}" ${String(k)===String(season)?"selected":""}>Saison ${k}</option>`).join("")}</select></div></div><div class="episode-list">${active.map((name,i)=>`<article class="episode"><div class="episode-number">${String(i+1).padStart(2,"0")}</div><div class="episode-thumb" style="${bgStyle(item,"backdrop")}"><span>▶</span></div><div class="episode-info"><h4>Épisode ${i+1} · ${escapeHtml(name)}</h4><p>${escapeHtml(item.description||"Découvrez cet épisode sur NEXORA.")}</p><span class="episode-meta">${item.episode_duration||45} min</span></div><button class="episode-play" data-episode-play="${item.id}">▶</button></article>`).join("")}</div></div>`}

function escapeHtml(value=""){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));}
function getList(){try{return JSON.parse(localStorage.getItem("nexora_list")||"[]")}catch{return[]}}
function saveList(list){localStorage.setItem("nexora_list",JSON.stringify(list))}
function inList(title){return getList().includes(title)}
function toggleList(title){const list=getList();const next=list.includes(title)?list.filter(x=>x!==title):[...list,title];saveList(next);render();if(selected)updateModalButtons()}
function gradientFor(item){const seeds={film:["#263345","#11141b"],serie:["#20362e","#10151a"],anime:["#38223c","#12131a"]};const s=seeds[item.type]||seeds.film;return `linear-gradient(135deg,${s[0]},${s[1]})`}
function bgStyle(item, prefer="poster"){const url=prefer==="backdrop"?(item.backdrop_url||item.poster_url):(item.poster_url||item.backdrop_url);return url?`background-image:url("${url}")`:`background:${gradientFor(item)}`}
function labelType(type){return ({film:"FILM",serie:"SÉRIE",anime:"ANIMÉ"})[type]||String(type||"").toUpperCase()}
function card(item){const meta=[item.year,item.genre,item.rating?`${item.rating}/10`:null].filter(Boolean).join(" · ");const desc=item.description||"Découvrez ce contenu sur NEXORA.";return `<article class="card" data-id="${item.id}"><div class="poster" style='${bgStyle(item)}'></div><div class="shade"></div><div class="card-info"><div class="card-type">${labelType(item.type)}</div><div class="card-title">${escapeHtml(item.title)}</div><div class="card-meta">${escapeHtml(meta)}</div></div><div class="card-hover-desc">${escapeHtml(desc)}</div><div class="card-actions"><button class="card-play" data-play="${item.id}" aria-label="Lire ${escapeHtml(item.title)}">▶</button><button class="card-info-btn" data-info="${item.id}" aria-label="Voir les détails de ${escapeHtml(item.title)}">i</button></div></article>`}
function section(title,items,suffix="",filter="",layout="row"){if(!items.length)return"";const count=items.length;const listClass=layout==="grid"?"cards catalog-grid":"cards";return `<section class="row ${layout==="grid"?"row-grid-view":""}"><div class="row-head"><div class="row-heading"><span class="row-eyebrow">NEXORA</span><h2>${title}</h2></div>${layout==="grid"?"":`<button class="row-link" data-row-filter="${filter}">${suffix||`${count} titre${count>1?"s":""}`} <span>→</span></button>`}</div><div class="${listClass}">${items.map(card).join("")}</div></section>`}
function getWatchState(){try{return JSON.parse(localStorage.getItem("nexora_watch")||"{}")}catch{return{}}}
function saveWatchState(state){localStorage.setItem("nexora_watch",JSON.stringify(state))}
function markWatched(item){const state=getWatchState();const entry=state[item.id]||{views:0,progress:0};entry.views=(entry.views||0)+1;entry.lastWatched=Date.now();entry.progress=Math.max(entry.progress||0,8);state[item.id]=entry;saveWatchState(state)}
function catalogTabs(active="ranking"){const tabs=[
  ["ranking","Classement"],["comedie","Comédie"],["action","Action"],["drame","Drame"],["sf","Science-fiction"],["aventure","Aventure"]
];return `<div class="catalog-tabs" role="tablist">${tabs.map(([id,label])=>`<button class="catalog-tab ${active===id?"active":""}" data-catalog-tab="${id}" role="tab">${label}</button>`).join("")}</div>`}
function catalogTabItems(tab){
  if(currentFilter==="mylist"){
    const names=new Set(getList());
    return contents.filter(x=>names.has(x.title));
  }
  const typeFilter=["film","serie","anime"].includes(currentFilter)?currentFilter:null;
  let items=typeFilter?contents.filter(x=>x.type===typeFilter):contents;
  const state=getWatchState();
  if(tab==="resume") return items.filter(x=>state[x.id]?.progress>0).sort((a,b)=>(state[b.id]?.lastWatched||0)-(state[a.id]?.lastWatched||0));
  if(tab==="ranking") return [...items].sort((a,b)=>((state[b.id]?.views||0)*100+(Number(b.rating)||0))-((state[a.id]?.views||0)*100+(Number(a.rating)||0)));
  const terms={comedie:["comédie","comedie"],action:["action"],drame:["drame"],sf:["science-fiction","science fiction","sci-fi"],aventure:["aventure"]};
  if(terms[tab]) return items.filter(x=>terms[tab].some(t=>String(x.genre||"").toLowerCase().includes(t)));
  return items;
}
function renderCatalogView(tab="ranking"){
  const names={film:"Films",serie:"Séries",anime:"Animés",new:"Nouveautés",mylist:"Ma liste"};
  const items=catalogTabItems(tab);
  const resumeItems=catalogTabItems("resume");
  const label=tab==="ranking"?"Les plus regardés":"Sélection "+({comedie:"Comédie",action:"Action",drame:"Drame",sf:"Science-fiction",aventure:"Aventure"}[tab]||"");
  const resumeSection=currentFilter!=="mylist"&&resumeItems.length?section("Reprendre la lecture",resumeItems,"",currentFilter,"grid"):"";
  const tabsSection=currentFilter!=="mylist"?`<div class="catalog-tabs-label">EXPLORER PAR CATÉGORIE</div>${catalogTabs(tab)}`:"";
  const title=currentFilter==="mylist"?"Ma liste":"";
  $("content").innerHTML=`<div class="catalog-intro compact"><span class="intro-line"></span><div><span class="intro-kicker">${names[currentFilter]||"CATALOGUE"}</span><p>${currentFilter==="mylist"?"Retrouvez uniquement les titres que vous avez ajoutés à votre liste.":"Explorez votre catalogue NEXORA."}</p></div></div>${resumeSection}${tabsSection}${section(title||label,items,"",currentFilter,"grid")||`<div class="empty"><span>✦</span><h3>${currentFilter==="mylist"?"Votre liste est vide":"Aucun titre dans cette catégorie"}</h3><p>${currentFilter==="mylist"?"Ajoutez des films ou séries avec le bouton + Ma liste.":"Votre sélection apparaîtra ici au fil de vos lectures."}</p></div>`}`;
  document.querySelectorAll("[data-catalog-tab]").forEach(btn=>btn.addEventListener("click",()=>renderCatalogView(btn.dataset.catalogTab)));
  bindCards();
}

function filtered(){if(currentFilter==="mylist"){const names=new Set(getList());return contents.filter(x=>names.has(x.title))}if(["film","serie","anime"].includes(currentFilter))return contents.filter(x=>x.type===currentFilter);if(currentFilter==="new")return contents.filter(x=>x.is_new);if(currentFilter==="trend")return contents.filter(x=>x.is_featured||Number(x.rating||0)>=8);return contents}
function bindCards(){document.querySelectorAll(".card").forEach(el=>el.addEventListener("click",()=>openDetail(Number(el.dataset.id))));document.querySelectorAll("[data-play]").forEach(btn=>btn.addEventListener("click",e=>{e.stopPropagation();openPlayer(Number(btn.dataset.play))}));document.querySelectorAll("[data-info]").forEach(btn=>btn.addEventListener("click",e=>{e.stopPropagation();openDetail(Number(btn.dataset.info))}));document.querySelectorAll(".row-link").forEach(btn=>btn.addEventListener("click",()=>{const filter=btn.dataset.rowFilter;if(!filter)return;const target=document.querySelector(`.nav[data-filter="${filter}"]`);if(target)target.click()}))}
function render(){activeView="home";$("hero").classList.remove("hidden");$("status").classList.remove("hidden");const items=filtered();if(!items.length){$("content").innerHTML=`<div class="empty"><span>✦</span><h3>Votre sélection est encore vide</h3><p>De nouveaux programmes arriveront bientôt sur NEXORA.</p></div>`;return}if(currentFilter==="all"){const featured=contents.filter(x=>x.is_featured),films=contents.filter(x=>x.type==="film"),series=contents.filter(x=>x.type==="serie"),anime=contents.filter(x=>x.type==="anime"),critics=contents.filter(x=>Number(x.rating||0)>=8.5),news=contents.filter(x=>x.is_new),resume=Object.entries(getWatchState()).filter(([,v])=>v?.progress>0).sort((a,b)=>(b[1]?.lastWatched||0)-(a[1]?.lastWatched||0)).map(([id])=>contents.find(x=>String(x.id)===String(id))).filter(Boolean);$("content").innerHTML=`<div class="catalog-intro"><span class="intro-line"></span><div><span class="intro-kicker">VOTRE UNIVERS NEXORA</span><p>Des histoires à découvrir, sélectionnées pour vous.</p></div></div>`+(resume.length?section("Reprendre la lecture",resume,"","","row"):``)+section("Tendances",featured.length?featured:contents.slice(0,10),"","", "row")+section("Films populaires",films,"Tout voir","film")+section("Séries populaires",series,"Tout voir","serie")+section("Animés populaires",anime,"Tout voir","anime")+section("Salués par la critique",critics,"Tout voir","trend")+section("Nouveautés",news,"Tout voir","new")}else{renderCatalogView("ranking");return} }
function setHero(item){if(!item)return;$("heroBackdrop").style=bgStyle(item,"backdrop");$("heroType").textContent=`${labelType(item.type)}${item.genre?" · "+item.genre.toUpperCase():""}`;$("heroTitle").textContent=item.title;$("heroMeta").innerHTML=[item.year,item.duration_minutes?`${item.duration_minutes} min`:null,item.rating?`<strong>${escapeHtml(item.rating)}</strong>`:null].filter(Boolean).map(x=>typeof x==="string"&&x.startsWith("<strong")?x:`<span>${escapeHtml(x)}</span>`).join("<i>•</i>");$("heroDesc").textContent=item.description||"Découvrez cette histoire sur NEXORA.";$("heroProgress").style.width=item.is_new?"58%":item.is_featured?"42%":"28%";$("heroWatch").onclick=()=>openPlayer(item.id);$("heroInfo").onclick=()=>openModal(item.id);$("heroList").onclick=()=>toggleList(item.title);$("heroList").innerHTML=inList(item.title)?"✓ Dans ma liste":"<span>＋</span> Ma liste"}
let activeView="home";
let activePerson=null;

async function fetchNexoraDetails(payload){
  const {data,error}=await db.functions.invoke("nexora-tmdb-details",{body:payload});
  if(error) throw error;
  if(!data?.ok) throw new Error(data?.error||"Impossible de charger les informations TMDB.");
  return data;
}

function escapeAttr(value){return escapeHtml(String(value||"")).replace(/`/g,"&#96;")}

function showHomeView(){
  activeView="home";activePerson=null;
  $("hero").classList.remove("hidden");$("status").classList.remove("hidden");
  render();window.scrollTo({top:0,behavior:"smooth"});
}

function renderDetailLoading(title="Chargement…"){
  $("hero").classList.add("hidden");$("status").classList.add("hidden");
  $("content").innerHTML=`<section class="detail-page"><button class="detail-back" id="detailBack">← Retour</button><div class="detail-loading"><div class="detail-spinner"></div><p>${escapeHtml(title)}</p></div></section>`;
  $("detailBack").addEventListener("click",showHomeView);
}

function pickTrailer(videos){
  const results=(videos?.results||[]).filter(v=>v.site==="YouTube"&&v.key);
  const preferred=results.find(v=>/Trailer/i.test(v.type)&&v.official!==false)||results.find(v=>/Trailer|Teaser/i.test(v.type))||results[0];
  return preferred||null;
}

function formatCast(cast){return (cast||[]).filter(x=>x?.id&&x?.name).slice(0,12)}

function renderCast(cast){
  const people=formatCast(cast);
  if(!people.length)return `<div class="detail-block"><div class="detail-block-head"><span>CASTING</span></div><p class="detail-muted">Casting indisponible pour le moment.</p></div>`;
  return `<div class="detail-block"><div class="detail-block-head"><span>CASTING</span><small>${people.length} membres</small></div><div class="cast-grid">${people.map(person=>`<button class="cast-card" data-person="${person.id}"><div class="cast-photo" style="background-image:url('${person.profile_path?`https://image.tmdb.org/t/p/w185${person.profile_path}`:""}')"></div><strong>${escapeHtml(person.name)}</strong><span>${escapeHtml(person.character||person.roles?.[0]?.character||"")}</span></button>`).join("")}</div></div>`;
}

function renderTrailer(trailer){
  if(!trailer?.key)return `<div class="detail-block trailer-block"><div class="detail-block-head"><span>BANDE-ANNONCE</span></div><div class="trailer-empty">Aucune bande-annonce disponible.</div></div>`;
  return `<div class="detail-block trailer-block"><div class="detail-block-head"><span>BANDE-ANNONCE</span><small>Lecture automatique · son coupé</small></div><div class="trailer-frame"><iframe src="https://www.youtube.com/embed/${encodeURIComponent(trailer.key)}?autoplay=1&mute=1&playsinline=1&rel=0" title="${escapeAttr(trailer.name||"Bande-annonce")}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div></div>`;
}

async function openDetail(id){
  const item=contents.find(x=>x.id===id);if(!item)return;
  activeView="detail";activePerson=null;renderDetailLoading("Chargement de la fiche…");
  try{
    let data={item,details:null};
    if(item.tmdb_id){data=await fetchNexoraDetails({action:"content",type:item.type,tmdb_id:item.tmdb_id});}
    const d=data.details||{};const trailer=pickTrailer(d.videos);const cast=formatCast(d.aggregate_credits?.cast||d.credits?.cast);
    const release=d.release_date||d.first_air_date||item.year?String(d.release_date||d.first_air_date||item.year):"";
    const runtime=d.runtime||((d.episode_run_time||[])[0]);
    const genres=(d.genres||[]).map(x=>x.name).slice(0,4).join(" · ")||item.genre||"";
    const meta=[release?new Date(release).getFullYear():item.year,runtime?`${runtime} min`:null,genres,d.vote_average?`${Number(d.vote_average).toFixed(1)}/10`:item.rating?`${item.rating}/10`:null].filter(Boolean).join(" · ");
    const backdropUrl=d.backdrop_path?`https://image.tmdb.org/t/p/original${d.backdrop_path}`:item.backdrop_url;
    const posterUrl=d.poster_path?`https://image.tmdb.org/t/p/w500${d.poster_path}`:item.poster_url;
    $("content").innerHTML=`<section class="detail-page"><button class="detail-back" id="detailBack">← Retour</button><div class="detail-hero" style="--detail-bg:url('${escapeAttr(backdropUrl||posterUrl||"")}')"><div class="detail-hero-shade"></div><div class="detail-hero-content"><div class="detail-poster" style="${posterUrl?`background-image:url('${escapeAttr(posterUrl)}')`:''}"></div><div class="detail-copy"><div class="detail-kicker">${labelType(item.type)}</div><h1>${escapeHtml(d.title||d.name||item.title)}</h1><div class="detail-meta">${escapeHtml(meta)}</div><p>${escapeHtml(d.overview||item.description||"Aucune description disponible.")}</p><div class="detail-actions"><button class="btn btn-light" id="detailWatch">▶ Regarder</button><button class="btn btn-glass" id="detailList">＋ Ma liste</button></div></div></div></div>${renderTrailer(trailer)}${renderCast(cast)}</section>`;
    $("detailBack").addEventListener("click",showHomeView);$("detailWatch").addEventListener("click",()=>openPlayer(item.id));$("detailList").addEventListener("click",()=>{toggleList(item.title);$("detailList").textContent=inList(item.title)?"✓ Dans ma liste":"＋ Ma liste"});
    document.querySelectorAll("[data-person]").forEach(btn=>btn.addEventListener("click",()=>openPerson(Number(btn.dataset.person))));
    window.scrollTo({top:0,behavior:"smooth"});
  }catch(error){console.error(error);$("content").innerHTML=`<section class="detail-page"><button class="detail-back" id="detailBack">← Retour</button><div class="detail-error"><h2>Impossible de charger cette fiche</h2><p>${escapeHtml(error.message||"Une erreur est survenue.")}</p></div></section>`;$("detailBack").addEventListener("click",showHomeView)}
}

async function openPerson(personId){
  activeView="person";activePerson=personId;renderDetailLoading("Chargement de la fiche de l’acteur…");
  try{
    const data=await fetchNexoraDetails({action:"person",person_id:personId});const p=data.person||{};const credits=(p.combined_credits?.cast||[]).filter(x=>x?.id&&x?.media_type).sort((a,b)=>Number(b.popularity||0)-Number(a.popularity||0)).slice(0,24);
    $("content").innerHTML=`<section class="person-page"><button class="detail-back" id="personBack">← Retour</button><div class="person-head"><div class="person-photo" style="${p.profile_path?`background-image:url('https://image.tmdb.org/t/p/h632${escapeAttr(p.profile_path)}')`:''}"></div><div><div class="detail-kicker">CASTING NEXORA</div><h1>${escapeHtml(p.name||"Acteur")}</h1><p>${escapeHtml(p.biography||"Biographie indisponible.")}</p>${p.birthday?`<div class="detail-meta">Né(e) le ${escapeHtml(new Date(p.birthday).toLocaleDateString("fr-FR"))}${p.place_of_birth?` · ${escapeHtml(p.place_of_birth)}`:""}</div>`:""}</div></div><div class="detail-block"><div class="detail-block-head"><span>FILMS & SÉRIES</span><small>${credits.length} titres</small></div><div class="credit-grid">${credits.map(x=>{const title=x.title||x.name||"Sans titre";const date=x.release_date||x.first_air_date||"";return `<button class="credit-card" data-credit-type="${x.media_type}" data-credit-id="${x.id}"><div class="credit-poster" style="${x.poster_path?`background-image:url('https://image.tmdb.org/t/p/w342${escapeAttr(x.poster_path)}')`:''}"></div><div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(date?date.slice(0,4):"")}</span><small>${escapeHtml(x.character||"")}</small></div></button>`}).join("")}</div></div></section>`;
    $("personBack").addEventListener("click",showHomeView);document.querySelectorAll("[data-credit-id]").forEach(btn=>btn.addEventListener("click",()=>openTmdbCredit(Number(btn.dataset.creditId),btn.dataset.creditType)));window.scrollTo({top:0,behavior:"smooth"});
  }catch(error){console.error(error);$("content").innerHTML=`<section class="detail-page"><button class="detail-back" id="personBack">← Retour</button><div class="detail-error"><h2>Impossible de charger cet acteur</h2><p>${escapeHtml(error.message||"Une erreur est survenue.")}</p></div></section>`;$("personBack").addEventListener("click",showHomeView)}
}

function openTmdbCredit(tmdbId,mediaType){const item=contents.find(x=>Number(x.tmdb_id)===tmdbId);if(item){openDetail(item.id);return}const tempId=`tmdb-${mediaType}-${tmdbId}`;const temp={id:tempId,tmdb_id:tmdbId,type:mediaType==="tv"?"serie":"film",title:"Chargement…",description:"",year:null,genre:"",rating:null,poster_url:null,backdrop_url:null,video_url:null};contents.push(temp);openDetail(tempId)}

function openModal(id){selected=contents.find(x=>x.id===id);if(!selected)return;
  $("modalTitle").textContent=selected.title;$("modalType").textContent=labelType(selected.type);$("modalMeta").textContent=[selected.year,selected.genre,selected.duration_minutes?`${selected.duration_minutes} min`:null,selected.rating?`${selected.rating}/10`:null].filter(Boolean).join(" · ");$("modalDesc").textContent=selected.description||"Aucune description disponible.";$("modalBackdrop").style=bgStyle(selected,"backdrop");$("modalPoster").style=bgStyle(selected);
  const related=contents.filter(x=>x.id!==selected.id&&x.type===selected.type).sort((a,b)=>Number(b.rating||0)-Number(a.rating||0)).slice(0,4);
  const seasons=getSeasons(selected);
  const episodes=seasons?renderEpisodes(selected,Number(Object.keys(seasons).sort((a,b)=>Number(a)-Number(b))[0])):"";
  $("modalRelated").innerHTML=(episodes?episodes:"")+(related.length?`<div class="related-title">VOUS POURRIEZ AUSSI AIMER</div><div class="related-grid">${related.map(x=>`<button class="related-card" data-related="${x.id}"><span style="${bgStyle(x)}"></span><b>${escapeHtml(x.title)}</b></button>`).join("")}</div>`:"");
  document.querySelectorAll("[data-related]").forEach(btn=>btn.addEventListener("click",()=>openModal(Number(btn.dataset.related))));
  const seasonSelect=$("seasonSelect"); if(seasonSelect) seasonSelect.addEventListener("change",()=>{$("modalRelated").querySelector(".series-episodes").outerHTML=renderEpisodes(selected,Number(seasonSelect.value));bindEpisodeControls()});
  bindEpisodeControls();updateModalButtons();$("modalWatch").textContent=seasons?"▶ Reprendre la série":"▶ Regarder";$("modal").classList.remove("hidden");$("modal").setAttribute("aria-hidden","false")
}
function bindEpisodeControls(){document.querySelectorAll("[data-episode-play]").forEach(btn=>btn.addEventListener("click",e=>{e.stopPropagation();openPlayer(Number(btn.dataset.episodePlay))}))}

function updateModalButtons(){if(selected)$("modalList").textContent=inList(selected.title)?"✓ Dans ma liste":"＋ Ma liste"}
function closeModal(){$("modal").classList.add("hidden");$("modal").setAttribute("aria-hidden","true");selected=null}
function openPlayer(id){const item=contents.find(x=>x.id===id);if(!item)return;markWatched(item);const video=$("playerVideo"),empty=$("playerEmpty");$("playerTitle").textContent=item.title;$("playerEmptyTitle").textContent=item.video_url?"Préparation de la lecture…":"Lecture prête à être configurée";$("playerPoster").style=bgStyle(item);$("playerModal").classList.remove("hidden");$("playerModal").setAttribute("aria-hidden","false");if(item.video_url){empty.classList.add("hidden");video.classList.remove("hidden");video.src=item.video_url;video.play().catch(()=>{});}else{video.pause();video.removeAttribute("src");video.load();video.classList.add("hidden");empty.classList.remove("hidden");}}
function closePlayer(){const video=$("playerVideo");video.pause();video.removeAttribute("src");video.load();$("playerModal").classList.add("hidden");$("playerModal").setAttribute("aria-hidden","true");}
function setAuthMessage(text="",type=""){$("authMessage").textContent=text;$("authMessage").className=`auth-message ${type}`}
function updateAuthUI(){const logged=!!currentUser;$("authGuest").classList.toggle("hidden",logged);$("authUser").classList.toggle("hidden",!logged);if(logged){const name=currentUser.user_metadata?.full_name||currentUser.email?.split("@")[0]||"Compte NEXORA";$("accountName").textContent=name;$("accountEmail").textContent=currentUser.email||"";$("accountAvatar").textContent=name.trim().charAt(0).toUpperCase();$("accountButton").textContent=name.trim().charAt(0).toUpperCase()}else{$("accountButton").textContent="S"}$("authTitle").textContent=authMode==="signup"?"Créer un compte":"Connexion";$("authSubtitle").textContent=authMode==="signup"?"Créez votre compte NEXORA pour commencer.":"Retrouvez votre expérience NEXORA sur tous vos appareils."}
function setAuthMode(mode){authMode=mode;$("signupNameWrap").classList.toggle("hidden",mode!=="signup");$("authPassword").autocomplete=mode==="signup"?"new-password":"current-password";$("authSubmit").textContent=mode==="signup"?"Créer mon compte":"Se connecter";$("authSwitch").textContent=mode==="signup"?"J'ai déjà un compte":"Créer un compte";setAuthMessage("");updateAuthUI()}
function openAuth(){updateAuthUI();$("authModal").classList.remove("hidden");$("authModal").setAttribute("aria-hidden","false");setTimeout(()=>{if(!currentUser)$("authEmail").focus()},50)}
function closeAuth(){$("authModal").classList.add("hidden");$("authModal").setAttribute("aria-hidden","true");setAuthMessage("")}
async function submitAuth(){const email=$("authEmail").value.trim(),password=$("authPassword").value,name=$("authName").value.trim();if(!email||!password){setAuthMessage("Renseigne ton e-mail et ton mot de passe.","error");return}if(password.length<6){setAuthMessage("Le mot de passe doit contenir au moins 6 caractères.","error");return}$("authSubmit").disabled=true;setAuthMessage(authMode==="signup"?"Création du compte…":"Connexion…");try{if(authMode==="signup"){const {data,error}=await db.auth.signUp({email,password,options:{data:{full_name:name||undefined},emailRedirectTo:window.location.origin}});if(error)throw error;if(data.session){currentUser=data.user;setAuthMessage("Compte créé. Bienvenue sur NEXORA !","ok");updateAuthUI()}else setAuthMessage("Compte créé. Vérifie ton e-mail pour confirmer ton adresse.","ok")}else{const {data,error}=await db.auth.signInWithPassword({email,password});if(error)throw error;currentUser=data.user;updateAuthUI();setTimeout(closeAuth,450)}}catch(error){console.error(error);setAuthMessage(error.message||"Une erreur est survenue.","error")}finally{$("authSubmit").disabled=false}}

$("closeModal").addEventListener("click",closeModal);$("closePlayer").addEventListener("click",closePlayer);$("playerModal").addEventListener("click",e=>{if(e.target===$("playerModal"))closePlayer()});$("modal").addEventListener("click",e=>{if(e.target===$("modal"))closeModal()});$("modalList").addEventListener("click",()=>selected&&toggleList(selected.title));$("modalWatch").addEventListener("click",()=>selected&&openPlayer(selected.id));
$("accountButton").addEventListener("click",openAuth);$("closeAuth").addEventListener("click",closeAuth);$("authModal").addEventListener("click",e=>{if(e.target===$("authModal"))closeAuth()});$("authSwitch").addEventListener("click",()=>setAuthMode(authMode==="signup"?"login":"signup"));$("authSubmit").addEventListener("click",submitAuth);$("signOut").addEventListener("click",async()=>{const {error}=await db.auth.signOut();if(error){setAuthMessage(error.message,"error");return}currentUser=null;setAuthMode("login")});

document.querySelectorAll(".nav").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));btn.classList.add("active");currentFilter=btn.dataset.filter;render();window.scrollTo({top:document.querySelector("main").offsetTop-65,behavior:"smooth"})}));
$("searchToggle").addEventListener("click",()=>{$("searchWrap").classList.toggle("open");if($("searchWrap").classList.contains("open"))$("search").focus()});$("search").addEventListener("input",()=>{const q=$("search").value.trim().toLowerCase();if(!q){render();return}const results=contents.filter(x=>[x.title,x.genre,x.description,x.type].some(v=>String(v||"").toLowerCase().includes(q)));$("content").innerHTML=section(`Résultats pour « ${escapeHtml(q)} »`,results,`${results.length} résultat(s)`)||`<div class="empty">Aucun résultat.</div>`;bindCards()});
window.addEventListener("scroll",()=>$("topbar").classList.toggle("scrolled",window.scrollY>30));document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeModal();closeAuth();closePlayer()}});

db.auth.getSession().then(({data})=>{currentUser=data.session?.user||null;updateAuthUI()});db.auth.onAuthStateChange((_event,session)=>{currentUser=session?.user||null;updateAuthUI()});
async function loadContents(){$("status").innerHTML='<span class="status-dot"></span> Connexion à la base NEXORA…';const {data,error}=await db.from("contents").select("*").order("created_at",{ascending:false});if(error){console.error(error);$("status").innerHTML='<span class="status-dot"></span> Impossible de charger le catalogue.';$("status").className="status error";return}const dbContents=data||[];const knownTitles=new Set(dbContents.map(x=>String(x.title).toLowerCase()));const demoOnly=[...demoCatalog,...extraCatalog].filter(x=>!knownTitles.has(String(x.title).toLowerCase()));contents=[...dbContents,...demoOnly];$("status").innerHTML=`<span class="status-dot"></span> Catalogue connecté · ${contents.length} contenu(s)`;$("status").className="status ok";const hero=contents.find(x=>x.is_featured)||contents[0];setHero(hero);render()}
loadContents();
