const $=id=>document.getElementById(id);
const KEY="my-media-hub-v2-favorites";
let favorites=[];try{favorites=JSON.parse(localStorage.getItem(KEY)||"[]")}catch{}
const cards=[...document.querySelectorAll(".media-card")];
function notify(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2100)}
function persist(){localStorage.setItem(KEY,JSON.stringify(favorites));renderFavorites();updateHearts()}
function updateHearts(){cards.forEach(card=>{const btn=card.querySelector(".save-btn");const yes=favorites.some(x=>x.title===card.dataset.title);btn.classList.toggle("saved",yes);btn.textContent=yes?"♥":"♡"})}
function renderFavorites(){const box=$("favoritesBox");$("favCount").textContent=`${favorites.length} عنصر`;if(!favorites.length){box.innerHTML='<span>♡</span><b>لم تحفظ أي محتوى بعد</b><small>اضغط القلب على أي بطاقة لإضافتها هنا.</small>';return}box.innerHTML="";favorites.forEach((item,i)=>{const row=document.createElement("div");row.className="favorite-row";const a=document.createElement("a");a.href=item.url;a.target="_blank";a.rel="noopener";a.textContent=item.title;const b=document.createElement("button");b.textContent="×";b.setAttribute("aria-label","حذف من المفضلة");b.onclick=()=>{favorites.splice(i,1);persist();notify("حُذف من قائمتك")};row.append(a,b);box.append(row)})}
function filterCards(type,query=""){let visible=0;cards.forEach(card=>{const matchType=type==="all"||card.dataset.type===type;const matchText=(card.innerText+" "+card.dataset.title).toLocaleLowerCase("ar").includes(query.toLocaleLowerCase("ar"));const show=matchType&&matchText;card.classList.toggle("hidden",!show);if(show)visible++});$("emptyState").classList.toggle("hidden",visible>0)}
$("filters").addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;document.querySelectorAll(".chip").forEach(x=>x.classList.toggle("active",x===b));filterCards(b.dataset.filter,$("searchInput").value)});
$("searchOpen").onclick=()=>{$("searchWrap").classList.toggle("hidden");if(!$("searchWrap").classList.contains("hidden"))$("searchInput").focus()};
$("searchInput").oninput=()=>filterCards(document.querySelector(".chip.active").dataset.filter,$("searchInput").value);
$("clearSearch").onclick=()=>{$("searchInput").value="";filterCards(document.querySelector(".chip.active").dataset.filter,"")};
$("exploreBtn").onclick=()=>$("mediaGrid").scrollIntoView({behavior:"smooth"});
cards.forEach(card=>{card.querySelector(".save-btn").onclick=()=>{const idx=favorites.findIndex(x=>x.title===card.dataset.title);if(idx>=0)favorites.splice(idx,1);else favorites.push({title:card.dataset.title,url:card.dataset.url});persist();notify(idx>=0?"أزيل من قائمتك":"أضيف إلى قائمتك")};card.querySelector(".poster").onclick=()=>{ $("detailTitle").textContent=card.dataset.title;$("detailDescription").textContent=card.dataset.description;$("detailSource").textContent="المصدر: "+card.dataset.source;$("detailLink").href=card.dataset.url;$("detailDialog").showModal() }});
$("detailClose").onclick=()=>$("detailDialog").close();
$("mediaFile").addEventListener("change",e=>{const file=e.target.files?.[0];if(!file)return;const url=URL.createObjectURL(file);const isVideo=file.type.startsWith("video/");const video=$("videoPlayer"),audio=$("audioPlayer");video.pause();audio.pause();video.classList.toggle("hidden",!isVideo);audio.classList.toggle("hidden",isVideo);(isVideo?video:audio).src=url;$("fileName").textContent=file.name;notify("تم تحميل الملف محلياً في المشغل")});
renderFavorites();updateHearts();
if("serviceWorker"in navigator&&location.protocol.startsWith("http"))addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));

