import{ej as S,b7 as A,r as x,j as a,G as g,bb as D,b6 as E,bL as L,ek as N,A as z,bV as I,aW as K,S as $,b8 as F,bc as G,el as R}from"./vendor-B0vSnHFf.js";import{d as T,e as U}from"./index-CDdQlqFV.js";import{g as q,n as B,A as M}from"./Instance-Co8OMzcE.js";import{S as O}from"./StylishText-CrpvZzAV.js";import{u as Q}from"./DesktopAppView-CofLSp00.js";function X({title:b,opened:c,onClose:p,selectedId:d,modelType:l,endpoint:w}){const h=Q(),u=S(),r=A({enabled:c,queryKey:[l,c],queryFn:async()=>T.get(U(w),{data:{ordering:"level"}}).then(e=>e.data??[]).catch(e=>(console.error(`Error fetching ${l} tree`),[]))}),k=x.useCallback((e,t)=>{const i=q(l,e.value);t!=null&&t.shiftKey||t!=null&&t.ctrlKey?B(i,h,t):(p(),h(i))},[l,h]),v=x.useMemo(()=>{var i,j;let e={},t=[];if(!((i=r==null?void 0:r.data)!=null&&i.length))return[];for(let s=0;s<r.data.length;s++){let n={...r.data[s],children:[],label:a.jsxs(g,{gap:"xs",children:[a.jsx(M,{name:r.data[s].icon}),r.data[s].name]}),value:r.data[s].pk.toString(),selected:r.data[s].pk===d};const f=n.pk,m=n.parent;if(m?(j=e[m])==null||j.children.push(n):t.push(n),e[f]=n,f===d){let o=e[n.parent];for(;o;)o.expanded=!0,o=e[o.parent]}}return t},[d,r.data]),C=x.useCallback(e=>a.jsxs(g,{justify:"left",wrap:"nowrap",onClick:()=>{e.hasChildren&&u.toggleExpanded(e.node.value)},children:[a.jsx(D,{w:5*e.level}),a.jsx(E,{size:"sm",variant:"transparent","aria-label":`nav-tree-toggle-${e.node.value}}`,children:e.hasChildren?e.expanded?a.jsx(L,{}):a.jsx(N,{}):null}),a.jsx(z,{onClick:t=>k(e.node,t),"aria-label":`nav-tree-item-${e.node.value}`,children:e.node.label})]},e.node.value),[u]);return a.jsx(I,{opened:c,size:"md",position:"left",onClose:p,withCloseButton:!0,styles:{header:{width:"100%"},title:{width:"100%"}},title:a.jsxs(g,{justify:"left",p:"ms",gap:"md",wrap:"nowrap",children:[a.jsx(K,{}),a.jsx(O,{size:"lg",children:b})]}),children:a.jsxs($,{gap:"xs",children:[a.jsx(F,{}),a.jsx(G,{visible:r.isFetching||r.isLoading}),a.jsx(R,{data:v,tree:u,renderNode:C})]})})}export{X as N};
