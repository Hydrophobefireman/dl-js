function decodehtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function get_yt_id(url) {
    var url = new URL(url);
    if (url.search.length == 0) {
        return url.pathname.substring(1)
    } else {
        return parseqs(url.search).v;
    }
}

function yourupload(page, base_url) {
    var data = {};
    data['video_urls'] = [];
    parser = new DOMParser();
    page = parser.parseFromString(page, 'text/html');
    re = /file:\s'(.*?mp4)(?=\',)/;
    url = re.exec(page.body.innerHTML)[1];
    data['video_urls'].push({ "url": url, "quality": "Highest" });
    data['base_url'] = base_url;
    data['thumbnail'] = page.querySelector("meta[property='og:image']").getAttribute("content");
    data['title'] = page.querySelector("meta[property='og:title']").getAttribute("content");
    return data;
}

function youtube(page, url) {
    var mp3_ = document.getElementById("btn-mp3");
    mp3_.style.display = 'block'
    var data = {};
    data['youtube'] = true;
    parser = new DOMParser();
    page = parser.parseFromString(page, 'text/html');
    re = new RegExp(/ytplayer.config\s=\s(.*?)(?=;ytplayer.)/, 'm');
    try {
        var tmp = re.exec(page.body.innerHTML)[1];
        console.log(tmp);
        js = JSON.parse(tmp);
    } catch (e) {
        document.getElementById("errs").innerHTML = 'An Unknown Error occured';
        document.getElementById("errs").style.color = 'red';
        console.log(e);
        window.location = '//dl-py.herokuapp.com/video?url=' + encodeURIComponent(url);
        //not gonna send a basejs,embed page and get_video_info file  to the user 
        alert("Age Restricted Video Detected.using python parser");
    }
    var title = js.args.title;
    var basejs = "https://www.youtube.com" + js["assets"]["js"];
    var thumbnail = "https://i.ytimg.com/vi/" + js.args.video_id + "/hqdefault.jpg" || js.args.thumbnail_url;
    data['base_url'] = url.href;
    data['title'] = title;
    data['basejs'] = basejs;
    data['thumbnail'] = thumbnail;
    data['video_urls'] = [];
    urls = js['args']['url_encoded_fmt_stream_map'].split(",");
    audio_urls = js["args"]["adaptive_fmts"];
    var highest = 0;
    if (audio_urls == undefined) {
        mp3_.innerHTML = "No audio url found for this video";
    } else {
        audio_urls = audio_urls.split(",");
        mp3_.innerHTML = "Click here for mp3 version of this video";
        for (var i = 0; i < audio_urls.length; i++) {
            qs = parseqs(audio_urls[i]);
            if (qs.url.indexOf("audio") > -1) {
                if (qs.bitrate > highest);
                highest = qs.bitrate;
                audio_url = decodeURIComponent(qs.url);
                var sig = qs.s;
            }
        }
        data['audio_url'] = [];
        data['audio_url'].push({ "url": audio_url, "sig_": sig });
    }
    if (parseqs(urls[0]).s != null) {
        console.log("Fetch Signature Functions");
        youtube_signatures(urls, data, data['basejs']);
        return null;
    } else {
        for (var i = 0; i < urls.length; i++) {
            qs = parseqs(urls[i]);
            if (qs.url.indexOf("ratebypass") > -1) {
                data['video_urls'].push({
                    "url": decodeURIComponent(qs.url),
                    "quality": qs.quality
                });
            };
        }
        return data
    }

}

