var parser = new DOMParser();
/*modified 
http://matthewfl.com/js/unPacker.js */
function unpack(code) {
    var env = {
        eval: function (c) {
            code = c;
        },
        window: {},
        document: {}
    };
    eval("with(env) {" + code + "}");
    code = (code + "").replace(/;/g, ";\n").replace(/{/g, "\n{\n").replace(/}/g, "\n}\n").replace(/\n;\n/g, ";\n").replace(/\n\n/g, "\n");
    return code;

}

function og_search(page, what) {
    var resp = page.querySelector("meta[property='og:" + what + "']") || page.querySelector("meta[name='og:" + what + "']") || page.querySelector("meta[itemprop='og:" + what + "']");
    if (resp) {
        return resp.getAttribute("content");
    }
    return resp;
}


function decodehtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function get_yt_id(url) {
    url = new URL(url);
    if (url.search.length == 0) {
        return url.pathname.substring(1);
    } else {
        return parseqs(url.search).v;
    }
}

function vidzi(page, base_url) {
    var data = {};
    data.base_url = base_url;
    data.video_urls = [];
    data.thumbnail = 'http://null';
    funcre = /eval\(function\(p[\s\S]*?\)\)\)/;
    page = parser.parseFromString(page, 'text/html');
    evald = unpack(funcre.exec(page.body.innerHTML)[0]);
    data.title = page.title;
    mp4re = /file:"(http.*?mp4)"/;
    url = mp4re.exec(evald)[1];
    data.video_urls.push({
        "url": url,
        "quality": "highest"
    });
    return data;
}

function megadrive(page, base_url) {
    var data = {};
    data.base_url = base_url;
    page = parser.parseFromString(page, 'text/html');
    data.title = og_search(page, 'title');
    data.thumbnail = og_search(page, 'image');
    reg = /mp4:["']([\s\S]*?)['"],/;
    data.video_urls = [];
    data.video_urls.push({
        "url": reg.exec(page.body.innerHTML),
        "quality": "Default"
    });
    return data;
}

function openload(_page, base_url) {
    console.log('Openload')
    var sandbox = {
        window: {
            location: function (e) {
                return
            }
        },
        location: function (e) {
            return
        }

    }
    page = parser.parseFromString(_page, 'text/html');
    var div = document.createElement('div');
    div.id = 'OpenloadID';
    div.style.display = 'none';
    div.innerHTML = page.body.innerHTML;
    with(sandbox) {
        document.body.appendChild(div);
        document.body.style.backgroundColor = '#fff';
        var p = document.getElementById('DtsBlkVFQx') || [...document.querySelectorAll("p")]
            .filter(a => a.textContent.includes("640K"))[0] || document.getElementsByTagName("p")[1]
        //document.body.style.visibility = 'hidden';
        var scripts = page.scripts;
        eval(scripts[scripts.length - 1].innerHTML)
    }
    var url = p;
    var final_reg = new RegExp(/>[\s\S]([\w-]+~\d{10,}~\d+\.\d+\.0\.0~[\w-]+)[\s\S]</);
    var bruh = document.getElementById('openload-why');
    bruh.style.display = 'block';
    bruh.onclick = function () {
        data = {};
        data.base_url = base_url;
        if (url) {
            data.video_urls = [{
                "url": "https://openload.co/stream/" + url.innerHTML + '?mime=true',
                "quality": "Default"
            }];
        } else {
            console.warn("Using Regex..")
            url = final_reg.exec(div.innerHTML).replace("<", '').replace(">", '');
            data.video_urls = [{
                "url": "https://openload.co/stream/" + url + '?mime=true',
                "quality": "Default"
            }];
            document.body.removeChild(div);
        }
        data.title = 'Video';
        data.thumbnail = document.getElementsByTagName('video')[0].poster;
        console.log(data)
        start_create_video(data);
    }
    return undefined


}

function get_data() {
    try {
        document.body.click();
        document.getElementsByTagName("div")[0].click();
        console.log(document.getElementById('DtsBlkVFQx').innerHTML)
        return document.getElementById('DtsBlkVFQx').innerHTML
    } catch (e) {
        console.log(e)
        setTimeout(60, function () {
            get_data()
        })
    }
}


function instagram(page, base_url) {
    var data = {};
    data.base_url = base_url;
    data.video_urls = [];
    page = parser.parseFromString(page, 'text/html');
    data.title = page.title;
    data.thumbnail = og_search(page, 'image');
    video = page.querySelector("meta[property='og:video']");
    if (video == null) {
        data.image__ = data.thumbnail;
        return data;
    } else {
        data.video_urls.push({
            "url": video.getAttribute("content"),
            "quality": "default"
        });
    }
    return data;
}

