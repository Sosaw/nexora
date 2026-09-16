const SUPABASE_URL = "https://fwmwrjcsgtxcniluafva.supabase.co";
const SUPABASE_KEY = "sb_publishable_WChsmyEMVESddpu1qw-9jg_Tzv9kYLI";
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const brandHome = document.getElementById("brandHome");
const $ = id => document.getElementById(id);
let contents=[], currentFilter="all", selected=null, currentUser=null, authMode="login";

// Catalogue de démonstration
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

const extraCatalog = [
  {id:9101,title:"Stranger Things",type:"serie",year:2016,genre:"Fantastique · Thriller",rating:8.6,poster_url:"https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg",backdrop_url:"https://image.tmdb.org/t/p/w1280/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",description:"À Hawkins, un groupe d'adolescents se retrouve au cœur d'un mystère surnaturel qui dépasse tout ce qu'ils imaginaient.",is_featured:true},
  {id:9102,title:"Breaking Bad",type:"serie",year:2008,genre:"Drame · Crime",rating:9.5,poster_url:"https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",backdrop_url:"https://image.tmdb.org/t/p/w1280/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",description:"Un professeur de chimie se lance dans une entreprise clandestine qui va bouleverser sa vie et celle de ses proches.",is_featured:true},
  {id:9103,title:"Game of Thrones",type:"serie",year:2011,genre:"Drame · Fantasy",rating:9.2,poster_url:"https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",backdrop_url:"https://image.tmdb.org/t/p/w1280/suopoADq0k8YZr4dQXcX1R1h2jD.jpg",description:"Dans un monde où les familles nobles se disputent le Trône de Fer, alliances et trahisons décident du destin des royaumes.",is_new:true},
  {id:9104,title:"The Last of Us",type:"serie",year:2023,genre:"Drame · Post-apocalyptique",rating:8.7,poster_url:"https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",backdrop_url:"https://image.tmdb.org/t/p/w1280/9n2tJBplPbgR2ca05hS5CK9wE9Q.jpg",description:"Vingt ans après l'effondrement de la civilisation, Joel doit escorter Ellie à travers une Amérique dévastée.",is_new:true},
  {id:9105,title:"Mercredi",type:"serie",year:2022,genre:"Comédie · Fantastique",rating:8.1,poster_url:"https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",backdrop_url:"https://image.tmdb.org/t/p/w1280/iHSwvRVsRyxpX7FE7GbviaDvgGZ.jpg",description:"Mercredi Addams enquête sur une série de mystères inquiétants au sein de son étrange académie.",is_featured:true},
  {id:9106,title:"La Casa de Papel",type:"serie",year:2017,genre:"Crime · Thriller",rating:8.2,poster_url:"https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg",backdrop_url:"https://image.tmdb.org/t/p/w1280/AbR2eYb8J9H3QY1fJkJ6f7w4xkB.jpg",description:"Un mystérieux stratège réunit une équipe de braqueurs pour réaliser un plan hors norme.",is_featured:true},
  {id:9201,title:"John Wick : Chapitre 4",type:"film",year:2023,genre:"Action · Thriller",rating:8.0,duration_minutes:169,poster_url:"https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",description:"John Wick découvre une voie pour vaincre la Grande Table, mais doit affronter de nouveaux ennemis."},
  {id:9202,title:"Scream",type:"film",year:2022,genre:"Horreur · Thriller",rating:6.7,duration_minutes:114,poster_url:"https://image.tmdb.org/t/p/w500/4qIV5WXP1xQvpPAHmgVxCmxvPh6.jpg",description:"Un nouveau tueur Ghostface replonge Woodsboro dans la terreur."},
  {id:9203,title:"65 : La Terre d'avant",type:"film",year:2023,genre:"Science-fiction · Aventure",rating:6.3,duration_minutes:93,poster_url:"https://image.tmdb.org/t/p/w500/rzRb63TldOKdKydCvWJM8B6EkPM.jpg",description:"Deux survivants d'un vaisseau écrasé sur Terre affrontent un monde préhistorique hostile."},
  {id:9204,title:"Supercell",type:"film",year:2023,genre:"Action · Drame",rating:6.4,duration_minutes:100,poster_url:"https://image.tmdb.org/t/p/w500/gbGHezV6yrhua0KfAgwrknSOiIY.jpg",description:"Un chasseur de tempêtes se retrouve au cœur de la supercellule la plus dangereuse jamais observée."},
  {id:9205,title:"Kill Boksoon",type:"film",year:2023,genre:"Action · Thriller",rating:6.8,duration_minutes:137,poster_url:"https://image.tmdb.org/t/p/w500/taYgn3RRpCGlTGdaGQvnSIOzXFy.jpg",description:"Tueuse réputée au travail, mère célibataire à la maison : les deux mondes de Boksoon entrent en collision."},
  {id:9301,title:"The Mandalorian",type:"serie",year:2019,genre:"Science-fiction · Aventure",rating:8.5,poster_url:"https://image.tmdb.org/t/p/w500/eU1i6eHXlzMOlEq0ku1Rzq7Y4wA.jpg",description:"Un chasseur de primes solitaire parcourt les confins de la galaxie après la chute de l'Empire."},
  {id:9302,title:"Invincible",type:"serie",year:2021,genre:"Animation · Action",rating:8.7,poster_url:"https://image.tmdb.org/t/p/w500/lxVS24ZhG3WQf3IMbkFIg6olT6A.jpg",description:"Mark Grayson découvre ses pouvoirs et apprend que devenir un héros est bien plus compliqué qu'il ne l'imaginait."},
  {id:9303,title:"Heartstopper",type:"serie",year:2022,genre:"Drame · Romance",rating:8.7,poster_url:"https://image.tmdb.org/t/p/w500/p0AtD0ivSlHq2MHY6JFgyhNqAQY.jpg",description:"Charlie et Nick découvrent qu'une amitié inattendue pourrait devenir quelque chose de plus."},
  {id:9304,title:"Avatar : Le dernier maître de l'air",type:"serie",year:2005,genre:"Animation · Aventure",rating:8.7,poster_url:"https://image.tmdb.org/t/p/w500/cHFZA8Tlv03nKTGXhLOYOLtqoSm.jpg",description:"Dans un monde déchiré par la guerre, Aang doit maîtriser les éléments et ramener la paix."},
  {id:9401,title:"Demon Slayer : Kimetsu no Yaiba",type:"anime",year:2019,genre:"Action · Fantastique",rating:8.7,poster_url:"https://image.tmdb.org/t/p/w500/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg",backdrop_url:"https://image.tmdb.org/t/p/w1280/nTvM4mhqNlHIvUkI1gVnW6XP7GG.jpg",description:"Tanjiro rejoint les pourfendeurs de démons pour sauver sa sœur devenue démon."},
  {id:9402,title:"My Hero Academia",type:"anime",year:2016,genre:"Action · Animation",rating:8.7,poster_url:"https://image.tmdb.org/t/p/w500/ivOLM47yJt90P19RH1NvJrAJz9F.jpg",backdrop_url:"https://image.tmdb.org/t/p/w1280/jsXKG9uppnPrhqFNhImllyCfLhl.jpg",description:"Izuku rêve de devenir un héros dans un monde où la plupart des humains possèdent un super-pouvoir."},
  {id:9403,title:"Fullmetal Alchemist: Brotherhood",type:"anime",year:2009,genre:"Action · Fantastique",rating:8.7,poster_url:"https://image.tmdb.org/t/p/w500/8H4ej2NpujYVBPsW2smmzC8d2xU.jpg",description:"Edward et Alphonse Elric cherchent la pierre philosophale pour restaurer ce qu'ils ont perdu."},
  {id:9404,title:"One Piece",type:"anime",year:1999,genre:"Aventure · Action",rating:8.7,poster_url:"https://image.tmdb.org/t/p/w500/fcXdJlbSdUEeMSJFsXKsznGwwok.jpg",description:"Luffy et son équipage parcourent les mers à la recherche du légendaire One Piece."},
];

