const SUPABASE_URL = "https://fwmwrjcsgtxcniluafva.supabase.co";
const SUPABASE_KEY = "sb_publishable_WChsmyEMVESddpu1qw-9jg_Tzv9kYLI";
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const brandHome = document.getElementById("brandHome");
const $ = id => document.getElementById(id);
let contents=[], currentFilter="all", selected=null, currentUser=null, authMode="login";





function isSeries(item){return ['serie','series','tv','anime'].includes(String(item?.type||'').toLowerCase());}
function getSeasons(item){
const raw=item?.seasons||null;
  if(raw && !Array.isArray(raw)) return raw;
  if(Array.isArray(raw)){
    const mapped={};
    raw.forEach((row,index)=>{const key=String(row?.season_number||row?.season||index+1);mapped[key]=row?.episodes||row?.episode_list||[];});
    return mapped;
  }
  return null;
}
function episodeFallback(item,season,number,name=''){
  const title=name||`Épisode ${number}`;
  const seriesTitle=item?.title||'cette série';
  return {
    episode_number:number,
    name:title,
    overview:`Dans ${seriesTitle}, la saison ${season} se poursuit avec « ${title} ». Cet épisode fait avancer l’histoire et développe les personnages principaux.`,
    still_path:null,
    air_date:null,
    runtime:item?.episode_duration||45
  };
}
function normalizeEpisode(ep,index,item,season=1){
  if(typeof ep==='string') return episodeFallback(item,season,index+1,ep);
  const number=Number(ep?.episode_number||index+1);
  const name=ep?.name||ep?.title||`Épisode ${number}`;
  return {
    episode_number:number,
    name,
    overview:ep?.overview||ep?.description||episodeFallback(item,season,number,name).overview,
    still_path:ep?.still_path||ep?.image||ep?.still||null,
    air_date:ep?.air_date||ep?.release_date||null,
    runtime:ep?.runtime||item?.episode_duration||45
  };
}
function episodeImage(item,episode){
  if(episode?.still_path){
    if(String(episode.still_path).startsWith('http')) return episode.still_path;
    return `https://image.tmdb.org/t/p/w500${episode.still_path}`;
  }
  return item?.backdrop_url||item?.poster_url||'';
}
function renderEpisodes(item, season=1){
  const seasons=getSeasons(item);
  if(!seasons)return `<div class="series-episodes empty-episodes"><div class="season-head"><div><span class="row-eyebrow">SAISONS & ÉPISODES</span><h3>Épisodes indisponibles</h3></div></div><p class="detail-muted">Les épisodes de cette série ne sont pas encore disponibles.</p></div>`;
  const keys=Object.keys(seasons).filter(k=>Number(k)>0).sort((a,b)=>Number(a)-Number(b));
  if(!keys.length)return `<div class="series-episodes empty-episodes"><p class="detail-muted">Aucune saison disponible.</p></div>`;
  const selectedSeason=keys.some(k=>String(k)===String(season))?String(season):String(keys[0]);
  return `<div class="series-episodes" data-series-episodes="${escapeAttr(item.id)}">
    <div class="season-head"><div><span class="row-eyebrow">SAISONS & ÉPISODES</span><h3>Saisons et épisodes</h3></div><span class="season-count">${keys.length} saison${keys.length>1?'s':''}</span></div>
    <div class="season-tabs" role="tablist" aria-label="Choisir une saison">
      ${keys.map(k=>{const active=String(k)===selectedSeason;return `<button class="season-tab ${active?'active':''}" data-season-tab="${escapeAttr(k)}" aria-selected="${active?'true':'false'}" aria-controls="season-panel-${escapeAttr(item.id)}-${escapeAttr(k)}" type="button">Saison ${escapeHtml(k)}</button>`}).join('')}
    </div>
    <div class="all-season-episodes">
      ${keys.map(k=>{const active=String(k)===selectedSeason;const raw=Array.isArray(seasons[k])?seasons[k]:[];const eps=raw.map((ep,i)=>normalizeEpisode(ep,i,item,k));return `<section id="season-panel-${escapeAttr(item.id)}-${escapeAttr(k)}" class="season-panel ${active?'active':''}" data-season-panel="${escapeAttr(k)}" ${active?'':'hidden'}>
        <div class="season-panel-title"><h4>Saison ${escapeHtml(k)}</h4><span>${eps.length} épisode${eps.length>1?'s':''}</span></div>
        <div class="episode-list">${eps.length?eps.map((ep,i)=>{const img=episodeImage(item,ep);const desc=ep.overview||episodeFallback(item,k,i+1,ep.name).overview;return `<article class="episode" data-episode-card="${escapeAttr(item.id)}-${escapeAttr(k)}-${i+1}"><div class="episode-number">${String(ep.episode_number||i+1).padStart(2,'0')}</div><button class="episode-thumb episode-click-target" data-episode-play="${escapeAttr(item.id)}" data-season="${escapeAttr(k)}" data-episode="${ep.episode_number||i+1}" aria-label="Lire ${escapeAttr(ep.name)}" type="button" style="${img?`background-image:url('${escapeAttr(img)}')`:bgStyle(item,'backdrop')}"><span>▶</span></button><div class="episode-info"><h4>${escapeHtml(ep.name)}</h4><p>${escapeHtml(desc)}</p><span class="episode-meta">${ep.air_date?escapeHtml(ep.air_date)+' · ':''}${escapeHtml(ep.runtime)} min</span></div><button class="episode-play" data-episode-play="${escapeAttr(item.id)}" data-season="${escapeAttr(k)}" data-episode="${ep.episode_number||i+1}" aria-label="Lire saison ${escapeAttr(k)}, épisode ${ep.episode_number||i+1}" type="button">▶</button></article>`}).join(''):`<p class="detail-muted episode-empty-message">Les épisodes de cette saison sont en cours de chargement.</p>`}</div>
      </section>`}).join('')}
    </div>
  </div>`;
}
function renderRelatedContent(base){
  const pool=contents.filter(x=>String(x.id)!==String(base.id)&&String(x.type)===String(base.type));
  const related=pool.sort((a,b)=>{const sameGenre=(String(b.genre||'').toLowerCase().includes(String(base.genre||'').split('·')[0].trim().toLowerCase())?1:0)-(String(a.genre||'').toLowerCase().includes(String(base.genre||'').split('·')[0].trim().toLowerCase())?1:0);return sameGenre||Number(b.rating||0)-Number(a.rating||0)}).slice(0,6);
  if(!related.length)return '';
  return `<div class="detail-block related-detail-block"><div class="detail-block-head"><span>VOUS POURRIEZ AUSSI AIMER</span><small>${related.length} recommandations</small></div><div class="related-detail-grid">${related.map(x=>{
    const backdrop=imageUrl(x,'backdrop');
    const poster=imageUrl(x,'poster');
    const primary=backdrop||poster;
    const fallback=poster&&poster!==primary?poster:'';
    const image=primary?`<img class="related-detail-img" src="${escapeAttr(primary)}" alt="${escapeAttr(x.title)}" loading="lazy" decoding="async" ${fallback?`data-fallback="${escapeAttr(fallback)}" onerror="if(this.dataset.fallback){this.src=this.dataset.fallback;this.dataset.fallback=''}else{this.style.display='none'}"`:`onerror="this.style.display='none'"`}>`:'';
    return `<button class="related-detail-card" data-related-detail="${escapeAttr(x.id)}" type="button"><div class="related-detail-image" style="${primary?'':bgStyle(x,'poster')}">${image}<span class="related-detail-type">${labelType(x.type)}</span><span class="related-detail-play">▶</span></div><div class="related-detail-body"><strong>${escapeHtml(x.title)}</strong><span>${escapeHtml([x.year,x.genre,x.rating?`${x.rating}/10`:null].filter(Boolean).join(' · '))}</span><p>${escapeHtml(x.description||'Découvrez ce contenu sur NEXORA.')}</p></div></button>`;
  }).join('')}</div></div>`;
}
function escapeHtml(value=""){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));}
function getList(){try{return JSON.parse(localStorage.getItem("nexora_list")||"[]")}catch{return[]}}
function saveList(list){localStorage.setItem("nexora_list",JSON.stringify(list))}
function inList(title){return getList().includes(title)}
function toggleList(title){const list=getList();const next=list.includes(title)?list.filter(x=>x!==title):[...list,title];saveList(next);render();if(selected)updateModalButtons()}
function gradientFor(item){const seeds={film:["#263345","#11141b"],serie:["#20362e","#10151a"],anime:["#38223c","#12131a"]};const s=seeds[item.type]||seeds.film;return `linear-gradient(135deg,${s[0]},${s[1]})`}
function imageUrl(item, prefer="poster"){
  const raw=prefer==="backdrop"
    ? (item.backdrop_url||item.backdrop||item.backdrop_path||item.image_url||item.image||item.cover_url||item.poster_url||item.poster||item.poster_path||item.thumbnail_url)
    : (item.poster_url||item.poster||item.poster_path||item.image_url||item.image||item.cover_url||item.thumbnail_url||item.backdrop_url||item.backdrop||item.backdrop_path);
  if(!raw)return "";
  const value=String(raw);
  if(/^https?:\/\//i.test(value))return value;
  if(value.startsWith("/"))return `https://image.tmdb.org/t/p/w500${value}`;
  return value;
}
function bgStyle(item, prefer="poster"){const url=imageUrl(item,prefer);return url?`background-image:url("${escapeAttr(url)}")`:`background:${gradientFor(item)}`}
function normalizeContentType(item={}){
  const raw=String(item.type||item.media_type||item.content_type||item.category||"").toLowerCase().trim();
  const genres=String(item.genre||item.genres||item.genre_names||"").toLowerCase();
  const explicitAnime=item.is_anime===true||item.isAnime===true||raw==="anime"||raw==="animation";
  const animated=/(animation|anime|animé|anime)/i.test(genres);
  if(explicitAnime || (animated && !["film","movie"].includes(raw))) return "anime";
  if(["film","movie"].includes(raw)) return "film";
  if(["anime","animation"].includes(raw)) return "anime";
  if(["serie","series","tv","show"].includes(raw)) return "serie";
  return raw||"serie";
}
function normalizeContent(item={}){return {...item,type:normalizeContentType(item)}}

const CONFIG_CATALOG = {
  allowedLanguages: ['fr', 'en', 'es', 'ja', 'ko', 'it', 'de'],
  excludedLanguages: ['hi', 'ta', 'te', 'ml', 'kn', 'bn', 'mr', 'pa', 'gu', 'ur', 'th', 'id', 'tl', 'vi'],
  excludedCountries: ['IN', 'TH'],
  onlyWithVideoUrl: false
};

function hasVideoSource(item){
  if(!item) return false;
  if(item.video_url && String(item.video_url).trim() !== '') return true;
  if(item.url && String(item.url).trim() !== '') return true;
  if(item.stream_url && String(item.stream_url).trim() !== '') return true;
  if(Array.isArray(item.sources) && item.sources.some(s => s && s.url && String(s.url).trim() !== '')) return true;
  const seasons = getSeasons(item);
  if(seasons && typeof seasons === 'object'){
    for(const s in seasons){
      if(Array.isArray(seasons[s]) && seasons[s].some(ep => ep && (ep.video_url || ep.url || ep.stream_url))) return true;
    }
  }
  return false;
}

function isAllowedContent(item){
  if(!item) return false;
  const lang = String(item.original_language || item.originalLanguage || '').toLowerCase().trim();
  const rawCountry = Array.isArray(item.origin_country) ? item.origin_country.join(',') : String(item.origin_country || item.originCountry || '');
  const country = rawCountry.toUpperCase();
  if(lang && CONFIG_CATALOG.excludedLanguages.includes(lang)) return false;
  if(CONFIG_CATALOG.excludedCountries.some(c => new RegExp('(^|[,\s])' + c + '($|[,\s])', 'i').test(country))) return false;
  if(lang && !CONFIG_CATALOG.allowedLanguages.includes(lang)){
    if(item.type === 'anime' && (lang === 'ja' || /JP|JAPON|JAPAN/i.test(country))) return true;
    return false;
  }
  if(CONFIG_CATALOG.onlyWithVideoUrl && !hasVideoSource(item)) return false;
  return true;
}

function labelType(type){return ({film:"FILM",serie:"SÉRIE",anime:"ANIMÉ"})[normalizeContentType({type})]||String(type||"").toUpperCase()}
function card(item){
  const meta=[item.year,item.genre,item.rating?`${item.rating}/10`:null].filter(Boolean).join(" · ");
  const poster=imageUrl(item,"poster");
  const posterMarkup=poster?`<img class="title-card-poster" src="${escapeAttr(poster)}" alt="Affiche de ${escapeAttr(item.title)}" loading="lazy" decoding="async">`:"";
  return `<article class="title-card" data-id="${escapeAttr(item.id)}">
    <div class="title-card-media">${posterMarkup}</div>
    <div class="title-card-shade"></div>
    <div class="title-card-info">
      <div class="title-card-type">${labelType(item.type)}</div>
      <div class="title-card-title">${escapeHtml(item.title)}</div>
      <div class="title-card-meta">${escapeHtml(meta)}</div>
    </div>
    <button class="title-card-play" type="button" data-play="${escapeAttr(item.id)}" aria-label="Lire ${escapeAttr(item.title)}">▶</button>
  </article>`;
}
function section(title,items,suffix="",filter="",layout="row"){
  if(!items.length)return"";
  const count=items.length;
  const visible=layout==="grid"?items:items.slice(0,24);
  const listClass=layout==="grid"?"cards catalog-grid":"cards";
  return `<section class="row ${layout==="grid"?"row-grid-view":""}"><div class="row-head"><div class="row-heading"><span class="row-eyebrow">NEXORA</span><h2>${title}</h2></div>${layout==="grid"?"":`<button class="row-link" data-row-filter="${filter}">${suffix||`${count} titre${count>1?"s":""}`} <span>→</span></button>`}</div><div class="${listClass}">${visible.map(card).join("")}</div></section>`;
}
function getWatchState(){try{return JSON.parse(localStorage.getItem("nexora_watch")||"{}")}catch{return{}}}
function saveWatchState(state){localStorage.setItem("nexora_watch",JSON.stringify(state))}
function markWatched(item){const state=getWatchState();const entry=state[item.id]||{views:0,progress:0};entry.views=(entry.views||0)+1;entry.lastWatched=Date.now();entry.progress=Math.max(entry.progress||0,8);state[item.id]=entry;saveWatchState(state)}
function catalogTabs(active="ranking"){const tabs=[
  ["ranking","Classement"],["comedie","Comédie"],["action","Action"],["drame","Drame"],["sf","Science-fiction"],["aventure","Aventure"]
];return `<div class="catalog-tabs" role="tablist">${tabs.map(([id,label])=>`<button class="catalog-tab ${active===id?"active":""}" data-catalog-tab="${id}" role="tab">${label}</button>`).join("")}</div>`}

function popularityScore(item){
  const state=getWatchState();
  return (Number(state[item.id]?.views||0)*1000)
    +(Number(item.is_featured?1:0)*100)
    +(Number(item.popularity||0)*10)
    +(Number(item.rating||0)*10);
}
function popularItems(type){
  return contents.filter(x=>!type||x.type===type).sort((a,b)=>popularityScore(b)-popularityScore(a));
}
function heroCandidates(filter){
  if(filter==="film") return popularItems("film");
  if(filter==="serie") return popularItems("serie");
  if(filter==="anime") return popularItems("anime");
  if(filter==="new") return recentFilms();
  if(filter==="mylist") return contents.filter(x=>getList().includes(x.title));
  if(filter==="trend") return popularItems().filter(x=>x.is_featured||Number(x.rating||0)>=8);
  return contents.filter(x=>x.is_featured).sort((a,b)=>popularityScore(b)-popularityScore(a));
}

function isRecentFilm(item){
  if(item?.type!=="film") return false;
  const now=new Date();
  const cutoff=new Date(now);
  cutoff.setFullYear(cutoff.getFullYear()-1);
  const raw=item.release_date||item.releaseDate;
  if(raw){
    const d=new Date(raw);
    if(!Number.isNaN(d.getTime())) return d>=cutoff&&d<=now;
  }
  const y=Number(item?.year||0);
  return y>=now.getFullYear()-1&&y<=now.getFullYear();
}
function recentFilms(){return contents.filter(isRecentFilm).sort((a,b)=>{
  const da=new Date(a.release_date||`${a.year||0}-01-01`).getTime()||0;
  const db=new Date(b.release_date||`${b.year||0}-01-01`).getTime()||0;
  return db-da;
});}
function catalogTabItems(tab){
  if(currentFilter==="mylist"){
    const names=new Set(getList());
    return contents.filter(x=>names.has(x.title));
  }
  if(currentFilter==="new") {
    let items=recentFilms();
    if(tab==="resume") return items.filter(x=>getWatchState()[x.id]?.progress>0);
    const terms={comedie:["comédie","comedie"],action:["action"],drame:["drame"],sf:["science-fiction","science fiction","sci-fi"],aventure:["aventure"]};
    if(tab==="ranking"||tab==="popular") return [...items].sort((a,b)=>popularityScore(b)-popularityScore(a));
    if(terms[tab]) return items.filter(x=>terms[tab].some(t=>String(x.genre||"").toLowerCase().includes(t)));
    return items;
  }
  const typeFilter=["film","serie","anime"].includes(currentFilter)?currentFilter:null;
  let items=typeFilter?contents.filter(x=>x.type===typeFilter):contents;
  const state=getWatchState();
  if(tab==="resume") return items.filter(x=>state[x.id]?.progress>0).sort((a,b)=>(state[b.id]?.lastWatched||0)-(state[a.id]?.lastWatched||0));
  if(tab==="ranking"||tab==="popular") return popularItems(typeFilter);
  const terms={comedie:["comédie","comedie"],action:["action"],drame:["drame"],sf:["science-fiction","science fiction","sci-fi"],aventure:["aventure"]};
  if(terms[tab]) return items.filter(x=>terms[tab].some(t=>String(x.genre||"").toLowerCase().includes(t)));
  return items;
}

function renderCatalogView(tab="ranking"){
  const names={film:"Films",serie:"Séries",anime:"Animés",new:"Nouveautés",mylist:"Ma liste"};
  const items=catalogTabItems(tab);
  const resumeItems=catalogTabItems("resume");
  const labels={ranking:"Les plus regardés",popular:"Populaires",comedie:"Comédie",action:"Action",drame:"Drame",sf:"Science-fiction",aventure:"Aventure"};
  const label=labels[tab]||"Sélection";
  const resumeSection=currentFilter!=="mylist"&&tab!=="popular"&&resumeItems.length?section("Reprendre la lecture",resumeItems,"",currentFilter,"grid"):"";
  const tabsSection=currentFilter!=="mylist"?`<div class="catalog-tabs-label">EXPLORER PAR CATÉGORIE</div>${catalogTabs(tab==="popular"?"ranking":tab)}`:"";
  const title=currentFilter==="mylist"?"Ma liste":label;
  $("content").innerHTML=`<div class="catalog-intro compact"><span class="intro-line"></span><div><span class="intro-kicker">${names[currentFilter]||"CATALOGUE"}</span><p>${currentFilter==="mylist"?"Retrouvez uniquement les titres que vous avez ajoutés à votre liste.":"Explorez votre catalogue NEXORA."}</p></div></div>${resumeSection}${tabsSection}${section(title,items,"",currentFilter,"grid")||`<div class="empty"><span>✦</span><h3>${currentFilter==="mylist"?"Votre liste est vide":"Aucun titre dans cette catégorie"}</h3><p>${currentFilter==="mylist"?"Ajoutez des films ou séries avec le bouton + Ma liste.":"Votre sélection apparaîtra ici au fil de vos lectures."}</p></div>`}`;
  document.querySelectorAll("[data-catalog-tab]").forEach(btn=>btn.addEventListener("click",()=>renderCatalogView(btn.dataset.catalogTab)));
  bindCards();
}

function filtered()
function filtered(){if(currentFilter==="mylist"){const names=new Set(getList());return contents.filter(x=>names.has(x.title))}if(["film","serie","anime"].includes(currentFilter))return contents.filter(x=>x.type===currentFilter);if(currentFilter==="new")return recentFilms();if(currentFilter==="trend")return contents.filter(x=>x.is_featured||Number(x.rating||0)>=8);return contents}
function resolveContentId(raw){
  const value=String(raw??"");
  const found=contents.find(x=>String(x.id)===value);
  return found ? found.id : null;
}
function bindCards(){
  const root=$("content");
  if(!root || root.dataset.cardsBound==="1") return;
  root.dataset.cardsBound="1";
  root.addEventListener("click",e=>{
    const rowLink=e.target.closest(".row-link");
    if(rowLink){
      e.preventDefault();
      const filter=rowLink.dataset.rowFilter;
      if(["film","serie","anime","new","mylist"].includes(filter)){
        const target=document.querySelector(`.nav[data-filter="${filter}"]`);
        if(target) target.click();
      } else if(/^popular-(film|serie|anime)$/.test(filter)){
        currentFilter=filter.replace("popular-","");
        document.querySelectorAll(".nav").forEach(x=>x.classList.toggle("active",x.dataset.filter===currentFilter));
        renderCatalogView("popular");
        window.scrollTo({top:document.querySelector("main").offsetTop-65,behavior:"smooth"});
      } else if(filter==="trend"){
        currentFilter="all"; renderCatalogView("ranking");
        document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));
        window.scrollTo({top:document.querySelector("main").offsetTop-65,behavior:"smooth"});
      }
      return;
    }
    const play=e.target.closest("[data-play]");
    if(play){e.preventDefault();e.stopPropagation();const id=resolveContentId(play.dataset.play);if(id!==null)openPlayer(id);return;}
    const info=e.target.closest("[data-info]");
    if(info){e.preventDefault();e.stopPropagation();const id=resolveContentId(info.dataset.info);if(id!==null)openDetail(id);return;}
    const card=e.target.closest(".title-card");
    if(card){const id=resolveContentId(card.dataset.id);if(id!==null)openDetail(id);}
  });
}
function render(){
  activeView="home";
  $("hero")?.classList.remove("hidden");
  $("status")?.classList.remove("hidden");
  const items=filtered();
  if(!items.length){
    stopHeroCarousel();
    $("content").innerHTML=`<div class="empty"><span>✦</span><h3>Votre sélection est encore vide</h3><p>De nouveaux programmes arriveront bientôt sur NEXORA.</p></div>`;
    return;
  }
  startHeroCarousel(heroCandidates(currentFilter));
  if(currentFilter==="all"){
    const featured=contents.filter(x=>x.is_featured);
    const films=popularItems("film"),series=popularItems("serie"),anime=popularItems("anime");
    const critics=contents.filter(x=>Number(x.rating||0)>=8.5).sort((a,b)=>Number(b.rating||0)-Number(a.rating||0));
    const news=recentFilms();
    const resume=Object.entries(getWatchState()).filter(([,v])=>v?.progress>0).sort((a,b)=>(b[1]?.lastWatched||0)-(a[1]?.lastWatched||0)).map(([id])=>contents.find(x=>String(x.id)===String(id))).filter(Boolean);
    $("content").innerHTML=`<div class="catalog-intro"><span class="intro-line"></span><div><span class="intro-kicker">VOTRE UNIVERS NEXORA</span><p>Des histoires à découvrir, sélectionnées pour vous.</p></div></div>`
      +(resume.length?section("Reprendre la lecture",resume,"","","row"):"")
      +section("Tendances",featured.length?featured:contents.slice(0,10),"","", "row")
      +section("Films populaires",films,"Tout voir","popular-film")
      +section("Séries populaires",series,"Tout voir","popular-serie")
      +section("Animés populaires",anime,"Tout voir","popular-anime")
      +section("Salués par la critique",critics,"Tout voir","trend")
      +section("Nouveautés",news,"Tout voir","new");
  }else{
    renderCatalogView("ranking");
    return;
  }
  bindCards();
}

