(function(){"use strict";var t={9339:function(t,e,i){var r=i(7195),s=function(){var t=this,e=t._self._c;return e("div",{attrs:{id:"app"}},[e("ImageViewer")],1)},o=[],a=function(){var t=this,e=t._self._c;return e("div",[e("div",{staticClass:"background"}),e("main",{staticClass:"main"},[0==t.singleBrowseMode?e("div",t._l(t.dirFilePathsMap,(function(i,r){return e("div",{key:r,attrs:{id:"path-and-image"}},[e("ImageList",{attrs:{rootUrl:t.rootUrl,srcDir:r,srcImagePaths:i,width:t.imageShowWidth,timestamp:t.timestamp.toString()}})],1)})),0):e("div",{staticClass:"show-single"},t._l(t.dirFilePathsMap,(function(i,r){return e("div",{key:r,attrs:{id:"path-and-image"}},[e("h3",[t._v(" "+t._s(t.srcImagePaths[t.curImageIndex])+" ")]),e("ImageFlipper",{attrs:{rootUrl:t.rootUrl,srcDir:r,srcImagePaths:i,width:t.imageShowWidth,timestamp:t.timestamp.toString()}})],1)})),0),e("div",[t._v(" "+t._s(t.errInfo)+" ")])]),e("nav",[e("div",[e("el-input",{attrs:{placeholder:"展示该目录的图片",clearable:""},nativeOn:{keyup:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.browseDir()}},model:{value:t.srcDir,callback:function(e){t.srcDir=e},expression:"srcDir"}})],1),e("div",[t._v("参与遍历的后缀名：")]),e("div",{staticClass:"postfixes"},[e("el-checkbox-group",{model:{value:t.checkedPostfixes,callback:function(e){t.checkedPostfixes=e},expression:"checkedPostfixes"}},t._l(t.filenamePostfixes,(function(i,r){return e("el-checkbox",{key:r,attrs:{label:i}},[t._v(t._s(i))])})),1)],1),e("el-radio-group",{model:{value:t.singleBrowseMode,callback:function(e){t.singleBrowseMode=e},expression:"singleBrowseMode"}},[e("el-radio",{attrs:{label:"0"}},[t._v("列表展示全部图片")]),e("el-radio",{attrs:{label:"1"}},[t._v("单图切换浏览")])],1),e("div",{staticClass:"label-bar"},[e("div",{staticClass:"label"},[t._v("图片显示宽度")]),e("el-slider",{staticClass:"bar",attrs:{step:10,max:1e3,min:10},model:{value:t.imageShowWidth,callback:function(e){t.imageShowWidth=e},expression:"imageShowWidth"}})],1),e("el-button",{ref:"preview",on:{click:t.browseDir}},[t._v("预览")]),e("div",{staticClass:"history"},t._l(t.historyDirs,(function(i){return e("el-tag",{key:i,attrs:{closable:""},on:{close:function(e){return t.RemoveHistoryItem(i)}}},[e("span",{staticClass:"history-dir",on:{click:function(e){return t.clickHistory(e)}}},[t._v(t._s(i))])])})),1),e("div",{staticClass:"info-for-clicked-image"},[e("div",{staticStyle:{"pointer-events":"none","user-select":"none"}},[t._v("点击的图像路径 ")]),t._v(" "+t._s(this.clickedImagePath)+" "),e("div",{staticStyle:{"pointer-events":"none","user-select":"none"}},[t._v("点击的图像名称 ")]),t._v(" "+t._s(this.clickedImageName)+" ")])],1)])},n=[],l=(i(7658),function(){var t=this,e=t._self._c;return e("div",{ref:"root",staticClass:"folder"},[e("div",{directives:[{name:"show",rawName:"v-show",value:t.showTooltip,expression:"showTooltip"}],ref:"tooltip",staticClass:"tooltip"},[t._v(t._s(t.tooltipContent))]),e("h3",[t._v(t._s(t.srcDir))]),t._l(t.srcImagePaths,(function(i){return e("img",{key:i,attrs:{src:t.rootUrl+i+`?timestamp=${t.timestamp}`,width:t.width,alt:i},on:{click:t.copyImagePath,mousemove:t.updateTooltip,mouseleave:t.closeTooltip}})}))],2)}),c=[],h={name:"ImageList",props:{rootUrl:String,srcDir:String,srcImagePaths:Array,timestamp:String,width:{type:Number,default:200}},data(){return{showTooltip:!1,tooltipContent:""}},methods:{updateTooltip(t){let e=t.target.src.match("(\\d{4})(.*?)(\\?)")[2],i=t.target.naturalWidth,r=t.target.naturalHeight,s=t.target.offsetWidth,o=t.target.offsetHeight,a=t.target.getBoundingClientRect(),n=t.clientX-a.x,l=t.clientY-a.y,c=parseInt(Math.round(n/s*i).toString()),h=parseInt(Math.round(l/o*r).toString());this.tooltipContent=e+` (${c} , ${h})`,this.showTooltip=!0,this.$refs.tooltip.style.top=`${t.clientY+10}px`,this.$refs.tooltip.style.left=`${t.clientX+10}px`},closeTooltip(){this.showTooltip=!1},copyImagePath(t){const e=document.createElement("button");e.setAttribute("class","cb");let i=t.target.src.match("(\\d{4})(.*?)(\\?)")[2];e.setAttribute("data-clipboard-text",i),document.body.appendChild(e),e.click(),e.remove();let r=new FormData;r.append("clickedImagePath",t.target.src);let s=this.rootUrl+"/clickImagePath";this.$axios.get(s,{params:{clickedImagePath:t.target.src}}).then((t=>{console.log(t.data),this.dirFilePathsMap=t.data})).catch((t=>{console.log(t),this.errInfo="错误信息："+t+"\n请检查目录是否存在"}))}}},d=h,p=i(1001),u=(0,p.Z)(d,l,c,!1,null,null,null),m=u.exports,g=function(){var t=this,e=t._self._c;return e("div",{ref:"root",staticClass:"folder"},[e("div",{directives:[{name:"show",rawName:"v-show",value:t.showTooltip,expression:"showTooltip"}],ref:"tooltip",staticClass:"tooltip"},[t._v(t._s(t.tooltipContent))]),e("h3",[t._v(t._s(t.srcDir))]),e("div",[e("h6",{staticStyle:{margin:"0"}},[t._v(" "+t._s(t.srcImagePaths[t.curImageIndex-1]))]),e("img",{attrs:{src:t.rootUrl+t.srcImagePaths[t.curImageIndex-1]+`?timestamp=${t.timestamp}`,width:t.width,alt:t.srcImagePaths[t.curImageIndex-1]},on:{click:t.copyImagePath,mousemove:t.updateTooltip,mouseleave:t.closeTooltip}})]),e("div",{staticClass:"label-bar"},[e("span",[t._v("当前是第 ")]),e("el-input-number",{attrs:{size:"mini",min:1,max:t.srcImagePaths.length},on:{change:function(e){return t.changeImage(e)}},model:{value:t.curImageIndex,callback:function(e){t.curImageIndex=e},expression:"curImageIndex"}}),e("span",[t._v(" 张，共计 "+t._s(t.srcImagePaths.length)+" 张 ")])],1)])},f=[],v={name:"ImageFlipper",props:{rootUrl:String,srcDir:String,srcImagePaths:Array,timestamp:String,width:{type:Number,default:200}},data(){return{showTooltip:!1,tooltipContent:"",curImageIndex:1}},methods:{updateTooltip(t){document.getElementsByClassName("el-input-number__decrease")[0].click();let e=t.target.src.match("(\\d{4})(.*?)(\\?)")[2],i=t.target.naturalWidth,r=t.target.naturalHeight,s=t.target.offsetWidth,o=t.target.offsetHeight,a=t.target.getBoundingClientRect(),n=t.clientX-a.x,l=t.clientY-a.y,c=parseInt(Math.round(n/s*i).toString()),h=parseInt(Math.round(l/o*r).toString());this.tooltipContent=e+` (${c} , ${h})`,this.showTooltip=!0,this.$refs.tooltip.style.top=`${t.clientY+10}px`,this.$refs.tooltip.style.left=`${t.clientX+10}px`},closeTooltip(){this.showTooltip=!1},copyImagePath(t){const e=document.createElement("button");e.setAttribute("class","cb");let i=t.target.src.match("(\\d{4})(.*?)(\\?)")[2];e.setAttribute("data-clipboard-text",i),document.body.appendChild(e),e.click(),e.remove();let r=new FormData;r.append("clickedImagePath",t.target.src);let s=this.rootUrl+"/clickImagePath";this.$axios.get(s,{params:{clickedImagePath:t.target.src}}).then((t=>{console.log(t.data),this.dirFilePathsMap=t.data})).catch((t=>{console.log(t),this.errInfo="错误信息："+t+"\n请检查目录是否存在"}))},changeImage(t){console.log(t)}}},I=v,b=(0,p.Z)(I,g,f,!1,null,"22aa9124",null),w=b.exports,x=i(4713),y=i.n(x),_={name:"ImageViewer",components:{ImageList:m,ImageFlipper:w},props:{},data(){return{srcImagePaths:[],dirFilePathsMap:{},srcDir:"/Users/mactarvish/Desktop/vue-test",errInfo:"",rootUrl:"",filenamePostfixes:[".jpg",".png",".PNG",".gif",".JPG",".bmp",".BMP",".jpeg"],checkedPostfixes:[".jpg",".png",".PNG",".gif",".JPG",".bmp",".BMP",".jpeg"],singleBrowseMode:"0",curImageIndex:0,imageShowWidth:200,timestamp:"",historyDirs:[],clickedImagePath:"",clickedImageName:""}},watch:{singleBrowseMode:{handler(t,e){console.log(t,e)}}},mounted(){this.rootUrl=window.location.href,this.rootUrl.includes("8081")&&(this.rootUrl="http://localhost:8003"),this.clipboard=new(y())(".cb"),this.clipboard.on("success",(t=>{this.$message(`复制成功： ${t.text}`),this.clickedImagePath=t.text,this.clickedImageName=t.text.split("/").pop()})),this.clipboard.on("error",(()=>{this.$alert("草台，复制失败了")}))},methods:{browseDir(){let t=new FormData;t.append("recursive",!0),t.append("srcDir",this.srcDir),t.append("postfixes",this.checkedPostfixes);let e=this.rootUrl+"/getAllImagePaths";this.dirFilePathsMap={},this.$axios.post(e,t).then((t=>{this.dirFilePathsMap=t.data;const e=this.dirFilePathsMap.state;console.log(e),delete this.dirFilePathsMap.state,"not exist"!=e?(this.timestamp=(new Date).getTime(),this.srcImagePaths=[],this.errInfo="",this.historyDirs.includes(this.srcDir)||this.historyDirs.push(this.srcDir)):this.$message(`目录 ${this.srcDir} 不存在！`)})).catch((t=>{console.log(t)}))},RemoveHistoryItem(t){this.historyDirs.splice(this.historyDirs.indexOf(t),1)},clickHistory(t){this.srcDir=t.target.textContent,this.browseDir()}}},P=_,k=(0,p.Z)(P,a,n,!1,null,null,null),D=k.exports,C={name:"App",components:{ImageViewer:D}},S=C,M=(0,p.Z)(S,s,o,!1,null,null,null),T=M.exports,$=i(8428),O=i.n($),F=i(8213),U=i.n(F);r["default"].config.productionTip=!1,r["default"].prototype.$axios=O(),r["default"].use(U()),new r["default"]({render:t=>t(T)}).$mount("#app")}},e={};function i(r){var s=e[r];if(void 0!==s)return s.exports;var o=e[r]={id:r,loaded:!1,exports:{}};return t[r].call(o.exports,o,o.exports,i),o.loaded=!0,o.exports}i.m=t,function(){i.amdO={}}(),function(){var t=[];i.O=function(e,r,s,o){if(!r){var a=1/0;for(h=0;h<t.length;h++){r=t[h][0],s=t[h][1],o=t[h][2];for(var n=!0,l=0;l<r.length;l++)(!1&o||a>=o)&&Object.keys(i.O).every((function(t){return i.O[t](r[l])}))?r.splice(l--,1):(n=!1,o<a&&(a=o));if(n){t.splice(h--,1);var c=s();void 0!==c&&(e=c)}}return e}o=o||0;for(var h=t.length;h>0&&t[h-1][2]>o;h--)t[h]=t[h-1];t[h]=[r,s,o]}}(),function(){i.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return i.d(e,{a:e}),e}}(),function(){i.d=function(t,e){for(var r in e)i.o(e,r)&&!i.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:e[r]})}}(),function(){i.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"===typeof window)return window}}()}(),function(){i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)}}(),function(){i.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}}(),function(){i.nmd=function(t){return t.paths=[],t.children||(t.children=[]),t}}(),function(){var t={143:0};i.O.j=function(e){return 0===t[e]};var e=function(e,r){var s,o,a=r[0],n=r[1],l=r[2],c=0;if(a.some((function(e){return 0!==t[e]}))){for(s in n)i.o(n,s)&&(i.m[s]=n[s]);if(l)var h=l(i)}for(e&&e(r);c<a.length;c++)o=a[c],i.o(t,o)&&t[o]&&t[o][0](),t[o]=0;return i.O(h)},r=self["webpackChunkvue2_image_viewer"]=self["webpackChunkvue2_image_viewer"]||[];r.forEach(e.bind(null,0)),r.push=e.bind(null,r.push.bind(r))}();var r=i.O(void 0,[998],(function(){return i(9339)}));r=i.O(r)})();
//# sourceMappingURL=app.1db76be7.js.map