// Personal film & series catalog with genre, season and episode selection.
const CATALOG_KEY="my-media-hub.catalog.v1";
const genreNames={action:"أكشن",adventure:"مغامرات",animation:"أنيميشن",comedy:"كوميديا",crime:"جريمة",documentary:"وثائقي",drama:"دراما",family:"عائلي",fantasy:"فانتازيا",history:"تاريخي",horror:"رعب",mystery:"غموض",romance:"رومانسي",scifi:"خيال علمي",sport:"رياضي",thriller:"إثارة وتشويق",war:"حرب",western:"ويسترن",musical:"استعراضي / موسيقي",reality:"واقعي",biography:"سيرة ذاتية"};
let catalogItems=[];try{catalogItems=JSON.parse(localStorage.getItem(CATALOG_KEY)||"[]")}catch{}
let catalogKind="all",catalogGenre="all";
const catalogGrid=document.getElementById("catalogGrid");
function saveCatalog(){localStorage.setItem(CATALOG_KEY,JSON.stringify(catalogItems));renderCatalog()}
function renderCatalog(){
 if(!catalogGrid)return;
 const list=catalogItems.filter(x=>(catalogKind==="all"||x.kind===catalogKind)&&(catalogGenre==="all"||x.genre===catalogGenre));
 catalogGrid.innerHTML="";
 if(!list.length){catalogGrid.innerHTML='<div class="catalog-empty"><span>▣</span><b>لا توجد عناوين في هذا التصنيف</b><small>أضيفي فيلماً أو مسلسلاً من زر «إضافة عنوان» لتبدئي مكتبتك.</small></div>';return}
 list.forEach(item=>{
  const card=document.createElement("article");card.className="catalog-card "+(item.kind==="series"?"series":"film");
  const art=document.createElement("div");art.className="catalog-art";art.textContent=item.kind==="series"?"▤":"▣";
  const title=document.createElement("h3");title.textContent=item.title;
  const meta=document.createElement("div");meta.className="meta";meta.textContent=(item.kind==="series"?"مسلسل":"فيلم")+" · "+(genreNames[item.genre]||"عام");
  card.append(art,title,meta);
  if(item.kind==="series"){
   const row=document.createElement("div");row.className="season-episode";
   const seasonWrap=document.createElement("div"),episodeWrap=document.createElement("div");
   const sl=document.createElement("label");sl.textContent="الموسم / الجزء";
   const season=document.createElement("select");season.setAttribute("aria-label","اختيار الموسم أو الجزء");
   for(let n=1;n<=item.seasons;n++){const o=document.createElement("option");o.value=n;o.textContent="الموسم "+n;season.append(o)}
   const el=document.createElement("label");el.textContent="الحلقة";
   const episode=document.createElement("select");episode.setAttribute("aria-label","اختيار الحلقة");
   function fillEpisodes(){const current=Number(episode.value)||1;episode.innerHTML="";const count=Number(item.episodesPerSeason)||10;for(let n=1;n<=count;n++){const o=document.createElement("option");o.value=n;o.textContent="الحلقة "+n;episode.append(o)}if(current<=count)episode.value=current;status.textContent=`اختيارك: الموسم ${season.value} · الحلقة ${episode.value}`}
   const status=document.createElement("div");status.className="episode-status";
   season.addEventListener("change",fillEpisodes);episode.addEventListener("change",()=>status.textContent=`اختيارك: الموسم ${season.value} · الحلقة ${episode.value}`);
   seasonWrap.append(sl,season);episodeWrap.append(el,episode);row.append(seasonWrap,episodeWrap);card.append(row);fillEpisodes();card.append(status);
  }else{
   const status=document.createElement("div");status.className="episode-status";status.textContent="فيلم مستقل";card.append(status);
  }
  const actions=document.createElement("div");actions.className="catalog-actions";
  if(item.url){const a=document.createElement("a");a.href=item.url;a.target="_blank";a.rel="noopener";a.textContent=item.kind==="series"?"فتح مصدر المسلسل":"فتح مصدر الفيلم";actions.append(a)}
  const del=document.createElement("button");del.type="button";del.textContent="حذف";del.addEventListener("click",()=>{catalogItems=catalogItems.filter(x=>x.id!==item.id);saveCatalog();notify("تم حذف العنوان")});actions.append(del);card.append(actions);catalogGrid.append(card);
 });
}
document.getElementById("catalogTypes")?.addEventListener("click",e=>{const b=e.target.closest("[data-kind]");if(!b)return;catalogKind=b.dataset.kind;document.querySelectorAll("#catalogTypes .chip").forEach(x=>x.classList.toggle("active",x===b));renderCatalog()});
document.getElementById("genreFilters")?.addEventListener("click",e=>{const b=e.target.closest("[data-genre]");if(!b)return;catalogGenre=b.dataset.genre;document.querySelectorAll("#genreFilters .chip").forEach(x=>x.classList.toggle("active",x===b));renderCatalog()});
const catalogDialog=document.getElementById("catalogDialog");
document.getElementById("addCatalogItem")?.addEventListener("click",()=>catalogDialog.showModal());
document.getElementById("catalogClose")?.addEventListener("click",()=>catalogDialog.close());
document.getElementById("newKind")?.addEventListener("change",e=>document.getElementById("seriesFields").classList.toggle("hidden",e.target.value!=="series"));
document.getElementById("catalogForm")?.addEventListener("submit",e=>{
 e.preventDefault();
 const kind=document.getElementById("newKind").value,title=document.getElementById("newTitle").value.trim(),genre=document.getElementById("newGenre").value,url=document.getElementById("newUrl").value.trim();
 let safeUrl="";
 if(url){try{const parsed=new URL(url);if(!["http:","https:"].includes(parsed.protocol))throw Error();safeUrl=parsed.href}catch{notify("الرابط غير صحيح");return}}
 const seasons=kind==="series"?Math.max(1,Math.min(30,Number(document.getElementById("newSeasons").value)||1)):0;
 const episodesPerSeason=kind==="series"?Math.max(1,Math.min(100,Number(document.getElementById("newEpisodes").value)||10)):0;
 catalogItems.unshift({id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),kind,title,genre,url:safeUrl,seasons,episodesPerSeason});
 saveCatalog();catalogDialog.close();e.target.reset();document.getElementById("seriesFields").classList.add("hidden");catalogKind="all";catalogGenre="all";
 document.querySelectorAll("#catalogTypes .chip").forEach(x=>x.classList.toggle("active",x.dataset.kind==="all"));document.querySelectorAll("#genreFilters .chip").forEach(x=>x.classList.toggle("active",x.dataset.genre==="all"));renderCatalog();notify("أضيف العنوان إلى مكتبتك");
});
renderCatalog();
