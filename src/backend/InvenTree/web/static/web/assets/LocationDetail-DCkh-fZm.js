import{r as n,j as o,a4 as R,h as A,S as v,z as w}from"./vendor-C5fHLTDD.js";import{a as T,i as e,A as d,M as f,U as g,l as E}from"./index-DX4YmBvQ.js";import{A as U}from"./ActionButton-seel8ZoK.js";import{I as N,D as y}from"./ItemDetails-DTEWr5C0.js";import{B as z,V,L as J,U as O,A as S,E as Q}from"./ActionDropdown-C-AjyTLr.js";import{P as W}from"./PageDetail-BwkjpKwR.js";import{P as K}from"./PanelGroup-CWuySmV8.js";import{S as G}from"./StockLocationTree-BJuCfroG.js";import{s as I,b as Y,e as Z}from"./StockForms-yHG_9MvM.js";import{I as P,z as H,a as r,h as X}from"./ApiForm-Dtyf-xF2.js";import{u as q,g as L,R as $,I as oo}from"./InvenTreeTable-LkhQVMZE.js";import{a as to,u as D}from"./UseForm-Btt47jru.js";import{u as eo}from"./UseInstance-rwUPjJ4i.js";import{P as so}from"./PartTable-9dbqLQIq.js";import{S as ao}from"./StockItemTable-DiLjDthM.js";import{A as no}from"./AddItemButton-BjrbTsCx.js";import{D as io,B as C}from"./ColumnRenderers-Dz-jxqgo.js";import{u as co,d as ro}from"./DesktopAppView-DlNUv0Ur.js";import{I as lo}from"./IconInfoCircle-D5K91YCo.js";import"./notifications-DM-9a7Is.js";import"./ProgressBar-BhbAlmdB.js";import"./StylishText-CD9I8-X7.js";import"./YesNoButton-DIAHIY63.js";import"./ModelType-C8nSW6qW.js";import"./Instance-c0njg-mI.js";import"./IconQrcode-DcoHpd2K.js";import"./IconEdit-DwKL16RF.js";import"./IconTrash-KFql82qv.js";import"./BaseContext-BGXKB9QI.js";import"./Placeholder-C1-1kY0o.js";import"./index.es-RSVDxQs2.js";import"./IconChevronDown-DoPmRmuk.js";import"./IconExternalLink-CDh1KHXW.js";import"./IconSearch-CKaD9XHL.js";import"./IconRefresh-ClXNAr2V.js";import"./PartForms-FGG79plz.js";import"./IconPlus-QsNVBJ5N.js";function mo({parentId:l}){const s=q("stocklocation"),i=T(),j=co(),u=n.useMemo(()=>[{name:"cascade",label:e._({id:"VY386J"}),description:e._({id:"Ue7Vtx"})},{name:"structural",description:e._({id:"zW8WBT"})},{name:"external",description:e._({id:"ckSQBM"})},{name:"has_location_type",label:e._({id:"Sgyhpp"})}],[]),t=n.useMemo(()=>[{accessor:"name",switchable:!1},io({}),{accessor:"pathstring",sortable:!0},{accessor:"items",sortable:!0},C({accessor:"structural"}),C({accessor:"external"}),{accessor:"location_type",sortable:!1,render:a=>{var c;return(c=a.location_type_detail)==null?void 0:c.name}}],[]),m=to({url:d.stock_location_list,title:e._({id:"sklcDg"}),fields:I({}),initialData:{parent:l},onFormSuccess(a){a.pk?j(L(f.stocklocation,a.pk)):s.refreshTable()}}),[p,h]=n.useState(-1),k=D({url:d.stock_location_list,pk:p,title:e._({id:"Qdjbg8"}),fields:I({}),onFormSuccess:a=>s.updateRecord(a)}),b=n.useMemo(()=>{let a=i.hasAddRole(g.stock_location);return[o.jsx(no,{tooltip:e._({id:"sklcDg"}),onClick:()=>m.open(),hidden:!a})]},[i]),_=n.useCallback(a=>{let c=i.hasChangeRole(g.stock_location);return[$({hidden:!c,onClick:()=>{h(a.pk),k.open()}})]},[i]);return o.jsxs(o.Fragment,{children:[m.modal,k.modal,o.jsx(oo,{url:E(d.stock_location_list),tableState:s,columns:t,props:{enableDownload:!0,params:{parent:l},tableFilters:u,tableActions:b,rowActions:_,modelType:f.stocklocation}})]})}function Zo(){const{id:l}=ro(),s=n.useMemo(()=>isNaN(parseInt(l||""))?void 0:l,[l]),i=T(),[j,u]=n.useState(!1),{instance:t,refreshInstance:m,instanceQuery:p}=eo({endpoint:d.stock_location_list,hasPrimaryKey:!0,pk:s,params:{path_detail:!0}}),h=n.useMemo(()=>{if(s&&p.isFetching)return o.jsx(R,{});let x=[{type:"text",name:"name",label:e._({id:"6YtxFj"}),copy:!0},{type:"text",name:"pathstring",label:e._({id:"I6gXOa"}),icon:"sitemap",copy:!0,hidden:!s},{type:"text",name:"description",label:e._({id:"Nu4oKW"}),copy:!0},{type:"link",name:"parent",model_field:"name",icon:"location",label:e._({id:"+o9hiJ"}),model:f.stocklocation,hidden:!(t!=null&&t.parent)}],F=[{type:"text",name:"items",icon:"stock",label:e._({id:"Jbck4N"})},{type:"text",name:"sublocations",icon:"location",label:e._({id:"L7/8CO"}),hidden:!(t!=null&&t.sublocations)},{type:"boolean",name:"structural",label:e._({id:"PRKZBP"}),icon:"sitemap"},{type:"boolean",name:"external",label:e._({id:"bVhrVt"})}];return o.jsxs(N,{children:[s&&(t!=null&&t.pk)?o.jsx(y,{item:t,fields:x}):o.jsx(A,{children:e._({id:"js9HzF"})}),s&&(t==null?void 0:t.pk)&&o.jsx(y,{item:t,fields:F})]})},[t,p]),k=n.useMemo(()=>[{name:"details",label:e._({id:"AC8C/Z"}),icon:o.jsx(lo,{}),content:h},{name:"stock-items",label:e._({id:"Jbck4N"}),icon:o.jsx(P,{}),content:o.jsx(ao,{params:{location:s}})},{name:"sublocations",label:e._({id:"1eBWAw"}),icon:o.jsx(H,{}),content:o.jsx(mo,{parentId:s})},{name:"default_parts",label:e._({id:"D19W4x"}),icon:o.jsx(P,{}),hidden:!t.pk,content:o.jsx(so,{props:{params:{default_location:t.pk}}})}],[t,s]),b=D({url:d.stock_location_list,pk:s,title:e._({id:"Qdjbg8"}),fields:I({}),onFormSuccess:m}),_=n.useMemo(()=>({pk:t.pk,model:"location",refresh:m}),[t]),a=Y(_),c=Z(_),M=n.useMemo(()=>[o.jsx(U,{icon:o.jsx(r,{icon:"stocktake"}),variant:"outline",size:"lg"}),o.jsx(z,{actions:[V({}),J({}),O({}),{name:"Scan in stock items",icon:o.jsx(r,{icon:"stock"}),tooltip:"Scan items"},{name:"Scan in container",icon:o.jsx(r,{icon:"unallocated_stock"}),tooltip:"Scan container"}]}),o.jsx(S,{icon:o.jsx(r,{icon:"reports"}),actions:[{name:"Print Label",icon:"",tooltip:"Print label"},{name:"Print Location Report",icon:"",tooltip:"Print Report"}]},"reports"),o.jsx(S,{icon:o.jsx(r,{icon:"stock"}),actions:[{name:"Count Stock",icon:o.jsx(r,{icon:"stocktake",iconProps:{color:"blue"}}),tooltip:"Count Stock",onClick:()=>c.open()},{name:"Transfer Stock",icon:o.jsx(r,{icon:"transfer",iconProps:{color:"blue"}}),tooltip:"Transfer Stock",onClick:()=>a.open()}]},"operations"),o.jsx(S,{tooltip:e._({id:"Ego4rz"}),icon:o.jsx(X,{}),actions:[Q({hidden:!s||!i.hasChangeRole(g.stock_location),tooltip:e._({id:"Qdjbg8"}),onClick:()=>b.open()})]},"location")],[t,s,i]),B=n.useMemo(()=>[{name:e._({id:"blbbPS"}),url:"/stock"},...(t.path??[]).map(x=>({name:x.name,url:L(f.stocklocation,x.pk)}))],[t]);return o.jsxs(o.Fragment,{children:[b.modal,o.jsxs(v,{children:[o.jsx(w,{visible:p.isFetching}),o.jsx(G,{opened:j,onClose:()=>u(!1),selectedLocation:t==null?void 0:t.pk}),o.jsx(W,{title:e._({id:"Jbck4N"}),detail:o.jsx(A,{children:t.name??"Top level"}),actions:M,breadcrumbs:B,breadcrumbAction:()=>{u(!0)}}),o.jsx(K,{pageKey:"stocklocation",panels:k}),a.modal,c.modal]})]})}export{Zo as default};
