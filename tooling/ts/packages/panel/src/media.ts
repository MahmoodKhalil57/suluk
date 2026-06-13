/** Media / upload field — a URL input with an image preview and (when an upload endpoint is configured) a file
 *  picker that POSTs the file and writes back the returned URL. The text input IS the form field, so the value
 *  stays a plain URL string; if no upload endpoint is set the widget degrades to paste-a-URL. Storage is the host's
 *  concern (e.g. an R2-backed worker route) — the panel just drives `multipart/form-data` to `window.__pfUpload`. */
const esc = (s: unknown): string => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const IMG = /\.(png|jpe?g|svg|webp|gif|avif)(\?|$)/i;
/** Only render URLs we'd be safe putting in an href/src: absolute http(s) or app-relative (`/media/…`). A stored
 *  `javascript:`/`data:`/protocol-relative value returns "" so the preview shows inert text, not a clickable XSS. */
const safeUrl = (u: unknown): string => { const s = String(u ?? ""); return /^(https?:\/\/|\/[^/\\])/i.test(s) ? s : ""; }; // exclude `\` too: browsers normalize a leading `/\` to `//` (open-redirect)

export function mediaEditor(name: string, value: unknown = "", attrs = ""): string {
  const v = String(value ?? "");
  const safe = safeUrl(v);
  const prev = !v
    ? `<span class="pf-muted">No file</span>`
    : !safe
      ? `<span class="pf-muted" title="Blocked: only http(s) or app-relative URLs are previewed">${esc(v)}</span>`
      : IMG.test(safe) ? `<img src="${esc(safe)}" alt="Preview"/>` : `<a href="${esc(safe)}" target="_blank" rel="noopener">${esc(safe)}</a>`;
  return `<div class="pf-media" data-media>
    <div class="pf-media-prev" data-prev>${prev}</div>
    <div class="pf-media-row">
      <input type="text" class="pf-input" id="pf-${esc(name)}" name="${esc(name)}" value="${esc(v)}" placeholder="https://… or upload a file"${attrs} data-url/>
      <label class="pf-btn pf-media-up">Upload<input type="file" accept="image/*" hidden data-file/></label>
    </div>
    <small class="pf-media-msg" data-msg role="status" aria-live="polite"></small>
  </div>`;
}

/** Client init for every `[data-media]`: live preview on URL change + (if window.__pfUpload is set) upload on file
 *  pick. Without an endpoint the Upload button hides and it's URL-only. Include once per page that has media fields. */
export function mediaScript(): string {
  return `(function(){
  var up=window.__pfUpload;
  function img(s){return /\\.(png|jpe?g|svg|webp|gif|avif)(\\?|$)/i.test(s);}
  function safe(u){var s=String(u==null?"":u);return /^(https?:\\/\\/|\\/[^\\/\\\\])/i.test(s)?s:"";}
  function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;"})[c];});}
  document.querySelectorAll("[data-media]").forEach(function(m){
    var url=m.querySelector("[data-url]"),file=m.querySelector("[data-file]"),prev=m.querySelector("[data-prev]"),msg=m.querySelector("[data-msg]"),lab=m.querySelector(".pf-media-up");
    function render(){var v=url.value,s=safe(v);prev.innerHTML=!v?'<span class="pf-muted">No file</span>':!s?'<span class="pf-muted" title="Blocked URL scheme">'+esc(v)+'</span>':(img(s)?'<img src="'+esc(s)+'" alt="Preview"/>':'<a href="'+esc(s)+'" target="_blank" rel="noopener">'+esc(s)+'</a>');}
    url.addEventListener("input",render);
    if(!up){if(lab)lab.style.display="none";return;}
    file.addEventListener("change",function(){var f=file.files&&file.files[0];if(!f)return;
      if(f.size>5*1024*1024){msg.textContent="File too large (max 5 MB).";file.value="";return;}
      msg.textContent="Uploading…";var fd=new FormData();fd.append("file",f);
      fetch(up,{method:"POST",credentials:"same-origin",body:fd}).then(function(r){return r.ok?r.json():r.json().catch(function(){return{};}).then(function(d){throw new Error((d&&d.error)||("HTTP "+r.status));});})
        .then(function(d){url.value=d.url;render();msg.textContent="Uploaded ✓";}).catch(function(e){msg.textContent="Upload failed: "+e.message;}).then(function(){file.value="";});
    });
  });
})();`;
}

export const MEDIA_CSS = `
  .pf-media{display:flex;flex-direction:column;gap:8px}
  .pf-media-prev{border:1px dashed var(--line);border-radius:10px;min-height:64px;display:flex;align-items:center;justify-content:center;padding:10px;background:var(--bg-soft);overflow:hidden}
  .pf-media-prev img{max-height:140px;max-width:100%;border-radius:8px;display:block}
  .pf-media-row{display:flex;gap:8px;align-items:center}.pf-media-row .pf-input{flex:1}
  .pf-media-up{cursor:pointer;white-space:nowrap}.pf-media-msg{color:var(--muted);min-height:14px}
`;
