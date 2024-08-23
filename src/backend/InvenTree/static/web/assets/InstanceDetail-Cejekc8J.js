import{j as a,c4 as w,S as L,ba as u,r as x,m as o,G as _,b7 as T,bK as B,A as b,i as c,b9 as P,bS as C,bc as E}from"./vendor-B0vSnHFf.js";import{r as V}from"./InvenTreeTable-D26a1r6-.js";import{e as I,d as A,A as m,s as D,a as G}from"./index-CDdQlqFV.js";import{I as h,C as N}from"./BaseContext-DSwOqL9e.js";import{a as U,g as q,n as K,S as Y}from"./Instance-Co8OMzcE.js";import{Y as z}from"./YesNoButton-1B57tnbm.js";import{P as M}from"./ColumnRenderers-CwItNORh.js";import{S as W}from"./StylishText-CrpvZzAV.js";import{u as $}from"./DesktopAppView-CofLSp00.js";import{E as g}from"./GenericErrorPage-BifXQa91.js";import O from"./NotFound-DXIcBWRy.js";import{P as R}from"./PermissionDenied-Cl_T9Vqt.js";function k({pk:e,type:r}){const{data:t}=T({queryKey:["badge",r,e],queryFn:async()=>{let n="";switch(r){case"owner":n=m.owner_list;break;case"user":n=m.user_list;break;case"group":n=m.group_list;break;default:return{}}const s=I(n,e);return A.get(s).then(f=>{switch(f.status){case 200:return f.data;default:return{}}}).catch(()=>({}))}}),i=D();if(!t||t.isLoading||t.isFetching)return a.jsx(B,{height:12,radius:"md"});function l(){return!t||!t.pk?"":r==="user"&&i.isSet("DISPLAY_FULL_NAMES")?t.first_name||t.last_name?`${t.first_name} ${t.last_name}`:t.username:r==="user"?t.username:t.name}return a.jsxs(_,{wrap:"nowrap",gap:"sm",justify:"right",children:[a.jsx(P,{color:"dark",variant:"filled",style:{display:"flex",alignItems:"center"},children:(t==null?void 0:t.name)??l()}),a.jsx(h,{icon:r==="user"?r:t.label})]})}function S(e){var t,i,l,n;let r=e==null?void 0:e.field_value;return(t=e==null?void 0:e.field_data)!=null&&t.value_formatter&&(r=e.field_data.value_formatter()),r===void 0?"---":(i=e.field_data)!=null&&i.badge?a.jsx(k,{pk:r,type:e.field_data.badge}):a.jsx("div",{style:{display:"flex",justifyContent:"space-between",wordBreak:"break-word",alignItems:"flex-start"},children:a.jsxs(_,{wrap:"nowrap",gap:"xs",justify:"space-apart",children:[a.jsxs(_,{wrap:"nowrap",gap:"xs",justify:"left",children:[r||((l=e.field_data)==null?void 0:l.unit)&&"0"," ",e.field_data.unit==!0&&e.unit]}),e.field_data.user&&a.jsx(k,{pk:(n=e.field_data)==null?void 0:n.user,type:"user"})]})})}function Q(e){return a.jsx(z,{value:e.field_value})}function H(e){var f,j;const r=$(),{data:t}=T({queryKey:["detail",e.field_data.model,e.field_value],queryFn:async()=>{var v;if(!((v=e.field_data)!=null&&v.model))return{};const d=U(e.field_data.model);if(!(d!=null&&d.api_endpoint))return{};const F=I(d.api_endpoint,e.field_value);return A.get(F).then(y=>{switch(y.status){case 200:return y.data;default:return{}}}).catch(()=>({}))}}),i=x.useMemo(()=>{var d;return((d=e==null?void 0:e.field_data)==null?void 0:d.model)&&q(e.field_data.model,e.field_value)},[e.field_data.model,e.field_value]),l=x.useCallback(d=>{K(i,r,d)},[i]);if(!t||t.isLoading||t.isFetching)return a.jsx(B,{height:12,radius:"md"});if(e.field_data.external)return a.jsx(b,{href:`${e.field_value}`,target:"_blank",rel:"noreferrer noopener",children:a.jsxs("span",{style:{display:"flex",alignItems:"center",gap:"3px"},children:[a.jsx(o,{children:e.field_value}),a.jsx(h,{icon:"external",iconProps:{size:15}})]})});let n=((f=e.field_data)==null?void 0:f.link)??!0,s;return e.field_data.model_formatter?s=e.field_data.model_formatter(t)??s:e.field_data.model_field?s=(t==null?void 0:t[e.field_data.model_field])??s:s=t==null?void 0:t.name,s===void 0&&(s=(t==null?void 0:t.name)??((j=e.field_data)==null?void 0:j.backup_value)??c._({id:"ATGKLv"}),n=!1),a.jsx("div",{children:n?a.jsx(b,{href:"#",onClick:l,children:a.jsx(o,{children:s})}):a.jsx(o,{children:s})})}function J(e){return a.jsx(M,{value:e.field_data.progress,maximum:e.field_data.total,progressLabel:!0})}function X(e){return a.jsx(Y,{type:e.field_data.model,status:e.field_value})}function Z({value:e}){return a.jsx(N,{value:e})}function p({item:e,field:r}){function t(n){switch(n){case"text":case"string":return S;case"boolean":return Q;case"link":return H;case"progressbar":return J;case"status":return X;default:return S}}const i=t(r.type),l=x.useMemo(()=>V(e,r.name),[e,r.name]);return a.jsxs(u.Tr,{style:{verticalAlign:"top"},children:[a.jsx(u.Td,{style:{width:"50",maxWidth:"50"},children:a.jsx(h,{icon:r.icon??r.name})}),a.jsx(u.Td,{style:{maxWidth:"65%",lineBreak:"auto"},children:a.jsx(o,{children:r.label})}),a.jsx(u.Td,{style:{lineBreak:"anywhere"},children:a.jsx(i,{field_data:r,field_value:l})}),a.jsx(u.Td,{style:{width:"50"},children:r.copy&&a.jsx(Z,{value:l})})]})}function _e({item:e,fields:r,title:t}){return a.jsx(w,{p:"xs",withBorder:!0,radius:"xs",children:a.jsxs(L,{gap:"xs",children:[t&&a.jsx(W,{size:"lg",children:t}),a.jsx(u,{striped:!0,verticalSpacing:5,horizontalSpacing:"sm",children:a.jsx(u.Tbody,{children:r.filter(i=>!i.hidden).map((i,l)=>a.jsx(p,{field:i,item:e},l))})})]})})}function he(e){return a.jsx(w,{p:"xs",children:a.jsx(C,{cols:2,spacing:"xs",verticalSpacing:"xs",children:e.children})})}function ee(){return a.jsx(g,{title:c._({id:"vYV5VB"}),message:c._({id:"5a3xiK"})})}function ae({status:e}){switch(e){case 401:return a.jsx(ee,{});case 403:return a.jsx(R,{});case 404:return a.jsx(O,{})}return a.jsx(g,{title:c._({id:"AOPUbq"}),message:c._({id:"yuzYd9"}),status:e})}function te({status:e}){return a.jsx(g,{title:c._({id:"iSWuCp"}),message:c._({id:"vB3crB"}),status:e})}function ge({status:e,loading:r,children:t}){const i=G();return r||!i.isLoggedIn()?a.jsx(E,{}):e>=500?a.jsx(te,{status:e}):e>=400?a.jsx(ae,{status:e}):a.jsx(a.Fragment,{children:t})}export{_e as D,he as I,ge as a};
