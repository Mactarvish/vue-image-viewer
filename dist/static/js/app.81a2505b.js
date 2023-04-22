(function(){"use strict";var t={9494:function(t,e,o){var i=o(7195),r=function(){var t=this,e=t._self._c;return e("div",{attrs:{id:"app"}},[e("ImageViewer")],1)},n=[],s=function(){var t=this,e=t._self._c;return e("div",[e("div",{staticClass:"background"}),e("main",{staticClass:"main"},[0==t.singleBrowseMode?e("div",t._l(t.dirFilePathMap,(function(o,i){return e("div",{key:i,attrs:{id:"path-and-image"}},[e("ImageList",{attrs:{rootUrl:t.rootUrl,srcDir:i,srcImagePaths:o,width:t.imageShowWidth}})],1)})),0):e("div",{staticClass:"show-single"},[e("button",{staticClass:"change-image-button",on:{click:function(e){return t.changeImage("last")}}},[t._v("上一张")]),e("div",{staticClass:"single-image-widget"},[e("h3",[t._v(" "+t._s(t.srcImagePaths[t.curImageIndex])+" ")]),e("AnnoImage",{attrs:{src:t.srcImagePaths[t.curImageIndex],width:512}})],1),e("button",{staticClass:"change-image-button",on:{click:function(e){return t.changeImage("next")}}},[t._v("下一张")])]),e("div",[t._v(" "+t._s(t.errInfo)+" ")])]),e("nav",[e("div",{staticClass:"config"}),e("div",[e("div",[t._v("展示以下目录的图片：")]),e("input",{directives:[{name:"model",rawName:"v-model",value:t.srcDir,expression:"srcDir"}],staticClass:"input-dir",attrs:{type:"text"},domProps:{value:t.srcDir},on:{input:function(e){e.target.composing||(t.srcDir=e.target.value)}}})]),e("div",[t._v("参与遍历的后缀名：")]),e("div",{staticClass:"postfixes"},[e("el-checkbox-group",{model:{value:t.checkedPostfixes,callback:function(e){t.checkedPostfixes=e},expression:"checkedPostfixes"}},t._l(t.filenamePostfixes,(function(o,i){return e("el-checkbox",{key:i,attrs:{label:o}},[t._v(t._s(o))])})),1)],1),e("el-radio-group",{model:{value:t.singleBrowseMode,callback:function(e){t.singleBrowseMode=e},expression:"singleBrowseMode"}},[e("el-radio",{attrs:{label:"0"}},[t._v("列表展示全部图片")]),e("el-radio",{attrs:{label:"1"}},[t._v("单图切换浏览")])],1),e("div",{staticClass:"label-bar"},[e("div",{staticClass:"label"},[t._v("图片显示宽度")]),e("el-slider",{staticClass:"bar",attrs:{step:10,max:1e3,min:10},model:{value:t.imageShowWidth,callback:function(e){t.imageShowWidth=e},expression:"imageShowWidth"}})],1),e("el-button",{on:{click:t.browseDir}},[t._v("预览")]),e("div",[t._v(" "+t._s(t.srcDir)+" ")])],1)])},a=[],l=function(){var t=this,e=t._self._c;return e("div",{ref:"root",staticClass:"folder"},[e("div",{directives:[{name:"show",rawName:"v-show",value:t.showTooltip,expression:"showTooltip"}],ref:"tooltip",staticClass:"tooltip"},[t._v(t._s(t.tooltipContent))]),e("h3",[t._v(t._s(t.srcDir))]),t._l(t.srcImagePaths,(function(o){return e("img",{key:o,attrs:{src:t.rootUrl+o+`?timestamp=${t.timestamp}`,width:t.width,alt:o},on:{click:t.copyImagePath,mousemove:t.updateTooltip,mouseleave:t.closeTooltip}})}))],2)},c=[],u={name:"ImageList",props:{rootUrl:String,srcDir:String,srcImagePaths:Array,width:{type:Number,default:200}},data(){return{showTooltip:!1,tooltipContent:"",timestamp:(new Date).getTime()}},updated(){},methods:{getWidth(){const t=200+Math.floor(100*Math.random());return t},updateTooltip(t){this.tooltipContent=t.target.src,this.showTooltip=!0,this.$refs.tooltip.style.top=`${t.clientY+10}px`,this.$refs.tooltip.style.left=`${t.clientX+10}px`},closeTooltip(){this.showTooltip=!1},copyImagePath(t){const e=document.createElement("button");e.setAttribute("class","cb"),e.setAttribute("data-clipboard-text",t.target.src),document.body.appendChild(e),e.click(),e.remove()}}},d=u,h=o(1001),p=(0,h.Z)(d,l,c,!1,null,null,null),m=p.exports,g=o(4713),f=o.n(g),v={name:"ImageViewer",components:{ImageList:m},props:{},data(){return{srcImagePaths:[],dirFilePathMap:{},srcDir:"/Users/mactarvish/Desktop/vue-test",errInfo:"",rootUrl:"http://localhost:8003",filenamePostfixes:[".jpg",".png",".PNG",".gif",".JPG",".bmp",".BMP",".jpeg"],checkedPostfixes:[".jpg",".png",".PNG",".gif",".JPG",".bmp",".BMP",".jpeg"],singleBrowseMode:"0",curImageIndex:0,imageShowWidth:200}},watch:{singleBrowseMode:{handler(t,e){console.log(t,e)}}},mounted(){this.clipboard=new(f())(".cb"),this.clipboard.on("success",(t=>{this.$message(`复制成功： ${t.text}`)})),this.clipboard.on("error",(()=>{this.$alert("草台，复制失败了")}))},methods:{browseDir(){let t=new FormData;t.append("recursive",!0),t.append("srcDir",this.srcDir),t.append("postfixes",this.checkedPostfixes);let e=this.rootUrl+"/getAllImagePaths";this.$axios.post(e,t).then((t=>{this.dirFilePathMap=t.data,this.srcImagePaths=[],this.errInfo=""})).catch((t=>{console.log(t),this.errInfo="错误信息："+t+"\n请检查目录是否存在",console.log("草台")}))},changeImage(t){console.log(t),"next"===t?this.curImageIndex=Math.min(this.srcImagePaths.length-1,this.curImageIndex+1):"last"===t?this.curImageIndex=Math.max(0,this.curImageIndex-1):console.log("未定义切换图片行为"),console.log(this.curImageIndex)}}},b=v,w=(0,h.Z)(b,s,a,!1,null,null,null),x=w.exports,I={name:"App",components:{ImageViewer:x}},_=I,P=(0,h.Z)(_,r,n,!1,null,null,null),y=P.exports,k=o(8428),C=o.n(k),M=o(8213),D=o.n(M);i["default"].config.productionTip=!1,i["default"].prototype.$axios=C(),i["default"].use(D()),new i["default"]({render:t=>t(y)}).$mount("#app")}},e={};function o(i){var r=e[i];if(void 0!==r)return r.exports;var n=e[i]={id:i,loaded:!1,exports:{}};return t[i].call(n.exports,n,n.exports,o),n.loaded=!0,n.exports}o.m=t,function(){o.amdO={}}(),function(){var t=[];o.O=function(e,i,r,n){if(!i){var s=1/0;for(u=0;u<t.length;u++){i=t[u][0],r=t[u][1],n=t[u][2];for(var a=!0,l=0;l<i.length;l++)(!1&n||s>=n)&&Object.keys(o.O).every((function(t){return o.O[t](i[l])}))?i.splice(l--,1):(a=!1,n<s&&(s=n));if(a){t.splice(u--,1);var c=r();void 0!==c&&(e=c)}}return e}n=n||0;for(var u=t.length;u>0&&t[u-1][2]>n;u--)t[u]=t[u-1];t[u]=[i,r,n]}}(),function(){o.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return o.d(e,{a:e}),e}}(),function(){o.d=function(t,e){for(var i in e)o.o(e,i)&&!o.o(t,i)&&Object.defineProperty(t,i,{enumerable:!0,get:e[i]})}}(),function(){o.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"===typeof window)return window}}()}(),function(){o.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)}}(),function(){o.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}}(),function(){o.nmd=function(t){return t.paths=[],t.children||(t.children=[]),t}}(),function(){var t={143:0};o.O.j=function(e){return 0===t[e]};var e=function(e,i){var r,n,s=i[0],a=i[1],l=i[2],c=0;if(s.some((function(e){return 0!==t[e]}))){for(r in a)o.o(a,r)&&(o.m[r]=a[r]);if(l)var u=l(o)}for(e&&e(i);c<s.length;c++)n=s[c],o.o(t,n)&&t[n]&&t[n][0](),t[n]=0;return o.O(u)},i=self["webpackChunkvue2_image_viewer"]=self["webpackChunkvue2_image_viewer"]||[];i.forEach(e.bind(null,0)),i.push=e.bind(null,i.push.bind(i))}();var i=o.O(void 0,[998],(function(){return o(9494)}));i=o.O(i)})();
//# sourceMappingURL=app.81a2505b.js.map