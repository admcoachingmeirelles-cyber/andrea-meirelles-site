// Entrega a página do imóvel com título, descrição e foto do próprio imóvel,
// para o link aparecer bonito quando for enviado no WhatsApp.
// Os imóveis são lidos do repositório do site (o que a Andréa salva no painel).
const fs = require("fs");
const path = require("path");

const SITE = "https://andrea-meirelles.vercel.app";
const REPO_RAW = "https://raw.githubusercontent.com/admcoachingmeirelles-cyber/andrea-meirelles-site/main";

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function loadImoveis(root) {
  try {
    const r = await fetch(REPO_RAW + "/content/imoveis.json?v=" + Math.floor(Date.now() / 60000));
    if (r.ok) return await r.json();
  } catch (e) {}
  try { return JSON.parse(fs.readFileSync(path.join(root, "content", "imoveis.json"), "utf8")); } catch (e) { return []; }
}

module.exports = async (req, res) => {
  const root = process.cwd();
  let html = fs.readFileSync(path.join(root, "imovel.html"), "utf8");
  const imoveis = await loadImoveis(root);
  const id = String((req.query && req.query.id) || "");
  const i = (imoveis || []).find((x) => x && x.id === id && x.publicado !== false);

  if (i) {
    const title = i.titulo + " | Andréa Meirelles";
    const desc = [i.subtitulo, [i.tipo, i.cidade].filter(Boolean).join(" em "), i.area].filter(Boolean).join(" · ");
    const img = i.capa ? (/^https?:/.test(i.capa) ? i.capa : REPO_RAW + i.capa) : SITE + "/andrea-meirelles.jpg";
    const url = SITE + "/imovel/" + encodeURIComponent(i.id);
    const meta =
      '<meta property="og:type" content="website">\n' +
      '<meta property="og:title" content="' + esc(i.titulo) + '">\n' +
      '<meta property="og:description" content="' + esc(desc) + '">\n' +
      '<meta property="og:image" content="' + esc(img) + '">\n' +
      '<meta property="og:url" content="' + esc(url) + '">\n' +
      '<meta name="twitter:card" content="summary_large_image">\n';
    html = html
      .replace(/<title>[^<]*<\/title>/, "<title>" + esc(title) + "</title>")
      .replace(/<meta name="description"[^>]*>/, '<meta name="description" content="' + esc(desc) + '">')
      .replace(/<meta property="og:[^>]*>\n?/g, "")
      .replace("</head>", meta + "</head>");
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=120");
  res.status(200).send(html);
};
