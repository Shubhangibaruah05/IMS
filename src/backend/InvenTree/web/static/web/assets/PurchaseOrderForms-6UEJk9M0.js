import{j as e,r as l,F as V,af as _,M as D,b7 as R,ac as B,a8 as f,aH as M}from"./vendor-C5fHLTDD.js";import{l as y,A as v,i as a,M as H,j as K}from"./index-DX4YmBvQ.js";import{A as c}from"./ActionButton-seel8ZoK.js";import{S as g}from"./StandaloneField-BRVMmltH.js";import{I as N,T as U}from"./Instance-c0njg-mI.js";import{P as z}from"./ProgressBar-BhbAlmdB.js";import{S as G}from"./StylishText-CD9I8-X7.js";import{l as J,x as Q,y as A,j as W,z as Y,g as Z,a as o}from"./ApiForm-Dtyf-xF2.js";import{a as X}from"./UseForm-Btt47jru.js";import{I as T}from"./IconCoins-B2Q7vuLB.js";import{I as $}from"./IconAddressBook-DD_FnNjd.js";import{I as ee}from"./IconUsers-VfNlX2pM.js";import{I as te}from"./notifications-DM-9a7Is.js";function je({create:t}){const[i,u]=l.useState(""),[d,p]=l.useState(!0);return l.useEffect(()=>{d&&u("")},[d]),l.useEffect(()=>{p(i==="")},[i]),l.useMemo(()=>{const n={order:{filters:{supplier_detail:!0},hidden:!0},part:{filters:{part_detail:!0,supplier_detail:!0},adjustFilters:r=>r.filters},quantity:{},reference:{},purchase_price:{icon:e.jsx(W,{}),value:i,onValueChange:u},purchase_price_currency:{icon:e.jsx(T,{})},auto_pricing:{value:d,onValueChange:p},target_date:{icon:e.jsx(A,{})},destination:{icon:e.jsx(Y,{})},notes:{icon:e.jsx(Z,{})},link:{icon:e.jsx(te,{})}};return t&&(n.merge_items={}),n},[t,d,i])}function he(){return{reference:{icon:e.jsx(J,{})},description:{},supplier:{filters:{is_supplier:!0}},supplier_reference:{},project_code:{icon:e.jsx(Q,{})},order_currency:{icon:e.jsx(T,{})},target_date:{icon:e.jsx(A,{})},link:{},contact:{icon:e.jsx(N,{}),adjustFilters:t=>({...t.filters,company:t.data.supplier})},address:{icon:e.jsx($,{}),adjustFilters:t=>({...t.filters,company:t.data.supplier})},responsible:{icon:e.jsx(ee,{})}}}function ie({input:t,record:i,statuses:u}){const[d,{open:p,close:m}]=_(!1),[n,r]=l.useState(t.item.location??i.part_detail.default_location??i.part_detail.category_default_location),[x,j]=_(!!n,{onClose:()=>t.changeFn(t.idx,"location",null),onOpen:()=>t.changeFn(t.idx,"location",n)});l.useEffect(()=>{t.changeFn(t.idx,"location",n)},[n]);const[b,q]=l.useState(""),[C,P]=l.useState(""),[I,E]=_(!1,{onClose:()=>{t.changeFn(t.idx,"batch_code",""),t.changeFn(t.idx,"serial_numbers","")}});l.useEffect(()=>{t.changeFn(t.idx,"batch_code",b)},[b]),l.useEffect(()=>{t.changeFn(t.idx,"serial_numbers",C)},[C]);const[F,L]=_(!1,{onClose:()=>t.changeFn(t.idx,"status",10)}),[h,S]=l.useState(""),[k,w]=l.useState(null);l.useEffect(()=>{t.changeFn(t.idx,"barcode",k)},[k]),l.useEffect(()=>{if(!d)return;const s=setTimeout(()=>{w(h.length?h:null),m(),S("")},500);return()=>clearTimeout(s)},[h]);const O=l.useMemo(()=>{let s=a._({id:"RL9/J8"});return n===null?s:n===i.destination?a._({id:"LNKjyK"}):!i.destination&&!i.destination_detail&&n===i.part_detail.category_default_location?a._({id:"q3WAIO"}):!i.destination&&i.destination_detail&&n===i.destination_detail.pk&&i.received>0?a._({id:"K1Mf+T"}):n===i.part_detail.default_location?a._({id:"ALFlH9"}):s},[n]);return e.jsxs(e.Fragment,{children:[e.jsx(D,{opened:d,onClose:m,title:e.jsx(G,{children:a._({id:"fNvDwV"})}),children:e.jsx(R,{children:e.jsx(B,{label:"Barcode data","data-autofocus":!0,value:h,onChange:s=>S(s.target.value)})})}),e.jsxs("tr",{children:[e.jsx("td",{children:e.jsxs(f,{gap:"sm",align:"center",children:[e.jsx(U,{size:40,src:i.part_detail.thumbnail,align:"center"}),e.jsx("div",{children:i.part_detail.name})]})}),e.jsx("td",{children:i.supplier_part_detail.SKU}),e.jsx("td",{children:e.jsx(z,{value:i.received,maximum:i.quantity,progressLabel:!0})}),e.jsx("td",{style:{width:"1%",whiteSpace:"nowrap"},children:e.jsx(M,{value:t.item.quantity,style:{width:"100px"},max:t.item.quantity,min:0,onChange:s=>t.changeFn(t.idx,"quantity",s)})}),e.jsx("td",{style:{width:"1%",whiteSpace:"nowrap"},children:e.jsxs(f,{gap:"1px",children:[e.jsx(c,{onClick:()=>j.toggle(),icon:e.jsx(o,{icon:"location"}),tooltip:a._({id:"TJYLHZ"}),tooltipAlignment:"top",variant:x?"filled":"outline"}),e.jsx(c,{onClick:()=>E.toggle(),icon:e.jsx(o,{icon:"batch_code"}),tooltip:a._({id:"G8Z9OY",values:{0:i.trackable&&" and Serial Numbers"}}),tooltipAlignment:"top",variant:I?"filled":"outline"}),e.jsx(c,{onClick:()=>L.toggle(),icon:e.jsx(o,{icon:"status"}),tooltip:a._({id:"Gt4cm5"}),tooltipAlignment:"top",variant:F?"filled":"outline"}),k?e.jsx(c,{icon:e.jsx(o,{icon:"unlink"}),tooltip:a._({id:"ut1J8k"}),tooltipAlignment:"top",variant:"filled",color:"red",onClick:()=>w(null)}):e.jsx(c,{icon:e.jsx(o,{icon:"barcode"}),tooltip:a._({id:"fNvDwV"}),tooltipAlignment:"top",variant:"outline",onClick:()=>p()}),e.jsx(c,{onClick:()=>t.removeFn(t.idx),icon:e.jsx(o,{icon:"square_x"}),tooltip:a._({id:"zMFs5V"}),tooltipAlignment:"top",color:"red"})]})})]}),x&&e.jsxs("tr",{children:[e.jsx("td",{colSpan:4,children:e.jsxs(f,{align:"end",gap:5,children:[e.jsx("div",{style:{flexGrow:"1"},children:e.jsx(g,{fieldDefinition:{field_type:"related field",model:H.stocklocation,api_url:y(v.stock_location_list),filters:{structural:!1},onValueChange:s=>{r(s)},description:O,value:n,label:a._({id:"wJijgU"}),icon:e.jsx(o,{icon:"location"})},defaultValue:i.destination??(i.destination_detail?i.destination_detail.pk:null)})}),e.jsxs(f,{style:{marginBottom:"7px"},children:[(i.part_detail.default_location||i.part_detail.category_default_location)&&e.jsx(c,{icon:e.jsx(o,{icon:"default_location"}),tooltip:a._({id:"j9qXAA"}),onClick:()=>r(i.part_detail.default_location??i.part_detail.category_default_location),tooltipAlignment:"top"}),i.destination&&e.jsx(c,{icon:e.jsx(o,{icon:"destination"}),tooltip:a._({id:"NOgnJu"}),onClick:()=>r(i.destination),tooltipAlignment:"top"}),!i.destination&&i.destination_detail&&i.received>0&&e.jsx(c,{icon:e.jsx(o,{icon:"repeat_destination"}),tooltip:a._({id:"CKgjtC"}),onClick:()=>r(i.destination_detail.pk),tooltipAlignment:"top"})]})]})}),e.jsx("td",{children:e.jsx("div",{style:{height:"100%",display:"grid",gridTemplateColumns:"repeat(6, 1fr)",gridTemplateRows:"auto",alignItems:"end"},children:e.jsx(o,{icon:"downleft"})})})]}),I&&e.jsxs(e.Fragment,{children:[e.jsxs("tr",{children:[e.jsx("td",{colSpan:4,children:e.jsx(f,{align:"end",gap:5,children:e.jsx("div",{style:{flexGrow:"1"},children:e.jsx(g,{fieldDefinition:{field_type:"string",onValueChange:s=>q(s),label:"Batch Code",value:b}})})})}),e.jsx("td",{children:e.jsxs("div",{style:{height:"100%",display:"grid",gridTemplateColumns:"repeat(6, 1fr)",gridTemplateRows:"auto",alignItems:"end"},children:[e.jsx("span",{}),e.jsx(o,{icon:"downleft"})]})})]}),i.trackable&&e.jsxs("tr",{children:[e.jsx("td",{colSpan:4,children:e.jsx(f,{align:"end",gap:5,children:e.jsx("div",{style:{flexGrow:"1"},children:e.jsx(g,{fieldDefinition:{field_type:"string",onValueChange:s=>P(s),label:"Serial numbers",value:C}})})})}),e.jsx("td",{children:e.jsxs("div",{style:{height:"100%",display:"grid",gridTemplateColumns:"repeat(6, 1fr)",gridTemplateRows:"auto",alignItems:"end"},children:[e.jsx("span",{}),e.jsx(o,{icon:"downleft"})]})})]})]}),F&&e.jsxs("tr",{children:[e.jsx("td",{colSpan:4,children:e.jsx(g,{fieldDefinition:{field_type:"choice",api_url:y(v.stock_status),choices:u,label:"Status",onValueChange:s=>t.changeFn(t.idx,"status",s)},defaultValue:10})}),e.jsx("td",{children:e.jsxs("div",{style:{height:"100%",display:"grid",gridTemplateColumns:"repeat(6, 1fr)",gridTemplateRows:"auto",alignItems:"end"},children:[e.jsx("span",{}),e.jsx("span",{}),e.jsx(o,{icon:"downleft"})]})})]})]})}function _e(t){const{data:i}=V({queryKey:["stock","status"],queryFn:async()=>K.get(y(v.stock_status)).then(n=>{if(n.status===200)return Object.values(n.data.values).map(j=>({value:j.key,display_name:j.label}))})}),u=Object.fromEntries(t.items.map(n=>[n.pk,n])),d=t.items.filter(n=>n.quantity!==n.received),p={id:{value:t.orderPk,hidden:!0},items:{field_type:"table",value:d.map((n,r)=>{var x;return{line_item:n.pk,location:n.destination??((x=n.destination_detail)==null?void 0:x.pk)??null,quantity:n.quantity-n.received,batch_code:"",serial_numbers:"",status:10,barcode:null}}),modelRenderer:n=>{const r=u[n.item.line_item];return e.jsx(ie,{input:n,record:r,statuses:i},r.pk)},headers:["Part","SKU","Received","Quantity to receive","Actions"]},location:{filters:{structural:!1}}},m=y(v.purchase_order_receive,null,{id:t.orderPk});return X({...t.formProps,url:m,title:a._({id:"z1u8Wy"}),fields:p,initialData:{location:null},size:"max(60%,800px)"})}export{je as a,he as p,_e as u};
