import{r as a,j as t,G as T,h as b}from"./vendor-C5fHLTDD.js";import{a as k,A as l,i as s,U as p,l as F}from"./index-DX4YmBvQ.js";import{A as w}from"./AddItemButton-BjrbTsCx.js";import{a as y,u as R,b as S}from"./UseForm-Btt47jru.js";import{u as j,R as C,a as M,I as v}from"./InvenTreeTable-LkhQVMZE.js";import"./ActionButton-seel8ZoK.js";import"./notifications-DM-9a7Is.js";import"./IconPlus-QsNVBJ5N.js";import"./ApiForm-Dtyf-xF2.js";import"./BaseContext-BGXKB9QI.js";import"./Instance-c0njg-mI.js";import"./IconInfoCircle-D5K91YCo.js";import"./IconTrash-KFql82qv.js";import"./IconExternalLink-CDh1KHXW.js";import"./IconQrcode-DcoHpd2K.js";import"./StylishText-CD9I8-X7.js";import"./ModelType-C8nSW6qW.js";import"./IconEdit-DwKL16RF.js";import"./IconSearch-CKaD9XHL.js";import"./DesktopAppView-DlNUv0Ur.js";import"./IconRefresh-ClXNAr2V.js";function Z({}){const o=j("part-category-parameter-templates"),r=k(),m=a.useMemo(()=>({category:{},parameter_template:{},default_value:{}}),[]),[n,u]=a.useState(0),c=y({url:l.category_parameter_list,title:s._({id:"+BLSbg"}),fields:m,onFormSuccess:o.refreshTable}),d=R({url:l.category_parameter_list,pk:n,title:s._({id:"kF/O0U"}),fields:m,onFormSuccess:e=>o.updateRecord(e)}),_=S({url:l.category_parameter_list,pk:n,title:s._({id:"O5duuA"}),onFormSuccess:o.refreshTable}),h=a.useMemo(()=>[],[]),g=a.useMemo(()=>[{accessor:"category_detail.name",title:s._({id:"K7tIrx"}),sortable:!0,switchable:!1},{accessor:"category_detail.pathstring"},{accessor:"parameter_template_detail.name",title:s._({id:"+nwoLk"}),sortable:!0,switchable:!1},{accessor:"default_value",sortable:!0,switchable:!1,render:e=>{var f;if(!(e!=null&&e.default_value))return"-";let i="";return(f=e==null?void 0:e.parameter_template_detail)!=null&&f.units&&(i=`[${e.parameter_template_detail.units}]`),t.jsxs(T,{position:"apart",grow:!0,children:[t.jsx(b,{children:e.default_value}),i&&t.jsx(b,{size:"xs",children:i})]})}}],[]),x=a.useCallback(e=>[C({hidden:!r.hasChangeRole(p.part),onClick:()=>{u(e.pk),d.open()}}),M({hidden:!r.hasDeleteRole(p.part),onClick:()=>{u(e.pk),_.open()}})],[r]),A=a.useMemo(()=>[t.jsx(w,{tooltip:s._({id:"+BLSbg"}),onClick:()=>c.open(),hidden:!r.hasAddRole(p.part)})],[r]);return t.jsxs(t.Fragment,{children:[c.modal,d.modal,_.modal,t.jsx(v,{url:F(l.category_parameter_list),tableState:o,columns:g,props:{rowActions:x,tableFilters:h,tableActions:A}})]})}export{Z as default};