let heroTimer=null;
let heroItems=[];
let heroIndex=0;

function stopHeroCarousel(){
  if(heroTimer){clearInterval(heroTimer);heroTimer=null;}
  heroItems=[];heroIndex=0;
}
function renderHeroDots(){
  const dots=$("heroDots");
  if(!dots)return;
  dots.innerHTML=heroItems.slice(0,8).map((item,index)=>`<button type="button" class="hero-dot ${index===heroIndex?"active":""}" data-hero-index="${index}" aria-label="Afficher ${escapeAttr(item.title)}"></button>`).join("");
  dots.querySelectorAll("[data-hero-index]").forEach(dot=>dot.addEventListener("click",()=>{
    heroIndex=Number(dot.dataset.heroIndex);
    setHero(heroItems[heroIndex]);
    renderHeroDots();
    restartHeroTimer();
  }));
}
function restartHeroTimer(){
  if(heroTimer)clearInterval(heroTimer);
  if(heroItems.length<2)return;
  heroTimer=setInterval(()=>{
    heroIndex=(heroIndex+1)%heroItems.length;
    setHero(heroItems[heroIndex]);
    renderHeroDots();
  },6500);
}
function startHeroCarousel(pool){
  stopHeroCarousel();
  heroItems=(pool||[]).filter(Boolean).slice(0,8);
  if(!heroItems.length)return;
  heroIndex=0;
  setHero(heroItems[0]);
  renderHeroDots();
  restartHeroTimer();
}