const demoSeasons={9101:{1:["La disparition de Will Byers","La barjot de Maple Street","Holly, Jolly","Le corps","La puce et l'acrobate"],2:["MADMAX","Des bonbons et un monstre","Le têtard","Will le Sage","Dig Dug"],3:["Suzie, tu es là ?","Le centre commercial","L'affaire de la sauveteuse","Le sauna","L'été de la mort"]},9102:{1:["Le commencement","Le chat dans le sac","...Et le sac dans la rivière","Cancer Man","Gris Matter"],2:["Sept trente-sept","Grillé","Mas","4 jours dehors","Phoenix"],3:["No Más","Caballo Sin Nombre","I.F.T.","Green Light","Mas"]},9103:{1:["L'hiver vient","La Route Royale","Lord Snow","Infirmes, Bâtards et Choses Brisées","Le Loup et le Lion"],2:["Le Nord se souvient","Les terres de la nuit","Ce qui est mort ne saurait mourir","Les jardins d'os","Le fantôme d'Harrenhal"]},9104:{1:["Quand nous sommes dans le besoin","Infection","Long, Long Time","S'il vous plaît, tenez ma main","Endurer et survivre"],2:["Après le temps","Traversée","Qui sommes-nous ?","Les morts-vivants","Lumière"]},9105:{1:["Wednesday's Child Is Full of Woe","Woe Is the Loneliest Number","Friend or Woe","Woe What a Night","You Reap What You Woe"],2:["Here We Woe Again","The Devil You Woe","If These Woes Could Talk","Woe Me the Money","This Means Woe"]},9106:{1:["Efectuar lo acordado","Imprudencias letales","Errar al disparar","Caballo de Troya","El día de la marmota"]}};
function isSeries(item){return ['serie','series','tv','anime'].includes(String(item?.type||'').toLowerCase());}
function getSeasons(item){
  const raw=item?.seasons||demoSeasons[item?.id]||null;
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
  const animated=/(animation|anime|animé|anime)/i.test(genres);
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
  const posterMarkup=poster?`<img class="poster-img" src="${escapeAttr(poster)}" alt="Affiche de ${escapeAttr(item.title)}" loading="lazy" decoding="async">`:'';
  return `<article class="card" data-id="${escapeAttr(item.id)}"><div class="poster">${posterMarkup}</div><div class="shade"></div><div class="card-info"><div class="card-type">${labelType(item.type)}</div><div class="card-title">${escapeHtml(item.title)}</div><div class="card-meta">${escapeHtml(meta)}</div></div><div class="card-actions"><button class="card-play" data-play="${escapeAttr(item.id)}" aria-label="Lire ${escapeAttr(item.title)}">▶</button></div></article>`;
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
    if(tab==="ranking") return [...items].sort((a,b)=>Number(b.rating||0)-Number(a.rating||0));
    if(terms[tab]) return items.filter(x=>terms[tab].some(t=>String(x.genre||"").toLowerCase().includes(t)));
    return items;
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
    const card=e.target.closest(".card");
    if(card){const id=resolveContentId(card.dataset.id);if(id!==null)openDetail(id);}
  });
}
function render(){activeView="home";$("hero").classList.remove("hidden");$("status").classList.remove("hidden");const items=filtered();if(!items.length){$("content").innerHTML=`<div class="empty"><span>✦</span><h3>Votre sélection est encore vide</h3><p>De nouveaux programmes arriveront bientôt sur NEXORA.</p></div>`;return}const heroPool={all:contents,film:contents.filter(x=>x.type==="film"),serie:contents.filter(x=>x.type==="serie"),anime:contents.filter(x=>x.type==="anime"),new:recentFilms(),trend:contents.filter(x=>x.is_featured||Number(x.rating||0)>=8),mylist:contents.filter(x=>getList().includes(x.title))}[currentFilter]||contents; const heroItem=heroPool.find(x=>x.is_featured)||heroPool[0]||contents[0]; if(heroItem)setHero(heroItem); if(currentFilter==="all"){const featured=contents.filter(x=>x.is_featured),films=contents.filter(x=>x.type==="film"),series=contents.filter(x=>x.type==="serie"),anime=contents.filter(x=>x.type==="anime"),critics=contents.filter(x=>Number(x.rating||0)>=8.5),news=recentFilms(),resume=Object.entries(getWatchState()).filter(([,v])=>v?.progress>0).sort((a,b)=>(b[1]?.lastWatched||0)-(a[1]?.lastWatched||0)).map(([id])=>contents.find(x=>String(x.id)===String(id))).filter(Boolean);$("content").innerHTML=`<div class="catalog-intro"><span class="intro-line"></span><div><span class="intro-kicker">VOTRE UNIVERS NEXORA</span><p>Des histoires à découvrir, sélectionnées pour vous.</p></div></div>`+(resume.length?section("Reprendre la lecture",resume,"","","row"):``)+section("Tendances",featured.length?featured:contents.slice(0,10),"","", "row")+section("Films populaires",films,"Tout voir","film")+section("Séries populaires",series,"Tout voir","serie")+section("Animés populaires",anime,"Tout voir","anime")+section("Salués par la critique",critics,"Tout voir","trend")+section("Nouveautés",news,"Tout voir","new")}else{renderCatalogView("ranking");return} bindCards(); }

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
function updateAuthUI(){const logged=!!currentUser;$("authGuest").classList.toggle("hidden",logged);$("authUser").classList.toggle("hidden",!logged);if(logged){const name=currentUser.user_metadata?.full_name||currentUser.email?.split("@")[0]||"Compte NEXORA";$("accountName").textContent=name;$("accountEmail").textContent=currentUser.email||"";$("accountAvatar").textContent=name.trim().charAt(0).toUpperCase();$("accountButton").textContent=name.trim().charAt(0).toUpperCase()}else{$("accountButton").textContent="S"}$("authTitle").textContent=authMode==="signup"?"Créer un compte":"Connexion";$("authSubtitle").textContent=authMode==="signup"?"Créez votre compte NEXORA pour commencer.":"Retrouvez votre expérience NEXORA sur tous vos appareils."}
function setAuthMode(mode){authMode=mode;$("signupNameWrap").classList.toggle("hidden",mode!=="signup");$("authPassword").autocomplete=mode==="signup"?"new-password":"current-password";$("authSubmit").textContent=mode==="signup"?"Créer mon compte":"Se connecter";$("authSwitch").textContent=mode==="signup"?"J'ai déjà un compte":"Créer un compte";setAuthMessage("");updateAuthUI()}
function openAuth(){updateAuthUI();$("authModal").classList.remove("hidden");$("authModal").setAttribute("aria-hidden","false");setTimeout(()=>{if(!currentUser)$("authEmail").focus()},50)}
function closeAuth(){$("authModal").classList.add("hidden");$("authModal").setAttribute("aria-hidden","true");setAuthMessage("")}
async function submitAuth(){const email=$("authEmail").value.trim(),password=$("authPassword").value,name=$("authName").value.trim();if(!email||!password){setAuthMessage("Renseigne ton e-mail et ton mot de passe.","error");return}if(password.length<6){setAuthMessage("Le mot de passe doit contenir au moins 6 caractères.","error");return}$("authSubmit").disabled=true;setAuthMessage(authMode==="signup"?"Création du compte…":"Connexion…");try{if(authMode==="signup"){const {data,error}=await db.auth.signUp({email,password,options:{data:{full_name:name||undefined},emailRedirectTo:window.location.origin}});if(error)throw error;if(data.session){currentUser=data.user;setAuthMessage("Compte créé. Bienvenue sur NEXORA !","ok");updateAuthUI()}else setAuthMessage("Compte créé. Vérifie ton e-mail pour confirmer ton adresse.","ok")}else{const {data,error}=await db.auth.signInWithPassword({email,password});if(error)throw error;currentUser=data.user;updateAuthUI();setTimeout(closeAuth,450)}}catch(error){console.error(error);setAuthMessage(error.message||"Une erreur est survenue.","error")}finally{$("authSubmit").disabled=false}}

