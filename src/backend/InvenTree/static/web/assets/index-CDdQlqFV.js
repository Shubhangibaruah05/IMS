const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/MobileAppView-D6cuDd8f.js","assets/vendor-B0vSnHFf.js","assets/BaseContext-DSwOqL9e.js","assets/links-CGjHD3g5.js","assets/StylishText-CrpvZzAV.js","assets/StylishText-S21LNg1B.css","assets/DesktopAppView-CofLSp00.js"])))=>i.map(i=>d[i]);
import{c as w,p as j,a as D,b as $,n as S,i as d,j as m,I as B,d as X,e as F,Q as H,f as J,t as K,g as Y,r as R,M as Q,S as Z,C as M,L as E,u as A,h as ee,k as te,R as re}from"./vendor-B0vSnHFf.js";(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const l of o.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&s(l)}).observe(document,{childList:!0,subtree:!0});function t(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(a){if(a.ep)return;a.ep=!0;const o=t(a);fetch(a.href,o)}})();const ae="modulepreload",se=function(e){return"/"+e},V={},G=function(r,t,s){let a=Promise.resolve();if(t&&t.length>0){const o=document.getElementsByTagName("link"),l=document.querySelector("meta[property=csp-nonce]"),u=(l==null?void 0:l.nonce)||(l==null?void 0:l.getAttribute("nonce"));a=Promise.all(t.map(i=>{if(i=se(i),i in V)return;V[i]=!0;const f=i.endsWith(".css"),C=f?'[rel="stylesheet"]':"";if(!!s)for(let L=o.length-1;L>=0;L--){const x=o[L];if(x.href===i&&(!f||x.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${i}"]${C}`))return;const k=document.createElement("link");if(k.rel=f?"stylesheet":ae,f||(k.as="script",k.crossOrigin=""),k.href=i,u&&k.setAttribute("nonce",u),document.head.appendChild(k),f)return new Promise((L,x)=>{k.addEventListener("load",L),k.addEventListener("error",()=>x(new Error(`Unable to preload CSS for ${i}`)))})}))}return a.then(()=>r()).catch(o=>{const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=o,window.dispatchEvent(l),!l.defaultPrevented)throw o})},I=w()(j((e,r)=>({autoupdate:!1,toggleAutoupdate:()=>e(t=>({autoupdate:!t.autoupdate})),host:"",setHost:(t,s)=>e({host:t,hostKey:s}),hostKey:"",hostList:{},setHostList:t=>e({hostList:t}),language:"en",setLanguage:t=>e({language:t}),primaryColor:"indigo",whiteColor:"#fff",blackColor:"#000",radius:"xs",loader:"oval",setLoader(t){e({loader:t})},lastUsedPanels:{},setLastUsedPanel:t=>s=>{r().lastUsedPanels[t]!==s&&e({lastUsedPanels:{...r().lastUsedPanels,[t]:s}})},tableColumnNames:{},getTableColumnNames:t=>r().tableColumnNames[t]||{},setTableColumnNames:t=>s=>{e({tableColumnNames:{...r().tableColumnNames,[t]:s}})},clearTableColumnNames:()=>{e({tableColumnNames:{}})},tableSorting:{},getTableSorting:t=>r().tableSorting[t]||{},setTableSorting:t=>s=>{e({tableSorting:{...r().tableSorting,[t]:s}})},detailDrawerStack:0,addDetailDrawer:t=>{e({detailDrawerStack:t===!1?0:r().detailDrawerStack+t})},navigationOpen:!1,setNavigationOpen:t=>{e({navigationOpen:t})},allowMobile:!1,setAllowMobile:t=>{e({allowMobile:t})}}),{name:"session-settings"}));var n=(e=>(e.api_server_info="",e.user_list="user/",e.user_me="user/me/",e.user_roles="user/roles/",e.user_token="user/token/",e.user_tokens="user/tokens/",e.user_simple_login="email/generate/",e.user_reset="auth/password/reset/",e.user_reset_set="auth/password/reset/confirm/",e.user_sso="auth/social/",e.user_sso_remove="auth/social/:id/disconnect/",e.user_emails="auth/emails/",e.user_email_remove="auth/emails/:id/remove/",e.user_email_verify="auth/emails/:id/verify/",e.user_email_primary="auth/emails/:id/primary/",e.user_login="auth/login/",e.user_logout="auth/logout/",e.user_register="auth/registration/",e.currency_list="currency/exchange/",e.currency_refresh="currency/refresh/",e.task_overview="background-task/",e.task_pending_list="background-task/pending/",e.task_scheduled_list="background-task/scheduled/",e.task_failed_list="background-task/failed/",e.api_search="search/",e.settings_global_list="settings/global/",e.settings_user_list="settings/user/",e.barcode="barcode/",e.barcode_link="barcode/link/",e.barcode_unlink="barcode/unlink/",e.generate_barcode="barcode/generate/",e.news="news/",e.global_status="generic/status/",e.custom_state_list="generic/status/custom/",e.version="version/",e.license="license/",e.sso_providers="auth/providers/",e.group_list="user/group/",e.owner_list="user/owner/",e.content_type_list="contenttype/",e.icons="icons/",e.import_session_list="importer/session/",e.import_session_accept_fields="importer/session/:id/accept_fields/",e.import_session_accept_rows="importer/session/:id/accept_rows/",e.import_session_column_mapping_list="importer/column-mapping/",e.import_session_row_list="importer/row/",e.notifications_list="notifications/",e.notifications_readall="notifications/readall/",e.build_order_list="build/",e.build_order_issue="build/:id/issue/",e.build_order_cancel="build/:id/cancel/",e.build_order_hold="build/:id/hold/",e.build_order_complete="build/:id/finish/",e.build_output_complete="build/:id/complete/",e.build_output_create="build/:id/create-output/",e.build_output_scrap="build/:id/scrap-outputs/",e.build_output_delete="build/:id/delete-outputs/",e.build_line_list="build/line/",e.build_item_list="build/item/",e.bom_list="bom/",e.bom_item_validate="bom/:id/validate/",e.bom_validate="part/:id/bom-validate/",e.part_list="part/",e.part_parameter_list="part/parameter/",e.part_parameter_template_list="part/parameter/template/",e.part_thumbs_list="part/thumbs/",e.part_pricing_get="part/:id/pricing/",e.part_serial_numbers="part/:id/serial-numbers/",e.part_pricing_internal="part/internal-price/",e.part_pricing_sale="part/sale-price/",e.part_stocktake_list="part/stocktake/",e.category_list="part/category/",e.category_tree="part/category/tree/",e.category_parameter_list="part/category/parameters/",e.related_part_list="part/related/",e.part_test_template_list="part/test-template/",e.company_list="company/",e.contact_list="company/contact/",e.address_list="company/address/",e.supplier_part_list="company/part/",e.supplier_part_pricing_list="company/price-break/",e.manufacturer_part_list="company/part/manufacturer/",e.manufacturer_part_parameter_list="company/part/manufacturer/parameter/",e.stock_item_list="stock/",e.stock_tracking_list="stock/track/",e.stock_location_list="stock/location/",e.stock_location_type_list="stock/location-type/",e.stock_location_tree="stock/location/tree/",e.stock_test_result_list="stock/test/",e.stock_transfer="stock/transfer/",e.stock_remove="stock/remove/",e.stock_add="stock/add/",e.stock_count="stock/count/",e.stock_change_status="stock/change_status/",e.stock_merge="stock/merge/",e.stock_assign="stock/assign/",e.stock_status="stock/status/",e.stock_install="stock/:id/install",e.build_test_statistics="test-statistics/by-build/:id",e.part_test_statistics="test-statistics/by-part/:id",e.generate_batch_code="generate/batch-code/",e.generate_serial_number="generate/serial-number/",e.purchase_order_list="order/po/",e.purchase_order_issue="order/po/:id/issue/",e.purchase_order_hold="order/po/:id/hold/",e.purchase_order_cancel="order/po/:id/cancel/",e.purchase_order_complete="order/po/:id/complete/",e.purchase_order_line_list="order/po-line/",e.purchase_order_extra_line_list="order/po-extra-line/",e.purchase_order_receive="order/po/:id/receive/",e.sales_order_list="order/so/",e.sales_order_issue="order/so/:id/issue/",e.sales_order_hold="order/so/:id/hold/",e.sales_order_cancel="order/so/:id/cancel/",e.sales_order_ship="order/so/:id/ship/",e.sales_order_complete="order/so/:id/complete/",e.sales_order_line_list="order/so-line/",e.sales_order_extra_line_list="order/so-extra-line/",e.sales_order_allocation_list="order/so-allocation/",e.sales_order_shipment_list="order/so/shipment/",e.return_order_list="order/ro/",e.return_order_issue="order/ro/:id/issue/",e.return_order_hold="order/ro/:id/hold/",e.return_order_cancel="order/ro/:id/cancel/",e.return_order_complete="order/ro/:id/complete/",e.return_order_line_list="order/ro-line/",e.return_order_extra_line_list="order/ro-extra-line/",e.label_list="label/template/",e.label_print="label/print/",e.label_output="label/output/",e.report_list="report/template/",e.report_print="report/print/",e.report_output="report/output/",e.report_snippet="report/snippet/",e.report_asset="report/asset/",e.plugin_list="plugins/",e.plugin_setting_list="plugins/:plugin/settings/",e.plugin_registry_status="plugins/status/",e.plugin_install="plugins/install/",e.plugin_reload="plugins/reload/",e.plugin_activate="plugins/:key/activate/",e.plugin_uninstall="plugins/:key/uninstall/",e.machine_types_list="machine/types/",e.machine_driver_list="machine/drivers/",e.machine_registry_status="machine/status/",e.machine_list="machine/",e.machine_restart="machine/:machine/restart/",e.machine_setting_list="machine/:machine/settings/",e.machine_setting_detail="machine/:machine/settings/:config_type/",e.attachment_list="attachment/",e.error_report_list="error-report/",e.project_code_list="project-code/",e.custom_unit_list="units/",e.ui_preference="web/ui_preference/",e.notes_image_upload="notes-image-upload/",e))(n||{}),oe=(e=>(e.admin="admin",e.build="build",e.part="part",e.part_category="part_category",e.purchase_order="purchase_order",e.return_order="return_order",e.sales_order="sales_order",e.stock="stock",e.stock_location="stock_location",e.stocktake="stocktake",e))(oe||{}),g=(e=>(e.view="view",e.add="add",e.change="change",e.delete="delete",e))(g||{});const le={server:null,version:null,instance:null,apiVersion:null,worker_running:null,worker_pending_tasks:null,plugins_enabled:null,plugins_install_disabled:null,active_plugins:[],email_configured:null,debug_mode:null,docker_mode:null,database:null,system_health:null,platform:null,installer:null,target:null,default_locale:null},xe=[{value:0,label:"xs"},{value:25,label:"sm"},{value:50,label:"md"},{value:75,label:"lg"},{value:100,label:"xl"}],ie=w()(j(e=>({server:le,setServer:r=>e({server:r}),fetchServerApiState:async()=>{await c.get(_(n.api_server_info)).then(r=>{e({server:r.data})}).catch(()=>{console.error("ERR: Error fetching server info")}),await c.get(_(n.sso_providers),{headers:{Authorization:""}}).then(r=>{e({auth_settings:r.data})}).catch(()=>{console.error("ERR: Error fetching SSO information")})},status:void 0}),{name:"server-api-state",storage:D(()=>sessionStorage)}));function ce(){return"/api/"}function _(e,r,t){let s=e;if(s.startsWith("/")||(s=ce()+s),s&&r&&(s.indexOf(":id")>=0?s=s.replace(":id",`${r}`):s+=`${r}/`),s&&t)for(const a in t)s=s.replace(`:${a}`,`${t[a]}`);return s}const ne=w()((e,r)=>({hasLoaded:!1,packages:[],packagesMap:{},fetchIcons:async()=>{if(r().hasLoaded)return;const t=I.getState().host,s=await c.get(_(n.icons));await Promise.all(s.data.map(async a=>{const o=`inventree-icon-font-${a.prefix}`,l=Object.entries(a.fonts).map(([i,f])=>`url(${f.startsWith("/")?t+f:f}) format("${i}")`).join(`,
`),u=new FontFace(o,l+";");return await u.load(),document.fonts.add(u),u})),e({hasLoaded:!0,packages:s.data,packagesMap:Object.fromEntries(s.data.map(a=>[a.prefix,a]))})}}));function p(e){if(e===!0)return!0;if(e===!1)return!1;let r=String(e).trim().toLowerCase();return["true","yes","1","on","t","y"].includes(r)}function Re(e,r){return r.split(".").reduce((s,a)=>s==null?void 0:s[a],e)}function pe(e){return e=e||"-",e.toLowerCase().replace(/[^a-z0-9]/g,"-")}const ue=w((e,r)=>({settings:[],lookup:{},endpoint:n.settings_global_list,fetchSettings:async()=>{const{isLoggedIn:t}=b.getState();t()&&await c.get(_(n.settings_global_list)).then(s=>{e({settings:s.data,lookup:N(s.data)})}).catch(s=>{console.error("ERR: Error fetching global settings")})},getSetting:(t,s)=>r().lookup[t]??s??"",isSet:(t,s)=>{let a=r().lookup[t]??s??"false";return p(a)}})),_e=w((e,r)=>({settings:[],lookup:{},endpoint:n.settings_user_list,fetchSettings:async()=>{const{isLoggedIn:t}=b.getState();t()&&await c.get(_(n.settings_user_list)).then(s=>{e({settings:s.data,lookup:N(s.data)})}).catch(s=>{console.error("ERR: Error fetching user settings")})},getSetting:(t,s)=>r().lookup[t]??s??"",isSet:(t,s)=>{let a=r().lookup[t]??s??"false";return p(a)}})),Ne=({plugin:e})=>{const r={plugin:e};return $()((t,s)=>({settings:[],lookup:{},endpoint:n.plugin_setting_list,pathParams:r,fetchSettings:async()=>{await c.get(_(n.plugin_setting_list,void 0,{plugin:e})).then(a=>{const o=a.data;t({settings:o,lookup:N(o)})}).catch(a=>{console.error(`Error fetching plugin settings for plugin ${e}`)})},getSetting:(a,o)=>s().lookup[a]??o??"",isSet:(a,o)=>{let l=s().lookup[a]??o??"false";return p(l)}}))},Pe=({machine:e,configType:r})=>{const t={machine:e,config_type:r};return $()((s,a)=>({settings:[],lookup:{},endpoint:n.machine_setting_detail,pathParams:t,fetchSettings:async()=>{await c.get(_(n.machine_setting_list,void 0,{machine:e})).then(o=>{const l=o.data.filter(u=>u.config_type===r);s({settings:l,lookup:N(l)})}).catch(o=>{console.error(`Error fetching machine settings for machine ${e} with type ${r}:`,o)})},getSetting:(o,l)=>a().lookup[o]??l??"",isSet:(o,l)=>{let u=a().lookup[o]??l??"false";return p(u)}}))};function N(e){let r={};for(let t of e)r[t.key]=t.value;return r}var h=(e=>(e.part="part",e.supplierpart="supplierpart",e.manufacturerpart="manufacturerpart",e.partcategory="partcategory",e.partparametertemplate="partparametertemplate",e.parttesttemplate="parttesttemplate",e.projectcode="projectcode",e.stockitem="stockitem",e.stocklocation="stocklocation",e.stocklocationtype="stocklocationtype",e.stockhistory="stockhistory",e.build="build",e.buildline="buildline",e.builditem="builditem",e.company="company",e.purchaseorder="purchaseorder",e.purchaseorderlineitem="purchaseorderlineitem",e.salesorder="salesorder",e.salesordershipment="salesordershipment",e.returnorder="returnorder",e.returnorderlineitem="returnorderlineitem",e.importsession="importsession",e.address="address",e.contact="contact",e.owner="owner",e.user="user",e.group="group",e.reporttemplate="reporttemplate",e.labeltemplate="labeltemplate",e.pluginconfig="pluginconfig",e.contenttype="contenttype",e))(h||{});const de={BuildStatus:h.build,PurchaseOrderStatus:h.purchaseorder,ReturnOrderStatus:h.returnorder,ReturnOrderLineStatus:h.returnorderlineitem,SalesOrderStatus:h.salesorder,StockHistoryCode:h.stockhistory,StockStatus:h.stockitem,DataImportStatusCode:h.importsession},je={dark:"dark",warning:"yellow",success:"green",info:"cyan",danger:"red",primary:"blue",secondary:"gray",default:"gray"},me=w()(j(e=>({status:void 0,setStatus:r=>e({status:r}),fetchStatus:async()=>{const{isLoggedIn:r}=b.getState();r()&&await c.get(_(n.global_status)).then(t=>{const s={};for(const a in t.data)s[de[a]||a]=t.data[a].values;e({status:s})}).catch(()=>{console.error("ERR: Error fetching global status information")})}}),{name:"global-status-state",storage:D(()=>sessionStorage)}));function q(){const{isLoggedIn:e}=b.getState();e()&&(y(),ie.getState().fetchServerApiState(),_e.getState().fetchSettings(),ue.getState().fetchSettings(),me.getState().fetchStatus(),ne.getState().fetchIcons())}function Oe(){S.show({title:d._({id:"ipE2p4"}),message:d._({id:"WvSApV"}),color:"red"})}function Ue(){S.show({title:d._({id:"sJK6pq"}),message:d._({id:"3WjGlZ"}),color:"red"})}function Ve(e){S.show({title:d._({id:"J7PX+R"}),message:d._({id:"78bD8l",values:{returnCode:e}}),color:"red"})}function z({title:e,message:r,success:t=!0}){S.hide("login"),S.show({title:e,message:r,color:t?"green":"red",icon:t?m.jsx(B,{}):m.jsx(X,{}),id:"login",autoClose:5e3})}function fe(e,r,t="post"){const s=document.createElement("form");s.method=t,s.action=e;for(const a in r)if(r.hasOwnProperty(a)){const o=document.createElement("input");o.type="hidden",o.name=a,o.value=r[a],s.appendChild(o)}document.body.appendChild(s),s.submit()}const De=async(e,r)=>{const{host:t}=I.getState(),{clearUserState:s,setToken:a,fetchUserState:o}=b.getState();if(e.length==0||r.length==0)return;O();const l=_(n.user_login);let u=!1;await c.post(l,{username:e,password:r},{baseURL:t}).then(i=>{i.status==200&&i.data.key&&(a(i.data.key),u=!0)}).catch(i=>{var f,C,P;((f=i==null?void 0:i.response)==null?void 0:f.status)==403&&((P=(C=i==null?void 0:i.response)==null?void 0:C.data)==null?void 0:P.detail)=="MFA required for this user"&&fe(_(n.user_login),{username:e,password:r,csrfmiddlewaretoken:T(),mfa:!0})}),u?(await o(),q()):s()},$e=async e=>{const{clearUserState:r,isLoggedIn:t}=b.getState();(t()||T())&&(await c.post(_(n.user_logout)).catch(()=>{}),z({title:d._({id:"nXipgk"}),message:d._({id:"DMjmJd"})})),r(),O(),e("/login")},Fe=async e=>{const{host:r}=I.getState();return await F.post(_(n.user_simple_login),{email:e},{baseURL:r,timeout:2e3}).then(s=>s.data).catch(s=>!1)};function Ge(e,r){c.post(_(n.user_reset),r,{headers:{Authorization:""}}).then(t=>{t.status===200?(S.show({title:d._({id:"XAIcYu"}),message:d._({id:"eX0txO"}),color:"green",autoClose:!1}),e("/login")):S.show({title:d._({id:"WhimMi"}),message:d._({id:"tnaYa/"}),color:"red"})})}const qe=async(e,r,t)=>{y(),r=="/"&&(r="/home");const{isLoggedIn:s,fetchUserState:a}=b.getState(),o=()=>{z({title:d._({id:"bNsW3s"}),message:d._({id:"IBfR77"})}),q(),e(r??"/home")},l=()=>{t||e("/login",{state:{redirectFrom:r}})};if(s()){o();return}await a(),s()?o():l()};function T(){var r;return(r=document.cookie.split("; ").find(t=>t.startsWith("csrftoken=")))==null?void 0:r.split("=")[1]}function O(){document.cookie="csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"}const b=w((e,r)=>({user:void 0,token:void 0,setToken:t=>{e({token:t}),y()},clearToken:()=>{e({token:void 0}),y()},username:()=>{const t=r().user;return t!=null&&t.first_name||t!=null&&t.last_name?`${t.first_name} ${t.last_name}`.trim():(t==null?void 0:t.username)??""},setUser:t=>e({user:t}),clearUserState:()=>{e({user:void 0}),e({token:void 0}),O(),y()},fetchUserToken:async()=>{await c.get(_(n.user_token)).then(t=>{t.status==200&&t.data.token?r().setToken(t.data.token):r().clearToken()}).catch(()=>{r().clearToken()})},fetchUserState:async()=>{r().token||await r().fetchUserToken(),await c.get(_(n.user_me),{timeout:2e3}).then(t=>{var s,a;if(t.status==200){const o={pk:t.data.pk,first_name:((s=t.data)==null?void 0:s.first_name)??"",last_name:((a=t.data)==null?void 0:a.last_name)??"",email:t.data.email,username:t.data.username};e({user:o})}else r().clearUserState()}).catch(()=>{r().clearUserState()}),r().isLoggedIn()&&await c.get(_(n.user_roles)).then(t=>{var s,a,o,l;if(t.status==200){const u=r().user;u&&(u.roles=((s=t.data)==null?void 0:s.roles)??{},u.permissions=((a=t.data)==null?void 0:a.permissions)??{},u.is_staff=((o=t.data)==null?void 0:o.is_staff)??!1,u.is_superuser=((l=t.data)==null?void 0:l.is_superuser)??!1,e({user:u}))}else r().clearUserState()}).catch(t=>{console.error("ERR: Error fetching user roles"),r().clearUserState()})},isLoggedIn:()=>{if(!r().token)return!1;const t=r().user;return!!t&&!!t.pk},isStaff:()=>{const t=r().user;return(t==null?void 0:t.is_staff)??!1},isSuperuser:()=>{const t=r().user;return(t==null?void 0:t.is_superuser)??!1},checkUserRole:(t,s)=>{var o;const a=r().user;return a?a!=null&&a.is_superuser?!0:(a==null?void 0:a.roles)===void 0||(a==null?void 0:a.roles[t])===void 0||(a==null?void 0:a.roles[t])===null?!1:((o=a==null?void 0:a.roles[t])==null?void 0:o.includes(s))??!1:!1},hasDeleteRole:t=>r().checkUserRole(t,g.delete),hasChangeRole:t=>r().checkUserRole(t,g.change),hasAddRole:t=>r().checkUserRole(t,g.add),hasViewRole:t=>r().checkUserRole(t,g.view),checkUserPermission:(t,s)=>{var o;const a=r().user;return a?a!=null&&a.is_superuser?!0:(a==null?void 0:a.permissions)===void 0||(a==null?void 0:a.permissions[t])===void 0||(a==null?void 0:a.permissions[t])===null?!1:((o=a==null?void 0:a.permissions[t])==null?void 0:o.includes(s))??!1:!1},hasDeletePermission:t=>r().checkUserPermission(t,g.delete),hasChangePermission:t=>r().checkUserPermission(t,g.change),hasAddPermission:t=>r().checkUserPermission(t,g.add),hasViewPermission:t=>r().checkUserPermission(t,g.view)})),c=F.create({});function y(){const e=I.getState().host,r=b.getState().token;c.defaults.baseURL=e,c.defaults.timeout=2500,c.defaults.withCredentials=!0,c.defaults.withXSRFToken=!0,c.defaults.xsrfCookieName="csrftoken",c.defaults.xsrfHeaderName="X-CSRFToken",r?c.defaults.headers.Authorization=`Token ${r}`:delete c.defaults.headers.Authorization}const ze=new H({defaultOptions:{queries:{refetchOnWindowFocus:!1}}});function ge({key:e="mantine-color-scheme"}={}){let r;return{get:t=>{if(typeof window>"u")return t;try{return window.localStorage.getItem(e)||t}catch{return t}},set:t=>{try{window.localStorage.setItem(e,t)}catch(s){console.warn("[@mantine/core] Local storage color scheme manager was unable to save color scheme.",s)}},subscribe:t=>{r=s=>{s.storageArea===window.localStorage&&s.key===e&&J(s.newValue)&&t(s.newValue)},window.addEventListener("storage",r)},unsubscribe:()=>{window.removeEventListener("storage",r)},clear:()=>{window.localStorage.removeItem(e)}}}const he=ge({key:"scheme"}),W=Y({}),Te=K(W);function ke(){return m.jsx(Q,{theme:W,colorSchemeManager:he,children:m.jsx(Z,{children:m.jsx(M,{children:m.jsx(E,{})})})})}const U=e=>r=>m.jsx(R.Suspense,{fallback:m.jsx(ke,{}),children:m.jsx(e,{...r})});function We({item:e}){const r=U(e);return m.jsx(r,{})}function be(){const{height:e,width:r}=A();return r<425||e<425}const Se=U(R.lazy(()=>G(()=>import("./MobileAppView-D6cuDd8f.js"),__vite__mapDeps([0,1,2,3,4,5])))),we=U(R.lazy(()=>G(()=>import("./DesktopAppView-CofLSp00.js").then(e=>e.D),__vite__mapDeps([6,1,2]))));function ve(){const[e]=I(r=>[r.allowMobile]);return R.useEffect(()=>{y()},[]),!e&&be()?m.jsx(Se,{}):m.jsx(we,{})}const Be=!1,ye=!1,Le=ye;let v=window.INVENTREE_SETTINGS||{};Object.keys(v).forEach(e=>{(v[e]===void 0||e==="server_list"&&v[e].length===0)&&delete v[e]});window.INVENTREE_SETTINGS={server_list:{"mantine-cqj63coxn":{host:`${window.location.origin}/`,name:"Current Server"}},default_server:"mantine-cqj63coxn",show_server_selector:Le,...v};window.INVENTREE_SETTINGS.sentry_dsn&&(console.log("Sentry enabled"),ee({dsn:window.INVENTREE_SETTINGS.sentry_dsn,tracesSampleRate:1,environment:window.INVENTREE_SETTINGS.environment||"default"}));const Ie=window.INVENTREE_SETTINGS.base_url||"platform";te.createRoot(document.getElementById("root")).render(m.jsx(re.StrictMode,{children:m.jsx(ve,{})}));window.location.pathname==="/"&&window.location.replace(`/${Ie}`);export{n as A,Pe as B,De as C,z as D,Fe as E,qe as F,y as G,Ge as H,Be as I,U as L,h as M,xe as S,oe as U,G as _,b as a,Ie as b,ie as c,c as d,_ as e,q as f,he as g,$e as h,_e as i,me as j,je as k,ne as l,We as m,Ve as n,p as o,Ue as p,ze as q,Re as r,ue as s,pe as t,I as u,Te as v,Oe as w,Le as x,W as y,Ne as z};
