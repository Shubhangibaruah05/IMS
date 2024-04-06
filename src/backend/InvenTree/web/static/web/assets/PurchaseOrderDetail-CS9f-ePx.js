import{r as p,j as a,h as P,a4 as F,aK as I,S as w,z as M}from"./vendor-C5fHLTDD.js";import{g as K,a as R,i as t,A as r,U as _,l as q,M as j}from"./index-DX4YmBvQ.js";import{I as N,D as k}from"./ItemDetails-DTEWr5C0.js";import{D as U}from"./DetailsImage-Y3z_v9dS.js";import{B,V as E,L as O,U as W,A as X,E as G,D as Q}from"./ActionDropdown-C-AjyTLr.js";import{P as V}from"./PageDetail-BwkjpKwR.js";import{P as z}from"./PanelGroup-CWuySmV8.js";import{N as H}from"./MarkdownEditor-CY0oiYAG.js";import{u as Z,a as S,p as J}from"./PurchaseOrderForms-6UEJk9M0.js";import{a as Y,u as L,b as $}from"./UseForm-Btt47jru.js";import{u as ee}from"./UseInstance-rwUPjJ4i.js";import{A as te}from"./AttachmentTable-AC0GadOO.js";import{A as ae}from"./ActionButton-seel8ZoK.js";import{A as se}from"./AddItemButton-BjrbTsCx.js";import{T as ie,e as ne}from"./Instance-c0njg-mI.js";import{P as le}from"./ProgressBar-BhbAlmdB.js";import{u as oe,R as re,e as pe,a as ce,I as me}from"./InvenTreeTable-LkhQVMZE.js";import{R as ue,e as de,i as _e,c as he,T as be,N as xe,L as fe}from"./ColumnRenderers-Dz-jxqgo.js";import{S as ye}from"./StockItemTable-DiLjDthM.js";import{d as ge}from"./DesktopAppView-DlNUv0Ur.js";import{I as ke}from"./IconInfoCircle-D5K91YCo.js";import{x as je,I as Ae,f as ve,g as Ce,h as Ie}from"./ApiForm-Dtyf-xF2.js";import"./StylishText-CD9I8-X7.js";import"./YesNoButton-DIAHIY63.js";import"./ModelType-C8nSW6qW.js";import"./BaseContext-BGXKB9QI.js";import"./index-DtVngfXu.js";import"./notifications-DM-9a7Is.js";import"./IconQrcode-DcoHpd2K.js";import"./IconEdit-DwKL16RF.js";import"./IconTrash-KFql82qv.js";import"./Placeholder-C1-1kY0o.js";import"./StandaloneField-BRVMmltH.js";import"./IconCoins-B2Q7vuLB.js";import"./IconAddressBook-DD_FnNjd.js";import"./IconUsers-VfNlX2pM.js";import"./IconFileTypePdf-ST3WfDb7.js";import"./IconExternalLink-CDh1KHXW.js";import"./IconPlus-QsNVBJ5N.js";import"./IconSearch-CKaD9XHL.js";import"./IconRefresh-ClXNAr2V.js";import"./StockForms-yHG_9MvM.js";/**
 * @license @tabler/icons-react v3.1.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var T=K("outline","square-arrow-right","IconSquareArrowRight",[["path",{d:"M12 16l4 -4l-4 -4",key:"svg-0"}],["path",{d:"M8 12h8",key:"svg-1"}],["path",{d:"M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z",key:"svg-2"}]]);function Pe({orderId:n,params:A}){const s=oe("purchase-order-line-item"),l=R(),[h,m]=p.useState(null),u=Z({items:h?[h]:s.selectedRecords,orderPk:n,formProps:{onClose:()=>setTimeout(()=>m(null),500)}}),v=p.useMemo(()=>[{accessor:"part",title:t._({id:"vgP+9p"}),sortable:!0,switchable:!1,render:e=>{var i,o,c;return a.jsx(ie,{text:(i=e==null?void 0:e.part_detail)==null?void 0:i.name,src:((o=e==null?void 0:e.part_detail)==null?void 0:o.thumbnail)??((c=e==null?void 0:e.part_detail)==null?void 0:c.image)})}},{accessor:"description",title:t._({id:"5ZWiLz"}),sortable:!1,render:e=>{var i;return(i=e==null?void 0:e.part_detail)==null?void 0:i.description}},ue(),{accessor:"quantity",title:t._({id:"VbWX2u"}),sortable:!0,switchable:!1,render:e=>{let i=(e==null?void 0:e.supplier_part_detail)??{},o=(e==null?void 0:e.part_detail)??(i==null?void 0:i.part_detail)??{},c=[];if(i.pack_quantity_native!=1){let D=e.quantity*i.pack_quantity_native;c.push(a.jsxs(P,{children:[t._({id:"J9LTXQ"}),": ",i.pack_quantity]},"pack-quantity")),c.push(a.jsxs(P,{children:[t._({id:"GbI1d2"}),": ",D," ",o==null?void 0:o.units]},"total-quantity"))}return a.jsx(de,{value:e.quantity,extra:c,title:t._({id:"VbWX2u"})})}},{accessor:"received",title:t._({id:"fZ5Vnu"}),sortable:!1,render:e=>a.jsx(le,{progressLabel:!0,value:e.received,maximum:e.quantity})},{accessor:"pack_quantity",sortable:!1,title:t._({id:"J9LTXQ"}),render:e=>{var i;return(i=e==null?void 0:e.supplier_part_detail)==null?void 0:i.pack_quantity}},{accessor:"SKU",title:t._({id:"PeuqsI"}),switchable:!1,sortable:!0,render:e=>{var i;return(i=e==null?void 0:e.supplier_part_detail)==null?void 0:i.SKU}},{accessor:"supplier_link",title:t._({id:"h3/Rpt"}),sortable:!1,render:e=>{var i;return(i=e==null?void 0:e.supplier_part_detail)==null?void 0:i.link}},{accessor:"MPN",title:t._({id:"u7qly3"}),sortable:!0,render:e=>{var i,o;return(o=(i=e==null?void 0:e.supplier_part_detail)==null?void 0:i.manufacturer_part_detail)==null?void 0:o.MPN}},_e({accessor:"purchase_price",title:t._({id:"vWelsN"})}),he(),be(),{accessor:"destination",title:t._({id:"Enslfm"}),sortable:!1,render:e=>e.destination?ne({instance:e.destination_detail}):"-"},xe(),fe({})],[n,l]),b=Y({url:r.purchase_order_line_list,title:t._({id:"pwb7Yo"}),fields:S({create:!0}),initialData:{order:n},onFormSuccess:s.refreshTable}),[d,x]=p.useState(void 0),f=L({url:r.purchase_order_line_list,pk:d,title:t._({id:"vgosWS"}),fields:S({}),onFormSuccess:s.refreshTable}),y=$({url:r.purchase_order_line_list,pk:d,title:t._({id:"tpKh8C"}),onFormSuccess:s.refreshTable}),C=p.useCallback(e=>[{hidden:((e==null?void 0:e.received)??0)>=((e==null?void 0:e.quantity)??0),title:t._({id:"ul9IpB"}),icon:a.jsx(T,{}),color:"green",onClick:()=>{m(e),u.open()}},re({hidden:!l.hasChangeRole(_.purchase_order),onClick:()=>{x(e.pk),f.open()}}),pe({hidden:!l.hasAddRole(_.purchase_order)}),ce({hidden:!l.hasDeleteRole(_.purchase_order),onClick:()=>{x(e.pk),y.open()}})],[n,l]),g=p.useMemo(()=>[a.jsx(se,{tooltip:t._({id:"2vqtLo"}),onClick:()=>b.open(),hidden:!(l!=null&&l.hasAddRole(_.purchase_order))}),a.jsx(ae,{text:t._({id:"gyK1dv"}),icon:a.jsx(T,{}),onClick:()=>u.open(),disabled:s.selectedRecords.length===0})],[n,l,s]);return a.jsxs(a.Fragment,{children:[u.modal,b.modal,f.modal,y.modal,a.jsx(me,{url:q(r.purchase_order_line_list),tableState:s,columns:v,props:{enableSelection:!0,enableDownload:!0,params:{...A,order:n,part_detail:!0},rowActions:C,tableActions:g,modelType:j.supplierpart}})]})}function bt(){var d;const{id:n}=ge(),A=R(),{instance:s,instanceQuery:l,refreshInstance:h}=ee({endpoint:r.purchase_order_list,pk:n,params:{supplier_detail:!0},refetchOnMount:!0}),m=L({url:r.purchase_order_list,pk:n,title:t._({id:"lAF9Uk"}),fields:J(),onFormSuccess:()=>{h()}}),u=p.useMemo(()=>{var g;if(l.isFetching)return a.jsx(F,{});let x=[{type:"text",name:"reference",label:t._({id:"N2C89m"}),copy:!0},{type:"text",name:"supplier_reference",label:t._({id:"K7PVg3"}),icon:"reference",hidden:!s.supplier_reference,copy:!0},{type:"link",name:"supplier",icon:"suppliers",label:t._({id:"PYTEl0"}),model:j.company},{type:"text",name:"description",label:t._({id:"Nu4oKW"}),copy:!0},{type:"status",name:"status",label:t._({id:"uAQUqI"}),model:j.purchaseorder}],f=[{type:"text",name:"line_items",label:t._({id:"SgduFH"}),icon:"list"},{type:"progressbar",name:"completed",icon:"progress",label:t._({id:"qgs95u"}),total:s.line_items,progress:s.completed_lines},{type:"progressbar",name:"shipments",icon:"shipment",label:t._({id:"polrQd"}),total:s.shipments,progress:s.completed_shipments},{type:"text",name:"currency",label:t._({id:"9j2hXW"})},{type:"text",name:"total_cost",label:t._({id:"A6C0pv"})}],y=[{type:"link",external:!0,name:"link",label:t._({id:"yzF66j"}),copy:!0,hidden:!s.link},{type:"link",model:j.contact,link:!1,name:"contact",label:t._({id:"jfC/xh"}),icon:"user",copy:!0,hidden:!s.contact}],C=[{type:"text",name:"creation_date",label:t._({id:"x9P/+F"}),icon:"calendar"},{type:"text",name:"target_date",label:t._({id:"ZmykKo"}),icon:"calendar",hidden:!s.target_date},{type:"text",name:"responsible",label:t._({id:"XQACoK"}),badge:"owner",hidden:!s.responsible}];return a.jsxs(N,{children:[a.jsxs(I,{children:[a.jsx(I.Col,{span:4,children:a.jsx(U,{appRole:_.purchase_order,apiPath:r.company_list,src:(g=s.supplier_detail)==null?void 0:g.image,pk:s.supplier})}),a.jsx(I.Col,{span:8,children:a.jsx(k,{fields:x,item:s})})]}),a.jsx(k,{fields:f,item:s}),a.jsx(k,{fields:y,item:s}),a.jsx(k,{fields:C,item:s})]})},[s,l]),v=p.useMemo(()=>[{name:"detail",label:t._({id:"Tol4BF"}),icon:a.jsx(ke,{}),content:u},{name:"line-items",label:t._({id:"SgduFH"}),icon:a.jsx(je,{}),content:a.jsx(Pe,{orderId:Number(n)})},{name:"received-stock",label:t._({id:"b447qM"}),icon:a.jsx(Ae,{}),content:a.jsx(ye,{params:{purchase_order:n}})},{name:"attachments",label:t._({id:"w/Sphq"}),icon:a.jsx(ve,{}),content:a.jsx(te,{endpoint:r.purchase_order_attachment_list,model:"order",pk:Number(n)})},{name:"notes",label:t._({id:"1DBGsz"}),icon:a.jsx(Ce,{}),content:a.jsx(H,{url:q(r.purchase_order_list,n),data:s.notes??"",allowEdit:!0})}],[s,n]),b=p.useMemo(()=>[a.jsx(B,{actions:[E({}),O({hidden:s==null?void 0:s.barcode_hash}),W({hidden:!(s!=null&&s.barcode_hash)})]}),a.jsx(X,{tooltip:t._({id:"/IKytX"}),icon:a.jsx(Ie,{}),actions:[G({onClick:()=>{m.open()}}),Q({})]},"order-actions")],[n,s,A]);return a.jsxs(a.Fragment,{children:[m.modal,a.jsxs(w,{spacing:"xs",children:[a.jsx(M,{visible:l.isFetching}),a.jsx(V,{title:t._({id:"KxySMG"})+`: ${s.reference}`,subtitle:s.description,imageUrl:(d=s.supplier_detail)==null?void 0:d.image,breadcrumbs:[{name:t._({id:"UOTpFa"}),url:"/purchasing/"}],actions:b}),a.jsx(z,{pageKey:"purchaseorder",panels:v})]})]})}export{bt as default};