function setHero(item){
  if(!item)return;
  $("heroBackdrop").style=bgStyle(item,"backdrop");
  $("heroType").textContent=`${labelType(item.type)}${item.genre?" · "+item.genre.toUpperCase():""}`;
  $("heroTitle").textContent=item.title;
  $("heroMeta").innerHTML=[item.year,item.duration_minutes?`${item.duration_minutes} min`:null,item.rating?`<strong>${escapeHtml(item.rating)}</strong>`:null].filter(Boolean).map(x=>typeof x==="string"&&x.startsWith("<strong")?x:`<span>${escapeHtml(x)}</span>`).join("<i>•</i>");
  $("heroDesc").textContent=item.description||"Découvrez cette histoire sur NEXORA.";
  $("heroProgress").style.width="0%";
  $("heroWatch").onclick=()=>openPlayer(item.id);
  $("heroInfo").onclick=()=>openModal(item.id);
  $("heroList").onclick=()=>toggleList(item.title);
  $("heroList").innerHTML=inList(item.title)?"✓ Dans ma liste":"<span>＋</span> Ma liste";
}

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
  $("hero")?.classList.remove("hidden");$("status")?.classList.remove("hidden");
  render();window.scrollTo({top:0,behavior:"smooth"});
}

function renderDetailLoading(title="Chargement…"){
  $("hero")?.classList.add("hidden");$("status")?.classList.add("hidden");
  $("content").innerHTML=`<section class="detail-page"><button class="detail-back" id="detailBack">← Retour</button><div class="detail-loading"><div class="detail-spinner"></div><p>${escapeHtml(title)}</p></div></section>`;
  $("detailBack").addEventListener("click",showHomeView);
}

