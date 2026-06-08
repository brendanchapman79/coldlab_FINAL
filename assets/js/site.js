// Load nav/footer
async function injectPartial(id, path) {
  try {
    const el = document.getElementById(id);
    if (!el) return;

    const r = await fetch(path);
    if (!r.ok) throw new Error(`Failed to load ${path}`);

    el.innerHTML = await r.text();
  } catch (e) {
    console.error(e);
  }
}


// Convert markdown to HTML
function renderHtmlFromMarkdown(md) {
  if (typeof marked === "undefined") {
    console.error("marked.js not loaded");
    return md; // fail safe: return raw text
  }
  return marked.parse(md);
}



// Load markdown file and display it
async function renderMarkdownFile(targetId, path) {
  const el = document.getElementById(targetId);
  if (!el) return;

  try {
    const r = await fetch(path);
    if (!r.ok) throw new Error(`Failed to load ${path}`);

    const text = await r.text();
    el.innerHTML = renderHtmlFromMarkdown(text);
  } catch (e) {
    console.error(e);
  }
}