function streamango(page, base_url) {
    var re = new RegExp(/eval\(function\(p[\s\S]*?var\s*?srces=[\s\S]*?}\);/);
    var data = {};
    data.video_urls = [];
    page = parser.parseFromString(page, 'text/html');
    script_ = re.exec(page.body.innerHTML)[0];
    eval(script_);
    data.title = og_search(page, 'title');
    data.thumbnail = og_search(page, 'image');
    data.base_url = base_url;
    for (var t in srces) {
        ret = srces[t];
        url = ret.src;
        if (url.indexOf("http") == -1) {
            url = "https:" + url;
        }
        q = ret.height;
        data.video_urls.push({
            "url": url,
            "quality": q
        });
    }
    return data;
}

function rapidvideo(page, base_url) {
    return estream(page, base_url);
}

function watcheng(page, base_url) {
    var data = {};
    data.video_urls = [];
    page = parser.parseFromString(page, 'text/html');
    data.title = page.title;
    data.thumbnail = page.getElementsByTagName("video")[0].getAttribute("poster");
    data.base_url = base_url;
    sources = page.getElementsByTagName("source")[0];
    data.video_urls.push({
        "url": sources.src,
        "quality": "default"
    });
    return data;
}

function estream(page, base_url) {
    var data = {};
    data.video_urls = [];
    page = parser.parseFromString(page, 'text/html');
    data.title = page.title;
    thumbnail = og_search(page, "image");
    data.thumbnail = thumbnail || "//null";
    data.base_url = base_url;
    sources = page.getElementsByTagName("source");
    for (var i = 0; i < sources.length; i++) {
        el = sources[i];
        if (el.getAttribute("src").indexOf("m3u8") == -1) {
            data.video_urls.push({
                "url": el.getAttribute("src"),
                "quality": el.getAttribute("res") || el.getAttribute("label") || el.getAttribute("data-res")
            });
        }
    }
    return data;

}

function yourupload(page, base_url) {
    var data = {};
    data.video_urls = [];

    page = parser.parseFromString(page, 'text/html');
    re = /file:\s'(.*?mp4)(?=\',)/;
    url = re.exec(page.body.innerHTML)[1];
    data.video_urls.push({
        "url": url,
        "quality": "Highest"
    });
    data.base_url = base_url;
    data.thumbnail = og_search(page, 'image');
    data.title = og_search(page, 'title') || page.title;
    return data;
}

function youtube(page, url) {
    var mp3_ = document.getElementById("btn-mp3");
    mp3_.style.display = 'block';
    var data = {};
    data.youtube = true;
    data.base_url = url;
    page = parser.parseFromString(page, 'text/html');
    re = new RegExp(/ytplayer.config\s=\s(.*?)(?=;ytplayer.)/, 'm');
    try {
        var tmp = re.exec(page.body.innerHTML)[1];
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
    var basejs = "https://www.youtube.com" + js.assets.js;
    var thumbnail = "https://i.ytimg.com/vi/" + js.args.video_id + "/hqdefault.jpg" || js.args.thumbnail_url;
    data.title = title;
    data.basejs = basejs;
    data.thumbnail = thumbnail;
    data.video_urls = [];
    urls = js.args.url_encoded_fmt_stream_map.split(",");
    audio_urls = js.args.adaptive_fmts;
    var highest = 0;
    data.ytaudio = true;
    if (audio_urls == undefined) {
        mp3_.innerHTML = "No audio url found for this video";
        data.ytaudio = false;
    } else {
        audio_urls = audio_urls.split(",");
        var signature_audio;
        mp3_.innerHTML = "Click here for mp3 version of this video";
        for (var i = 0; i < audio_urls.length; i++) {
            qs = parseqs(audio_urls[i]);
            if (qs.url.indexOf("audio") > -1) {
                if (qs.bitrate > highest);
                highest = qs.bitrate;
                audio_url = decodeURIComponent(qs.url);
                signature_audio = qs.s;
            }
        }
        data.audio_url = [];
        data.audio_url.push({
            "url": audio_url,
            "sig_": signature_audio
        });
    }
    if (parseqs(urls[0]).s != null) {
        console.log("Fetch Signature Functions");
        youtube_signatures(urls, data, data.basejs);
        return undefined;
    } else {
        for (var i = 0; i < urls.length; i++) {
            qs = parseqs(urls[i]);
            if (qs.url.indexOf("ratebypass") > -1) {
                data.video_urls.push({
                    "url": decodeURIComponent(qs.url),
                    "quality": qs.quality
                });
            }
        }
        return data;
    }

}

function youtube_signatures(urls, data, url) {
    var xhr = new XMLHttpRequest();
    console.log(data);
    xhr.open('GET', "/youtube/js/?url=" + encodeURIComponent(url), true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            ret = JSON.parse(xhr.response);
            var sig_js = document.createTextNode(ret.sig_js);
            var func_name = ret.funcname;
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
                    data.video_urls.push({
                        "url": url,
                        "quality": qs.quality
                    });
                }
            }
            sig = window[func_name](data.audio_url[0].sig_);
            console.log(sig);
            data.audio_url[0].url += "&signature=" + sig;
            start_create_video(data);
        }
    };
    xhr.send();
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
            if (res.hasOwnProperty("error")) {
                document.getElementById("errs").innerHTML = res.error;
                return undefined;
            }
            if (res.hasOwnProperty("redirect")) {
                document.getElementById("errs").innerHTML = "Redirecting to server extractor";
                window.location = res.redirect;
                return;
            }
            page = res.html;
            funcname = res.funcname;
            url = res.landing_url;
            try {
                data = window[funcname](page, url);
            } catch (e) {
                console.error(e);
                document.getElementById("errs").innerHTML = "An Unknown Error Occured";
                throw (e);
            }
            console.log(data);
            if (typeof data != 'undefined') {
                /* to prevent errors with async youtube signature decryption 
                for other websites.it shouldn't matter */
                start_create_video(data);
            }
        });
}