function pickTrailer(videos, title=""){
  const results=(videos?.results||[]).filter(v=>v.site==="YouTube"&&v.key);
  if(!results.length)return null;
  const french=results.find(v=>{
    const text=`${v.name||""} ${v.iso_639_1||""} ${v.iso_3166_1||""}`.toLowerCase();
    return /(^|\b)(fr|fra|french|français|francaise|vf|doublage)(\b|$)/i.test(text);
  });
  return french||null;
}

function formatCast(cast){return (cast||[]).filter(x=>x?.id&&x?.name).slice(0,12)}

function renderCast(cast){
  const people=formatCast(cast);
  if(!people.length)return `<div class="detail-block"><div class="detail-block-head"><span>CASTING</span></div><p class="detail-muted">Casting indisponible pour le moment.</p></div>`;
  return `<div class="detail-block"><div class="detail-block-head"><span>CASTING</span><small>${people.length} membres</small></div><div class="cast-grid">${people.map(person=>`<button class="cast-card" data-person="${person.id}"><div class="cast-photo" style="background-image:url('${person.profile_path?`https://image.tmdb.org/t/p/w185${person.profile_path}`:""}')"></div><strong>${escapeHtml(person.name)}</strong><span>${escapeHtml(person.character||person.roles?.[0]?.character||"")}</span></button>`).join("")}</div></div>`;
}

function getTrailerUrl(trailer, title=""){
  const query=encodeURIComponent(`${title} bande annonce française VF officiel`);
  return trailer?.key
    ? `https://www.youtube.com/watch?v=${encodeURIComponent(trailer.key)}`
    : `https://www.youtube.com/results?search_query=${query}`;
}

