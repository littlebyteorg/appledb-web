import{_,a0 as v,o as d,c as n,d as t,m as u,t as o,$ as g}from"./app.a6a48828.js";String.prototype.format=function(a){let r=this;for(let e in a)r=r.replace("${"+e+"}",a[e]);return r};const f={props:{device:Object},data(){return{isDarkMode:v()}},methods:{getDate(a){return[a].flat().map(e=>{const s=new Date().getTimezoneOffset()*60*1e3+36e5,i=new Date(e).valueOf(),c=new Date(i+s),l=e.split("-"),m=[{year:"numeric"},{year:"numeric",month:"short"},{dateStyle:"medium"}];return new Intl.DateTimeFormat("en-US",m[l.length-1]).format(c)})[0]}}},p=["href"],D={key:0,class:"imgWrapper"},h=["srcset"],y=["srcset"],k=["src"],w={class:"info"},O={class:"title",style:{color:"var(--c-text)"}},b={class:"text",style:{color:"var(--c-text)"}};function x(a,r,e,s,i,c){return d(),n("a",{href:e.device.url},[t("div",{class:"gridWrapper",style:g({"grid-template-columns":e.device.imgCount>0?"3em calc(100% - 3em)":"100%"})},[e.device.imgCount?(d(),n("div",D,[t("picture",null,[t("source",{srcset:`https://img.appledb.dev/device@preview/${e.device.imgKey}/0${i.isDarkMode&&e.device.imgDark?"_dark":""}.avif`,type:"image/avif"},null,8,h),t("source",{srcset:`https://img.appledb.dev/device@preview/${e.device.imgKey}/0${i.isDarkMode&&e.device.imgDark?"_dark":""}.webp`,type:"image/webp"},null,8,y),t("img",{src:`https://img.appledb.dev/device@preview/${e.device.imgKey}/0${i.isDarkMode&&e.device.imgDark?"_dark":""}.png`},null,8,k)])])):u("",!0),t("div",w,[t("div",O,o(e.device.name),1),t("div",b,o(e.device.released?c.getDate(e.device.released):"Unknown"),1)])],4)],8,p)}var A=_(f,[["render",x],["__scopeId","data-v-17268870"],["__file","groupedOrRelatedDevice.vue"]]);export{A as default};