function youtube_signatures(urls, data, url) {
    var xhr = new XMLHttpRequest();
    console.log(data)
    xhr.open('GET', "/youtube/js/?url=" + encodeURIComponent(url), true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            ret = JSON.parse(xhr.response);
            var sig_js = document.createTextNode(ret['sig_js']);
            var func_name = ret["funcname"];
            var scrpt = document.createElement("script");
            scrpt.appendChild(sig_js);
            document.body.appendChild(scrpt);
            for (var i = 0; i < urls.length; i++) {
                qs = parseqs(urls[i]);
                if (qs.url.indexOf("ratebypass") > -1) {
                    sig = qs.s;
                    console.log(sig);
                    new_sig = window[func_name](sig);
                    url = decodeURIComponent(qs.url) + "&signature=" + new_sig;
                    data['video_urls'].push({
                        "url": url,
                        "quality": qs.quality
                    });
                };
            }
            sig = window[func_name](data['audio_url'][0]['sig_']);
            console.log(sig)
            data['audio_url'][0]['url'] += "&signature=" + sig;
            create_video(data)
        }
    }
    xhr.send();
}

function create_video(data) {
    if (data.youtube) {
        document.getElementById("btn-mp3url").href = "/mp3extract/?mp3u=" + encodeURIComponent(data.audio_url[0]['url']);
    }
    json_data = data;
    for (var i = 0; i < json_data['video_urls'].length; i++) {
        var h3 = document.createElement("div");
        h3.innerText = decodehtml(json_data['title']);
        var h5 = document.createElement("div");
        h5.innerText = "Quality:" + json_data['video_urls'][i]['quality'];
        h3.style.fontWeight = "bold";
        h3.style.marginTop = "10px";
        h3.appendChild(h5);
        var v = document.createElement("video");
        var source = document.createElement("source");
        var url = decodehtml(json_data['video_urls'][i]['url'])
        source.src = url
        source.type = 'video/mp4';
        source.onerror = function() {
            offer_proxy();
        }
        v.poster = json_data['thumbnail'];
        if (json_data.hasOwnProperty("custom_posters")) {
            v.poster = json_data['video_urls'][i]['poster'];
        }
        v.controls = 'True';
        v.height = '225';
        v.width = '400';
        v.setAttribute("class", 'vid');
        v.preload = 'none';
        v.appendChild(source);
        var div_ = document.getElementById("videos");
        var a1 = document.createElement("div");
        var a2 = document.createElement("a");
        a2.href = url;
        var proxy_ = document.createElement("button");
        proxy_.setAttribute("class", "proxy_403");
        proxy_.style.display = "none";
        proxy_.innerHTML = "View this video";
        proxy_.onclick = function() {
            window.location = "/fetch_url/?u=" + encodeURIComponent(url) + "&referer=" + encodeURIComponent(json_data['base_url']);
        }
        a2.innerText = "Direct Link to Video File";
        a1.appendChild(a2);
        div_.appendChild(v);
        div_.appendChild(proxy_);
        div_.appendChild(h3);
        div_.appendChild(document.createElement("br"));
        div_.appendChild(a1);
    }
    hpg = document.createElement("a");
    hpg.href = "/";
    hpg.innerHTML = "Homepage"
    var prnt = document.createElement("div");
    prnt.appendChild(hpg);
    div_.appendChild(prnt);
    document.getElementById("skelly").style.display = 'none';
    document.getElementById("dlfail").style.display = 'block';
}

function offer_proxy() {
    var els_ = document.getElementsByClassName("proxy_403");
    for (var er = 0; er < els_.length; er++) {
        els_[er].style.display = "block";
    }
}

function get_videos(url) {
    var req = new Request("/videos/fetch/", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: "url=" + encodeURIComponent(url)
    });
    fetch(req)
        .then(ret => ret.json())
        .then(res => {
            page = res.html;
            funcname = res.funcname;
            try {
                data = window[funcname](page, url);
            } catch (e) {
                document.getElementById("errs").innerHTML = "An Unknown Error Occured"
            }
            console.log(data);
            if (typeof data != 'undefined') {
                /* to prevent errors with async youtube signature decryption 
                for other websites.it shouldn't matter */
                create_video(data);
            }
        })
}

function parseqs(query) {
    var params = {};
    query = ((query[0] == '?') ? query.substring(1) : query);
    query = decodeURI(query);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        params[pair[0]] = pair[1]
    }
    return params;
}