$("closeModal").addEventListener("click",closeModal);$("closePlayer").addEventListener("click",closePlayer);$("playerFullscreen")?.addEventListener("click",()=>{const shell=$("playerModal")?.querySelector(".player-shell");if(!shell)return;if(document.fullscreenElement){document.exitFullscreen?.().catch?.(()=>{});}else{shell.requestFullscreen?.().catch?.(()=>{});}});$("playerModal").addEventListener("click",e=>{if(e.target===$("playerModal"))closePlayer()});$("modal").addEventListener("click",e=>{if(e.target===$("modal"))closeModal()});$("modalList").addEventListener("click",()=>selected&&toggleList(selected.title));$("modalWatch").addEventListener("click",()=>selected&&openPlayer(selected.id));
$("accountButton").addEventListener("click",openAuth);$("closeAuth").addEventListener("click",closeAuth);$("authModal").addEventListener("click",e=>{if(e.target===$("authModal"))closeAuth()});$("authSwitch").addEventListener("click",()=>setAuthMode(authMode==="signup"?"login":"signup"));$("authSubmit").addEventListener("click",submitAuth);$("signOut").addEventListener("click",async()=>{const {error}=await db.auth.signOut();if(error){setAuthMessage(error.message,"error");return}currentUser=null;setAuthMode("login")});

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
$("searchToggle").addEventListener("click",()=>{
  const wrap=$("searchWrap");
  const isOpen=wrap.classList.toggle("open");
  $("searchToggle").setAttribute("aria-expanded",isOpen?"true":"false");
  if(isOpen)$("search").focus();
});

