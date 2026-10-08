/* Site Andréa Meirelles — monta as páginas a partir de content/site.json e content/imoveis.json
   (os dois arquivos são editados pelo painel). */

var ICON = {
  wa: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-.9 1.2-.3.2-.6.1a8.2 8.2 0 0 1-2.4-1.5 9 9 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.6l.4-.5.3-.5v-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6a1.1 1.1 0 0 0-.8.4 3.4 3.4 0 0 0-1 2.5 5.9 5.9 0 0 0 1.2 3.1 13.5 13.5 0 0 0 5.2 4.6c.7.3 1.3.5 1.7.6a4.2 4.2 0 0 0 1.9.1 3.1 3.1 0 0 0 2-1.4 2.5 2.5 0 0 0 .2-1.4c-.1-.2-.3-.3-.6-.4M12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4a9.8 9.8 0 1 1 8.3 4.6M20.5 3.5A11.8 11.8 0 0 0 1.9 17.7L.2 24l6.4-1.7a11.8 11.8 0 0 0 5.6 1.4A11.8 11.8 0 0 0 20.5 3.5"/></svg>',
  ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
  right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>',
  mark: '<svg viewBox="0 0 44 30" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M2 29L15 2l13 27M8 29L17 10M13 29L19.5 15M9.5 21h14M21 18L30 2l13 27M1 29h10M23 29h6M38 29h6" stroke="#c9ad5c"/></svg>'
};

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
function paras(text) {
  return String(text || "").split(/\n\s*\n/).filter(Boolean).map(function (p) { return "<p>" + esc(p.trim()) + "</p>"; }).join("");
}
/* O conteúdo editado no painel é lido direto do repositório do site,
   assim o que a Andréa salva aparece no site em poucos minutos, sem publicar de novo. */
