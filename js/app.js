(() => {
 const $ = id => document.getElementById(id);
 let lang = localStorage.getItem("lang") || "fa";
 let lessons = [];
 const faDigits = n => String(n).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[d]);

 function applyLang() {
  const t = I18N[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = t.dir;
  document.title = t.title;
  document.querySelectorAll("[data-i18n]").forEach(el => el.textContent = t[el.dataset.i18n]);
  $("langBtn").textContent = t.langBtn;
  renderGrid();
 }

 function renderGrid() {
  const t = I18N[lang], grid = $("grid");
  grid.innerHTML = "";
  lessons.forEach(l => {
   const title = l["title_" + lang];
   const active = l.file && title;
   const el = document.createElement(active ? "a" : "button");
   el.className = "glass lesson" + (active ? " on" : "");
   if (active) { el.href = l.file; el.textContent = title; }
   else { el.disabled = true; el.textContent = `${t.soon} ${lang === "fa" ? faDigits(l.id) : l.id}`; }
   grid.appendChild(el);
  });
 }

 fetch("lessons.json", {cache: "no-store"}).then(r => r.json())
  .then(d => { lessons = d; renderGrid(); })
  .catch(() => { $("grid").textContent = I18N[lang].err; });

 $("langBtn").onclick = () => { lang = lang === "fa" ? "en" : "fa"; localStorage.setItem("lang", lang); applyLang(); };
 $("lessonsBtn").onclick = () => { $("overlay").hidden = false; $("closeBtn").focus(); };
 const close = () => { $("overlay").hidden = true; $("lessonsBtn").focus(); };
 $("closeBtn").onclick = close;
 $("overlay").onclick = e => { if (e.target.id === "overlay") close(); };
 addEventListener("keydown", e => { if (e.key === "Escape" && !$("overlay").hidden) close(); });

 // Music
 const bgm = $("bgm"), btn = $("musicBtn"), icon = $("musicIcon"), fb = $("musicFallback");
 const ICON = {on: "assets/icons/music-on.png", off: "assets/icons/music-off.png"};
 let userMuted = localStorage.getItem("music") === "off";
 icon.onerror = () => { icon.style.display = "none"; fb.style.display = ""; };
 icon.onload = () => { icon.style.display = ""; fb.style.display = "none"; };
 function setIcon(playing) {
  btn.setAttribute("aria-pressed", playing);
  icon.src = playing ? ICON.on : ICON.off;
  fb.textContent = playing ? "♪" : "✕";
 }
 function play() { return bgm.play().then(() => setIcon(true)).catch(() => setIcon(false)); }
 function pause() { bgm.pause(); setIcon(false); }
 btn.onclick = e => {
  e.stopPropagation();
  if (bgm.paused) { userMuted = false; localStorage.setItem("music", "on"); play(); }
  else { userMuted = true; localStorage.setItem("music", "off"); pause(); }
 };
 setIcon(false);
 if (!userMuted) {
  play();
  const first = e => { if (btn.contains(e.target)) return; if (!userMuted && bgm.paused) play(); };
  addEventListener("pointerdown", first, {once: true});
 }

 // اگر از صفحه‌ی درس برگشتیم، پنل آموزش‌ها خودکار باز شود
 if (location.hash === "#lessons") $("lessonsBtn").click();

 applyLang();
})();