async function openDetail(id){
  let item=contents.find(x=>String(x.id)===String(id));
  if(!item && String(id).startsWith("tmdb-")) {
    const parts = String(id).split("-");
    const mType = parts[1];
    const tId = Number(parts[2]);
    item = { id, tmdb_id: tId, type: mType === "tv" ? "serie" : "film", title: "Chargement…", description: "" };
    contents.push(item);
  }
  if(!item)return;
  activeView="detail";activePerson=null;renderDetailLoading("Chargement de la fiche…");
  try{
    let data={item,details:null};
    if(item.tmdb_id){data=await fetchNexoraDetails({action:"content",type:item.type,tmdb_id:item.tmdb_id});}
    const d=data.details||{};const trailer=pickTrailer(d.videos,d.title||d.name||item.title);const cast=formatCast(d.aggregate_credits?.cast||d.credits?.cast);
    if(isSeries(item)){
      const seasonRows=Array.isArray(d.seasons)?d.seasons.filter(s=>Number(s?.season_number||s?.season)>0):[];
      const seasonCount=Number(d.number_of_seasons||d.seasons_count||item.number_of_seasons||0);
      const sourceSeasons=getSeasons(item)||{};
      const keys=new Set(Object.keys(sourceSeasons).filter(k=>Number(k)>0));
      seasonRows.forEach(row=>keys.add(String(row.season_number||row.season)));
      if(!keys.size && seasonCount>0) for(let n=1;n<=Math.min(seasonCount,50);n++) keys.add(String(n));
      if(keys.size){
        const loaded={};
        const rowsBySeason=Object.fromEntries(seasonRows.map(row=>[String(row.season_number||row.season),row]));
        await Promise.all([...keys].map(async key=>{
          const sn=Number(key), row=rowsBySeason[key]||{};
          let episodes=[];
          if(Array.isArray(sourceSeasons[key]) && sourceSeasons[key].length) episodes=sourceSeasons[key];
          if(item.tmdb_id){
            try{
              const seasonData=await fetchNexoraDetails({action:'season',type:item.type,tmdb_id:item.tmdb_id,season_number:sn,season:sn});
              episodes=seasonData?.season?.episodes||seasonData?.episodes||seasonData?.details?.episodes||seasonData?.data?.episodes||episodes;
            }catch(error){ console.warn('Saison TMDB indisponible',sn,error); }
          }
          const count=Number(row.episode_count||row.episodes_count||episodes.length||0);
          loaded[key]=Array.isArray(episodes)&&episodes.length?episodes:Array.from({length:count},(_,i)=>episodeFallback(item,sn,i+1));
        }));
        item.seasons=loaded;
      }
    }
    const release=d.release_date||d.first_air_date||item.year?String(d.release_date||d.first_air_date||item.year):"";
    const runtime=d.runtime||((d.episode_run_time||[])[0]);
    const genres=(d.genres||[]).map(x=>x.name).slice(0,4).join(" · ")||item.genre||"";
    const meta=[release?new Date(release).getFullYear():item.year,runtime?`${runtime} min`:null,genres,d.vote_average?`${Number(d.vote_average).toFixed(1)}/10`:item.rating?`${item.rating}/10`:null].filter(Boolean).join(" · ");
    const backdropUrl=d.backdrop_path?`https://image.tmdb.org/t/p/original${d.backdrop_path}`:item.backdrop_url;
    const posterUrl=d.poster_path?`https://image.tmdb.org/t/p/w500${d.poster_path}`:item.poster_url;
    const detailSeasons=(item.type==='serie'||item.type==='anime')?renderEpisodes(item,1):'';
    $("content").innerHTML=`<section class="detail-page"><button class="detail-back" id="detailBack">← Retour</button><div class="detail-hero" style="--detail-bg:url('${escapeAttr(backdropUrl||posterUrl||"")}')"><div class="detail-hero-shade"></div><div class="detail-hero-content"><div class="detail-poster" style="${posterUrl?`background-image:url('${escapeAttr(posterUrl)}')`:''}"></div><div class="detail-copy"><div class="detail-kicker">${labelType(item.type)}</div><h1>${escapeHtml(d.title||d.name||item.title)}</h1><div class="detail-meta">${escapeHtml(meta)}</div><p>${escapeHtml(d.overview||item.description||"Aucune description disponible.")}</p><div class="detail-actions"><button class="btn btn-light" id="detailWatch">▶ Regarder</button><a class="btn btn-glass detail-trailer-btn" id="detailTrailer" href="${escapeAttr(getTrailerUrl(trailer,d.title||d.name||item.title))}" target="_blank" rel="noopener noreferrer">▣ Bande-annonce</a><button class="btn btn-glass" id="detailList">＋ Ma liste</button></div></div></div></div>${detailSeasons}${renderCast(cast)}${renderRelatedContent(item)}</section>`;
    $("detailBack").addEventListener("click",showHomeView);$("detailWatch").addEventListener("click",()=>openPlayer(item.id));$("detailList").addEventListener("click",()=>{toggleList(item.title);$("detailList").textContent=inList(item.title)?"✓ Dans ma liste":"＋ Ma liste"});
    document.querySelectorAll("[data-person]").forEach(btn=>btn.addEventListener("click",()=>openPerson(Number(btn.dataset.person))));
    bindEpisodeControls();
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

function openModal(id){selected=contents.find(x=>String(x.id)===String(id));if(!selected)return;
  $("modalTitle").textContent=selected.title;$("modalType").textContent=labelType(selected.type);$("modalMeta").textContent=[selected.year,selected.genre,selected.duration_minutes?`${selected.duration_minutes} min`:null,selected.rating?`${selected.rating}/10`:null].filter(Boolean).join(" · ");$("modalDesc").textContent=selected.description||"Aucune description disponible.";$("modalBackdrop").style=bgStyle(selected,"backdrop");$("modalPoster").style=bgStyle(selected);
  const related=contents.filter(x=>x.id!==selected.id&&x.type===selected.type).sort((a,b)=>Number(b.rating||0)-Number(a.rating||0)).slice(0,4);
  const seasons=getSeasons(selected);
  const episodes=seasons?renderEpisodes(selected,Number(Object.keys(seasons).sort((a,b)=>Number(a)-Number(b))[0])):"";
  $("modalRelated").innerHTML=(episodes?episodes:"")+(related.length?`<div class="related-title">VOUS POURRIEZ AUSSI AIMER</div><div class="related-grid">${related.map(x=>`<button class="related-card" data-related="${x.id}"><span style="${bgStyle(x)}"></span><b>${escapeHtml(x.title)}</b></button>`).join("")}</div>`:"");
  document.querySelectorAll("[data-related]").forEach(btn=>btn.addEventListener("click",()=>openModal(Number(btn.dataset.related))));
  const seasonSelect=$("seasonSelect"); if(seasonSelect) seasonSelect.addEventListener("change",()=>{$("modalRelated").querySelector(".series-episodes").outerHTML=renderEpisodes(selected,Number(seasonSelect.value));bindEpisodeControls()});
  bindEpisodeControls();updateModalButtons();$("modalWatch").textContent=seasons?"▶ Reprendre la série":"▶ Regarder";$("modal").classList.remove("hidden");$("modal").setAttribute("aria-hidden","false")
}
function bindEpisodeControls(){
  if(window.__nexoraEpisodeControlsBound)return;
  window.__nexoraEpisodeControlsBound=true;
  document.addEventListener("click",function(event){
    const seasonBtn=event.target.closest ? event.target.closest("button[data-season-tab]") : null;
    if(seasonBtn){
      event.preventDefault();
      event.stopPropagation();
      const root=seasonBtn.closest(".series-episodes");
      if(!root)return;
      const season=String(seasonBtn.getAttribute("data-season-tab")||"");
      root.querySelectorAll("button[data-season-tab]").forEach(btn=>{
        const active=String(btn.getAttribute("data-season-tab"))===season;
        btn.classList.toggle("active",active);
        btn.setAttribute("aria-selected",active?"true":"false");
      });
      root.querySelectorAll("[data-season-panel]").forEach(panel=>{
        const active=String(panel.getAttribute("data-season-panel"))===season;
        panel.classList.toggle("active",active);
        panel.hidden=!active;
      });
      return;
    }
    const relatedBtn=event.target.closest ? event.target.closest("button[data-related-detail]") : null;
    if(relatedBtn){
      event.preventDefault();
      event.stopPropagation();
      openDetail(relatedBtn.getAttribute('data-related-detail'));
      return;
    }
    const episodeBtn=event.target.closest ? event.target.closest("button[data-episode-play]") : null;
    if(episodeBtn){
      event.preventDefault();
      event.stopPropagation();
      openPlayer(episodeBtn.getAttribute("data-episode-play"),Number(episodeBtn.getAttribute("data-season")||1),Number(episodeBtn.getAttribute("data-episode")||1));
    }
  },true);
}

function getAvailableSeasonNumbers(item){
  const seasons=getSeasons(item);
  const fromObject=seasons&&typeof seasons==='object'&&!Array.isArray(seasons)?Object.keys(seasons):[];
  const count=Number(item?.number_of_seasons||item?.seasons_count||0);
  const values=[...fromObject,...(count?Array.from({length:Math.min(count,50)},(_,i)=>String(i+1)):[])].map(Number).filter(n=>Number.isFinite(n)&&n>0);
  return [...new Set(values)].sort((a,b)=>a-b);
}
function getPlayerEpisode(item,season,episode){
  const seasons=getSeasons(item)||{};
  const list=Array.isArray(seasons[String(season)])?seasons[String(season)]:Array.isArray(seasons[season])?seasons[season]:[];
  const found=list.find((ep,index)=>Number(ep?.episode_number||index+1)===Number(episode));
  return found?normalizeEpisode(found,Math.max(0,Number(episode)-1),item,season):episodeFallback(item,season,episode,`Épisode ${episode}`);
}
function updatePlayerEpisodeInfo(item,season,episode){
  const title=$("playerEpisodeInfoTitle"),desc=$("playerEpisodeInfoDescription");
  if(!title||!desc)return;
  const ep=getPlayerEpisode(item,season,episode);
  title.textContent=`Saison ${season} · Épisode ${episode}${ep.name?` — ${ep.name}`:''}`;
  desc.textContent=ep.overview||`Découvrez l’épisode ${episode} de la saison ${season}.`;
}
function populateEpisodeControls(item, initialSeason=1, initialEpisode=1){
  const controls=$("playerEpisodeControls");
  const seasonSelect=$("playerSeasonSelect");
  const episodeSelect=$("playerEpisodeSelect");
  const type=String(item.type||item.media_type||"").toLowerCase();
  const isSeries=["serie","series","tv","anime","show"].includes(type);
  if(!controls||!seasonSelect||!episodeSelect)return;
  if(!isSeries){controls.classList.add("hidden");$("playerEpisodeInfo")?.classList.add("hidden");return}
  controls.classList.remove("hidden");$("playerEpisodeInfo")?.classList.remove("hidden");
  const seasonNumbers=getAvailableSeasonNumbers(item);
  const seasons=seasonNumbers.length?seasonNumbers:[1];
  seasonSelect.innerHTML=seasons.map(n=>`<option value="${n}">Saison ${n}</option>`).join("");
  const currentSeason=seasons.includes(Number(initialSeason))?Number(initialSeason):seasons[0];
  const seasonMap=getSeasons(item)||{};
  const knownEpisodes=Array.isArray(seasonMap[String(currentSeason)])?seasonMap[String(currentSeason)]:Array.isArray(seasonMap[currentSeason])?seasonMap[currentSeason]:[];
  const episodeCount=Math.max(1,Math.min(100,knownEpisodes.length||Number(item.number_of_episodes||item.episode_count||12)));
  episodeSelect.innerHTML=Array.from({length:episodeCount},(_,i)=>`<option value="${i+1}">Épisode ${i+1}</option>`).join("");
  seasonSelect.value=String(currentSeason);episodeSelect.value=String(Math.min(Number(initialEpisode)||1,episodeCount));
  const update=()=>{
    const season=Number(seasonSelect.value),episode=Number(episodeSelect.value);
    updatePlayerEpisodeInfo(item,season,episode);
    renderPlayerSources(item,season,episode);
  };
  seasonSelect.onchange=()=>{
    const season=Number(seasonSelect.value),map=getSeasons(item)||{};
    const list=Array.isArray(map[String(season)])?map[String(season)]:Array.isArray(map[season])?map[season]:[];
    const count=Math.max(1,Math.min(100,list.length||Number(item.number_of_episodes||item.episode_count||12)));
    episodeSelect.innerHTML=Array.from({length:count},(_,i)=>`<option value="${i+1}">Épisode ${i+1}</option>`).join("");
    episodeSelect.value="1";update();
  };
  episodeSelect.onchange=update;
  updatePlayerEpisodeInfo(item,Number(seasonSelect.value),Number(episodeSelect.value));
}
function getPlayerSources(item, season=1, episode=1){
  const sources=[];
  const seasons=getSeasons(item)||{};
  const list=Array.isArray(seasons[String(season)])?seasons[String(season)]:Array.isArray(seasons[season])?seasons[season]:[];
  const ep=list.find((x,index)=>Number(x?.episode_number||index+1)===Number(episode));
  const urls=[ep?.video_url,ep?.url,ep?.stream_url,ep?.file, item?.video_url];
  urls.filter(Boolean).forEach((url,index)=>sources.push({id:index===0?'direct':`source-${index+1}`,name:index===0?'Source directe':`Source ${index+1}`,type:'video',url:String(url)}));
  if(Array.isArray(item?.sources)) item.sources.forEach((source,index)=>{
    if(!source?.url || String(source.type||'video').toLowerCase()==='iframe') return;
    sources.push({id:String(source.id||`source-${index+1}`),name:source.name||`Source ${index+1}`,type:'video',url:String(source.url)});
  });
  return sources.filter((source,index,array)=>array.findIndex(x=>x.url===source.url)===index);
}
function setNativeVideoSource(url){
  const video=$("playerVideo"),empty=$("playerEmpty");
  if(!video)return;
  if(window.__nexoraHls){window.__nexoraHls.destroy();window.__nexoraHls=null;}
  video.pause(); video.removeAttribute('src'); video.load();
  if(!url){video.classList.add('hidden'); empty.classList.remove('hidden'); return;}
  empty.classList.add('hidden'); video.classList.remove('hidden');
  if(window.Hls && Hls.isSupported() && /\.m3u8($|[?#])/i.test(url)){
    const hls=new Hls(); hls.loadSource(url); hls.attachMedia(video); window.__nexoraHls=hls;
  }else{ video.src=url; }
  video.play().catch(()=>{});
}
function renderPlayerSources(item,season=1,episode=1){
  const bar=$("playerSourceBar"); if(!bar)return;
  const sources=getPlayerSources(item,season,episode);
  bar.innerHTML=sources.length?sources.map((source,index)=>`<button type="button" class="player-source ${index===0?'active':''}" data-player-source="${escapeAttr(source.id)}">${escapeHtml(source.name)}</button>`).join(''):'<span class="player-source-empty">Aucune vidéo disponible</span>';
  bar.querySelectorAll('[data-player-source]').forEach(button=>button.addEventListener('click',()=>{
    const source=sources.find(x=>x.id===button.dataset.playerSource); if(!source)return;
    bar.querySelectorAll('[data-player-source]').forEach(x=>x.classList.toggle('active',x===button));
    setNativeVideoSource(source.url);
  }));
  setNativeVideoSource(sources[0]?.url||'');
}

function openPlayer(id, initialSeason=1, initialEpisode=1){
  const item = contents.find(x => String(x.id) === String(id));
  if(!item) return;
  markWatched(item);

  const tmdbId = item.tmdb_id || item.id;
  const mediaType = (item.type === 'film' || item.type === 'movie') ? 'movie' : 'tv';
  const sources = getPlayerSources(item, initialSeason, initialEpisode);
  const directVideoUrl = sources[0]?.url || item.video_url || '';

  const params = new URLSearchParams({
    id: tmdbId,
    type: mediaType,
    season: initialSeason,
    episode: initialEpisode
  });
  if(directVideoUrl) params.set('video_url', directVideoUrl);

  window.location.href = `player-test.html?${params.toString()}`;
}
function closePlayer(){const video=$("playerVideo");if(window.__nexoraHls){window.__nexoraHls.destroy();window.__nexoraHls=null;}video.pause();video.removeAttribute('src');video.load();document.body.classList.remove('player-open');$("playerModal").classList.add('hidden');$("playerModal").setAttribute('aria-hidden','true');}

function setAuthMessage(text="",type=""){$("authMessage").textContent=text;$("authMessage").className=`auth-message ${type}`}
function updateAuthUI(){const logged=!!currentUser;$("authGuest")?.classList.toggle("hidden",logged);$("authUser")?.classList.toggle("hidden",!logged);if(logged){const name=currentUser.user_metadata?.full_name||currentUser.email?.split("@")[0]||"Compte NEXORA";$("accountName").textContent=name;$("accountEmail").textContent=currentUser.email||"";$("accountAvatar").textContent=name.trim().charAt(0).toUpperCase();$("accountButton").textContent=name.trim().charAt(0).toUpperCase()}else{if($("accountButton"))$("accountButton").textContent="S"}$("authTitle").textContent=authMode==="signup"?"Créer un compte":"Connexion";$("authSubtitle").textContent=authMode==="signup"?"Créez votre compte NEXORA pour commencer.":"Retrouvez votre expérience NEXORA sur tous vos appareils."}
function setAuthMode(mode){authMode=mode;$("signupNameWrap")?.classList.toggle("hidden",mode!=="signup");if($("authPassword"))$("authPassword").autocomplete=mode==="signup"?"new-password":"current-password";$("authSubmit").textContent=mode==="signup"?"Créer mon compte":"Se connecter";$("authSwitch").textContent=mode==="signup"?"J'ai déjà un compte":"Créer un compte";setAuthMessage("");updateAuthUI()}
function openAuth(){updateAuthUI();$("authModal")?.classList.remove("hidden");$("authModal")?.setAttribute("aria-hidden","false");setTimeout(()=>{if(!currentUser)$("authEmail")?.focus()},50)}
function closeAuth(){$("authModal")?.classList.add("hidden");$("authModal")?.setAttribute("aria-hidden","true");setAuthMessage("")}
async function submitAuth(){const email=$("authEmail").value.trim(),password=$("authPassword").value,name=$("authName").value.trim();if(!email||!password){setAuthMessage("Renseigne ton e-mail et ton mot de passe.","error");return}if(password.length<6){setAuthMessage("Le mot de passe doit contenir au moins 6 caractères.","error");return}$("authSubmit").disabled=true;setAuthMessage(authMode==="signup"?"Création du compte…":"Connexion…");try{if(authMode==="signup"){const {data,error}=await db.auth.signUp({email,password,options:{data:{full_name:name||undefined},emailRedirectTo:window.location.origin}});if(error)throw error;if(data.session){currentUser=data.user;setAuthMessage("Compte créé. Bienvenue sur NEXORA !","ok");updateAuthUI()}else setAuthMessage("Compte créé. Vérifie ton e-mail pour confirmer ton adresse.","ok")}else{const {data,error}=await db.auth.signInWithPassword({email,password});if(error)throw error;currentUser=data.user;updateAuthUI();setTimeout(closeAuth,450)}}catch(error){console.error(error);setAuthMessage(error.message||"Une erreur est survenue.","error")}finally{$("authSubmit").disabled=false}}

$("closeModal")?.addEventListener("click",closeModal);
$("closePlayer")?.addEventListener("click",closePlayer);
$("playerFullscreen")?.addEventListener("click",()=>{const shell=$("playerModal")?.querySelector(".player-shell");if(!shell)return;if(document.fullscreenElement){document.exitFullscreen?.().catch?.(()=>{});}else{shell.requestFullscreen?.().catch?.(()=>{});}});
$("playerModal")?.addEventListener("click",e=>{if(e.target===$("playerModal"))closePlayer()});
$("modal")?.addEventListener("click",e=>{if(e.target===$("modal"))closeModal()});
$("modalList")?.addEventListener("click",()=>selected&&toggleList(selected.title));
$("modalWatch")?.addEventListener("click",()=>selected&&openPlayer(selected.id));
$("accountButton")?.addEventListener("click",openAuth);
$("closeAuth")?.addEventListener("click",closeAuth);
$("authModal")?.addEventListener("click",e=>{if(e.target===$("authModal"))closeAuth()});
$("authSwitch")?.addEventListener("click",()=>setAuthMode(authMode==="signup"?"login":"signup"));
$("authSubmit")?.addEventListener("click",submitAuth);
$("signOut")?.addEventListener("click",async()=>{const {error}=await db.auth.signOut();if(error){setAuthMessage(error.message,"error");return}currentUser=null;setAuthMode("login")});

document.querySelectorAll(".nav").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));btn.classList.add("active");currentFilter=btn.dataset.filter;render();window.scrollTo({top:document.querySelector("main").offsetTop-65,behavior:"smooth"})}));
function goToHomeFromBrand(e){
  if(e){e.preventDefault();e.stopPropagation();}
  currentFilter="all";
  document.querySelectorAll(".nav").forEach(x=>x.classList.toggle("active",x.dataset.filter==="all"));
  document.querySelector("#modal")?.classList.add("hidden");
  document.querySelector("#authModal")?.classList.add("hidden");
  document.querySelector("#playerModal")?.classList.add("hidden");
  document.body.classList.remove("player-open");
  showHomeView();
}
brandHome?.addEventListener("click",goToHomeFromBrand,true);
document.addEventListener("click",e=>{
  const brand=e.target.closest?.("#brandHome");
  if(brand && brand!==brandHome) goToHomeFromBrand(e);
},true);
$("searchToggle")?.addEventListener("click",()=>{
  const wrap=$("searchWrap");
  const isOpen=wrap.classList.toggle("open");
  $("searchToggle").setAttribute("aria-expanded",isOpen?"true":"false");
  if(isOpen)$("search")?.focus();
});

