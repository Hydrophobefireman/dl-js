const parser=new DOMParser,unpack=function unpack(code){const env={eval:function(e){code=e},window:{},document:{}};return eval(`with(env) {${code}}`),code=`${code}`,code};function og_search(e,t){const r=e.querySelector(`meta[property='og:${t}']`)||e.querySelector(`meta[name='og:${t}']`)||e.querySelector(`meta[itemprop='og:${t}']`);return r?r.getAttribute("content"):r}function decodehtml(e){const t=document.createElement("textarea");return t.innerHTML=e,t.value}function get_yt_id(e){return url=new URL(e),0==url.search.length?url.pathname.substring(1):parseqs(url.search).v}function vidzi(e,t){const r={};r.base_url=t,r.video_urls=[],r.thumbnail="http://null",e=parser.parseFromString(e,"text/html");const n=unpack(/eval\(function\(p[\s\S]*?\)\)\)/.exec(e.body.innerHTML)[0]);return r.title=e.title,url=/file:"(http.*?mp4)"/.exec(n)[1],r.video_urls.push({url:url,quality:"highest"}),r}function keeload(e,t){e=parser.parseFromString(e,"text/html");let r=/(eval\(func[\s\S]*?)<\/script/.exec(e);r=r?r[1]:e.scripts[e.scripts.length-1].innerHTML;const n=unpack(r),o=/title:["'](.*?)["'],/g.exec(n)[1],s=/file:["'](.*?)["'],/g.exec(n)[1],l=/image:["'](.*?)["'],/g.exec(n)[1];return data={},data.base_url=t,data.title=o,data.video_urls=[],data.video_urls.push({url:s}),data.thumbnail=l,data}function megadrive(e,t){const r={};r.base_url=t,e=parser.parseFromString(e,"text/html"),r.title=og_search(e,"title"),r.thumbnail=og_search(e,"image");return r.video_urls=[],r.video_urls.push({url:/mp4:["']([\s\S]*?)['"],/.exec(e.body.innerHTML),quality:"Default"}),r}function openload(_page,base_url){console.log("Openload");const sandbox={window:{location(e){}},location(e){}};page=parser.parseFromString(_page,"text/html");const div=document.createElement("div");div.id="OpenloadID",div.style.display="none",div.innerHTML=page.body.innerHTML,eval("with(sandbox){document.body.appendChild(div);document.body.style.backgroundColor='#fff';var p=document.getElementById('lqEH1')||document.getElementById(\"DtsBlkVFQx\")||document.getElementsByTagName(\"span\")[0]\nvar scripts=page.scripts;eval(scripts[scripts.length-1].innerHTML)}");let url=p;const final_reg=new RegExp(/>[\s\S]([\w-]+~\d{10,}~\d+\.\d+\.0\.0~[\w-]+)[\s\S]</),bruh=document.getElementById("openload-why");bruh.style.display="block",bruh.onclick=(()=>{data={},data.base_url=base_url,url?data.video_urls=[{url:`https://openload.co/stream/${url.innerHTML}?mime=true`,quality:"Default"}]:(console.warn("Using Regex.."),url=final_reg.exec(div.innerHTML).replace("<","").replace(">",""),data.video_urls=[{url:`https://openload.co/stream/${url}?mime=true`,quality:"Default"}],document.body.removeChild(div)),data.title="Video",data.thumbnail=document.getElementsByTagName("video")[0].poster,console.log(data),start_create_video(data)})}function instagram(e,t){const r={};return r.base_url=t,r.video_urls=[],e=parser.parseFromString(e,"text/html"),r.title=e.title,r.thumbnail=og_search(e,"image"),video=e.querySelector("meta[property='og:video']"),null==video?(r.image__=r.thumbnail,r):(r.video_urls.push({url:video.getAttribute("content"),quality:"default"}),r)}function streamango(page,base_url){const re=new RegExp(/eval\(function\(p[\s\S]*?var\s*?srces=[\s\S]*?}\);/),data={video_urls:[]};page=parser.parseFromString(page,"text/html"),script_=re.exec(page.body.innerHTML)[0],eval(script_),data.title=og_search(page,"title"),data.thumbnail=og_search(page,"image"),data.base_url=base_url;for(const e in srces)ret=srces[e],url=ret.src,url.includes("http")||(url=`https:${url}`),q=ret.height,data.video_urls.push({url:url,quality:q});return data}function rapidvideo(e,t){return estream(e,t)}function watcheng(e,t){const r={video_urls:[]};return e=parser.parseFromString(e,"text/html"),r.title=e.title,r.thumbnail=e.getElementsByTagName("video")[0].getAttribute("poster"),r.base_url=t,sources=e.getElementsByTagName("source")[0],r.video_urls.push({url:sources.src,quality:"default"}),r}function estream(e,t){const r={video_urls:[]};e=parser.parseFromString(e,"text/html"),r.title=e.title,thumbnail=og_search(e,"image"),r.thumbnail=thumbnail||"//null",r.base_url=t,sources=e.getElementsByTagName("source");for(let e=0;e<sources.length;e++)el=sources[e],el.getAttribute("src").includes("m3u8")||r.video_urls.push({url:el.getAttribute("src"),quality:el.getAttribute("res")||el.getAttribute("label")||el.getAttribute("data-res")});return r}function yourupload(e,t){const r={video_urls:[]};return e=parser.parseFromString(e,"text/html"),re=/file:\s'(.*?mp4)(?=\',)/,url=re.exec(e.body.innerHTML)[1],r.video_urls.push({url:url,quality:"Highest"}),r.base_url=t,r.thumbnail=og_search(e,"image"),r.title=og_search(e,"title")||e.title,r}function youtube(e,t){const r=document.getElementById("btn-mp3");r.style.display="block";const n={youtube:!0};n.base_url=t,e=parser.parseFromString(e,"text/html"),re=new RegExp(/ytplayer.config\s=\s(.*?)(?=;ytplayer.)/,"m");try{const r=re.exec(e.body.innerHTML)[1];js=JSON.parse(r)}catch(e){document.getElementById("errs").innerHTML="An Unknown Error occured",document.getElementById("errs").style.color="red",console.log(e),window.location=`//dl-py.herokuapp.com/video?url=${encodeURIComponent(t)}`,alert("Age Restricted Video Detected.using python parser")}const o=js.args.title,s=`https://www.youtube.com${js.assets.js}`,l=`https://i.ytimg.com/vi/${js.args.video_id}/hqdefault.jpg`||js.args.thumbnail_url;n.title=o,n.basejs=s,n.thumbnail=l,n.video_urls=[],urls=js.args.url_encoded_fmt_stream_map.split(","),audio_urls=js.args.adaptive_fmts;let a=0;if(n.ytaudio=!0,null==audio_urls)r.innerHTML="No audio url found for this video",n.ytaudio=!1;else{let e;audio_urls=audio_urls.split(","),r.innerHTML="Click here for mp3 version of this video";for(var i=0;i<audio_urls.length;i++)qs=parseqs(audio_urls[i]),qs.url.includes("audio")&&(qs.bitrate,a=qs.bitrate,audio_url=decodeURIComponent(qs.url),e=qs.s);n.audio_url=[],n.audio_url.push({url:audio_url,sig_:e})}if(null!=parseqs(urls[0]).s)return console.log("Fetch Signature Functions"),void youtube_signatures(urls,n,n.basejs);for(i=0;i<urls.length;i++)qs=parseqs(urls[i]),qs.url.includes("ratebypass")&&n.video_urls.push({url:decodeURIComponent(qs.url),quality:qs.quality});return n}function youtube_signatures(e,t,r){const n=new XMLHttpRequest;console.log(t),n.open("GET",`/youtube/js/?url=${encodeURIComponent(r)}`,!0),n.onload=(()=>{if(200===n.status){ret=JSON.parse(n.response);const o=document.createTextNode(ret.sig_js),s=ret.funcname,l=document.createElement("script");l.appendChild(o),document.body.appendChild(l);for(let n=0;n<e.length;n++)qs=parseqs(e[n]),qs.url.includes("ratebypass")&&(sig=qs.s,console.log(sig),new_sig=window[s](sig),r=`${decodeURIComponent(qs.url)}&signature=${new_sig}`,t.video_urls.push({url:r,quality:qs.quality}));sig=window[s](t.audio_url[0].sig_),console.log(sig),t.audio_url[0].url+=`&signature=${sig}`,start_create_video(t)}}),n.send()}function offer_proxy(){const e=document.getElementsByClassName("proxy_403");for(let t=0;t<e.length;t++)e[t].style.display="block"}async function get_videos(e){const t=new Request("/videos/fetch/",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`url=${encodeURIComponent(e)}`}),r=await fetch(t),n=await r.json();if(n.hasOwnProperty("error"))document.getElementById("errs").innerHTML=n.error;else{if(n.hasOwnProperty("redirect"))return document.getElementById("errs").innerHTML="Redirecting to server extractor",void(window.location=n.redirect);page=n.html,funcname=n.funcname,e=n.landing_url;try{data=window[funcname](page,e)}catch(e){throw console.error(e),document.getElementById("errs").innerHTML="An Unknown Error Occured",e}console.log(data),"undefined"!=typeof data&&start_create_video(data)}}function parseqs(e){const t={};e="?"==e[0]?e.substring(1):e;const r=(e=decodeURI(e)).split("&");for(let e=0;e<r.length;e++){const n=r[e].split("=");t[n[0]]=decodeURIComponent(n[1])}return t}function create_video(e){const t=document.getElementById("videos");if(e.image__){document.body.innerHTML=`<img src=${e.image__}>`;const t=document.createElement("div");return t.innerHTML=e.title,void document.body.appendChild(t)}e.youtube&&e.ytaudio&&(document.getElementById("btn-mp3url").href=`/mp3extract/?mp3u=${encodeURIComponent(e.audio_url[0].url)}`),json_data=e,document.title=json_data.title,document.getElementById("title").innerHTML=json_data.title,0==json_data.video_urls.length&&(document.getElementById("errs").innerHTML="No Playable Video Found..please Check if the video exists");for(let e=0;e<json_data.video_urls.length;e++){const r=document.createElement("div");r.innerText=decodehtml(json_data.title);const n=document.createElement("div");n.innerText=`Quality:${json_data.video_urls[e].quality}`,r.style.fontWeight="bold",r.style.marginTop="10px",r.appendChild(n);const o=document.createElement("video"),s=document.createElement("source"),l=decodehtml(json_data.video_urls[e].url);s.src=l,s.type="video/mp4",s.onerror=(()=>{offer_proxy()}),o.poster=json_data.thumbnail,o.controls="True",o.height="225",o.width="400",o.setAttribute("class","vid"),o.preload="none",o.appendChild(s);const a=document.createElement("div"),i=document.createElement("a");i.href=l;const u=document.createElement("button"),d=document.createElement("a");u.setAttribute("class","proxy_403"),d.className="proxy_link",u.style.display="none",u.innerHTML="View this video",d.href=`/fetch_url/?u=${encodeURIComponent(l)}&referer=${encodeURIComponent(json_data.base_url)}`,d.appendChild(u),i.innerText="Direct Link to Video File",a.appendChild(i),t.appendChild(o),t.appendChild(d),t.appendChild(r),t.appendChild(document.createElement("br")),t.appendChild(a)}hpg=document.createElement("a"),hpg.href="/",hpg.innerHTML="Homepage";const r=document.createElement("div");r.appendChild(hpg),t.appendChild(r),document.getElementById("skelly").style.display="none",document.getElementById("dlfail").style.display="block"}function start_create_video(e){try{create_video(e)}catch(e){document.getElementById("errs").innerHTML="An Unknown Error occured",document.getElementById("errs").style.color="red",console.log(e)}}