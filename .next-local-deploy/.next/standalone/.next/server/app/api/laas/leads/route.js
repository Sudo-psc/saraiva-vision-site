"use strict";(()=>{var a={};a.id=3183,a.ids=[3183],a.modules={261:a=>{a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},4841:(a,b,c)=>{c.r(b),c.d(b,{handler:()=>M,patchFetch:()=>L,routeModule:()=>H,serverHooks:()=>K,workAsyncStorage:()=>I,workUnitAsyncStorage:()=>J});var d={};c.r(d),c.d(d,{OPTIONS:()=>E,POST:()=>D,dynamic:()=>G,runtime:()=>F});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641),v=c(28342),w=c(45711);let x=w.Ik({nome:w.Yj().min(2,"Nome deve ter no m\xednimo 2 caracteres").max(100,"Nome deve ter no m\xe1ximo 100 caracteres").regex(/^[a-zA-ZÀ-ÿ\s'-]+$/,"Nome cont\xe9m caracteres inv\xe1lidos"),whatsapp:w.Yj().regex(/^(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\s?)?\d{4}[-\s]?\d{4}$/,"WhatsApp inv\xe1lido. Use formato: (33) 99999-9999").transform(a=>a.replace(/\D/g,"")),email:w.Yj().email("Email inv\xe1lido").max(255,"Email muito longo").toLowerCase(),lgpdConsent:w.zM().refine(a=>!0===a,{message:"Voc\xea deve concordar com a Pol\xedtica de Privacidade"}),honeypot:w.Yj().optional()});var y=c(79626);let z=new v.u(process.env.RESEND_API_KEY),A=new Map,B=process.env.CONTACT_TO_EMAIL||"philipe_cruz@outlook.com",C=process.env.CONTACT_EMAIL_FROM||"contato@saraivavision.com.br";async function D(a){try{let b=a.headers.get("x-forwarded-for")?.split(",")[0]||a.headers.get("x-real-ip")||"unknown",c=(0,y.Eb)(b,5,6e5,A);if(!c.allowed)return u.NextResponse.json({success:!1,error:"Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",code:"RATE_LIMIT_EXCEEDED",message:""},{status:429,headers:{"X-RateLimit-Limit":String(5),"X-RateLimit-Remaining":String(c.remaining),"X-RateLimit-Reset":String(c.resetAt)}});let d=await a.json();if(d.honeypot&&""!==d.honeypot.trim())return console.log("LAAS spam detected via honeypot:",(0,y.nX)(d)),u.NextResponse.json({success:!0,message:"Obrigado! Em breve entraremos em contato para calcular sua economia."},{status:200});let e=x.safeParse(d);if(!e.success)return u.NextResponse.json({success:!1,error:"Dados inv\xe1lidos. Verifique os campos e tente novamente.",message:""},{status:400});let{nome:f,whatsapp:g,email:h}=e.data,i={monthly:80,yearly:960},j=function({nome:a,email:b,whatsapp:c,estimatedSavings:d}){return`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova Lead LAAS</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
      margin: -30px -30px 20px -30px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .field {
      margin-bottom: 20px;
    }
    .label {
      font-weight: 600;
      color: #555;
      display: block;
      margin-bottom: 5px;
    }
    .value {
      color: #333;
      font-size: 15px;
    }
    .savings-box {
      background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
      padding: 20px;
      border-left: 4px solid #22C55E;
      border-radius: 4px;
      margin-top: 20px;
    }
    .savings-box h3 {
      margin: 0 0 10px 0;
      color: #16A34A;
    }
    .savings-item {
      margin: 10px 0;
    }
    .savings-value {
      font-size: 24px;
      font-weight: 700;
      color: #15803D;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #999;
      text-align: center;
    }
    .cta-button {
      display: inline-block;
      background-color: #4F46E5;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Nova Lead LAAS</h1>
    </div>

    <div class="field">
      <span class="label">Nome:</span>
      <span class="value">${a}</span>
    </div>

    <div class="field">
      <span class="label">Email:</span>
      <span class="value"><a href="mailto:${b}">${b}</a></span>
    </div>

    <div class="field">
      <span class="label">WhatsApp:</span>
      <span class="value"><a href="https://wa.me/55${c}">+55 ${c}</a></span>
    </div>

    <div class="savings-box">
      <h3>💵 Economia Estimada</h3>
      <div class="savings-item">
        <div class="label">Economia Mensal:</div>
        <div class="savings-value">R$ ${d.monthly.toFixed(2)}</div>
      </div>
      <div class="savings-item">
        <div class="label">Economia Anual:</div>
        <div class="savings-value">R$ ${d.yearly.toFixed(2)}</div>
      </div>
    </div>

    <a href="https://wa.me/55${c}" class="cta-button">Entrar em Contato via WhatsApp</a>

    <div class="footer">
      <p>Recebido em: ${new Date().toLocaleString("pt-BR",{timeZone:"America/Sao_Paulo"})}</p>
      <p>Saraiva Vision - LAAS (Lentes As A Service) | Caratinga, MG</p>
    </div>
  </div>
</body>
</html>
  `.trim()}({nome:f,email:h,whatsapp:g,estimatedSavings:i}),k=`
Nova Lead LAAS - Calculadora de Economia

Nome: ${f}
Email: ${h}
WhatsApp: +55 ${g}

Economia Estimada:
- Mensal: R$ ${i.monthly.toFixed(2)}
- Anual: R$ ${i.yearly.toFixed(2)}

---
Recebido em: ${new Date().toLocaleString("pt-BR",{timeZone:"America/Sao_Paulo"})}
IP: ${b}
    `.trim(),l=await z.emails.send({from:C,to:B,subject:`💰 Nova Lead LAAS: ${f}`,html:j,text:k,replyTo:h,tags:[{name:"source",value:"laas-landing"},{name:"type",value:"lead-calculator"}]});if(l.error)throw console.error("Resend API Error (LAAS):",l.error),Error("Falha ao enviar email");return console.log("LAAS lead captured:",{id:l.data?.id,email:(0,y.nX)({email:h}).email,timestamp:new Date().toISOString()}),u.NextResponse.json({success:!0,message:"Obrigado! Em breve entraremos em contato para calcular sua economia.",leadId:l.data?.id,estimatedSavings:i},{status:200})}catch(a){if(console.error("LAAS Lead API Error:",a),a.message?.includes("API key"))return u.NextResponse.json({success:!1,error:"Erro de configura\xe7\xe3o do servidor. Entre em contato por telefone.",code:"CONFIG_ERROR",message:""},{status:500});return u.NextResponse.json({success:!1,error:"Erro ao processar sua solicita\xe7\xe3o. Tente novamente em alguns minutos.",code:"INTERNAL_ERROR",message:""},{status:500})}}async function E(){return new u.NextResponse(null,{status:200,headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type, Authorization"}})}let F="nodejs",G="force-dynamic",H=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/laas/leads/route",pathname:"/api/laas/leads",filename:"route",bundlePath:"app/api/laas/leads/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/home/saraiva-vision-site/app/api/laas/leads/route.ts",nextConfigOutput:"standalone",userland:d}),{workAsyncStorage:I,workUnitAsyncStorage:J,serverHooks:K}=H;function L(){return(0,g.patchFetch)({workAsyncStorage:I,workUnitAsyncStorage:J})}async function M(a,b,c){var d;let e="/api/laas/leads/route";"/index"===e&&(e="/");let g=await H.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:y,routerServerContext:z,isOnDemandRevalidate:A,revalidateOnlyGenerated:B,resolvedPathname:C}=g,D=(0,j.normalizeAppPath)(e),E=!!(y.dynamicRoutes[D]||y.routes[C]);if(E&&!x){let a=!!y.routes[C],b=y.dynamicRoutes[D];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let F=null;!E||H.isDev||x||(F="/index"===(F=C)?"/":F);let G=!0===H.isDev||!E,I=E&&!G,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:y,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:G,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>H.onRequestError(a,b,d,z)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>H.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&A&&B&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!E)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await H.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:A})},z),b}},l=await H.handleResponse({req:a,nextConfig:w,cacheKey:F,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:A,revalidateOnlyGenerated:B,responseGenerator:k,waitUntil:c.waitUntil});if(!E)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",A?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&E||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await H.onRequestError(a,b,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:A})}),E)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},10846:a=>{a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},19121:a=>{a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},29294:a=>{a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:a=>{a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:a=>{a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},86439:a=>{a.exports=require("next/dist/shared/lib/no-fallback-error.external")}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[4586,1692,5711,6427],()=>b(b.s=4841));module.exports=c})();