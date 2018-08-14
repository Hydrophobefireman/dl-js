var parser=new DOMParser;function unpack(a){return eval("with(env) {"+a+"}"),(a+"").replace(/;/g,";\n").replace(/{/g,"\n{\n").replace(/}/g,"\n}\n").replace(/\n;\n/g,";\n").replace(/\n\n/g,"\n")}function og_search(e,t){var r=e.querySelector("meta[property='og:"+t+"']")||e.querySelector("meta[name='og:"+t+"']")||e.querySelector("meta[itemprop='og:"+t+"']");return r?r.getAttribute("content"):r}function decodehtml(e){var t=document.createElement("textarea");return t.innerHTML=e,t.value}function get_yt_id(e){return 0==(e=new URL(e)).search.length?e.pathname.substring(1):parseqs(e.search).v}function vidzi(e,t){var r={};return r.base_url=t,r.video_urls=[],r.thumbnail="http://null",funcre=/eval\(function\(p[\s\S]*?\)\)\)/,e=parser.parseFromString(e,"text/html"),evald=unpack(funcre.exec(e.body.innerHTML)[0]),r.title=e.title,mp4re=/file:"(http.*?mp4)"/,url=mp4re.exec(evald)[1],r.video_urls.push({url:url,quality:"highest"}),r}function megadrive(e,t){var r={};return r.base_url=t,e=parser.parseFromString(e,"text/html"),r.title=og_search(e,"title"),r.thumbnail=og_search(e,"image"),reg=/mp4:["']([\s\S]*?)['"],/,r.video_urls=[],r.video_urls.push({url:reg.exec(e.body.innerHTML),quality:"Default"}),r}function instagram(e,t){var r={};return r.base_url=t,r.video_urls=[],e=parser.parseFromString(e,"text/html"),r.title=e.title,r.thumbnail=og_search(e,"image"),video=e.querySelector("meta[property='og:video']"),null==video?r.image__=r.thumbnail:r.video_urls.push({url:video.getAttribute("content"),quality:"default"}),r}function streamango(a,c){var b=new RegExp(/eval\(function\(p[\s\S]*?var\s*?srces=[\s\S]*?}\);/),d={video_urls:[]};for(var e in a=parser.parseFromString(a,"text/html"),script_=b.exec(a.body.innerHTML)[0],eval(script_),d.title=og_search(a,"title"),d.thumbnail=og_search(a,"image"),d.base_url=c,srces)ret=srces[e],url=ret.src,-1==url.indexOf("http")&&(url="https:"+url),q=ret.height,d.video_urls.push({url:url,quality:q});return d}function rapidvideo(e,t){return estream(e,t)}function watcheng(e,t){var r={video_urls:[]};return e=parser.parseFromString(e,"text/html"),r.title=e.title,r.thumbnail=e.getElementsByTagName("video")[0].getAttribute("poster"),r.base_url=t,sources=e.getElementsByTagName("source")[0],r.video_urls.push({url:sources.src,quality:"default"}),r}function estream(e,t){var r={video_urls:[]};e=parser.parseFromString(e,"text/html"),r.title=e.title,thumbnail=og_search(e,"image"),r.thumbnail=thumbnail||"//null",r.base_url=t,sources=e.getElementsByTagName("source");for(var n=0;n<sources.length;n++)el=sources[n],-1==el.getAttribute("src").indexOf("m3u8")&&r.video_urls.push({url:el.getAttribute("src"),quality:el.getAttribute("res")||el.getAttribute("label")||el.getAttribute("data-res")});return r}function yourupload(e,t){var r={video_urls:[]};return e=parser.parseFromString(e,"text/html"),re=/file:\s'(.*?mp4)(?=',)/,url=re.exec(e.body.innerHTML)[1],r.video_urls.push({url:url,quality:"Highest"}),r.base_url=t,r.thumbnail=og_search(e,"image"),r.title=og_search(e,"title")||e.title,r}function youtube(e,t){var r=document.getElementById("btn-mp3");r.style.display="block";var n={youtube:!0};n.base_url=t,e=parser.parseFromString(e,"text/html"),re=new RegExp(/ytplayer.config\s=\s(.*?)(?=;ytplayer.)/,"m");try{var o=re.exec(e.body.innerHTML)[1];js=JSON.parse(o)}catch(e){document.getElementById("errs").innerHTML="An Unknown Error occured",document.getElementById("errs").style.color="red",console.log(e),window.location="//dl-py.herokuapp.com/video?url="+encodeURIComponent(t),alert("Age Restricted Video Detected.using python parser")}o="https://www.youtube.com"+js.assets.js;var a="https://i.ytimg.com/vi/"+js.args.video_id+"/hqdefault.jpg"||js.args.thumbnail_url;if(n.title=js.args.title,n.basejs=o,n.thumbnail=a,n.video_urls=[],urls=js.args.url_encoded_fmt_stream_map.split(","),audio_urls=js.args.adaptive_fmts,n.ytaudio=!0,void 0==audio_urls)r.innerHTML="No audio url found for this video",n.ytaudio=!1;else{for(audio_urls=audio_urls.split(","),r.innerHTML="Click here for mp3 version of this video",r=0;r<audio_urls.length;r++)if(qs=parseqs(audio_urls[r]),-1<qs.url.indexOf("audio")){audio_url=decodeURIComponent(qs.url);var i=qs.s}n.audio_url=[],n.audio_url.push({url:audio_url,sig_:i})}if(null==parseqs(urls[0]).s){for(r=0;r<urls.length;r++)qs=parseqs(urls[r]),-1<qs.url.indexOf("ratebypass")&&n.video_urls.push({url:decodeURIComponent(qs.url),quality:qs.quality});return n}console.log("Fetch Signature Functions"),youtube_signatures(urls,n,n.basejs)}function youtube_signatures(e,t,r){var n=new XMLHttpRequest;console.log(t),n.open("GET","/youtube/js/?url="+encodeURIComponent(r),!0),n.onload=function(){if(200===n.status){ret=JSON.parse(n.response);var o=document.createTextNode(ret.sig_js),a=ret.funcname,i=document.createElement("script");for(i.appendChild(o),document.body.appendChild(i),o=0;o<e.length;o++)qs=parseqs(e[o]),-1<qs.url.indexOf("ratebypass")&&(sig=qs.s,console.log(sig),new_sig=window[a](sig),r=decodeURIComponent(qs.url)+"&signature="+new_sig,t.video_urls.push({url:r,quality:qs.quality}));sig=window[a](t.audio_url[0].sig_),console.log(sig),t.audio_url[0].url+="&signature="+sig,start_create_video(t)}},n.send()}function offer_proxy(){for(var e=document.getElementsByClassName("proxy_403"),t=0;t<e.length;t++)e[t].style.display="block"}function get_videos(e){var t=new Request("/videos/fetch/",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"url="+encodeURIComponent(e)});fetch(t).then(function(e){return e.json()}).then(function(t){if(t.hasOwnProperty("error"))document.getElementById("errs").innerHTML=t.error;else if(t.hasOwnProperty("redirect"))document.getElementById("errs").innerHTML="Redirecting to server extractor",window.location=t.redirect;else{page=t.html,funcname=t.funcname,e=t.landing_url;try{data=window[funcname](page,e)}catch(e){throw document.getElementById("errs").innerHTML="An Unknown Error Occured",e}console.log(data),"undefined"!=typeof data&&start_create_video(data)}})}function parseqs(e){var t={};e="?"==e[0]?e.substring(1):e,e=(e=decodeURI(e)).split("&");for(var r=0;r<e.length;r++){var n=e[r].split("=");t[n[0]]=n[1]}return t}function create_video(e){var t=document.getElementById("videos");if(e.image__)document.body.innerHTML="<img src="+e.image__+">",(t=document.createElement("div")).innerHTML=e.title,document.body.appendChild(t);else{for(e.youtube&&e.ytaudio&&(document.getElementById("btn-mp3url").href="/mp3extract/?mp3u="+encodeURIComponent(e.audio_url[0].url)),json_data=e,document.title=json_data.title,document.getElementById("title").innerHTML=json_data.title,0==json_data.video_urls.length&&(document.getElementById("errs").innerHTML="No Playable Video Found..please Check if the video exists"),e=0;e<json_data.video_urls.length;e++){var r=document.createElement("div");r.innerText=decodehtml(json_data.title);var n=document.createElement("div");n.innerText="Quality:"+json_data.video_urls[e].quality,r.style.fontWeight="bold",r.style.marginTop="10px",r.appendChild(n),n=document.createElement("video");var o=document.createElement("source"),a=decodehtml(json_data.video_urls[e].url);o.src=a,o.type="video/mp4",o.onerror=function(){offer_proxy()},n.poster=json_data.thumbnail,n.controls="True",n.height="225",n.width="400",n.setAttribute("class","vid"),n.preload="none",n.appendChild(o),o=document.createElement("div");var i=document.createElement("a");i.href=a;var l=document.createElement("button");l.setAttribute("class","proxy_403"),l.style.display="none",l.innerHTML="View this video",l.onclick=function(){window.location="/fetch_url/?u="+encodeURIComponent(a)+"&referer="+encodeURIComponent(json_data.base_url)},i.innerText="Direct Link to Video File",o.appendChild(i),t.appendChild(n),t.appendChild(l),t.appendChild(r),t.appendChild(document.createElement("br")),t.appendChild(o)}hpg=document.createElement("a"),hpg.href="/",hpg.innerHTML="Homepage",(e=document.createElement("div")).appendChild(hpg),t.appendChild(e),document.getElementById("skelly").style.display="none",document.getElementById("dlfail").style.display="block"}}function start_create_video(e){try{create_video(e)}catch(e){document.getElementById("errs").innerHTML="An Unknown Error occured",document.getElementById("errs").style.color="red",console.log(e)}}