const parser=new DOMParser;var unpack=function unpack(code){var env={eval:function(e){code=e},window:{},document:{}};return eval("with(env) {"+code+"}"),code=""+code,code};function og_search(e,t){var r=e.querySelector("meta[property='og:"+t+"']")||e.querySelector("meta[name='og:"+t+"']")||e.querySelector("meta[itemprop='og:"+t+"']");return r?r.getAttribute("content"):r}function decodehtml(e){var t=document.createElement("textarea");return t.innerHTML=e,t.value}function get_yt_id(e){return url=new URL(e),0==url.search.length?url.pathname.substring(1):parseqs(url.search).v}function vidzi(e,t){var r={};r.base_url=t,r.video_urls=[],r.thumbnail="http://null",e=parser.parseFromString(e,"text/html");var n=unpack(/eval\(function\(p[\s\S]*?\)\)\)/.exec(e.body.innerHTML)[0]);return r.title=e.title,url=/file:"(http.*?mp4)"/.exec(n)[1],r.video_urls.push({url:url,quality:"highest"}),r}function keeload(e,t){e=parser.parseFromString(e,"text/html");var r=/(eval\(func[\s\S]*?)<\/script/.exec(e);r=r?r[1]:e.scripts[e.scripts.length-1].innerHTML;var n=unpack(r),o=/title:["'](.*?)["'],/g.exec(n)[1],a=/file:["'](.*?)["'],/g.exec(n)[1],l=/image:["'](.*?)["'],/g.exec(n)[1];return data={},data.base_url=t,data.title=o,data.video_urls=[],data.video_urls.push({url:a}),data.thumbnail=l,data}function megadrive(e,t){var r={};r.base_url=t,e=parser.parseFromString(e,"text/html"),r.title=og_search(e,"title"),r.thumbnail=og_search(e,"image");return r.video_urls=[],r.video_urls.push({url:/mp4:["']([\s\S]*?)['"],/.exec(e.body.innerHTML),quality:"Default"}),r}function openload(_page,base_url){console.log("Openload");var sandbox={window:{location:function(e){}},location:function(e){}};page=parser.parseFromString(_page,"text/html");var div=document.createElement("div");with(div.id="OpenloadID",div.style.display="none",div.innerHTML=page.body.innerHTML,sandbox){document.body.appendChild(div),document.body.style.backgroundColor="#fff";var p=document.getElementById("DtsBlkVFQx")||[...document.querySelectorAll("p")].filter(e=>e.textContent.includes("640K"))[0]||document.getElementsByTagName("p")[1],scripts=page.scripts;eval(scripts[scripts.length-1].innerHTML)}var url=p,final_reg=new RegExp(/>[\s\S]([\w-]+~\d{10,}~\d+\.\d+\.0\.0~[\w-]+)[\s\S]</),bruh=document.getElementById("openload-why");bruh.style.display="block",bruh.onclick=function(){data={},data.base_url=base_url,url?data.video_urls=[{url:"https://openload.co/stream/"+url.innerHTML+"?mime=true",quality:"Default"}]:(console.warn("Using Regex.."),url=final_reg.exec(div.innerHTML).replace("<","").replace(">",""),data.video_urls=[{url:"https://openload.co/stream/"+url+"?mime=true",quality:"Default"}],document.body.removeChild(div)),data.title="Video",data.thumbnail=document.getElementsByTagName("video")[0].poster,console.log(data),start_create_video(data)}}function instagram(e,t){const r={};return r.base_url=t,r.video_urls=[],e=parser.parseFromString(e,"text/html"),r.title=e.title,r.thumbnail=og_search(e,"image"),video=e.querySelector("meta[property='og:video']"),null==video?(r.image__=r.thumbnail,r):(r.video_urls.push({url:video.getAttribute("content"),quality:"default"}),r)}function streamango(page,base_url){const re=new RegExp(/eval\(function\(p[\s\S]*?var\s*?srces=[\s\S]*?}\);/),data={video_urls:[]};page=parser.parseFromString(page,"text/html"),script_=re.exec(page.body.innerHTML)[0],eval(script_),data.title=og_search(page,"title"),data.thumbnail=og_search(page,"image"),data.base_url=base_url;for(const e in srces)ret=srces[e],url=ret.src,url.includes("http")||(url="https:"+url),q=ret.height,data.video_urls.push({url:url,quality:q});return data}function rapidvideo(e,t){return estream(e,t)}function watcheng(e,t){const r={video_urls:[]};return e=parser.parseFromString(e,"text/html"),r.title=e.title,r.thumbnail=e.getElementsByTagName("video")[0].getAttribute("poster"),r.base_url=t,sources=e.getElementsByTagName("source")[0],r.video_urls.push({url:sources.src,quality:"default"}),r}function estream(e,t){const r={video_urls:[]};e=parser.parseFromString(e,"text/html"),r.title=e.title,thumbnail=og_search(e,"image"),r.thumbnail=thumbnail||"//null",r.base_url=t,sources=e.getElementsByTagName("source");for(let e=0;e<sources.length;e++)el=sources[e],el.getAttribute("src").includes("m3u8")||r.video_urls.push({url:el.getAttribute("src"),quality:el.getAttribute("res")||el.getAttribute("label")||el.getAttribute("data-res")});return r}function yourupload(e,t){const r={video_urls:[]};return e=parser.parseFromString(e,"text/html"),re=/file:\s'(.*?mp4)(?=\',)/,url=re.exec(e.body.innerHTML)[1],r.video_urls.push({url:url,quality:"Highest"}),r.base_url=t,r.thumbnail=og_search(e,"image"),r.title=og_search(e,"title")||e.title,r}function youtube(e,t){var r=document.getElementById("btn-mp3");r.style.display="block";var n={youtube:!0};n.base_url=t,e=parser.parseFromString(e,"text/html"),re=new RegExp(/ytplayer.config\s=\s(.*?)(?=;ytplayer.)/,"m");try{var o=re.exec(e.body.innerHTML)[1];js=JSON.parse(o)}catch(e){document.getElementById("errs").innerHTML="An Unknown Error occured",document.getElementById("errs").style.color="red",console.log(e),window.location="//dl-py.herokuapp.com/video?url="+encodeURIComponent(t),alert("Age Restricted Video Detected.using python parser")}var a=js.args.title,l="https://www.youtube.com"+js.assets.js,i="https://i.ytimg.com/vi/"+js.args.video_id+"/hqdefault.jpg"||js.args.thumbnail_url;n.title=a,n.basejs=l,n.thumbnail=i,n.video_urls=[],urls=js.args.url_encoded_fmt_stream_map.split(","),audio_urls=js.args.adaptive_fmts;if(n.ytaudio=!0,void 0==audio_urls)r.innerHTML="No audio url found for this video",n.ytaudio=!1;else{var s;audio_urls=audio_urls.split(","),r.innerHTML="Click here for mp3 version of this video";for(var u=0;u<audio_urls.length;u++)qs=parseqs(audio_urls[u]),qs.url.indexOf("audio")>-1&&(qs.bitrate,qs.bitrate,audio_url=decodeURIComponent(qs.url),s=qs.s);n.audio_url=[],n.audio_url.push({url:audio_url,sig_:s})}if(null!=parseqs(urls[0]).s)return console.log("Fetch Signature Functions"),void youtube_signatures(urls,n,n.basejs);for(u=0;u<urls.length;u++)qs=parseqs(urls[u]),qs.url.indexOf("ratebypass")>-1&&n.video_urls.push({url:decodeURIComponent(qs.url),quality:qs.quality});return n}function youtube_signatures(e,t,r){var n=new XMLHttpRequest;console.log(t),n.open("GET","/youtube/js/?url="+encodeURIComponent(r),!0),n.onload=function(){if(200===n.status){ret=JSON.parse(n.response);var o=document.createTextNode(ret.sig_js),a=ret.funcname,l=document.createElement("script");l.appendChild(o),document.body.appendChild(l);for(var i=0;i<e.length;i++)qs=parseqs(e[i]),qs.url.indexOf("ratebypass")>-1&&(sig=qs.s,console.log(sig),new_sig=window[a](sig),r=decodeURIComponent(qs.url)+"&signature="+new_sig,t.video_urls.push({url:r,quality:qs.quality}));sig=window[a](t.audio_url[0].sig_),console.log(sig),t.audio_url[0].url+="&signature="+sig,start_create_video(t)}},n.send()}function offer_proxy(){const e=document.getElementsByClassName("proxy_403");for(let t=0;t<e.length;t++)e[t].style.display="block"}function get_videos(e){var t=new Request("/videos/fetch/",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"url="+encodeURIComponent(e)});fetch(t).then(e=>e.json()).then(t=>{if(t.hasOwnProperty("error"))document.getElementById("errs").innerHTML=t.error;else{if(t.hasOwnProperty("redirect"))return document.getElementById("errs").innerHTML="Redirecting to server extractor",void(window.location=t.redirect);page=t.html,funcname=t.funcname,e=t.landing_url;try{data=window[funcname](page,e)}catch(e){throw console.error(e),document.getElementById("errs").innerHTML="An Unknown Error Occured",e}console.log(data),"undefined"!=typeof data&&start_create_video(data)}})}function parseqs(e){var t={};e="?"==e[0]?e.substring(1):e;for(var r=(e=decodeURI(e)).split("&"),n=0;n<r.length;n++){var o=r[n].split("=");t[o[0]]=decodeURIComponent(o[1])}return t}function create_video(e){var t=document.getElementById("videos");if(e.image__){document.body.innerHTML="<img src="+e.image__+">";var r=document.createElement("div");return r.innerHTML=e.title,void document.body.appendChild(r)}e.youtube&&e.ytaudio&&(document.getElementById("btn-mp3url").href="/mp3extract/?mp3u="+encodeURIComponent(e.audio_url[0].url)),json_data=e,document.title=json_data.title,document.getElementById("title").innerHTML=json_data.title,0==json_data.video_urls.length&&(document.getElementById("errs").innerHTML="No Playable Video Found..please Check if the video exists");for(var n=0;n<json_data.video_urls.length;n++){var o=document.createElement("div");o.innerText=decodehtml(json_data.title);var a=document.createElement("div");a.innerText="Quality:"+json_data.video_urls[n].quality,o.style.fontWeight="bold",o.style.marginTop="10px",o.appendChild(a);var l=document.createElement("video"),i=document.createElement("source"),s=decodehtml(json_data.video_urls[n].url);i.src=s,i.type="video/mp4",i.onerror=function(){offer_proxy()},l.poster=json_data.thumbnail,l.controls="True",l.height="225",l.width="400",l.setAttribute("class","vid"),l.preload="none",l.appendChild(i);var u=document.createElement("div"),d=document.createElement("a");d.href=s;var c=document.createElement("button"),p=document.createElement("a");c.setAttribute("class","proxy_403"),p.className="proxy_link",c.style.display="none",c.innerHTML="View this video",p.href="/fetch_url/?u="+encodeURIComponent(s)+"&referer="+encodeURIComponent(json_data.base_url),p.appendChild(c),d.innerText="Direct Link to Video File",u.appendChild(d),t.appendChild(l),t.appendChild(p),t.appendChild(o),t.appendChild(document.createElement("br")),t.appendChild(u)}hpg=document.createElement("a"),hpg.href="/",hpg.innerHTML="Homepage";var m=document.createElement("div");m.appendChild(hpg),t.appendChild(m),document.getElementById("skelly").style.display="none",document.getElementById("dlfail").style.display="block"}function start_create_video(e){try{create_video(e)}catch(e){document.getElementById("errs").innerHTML="An Unknown Error occured",document.getElementById("errs").style.color="red",console.log(e)}}