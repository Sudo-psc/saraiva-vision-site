"use strict";(()=>{var a={};a.id=8746,a.ids=[8746],a.modules={261:a=>{a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:a=>{a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},19121:a=>{a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},29294:a=>{a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33885:(a,b,c)=>{c.r(b),c.d(b,{handler:()=>M,patchFetch:()=>L,routeModule:()=>H,serverHooks:()=>K,workAsyncStorage:()=>I,workUnitAsyncStorage:()=>J});var d={};c.r(d),c.d(d,{OPTIONS:()=>E,POST:()=>D,dynamic:()=>G,runtime:()=>F});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641),v=c(28342),w=c(79626);let x=new v.u(process.env.RESEND_API_KEY),y=new Map,z=parseInt(process.env.RATE_LIMIT_MAX||"10",10),A=parseInt(process.env.RATE_LIMIT_WINDOW||"600000",10),B=process.env.CONTACT_TO_EMAIL||"philipe_cruz@outlook.com",C=process.env.CONTACT_EMAIL_FROM||"contato@saraivavision.com.br";async function D(a){try{let b=a.headers.get("x-forwarded-for")?.split(",")[0]||a.headers.get("x-real-ip")||"unknown",c=(0,w.Eb)(b,z,A,y);if(!c.allowed)return u.NextResponse.json({success:!1,error:"Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",code:"RATE_LIMIT_EXCEEDED"},{status:429,headers:{"X-RateLimit-Limit":String(z),"X-RateLimit-Remaining":String(c.remaining),"X-RateLimit-Reset":String(c.resetAt)}});let d=await a.json();if(d.honeypot&&""!==d.honeypot.trim())return console.log("Spam detected via honeypot:",(0,w.nX)(d)),u.NextResponse.json({success:!0,message:"Mensagem enviada com sucesso!"},{status:200});let e=w.qb.safeParse(d);if(!e.success)return u.NextResponse.json({success:!1,error:"Dados inv\xe1lidos. Verifique os campos e tente novamente.",details:e.error.flatten().fieldErrors},{status:400});let{name:f,email:g,phone:h,message:i}=e.data,j=function({name:a,email:b,phone:c,message:d}){return`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova Solicita\xe7\xe3o de Contato</title>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    .message-box {
      background-color: #f8f9fa;
      padding: 15px;
      border-left: 4px solid #667eea;
      border-radius: 4px;
      margin-top: 10px;
      white-space: pre-wrap;
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
      background-color: #667eea;
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
      <h1>📧 Nova Solicita\xe7\xe3o de Contato</h1>
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
      <span class="label">Telefone:</span>
      <span class="value"><a href="tel:+55${c}">+55 ${c}</a></span>
    </div>

    <div class="field">
      <span class="label">Mensagem:</span>
      <div class="message-box">${d}</div>
    </div>

    <a href="mailto:${b}" class="cta-button">Responder por Email</a>

    <div class="footer">
      <p>Recebido em: ${new Date().toLocaleString("pt-BR",{timeZone:"America/Sao_Paulo"})}</p>
      <p>Saraiva Vision - Cl\xednica Oftalmol\xf3gica | Caratinga, MG</p>
    </div>
  </div>
</body>
</html>
  `.trim()}({name:f,email:g,phone:h,message:i}),k=`
Nova Solicita\xe7\xe3o de Contato - Saraiva Vision

Nome: ${f}
Email: ${g}
Telefone: ${h}

Mensagem:
${i}

---
Recebido em: ${new Date().toLocaleString("pt-BR",{timeZone:"America/Sao_Paulo"})}
IP: ${b}
    `.trim(),l=await x.emails.send({from:C,to:B,subject:`📧 Novo Contato: ${f}`,html:j,text:k,replyTo:g,tags:[{name:"source",value:"website"},{name:"type",value:"contact-form"}]});if(l.error)throw console.error("Resend API Error:",l.error),Error("Falha ao enviar email");return console.log("Email enviado com sucesso:",{id:l.data?.id,to:B,from:(0,w.nX)({email:g}).email,timestamp:new Date().toISOString()}),u.NextResponse.json({success:!0,message:"Mensagem enviada com sucesso! Entraremos em contato em breve.",messageId:l.data?.id},{status:200})}catch(a){if(console.error("Contact API Error:",a),a.message?.includes("API key"))return u.NextResponse.json({success:!1,error:"Erro de configura\xe7\xe3o do servidor. Entre em contato por telefone.",code:"CONFIG_ERROR"},{status:500});return u.NextResponse.json({success:!1,error:"Erro ao processar sua solicita\xe7\xe3o. Tente novamente em alguns minutos.",code:"INTERNAL_ERROR"},{status:500})}}async function E(){return new u.NextResponse(null,{status:200,headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type, Authorization"}})}let F="nodejs",G="force-dynamic",H=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/contact/route",pathname:"/api/contact",filename:"route",bundlePath:"app/api/contact/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/home/saraiva-vision-site/app/api/contact/route.ts",nextConfigOutput:"standalone",userland:d}),{workAsyncStorage:I,workUnitAsyncStorage:J,serverHooks:K}=H;function L(){return(0,g.patchFetch)({workAsyncStorage:I,workUnitAsyncStorage:J})}async function M(a,b,c){var d;let e="/api/contact/route";"/index"===e&&(e="/");let g=await H.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:y,routerServerContext:z,isOnDemandRevalidate:A,revalidateOnlyGenerated:B,resolvedPathname:C}=g,D=(0,j.normalizeAppPath)(e),E=!!(y.dynamicRoutes[D]||y.routes[C]);if(E&&!x){let a=!!y.routes[C],b=y.dynamicRoutes[D];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let F=null;!E||H.isDev||x||(F="/index"===(F=C)?"/":F);let G=!0===H.isDev||!E,I=E&&!G,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:y,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:G,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>H.onRequestError(a,b,d,z)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>H.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&A&&B&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!E)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await H.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:A})},z),b}},l=await H.handleResponse({req:a,nextConfig:w,cacheKey:F,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:A,revalidateOnlyGenerated:B,responseGenerator:k,waitUntil:c.waitUntil});if(!E)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",A?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&E||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await H.onRequestError(a,b,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:A})}),E)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},44870:a=>{a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:a=>{a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},86439:a=>{a.exports=require("next/dist/shared/lib/no-fallback-error.external")}};var b=require("../../../webpack-runtime.js");b.C(a);var c=b.X(0,[4586,1692,5711,6427],()=>b(b.s=33885));module.exports=c})();