// ==========================================
// RECHERCHE DYNAMIQUE AVEC SUPABASE & TMDB
// ==========================================
let searchDebounceTimer;
async function renderSearchResults(query){
  const box=$("searchResults"); if(!box)return;
  const q=String(query||"").trim().toLowerCase();
  if(!q){box.innerHTML="";box.classList.add("hidden");return;}

  // 1. Recherche instantanée dans les éléments chargés localement
  let localResults = contents.filter(x=>String(x.title||"").toLowerCase().includes(q));

  // Affichage immédiat des résultats locaux s'il y en a
  renderDropdownHTML(localResults, box);

  // 2. Recherche distante dans Supabase
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(async () => {
    try {
      const { data, error } = await db.from("contents")
        .select("*")
        .ilike("title", `%${q}%`)
        .limit(8);

      if (!error && Array.isArray(data) && data.length) {
        const distantResults = data.map(normalizeContent).filter(isAllowedContent);
        // Fusion des résultats locaux et distants
        const map = new Map();
        [...localResults, ...distantResults].forEach(item => {
          if (!map.has(String(item.id))) map.set(String(item.id), item);
        });
        renderDropdownHTML([...map.values()], box);
      }
    } catch(err) {
      console.warn("Erreur recherche distante Supabase :", err);
    }
  }, 200);
}

