const decodehtml=e=>{var t=document.createElement("textarea");return t.innerHTML=e,t.value};(async()=>{var e=decodehtml(document.title);if(0!=e.length){var t="Results for "+e;document.title=t}else document.title="Results from youtube.com"})();const search=()=>{var t="/search?q="+document.getElementById("search").value;window.location=e};document.getElementById("search").onkeyup=function(e){var t;13==e.keyCode&&(t="/search?q="+document.getElementById("search").value,window.location=t)};var get_data,extract_data,gen_results,b=document.getElementById("s-button");b.onmouseover=(()=>{b.style.boxShadow="3px 3px #d9dce0"}),b.onmouseout=(()=>{b.style.boxShadow="0px 0px #d9dce0"}),b.ontouchstart=(()=>{b.style.boxShadow="3px 3px #d9dce0"}),b.ontouchend=(()=>{b.style.boxShadow="0px 0px #d9dce0"}),function(){this.get_data=(e=>{var t=new Request("/search/fetch/",{method:"post",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"q="+encodeURIComponent(e)});fetch(t).then(e=>e.json()).then(e=>{extract_data(e)}).then(function(e){console.log(e)}).catch(function(e){var t=document.createElement("div");t.style.color="red",t.innerText=e,document.getElementById("youtubeprev").appendChild(t)})}),this.extract_data=(e=>{if(html=e.html,trending=e.trending,console.log(trending),regex=new RegExp(/ytInitialData\"]\s=\s({[\s\S]*?});/,"gm"),json_data={},json_data.data=[],videos=[],m=regex.exec(html),reg=JSON.parse(m[1]),trending){var t=reg.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents;for(dat in t){var n=t[dat].itemSectionRenderer.contents[0].shelfRenderer.content,a=n[Object.keys(n)[0]].items;videos.push(...a)}}else for(opts in contents=reg.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents,contents)null!=contents[opts].videoRenderer&&videos.push(contents[opts]);for(e in videos){var o=videos[e],r=Object.keys(o)[0],d=o[r].videoId,s="https://i.ytimg.com/vi/"+d+"/hqdefault.jpg",c=o[r].title.simpleText,l=o[r].shortBylineText.runs[0].text,i="//youtube.com"+o[r].shortBylineText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url;try{var u=o[r].richThumbnail.movingThumbnailRenderer.movingThumbnailDetails.thumbnails[0].url}catch(e){u=null}var h="/video?url="+encodeURIComponent("https://youtu.be/"+d);json_data.data.push({url:h,thumb:s,title:c,channel:l,channel_url:i,preview:u})}gen_results(json_data)}),this.gen_results=(e=>{document.getElementById("skelly").style.display="none",document.getElementById("content").style.display="block";for(var t=0;t<e.data.length;t++){var n=document.createElement("a"),a=document.createElement("img");a.setAttribute("class","rounded-image"),a.src=e.data[t].thumb;var o=e.data[t].title,r=e.data[t].url,d=e.data[t].channel,s=e.data[t].channel_url;a.setAttribute("data-motion",e.data[t].preview),a.setAttribute("data-img",e.data[t].thumb),a.setAttribute("alt","No Preview available or your browser does not support webp images"),a.style.display="inline-block",n.href=r,n.appendChild(a),n.appendChild(document.createElement("br"));var c=document.createElement("b");c.innerHTML=o,n.appendChild(c);var l=document.createElement("a");l.href=s,l.innerHTML=d,a.onmouseover=(e=>{e.target.src=e.target.getAttribute("data-motion")}),a.onmouseout=(e=>{e.target.src=e.target.getAttribute("data-img")}),a.ontouchstart=(e=>{e.target.src=e.target.getAttribute("data-motion")}),a.ontouchend=(e=>{e.target.src=e.target.getAttribute("data-img")});var i=document.createElement("div");i.innerHTML="Video By:",i.appendChild(l),i.appendChild(document.createElement("br")),i.appendChild(document.createElement("br")),document.getElementById("content").appendChild(n),document.getElementById("content").appendChild(i)}return"Created Results"})}.call(this);