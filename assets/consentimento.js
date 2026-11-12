/* Selo discreto de cookies (caminho 2, decisão do Felipe em 03/11/2026): a medição liga sozinha
   (interesse legítimo, explicado na política de privacidade) e quem quiser recusa no selo.
   Trocar CHAVE_DO_PROJETO pela chave pública do PostHog (começa com phc_). */
(function () {
  var CHAVE = "phc_CKJ9YxwKWgDQ5dVswnPPFhAEEFQuRtESUdXxbfKMVmf5";
  var HOST = "https://eu.i.posthog.com"; // servidor na Europa
  var GUARDA = "consentimento_cookies"; // "aceito" ou "recusado"

  function lerEscolha() { try { return localStorage.getItem(GUARDA); } catch (e) { return null; } }
  function salvarEscolha(v) { try { localStorage.setItem(GUARDA, v); } catch (e) {} }

  function carregarPostHog() {
    if (window.posthog || CHAVE === "CHAVE_DO_PROJETO") return;
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    window.posthog.init(CHAVE, {
      api_host: HOST,
      person_profiles: "identified_only",          // visitante anônimo, sem perfil pessoal
      capture_pageview: true,
      session_recording: { maskAllInputs: true }   // campos digitados nunca aparecem na gravação
    });
  }

  function ligarGoogle() { window.gtag && window.gtag("consent", "update", { analytics_storage: "granted" }); }
  function desligarTudo() {
    window.posthog && window.posthog.opt_out_capturing && window.posthog.opt_out_capturing();
    window.gtag && window.gtag("consent", "update", { analytics_storage: "denied" });
  }

  // Clique no WhatsApp vira evento próprio (a métrica que mais importa)
  document.addEventListener("click", function (ev) {
    var a = ev.target.closest && ev.target.closest('a[href*="wa.me"]');
    if (!a || lerEscolha() === "recusado") return;
    var dados = { pagina: location.pathname, numero: a.href.indexOf("998472986") > -1 ? "secretaria" : "pessoal", origem: a.getAttribute("data-origem") || "outro" };
    window.posthog && window.posthog.capture("clique_whatsapp", dados);
    window.gtag && window.gtag("event", "clique_whatsapp", dados);
  });

  function fechar() { var b = document.getElementById("aviso-cookies"); b && b.remove(); }

  function mostrarSelo() {
    var b = document.createElement("div");
    b.id = "aviso-cookies";
    b.setAttribute("role", "status");
    b.style.cssText = "position:fixed;left:10px;bottom:64px;z-index:9999;max-width:300px;" +
      "background:rgba(15,31,61,.94);color:#fff;border:1px solid #c9a24a;border-radius:10px;padding:8px 10px;" +
      "font:12px/1.4 system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.2)";
    b.innerHTML = "Este site usa cookies de estatística. " +
      "<a href='/privacidade' style='color:#c9a24a'>Saiba mais</a> · " +
      "<button id='cookies-recusar' style='background:none;border:0;color:#fff;text-decoration:underline;cursor:pointer;font:inherit;padding:0'>Recusar</button> " +
      "<button id='cookies-ok' style='margin-left:6px;background:#c9a24a;color:#0f1f3d;border:0;border-radius:6px;padding:2px 8px;font:inherit;font-weight:600;cursor:pointer'>OK</button>";
    document.body.appendChild(b);
    document.getElementById("cookies-ok").onclick = function () { salvarEscolha("aceito"); fechar(); };
    document.getElementById("cookies-recusar").onclick = function () { salvarEscolha("recusado"); desligarTudo(); fechar(); };
  }

  function iniciar() {
    var escolha = lerEscolha();
    if (escolha === "recusado") { desligarTudo(); return; }
    carregarPostHog();
    ligarGoogle();
    if (escolha !== "aceito") mostrarSelo();
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", iniciar) : iniciar();
})();
