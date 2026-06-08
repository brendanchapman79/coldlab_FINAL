// Load nav/footer
async function injectPartial(id, path) {
  const el = document.getElementById(id);
  if (!el) return;

  const html = await fetch(path).then(r => r.text());
  el.innerHTML = html;
}


// Convert markdown to HTML
function renderHtmlFromMarkdown(md) {
  return marked.parse(md);
}


// Load markdown file and display it
async function renderMarkdownFile(targetId, path) {
  const el = document.getElementById(targetId);
  if (!el) return;

  const text = await fetch(path).then(r => r.text());

  el.innerHTML = renderHtmlFromMarkdown(text);
}