"use strict";(()=>{var a={};a.id=4712,a.ids=[4712],a.modules={261:a=>{a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:a=>{a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},19121:a=>{a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},29294:a=>{a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},35529:(a,b,c)=>{c.r(b),c.d(b,{handler:()=>M,patchFetch:()=>L,routeModule:()=>H,serverHooks:()=>K,workAsyncStorage:()=>I,workUnitAsyncStorage:()=>J});var d={};c.r(d),c.d(d,{OPTIONS:()=>E,POST:()=>D,dynamic:()=>G,runtime:()=>F});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641),v=c(28342),w=c(79626),x=c(90744);let y=new v.u(process.env.RESEND_API_KEY),z=new Map,A=process.env.CONTACT_TO_EMAIL||"philipe_cruz@outlook.com",B=process.env.CONTACT_EMAIL_FROM||"contato@saraivavision.com.br",C=new Map;async function D(a){try{let b=a.headers.get("x-forwarded-for")?.split(",")[0]||a.headers.get("x-real-ip")||"unknown",c=(0,w.Eb)(b,5,36e5,z);if(!c.allowed)return u.NextResponse.json({success:!1,error:{message:"Muitas tentativas de agendamento. Aguarde 1 hora antes de tentar novamente.",code:"RATE_LIMIT"},timestamp:new Date().toISOString()},{status:429,headers:{"X-RateLimit-Limit":String(5),"X-RateLimit-Remaining":String(c.remaining),"X-RateLimit-Reset":String(c.resetAt)}});let d=await a.json();if(d.honeypot&&""!==d.honeypot.trim())return console.log("Spam detected via honeypot:",(0,w.nX)(d)),u.NextResponse.json({success:!0,data:{id:"fake-id",appointment:d,confirmationSent:!0},timestamp:new Date().toISOString()},{status:200});let e=w.lY.safeParse(d);if(!e.success)return u.NextResponse.json({success:!1,error:{message:"Dados inv\xe1lidos. Verifique os campos e tente novamente.",code:"VALIDATION_ERROR"},timestamp:new Date().toISOString()},{status:400});let{patient_name:f,patient_email:g,patient_phone:h,appointment_date:i,appointment_time:j,notes:k}=e.data;if(!function(a,b){let c=x.mockBookedSlots.get(a);return!c||!c.has(b)}(i,j))return u.NextResponse.json({success:!1,error:{message:"Este hor\xe1rio n\xe3o est\xe1 mais dispon\xedvel. Por favor, escolha outro hor\xe1rio.",code:"SLOT_UNAVAILABLE"},timestamp:new Date().toISOString()},{status:409});let l=`APT-${Date.now()}-${Math.random().toString(36).slice(2,11)}`,m={id:l,patient_name:f,patient_email:g,patient_phone:h,appointment_date:i,appointment_time:j,notes:k||"",status:"pending",created_at:new Date().toISOString()};x.mockBookedSlots.has(i)||x.mockBookedSlots.set(i,new Set),x.mockBookedSlots.get(i).add(j),C.set(l,m);let n=!1;try{let a=function(a){let{patient_name:b,patient_email:c,patient_phone:d,appointment_date:e,appointment_time:f,notes:g}=a,h=new Date(e).toLocaleDateString("pt-BR",{weekday:"long",year:"numeric",month:"long",day:"numeric"});return`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova Consulta Agendada</title>
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
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
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
    .appointment-details {
      background-color: #dbeafe;
      border-left: 4px solid #2563eb;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .field {
      margin-bottom: 15px;
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
    .notes-box {
      background-color: #f8f9fa;
      padding: 15px;
      border-left: 4px solid #6b7280;
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
      background-color: #2563eb;
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
      <h1>🗓️ Nova Consulta Agendada</h1>
    </div>

    <div class="appointment-details">
      <h2 style="margin-top: 0; color: #1e40af;">Detalhes da Consulta</h2>
      <p style="margin: 0; font-size: 18px;">
        <strong>Data:</strong> ${h}<br>
        <strong>Hor\xe1rio:</strong> ${f}
      </p>
    </div>

    <div class="field">
      <span class="label">Paciente:</span>
      <span class="value">${b}</span>
    </div>

    <div class="field">
      <span class="label">Email:</span>
      <span class="value"><a href="mailto:${c}">${c}</a></span>
    </div>

    <div class="field">
      <span class="label">Telefone:</span>
      <span class="value"><a href="tel:+55${d}">+55 ${d}</a></span>
    </div>

    ${g?`
    <div class="field">
      <span class="label">Observa\xe7\xf5es:</span>
      <div class="notes-box">${g}</div>
    </div>
    `:""}

    <a href="mailto:${c}" class="cta-button">Confirmar Agendamento</a>

    <div class="footer">
      <p>Agendamento criado em: ${new Date().toLocaleString("pt-BR",{timeZone:"America/Sao_Paulo"})}</p>
      <p>ID da consulta: ${a.id}</p>
      <p>Saraiva Vision - Cl\xednica Oftalmol\xf3gica | Caratinga, MG</p>
    </div>
  </div>
</body>
</html>
  `.trim()}(m),b=function(a){let{patient_name:b,patient_email:c,patient_phone:d,appointment_date:e,appointment_time:f,notes:g}=a,h=new Date(e).toLocaleDateString("pt-BR",{weekday:"long",year:"numeric",month:"long",day:"numeric"});return`
Nova Consulta Agendada - Saraiva Vision

DETALHES DA CONSULTA
Data: ${h}
Hor\xe1rio: ${f}

DADOS DO PACIENTE
Nome: ${b}
Email: ${c}
Telefone: +55 ${d}

${g?`OBSERVA\xc7\xd5ES:
${g}
`:""}
---
Agendamento criado em: ${new Date().toLocaleString("pt-BR",{timeZone:"America/Sao_Paulo"})}
ID da consulta: ${a.id}
  `.trim()}(m),c=await y.emails.send({from:B,to:A,subject:`🗓️ Nova Consulta Agendada: ${f}`,html:a,text:b,replyTo:g,tags:[{name:"source",value:"website"},{name:"type",value:"appointment"}]});c.error||(n=!0,console.log("Appointment confirmation sent:",{id:c.data?.id,appointmentId:l,patient:(0,w.nX)({email:g}).email}))}catch(a){console.error("Error sending appointment confirmation:",a)}return console.log("Appointment created:",{id:l,date:i,time:j,patient:(0,w.nX)({name:f,email:g}),timestamp:new Date().toISOString()}),u.NextResponse.json({success:!0,data:{id:l,appointment:m,confirmationSent:n},timestamp:new Date().toISOString()},{status:201})}catch(a){return console.error("Appointments API Error:",a),u.NextResponse.json({success:!1,error:{message:"Erro ao processar agendamento. Tente novamente em alguns minutos.",code:"INTERNAL_ERROR"},timestamp:new Date().toISOString()},{status:500})}}async function E(){return new u.NextResponse(null,{status:200,headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type, Authorization"}})}let F="nodejs",G="force-dynamic",H=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/appointments/route",pathname:"/api/appointments",filename:"route",bundlePath:"app/api/appointments/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/home/saraiva-vision-site/app/api/appointments/route.ts",nextConfigOutput:"standalone",userland:d}),{workAsyncStorage:I,workUnitAsyncStorage:J,serverHooks:K}=H;function L(){return(0,g.patchFetch)({workAsyncStorage:I,workUnitAsyncStorage:J})}async function M(a,b,c){var d;let e="/api/appointments/route";"/index"===e&&(e="/");let g=await H.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:y,routerServerContext:z,isOnDemandRevalidate:A,revalidateOnlyGenerated:B,resolvedPathname:C}=g,D=(0,j.normalizeAppPath)(e),E=!!(y.dynamicRoutes[D]||y.routes[C]);if(E&&!x){let a=!!y.routes[C],b=y.dynamicRoutes[D];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let F=null;!E||H.isDev||x||(F="/index"===(F=C)?"/":F);let G=!0===H.isDev||!E,I=E&&!G,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:y,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:G,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>H.onRequestError(a,b,d,z)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>H.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&A&&B&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!E)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await H.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:A})},z),b}},l=await H.handleResponse({req:a,nextConfig:w,cacheKey:F,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:A,revalidateOnlyGenerated:B,responseGenerator:k,waitUntil:c.waitUntil});if(!E)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",A?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&E||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await H.onRequestError(a,b,{routerKind:"App Router",routePath:D,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:A})}),E)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},44870:a=>{a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},51745:(a,b,c)=>{c.d(b,{x0:()=>g});let d={business:{legalName:"Cl\xednica Saraiva Vision",displayName:"Saraiva Vision",tradeName:"Saraiva Vision",type:"Ophthalmology Clinic",medicalSpecialty:"Oftalmologia",priceRange:"$$",founded:"2020",slogan:"Cuidando da sua vis\xe3o com tecnologia e humaniza\xe7\xe3o"},address:{full:"Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga - MG, 35300-299",street:"Rua Catarina Maria Passos",number:"97",neighborhood:"Santa Zita",city:"Caratinga",state:"MG",stateCode:"MG",postalCode:"35300-299",country:"Brasil",countryCode:"BR",formatted:{short:"Rua Catarina Maria Passos, 97 - Caratinga/MG",medium:"Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga/MG",long:"Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga - MG, 35300-299",singleLine:"Rua Catarina Maria Passos, 97 - Santa Zita, Caratinga/MG 35300-299"},geo:{latitude:-19.789444,longitude:-42.137778,mapUrl:"https://maps.app.goo.gl/YOUR_GOOGLE_PLACE_ID"}},phone:{primary:{raw:"5533998601427",e164:"+5533998601427",display:"+55 33 99860-1427",displayShort:"(33) 99860-1427",href:"tel:+5533998601427",areaCode:"33",number:"998601427",international:"+55 33 99860-1427",national:"(033) 99860-1427"},whatsapp:{raw:"5533998601427",e164:"+5533998601427",display:"+55 33 99860-1427",href:"https://wa.me/5533998601427",defaultMessage:"Ol\xe1! Gostaria de agendar uma consulta."}},email:{primary:"saraivavision@gmail.com",contact:"saraivavision@gmail.com",support:"saraivavision@gmail.com",appointments:"saraivavision@gmail.com",href:"mailto:saraivavision@gmail.com"}},e=["GOOGLE_PLACE_ID_PLACEHOLDER","your_google_place_id_here","PLACEHOLDER"],f=a=>{if(!a)return null;let b=String(a).trim();return!b||e.some(a=>b.includes(a))?null:b};(()=>{let a=[];for(let b of("undefined"!=typeof process&&process.env&&(a.push(process.env.GOOGLE_PLACE_ID),a.push(process.env.VITE_GOOGLE_PLACE_ID)),a)){let a=f(b);if(a)return a}})();let g={name:d.business.legalName,legalName:d.business.legalName,streetAddress:`${d.address.street}, ${d.address.number}`,neighborhood:d.address.neighborhood,city:d.address.city,state:d.address.stateCode,postalCode:d.address.postalCode,country:d.address.countryCode,address:{street:`${d.address.street}, ${d.address.number}`,city:d.address.city,state:d.address.stateCode,zip:d.address.postalCode,country:d.address.countryCode},phoneDisplay:d.phone.primary.display,phone:d.phone.primary.e164,whatsapp:d.phone.whatsapp.e164,whatsapp24h:"https://wa.me/message/EHTAAAAYH7SHJ1",email:d.email.primary,instagram:"https://www.instagram.com/saraiva_vision/",facebook:"https://www.facebook.com/philipeoftalmo",linkedin:"https://www.linkedin.com/in/dr-philipe-saraiva/",x:"https://x.com/philipe_saraiva",spotify:"https://open.spotify.com/show/6sHIG7HbhF1w5O63CTtxwV",chatbotUrl:"https://chatgpt.com/g/g-quepJB90J-saraiva-vision-clinica-oftalmologica",onlineSchedulingUrl:"https://agendarconsulta.com/perfil/dr-philipe-cruz-1678973613",validateSchedulingUrl:()=>{let a="https://agendarconsulta.com/perfil/dr-philipe-cruz-1678973613";try{let b=new URL(a);if("https:"!==b.protocol)throw Error("URL must use HTTPS");if(!b.hostname.includes("agendarconsulta.com"))throw Error("URL must be from agendarconsulta.com domain");return a}catch(a){return console.error("Invalid scheduling URL:",a),null}},responsiblePhysician:"Dr. Philipe Saraiva Cruz",responsiblePhysicianCRM:"CRM-MG 69.870",responsiblePhysicianTitle:"Respons\xe1vel T\xe9cnico M\xe9dico",responsibleNurse:"Ana L\xfacia",responsibleNurseTitle:"Enfermeira",responsibleNursePhone:"+55 33 98420-7437",dpoEmail:"saraivavision@gmail.com",taxId:"53.864.119/0001-79",foundingDate:"2024-02-08",latitude:-19.7890206,longitude:-42.1347583,servicesKeywords:["Consultas oftalmol\xf3gicas","Exames de refra\xe7\xe3o","Tratamentos especializados","Cirurgias oftalmol\xf3gicas","Oftalmologia pedi\xe1trica","Laudos especializados"]}},63033:a=>{a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},86439:a=>{a.exports=require("next/dist/shared/lib/no-fallback-error.external")},90744:(a,b,c)=>{c.r(b),c.d(b,{GET:()=>i,OPTIONS:()=>j,dynamic:()=>l,mockBookedSlots:()=>h,runtime:()=>k});var d=c(10641),e=c(79626),f=c(51745);let g={start:8,end:18,slotDuration:30,workDays:[1,2,3,4,5]},h=new Map;async function i(a){try{let{searchParams:b}=new URL(a.url),c={days:b.get("days")||"14"},i=e.FO.safeParse(c);if(!i.success)return d.NextResponse.json({success:!1,error:{message:"Par\xe2metros inv\xe1lidos",code:"VALIDATION_ERROR"},timestamp:new Date().toISOString()},{status:400});let{days:j}=i.data,k=function(a){let b={},c=new Date(new Date),d=0;for(;d<a;){if(function(a){let b=a.getDay();return g.workDays.includes(b)}(c)){let a=c.toISOString().split("T")[0],e=function(a){let b=function(){let a=[];for(let b=g.start;b<g.end;b++)for(let c=0;c<60;c+=g.slotDuration){let d=`${b.toString().padStart(2,"0")}:${c.toString().padStart(2,"0")}`;a.push(d)}return a}(),c=h.get(a)||new Set,d=new Date,e=new Date(a).toDateString()===d.toDateString();return b.map(b=>{let f=!c.has(b);if(e){let[a,c]=b.split(":").map(Number),e=new Date(d);e.setHours(a,c,0,0),e<=d&&(f=!1)}return Math.random()>.7&&(f=!1),{slot_time:b,is_available:f,slot_id:`${a}-${b}`}})}(a);e.filter(a=>a.is_available).length>0&&(b[a]=e),d++}c.setDate(c.getDate()+1)}return b}(j),l={success:!0,data:{availability:k,schedulingEnabled:!0,contact:{whatsapp:f.x0.whatsapp,phone:f.x0.phone,phoneDisplay:f.x0.phoneDisplay,externalUrl:f.x0.onlineSchedulingUrl}},timestamp:new Date().toISOString()};return d.NextResponse.json(l,{status:200,headers:{"Cache-Control":"private, no-cache, no-store, must-revalidate",Expires:"0",Pragma:"no-cache"}})}catch(a){return console.error("Availability API Error:",a),d.NextResponse.json({success:!1,error:{message:"Erro ao buscar disponibilidade. Tente novamente.",code:"INTERNAL_ERROR"},timestamp:new Date().toISOString()},{status:500})}}async function j(){return new d.NextResponse(null,{status:200,headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET, OPTIONS","Access-Control-Allow-Headers":"Content-Type"}})}let k="nodejs",l="force-dynamic"}};var b=require("../../../webpack-runtime.js");b.C(a);var c=b.X(0,[4586,1692,5711,6427],()=>b(b.s=35529));module.exports=c})();