// ==========================================
// RECHERCHE INSTANTANÉE DIRECTE & FIABLE
// ==========================================

let searchDebounceTimer;

async function renderSearchResults(query) {
  const box = $("searchResults");
  if (!box) return;

  const q = String(query || "").trim().toLowerCase();

  if (!q || q.length < 2) {
    box.innerHTML = "";
    box.style.display = "none";
    return;
  }

const fullLocalPool = contents.map(normalizeContent);
  const localMatches = fullLocalPool.filter(item => {
    const title = String(item.title || "").toLowerCase();
    const orig = String(item.original_title || item.original_name || "").toLowerCase();
    return title.includes(q) || orig.includes(q);
  });

  displaySearchDropdown(localMatches, box);

  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(async () => {
    try {
      const { data, error } = await db.from("contents")
        .select("*")
        .eq("is_available",true)
        .ilike("title", `%${q}%`)
        .limit(8);

      if (!error && Array.isArray(data) && data.length) {
        const distant = data.map(normalizeContent).filter(isAllowedContent);
        const map = new Map();
        [...localMatches, ...distant].forEach(item => {
          const key = String(item.tmdb_id || item.id);
          if (!map.has(key)) map.set(key, item);
        });
        displaySearchDropdown([...map.values()], box);
      }
    } catch (e) {
      console.warn("Recherche Supabase distante :", e);
    }
  }, 150);
}

