import{_,r as o,o as n,c as s,d as r,F as d,n as v,b as c,w as u}from"./app.a6a48828.js";const m={data(){return{recentDeviceCards:[]}},created(){fetch("https://api.appledb.dev/appledb-web/homePage.json").then(t=>t.json()).then(t=>{this.recentDeviceCards=t.recentDeviceCardArray})}},C={class:"wrapper"},f={class:"cardWrapper"};function h(t,e,D,g,i,k){const l=o("homeLargeCard"),p=o("router-link");return n(),s(d,null,[e[1]||(e[1]=r("h1",null,"Recent devices",-1)),r("div",C,[r("div",f,[(n(!0),s(d,null,v(i.recentDeviceCards,a=>(n(),s("div",{class:"recentDeviceCard",key:a.title},[c(p,{to:a.link},{default:u(()=>[c(l,{card:a},null,8,["card"])]),_:2},1032,["to"])]))),128)),e[0]||(e[0]=r("div",{style:{"margin-left":"-2em"}},[r("p",{style:{width:"2em","margin-left":"0"}})],-1))])]),e[2]||(e[2]=r("div",{class:"space"},null,-1))],64)}var b=_(m,[["render",h],["__scopeId","data-v-4b354187"],["__file","homeRecentDeviceCardWrapper.vue"]]);export{b as default};