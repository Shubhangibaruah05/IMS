import{r as n,j as s,G as t,aD as p,A as u,e7 as f,ae as l,e8 as x,e9 as z,ea as j,dT as I,eb as d}from"./vendor-B0vSnHFf.js";import{u as g}from"./index-CDdQlqFV.js";function y(e){var o;switch(((o=e.split(".").pop())==null?void 0:o.toLowerCase())??""){case"pdf":return s.jsx(d,{size:18});case"csv":return s.jsx(I,{size:18});case"xls":case"xlsx":return s.jsx(j,{size:18});case"doc":case"docx":return s.jsx(z,{size:18});case"zip":case"tar":case"gz":case"7z":return s.jsx(x,{size:18});case"png":case"jpg":case"jpeg":case"gif":case"bmp":case"tif":case"webp":return s.jsx(l,{size:18});default:return s.jsx(f,{size:18})}}function h({attachment:e,external:r}){let c=r?e:e.split("/").pop();const o=g(i=>i.host),a=n.useMemo(()=>r?e:`${o}${e}`,[o,e,r]);return s.jsxs(t,{justify:"left",gap:"sm",wrap:"nowrap",children:[r?s.jsx(p,{}):y(e),s.jsx(u,{href:a,target:"_blank",rel:"noopener noreferrer",children:c})]})}export{h as A};
