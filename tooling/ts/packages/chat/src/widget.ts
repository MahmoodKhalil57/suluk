/**
 * widget.ts — a framework-agnostic floating chat widget, returned as ONE injectable HTML string (style + markup +
 * script). Drop `chatWidget()` before </body> on any page whose backend mounts `chatApp`. Theme-aware via the suluk
 * CSS-var vocabulary (--accent/--panel/--fg/--line/--muted, with safe fallbacks), streams the agent's reply token by
 * token, shows tool-activity chips, renders XSS-safe markdown, and is keyboard + screen-reader accessible.
 */
declare global {
  interface Window {
    /** Browser-executed tools the host page registers: `[{ name, description, parameters, run(args) }]`. The widget
     *  sends each tool's DEFINITION (name/description/parameters) to the server and calls `run` when the model invokes it. */
    __sulukChatTools?: { name: string; description: string; parameters: object; run: (args: Record<string, unknown>) => unknown }[];
    /** Returns a snapshot of relevant browser state (cart, theme, path …) sent with each turn as read-only context. */
    __sulukChatContext?: () => unknown;
  }
}

export interface ChatWidgetOptions {
  /** Where chatApp is mounted (default /chat). */
  endpoint?: string;
  /** Panel header + launcher aria-label. */
  title?: string;
  /** First assistant line shown when the panel opens (overridden by GET {endpoint}/info if it returns a greeting). */
  greeting?: string;
  placeholder?: string;
}

const esc = (s: string): string => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

export function chatWidget(opts: ChatWidgetOptions = {}): string {
  const endpoint = (opts.endpoint ?? "/chat").replace(/\/$/, "");
  const title = esc(opts.title ?? "Assistant");
  const greeting = esc(opts.greeting ?? "Hi! Ask me anything about this site — I can search, recommend, and help you get things done.");
  const placeholder = esc(opts.placeholder ?? "Ask anything…");

  return `<style>${CSS}</style>
<div id="sk-chat" data-endpoint="${esc(endpoint)}">
  <button id="sk-chat-launch" class="sk-chat-launch" aria-label="Open ${title}" aria-expanded="false" aria-controls="sk-chat-panel">
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M12 3c5 0 9 3.36 9 7.5S17 18 12 18a10 10 0 0 1-2.6-.34L4 19l1.1-3.3A6.8 6.8 0 0 1 3 10.5C3 6.36 7 3 12 3Z"/></svg>
    <span class="sk-chat-launch-dot" hidden></span>
  </button>
  <section id="sk-chat-panel" class="sk-chat-panel" role="dialog" aria-label="${title}" aria-modal="false" hidden>
    <header class="sk-chat-head">
      <span class="sk-chat-title"><span class="sk-chat-orb"></span>${title}</span>
      <button id="sk-chat-close" class="sk-chat-x" aria-label="Close ${title}">&times;</button>
    </header>
    <div id="sk-chat-log" class="sk-chat-log" role="log" aria-live="polite" aria-label="Conversation"></div>
    <form id="sk-chat-form" class="sk-chat-form">
      <textarea id="sk-chat-input" class="sk-chat-input" rows="1" placeholder="${placeholder}" aria-label="Message" autocomplete="off"></textarea>
      <button type="submit" id="sk-chat-send" class="sk-chat-send" aria-label="Send">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M3 11.5 21 3l-8.5 18-2.2-7.3L3 11.5Z"/></svg>
      </button>
    </form>
    <p class="sk-chat-foot">AI can make mistakes — verify important details.</p>
  </section>
</div>
<script>${script(endpoint, greeting)}</script>`;
}