function displaySearchDropdown(results, box) {
  if (!box) return;

  if (!results || !results.length) {
    box.innerHTML = `<div style="padding: 18px; color: #71717a; font-size: 13px; text-align: center;">Aucun résultat pour cette recherche.</div>`;
    box.style.display = "block";
    return;
  }

  const uniqueItems = [];
  const seen = new Set();
  for (const item of results) {
    const key = String(item.tmdb_id || item.id);
    if (!seen.has(key)) {
      seen.add(key);
      uniqueItems.push(item);
    }
  }

  const items = uniqueItems.slice(0, 6);

  box.innerHTML = items.map(item => {
    const poster = imageUrl(item, "poster");
    const year = item.year || "—";
    const typeLabel = labelType(item.type);
    const posterSource = poster ? escapeAttr(poster) : "https://via.placeholder.com/92x138/181920/84cc16?text=NEXORA";

    return `
      <div class="search-item" data-search-id="${escapeAttr(item.id)}" role="option" tabindex="0" style="display: flex; align-items: center; gap: 12px; width: 100%; padding: 8px 10px; border-radius: 10px; cursor: pointer; transition: background 0.15s ease; box-sizing: border-box;">
        <img src="${posterSource}" alt="" loading="lazy" decoding="async" style="width: 42px; height: 58px; border-radius: 7px; object-fit: cover; background: #202028; flex-shrink: 0;" onerror="this.onerror=null;this.src='https://via.placeholder.com/92x138/181920/84cc16?text=NEXORA';">
        <div style="flex: 1; min-width: 0; overflow: hidden;">
          <div style="color: #ffffff; font-size: 13.5px; font-weight: 700; line-height: 1.3; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${escapeHtml(item.title || "Sans titre")}
          </div>
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; color: #9ca3af; font-size: 11.5px; line-height: 1;">
            <span>${escapeHtml(year)}</span>
            <span style="display: inline-flex; align-items: center; background: #84cc16; color: #07080b; padding: 3px 7px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; line-height: 1;">
              ${escapeHtml(typeLabel)}
            </span>
          </div>
        </div>
        <span style="color: #6b7280; font-size: 20px; font-weight: 300; line-height: 1; flex-shrink: 0;">›</span>
      </div>
    `;
  }).join("");

  box.style.display = "block";

  box.querySelectorAll(".search-item").forEach(element => {
    element.addEventListener("mouseenter", () => {
      element.style.background = "rgba(132, 204, 22, 0.12)";
    });
    element.addEventListener("mouseleave", () => {
      element.style.background = "transparent";
    });

    const openResult = () => {
      const id = element.getAttribute("data-search-id");
      if (!id) return;
      box.style.display = "none";
      if($("search")) $("search").value = "";
      openDetail(id);
    };

    element.addEventListener("click", openResult);
    element.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openResult();
      }
    });
  });
}

$("search")?.addEventListener("input", event => {
  renderSearchResults(event.target.value);
});

$("search")?.addEventListener("keydown", event => {
  const box = $("searchResults");
  if (event.key === "Enter") {
    const firstResult = box?.querySelector("[data-search-id]");
    if (firstResult) {
      event.preventDefault();
      firstResult.click();
    }
  }
  if (event.key === "Escape") {
    event.preventDefault();
    if($("search")) $("search").value = "";
    if (box) {
      box.innerHTML = "";
      box.style.display = "none";
    }
    $("search")?.blur();
  }
});

document.addEventListener("click", event => {
  if (!event.target.closest?.("#searchArea")) {
    const box = $("searchResults");
    if (box) {
      box.style.display = "none";
    }
  }
});

window.addEventListener("scroll",()=>$("topbar")?.classList.toggle("scrolled",window.scrollY>30));
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeModal();closeAuth();closePlayer()}});

db.auth.getSession().then(({data})=>{currentUser=data.session?.user||null;updateAuthUI()});
db.auth.onAuthStateChange((_event,session)=>{currentUser=session?.user||null;updateAuthUI()});

async function syncCatalogIfNeeded(){
  // La synchronisation du catalogue est désormais pilotée côté Supabase,
  // une fois tous les 3 jours, indépendamment des visiteurs.
  return null;
}

async function fetchContentsPage(from=0,to=999){
  const {data,error}=await db
    .from("contents")
    .select("*")
    .eq("is_available",true)
    .order("created_at",{ascending:false})
    .range(from,to);

  if(error) throw error;
  return data||[];
}

async function fetchAllContents(){
  const pageSize=1000;
  const firstPage=await fetchContentsPage(0,pageSize-1);
  const all=[...firstPage];

  if(firstPage.length<pageSize) return all;

  for(let from=pageSize;;from+=pageSize){
    const batch=await fetchContentsPage(from,from+pageSize-1);
    all.push(...batch);
    if(batch.length<pageSize) break;
  }

  return all;
}

async function loadContents(){
  if ($("status")) {
    $("status").innerHTML='<span class="status-dot"></span> Chargement du catalogue…';
  }
   let dbContents=[];

  try{
    // Charger uniquement la première page pour afficher rapidement le catalogue
    dbContents=await fetchContentsPage(0,999);
  }catch(error){
    console.warn("Catalogue Supabase indisponible :",error);
  }

  contents=dbContents.map(normalizeContent).filter(isAllowedContent);

  if ($("status")) {
    $("status").innerHTML=`<span class="status-dot"></span> Catalogue disponible · ${contents.length} contenu(s)`;
    $("status").className="status ok";
  }

  const hero=contents.find(x=>x.is_featured)||contents[0];
  if(hero) setHero(hero);

  render();

  // Charger le reste du catalogue en arrière-plan
  fetchAllContents().then(allContents=>{
    if(allContents.length>contents.length){
      contents=allContents.map(normalizeContent).filter(isAllowedContent);

      const updatedHero=contents.find(x=>x.is_featured)||contents[0];
      if(updatedHero) setHero(updatedHero);

      render();

      if ($("status")) {
        $("status").innerHTML=`<span class="status-dot"></span> Catalogue disponible · ${contents.length} contenu(s)`;
      }
    }
  }).catch(error=>{
    console.warn("Chargement du reste du catalogue impossible :",error);
  });

  syncCatalogIfNeeded().then(result=>{
    if(result){
      console.log("Synchronisation du catalogue terminée.");
    }
  }).catch(error=>{
    console.warn("Synchronisation du catalogue impossible :",error);
  });
}

