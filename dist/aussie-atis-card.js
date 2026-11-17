const t=globalThis,e=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),n=new WeakMap;let s=class{constructor(t,e,n){if(this._$cssResult$=!0,n!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const i=this.t;if(e&&void 0===t){const e=void 0!==i&&1===i.length;e&&(t=n.get(i)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&n.set(i,t))}return t}toString(){return this.cssText}};const a=e?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new s("string"==typeof t?t:t+"",void 0,i))(e)})(t):t,{is:r,defineProperty:o,getOwnPropertyDescriptor:d,getOwnPropertyNames:l,getOwnPropertySymbols:h,getPrototypeOf:u}=Object,c=globalThis,p=c.trustedTypes,g=p?p.emptyScript:"",f=c.reactiveElementPolyfillSupport,m=(t,e)=>t,w={toAttribute(t,e){switch(e){case Boolean:t=t?g:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},_=(t,e)=>!r(t,e),$={attribute:!0,type:String,converter:w,reflect:!1,useDefault:!1,hasChanged:_};Symbol.metadata??=Symbol("metadata"),c.litPropertyMetadata??=new WeakMap;let y=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=$){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),n=this.getPropertyDescriptor(t,i,e);void 0!==n&&o(this.prototype,t,n)}}static getPropertyDescriptor(t,e,i){const{get:n,set:s}=d(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:n,set(e){const a=n?.call(this);s?.call(this,e),this.requestUpdate(t,a,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??$}static _$Ei(){if(this.hasOwnProperty(m("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(m("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(m("properties"))){const t=this.properties,e=[...l(t),...h(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const i=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((i,n)=>{if(e)i.adoptedStyleSheets=n.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const e of n){const n=document.createElement("style"),s=t.litNonce;void 0!==s&&n.setAttribute("nonce",s),n.textContent=e.cssText,i.appendChild(n)}})(i,this.constructor.elementStyles),i}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),n=this.constructor._$Eu(t,i);if(void 0!==n&&!0===i.reflect){const s=(void 0!==i.converter?.toAttribute?i.converter:w).toAttribute(e,i.type);this._$Em=t,null==s?this.removeAttribute(n):this.setAttribute(n,s),this._$Em=null}}_$AK(t,e){const i=this.constructor,n=i._$Eh.get(t);if(void 0!==n&&this._$Em!==n){const t=i.getPropertyOptions(n),s="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:w;this._$Em=n;const a=s.fromAttribute(e,t.type);this[n]=a??this._$Ej?.get(n)??a,this._$Em=null}}requestUpdate(t,e,i,n=!1,s){if(void 0!==t){const a=this.constructor;if(!1===n&&(s=this[t]),i??=a.getPropertyOptions(t),!((i.hasChanged??_)(s,e)||i.useDefault&&i.reflect&&s===this._$Ej?.get(t)&&!this.hasAttribute(a._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:n,wrapped:s},a){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,a??e??this[t]),!0!==s||void 0!==a)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===n&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,n=this[e];!0!==t||this._$AL.has(e)||void 0===n||this.C(e,void 0,i,n)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};y.elementStyles=[],y.shadowRootOptions={mode:"open"},y[m("elementProperties")]=new Map,y[m("finalized")]=new Map,f?.({ReactiveElement:y}),(c.reactiveElementVersions??=[]).push("2.1.2");const v=globalThis,b=t=>t,x=v.trustedTypes,A=x?x.createPolicy("lit-html",{createHTML:t=>t}):void 0,M="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,k="?"+S,C=`<${k}>`,E=document,P=()=>E.createComment(""),T=t=>null===t||"object"!=typeof t&&"function"!=typeof t,L=Array.isArray,R="[ \t\n\f\r]",N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,U=/-->/g,O=/>/g,H=RegExp(`>|${R}(?:([^\\s"'>=/]+)(${R}*=${R}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),I=/'/g,Y=/"/g,z=/^(?:script|style|textarea|title)$/i,D=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),B=D(1),j=D(2),F=Symbol.for("lit-noChange"),W=Symbol.for("lit-nothing"),q=new WeakMap,V=E.createTreeWalker(E,129);function G(t,e){if(!L(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(e):e}const Z=(t,e)=>{const i=t.length-1,n=[];let s,a=2===e?"<svg>":3===e?"<math>":"",r=N;for(let e=0;e<i;e++){const i=t[e];let o,d,l=-1,h=0;for(;h<i.length&&(r.lastIndex=h,d=r.exec(i),null!==d);)h=r.lastIndex,r===N?"!--"===d[1]?r=U:void 0!==d[1]?r=O:void 0!==d[2]?(z.test(d[2])&&(s=RegExp("</"+d[2],"g")),r=H):void 0!==d[3]&&(r=H):r===H?">"===d[0]?(r=s??N,l=-1):void 0===d[1]?l=-2:(l=r.lastIndex-d[2].length,o=d[1],r=void 0===d[3]?H:'"'===d[3]?Y:I):r===Y||r===I?r=H:r===U||r===O?r=N:(r=H,s=void 0);const u=r===H&&t[e+1].startsWith("/>")?" ":"";a+=r===N?i+C:l>=0?(n.push(o),i.slice(0,l)+M+i.slice(l)+S+u):i+S+(-2===l?e:u)}return[G(t,a+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),n]};class K{constructor({strings:t,_$litType$:e},i){let n;this.parts=[];let s=0,a=0;const r=t.length-1,o=this.parts,[d,l]=Z(t,e);if(this.el=K.createElement(d,i),V.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(n=V.nextNode())&&o.length<r;){if(1===n.nodeType){if(n.hasAttributes())for(const t of n.getAttributeNames())if(t.endsWith(M)){const e=l[a++],i=n.getAttribute(t).split(S),r=/([.?@])?(.*)/.exec(e);o.push({type:1,index:s,name:r[2],strings:i,ctor:"."===r[1]?et:"?"===r[1]?it:"@"===r[1]?nt:tt}),n.removeAttribute(t)}else t.startsWith(S)&&(o.push({type:6,index:s}),n.removeAttribute(t));if(z.test(n.tagName)){const t=n.textContent.split(S),e=t.length-1;if(e>0){n.textContent=x?x.emptyScript:"";for(let i=0;i<e;i++)n.append(t[i],P()),V.nextNode(),o.push({type:2,index:++s});n.append(t[e],P())}}}else if(8===n.nodeType)if(n.data===k)o.push({type:2,index:s});else{let t=-1;for(;-1!==(t=n.data.indexOf(S,t+1));)o.push({type:7,index:s}),t+=S.length-1}s++}}static createElement(t,e){const i=E.createElement("template");return i.innerHTML=t,i}}function J(t,e,i=t,n){if(e===F)return e;let s=void 0!==n?i._$Co?.[n]:i._$Cl;const a=T(e)?void 0:e._$litDirective$;return s?.constructor!==a&&(s?._$AO?.(!1),void 0===a?s=void 0:(s=new a(t),s._$AT(t,i,n)),void 0!==n?(i._$Co??=[])[n]=s:i._$Cl=s),void 0!==s&&(e=J(t,s._$AS(t,e.values),s,n)),e}class Q{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,n=(t?.creationScope??E).importNode(e,!0);V.currentNode=n;let s=V.nextNode(),a=0,r=0,o=i[0];for(;void 0!==o;){if(a===o.index){let e;2===o.type?e=new X(s,s.nextSibling,this,t):1===o.type?e=new o.ctor(s,o.name,o.strings,this,t):6===o.type&&(e=new st(s,this,t)),this._$AV.push(e),o=i[++r]}a!==o?.index&&(s=V.nextNode(),a++)}return V.currentNode=E,n}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,n){this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=J(this,t,e),T(t)?t===W||null==t||""===t?(this._$AH!==W&&this._$AR(),this._$AH=W):t!==this._$AH&&t!==F&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>L(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==W&&T(this._$AH)?this._$AA.nextSibling.data=t:this.T(E.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,n="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=K.createElement(G(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===n)this._$AH.p(e);else{const t=new Q(n,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=q.get(t.strings);return void 0===e&&q.set(t.strings,e=new K(t)),e}k(t){L(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,n=0;for(const s of t)n===e.length?e.push(i=new X(this.O(P()),this.O(P()),this,this.options)):i=e[n],i._$AI(s),n++;n<e.length&&(this._$AR(i&&i._$AB.nextSibling,n),e.length=n)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=b(t).nextSibling;b(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class tt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,n,s){this.type=1,this._$AH=W,this._$AN=void 0,this.element=t,this.name=e,this._$AM=n,this.options=s,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=W}_$AI(t,e=this,i,n){const s=this.strings;let a=!1;if(void 0===s)t=J(this,t,e,0),a=!T(t)||t!==this._$AH&&t!==F,a&&(this._$AH=t);else{const n=t;let r,o;for(t=s[0],r=0;r<s.length-1;r++)o=J(this,n[i+r],e,r),o===F&&(o=this._$AH[r]),a||=!T(o)||o!==this._$AH[r],o===W?t=W:t!==W&&(t+=(o??"")+s[r+1]),this._$AH[r]=o}a&&!n&&this.j(t)}j(t){t===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class et extends tt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===W?void 0:t}}class it extends tt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==W)}}class nt extends tt{constructor(t,e,i,n,s){super(t,e,i,n,s),this.type=5}_$AI(t,e=this){if((t=J(this,t,e,0)??W)===F)return;const i=this._$AH,n=t===W&&i!==W||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,s=t!==W&&(i===W||n);n&&this.element.removeEventListener(this.name,this,i),s&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class st{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){J(this,t)}}const at=v.litHtmlPolyfillSupport;at?.(K,X),(v.litHtmlVersions??=[]).push("3.3.3");const rt=globalThis;class ot extends y{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const n=i?.renderBefore??e;let s=n._$litPart$;if(void 0===s){const t=i?.renderBefore??null;n._$litPart$=s=new X(e.insertBefore(P(),t),t,void 0,i??{})}return s._$AI(t),s})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return F}}ot._$litElement$=!0,ot.finalized=!0,rt.litElementHydrateSupport?.({LitElement:ot});const dt=rt.litElementPolyfillSupport;dt?.({LitElement:ot}),(rt.litElementVersions??=[]).push("4.2.2");var lt={YSSY:[{ident:"07/25",length:2530,width:45,surface:"asphalt",ends:[{ident:"07",latitude:-33.943699,longitude:151.164001},{ident:"25",latitude:-33.9375,longitude:151.190002}]},{ident:"16L/34R",length:2438,width:45,surface:"asphalt",ends:[{ident:"16L",latitude:-33.9496,longitude:151.188004},{ident:"34R",latitude:-33.9711,longitude:151.194}]},{ident:"16R/34L",length:3962,width:45,surface:"asphalt",ends:[{ident:"16R",latitude:-33.929401,longitude:151.171997},{ident:"34L",latitude:-33.964298,longitude:151.181}]}],YMML:[{ident:"09/27",length:2286,width:45,surface:"asphalt",ends:[{ident:"09",latitude:-37.660801,longitude:144.822006},{ident:"27",latitude:-37.6623,longitude:144.848007}]},{ident:"16/34",length:3657,width:60,surface:"asphalt",ends:[{ident:"16",latitude:-37.653198,longitude:144.835007},{ident:"34",latitude:-37.685799,longitude:144.841003}]}],YBBN:[{ident:"01L/19R",length:3300,width:60,surface:"asphalt",ends:[{ident:"01L",latitude:-27.383101,longitude:153.106995},{ident:"19R",latitude:-27.3566,longitude:153.121994}]},{ident:"01R/19L",length:3560,width:45,surface:"asphalt",ends:[{ident:"01R",latitude:-27.4039,longitude:153.117996},{ident:"19L",latitude:-27.375299,longitude:153.134003}]}],YPPH:[{ident:"03/21",length:3444,width:45,surface:"asphalt",ends:[{ident:"03",latitude:-31.9587,longitude:115.959999},{ident:"21",latitude:-31.9286,longitude:115.968002}]},{ident:"06/24",length:2163,width:45,surface:"asphalt",ends:[{ident:"06",latitude:-31.941,longitude:115.959},{ident:"24",latitude:-31.930901,longitude:115.978996}]}],YPAD:[{ident:"05/23",length:3100,width:45,surface:"asphalt",ends:[{ident:"05",latitude:-34.9585,longitude:138.516998},{ident:"23",latitude:-34.940601,longitude:138.542999}]},{ident:"12/30",length:1652,width:45,surface:"asphalt",ends:[{ident:"12",latitude:-34.9412,longitude:138.522003},{ident:"30",latitude:-34.949402,longitude:138.537003}]}],YSCB:[{ident:"12/30",length:1679,width:30,surface:"asphalt",ends:[{ident:"12",latitude:-35.300701,longitude:149.184998},{ident:"30",latitude:-35.310398,longitude:149.199005}]},{ident:"17/35",length:3283,width:45,surface:"asphalt",ends:[{ident:"17",latitude:-35.290627,longitude:149.194443},{ident:"35",latitude:-35.320198,longitude:149.194443}]}],YMHB:[{ident:"12/30",length:2727,width:45,surface:"asphalt",ends:[{ident:"12",latitude:-42.828223,longitude:147.501024},{ident:"30",latitude:-42.845586,longitude:147.5246}]}],YPDN:[{ident:"11/29",length:3354,width:60,surface:"asphalt",ends:[{ident:"11",latitude:-12.4094,longitude:130.865005},{ident:"29",latitude:-12.4192,longitude:130.893997}]},{ident:"18/36",length:1524,width:30,surface:"asphalt",ends:[{ident:"18",latitude:-12.4088,longitude:130.871002},{ident:"36",latitude:-12.4226,longitude:130.871002}]}],YBCG:[{ident:"14/32",length:2492,width:45,surface:"asphalt",ends:[{ident:"14",latitude:-28.1565,longitude:153.501007},{ident:"32",latitude:-28.17609,longitude:153.513184}]},{ident:"17/35",length:582,width:18,surface:"asphalt",ends:[{ident:"17",latitude:-28.1644,longitude:153.507004},{ident:"35",latitude:-28.1696,longitude:153.505997}]}],YBCS:[{ident:"15/33",length:3197,width:45,surface:"asphalt",ends:[{ident:"15",latitude:-16.865801,longitude:145.744003},{ident:"33",latitude:-16.8923,longitude:145.755997}]}],YBTL:[{ident:"01/19",length:2438,width:45,surface:"asphalt",ends:[{ident:"01",latitude:-19.258301,longitude:146.764999},{ident:"19",latitude:-19.238199,longitude:146.774002}]},{ident:"07/25",length:1100,width:30,surface:"asphalt",ends:[{ident:"07",latitude:-19.2558,longitude:146.755997},{ident:"25",latitude:-19.253099,longitude:146.766006}]}],YBSU:[{ident:"13/31",length:2800,width:45,surface:"asphalt",ends:[{ident:"13",latitude:-26.583214,longitude:153.074524},{ident:"31",latitude:-26.603226,longitude:153.09169}]}],YBMK:[{ident:"14/32",length:1981,width:45,surface:"asphalt",ends:[{ident:"14",latitude:-21.1632,longitude:149.177002},{ident:"32",latitude:-21.178301,longitude:149.188004}]}],YBRK:[{ident:"04/22",length:1645,width:30,surface:"asphalt",ends:[{ident:"04",latitude:-23.3825,longitude:150.464996},{ident:"22",latitude:-23.375847,longitude:150.47471}]},{ident:"15/33",length:2628,width:45,surface:"asphalt",ends:[{ident:"15",latitude:-23.3687,longitude:150.470001},{ident:"33",latitude:-23.390699,longitude:150.479996}]}],YMLT:[{ident:"14L/32R",length:700,width:18,surface:"grass",ends:[{ident:"14L",latitude:-41.541199,longitude:147.214005},{ident:"32R",latitude:-41.5466,longitude:147.218994}]},{ident:"14R/32L",length:1981,width:45,surface:"asphalt",ends:[{ident:"14R",latitude:-41.537102,longitude:147.203995},{ident:"32L",latitude:-41.552101,longitude:147.216995}]},{ident:"18/36",length:690,width:18,surface:"grass",ends:[{ident:"18",latitude:-41.539299,longitude:147.218002},{ident:"36",latitude:-41.5453,longitude:147.214996}]}],YMAV:[{ident:"18/36",length:3048,width:45,surface:"asphalt",ends:[{ident:"18",latitude:-38.027237,longitude:144.469419},{ident:"36",latitude:-38.054413,longitude:144.464827}]}],YMEN:[{ident:"08/26",length:1921,width:45,surface:"asphalt",ends:[{ident:"08",latitude:-37.731391,longitude:144.892877},{ident:"26",latitude:-37.730792,longitude:144.91466}]},{ident:"17/35",length:1314,width:45,surface:"asphalt",ends:[{ident:"17",latitude:-37.720416,longitude:144.900758},{ident:"35",latitude:-37.733943,longitude:144.901406}]}],YWLM:[{ident:"12/30",length:3058,width:45,surface:"asphalt",ends:[{ident:"12",latitude:-32.7871,longitude:151.8226},{ident:"30",latitude:-32.8049,longitude:151.8475}]}],YBAS:[{ident:"12/30",length:2438,width:45,surface:"asphalt",ends:[{ident:"12",latitude:-23.801001,longitude:133.893005},{ident:"30",latitude:-23.812099,longitude:133.914001}]},{ident:"17/35",length:1133,width:18,surface:"asphalt",ends:[{ident:"17",latitude:-23.7973,longitude:133.886993},{ident:"35",latitude:-23.807501,longitude:133.886993}]}],YPKA:[{ident:"08/26",length:2280,width:45,surface:"asphalt",ends:[{ident:"08",latitude:-20.714025,longitude:116.764709},{ident:"26",latitude:-20.711739,longitude:116.786438}]}],YPPD:[{ident:"14/32",length:2500,width:45,surface:"asphalt",ends:[{ident:"14",latitude:-20.3741,longitude:118.622002},{ident:"32",latitude:-20.390699,longitude:118.638}]},{ident:"18/36",length:1e3,width:18,surface:"asphalt",ends:[{ident:"18",latitude:-20.3703,longitude:118.628998},{ident:"36",latitude:-20.379299,longitude:118.628998}]}],YPLM:[{ident:"18/36",length:3047,width:45,surface:"asphalt",ends:[{ident:"18",latitude:-22.219999,longitude:114.091003},{ident:"36",latitude:-22.2474,longitude:114.088997}]}],YAMB:[{ident:"04/22",length:1523,width:45,surface:"asphalt",ends:[{ident:"04",latitude:-27.6446,longitude:152.707993},{ident:"22",latitude:-27.6366,longitude:152.720001}]},{ident:"15/33",length:3047,width:45,surface:"asphalt",ends:[{ident:"15",latitude:-27.6217,longitude:152.705002},{ident:"33",latitude:-27.647301,longitude:152.716003}]}],YBOK:[{ident:"05/23",length:914,width:30,surface:"asphalt",ends:[{ident:"05",latitude:-27.406099,longitude:151.731003},{ident:"23",latitude:-27.4013,longitude:151.738007}]},{ident:"09/27",length:999,width:23,surface:"asphalt",ends:[{ident:"09",latitude:-27.4091,longitude:151.725006},{ident:"27",latitude:-27.410601,longitude:151.735001}]},{ident:"14/32",length:1649,width:30,surface:"asphalt",ends:[{ident:"14",latitude:-27.4027,longitude:151.737},{ident:"32",latitude:-27.4149,longitude:151.746994}]}],YCIN:[{ident:"11/29",length:3049,width:45,surface:"asphalt",ends:[{ident:"11",latitude:-17.5756,longitude:123.815002},{ident:"29",latitude:-17.585199,longitude:123.842003}]}],YGIG:[{ident:"08/26",length:1828,width:45,surface:"asphalt",ends:[{ident:"08",latitude:-31.466499,longitude:115.853996},{ident:"26",latitude:-31.4622,longitude:115.872002}]}],YMES:[{ident:"04/22",length:2437,width:45,surface:"asphalt",ends:[{ident:"04",latitude:-38.105999,longitude:147.139008},{ident:"22",latitude:-38.093102,longitude:147.160995}]},{ident:"09/27",length:2230,width:45,surface:"asphalt",ends:[{ident:"09",latitude:-38.095699,longitude:147.128006},{ident:"27",latitude:-38.098801,longitude:147.153}]}],YMPC:[{ident:"04/22",length:1137,width:45,surface:"concrete",ends:[{ident:"04",latitude:-37.936401,longitude:144.746002},{ident:"22",latitude:-37.9296,longitude:144.755997}]},{ident:"17/35",length:1374,width:45,surface:"concrete",ends:[{ident:"17",latitude:-37.924198,longitude:144.753006},{ident:"35",latitude:-37.936501,longitude:144.755005}]}],YPEA:[{ident:"05/23",length:1691,width:45,surface:"asphalt",ends:[{ident:"05",latitude:-31.6723,longitude:116.009003},{ident:"23",latitude:-31.661501,longitude:116.021004}]},{ident:"18L/36R",length:2439,width:45,surface:"asphalt",ends:[{ident:"18L",latitude:-31.662399,longitude:116.014},{ident:"36R",latitude:-31.684299,longitude:116.016998}]},{ident:"18R/36L",length:1741,width:30,surface:"asphalt",ends:[{ident:"18R",latitude:-31.6688,longitude:116.013},{ident:"36L",latitude:-31.684401,longitude:116.014999}]}],YPED:[{ident:"18/36",length:2560,width:46,surface:"asphalt",ends:[{ident:"18",latitude:-34.691938,longitude:138.618034},{ident:"36",latitude:-34.718369,longitude:138.613235}]}],YPTN:[{ident:"14/32",length:2744,width:46,surface:"asphalt",ends:[{ident:"14",latitude:-14.5122,longitude:132.369003},{ident:"32",latitude:-14.5309,longitude:132.386002}]}],YPWR:[{ident:"12/30",length:1614,width:30,surface:"gravel",ends:[{ident:"12",latitude:-31.1369,longitude:136.815002},{ident:"30",latitude:-31.145201,longitude:136.828995}]},{ident:"18/36",length:2372,width:45,surface:"asphalt",ends:[{ident:"18",latitude:-31.135099,longitude:136.813995},{ident:"36",latitude:-31.156401,longitude:136.811005}]}],YBSG:[{ident:"12/30",length:3049,width:45,surface:"asphalt",ends:[{ident:"12",latitude:-12.615841,longitude:142.076261},{ident:"30",latitude:-12.630376,longitude:142.100371}]}],YSNW:[{ident:"03/21",length:2046,width:45,surface:"asphalt",ends:[{ident:"03",latitude:-34.948898,longitude:150.535995},{ident:"21",latitude:-34.935699,longitude:150.552002}]},{ident:"08/26",length:2094,width:45,surface:"asphalt",ends:[{ident:"08",latitude:-34.947899,longitude:150.526993},{ident:"26",latitude:-34.949299,longitude:150.548996}]}],YSRI:[{ident:"10/28",length:2134,width:45,surface:"asphalt",ends:[{ident:"10",latitude:-33.601601,longitude:150.770996},{ident:"28",latitude:-33.6073,longitude:150.792999}]}]};const ht=/^(\d{1,2})\s*([LRC])?$/;function ut(t){if("string"!=typeof t&&"number"!=typeof t)return null;const e=ht.exec(String(t).trim().toUpperCase());if(!e)return null;const i=Number(e[1]);return i<1||i>36?null:String(i).padStart(2,"0")+(e[2]??"")}function ct(t){let e=[];Array.isArray(t)?e=t:"string"==typeof t&&(e=t.split(","));const i=[];for(const t of e){const e=ut(t);e&&!i.includes(e)&&i.push(e)}return i}const pt=t=>"number"==typeof t&&Number.isFinite(t);function gt(t){if(!t||"object"!=typeof t)return null;const e=t,i=ut(e.ident);return i&&pt(e.latitude)&&pt(e.longitude)?{ident:i,latitude:e.latitude,longitude:e.longitude,heading:pt(e.heading)?e.heading:null}:null}function ft(t){if(!Array.isArray(t))return[];const e=[];for(const i of t){if(!i||"object"!=typeof i)continue;const t=i;if(!Array.isArray(t.ends)||2!==t.ends.length)continue;const n=gt(t.ends[0]),s=gt(t.ends[1]);n&&s&&(n.latitude===s.latitude&&n.longitude===s.longitude||e.push({ident:`${n.ident}/${s.ident}`,length:pt(t.length)?t.length:null,width:pt(t.width)?t.width:null,surface:"string"==typeof t.surface?t.surface:"unknown",ends:[n,s]}))}return e}function mt(t,e){const i=ft(t);if(i.length)return{runways:i,source:"integration"};const n=function(t){return ft(lt[t.toUpperCase()])}(e);return n.length?{runways:n,source:"bundled"}:{runways:[],source:"none"}}function wt(t,e){const i=t.flatMap(t=>t.ends.map(t=>t.ident));if(i.includes(e))return e;const n=e.slice(0,2),s=i.filter(t=>t.slice(0,2)===n);return 1===s.length?s[0]:null}const _t={kn:1,kt:1,kts:1,"km/h":1/1.852,"m/s":1.943844,mph:.868976,"ft/s":.592484};function $t(t,e){const i="number"==typeof t?t:Number.parseFloat(String(t));if(!Number.isFinite(i))return null;const n="string"==typeof e?_t[e.trim().toLowerCase()]??1:1;return Math.round(i*n)}const yt=["asphalt","concrete","grass","gravel","water","dirt","unknown"];const vt=110540,bt=111320,xt=t=>t*Math.PI/180;function At(t,e){const i=t.ends[e],n=t.ends[0===e?1:0],s=xt((i.latitude+n.latitude)/2),a=(n.longitude-i.longitude)*Math.cos(s)*bt,r=(n.latitude-i.latitude)*vt;return(180*Math.atan2(a,r)/Math.PI+360)%360}function Mt(t,e=0){const i=xt(t-e);return{x:Math.sin(i),y:-Math.cos(i)}}function St(t,e){return t.findIndex(t=>t.start<=e&&e<t.end)}function kt(t,e,i){const n=t[St(t,e)];return t.find(t=>t.start>e&&(!n||t[i]!==n[i]))??null}const Ct=t=>t.toFixed(1),Et=(t,e,i)=>({x:t.x+e.x*i,y:t.y+e.y*i}),Pt=t=>180*Math.atan2(t.y,t.x)/Math.PI,Tt=(...t)=>t.map((t,e)=>`${e?"L":"M"}${Ct(t.x)},${Ct(t.y)}`).join(" ");function Lt(t){return t?t.arrival&&t.departure?"both":t.arrival?"arr":"dep":""}function Rt(t,e,i,n,s){const a=Pt(e);return Array.from({length:i},(i,r)=>{const o=Et(t,e,r*n);return j`<path class="chevron ${s}" style="animation-delay:${(.22*r).toFixed(2)}s"
      d="M-4,-5 L1.5,0 L-4,5" transform="translate(${Ct(o.x)} ${Ct(o.y)}) rotate(${Ct(a)})" />`})}function Nt(t,e,i,n,s,a){const r=Tt(...e),o=e.slice(1).map((t,i)=>Math.hypot(t.x-e[i].x,t.y-e[i].y)),d=o.reduce((t,e)=>t+e,0)||1,l=(o[0]/d).toFixed(3),h=j`<path class="plane ${t}" d=${"M0,-12C1.4,-12 2,-10.4 2,-8.5L2,-3.2L11.5,2.3L11.5,4.7L2,2L2,7.2L5,9.6L5,11.5L0,10.2L-5,11.5L-5,9.6L-2,7.2L-2,2L-11.5,4.7L-11.5,2.3L-2,-3.2L-2,-8.5C-2,-10.4 -1.4,-12 0,-12Z"} transform="rotate(90)" />`;if(!s.animate){const i="arr"===t?e[0]:e[e.length-1],n="arr"===t?e[1]:e[e.length-2],s={x:i.x+.45*(n.x-i.x),y:i.y+.45*(n.y-i.y)},a="arr"===t?{x:n.x-i.x,y:n.y-i.y}:{x:i.x-n.x,y:i.y-n.y};return j`<g transform="translate(${Ct(s.x)} ${Ct(s.y)}) rotate(${Ct(Pt(a))}) scale(1.1)">${h}</g>`}const u="9s";return j`<g opacity="0">
    <animateMotion dur=${u} begin=${`${a}s`} repeatCount="indefinite" rotate="auto"
      calcMode="linear" path=${r} keyPoints=${`0;${l};1`} keyTimes=${`0;${i};1`} />
    <animate attributeName="opacity" dur=${u} begin=${`${a}s`} repeatCount="indefinite"
      values="0;1;1;0" keyTimes="0;0.08;0.9;1" />
    <g>
      <animateTransform attributeName="transform" type="scale" dur=${u} begin=${`${a}s`}
        repeatCount="indefinite" values=${n.join(";")} keyTimes=${`0;${i};1`} />
      ${h}
    </g>
  </g>`}function Ut(t,e,i){const n=i.dimmed?new Map:e;let s=0;const a=t.runways.map(t=>{const e=function(t,e){const i=t.ends.reduce((t,i)=>{const n=e.get(i.ident);return n?{arrival:(t?.arrival??!1)||n.arrival,departure:(t?.departure??!1)||n.departure}:t},void 0);return i}(t,n);if(!e)return W;const[s,a]=t.ends;return j`<path class="glow ${Lt(e)} ${i.runwayChanged?"changed":""}"
      d=${Tt(s.point,a.point)} stroke-width=${Ct(t.widthPx+10)} />`}),r=t.runways.map(t=>{const[e,i]=t.ends,n=["asphalt","concrete","unknown"].includes(t.surface);return j`<path class="runway ${t.surface}" d=${Tt(e.point,i.point)} stroke-width=${Ct(t.widthPx)} />
      ${n?j`<path class="centreline" d=${Tt(Et(e.point,e.direction,6),Et(i.point,i.direction,6))} />`:W}`}),o=t.runways.flatMap(e=>e.ends.flatMap(a=>{const r=n.get(a.ident);return r?function(t,e,i,n,s,a){const r=[],o=e.direction,d={x:-o.x,y:-o.y},l=n.approachPx,h=Math.max(l/7,9),u=Et(e.point,o,t.lengthPx);if(i.arrival){const i=Et(e.point,d,.95*l);r.push(...Rt(i,o,6,h,"arr")),s.showPlanes&&r.push(Nt("arr",[Et(e.point,d,l),e.point,Et(e.point,o,.55*t.lengthPx)],.62,[1.4,.85,.85],s,2.3*a))}if(i.departure){const i=Et(u,o,22);r.push(...Rt(i,o,6,h,"dep")),s.showPlanes&&r.push(Nt("dep",[e.point,Et(e.point,o,.7*t.lengthPx),Et(u,o,l)],.45,[.85,.85,1.4],s,2.3*a+4.5))}return r}(e,a,r,t,i,s++):[]})),d=t.runways.flatMap(t=>t.ends.map(t=>{const e=Et(t.point,t.direction,-13),i=Lt(n.get(t.ident)),s=7*t.ident.length+8;return j`<g class="label ${i}" transform="translate(${Ct(e.x)} ${Ct(e.y)})">
        <rect x=${-s/2} y="-8" width=${s} height="16" rx="4" />
        <text y="0.5">${t.ident}</text>
      </g>`}));return j`<svg class="map ${i.dimmed?"dimmed":""}" viewBox="0 0 ${t.width} ${t.height}"
      data-rotation=${t.rotation} role="img" aria-hidden="true">
    <defs>
      <filter id="aac-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3.5" />
      </filter>
    </defs>
    <g class="glows">${a}</g>
    <g class="runways">${r}</g>
    <g class="traffic">${o}</g>
    <g class="labels">${d}</g>
    ${function(t,e,i){if(!e)return W;const n=t.width-30,s=0===e.speed?"CALM":`${null===e.direction?"VRB":String(e.direction).padStart(3,"0")+"°"}/${e.speed}${e.gust?`G${e.gust}`:""}`;let a=W;if(e.speed>0&&null!==e.direction){const i=Mt(e.direction+180,t.rotation);a=j`<g transform="translate(${n} ${30}) rotate(${Ct(Pt(i)+90)})">
      <path class="wind-arrow" d="M0,-15 L6,-4 L2,-4 L2,15 L-2,15 L-2,-4 L-6,-4 Z" />
    </g>`}return j`<g class="wind ${i?"changed":""}">
    <circle cx=${n} cy=${30} r="21" class="wind-ring" />
    ${a}
    <text x=${n} y=${64} class="wind-text">${s}${e.speed?j`<tspan class="unit"> kt</tspan>`:""}</text>
  </g>`}(t,i.wind,i.windChanged)}
    ${function(t){return t.rotation?j`<g class="north" transform="translate(22 26) rotate(${-t.rotation})">
    <path d="M0,-13 L5,5 L0,2 L-5,5 Z" />
    <text y="-16" transform="rotate(${t.rotation} 0 -19)">N</text>
  </g>`:W}(t)}
  </svg>`}class Ot{constructor(t){this.particles=[],this.frame=null,this.lastTime=0,this.wind=null,this.rotation=0,this.viewWidth=400,this.viewHeight=300,this.colour="#888",this.canvas=t,this.ctx=t.getContext("2d")}configure(t,e,i,n,s){const a=JSON.stringify(t)!==JSON.stringify(this.wind)||e!==this.rotation||i!==this.viewWidth||n!==this.viewHeight;this.wind=t,this.rotation=e,this.viewWidth=i,this.viewHeight=n,this.colour=s,a&&(this.particles=[]),this.active||this.clear()}get active(){return!!this.wind&&this.wind.speed>0}start(){if(null!==this.frame||!this.active)return;this.lastTime=performance.now();const t=e=>{const i=Math.min((e-this.lastTime)/1e3,.1);this.lastTime=e,this.tick(i),this.frame=requestAnimationFrame(t)};this.frame=requestAnimationFrame(t)}stop(){null!==this.frame&&cancelAnimationFrame(this.frame),this.frame=null}clear(){this.ctx.setTransform(1,0,0,1,0,0),this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)}resize(){const t=this.canvas.getBoundingClientRect(),e=window.devicePixelRatio||1,i=Math.max(1,Math.round(t.width*e)),n=Math.max(1,Math.round(t.height*e));this.canvas.width===i&&this.canvas.height===n||(this.canvas.width=i,this.canvas.height=n)}spawn(t){const e=this.wind,i=e.gust&&e.gust>e.speed?1+Math.random()*(e.gust/e.speed-1):1,n=(6+1.5*e.speed)*i*(.85+.3*Math.random()),s=Mt(null===e.direction?360*Math.random():e.direction+180+16*(Math.random()-.5),this.rotation),a=2.5+3*Math.random();return{x:Math.random()*this.viewWidth,y:Math.random()*this.viewHeight,vx:s.x*n,vy:s.y*n,age:t?Math.random()*a:0,life:a,alpha:.25+.55*Math.random(),turn:null===e.direction?60*(Math.random()-.5):0}}tick(t){if(!this.active)return void this.clear();for(this.resize();this.particles.length<140;)this.particles.push(this.spawn(this.particles.length>0));const e=this.ctx,i=this.canvas.width/this.viewWidth;e.setTransform(1,0,0,1,0,0),e.clearRect(0,0,this.canvas.width,this.canvas.height),e.setTransform(i,0,0,i,0,0),e.strokeStyle=this.colour,e.lineCap="round",e.lineWidth=1.3;for(let i=0;i<this.particles.length;i++){const n=this.particles[i];if(n.turn){const e=n.turn*t*Math.PI/180,i=n.vx*Math.cos(e)-n.vy*Math.sin(e);n.vy=n.vx*Math.sin(e)+n.vy*Math.cos(e),n.vx=i}n.x+=n.vx*t,n.y+=n.vy*t,n.age+=t;const s=n.x<-10||n.y<-10||n.x>this.viewWidth+10||n.y>this.viewHeight+10;if(n.age>n.life||s){this.particles[i]=this.spawn(!1);continue}const a=Math.min(1,n.age/.6,(n.life-n.age)/.6);e.globalAlpha=n.alpha*a,e.beginPath(),e.moveTo(n.x,n.y),e.lineTo(n.x-.35*n.vx,n.y-.35*n.vy),e.stroke()}e.globalAlpha=1}}const Ht={airport:"Airport",title:"Title (optional)",orientation:"Orientation",show_planes:"Animated aircraft",show_wind:"Wind",show_info:"ATIS details",show_atfm:"ATFM Daily Plan"};function It(t,e){const i=Object.keys(t?.states??{}).map(t=>/^sensor\.([a-z0-9]{4})_atis$/.exec(t)).filter(t=>!!t).map(e=>({value:e[1],label:`${t.states[e[0]].attributes.airport??e[1].toUpperCase()} (${e[1].toUpperCase()})`})).sort((t,e)=>t.label.localeCompare(e.label));return e&&!i.some(t=>t.value===e)&&i.unshift({value:e,label:e.toUpperCase()}),i}class Yt extends ot{setConfig(t){this._config=t}_schema(){return[{name:"airport",required:!0,selector:{select:{mode:"dropdown",options:It(this.hass,this._config?.airport)}}},{name:"title",selector:{text:{}}},{name:"orientation",selector:{select:{mode:"list",options:[{value:"north",label:"North up"},{value:"arrival",label:"Arrival runway up"}]}}},{type:"grid",name:"",schema:[{name:"show_planes",selector:{boolean:{}}},{name:"show_wind",selector:{boolean:{}}},{name:"show_info",selector:{boolean:{}}},{name:"show_atfm",selector:{boolean:{}}}]}]}render(){if(!this.hass||!this._config)return W;const t={orientation:"north",show_planes:!0,show_wind:!0,show_info:!0,show_atfm:!1,...this._config};return B`<ha-form
      .hass=${this.hass}
      .data=${t}
      .schema=${this._schema()}
      .computeLabel=${t=>Ht[t.name]??t.name}
      @value-changed=${this._valueChanged}
    ></ha-form>`}_valueChanged(t){const e={...t.detail.value};e.title||delete e.title,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}}Yt.properties={hass:{attribute:!1},_config:{state:!0}},customElements.get("aussie-atis-card-editor")||customElements.define("aussie-atis-card-editor",Yt);const zt=36e5,Dt=t=>!!t&&!["unknown","unavailable",""].includes(t.state);function Bt(t){return t?Object.keys(t.states).map(t=>/^sensor\.([a-z0-9]{4})_atis$/.exec(t)).filter(t=>!!t).map(e=>({icao:e[1],name:String(t.states[e[0]].attributes.airport??e[1].toUpperCase())})).sort((t,e)=>t.name.localeCompare(e.name)):[]}class jt extends ot{constructor(){super(...arguments),this._visible=!0,this._reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)"),this._onVisibility=()=>this._updatePlayback(),this._onMotionChange=()=>this.requestUpdate()}static getConfigElement(){return document.createElement("aussie-atis-card-editor")}static getStubConfig(t){return{airport:Bt(t)[0]?.icao??"yssy"}}setConfig(t){if(!t||"string"!=typeof t.airport||!/^[a-z0-9]{4}$/i.test(t.airport.trim()))throw new Error("Set `airport` to a 4-letter ICAO code, e.g. airport: ymml");this._config={orientation:"north",show_planes:!0,show_wind:!0,show_info:!0,show_atfm:!1,...t,airport:t.airport.trim().toLowerCase()}}getCardSize(){return(!1===this._config?.show_info?5:7)+(this._config?.show_atfm?3:0)}getGridOptions(){return{columns:12,min_columns:6,rows:"auto"}}connectedCallback(){super.connectedCallback(),document.addEventListener("visibilitychange",this._onVisibility),this._reducedMotion.addEventListener("change",this._onMotionChange),this._observer=new IntersectionObserver(t=>{this._visible=t.some(t=>t.isIntersecting),this._updatePlayback()}),this._observer.observe(this),this._scheduleHourTick()}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("visibilitychange",this._onVisibility),this._reducedMotion.removeEventListener("change",this._onMotionChange),this._observer?.disconnect(),this._resizeObserver?.disconnect(),this._resizeObserver=void 0,this._wind?.stop(),window.clearTimeout(this._hourTimer)}get _animate(){return!this._reducedMotion.matches}_entity(t=""){return this.hass?.states[`sensor.${this._config.airport}_atis${t}`]}shouldUpdate(t){if(t.has("_config"))return!0;const e=t.get("hass");if(!e||!this.hass||!this._config)return!0;const i=`sensor.${this._config.airport}_atis`;return e.locale?.language!==this.hass.locale?.language||Object.keys(this.hass.states).some(t=>(t===i||t.startsWith(`${i}_`))&&e.states[t]!==this.hass.states[t])}_windState(){const t=this._entity("_wind_speed");if(!Dt(t))return null;const e=$t(t.state,t.attributes.unit_of_measurement);if(null===e)return null;const i=this._entity("_wind_direction"),n=Dt(i)?Number.parseFloat(i.state):NaN,s=this._entity("_wind_gust"),a=Dt(s)?$t(s.state,s.attributes.unit_of_measurement):null;return{direction:Number.isFinite(n)?Math.round(n):null,speed:e,gust:a}}_issuedAgo(){const t=this._entity("_issued");if(!Dt(t))return null;const e=Date.parse(t.state);if(!Number.isFinite(e))return null;const i=Math.round((e-Date.now())/6e4),n=new Intl.RelativeTimeFormat(this._language(),{numeric:"auto"});return Math.abs(i)<60?n.format(i,"minute"):n.format(Math.round(i/60),"hour")}_text(t){const e=this._entity(t);return Dt(e)?String(e.attributes.full_text??e.state):null}render(){if(!this._config||!this.hass)return W;const t=this._config,e=t.airport.toUpperCase(),i=this._entity(),n=this._entity("_metar");if(!i&&!n)return B`<ha-card>
        <div class="warning">
          No data for <b>${e}</b>. Check that it's selected in the Australian ATIS integration
          (<code>sensor.${t.airport}_atis</code> wasn't found).
        </div>
      </ha-card>`;const s=i?.attributes??{},a=Dt(i),r=Array.isArray(s.changed_fields)?s.changed_fields:[],o=a?ct(s.arrival_runways??this._entity("_arrival_runways")?.state):[],d=a?ct(s.departure_runways??this._entity("_departure_runways")?.state):[],{runways:l,source:h}=mt(s.runways,e),u="arrival"===t.orientation?function(t,e){for(const i of e){const e=wt(t,i);for(const i of t){const t=i.ends.findIndex(t=>t.ident===e);if(t>=0)return Math.round(At(i,t))}}return 0}(l,o):0,c=function(t,e=400,i=0){if(!t.length)return{width:e,height:.6*e,rotation:i,approachPx:0,runways:[]};const n=t.flatMap(t=>t.ends),s=n.reduce((t,e)=>t+e.latitude,0)/n.length,a=n.reduce((t,e)=>t+e.longitude,0)/n.length,r=Math.cos(xt(s)),o=Math.sin(xt(i)),d=Math.cos(xt(i)),l=t=>{const e=(t.longitude-a)*r*bt,i=(t.latitude-s)*vt;return{x:e*d-i*o,y:-(e*o+i*d)}},h=t.map(t=>t.ends.map(l)),u=h.flat().map(t=>t.x),c=h.flat().map(t=>t.y),p=Math.min(...u),g=Math.max(...u),f=Math.min(...c),m=Math.max(...c),w=.42*Math.max(g-p,m-f,1e3),_=g-p+2*w,$=m-f+2*w,y=Math.round(Math.min(Math.max(e*$/_,.55*e),e)),v=Math.min(e/_,y/$),b=e/2-(p+g)/2*v,x=y/2-(f+m)/2*v,A=t=>({x:t.x*v+b,y:t.y*v+x});return{width:e,height:y,rotation:i,approachPx:w*v,runways:t.map((t,e)=>{const[i,n]=h[e].map(A),s=n.x-i.x,a=n.y-i.y,r=Math.hypot(s,a),o={x:s/r,y:a/r},d=t.width??30;return{ident:t.ident,surface:(l=t.surface,yt.includes(l)?l:"unknown"),widthPx:7*(1+Math.max(d-30,0)/60),lengthPx:r,ends:[{ident:t.ends[0].ident,point:i,direction:o},{ident:t.ends[1].ident,point:n,direction:{x:-o.x,y:-o.y}}]};var l})}}(l,400,u),{usage:p,unmatched:g}=function(t,e,i){const n=new Map,s=[],a=(e,i)=>{for(const a of e){const e=wt(t,a);if(!e){s.includes(a)||s.push(a);continue}const r=n.get(e)??{arrival:!1,departure:!1};r[i]=!0,n.set(e,r)}};return a(e,"arrival"),a(i,"departure"),{usage:n,unmatched:s}}(l,o,d),f=a?this._windState():null,m=t.title??`${s.airport??e} (${e})`,w=a?this._issuedAgo():null;return B`<ha-card>
      <div class="header">
        <div class="title">${m}</div>
        ${a?B`<div class="letter" title="Information ${i.state}">${i.state}</div>`:B`<div class="badge">No ATIS</div>`}
      </div>
      ${"none"===h?B`<div class="warning">No runway layout is available for ${e}.</div>`:B`<div class="map-wrap" style="aspect-ratio:${c.width} / ${c.height}">
            ${Ut(c,p,{animate:this._animate,showPlanes:!1!==t.show_planes,dimmed:!a,runwayChanged:r.includes("runway"),wind:!1===t.show_wind?null:f,windChanged:r.includes("wind")})}
            <canvas class="particles"></canvas>
          </div>`}
      <div class="legend">
        <span class="key arr">Arrivals ${o.length?o.join(", "):"—"}</span>
        <span class="key dep">Departures ${d.length?d.join(", "):"—"}</span>
      </div>
      ${g.length?B`<div class="note">Not on the map: ${g.join(", ")}</div>`:W}
      ${!1===t.show_info?W:this._renderInfo(a,w,f,r)}
      ${t.show_atfm?this._renderAtfm(e):W}
    </ha-card>`}_renderInfo(t,e,i,n){if(!t){const t=this._entity()?.attributes.other_info;return B`<div class="info">
        <div class="note">No ATIS is being broadcast right now. The tower may be closed.</div>
        ${t?B`<div class="note">${t}</div>`:W}
      </div>`}const s=t=>n.includes(t)?B`<span class="changed-dot" title="Changed in this broadcast"></span>`:W,a=this._entity("_max_crosswind"),r=this._entity("_max_tailwind"),o=this._entity("_qnh"),d=[Dt(a)?`XW ${$t(a.state,a.attributes.unit_of_measurement)} kt`:null,Dt(r)?`TW ${$t(r.state,r.attributes.unit_of_measurement)} kt`:null].filter(Boolean),l=[["Approach",this._text("_approach"),"approach"],["Wind",this._text("_wind"),"wind"],["Visibility",this._text("_visibility"),"visibility"],["Weather",this._text("_weather"),"weather"],["Cloud",this._text("_cloud"),"cloud"],["Significant weather",this._text("_significant_weather"),"sigwx"],["Operational info",this._text("_operational_info"),"operational_info"]];return B`<div class="info">
      <div class="stats">
        ${e?B`<span>Issued ${e}</span>`:W}
        ${i?B`<span>${null===i.direction?"VRB":`${String(i.direction).padStart(3,"0")}°`} / ${i.speed}${i.gust?`G${i.gust}`:""} kt</span>`:W}
        ${d.length?B`<span>${d.join(" · ")}</span>`:W}
        ${Dt(o)?B`<span>QNH ${o.state}${s("qnh")}</span>`:W}
      </div>
      <dl>
        ${l.filter(([,t])=>t).map(([t,e,i])=>B`<dt>${t}${s(i)}</dt><dd>${e}</dd>`)}
      </dl>
    </div>`}_language(){return this.hass?.locale?.language??this.hass?.language??"en"}_time(t){const e="server"===this.hass?.locale?.time_zone?this.hass.config?.time_zone:void 0,i={hour:"2-digit",minute:"2-digit",hourCycle:"h23"};try{return new Intl.DateTimeFormat(this._language(),{...i,timeZone:e}).format(t)}catch{return new Intl.DateTimeFormat(this._language(),i).format(t)}}_renderAtfm(t){const e=this._entity("_atfm_plan"),i=t=>B`<div class="atfm-title">ATFM Daily Plan${t?B`<span>${t}</span>`:W}</div>`;if(!e)return B`<div class="atfm">
        ${i()}
        <div class="note">
          No ATFM Daily Plan for ${t}. It covers YSSY, YMML, YBBN and YPPH, and needs
          <b>Include ATFM Daily Plan</b> turned on in the Australian ATIS integration.
        </div>
      </div>`;if(!Dt(e))return B`<div class="atfm">
        ${i()}
        <div class="note">The ATFM Daily Plan hasn't been downloaded yet.</div>
      </div>`;const n=Date.parse(`${e.state}T00:00:00Z`),s=Number.isFinite(n)?new Intl.DateTimeFormat(this._language(),{weekday:"short",day:"numeric",month:"short",timeZone:"UTC"}).format(n):e.state,a=e.attributes.version,r=(o=e.attributes.forecast,Array.isArray(o)?o.map(t=>{if(!t||"object"!=typeof t)return null;const e=t,i=Date.parse(String(e.start)),n=Date.parse(String(e.end));return!Number.isFinite(i)||!Number.isFinite(n)||n<=i?null:{start:i,end:n,runwayMode:"string"==typeof e.runway_mode&&e.runway_mode.trim()?e.runway_mode.trim():null,arrivalRate:"number"==typeof e.arrival_rate&&Number.isFinite(e.arrival_rate)?e.arrival_rate:null}}).filter(t=>null!==t).sort((t,e)=>t.start-e.start):[]);var o;const d=Date.now(),l=St(r,d),h=r[l],u=kt(r,d,"runwayMode"),c=kt(r,d,"arrivalRate"),p=Math.max(1,...r.map(t=>t.arrivalRate??0)),g=function(t){const e=[];return t.forEach((i,n)=>{const s=e[e.length-1],a=n>0&&t[n-1].end===i.start;s&&a&&s.runwayMode===i.runwayMode?s.to=n+1:e.push({runwayMode:i.runwayMode,from:n,to:n+1})}),e}(r),f=this._entity("_atfm_ground_delay_program"),m=Dt(f)&&"None"!==f.state&&Array.isArray(f.attributes.programs)?f.attributes.programs:[],w=(t,e)=>{const i=Date.parse(String(t)),n=Date.parse(String(e));return Number.isFinite(i)&&Number.isFinite(n)?` ${this._time(i)}–${this._time(n)}`:""},_=f?.attributes.affected_flights,$=f?.attributes.average_ground_delay_minutes,y=this._text("_atfm_notes"),v=t=>null===t?"—":`${t} arr/h`;return B`<div class="atfm">
      ${i([s,null!=a?`v${a}`:null].filter(Boolean).join(" · "))}
      <div class="stats">
        ${h?B`<span class="atfm-now">Now ${h.runwayMode??"—"} · ${v(h.arrivalRate)}</span>`:B`<span>${r.length&&d<r[0].start?`Plan starts ${this._time(r[0].start)}`:"Outside the plan's hours"}</span>`}
        ${u?B`<span>${u.runwayMode??"—"} from ${this._time(u.start)}</span>`:W}
        ${c&&c.start!==u?.start?B`<span>${v(c.arrivalRate)} from ${this._time(c.start)}</span>`:W}
      </div>
      ${m.length?B`<div class="gdp">
            Ground delay program
            ${m.map(t=>`${t.name??""}${w(t.start,t.end)}`).join(", ")}${"number"==typeof _?`, ${_} flights affected`:""}${"number"==typeof $?`, average delay ${$} min`:""}
          </div>`:W}
      ${r.length?B`<div class="plan" style="--hours:${r.length}" role="img"
            aria-label="Planned runway mode and arrival rate for each hour">
            ${r.map((t,e)=>B`<div
                class="bar ${e===l?"current":t.end<=d?"past":""}"
                style="grid-column:${e+1};--rate:${(t.arrivalRate??0)/p}"
                title="${this._time(t.start)}  ${t.runwayMode??"—"}, ${v(t.arrivalRate)}"
              >${t.arrivalRate??""}</div>`)}
            ${g.map((t,e)=>B`<div
                class="mode ${e%2?"odd":""} ${l>=t.from&&l<t.to?"current":""}"
                style="grid-column:${t.from+1} / ${t.to+1}"
                title="${this._time(r[t.from].start)}–${this._time(r[t.to-1].end)}  ${t.runwayMode??"—"}"
              >${t.runwayMode??"—"}</div>`)}
            ${r.map((t,e)=>e%3==0?B`<div class="hour" style="grid-column:${e+1} / span 3">${this._time(t.start)}</div>`:W)}
          </div>`:W}
      ${y?B`<dl>
            <dt>Plan notes</dt>
            <dd class="clamp" title="Show all" @click=${t=>{const e=t.currentTarget;e.classList.toggle("clamp"),e.title=e.classList.contains("clamp")?"Show all":""}}>${y}</dd>
          </dl>`:W}
    </div>`}_scheduleHourTick(){if(window.clearTimeout(this._hourTimer),!this._config?.show_atfm||!this.isConnected)return;const t=Date.now();this._hourTimer=window.setTimeout(()=>this.requestUpdate(),Math.ceil((t+1)/zt)*zt-t+1e3)}updated(){this._scheduleHourTick();const t=this.renderRoot.querySelector("canvas.particles");if(!t)return this._wind?.stop(),void(this._wind=void 0);this._wind&&this._wind.canvas===t||(this._wind?.stop(),this._wind=new Ot(t),this._resizeObserver?.disconnect(),this._resizeObserver=new ResizeObserver(()=>this._wind?.resize()),this._resizeObserver.observe(t));const e=this.renderRoot.querySelector("svg.map"),i=e?.viewBox.baseVal.height??300,n=getComputedStyle(this).getPropertyValue("--secondary-text-color").trim()||"#888",s=Dt(this._entity()),a=!1!==this._config?.show_wind&&s&&this._animate?this._windState():null;this._wind.configure(a,e?this._rotation(e):0,400,i,n),this._updatePlayback()}_rotation(t){return Number(t.dataset.rotation??0)}_updatePlayback(){const t=this._visible&&"visible"===document.visibilityState&&this._animate,e=this.renderRoot?.querySelector("svg.map");e&&(t?e.unpauseAnimations():e.pauseAnimations(),e.classList.toggle("paused",!t)),t?this._wind?.start():this._wind?.stop()}}jt.properties={hass:{attribute:!1},_config:{state:!0}},jt.styles=((t,...e)=>{const n=1===t.length?t[0]:e.reduce((e,i,n)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[n+1],t[0]);return new s(n,t,i)})`
    :host {
      --aac-arrival-color: var(--success-color, #2ecc71);
      --aac-departure-color: var(--info-color, #3498db);
      --aac-runway-color: #3b3f45;
      --aac-label-color: var(--primary-text-color);
    }
    ha-card {
      overflow: hidden;
      padding-bottom: 8px;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 12px 16px 4px;
    }
    .title {
      font-size: 1.15em;
      font-weight: 500;
    }
    .letter {
      min-width: 32px;
      height: 32px;
      border-radius: 8px;
      display: grid;
      place-items: center;
      font-weight: 700;
      font-size: 1.2em;
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    .badge {
      padding: 4px 8px;
      border-radius: 8px;
      background: var(--disabled-color, #888);
      color: var(--text-primary-color, #fff);
      font-size: 0.85em;
    }
    .map-wrap {
      position: relative;
      width: 100%;
    }
    .map-wrap svg,
    .particles {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
    .particles {
      pointer-events: none;
    }
    svg {
      overflow: visible;
    }
    .runway {
      stroke: var(--aac-runway-color);
      stroke-linecap: butt;
      fill: none;
    }
    .runway.concrete {
      stroke: #9a9da1;
    }
    .runway.grass {
      stroke: #829c36;
    }
    .runway.gravel {
      stroke: #7d7a73;
    }
    .runway.dirt {
      stroke: #bf6e4d;
    }
    .runway.water {
      stroke: #1581cf;
    }
    .centreline {
      stroke: #fff;
      stroke-width: 1;
      stroke-dasharray: 8 5;
      opacity: 0.85;
      fill: none;
    }
    .dimmed .runways,
    .dimmed .labels {
      opacity: 0.45;
    }
    .glow {
      fill: none;
      stroke-linecap: round;
      opacity: 0.6;
      filter: url(#aac-glow);
    }
    .glow.arr {
      stroke: var(--aac-arrival-color);
    }
    .glow.dep {
      stroke: var(--aac-departure-color);
    }
    .glow.both {
      stroke: var(--aac-arrival-color);
      animation: both-colours 4s ease-in-out infinite;
    }
    .glow.changed {
      animation: pulse 1.2s ease-in-out 4;
    }
    .glow.both.changed {
      animation:
        both-colours 4s ease-in-out infinite,
        pulse 1.2s ease-in-out 4;
    }
    @keyframes both-colours {
      0%,
      100% {
        stroke: var(--aac-arrival-color);
      }
      50% {
        stroke: var(--aac-departure-color);
      }
    }
    @keyframes pulse {
      0%,
      100% {
        opacity: 0.6;
      }
      50% {
        opacity: 1;
      }
    }
    .chevron {
      fill: none;
      stroke-width: 2.2;
      stroke-linecap: round;
      stroke-linejoin: round;
      opacity: 0.2;
      animation: flow 1.6s linear infinite;
    }
    .chevron.arr {
      stroke: var(--aac-arrival-color);
    }
    .chevron.dep {
      stroke: var(--aac-departure-color);
    }
    @keyframes flow {
      0% {
        opacity: 0.15;
      }
      25% {
        opacity: 1;
      }
      65%,
      100% {
        opacity: 0.15;
      }
    }
    .plane {
      stroke: var(--card-background-color, #fff);
      stroke-width: 1;
    }
    .plane.arr {
      fill: var(--aac-arrival-color);
    }
    .plane.dep {
      fill: var(--aac-departure-color);
    }
    .label rect {
      fill: var(--card-background-color, #fff);
      stroke: var(--divider-color, #ccc);
      stroke-width: 1;
    }
    .label text {
      font: 700 10px var(--ha-font-family-body, Roboto, sans-serif);
      fill: var(--aac-label-color);
      text-anchor: middle;
      dominant-baseline: middle;
    }
    .label.arr rect {
      fill: var(--aac-arrival-color);
      stroke: none;
    }
    .label.dep rect {
      fill: var(--aac-departure-color);
      stroke: none;
    }
    .label.both rect {
      fill: var(--aac-arrival-color);
      stroke: var(--aac-departure-color);
      stroke-width: 2.5;
    }
    .label.arr text,
    .label.dep text,
    .label.both text {
      fill: #fff;
    }
    .wind-ring {
      fill: var(--card-background-color, #fff);
      fill-opacity: 0.7;
      stroke: var(--divider-color, #ccc);
    }
    .wind-arrow {
      fill: var(--primary-text-color);
    }
    .wind-text {
      font: 600 10px var(--ha-font-family-body, Roboto, sans-serif);
      fill: var(--primary-text-color);
      text-anchor: middle;
    }
    .wind-text .unit {
      font-weight: 400;
      fill: var(--secondary-text-color);
    }
    .wind.changed .wind-ring {
      stroke: var(--warning-color, #ff9800);
      stroke-width: 2;
    }
    .north path {
      fill: var(--secondary-text-color);
    }
    .north text {
      font: 700 9px var(--ha-font-family-body, Roboto, sans-serif);
      fill: var(--secondary-text-color);
      text-anchor: middle;
    }
    .paused *,
    .paused {
      animation-play-state: paused !important;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 16px;
      padding: 4px 16px;
      font-weight: 500;
    }
    .key::before {
      content: "";
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 6px;
      vertical-align: -1px;
    }
    .key.arr::before {
      background: var(--aac-arrival-color);
    }
    .key.dep::before {
      background: var(--aac-departure-color);
    }
    .info {
      padding: 0 16px;
    }
    .stats {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 14px;
      color: var(--secondary-text-color);
      font-size: 0.9em;
      padding: 4px 0;
    }
    dl {
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: 2px 12px;
      margin: 4px 0 0;
      font-size: 0.9em;
    }
    dt {
      color: var(--secondary-text-color);
    }
    dd {
      margin: 0;
    }
    .changed-dot {
      display: inline-block;
      width: 7px;
      height: 7px;
      margin-left: 5px;
      border-radius: 50%;
      background: var(--warning-color, #ff9800);
      vertical-align: 1px;
    }
    .note,
    .warning {
      padding: 4px 16px;
      color: var(--secondary-text-color);
      font-size: 0.9em;
    }
    .info .note {
      padding: 4px 0;
    }
    .atfm {
      padding: 8px 16px 0;
      margin-top: 8px;
      border-top: 1px solid var(--divider-color, #e0e0e0);
    }
    .atfm-title {
      font-weight: 500;
    }
    .atfm-title span {
      margin-left: 8px;
      font-weight: 400;
      color: var(--secondary-text-color);
      font-size: 0.9em;
    }
    .atfm .note {
      padding: 4px 0;
    }
    .atfm dd.clamp {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      overflow: hidden;
      cursor: pointer;
    }
    .atfm-now {
      color: var(--primary-text-color);
      font-weight: 500;
    }
    .gdp {
      margin: 4px 0;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.9em;
      background: rgba(255, 152, 0, 0.15);
      border-left: 3px solid var(--warning-color, #ff9800);
    }
    .plan {
      display: grid;
      grid-template-columns: repeat(var(--hours), minmax(0, 1fr));
      grid-template-rows: 48px auto auto;
      column-gap: 2px;
      margin: 6px 0 2px;
      font-size: 0.75em;
    }
    .bar {
      grid-row: 1;
      align-self: end;
      height: calc(14px + var(--rate) * 34px);
      box-sizing: border-box;
      border-radius: 3px 3px 0 0;
      background: var(--aac-arrival-color);
      opacity: 0.55;
      color: #fff;
      text-align: center;
      font-size: 0.85em;
      line-height: 14px;
      overflow: hidden;
    }
    .bar.past {
      opacity: 0.35;
    }
    .bar.current {
      opacity: 1;
      box-shadow: 0 0 0 2px var(--primary-text-color);
    }
    .mode {
      grid-row: 2;
      margin-top: 3px;
      padding: 2px 3px;
      border-radius: 3px;
      background: rgba(127, 127, 127, 0.18);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: center;
    }
    .mode.odd {
      background: rgba(127, 127, 127, 0.32);
    }
    .mode.current {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      font-weight: 500;
    }
    .hour {
      grid-row: 3;
      padding-top: 2px;
      color: var(--secondary-text-color);
      white-space: nowrap;
      overflow: hidden;
    }
    .warning {
      padding: 16px;
      color: var(--warning-color, #ff9800);
    }
  `,customElements.get("aussie-atis-card")||(customElements.define("aussie-atis-card",jt),window.customCards=window.customCards??[],window.customCards.push({type:"aussie-atis-card",name:"Aussie ATIS",description:"An Australian airport's runways, with the runways in use animated. Needs the Australian ATIS integration.",preview:!0,documentationURL:"https://github.com/BigByte76/aussie-atis-lovelace-card"}),console.info("%c AUSSIE-ATIS-CARD %c 1.1.0 ","color:#fff;background:#00843d","color:#00843d"));export{Bt as findAirports};