function parseqs(query) {
    var params = {};
    query = ((query[0] == '?') ? query.substring(1) : query);
    query = decodeURI(query);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        params[pair[0]] = pair[1];
    }
    return params;
}

function create_video(data) {
    var div_ = document.getElementById("videos");
    if (data.image__) {
        document.body.innerHTML = "<img src=" + data.image__ + ">";
        var b = document.createElement("div");
        b.innerHTML = data.title;
        document.body.appendChild(b);
        return undefined;
    }
    if (data.youtube && data.ytaudio) {
        document.getElementById("btn-mp3url").href = "/mp3extract/?mp3u=" + encodeURIComponent(data.audio_url[0].url);
    }
    json_data = data;
    document.title = json_data.title;
    document.getElementById("title").innerHTML = json_data.title;
    if (json_data.video_urls.length == 0) {
        document.getElementById("errs").innerHTML = "No Playable Video Found..please Check if the video exists";
    }
    for (var i = 0; i < json_data.video_urls.length; i++) {
        var h3 = document.createElement("div");
        h3.innerText = decodehtml(json_data.title);
        var h5 = document.createElement("div");
        h5.innerText = "Quality:" + json_data.video_urls[i].quality;
        h3.style.fontWeight = "bold";
        h3.style.marginTop = "10px";
        h3.appendChild(h5);
        var v = document.createElement("video");
        var source = document.createElement("source");
        var url = decodehtml(json_data.video_urls[i].url);
        source.src = url;
        source.type = 'video/mp4';
        source.onerror = function () {
            offer_proxy();
        };
        v.poster = json_data.thumbnail;
        v.controls = 'True';
        v.height = '225';
        v.width = '400';
        v.setAttribute("class", 'vid');
        v.preload = 'none';
        v.appendChild(source);
        var a1 = document.createElement("div");
        var a2 = document.createElement("a");
        a2.href = url;
        var proxy_ = document.createElement("button");
        proxy_.setAttribute("class", "proxy_403");
        proxy_.style.display = "none";
        proxy_.innerHTML = "View this video";
        proxy_.onclick = function () {
            window.location = "/fetch_url/?u=" + encodeURIComponent(url) + "&referer=" + encodeURIComponent(json_data.base_url);
        };
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
    hpg.innerHTML = "Homepage";
    var prnt = document.createElement("div");
    prnt.appendChild(hpg);
    div_.appendChild(prnt);
    document.getElementById("skelly").style.display = 'none';
    document.getElementById("dlfail").style.display = 'block';
}


function start_create_video(data) {
    try {
        create_video(data);
    } catch (e) {
        document.getElementById("errs").innerHTML = 'An Unknown Error occured';
        document.getElementById("errs").style.color = 'red';
        console.log(e);
    }
}