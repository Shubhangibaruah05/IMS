import{b7 as Y,r,i as t,j as a,d6 as H,G as F,bK as X,m as $,aL as J,z as V,eh as z,aW as ee,ei as te,S as ae,bc as se}from"./vendor-B0vSnHFf.js";import{A as re}from"./AdminButton-Cl1ixKQi.js";import{I as oe,D as O,a as ie}from"./InstanceDetail-Cejekc8J.js";import{u as Z,I as q,R as ne,A as le,E as ce,D as de}from"./InvenTreeTable-D26a1r6-.js";import{c as pe,g as R,n as me,A}from"./Instance-Co8OMzcE.js";import{N as ue}from"./NavigationTree-Cw872Gub.js";import{P as _e}from"./PageDetail-B4PsctWo.js";import{P as fe}from"./PanelGroup-DRVQKYn0.js";import{a as N,A as b,U as I,e as w,M as f,d as be}from"./index-CDdQlqFV.js";import{a as xe,p as K}from"./PartForms-CPuh80H4.js";import{a as Q,u as E,b as ge}from"./UseForm-BimrM1zK.js";import{u as he}from"./UseInstance-Bcp_oSAZ.js";import{Y as B}from"./YesNoButton-1B57tnbm.js";import{a as ye,D as U,l as je,g as ke}from"./ColumnRenderers-CwItNORh.js";import{u as W,d as Ce}from"./DesktopAppView-CofLSp00.js";import{A as Pe}from"./AddItemButton-CD0U_4gd.js";import{P as ve}from"./PartTable-CERxeXjr.js";import"./ActionButton-Br0cBRLA.js";import"./BaseContext-DSwOqL9e.js";import"./StylishText-CrpvZzAV.js";import"./GenericErrorPage-BifXQa91.js";import"./NotFound-DXIcBWRy.js";import"./PermissionDenied-Cl_T9Vqt.js";import"./Boundary-CysPC9mI.js";function Ie({record:d,template:s,canEdit:m}){const{hovered:_,ref:x}=H(),i=r.useMemo(()=>{var l;return(l=d.parameters)==null?void 0:l.find(y=>y.template==s.pk)},[d.parameters,s]);let e=[];const h=r.useMemo(()=>{let l=i==null?void 0:i.data;return s!=null&&s.checkbox&&l!=null&&(l=a.jsx(B,{value:i.data})),l},[i,s]);if(s.units&&i&&i.data_numeric&&i.data_numeric!=i.data){const l=je(i.data_numeric,{digits:15});e.push(`${l} [${s.units}]`)}return _&&m&&e.push(t._({id:"cwMTjO"})),a.jsx("div",{children:a.jsx(F,{grow:!0,ref:x,justify:"space-between",children:a.jsx(F,{grow:!0,children:a.jsx(ke,{value:h??"-",extra:e,icon:_&&m?"edit":"info",title:s.name})})})})}function Me({categoryId:d}){const s=Z("parametric-parts"),m=N(),_=W(),x=Y({queryKey:["category-parameters",d],queryFn:async()=>be.get(w(b.part_parameter_template_list),{params:{category:d}}).then(c=>c.data).catch(c=>[]),refetchOnMount:!0}),[i,e]=r.useState(0),[h,l]=r.useState(0),[y,C]=r.useState(0),n=xe({editTemplate:!1}),j=Q({url:b.part_parameter_list,title:t._({id:"iwRvX8"}),fields:r.useMemo(()=>({...n}),[n]),focus:"data",onFormSuccess:c=>{M(i,c)},initialData:{part:i,template:h}}),P=E({url:b.part_parameter_list,title:t._({id:"ZqLOh/"}),pk:y,fields:r.useMemo(()=>({...n}),[n]),focus:"data",onFormSuccess:c=>{M(i,c)}}),M=r.useCallback((c,o)=>{let u=s.records,p=u.findIndex(k=>k.pk==c);if(p<0){s.refreshTable();return}let v=u[p].parameters.findIndex(k=>k.pk==o.pk);v<0?u[p].parameters.push(o):u[p].parameters[v]=o,s.setRecords(u)},[s.records]),T=r.useMemo(()=>(x.data??[]).map(o=>{let u=o.name;return o.units&&(u+=` [${o.units}]`),{accessor:`parameter_${o.pk}`,title:u,sortable:!0,extra:{template:o.pk},render:p=>a.jsx(Ie,{record:p,template:o,canEdit:m.hasChangeRole(I.part)})}}),[m,x.data]),S=r.useCallback((c,o)=>{var p;l(c),e(o.pk);let u=(p=o.parameters)==null?void 0:p.find(v=>v.template==c);u?(C(u.pk),P.open()):j.open()},[]),g=r.useMemo(()=>[{name:"active",label:t._({id:"F6pfE9"}),description:t._({id:"xqUGVc"})},{name:"locked",label:t._({id:"G2fuEb"}),description:t._({id:"tB/dWJ"})},{name:"assembly",label:t._({id:"WL36Yh"}),description:t._({id:"IxF0Eq"})}],[]),D=r.useMemo(()=>[...[{accessor:"name",sortable:!0,switchable:!1,noWrap:!0,render:o=>ye(o)},U({}),{accessor:"IPN",sortable:!0},{accessor:"total_in_stock",sortable:!0}],...T],[T]);return a.jsxs(a.Fragment,{children:[j.modal,P.modal,a.jsx(q,{url:w(b.part_list),tableState:s,columns:D,props:{enableDownload:!1,tableFilters:g,params:{category:d,cascade:!0,category_detail:!0,parameters:!0},onCellClick:({event:c,record:o,index:u,column:p,columnIndex:v})=>{var k,G;if(pe(c),(G=(k=p==null?void 0:p.accessor)==null?void 0:k.toString())!=null&&G.startsWith("parameter_"))S(p.extra.template,o);else if(o!=null&&o.pk){const L=R(f.part,o.pk);me(L,_,c)}}}})]})}function Te({parentId:d}){const s=Z("partcategory"),m=N(),_=r.useMemo(()=>[{accessor:"name",sortable:!0,switchable:!1,render:n=>a.jsxs(F,{gap:"xs",children:[n.icon&&a.jsx(A,{name:n.icon}),n.name]})},U({}),{accessor:"pathstring",sortable:!1},{accessor:"structural",sortable:!0,render:n=>a.jsx(B,{value:n.structural})},{accessor:"part_count",sortable:!0}],[]),x=r.useMemo(()=>[{name:"cascade",label:t._({id:"NgZniC"}),description:t._({id:"Tt3/Pp"})},{name:"structural",label:t._({id:"PRKZBP"}),description:t._({id:"kHkg2b"})},{name:"starred",label:t._({id:"7VIaU3"}),description:t._({id:"mcDc03"})}],[]),i=Q({url:b.category_list,title:t._({id:"sIMwJx"}),fields:K(),focus:"name",initialData:{parent:d},follow:!0,modelType:f.partcategory,table:s}),[e,h]=r.useState(-1),l=E({url:b.category_list,pk:e,title:t._({id:"7fjpj0"}),fields:K(),onFormSuccess:n=>s.updateRecord(n)}),y=r.useMemo(()=>{let n=m.hasAddRole(I.part_category);return[a.jsx(Pe,{tooltip:t._({id:"5LuNgu"}),onClick:()=>i.open(),hidden:!n})]},[m]),C=r.useCallback(n=>{let j=m.hasChangeRole(I.part_category);return[ne({hidden:!j,onClick:()=>{h(n.pk),l.open()}})]},[m]);return a.jsxs(a.Fragment,{children:[i.modal,l.modal,a.jsx(q,{url:w(b.category_list),tableState:s,columns:_,props:{enableDownload:!0,params:{parent:d,top_level:d===void 0?!0:void 0},tableFilters:x,tableActions:y,rowActions:C,modelType:f.partcategory}})]})}function ze(){const{id:d}=Ce(),s=r.useMemo(()=>isNaN(parseInt(d||""))?void 0:d,[d]),m=W(),_=N(),[x,i]=r.useState(!1),{instance:e,refreshInstance:h,instanceQuery:l,requestStatus:y}=he({endpoint:b.category_list,hasPrimaryKey:!0,pk:s,params:{path_detail:!0}}),C=r.useMemo(()=>{if(s&&l.isFetching)return a.jsx(X,{});let g=[{type:"text",name:"name",label:t._({id:"6YtxFj"}),copy:!0,value_formatter:()=>a.jsxs(F,{gap:"xs",children:[e.icon&&a.jsx(A,{name:e.icon}),e.name]})},{type:"text",name:"pathstring",label:t._({id:"I6gXOa"}),icon:"sitemap",copy:!0,hidden:!s},{type:"text",name:"description",label:t._({id:"Nu4oKW"}),copy:!0},{type:"link",name:"parent",model_field:"name",icon:"location",label:t._({id:"o8hZ41"}),model:f.partcategory,hidden:!(e!=null&&e.parent)}],D=[{type:"text",name:"part_count",label:t._({id:"pmRbKZ"}),icon:"part",value_formatter:()=>(e==null?void 0:e.part_count)||"0"},{type:"text",name:"subcategories",label:t._({id:"7lonqg"}),icon:"sitemap",hidden:!(e!=null&&e.subcategories)},{type:"boolean",name:"structural",label:t._({id:"PRKZBP"}),icon:"sitemap"},{type:"link",name:"parent_default_location",label:t._({id:"XLVNTv"}),model:f.stocklocation,hidden:!e.parent_default_location||e.default_location},{type:"link",name:"default_location",label:t._({id:"QC5Msb"}),model:f.stocklocation,hidden:!e.default_location}];return a.jsxs(oe,{children:[s&&(e!=null&&e.pk)?a.jsx(O,{item:e,fields:g}):a.jsx($,{children:t._({id:"PFKWrQ"})}),s&&(e==null?void 0:e.pk)&&a.jsx(O,{item:e,fields:D})]})},[e,l]),n=E({url:b.category_list,pk:s,title:t._({id:"7fjpj0"}),fields:K(),onFormSuccess:h}),j=r.useMemo(()=>[{value:0,display_name:"Move items to parent category"},{value:1,display_name:t._({id:"lzGbCT"})}],[]),P=ge({url:b.category_list,pk:s,title:t._({id:"2tjyh5"}),fields:{delete_parts:{label:t._({id:"PJYQQn"}),description:t._({id:"ZqK0DP"}),choices:j,field_type:"choice"},delete_child_categories:{label:t._({id:"QgH9YK"}),description:t._({id:"ISGGrw"}),choices:j,field_type:"choice"}},onFormSuccess:()=>{e.parent?m(R(f.partcategory,e.parent)):m("/part/")}}),M=r.useMemo(()=>[a.jsx(re,{model:f.partcategory,pk:e.pk}),a.jsx(le,{tooltip:t._({id:"O/o81A"}),icon:a.jsx(J,{}),actions:[ce({hidden:!s||!_.hasChangeRole(I.part_category),tooltip:t._({id:"7fjpj0"}),onClick:()=>n.open()}),de({hidden:!s||!_.hasDeleteRole(I.part_category),tooltip:t._({id:"2tjyh5"}),onClick:()=>P.open()})]})],[s,_,e.pk]),T=r.useMemo(()=>[{name:"details",label:t._({id:"wp9B4i"}),icon:a.jsx(V,{}),content:C},{name:"parts",label:t._({id:"pmRbKZ"}),icon:a.jsx(z,{}),content:a.jsx(ve,{props:{params:{category:s}}})},{name:"subcategories",label:t._({id:"2GkbLI"}),icon:a.jsx(ee,{}),content:a.jsx(Te,{parentId:s})},{name:"parameters",label:t._({id:"TxrNvj"}),icon:a.jsx(te,{}),content:a.jsx(Me,{categoryId:s})}],[e,s]),S=r.useMemo(()=>[{name:t._({id:"pmRbKZ"}),url:"/part"},...(e.path??[]).map(g=>({name:g.name,url:R(f.partcategory,g.pk),icon:g.icon?a.jsx(A,{name:g.icon}):void 0}))],[e]);return a.jsxs(a.Fragment,{children:[n.modal,P.modal,a.jsx(ie,{status:y,loading:s?l.isFetching:!1,children:a.jsxs(ae,{gap:"xs",children:[a.jsx(se,{visible:l.isFetching}),a.jsx(ue,{modelType:f.partcategory,title:t._({id:"2GkbLI"}),endpoint:b.category_tree,opened:x,onClose:()=>{i(!1)},selectedId:e==null?void 0:e.pk}),a.jsx(_e,{title:t._({id:"QXANxH"}),subtitle:e==null?void 0:e.name,icon:(e==null?void 0:e.icon)&&a.jsx(A,{name:e==null?void 0:e.icon}),breadcrumbs:S,breadcrumbAction:()=>{i(!0)},actions:M,editAction:n.open,editEnabled:_.hasChangePermission(f.partcategory)}),a.jsx(fe,{pageKey:"partcategory",panels:T})]})})]})}export{ze as default};
