const $ = (id) => document.getElementById(id);
const dialog = $("addDialog");
const STORAGE_KEY = "mymediahub.saved.v1";
let saved = [];
try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { saved = []; }

function toast(message) {
  const el = $("toast"); el.textContent = message; el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2300);
}
function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); renderSaved(); }
function renderSaved() {
  $("savedCount").textContent = `${saved.length} عنصر`;
  const box = $("savedBox");
  if (!saved.length) {
    box.innerHTML = '<div class="empty-icon">♡</div><b>قائمتك تبدأ من هنا</b><p>أضف روابطك المفضلة باستخدام الزر أدناه، وستبقى محفوظة على هذا الجهاز.</p>';
    return;
  }
  box.innerHTML = "";
  saved.forEach((item, index) => {
    const row = document.createElement("div"); row.className = "saved-entry";
    const link = document.createElement("a"); link.href = item.url; link.target = "_blank"; link.rel = "noopener"; link.textContent = item.title;
    const remove = document.createElement("button"); remove.className = "remove-btn"; remove.type = "button"; remove.textContent = "×"; remove.setAttribute("aria-label", "حذف " + item.title);
    remove.addEventListener("click", () => { saved.splice(index, 1); persist(); toast("تم حذف الرابط"); });
    row.append(link, remove); box.append(row);
  });
}
$("addLinkBtn").addEventListener("click", () => dialog.showModal());
$("addForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const title = $("itemTitle").value.trim(), url = $("itemUrl").value.trim();
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
    saved.unshift({title, url: parsed.href});
    persist(); dialog.close(); event.target.reset(); toast("تمت الإضافة إلى مكتبتك");
  } catch { toast("يرجى إدخال رابط يبدأ بـ https:// أو http://"); }
});
$("searchToggle").addEventListener("click", () => {
  $("searchPanel").classList.toggle("hidden");
  if (!$("searchPanel").classList.contains("hidden")) $("searchInput").focus();
});
$("searchInput").addEventListener("input", (event) => {
  const query = event.target.value.trim().toLocaleLowerCase("ar");
  document.querySelectorAll(".source-item").forEach((item) => {
    item.style.display = item.innerText.toLocaleLowerCase("ar").includes(query) ? "flex" : "none";
  });
});
document.querySelectorAll(".category-card").forEach((card) => card.addEventListener("click", () => {
  const type = card.dataset.filter;
  if (type === "library") { $("savedBox").scrollIntoView({behavior:"smooth"}); return; }
  const matches = [...document.querySelectorAll(".source-item")].filter(item => item.dataset.tags.split(" ").includes(type));
  document.querySelectorAll(".source-item").forEach(item => item.style.display = matches.includes(item) ? "flex" : "none");
  $("sourceList").scrollIntoView({behavior:"smooth"});
  toast(matches.length ? `عرض ${matches.length} من المصادر المناسبة` : "لا توجد مصادر في هذا القسم حالياً");
}));
document.querySelectorAll('.bottom-nav a[href^="#"]').forEach(link => link.addEventListener("click", () => {
  document.querySelectorAll(".bottom-nav a").forEach(a => a.classList.remove("active")); link.classList.add("active");
}));
renderSaved();
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}