function renderDropdownHTML(results, box){
  if(!results || !results.length){
    box.innerHTML = `<div style="padding:14px;color:#71717a;font-size:13px;text-align:center;">Aucun contenu trouvé sur NEXORA.</div>`;
    box.classList.remove("hidden");
    return;
  }

  const items = results.slice(0, 6);
  box.innerHTML = items.map(x => {
    const poster = imageUrl(x, "poster");
    const year = x.year || "—";
    const typeLabel = labelType(x.type);

    return `
      <div class="search-item" data-search-result="${escapeAttr(x.id)}" style="display:flex;align-items:center;gap:12px;padding:8px 10px;border-radius:10px;cursor:pointer;transition:background 0.15s ease;">
        <img class="search-thumb" src="${poster ? escapeAttr(poster) : 'https://via.placeholder.com/92x138/181920/84cc16?text=NEXORA'}" alt="${escapeAttr(x.title)}" style="width:42px;height:56px;border-radius:6px;object-fit:cover;background:#202028;flex-shrink:0;">
        <div class="search-info" style="flex:1;min-width:0;">
          <div class="search-title" style="font-size:13.5px;font-weight:600;margin:0 0 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#ffffff;">${escapeHtml(x.title)}</div>
          <div class="search-meta" style="display:flex;align-items:center;gap:8px;font-size:11.5px;color:#9ca3af;">
            <span>${escapeHtml(year)}</span>
            <span class="search-badge" style="background:#84cc16;color:#0b0c10;padding:2px 7px;border-radius:5px;font-size:10px;font-weight:700;text-transform:uppercase;">${escapeHtml(typeLabel)}</span>
          </div>
        </div>
        <span class="search-arrow" style="color:#6b7280;font-size:14px;">→</span>
      </div>
    `;
  }).join('');

  box.classList.remove("hidden");

  // Liaison du clic sur chaque résultat
  box.querySelectorAll("[data-search-result]").forEach(el => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-search-result");
      box.classList.add("hidden");
      $("search").value = "";
      openDetail(id);
    });
  });
}