bindEpisodeControls();

// ==========================================
// MODULE PUBLICITAIRE NEXORA (3 ÉTAPES)
// ==========================================
(() => {
  const AD_URLS = [
    'https://omg10.com/4/11814982',
    'https://omg10.com/4/11814987',
    'https://omg10.com/4/11814988'
  ];

  let currentStep = 0;
  let pendingCallback = null;

  function injectModalIfNeeded() {
    if (!document.getElementById('adGateModal')) {
      const modalHTML = `
      <div id="adGateModal" class="ad-gate-overlay hidden" aria-hidden="true">
        <div class="ad-gate-box">
          <button class="ad-gate-close" id="adGateClose" type="button">✕</button>
          <div class="ad-gate-icon" id="adGateIcon">📢</div>
          <h3 class="ad-gate-title" id="adGateTitle">Accès au visionnage (1/3)</h3>
          <p class="ad-gate-desc" id="adGateDesc">NEXORA est entièrement gratuit. Pour maintenir l'infrastructure et la qualité des flux, merci de soutenir la plateforme via ces courts liens partenaires.</p>
          <div class="ad-gate-bars" id="adGateBars">
            <span class="bar active"></span><span class="bar"></span><span class="bar"></span>
          </div>
          <div class="ad-gate-warning">
            <span class="warn-icon">⚠️</span>
            <p>Ne téléchargez rien sur la page publicitaire. Fermez simplement l'onglet dès son apparition et revenez ici.</p>
          </div>
          <button id="adGateActionBtn" class="ad-gate-btn ad-btn-gold">📢 Ouvrir le lien 1/3</button>
          <div class="ad-gate-footer">3 liens partenaires par session — Aucune coupure pendant la lecture.</div>
        </div>
      </div>
      <style>
        .ad-gate-overlay { position: fixed !important; inset: 0 !important; z-index: 9999999 !important; background: rgba(0,0,0,0.88) !important; backdrop-filter: blur(16px) !important; display: flex !important; align-items: center !important; justify-content: center !important; padding: 18px !important; }
        .ad-gate-overlay.hidden { display: none !important; }
        .ad-gate-box { position: relative !important; width: min(480px, 94vw) !important; background: #111216 !important; border: 1.5px solid rgba(197, 255, 61, 0.3) !important; border-radius: 24px !important; padding: 34px 26px !important; text-align: center !important; box-shadow: 0 30px 90px rgba(0,0,0,0.95) !important; color: #f7f8fa !important; font-family: inherit !important; }
        .ad-gate-close { position: absolute !important; top: 18px !important; right: 18px !important; background: transparent !important; border: 0 !important; color: #71717a !important; font-size: 16px !important; cursor: pointer !important; }
        .ad-gate-icon { width: 58px !important; height: 58px !important; margin: 0 auto 16px !important; background: rgba(197, 255, 61, 0.1) !important; border: 1px solid rgba(197, 255, 61, 0.25) !important; border-radius: 18px !important; display: flex !important; align-items: center !important; justify-content: center !important; font-size: 24px !important; }
        .ad-gate-title { font-size: 22px !important; font-weight: 850 !important; margin: 0 0 14px !important; }
        .ad-gate-desc { font-size: 13.5px !important; line-height: 1.65 !important; color: #a1a1aa !important; margin: 0 0 20px !important; }
        .ad-gate-bars { display: flex !important; gap: 8px !important; justify-content: center !important; margin-bottom: 22px !important; }
        .ad-gate-bars .bar { width: 54px !important; height: 4px !important; border-radius: 99px !important; background: rgba(255,255,255,0.14) !important; }
        .ad-gate-bars .bar.active { background: #c5ff3d !important; box-shadow: 0 0 10px rgba(197, 255, 61, 0.5) !important; }
        .ad-gate-warning { display: flex !important; align-items: flex-start !important; gap: 12px !important; background: rgba(239,68,68,0.08) !important; border: 1px solid rgba(239,68,68,0.22) !important; border-radius: 12px !important; padding: 12px 14px !important; text-align: left !important; margin-bottom: 22px !important; }
        .ad-gate-warning p { margin: 0 !important; font-size: 12px !important; color: #fca5a5 !important; line-height: 1.5 !important; }
        .ad-gate-btn { width: 100% !important; padding: 14px 20px !important; border-radius: 14px !important; font-size: 15px !important; font-weight: 800 !important; cursor: pointer !important; border: 0 !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important; }
        .ad-btn-gold { background: #d4a359 !important; color: #121212 !important; }
        .ad-btn-green { background: #c5ff3d !important; color: #07080b !important; box-shadow: 0 0 20px rgba(197, 255, 61, 0.4) !important; }
        .ad-gate-footer { margin-top: 18px !important; font-size: 11.5px !important; color: #71717a !important; }
      </style>`;
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
  }

  function updateUI() {
    const icon = document.getElementById('adGateIcon');
    const title = document.getElementById('adGateTitle');
    const desc = document.getElementById('adGateDesc');
    const btn = document.getElementById('adGateActionBtn');
    const bars = document.querySelectorAll('#adGateBars .bar');
    if (!icon || !title || !btn) return;

    bars.forEach((b, i) => b.classList.toggle('active', i <= currentStep - 1));

    if (currentStep >= 1 && currentStep <= 3) {
      icon.innerHTML = '📢';
      btn.className = 'ad-gate-btn ad-btn-gold';
      title.innerText = `Pub ${currentStep} sur 3`;
      desc.innerText = "NEXORA est entièrement gratuit. Pour maintenir la qualité des flux, merci de soutenir la plateforme via ces courts liens partenaires.";
      btn.innerText = `📢 Regarder la pub ${currentStep}/3`;
    } else if (currentStep === 4) {
      bars.forEach(b => b.classList.add('active'));
      icon.innerHTML = '▶';
      btn.className = 'ad-gate-btn ad-btn-green';
      title.innerText = 'Prêt pour la séance ?';
      desc.innerText = 'Toutes les étapes sont validées. Vous pouvez dès maintenant lancer votre lecture sans coupure.';
      btn.innerText = '▶ Lancer la lecture';
    }
  }

  window.runAdGate = function(callback) {
    injectModalIfNeeded();
    pendingCallback = callback;
    currentStep = 1;
    updateUI();
    document.getElementById('adGateModal').classList.remove('hidden');
  };

  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'adGateActionBtn') {
      if (currentStep >= 1 && currentStep <= 3) {
        window.open(AD_URLS[currentStep - 1], '_blank');
        currentStep++;
        updateUI();
      } else if (currentStep === 4) {
        document.getElementById('adGateModal').classList.add('hidden');
        if (typeof pendingCallback === 'function') pendingCallback();
        currentStep = 0;
      }
    }
    if (e.target && e.target.id === 'adGateClose') {
      document.getElementById('adGateModal').classList.add('hidden');
      currentStep = 0;
    }
  });

  // Déclenchement automatique sur la page de test (player-test.html)
  window.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('player')) {
      const vid = document.getElementById('playerVideo');
      if (vid) vid.pause();

      setTimeout(() => {
        window.runAdGate(() => {
          const v = document.getElementById('playerVideo');
          if (v) {
            v.muted = false;
            v.play().catch(() => {});
          }
        });
      }, 400);

      const epSelect = document.getElementById('playerEpisodeSelect');
      if (epSelect) {
        epSelect.addEventListener('change', () => {
          const v = document.getElementById('playerVideo');
          if (v) v.pause();
          window.runAdGate(() => {
            if (v) {
              v.muted = false;
              v.play().catch(() => {});
            }
          });
        });
      }
    }
  });
})();

document.addEventListener("keydown",event=>{if(event.key==="Escape" && $('playerModal') && !$('playerModal').classList.contains("hidden")){closePlayer();}});
if(typeof loadContents === 'function') loadContents();