const CSS = `
#sk-chat{--c-accent:var(--accent,#6d28d9);--c-on:var(--on-accent,#fff);--c-panel:var(--panel,#fff);--c-bg:var(--bg-soft,#f4f4f5);--c-fg:var(--fg,#18181b);--c-muted:var(--muted,#71717a);--c-line:var(--line,#e4e4e7);position:fixed;inset:auto 0 0 auto;z-index:2147483000;font:14px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
.sk-chat-launch{position:fixed;right:20px;bottom:20px;width:56px;height:56px;border-radius:999px;border:none;background:var(--c-accent);color:var(--c-on);display:grid;place-items:center;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.25);transition:transform .15s ease,box-shadow .15s ease}
.sk-chat-launch:hover{transform:translateY(-2px) scale(1.04)}
.sk-chat-launch:focus-visible{outline:3px solid var(--c-accent);outline-offset:3px}
.sk-chat-launch-dot{position:absolute;top:10px;right:10px;width:9px;height:9px;border-radius:999px;background:#ef4444;box-shadow:0 0 0 2px var(--c-accent)}
.sk-chat-panel{position:fixed;right:20px;bottom:88px;width:380px;max-width:calc(100vw - 32px);height:min(580px,calc(100vh - 120px));background:var(--c-panel);color:var(--c-fg);border:1px solid var(--c-line);border-radius:18px;box-shadow:0 24px 60px rgba(0,0,0,.28);display:flex;flex-direction:column;overflow:hidden;transform:translateY(12px) scale(.98);opacity:0;transition:transform .18s ease,opacity .18s ease}
.sk-chat-panel.sk-open{transform:none;opacity:1}
.sk-chat-panel[hidden]{display:none}
.sk-chat-head{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid var(--c-line);background:linear-gradient(180deg,color-mix(in oklab,var(--c-accent) 10%,var(--c-panel)),var(--c-panel))}
.sk-chat-title{display:flex;align-items:center;gap:8px;font-weight:650}
.sk-chat-orb{width:10px;height:10px;border-radius:999px;background:var(--c-accent);box-shadow:0 0 0 3px color-mix(in oklab,var(--c-accent) 25%,transparent)}
.sk-chat-x{border:none;background:none;font-size:24px;line-height:1;color:var(--c-muted);cursor:pointer;padding:0 4px;border-radius:8px}
.sk-chat-x:hover{color:var(--c-fg)}
.sk-chat-log{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}
.sk-msg{max-width:85%;padding:9px 12px;border-radius:14px;white-space:normal;overflow-wrap:anywhere}
.sk-msg.user{align-self:flex-end;background:var(--c-accent);color:var(--c-on);border-bottom-right-radius:4px}
.sk-msg.assistant{align-self:flex-start;background:var(--c-bg);color:var(--c-fg);border-bottom-left-radius:4px}
.sk-msg.error{align-self:flex-start;background:#fef2f2;color:#991b1b;border:1px solid #fecaca}
.sk-msg a{color:inherit;text-decoration:underline}
.sk-msg p{margin:0 0 6px}.sk-msg p:last-child{margin:0}.sk-msg code{background:rgba(0,0,0,.08);padding:1px 5px;border-radius:5px;font-size:.92em}
.sk-msg ul{margin:4px 0;padding-inline-start:18px}
.sk-tools{align-self:flex-start;display:flex;flex-wrap:wrap;gap:6px}
.sk-chip{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--c-muted);background:var(--c-bg);border:1px solid var(--c-line);border-radius:999px;padding:3px 9px}
.sk-chip.run .sk-chip-dot{animation:sk-pulse 1s infinite}
.sk-chip-dot{width:7px;height:7px;border-radius:999px;background:var(--c-accent)}
.sk-chip.done{opacity:.75}.sk-chip.fail .sk-chip-dot{background:#ef4444}
@keyframes sk-pulse{0%,100%{opacity:.3}50%{opacity:1}}
.sk-typing{display:inline-flex;gap:3px}.sk-typing i{width:6px;height:6px;border-radius:999px;background:var(--c-muted);animation:sk-pulse 1s infinite}.sk-typing i:nth-child(2){animation-delay:.15s}.sk-typing i:nth-child(3){animation-delay:.3s}
.sk-chat-form{display:flex;gap:8px;padding:10px;border-top:1px solid var(--c-line);align-items:flex-end}
.sk-chat-input{flex:1;resize:none;max-height:120px;border:1px solid var(--c-line);border-radius:12px;padding:9px 11px;font:inherit;color:var(--c-fg);background:var(--c-panel)}
.sk-chat-input:focus{outline:none;border-color:var(--c-accent);box-shadow:0 0 0 3px color-mix(in oklab,var(--c-accent) 20%,transparent)}
.sk-chat-send{flex:none;width:40px;height:40px;border:none;border-radius:12px;background:var(--c-accent);color:var(--c-on);display:grid;place-items:center;cursor:pointer}
.sk-chat-send:disabled{opacity:.5;cursor:not-allowed}
.sk-chat-foot{margin:0;padding:0 12px 8px;font-size:11px;color:var(--c-muted);text-align:center}
@media (max-width:480px){.sk-chat-panel{right:8px;left:8px;width:auto;bottom:84px;height:min(70vh,560px)}.sk-chat-launch{right:14px;bottom:14px}}
@media (prefers-reduced-motion:reduce){.sk-chat-panel,.sk-chat-launch{transition:none}.sk-chip.run .sk-chip-dot,.sk-typing i{animation:none}}
`;