$("search").addEventListener("input",()=>renderSearchResults($("search").value));
$("search").addEventListener("keydown",e=>{if(e.key==="Enter"){const first=$("searchResults")?.querySelector("[data-search-result]");if(first){e.preventDefault();first.click()}}if(e.key==="Escape"){$("search").value="";renderSearchResults("");$("searchWrap").classList.remove("open")}});
document.addEventListener("click",e=>{
  if(!e.target.closest?.("#searchArea")){
    $("searchResults")?.classList.add("hidden");
  }
});
window.addEventListener("scroll",()=>$("topbar").classList.toggle("scrolled",window.scrollY>30));document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeModal();closeAuth();closePlayer()}});

db.auth.getSession().then(({data})=>{currentUser=data.session?.user||null;updateAuthUI()});db.auth.onAuthStateChange((_event,session)=>{currentUser=session?.user||null;updateAuthUI()});
async function syncCatalogIfNeeded(){
  const key="nexora_last_catalog_sync_v5";
  const last=Number(localStorage.getItem(key)||0);
  if(Date.now()-last<1000*60*60*12)return null;
  try{
    const {data,error}=await db.functions.invoke("nexora-catalog-v5",{body:{}});
    if(error) throw error;
    if(!data?.ok) throw new Error(data?.error||"Synchronisation TMDB impossible");
    localStorage.setItem(key,String(Date.now()));
    return data;
  }catch(error){console.warn("Synchronisation TMDB non bloquante:",error);return null}
}
async function fetchAllContents(){const all=[];const pageSize=1000;for(let from=0;;from+=pageSize){const to=from+pageSize-1;const {data,error}=await db.from("contents").select("*").order("created_at",{ascending:false}).range(from,to);if(error)throw error;const batch=data||[];all.push(...batch);if(batch.length<pageSize)break}return all}
async function loadContents(){
  $("status").innerHTML='<span class="status-dot"></span> Chargement du catalogue…';
  let dbContents=[];
  try{
    dbContents=await fetchAllContents();
  }catch(error){
    console.warn("Catalogue Supabase indisponible, utilisation du catalogue local :",error);
  }
  contents=(dbContents.length?dbContents:[...demoCatalog,...extraCatalog]).map(normalizeContent).filter(isAllowedContent);
  $("status").innerHTML=`<span class="status-dot"></span> Catalogue disponible · ${contents.length} contenu(s)`;
  $("status").className="status ok";
  const hero=contents.find(x=>x.is_featured)||contents[0];
  if(hero) setHero(hero);
  render();

  syncCatalogIfNeeded().then(async result=>{
    if(!result) return;
    try{
      const refreshed=await fetchAllContents();
      if(refreshed.length){
        contents=refreshed.map(normalizeContent).filter(isAllowedContent);
        const updatedHero=contents.find(x=>x.is_featured)||contents[0];
        if(updatedHero) setHero(updatedHero);
        render();
        $("status").innerHTML=`<span class="status-dot"></span> Catalogue mis à jour · ${contents.length} contenu(s)`;
      }
    }catch(error){
      console.warn("Actualisation après synchronisation impossible :",error);
    }
  });
}
bindEpisodeControls();
document.addEventListener("keydown",event=>{if(event.key==="Escape" && !$('playerModal').classList.contains("hidden")){closePlayer();}});
loadContents();