var REPO_RAW = "https://raw.githubusercontent.com/admcoachingmeirelles-cyber/andrea-meirelles-site/main";
var LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
function getJSON(url) {
  return fetch(url, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
}
function getContent(path) {
  if (LOCAL) return getJSON(path);
  var minuto = Math.floor(Date.now() / 60000);
  return getJSON(REPO_RAW + path + "?v=" + minuto).catch(function () { return getJSON(path); });
}
/* Fotos enviadas pelo painel ficam em /uploads no repositório */
function media(v) {
  if (typeof v === "string") return !LOCAL && v.indexOf("/uploads/") === 0 ? REPO_RAW + v : v;
  if (Array.isArray(v)) return v.map(media);
  if (v && typeof v === "object") { var o = {}; for (var k in v) o[k] = media(v[k]); return o; }
  return v;
}
function loadData() {
  return Promise.all([getContent("/content/site.json"), getContent("/content/imoveis.json")]).then(function (d) {
    d = media(d);
    var imoveis = (d[1] || []).filter(function (i) { return i && i.publicado !== false && i.id; });
    return { site: d[0], imoveis: imoveis };
  });
}
function wa(site, text) {
  return "https://wa.me/" + site.whatsapp + (text ? "?text=" + encodeURIComponent(text) : "");
}
function imovelUrl(i) { return /localhost|127.0.0.1/.test(location.hostname) ? "/imovel.html?id=" + encodeURIComponent(i.id) : "/imovel/" + encodeURIComponent(i.id); }
function absUrl(path) { return location.origin + path; }

/* Vídeo: aceita link do YouTube (normal, youtu.be, shorts) e do Instagram (reel ou post) */
function videoEmbed(url) {
  url = String(url || "").trim();
  var m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (m) {
    return { src: "https://www.youtube.com/embed/" + m[1] + "?rel=0", vertical: /shorts\//.test(url), thumb: "https://i.ytimg.com/vi/" + m[1] + "/hqdefault.jpg" };
  }
  m = url.match(/instagram\.com\/(?:[\w.]+\/)?(reel|reels|p|tv)\/([\w-]+)/);
  if (m) {
    return { src: "https://www.instagram.com/" + (m[1] === "reels" ? "reel" : m[1]) + "/" + m[2] + "/embed", vertical: true, thumb: "" };
  }
  return null;
}
function videoFrame(v, title) {
  return '<div class="video-frame' + (v.vertical ? " vertical" : "") + '"><iframe src="' + esc(v.src) + '" title="' + esc(title || "Vídeo") + '" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
}

function specs(i) {
  var out = [];
  if (i.area) out.push(i.area);
  if (i.quartos) out.push(i.quartos + (String(i.quartos) === "1" ? " quarto" : " quartos"));
  if (i.banheiros) out.push(i.banheiros + (String(i.banheiros) === "1" ? " banheiro" : " banheiros"));
  if (i.vagas) out.push(i.vagas + (String(i.vagas) === "1" ? " vaga" : " vagas"));
  return out;
}
function place(i) { return [i.bairro, i.cidade].filter(Boolean).join(" · "); }

/* Cabeçalho e rodapé comuns */
function renderChrome(site) {
  var head = document.getElementById("top");
  if (head) {
    head.innerHTML =
      '<div class="wrap">' +
        '<a class="logo" href="/">' + ICON.mark + '<span><strong>Andréa Meirelles</strong><small>Corretora Imobiliária</small></span></a>' +
        '<ul class="menu">' +
          '<li><a href="/#imoveis">Imóveis</a></li>' +
          '<li><a href="/#servicos">Serviços</a></li>' +
          '<li><a href="/#sobre">Quem sou</a></li>' +
          '<li><a href="/ebook.html">E-book grátis</a></li>' +
          '<li><a href="/ebook-mcmv.html">Guia MCMV 2026</a></li>' +
          '<li><a href="/#contato">Contato</a></li>' +
        '</ul>' +
        '<a class="btn" href="' + wa(site, "Olá, Andréa! Vim pelo site e quero agendar uma conversa.") + '" target="_blank" rel="noopener">' + ICON.wa + '<span>Agendar conversa</span></a>' +
      '</div>';
    var onScroll = function () { head.classList.toggle("solid", window.scrollY > 40); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
  var foot = document.getElementById("foot");
  if (foot) {
    foot.innerHTML =
      '<div class="wrap">' +
        '<div class="foot-grid">' +
          '<div><a class="logo" href="/">' + ICON.mark + '<span><strong>Andréa Meirelles</strong><small>Corretora Imobiliária</small></span></a>' +
          '<p>Do aluguel ao primeiro imóvel, com um caminho claro e sem complicação.</p></div>' +
          '<div><h4>Navegação</h4><ul><li><a href="/#imoveis">Imóveis</a></li><li><a href="/#servicos">Serviços</a></li><li><a href="/#sobre">Quem sou</a></li><li><a href="/ebook.html">E-book grátis</a></li><li><a href="/ebook-mcmv.html">Guia MCMV 2026</a></li><li><a href="/#contato">Contato</a></li></ul></div>' +
          '<div><h4>Contato</h4><ul>' +
            '<li><a href="' + wa(site) + '" target="_blank" rel="noopener">WhatsApp ' + esc(site.whatsapp_exibicao) + '</a></li>' +
            '<li><a href="https://www.instagram.com/' + esc(site.instagram) + '/" target="_blank" rel="noopener">@' + esc(site.instagram) + '</a></li>' +
            '<li>' + esc(site.horario) + '</li>' +
          '</ul></div>' +
        '</div>' +
        '<p class="foot-bottom">© ' + new Date().getFullYear() + ' Andréa Meirelles · Corretora de Imóveis · CRECI ' + esc(site.creci) + ' · Santo Antônio de Jesus, Bahia</p>' +
      '</div>';
  }
  document.querySelectorAll(".wa-icon").forEach(function (a) { if (!a.innerHTML) a.innerHTML = ICON.wa; });
  var fw = document.getElementById("float-wa");
  if (fw) fw.href = wa(site, "Olá, Andréa! Vim pelo site.");
}

function reveal() {
  var els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  els.forEach(function (e) { io.observe(e); });
}

/* Filtros da lista de imóveis */
var FAIXAS_VENDA = [
  { nome: "R$ 99 mil a R$ 150 mil", min: 99000, max: 150000 },
  { nome: "R$ 150 mil a R$ 250 mil", min: 150000, max: 250000 },
  { nome: "R$ 250 mil a R$ 400 mil", min: 250000, max: 400000 },
  { nome: "Acima de R$ 400 mil", min: 400000, max: Infinity }
];
var FAIXAS_ALUGUEL = [
  { nome: "Até R$ 1.000 por mês", min: 0, max: 1000 },
  { nome: "R$ 1.000 a R$ 2.000 por mês", min: 1000, max: 2000 },
  { nome: "Acima de R$ 2.000 por mês", min: 2000, max: Infinity }
];
function finalidade(i) { return i.finalidade || "Venda"; }
/* Valor só para o filtro (não aparece no site). Vazio = aparece em qualquer faixa. */
function valorNum(i) {
  var n = parseFloat(String(i.valor == null ? "" : i.valor).replace(/[^\d,]/g, "").replace(",", "."));
  return isNaN(n) ? null : n;
}

function card(i) {
  var meta = specs(i).map(function (s) { return "<span>" + esc(s) + "</span>"; }).join("");
  return '<a class="card" href="' + imovelUrl(i) + '">' +
    (i.capa ? '<img src="' + esc(i.capa) + '" alt="' + esc(i.titulo) + '" loading="lazy">' : "") +
    (i.status ? '<span class="tag">' + esc(i.status) + "</span>" : "") +
    '<div class="card-body">' +
      '<p class="loc">' + esc([finalidade(i), [i.tipo, place(i)].filter(Boolean).join(" — ")].join(" · ")) + "</p>" +
      "<h3>" + esc(i.titulo) + "</h3>" +
      (meta ? '<div class="meta">' + meta + "</div>" : "") +
      '<p class="price">' + (i.preco ? esc(i.preco) : "Ver detalhes →") + "</p>" +
    "</div></a>";
}

/* ---------- Início ---------- */
function renderHome(d) {
  var s = d.site, im = d.imoveis;
  var heroBg = document.getElementById("hero-bg");
  if (s.capa_foto) heroBg.src = s.capa_foto; else heroBg.remove();
  document.getElementById("hero-eyebrow").textContent = s.capa_regiao;
  document.getElementById("hero-title").innerHTML = esc(s.capa_titulo) + " <b>" + esc(s.capa_destaque) + "</b>";
  document.getElementById("hero-text").textContent = s.capa_texto;

  document.getElementById("stat-creci").textContent = "CRECI " + s.creci;

  document.getElementById("imoveis-titulo").textContent = s.imoveis_titulo;
  document.getElementById("imoveis-texto").textContent = s.imoveis_texto;
  var ordered = im.slice().sort(function (a, b) { return (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0); });
  var grid = document.getElementById("grid");
  var filtro = { fin: "", faixa: "" };
  var tabs = document.querySelectorAll("#fin-tabs button"), faixaSel = document.getElementById("faixa");

  function fillFaixas() {
    var lista = filtro.fin ? (filtro.fin === "Venda" ? FAIXAS_VENDA : FAIXAS_ALUGUEL) : [];
    faixaSel.innerHTML = filtro.fin
      ? '<option value="">Qualquer valor' + (filtro.fin === "Venda" ? " (a partir de R$ 99 mil)" : "") + "</option>" +
        lista.map(function (f, k) { return '<option value="' + k + '">' + f.nome + "</option>"; }).join("")
      : '<option value="">Escolha venda ou aluguel</option>';
    faixaSel.disabled = !filtro.fin;
    filtro.faixa = "";
  }
  function draw() {
    var lista = filtro.fin === "Venda" ? FAIXAS_VENDA : FAIXAS_ALUGUEL;
    var f = filtro.faixa === "" ? null : lista[+filtro.faixa];
    var res = ordered.filter(function (i) {
      if (filtro.fin && finalidade(i) !== filtro.fin) return false;
      if (f && valorNum(i) !== null && (valorNum(i) < f.min || valorNum(i) >= f.max)) return false;
      return true;
    });
    grid.className = "grid" + (res.length === 1 ? " single" : res.length === 3 ? " lead" : "");
    grid.innerHTML = res.length ? res.map(card).join("") :
      '<div class="empty"><p>Nenhum imóvel com essa busca no momento. Me conta o que você procura que eu encontro pra você.</p>' +
      '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + wa(s, "Olá, Andréa! Procuro um imóvel para " + (filtro.fin || "comprar").toLowerCase() + (f ? " na faixa " + f.nome : "") + ".") + '">' + ICON.wa + "Falar com a Andréa</a></div>";
  }
  tabs.forEach(function (b) {
    b.addEventListener("click", function () {
      filtro.fin = b.getAttribute("data-fin");
      tabs.forEach(function (x) { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      fillFaixas(); draw();
    });
  });
  faixaSel.addEventListener("change", function () { filtro.faixa = this.value; draw(); });
  fillFaixas(); draw();

  var v = videoEmbed(s.video_destaque);
  var vs = document.getElementById("video");
  if (v) {
    document.getElementById("video-titulo").textContent = s.video_titulo;
    document.getElementById("video-texto").textContent = s.video_texto;
    document.getElementById("video-box").innerHTML = videoFrame(v, s.video_titulo);
  } else { vs.hidden = true; }

  var p1 = document.getElementById("sobre-foto"), p2 = document.getElementById("sobre-foto-2");
  if (s.sobre_foto) p1.src = s.sobre_foto; else p1.remove();
  if (s.sobre_foto_2) p2.src = s.sobre_foto_2; else p2.remove();
  document.getElementById("sobre-frase").textContent = "“" + s.sobre_frase + "”";
  document.getElementById("sobre-texto").innerHTML = paras(s.sobre_texto);
  document.getElementById("sobre-creci").textContent = "CRECI " + s.creci;
  document.getElementById("sobre-ig").href = "https://www.instagram.com/" + s.instagram + "/";
  document.getElementById("sobre-wa").href = wa(s, "Olá, Andréa! Vim pelo site.");

  document.querySelectorAll("[data-wa]").forEach(function (a) { a.href = wa(s, a.getAttribute("data-wa")); });

  document.getElementById("cidades").innerHTML = (s.cidades || []).map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("");

  var info = document.getElementById("info");
  info.innerHTML =
    '<li><small>WhatsApp</small><a href="' + wa(s) + '" target="_blank" rel="noopener">' + esc(s.whatsapp_exibicao) + "</a></li>" +
    '<li><small>Instagram</small><a href="https://www.instagram.com/' + esc(s.instagram) + '/" target="_blank" rel="noopener">@' + esc(s.instagram) + "</a></li>" +
    "<li><small>Atendimento</small>" + esc(s.horario) + "</li>" +
    "<li><small>Registro</small>CRECI " + esc(s.creci) + "</li>";

  var sel = document.getElementById("f-interesse");
  sel.innerHTML = im.map(function (i) { return "<option>" + esc(i.titulo) + "</option>"; }).join("") +
    "<option>Meu primeiro imóvel</option><option>Casa ou lote</option><option>Financiamento</option><option>Documentação</option><option>Outro assunto</option>";

  document.getElementById("contato-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var nome = this.nome.value.trim();
    if (!nome) { this.nome.focus(); return; }
    var t = "Olá, Andréa! Sou " + nome + ". Tenho interesse em: " + this.interesse.value + ".";
    if (this.mensagem.value.trim()) t += "\n\n" + this.mensagem.value.trim();
    window.open(wa(s, t), "_blank", "noopener");
  });
}

/* ---------- Página do imóvel ---------- */
function renderImovel(d) {
  var s = d.site;
  var id = new URLSearchParams(location.search).get("id") || decodeURIComponent((location.pathname.match(/^\/imovel\/([^\/]+)/) || [])[1] || "");
  var i = d.imoveis.filter(function (x) { return x.id === id; })[0];
  var root = document.getElementById("imovel");
  if (!i) {
    root.innerHTML = '<div class="wrap sec"><h1>Imóvel não encontrado</h1><p style="margin:16px 0 28px;color:var(--muted)">Ele pode ter sido vendido ou retirado do site.</p><a class="btn btn-gold" href="/#imoveis">Ver todos os imóveis</a></div>';
    return;
  }
  document.title = i.titulo + " | Andréa Meirelles";
  var url = absUrl(imovelUrl(i));

  var items = (i.fotos || []).filter(Boolean).map(function (f) { return { type: "foto", src: f }; });
  (i.videos || []).forEach(function (vl) { var v = videoEmbed(vl); if (v) items.push({ type: "video", v: v }); });
  if (!items.length && i.capa) items.push({ type: "foto", src: i.capa });

  var msg = "Olá, Andréa! Tenho interesse no imóvel " + i.titulo + ". " + url;
  var facts = specs(i).map(function (x) { return "<div><b>" + esc(x) + "</b></div>"; }).join("");
  var dest = (i.destaques || []).filter(Boolean);
  var vids = (i.videos || []).map(videoEmbed).filter(Boolean);

  root.innerHTML =
    '<section class="gallery">' +
      '<div class="stage" id="stage"></div>' +
      (items.length > 1 ? '<div class="thumbs" id="thumbs"></div>' : "") +
    "</section>" +
    '<div class="wrap"><div class="detail">' +
      "<div>" +
        '<p class="crumbs"><a href="/">Início</a> / <a href="/#imoveis">Imóveis</a> / ' + esc(i.titulo) + "</p>" +
        "<h1>" + esc(i.titulo) + "</h1>" +
        (i.subtitulo ? '<p style="font-size:1.15rem;margin-bottom:8px">' + esc(i.subtitulo) + "</p>" : "") +
        '<p class="where">' + ICON.pin + esc(place(i)) + "</p>" +
        '<div class="chips">' +
          '<a class="chip" href="#" target="_blank" rel="noopener" id="share-wa">' + ICON.wa + "Enviar no WhatsApp</a>" +
          '<button class="chip" type="button" id="share">' + ICON.share + "Compartilhar</button>" +
          '<button class="chip" type="button" id="copy">' + ICON.link + 'Copiar link</button><span class="share-ok" id="copied" hidden>Link copiado!</span>' +
        "</div>" +
        (facts ? '<div class="facts">' + facts + "</div>" : "") +
        "<h2>Sobre o imóvel</h2>" +
        '<div class="desc">' + paras(i.descricao) + "</div>" +
        (dest.length ? '<h2>Destaques</h2><ul class="checks">' + dest.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>" : "") +
        (vids.length ? '<h2>Vídeos</h2><div class="videos">' + vids.map(function (v) { return videoFrame(v, i.titulo); }).join("") + "</div>" : "") +
      "</div>" +
      '<aside class="side">' +
        '<p class="k">' + esc(i.status || i.tipo || "Imóvel") + "</p>" +
        '<p class="v">' + esc(i.preco || "Consulte as condições") + "</p>" +
        (i.botao_extra_link ? '<a class="btn btn-gold" href="' + esc(i.botao_extra_link) + '" target="_blank" rel="noopener">' + esc(i.botao_extra_texto || "Saiba mais") + "</a>" : "") +
        '<a class="btn btn-wa" href="' + wa(s, msg) + '" target="_blank" rel="noopener">' + ICON.wa + "Falar sobre este imóvel</a>" +
        "<hr>" +
        '<div class="agent">' + (s.sobre_foto ? '<img src="' + esc(s.sobre_foto) + '" alt="Andréa Meirelles">' : "") + "<strong>Andréa Meirelles</strong><span>CRECI " + esc(s.creci) + "</span></div>" +
        '<a class="ebook-mini" href="/ebook.html?imovel=' + encodeURIComponent(i.id) + '"><b>E-book grátis:</b> Do aluguel ao seu primeiro imóvel →</a>' +
      "</aside>" +
    "</div></div>";

  /* Galeria */
  var stage = document.getElementById("stage"), thumbs = document.getElementById("thumbs"), cur = 0;
  function show(n) {
    cur = (n + items.length) % items.length;
    var it = items[cur];
    stage.innerHTML = (it.type === "foto"
      ? '<img src="' + esc(it.src) + '" alt="' + esc(i.titulo) + " — foto " + (cur + 1) + '">'
      : '<iframe src="' + esc(it.v.src) + '" title="Vídeo do imóvel" style="position:absolute;inset:0;width:100%;height:100%;border:0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>') +
      (items.length > 1 ? '<button class="nav-btn prev" type="button" aria-label="Anterior">' + ICON.left + '</button><button class="nav-btn next" type="button" aria-label="Próxima">' + ICON.right + '</button><span class="count">' + (cur + 1) + " / " + items.length + "</span>" : "");
    var pv = stage.querySelector(".prev"), nx = stage.querySelector(".next");
    if (pv) { pv.onclick = function () { show(cur - 1); }; nx.onclick = function () { show(cur + 1); }; }
    if (thumbs) thumbs.querySelectorAll("button").forEach(function (b, k) { b.classList.toggle("on", k === cur); });
  }
  if (thumbs) {
    thumbs.innerHTML = items.map(function (it, k) {
      if (it.type === "foto") return '<button type="button" aria-label="Foto ' + (k + 1) + '"><img src="' + esc(it.src) + '" alt="" loading="lazy"></button>';
      return '<button type="button" class="vid" aria-label="Vídeo">' + (it.v.thumb ? '<img src="' + esc(it.v.thumb) + '" alt="" loading="lazy" style="position:absolute;inset:0;opacity:.5">' : "") + '<span style="position:relative">▶ Vídeo</span></button>';
    }).join("");
    thumbs.querySelectorAll("button").forEach(function (b, k) { b.onclick = function () { show(k); }; });
  }
  if (items.length) show(0); else stage.remove();
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") show(cur - 1);
    if (e.key === "ArrowRight") show(cur + 1);
  });

  /* Compartilhar */
  document.getElementById("share-wa").href = "https://wa.me/?text=" + encodeURIComponent("Olha esse imóvel: " + i.titulo + " " + url);
  var sh = document.getElementById("share");
  if (navigator.share) {
    sh.onclick = function () { navigator.share({ title: i.titulo, text: i.subtitulo || i.titulo, url: url }).catch(function () {}); };
  } else { sh.remove(); }
  document.getElementById("copy").onclick = function () {
    var ok = document.getElementById("copied");
    (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(function () {
      ok.hidden = false; setTimeout(function () { ok.hidden = true; }, 2500);
    }).catch(function () { prompt("Copie o link:", url); });
  };
}

/* ---------- Página do e-book ---------- */
var EBOOK_PDF = "/ebook/do-aluguel-ao-primeiro-imovel.pdf";
var EBOOK_TITLE = "Do aluguel ao seu primeiro imóvel";
var EBOOK_PAGE = "/ebook/";
function renderEbook(d) {
  var s = d.site, b = document.body.dataset;
  var pdf = b.ebookPdf || EBOOK_PDF, pagina = b.ebookPage || EBOOK_PAGE, titulo = b.ebookTitle || EBOOK_TITLE;
  var id = new URLSearchParams(location.search).get("imovel");
  var im = d.imoveis.filter(function (x) { return x.id === id; })[0];
  var form = document.getElementById("ebook-form"), done = document.getElementById("ebook-done");
  if (im) document.getElementById("ebook-ctx").textContent = "Você veio pelo " + im.titulo + ". Junto com o e-book, eu te mando as informações dele.";
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var nome = form.nome.value.trim(), zap = form.whatsapp.value.trim();
    if (!nome) { form.nome.focus(); return; }
    if (zap.replace(/\D/g, "").length < 10) { form.whatsapp.focus(); form.whatsapp.setCustomValidity("Coloque o WhatsApp com DDD"); form.whatsapp.reportValidity(); return; }
    var t = "Olá, Andréa! Sou " + nome + " (" + zap + "). Baixei o e-book \"" + titulo + "\"" + (im ? " e quero receber as informações do " + im.titulo : "") + ".\n\n📘 Meu e-book: " + absUrl(pagina);
    window.open(wa(s, t), "_blank", "noopener");
    var a = document.createElement("a");
    a.href = pdf; a.download = titulo + " - Andréa Meirelles.pdf";
    document.body.appendChild(a); a.click(); a.remove();
    form.hidden = true; done.hidden = false;
    document.getElementById("ebook-again").href = pdf;
    document.getElementById("ebook-wa").href = wa(s, t);
    if (im) { var b = document.getElementById("ebook-imovel"); b.href = imovelUrl(im); b.hidden = false; b.textContent = "Ver o " + im.titulo; }
  });
  form.whatsapp.addEventListener("input", function () { this.setCustomValidity(""); });
}

/* Início comum */
document.addEventListener("DOMContentLoaded", function () {
  var page = document.body.getAttribute("data-page");
  loadData().then(function (d) {
    renderChrome(d.site);
    if (page === "home") renderHome(d);
    if (page === "imovel") renderImovel(d);
    if (page === "ebook") renderEbook(d);
    if (page === "ebook-get") document.getElementById("get-wa").href = wa(d.site, "Olá, Andréa! Baixei o e-book e tenho uma dúvida.");
    reveal();
    if (location.hash) { var t = document.querySelector(location.hash); if (t) t.scrollIntoView(); }
  }).catch(function (err) {
    console.error(err);
    document.querySelectorAll(".reveal").forEach(function (e) { e.classList.add("in"); });
  });
});