/** JSON-encode a config value for safe embedding inside an inline <script>: neutralizes `</script>` / `<!--`, which
 *  JSON.stringify leaves intact and the HTML parser would otherwise act on. */
const jsConst = (v: string): string => JSON.stringify(v).replace(/</g, "\\u003c");

/** Runtime — deliberately uses quotes + concatenation (no template literals) so the generator only interpolates the
 *  two config values below, each `jsConst`-encoded so a hostile option can't break out of the script element. */
function script(endpoint: string, greeting: string): string {
  return `(function(){
  var EP=${jsConst(endpoint)}, GREET=${jsConst(greeting)};
  var root=document.getElementById("sk-chat"), launch=document.getElementById("sk-chat-launch"), panel=document.getElementById("sk-chat-panel");
  var closeBtn=document.getElementById("sk-chat-close"), log=document.getElementById("sk-chat-log"), form=document.getElementById("sk-chat-form");
  var input=document.getElementById("sk-chat-input"), send=document.getElementById("sk-chat-send");
  var history=[], busy=false, opened=false, greetSent=false;
  try{ history=JSON.parse(sessionStorage.getItem("sk-chat")||"[]")||[]; }catch(e){ history=[]; }

  function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return ({"&":"&amp;","<":"&lt;",">":"&gt;","\\"":"&quot;"})[c];});}
  function safeUrl(u){var s=String(u==null?"":u).trim();return /^(https?:\\/\\/|\\/[^\\/\\\\]|mailto:)/i.test(s)?s:"";}
  function md(t){
    var lines=esc(t).split(/\\n/), html="", inList=false;
    function inline(s){
      return s.replace(/\\[([^\\]]+)\\]\\(([^)\\s]+)\\)/g,function(_,tx,u){var s2=safeUrl(u);return s2?'<a href="'+s2+'" target="_blank" rel="noopener nofollow">'+tx+'</a>':tx;})
              .replace(/\\*\\*([^*]+)\\*\\*/g,"<strong>$1</strong>").replace(/\`([^\`]+)\`/g,"<code>$1</code>").replace(/(^|[^*])\\*([^*]+)\\*/g,"$1<em>$2</em>");
    }
    for(var i=0;i<lines.length;i++){var ln=lines[i];
      if(/^\\s*[-*]\\s+/.test(ln)){ if(!inList){html+="<ul>";inList=true;} html+="<li>"+inline(ln.replace(/^\\s*[-*]\\s+/,""))+"</li>"; continue; }
      if(inList){html+="</ul>";inList=false;}
      if(ln.trim()) html+="<p>"+inline(ln)+"</p>";
    }
    if(inList)html+="</ul>";
    return html||"<p></p>";
  }
  function persist(){ try{ sessionStorage.setItem("sk-chat",JSON.stringify(history.slice(-40))); }catch(e){} }
  function scroll(){ log.scrollTop=log.scrollHeight; }
  function bubble(role){ var d=document.createElement("div"); d.className="sk-msg "+role; log.appendChild(d); scroll(); return d; }
  function renderHistory(){ log.innerHTML=""; if(!history.length){ var g=bubble("assistant"); g.innerHTML=md(GREET); } else history.forEach(function(m){ bubble(m.role).innerHTML=md(m.content); }); }

  function open(){ panel.hidden=false; requestAnimationFrame(function(){panel.classList.add("sk-open");}); launch.setAttribute("aria-expanded","true"); opened=true; if(!greetSent){renderHistory();greetSent=true;} setTimeout(function(){input.focus();},60); scroll(); }
  function close(){ panel.classList.remove("sk-open"); launch.setAttribute("aria-expanded","false"); setTimeout(function(){panel.hidden=true;},180); launch.focus(); }
  launch.addEventListener("click",function(){ panel.hidden?open():close(); });
  closeBtn.addEventListener("click",close);
  document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&!panel.hidden)close(); });
  input.addEventListener("input",function(){ input.style.height="auto"; input.style.height=Math.min(input.scrollHeight,120)+"px"; });
  input.addEventListener("keydown",function(e){ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); form.requestSubmit(); } });

  function setBusy(b){ busy=b; send.disabled=b; input.disabled=b; }

  form.addEventListener("submit",function(e){ e.preventDefault(); if(busy)return; var text=input.value.trim(); if(!text)return;
    input.value=""; input.style.height="auto";
    history.push({role:"user",content:text}); bubble("user").innerHTML=md(text); persist(); setBusy(true);
    var asst=bubble("assistant"); var typing=document.createElement("span"); typing.className="sk-typing"; typing.innerHTML="<i></i><i></i><i></i>"; asst.appendChild(typing);
    var acc="", toolsRow=null, chips={};
    function ensureTools(){ if(!toolsRow){ toolsRow=document.createElement("div"); toolsRow.className="sk-tools"; log.insertBefore(toolsRow,asst); } return toolsRow; }
    function onEvent(ev,data){
      if(ev==="text"){ if(typing.parentNode)typing.remove(); acc+=(data.delta||""); asst.innerHTML=md(acc); scroll(); }
      else if(ev==="tool"){ var key=data.name+(data.phase==="start"?"":"");
        if(data.phase==="start"){ var c=document.createElement("span"); c.className="sk-chip run"; c.innerHTML='<span class="sk-chip-dot"></span>'+esc(data.name); ensureTools().appendChild(c); chips[data.name]=c; }
        else { var ch=chips[data.name]; if(ch){ ch.className="sk-chip "+(data.ok===false?"fail":"done"); } } scroll(); }
      else if(ev==="client_tool"){ var c=document.createElement("span"); c.className="sk-chip done"; c.innerHTML='<span class="sk-chip-dot"></span>'+esc(data.name); ensureTools().appendChild(c); runClientTool(data.name,data.args||{}); scroll(); }
      else if(ev==="error"){ if(typing.parentNode)typing.remove(); asst.className="sk-msg error"; asst.textContent=(data.message||"Something went wrong."); scroll(); }
      else if(ev==="done"){ if(typing.parentNode)typing.remove(); if(acc){ history.push({role:"assistant",content:acc}); persist(); } }
    }
    streamPost(history.slice(),onEvent).then(function(){ setBusy(false); if(!acc&&!asst.classList.contains("error")){ asst.className="sk-msg error"; asst.textContent="No response."; } input.focus(); })
      .catch(function(err){ setBusy(false); if(typing.parentNode)typing.remove(); asst.className="sk-msg error"; asst.textContent="Connection error: "+(err&&err.message||err); });
  });

  // Browser-executed tools the page registers on window.__sulukChatTools = [{name,description,parameters,run}].
  // We send only the DEFINITIONS to the server; run() executes locally when the model calls one.
  function clientToolDefs(){ var t=window.__sulukChatTools; if(!Array.isArray(t))return []; return t.map(function(x){return {name:x.name,description:x.description,parameters:x.parameters};}); }
  function clientContext(){ try{ return (typeof window.__sulukChatContext==="function")?window.__sulukChatContext():null; }catch(e){ return null; } }
  function runClientTool(name,args){ var t=window.__sulukChatTools; if(!Array.isArray(t))return; var tool=t.filter(function(x){return x&&x.name===name;})[0];
    if(tool&&typeof tool.run==="function"){ try{ Promise.resolve(tool.run(args)).catch(function(){}); }catch(e){} } }

  function streamPost(messages,onEvent){
    return fetch(EP,{method:"POST",headers:{"content-type":"application/json"},credentials:"same-origin",body:JSON.stringify({messages:messages,clientTools:clientToolDefs(),clientContext:clientContext()})}).then(function(res){
      if(!res.ok){ return res.json().catch(function(){return {error:"HTTP "+res.status};}).then(function(j){ onEvent("error",{message:j.error||("HTTP "+res.status)}); }); }
      if(!res.body)return; var reader=res.body.getReader(), dec=new TextDecoder(), buf="";
      function pump(){ return reader.read().then(function(r){ if(r.done){flush();return;} buf+=dec.decode(r.value,{stream:true});
        var idx; while((idx=buf.indexOf("\\n\\n"))>=0){ var block=buf.slice(0,idx); buf=buf.slice(idx+2); handle(block); } return pump(); }); }
      function flush(){ if(buf.trim())handle(buf); }
      function handle(block){ var ev="message", data=""; block.split(/\\n/).forEach(function(l){ if(l.indexOf("event:")===0)ev=l.slice(6).trim(); else if(l.indexOf("data:")===0)data+=l.slice(5).trim(); });
        if(!data)return; var parsed; try{parsed=JSON.parse(data);}catch(e){return;} onEvent(ev,parsed); }
      return pump();
    });
  }

  // optional: pull the configured greeting + show the unread dot until first open
  fetch(EP+"/info",{credentials:"same-origin"}).then(function(r){return r.ok?r.json():null;}).then(function(info){ if(info&&info.greeting&&!history.length)GREET=info.greeting; var dot=launch.querySelector(".sk-chat-launch-dot"); if(dot&&!opened)dot.hidden=false; launch.addEventListener("click",function(){var d=launch.querySelector(".sk-chat-launch-dot");if(d)d.hidden=true;}); }).catch(function(){});
})();`;
}
