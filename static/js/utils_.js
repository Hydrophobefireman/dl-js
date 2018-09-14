function _toConsumableArray(d) {
    if (Array.isArray(d)) {
        for (var f = 0, g = Array(d.length); f < d.length; f++) g[f] = d[f];
        return g
    }
    return Array.from(d)
}
var vidzi, megadrive, openload, instagram, streamango, watcheng, estream, yourupload, youtube, youtube_signatures, offer_proxy, get_videos, create_video, start_create_video, DOMParser, parser, unpack, og_search, parseqs, decodehtml;
(function () {
    var _$0 = this;
    _$0.vidzi = function _F(d, f) {
        var g = {};
        return g.base_url = f, g.video_urls = [], g.thumbnail = 'http://null', funcre = /eval\(function\(p[\s\S]*?\)\)\)/, d = parser.parseFromString(d, 'text/html'), evald = unpack(funcre.exec(d.body.innerHTML)[0]), g.title = d.title, mp4re = /file:"(http.*?mp4)"/, url = mp4re.exec(evald)[1], g.video_urls.push({
            url: url,
            quality: 'highest'
        }), g
    }, _$0.megadrive = function _G(d, f) {
        var g = {};
        return g.base_url = f, d = parser.parseFromString(d, 'text/html'), g.title = og_search(d, 'title'), g.thumbnail = og_search(d, 'image'), reg = /mp4:["']([\s\S]*?)['"],/, g.video_urls = [], g.video_urls.push({
            url: reg.exec(d.body.innerHTML),
            quality: 'Default'
        }), g
    }, _$0.openload = function _H(_page, base_url) {
        console.log('Openload');
        page = parser.parseFromString(_page, 'text/html');
        var div = document.createElement('div');
        div.id = 'OpenloadID', div.style.display = 'none', div.innerHTML = page.body.innerHTML;
        with({
            window: {
                location: function location() {}
            },
            location: function location() {}
        }) {
            document.body.appendChild(div), document.body.style.backgroundColor = '#fff';
            var p = document.getElementById('DtsBlkVFQx') || [].concat(_toConsumableArray(document.querySelectorAll('p'))).filter(function (d) {
                    return d.textContent.includes('640K')
                })[0] || document.getElementsByTagName('p')[1],
                scripts = page.scripts;
            eval(scripts[scripts.length - 1].innerHTML)
        }
        var url = p,
            final_reg = new RegExp(/>[\s\S]([\w-]+~\d{10,}~\d+\.\d+\.0\.0~[\w-]+)[\s\S]</),
            bruh = document.getElementById('openload-why');
        return bruh.style.display = 'block', bruh.onclick = function () {
            data = {}, data.base_url = base_url, url ? data.video_urls = [{
                url: 'https://openload.co/stream/' + url.innerHTML + '?mime=true',
                quality: 'Default'
            }] : (console.warn('Using Regex..'), url = final_reg.exec(div.innerHTML).replace('<', '').replace('>', ''), data.video_urls = [{
                url: 'https://openload.co/stream/' + url + '?mime=true',
                quality: 'Default'
            }], document.body.removeChild(div)), data.title = 'Video', data.thumbnail = document.getElementsByTagName('video')[0].poster, console.log(data), start_create_video(data)
        }, void 0
    }, _$0.instagram = function _I(d, f) {
        var g = {};
        return (g.base_url = f, g.video_urls = [], d = parser.parseFromString(d, 'text/html'), g.title = d.title, g.thumbnail = og_search(d, 'image'), video = d.querySelector('meta[property=\'og:video\']'), null == video) ? (g.image__ = g.thumbnail, g) : (g.video_urls.push({
            url: video.getAttribute('content'),
            quality: 'default'
        }), g)
    }, _$0.streamango = function _J(page, base_url) {
        var re = new RegExp(/eval\(function\(p[\s\S]*?var\s*?srces=[\s\S]*?}\);/),
            data = {};
        for (var t in data.video_urls = [], page = parser.parseFromString(page, 'text/html'), script_ = re.exec(page.body.innerHTML)[0], eval(script_), data.title = og_search(page, 'title'), data.thumbnail = og_search(page, 'image'), data.base_url = base_url, srces) ret = srces[t], url = ret.src, url.includes('http') || (url = 'https:' + url), q = ret.height, data.video_urls.push({
            url: url,
            quality: q
        });
        return data
    }, _$0.watcheng = function _K(d, f) {
        var g = {};
        return g.video_urls = [], d = parser.parseFromString(d, 'text/html'), g.title = d.title, g.thumbnail = d.getElementsByTagName('video')[0].getAttribute('poster'), g.base_url = f, sources = d.getElementsByTagName('source')[0], g.video_urls.push({
            url: sources.src,
            quality: 'default'
        }), g
    }, _$0.estream = function _L(d, f) {
        var g = {};
        g.video_urls = [], d = parser.parseFromString(d, 'text/html'), g.title = d.title, thumbnail = og_search(d, 'image'), g.thumbnail = thumbnail || '//null', g.base_url = f, sources = d.getElementsByTagName('source');
        for (var h = 0; h < sources.length; h++) el = sources[h], el.getAttribute('src').includes('m3u8') || g.video_urls.push({
            url: el.getAttribute('src'),
            quality: el.getAttribute('res') || el.getAttribute('label') || el.getAttribute('data-res')
        });
        return g
    }, _$0.yourupload = function _M(d, f) {
        var g = {};
        return g.video_urls = [], d = parser.parseFromString(d, 'text/html'), re = /file:\s'(.*?mp4)(?=\',)/, url = re.exec(d.body.innerHTML)[1], g.video_urls.push({
            url: url,
            quality: 'Highest'
        }), g.base_url = f, g.thumbnail = og_search(d, 'image'), g.title = og_search(d, 'title') || d.title, g
    }, _$0.youtube = function _N(d, f) {
        var g = document.getElementById('btn-mp3');
        g.style.display = 'block';
        var h = {};
        h.youtube = !0, h.base_url = f, d = parser.parseFromString(d, 'text/html'), re = new RegExp(/ytplayer.config\s=\s(.*?)(?=;ytplayer.)/, 'm');
        try {
            var j = re.exec(d.body.innerHTML)[1];
            js = JSON.parse(j)
        } catch (s) {
            document.getElementById('errs').innerHTML = 'An Unknown Error occured', document.getElementById('errs').style.color = 'red', console.log(s), window.location = '//dl-py.herokuapp.com/video?url=' + encodeURIComponent(f), alert('Age Restricted Video Detected.using python parser')
        }
        var k = js.args.title,
            l = 'https://www.youtube.com' + js.assets.js,
            m = 'https://i.ytimg.com/vi/' + js.args.video_id + '/hqdefault.jpg' || js.args.thumbnail_url;
        h.title = k, h.basejs = l, h.thumbnail = m, h.video_urls = [], urls = js.args.url_encoded_fmt_stream_map.split(','), audio_urls = js.args.adaptive_fmts;
        var n = 0;
        if (h.ytaudio = !0, void 0 == audio_urls) g.innerHTML = 'No audio url found for this video', h.ytaudio = !1;
        else {
            audio_urls = audio_urls.split(',');
            var o;
            g.innerHTML = 'Click here for mp3 version of this video';
            for (var r = 0; r < audio_urls.length; r++)
                if (qs = parseqs(audio_urls[r]), -1 < qs.url.indexOf('audio')) {
                    if (qs.bitrate > n);
                    n = qs.bitrate, audio_url = decodeURIComponent(qs.url), o = qs.s
                } h.audio_url = [], h.audio_url.push({
                url: audio_url,
                sig_: o
            })
        }
        if (null != parseqs(urls[0]).s) return console.log('Fetch Signature Functions'), youtube_signatures(urls, h, h.basejs), void 0;
        for (var r = 0; r < urls.length; r++) qs = parseqs(urls[r]), -1 < qs.url.indexOf('ratebypass') && h.video_urls.push({
            url: decodeURIComponent(qs.url),
            quality: qs.quality
        });
        return h
    }, _$0.youtube_signatures = function _O(d, f, g) {
        var h = new XMLHttpRequest;
        console.log(f), h.open('GET', '/youtube/js/?url=' + encodeURIComponent(g), !0), h.onload = function () {
            if (200 === h.status) {
                ret = JSON.parse(h.response);
                var j = document.createTextNode(ret.sig_js),
                    k = ret.funcname,
                    l = document.createElement('script');
                l.appendChild(j), document.body.appendChild(l);
                for (var m = 0; m < d.length; m++) qs = parseqs(d[m]), -1 < qs.url.indexOf('ratebypass') && (sig = qs.s, console.log(sig), new_sig = window[k](sig), g = decodeURIComponent(qs.url) + '&signature=' + new_sig, f.video_urls.push({
                    url: g,
                    quality: qs.quality
                }));
                sig = window[k](f.audio_url[0].sig_), console.log(sig), f.audio_url[0].url += '&signature=' + sig, start_create_video(f)
            }
        }, h.send()
    }, _$0.offer_proxy = function _P() {
        for (var d = document.getElementsByClassName('proxy_403'), f = 0; f < d.length; f++) d[f].style.display = 'block'
    }, _$0.get_videos = function _Q(d) {
        var f = new Request('/videos/fetch/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'url=' + encodeURIComponent(d)
        });
        fetch(f).then(function (g) {
            return g.json()
        }).then(function (g) {
            if (g.hasOwnProperty('error')) return document.getElementById('errs').innerHTML = g.error, void 0;
            if (g.hasOwnProperty('redirect')) return document.getElementById('errs').innerHTML = 'Redirecting to server extractor', void(window.location = g.redirect);
            page = g.html, funcname = g.funcname, d = g.landing_url;
            try {
                data = window[funcname](page, d)
            } catch (h) {
                throw console.error(h), document.getElementById('errs').innerHTML = 'An Unknown Error Occured', h
            }
            console.log(data), 'undefined' != typeof data && start_create_video(data)
        })
    }, _$0.create_video = function _R(d) {
        var f = document.getElementById('videos');
        if (d.image__) {
            document.body.innerHTML = '<img src=' + d.image__ + '>';
            var g = document.createElement('div');
            return g.innerHTML = d.title, document.body.appendChild(g), void 0
        }
        d.youtube && d.ytaudio && (document.getElementById('btn-mp3url').href = '/mp3extract/?mp3u=' + encodeURIComponent(d.audio_url[0].url)), json_data = d, document.title = json_data.title, document.getElementById('title').innerHTML = json_data.title, 0 == json_data.video_urls.length && (document.getElementById('errs').innerHTML = 'No Playable Video Found..please Check if the video exists');
        for (var j, h = 0; h < json_data.video_urls.length; h++) {
            j = document.createElement('div'), j.innerText = decodehtml(json_data.title);
            var k = document.createElement('div');
            k.innerText = 'Quality:' + json_data.video_urls[h].quality, j.style.fontWeight = 'bold', j.style.marginTop = '10px', j.appendChild(k);
            var l = document.createElement('video'),
                m = document.createElement('source'),
                n = decodehtml(json_data.video_urls[h].url);
            m.src = n, m.type = 'video/mp4', m.onerror = function () {
                offer_proxy()
            }, l.poster = json_data.thumbnail, l.controls = 'True', l.height = '225', l.width = '400', l.setAttribute('class', 'vid'), l.preload = 'none', l.appendChild(m);
            var o = document.createElement('div'),
                r = document.createElement('a');
            r.href = n;
            var s = document.createElement('button');
            s.setAttribute('class', 'proxy_403'), s.style.display = 'none', s.innerHTML = 'View this video', s.onclick = function () {
                window.location = '/fetch_url/?u=' + encodeURIComponent(n) + '&referer=' + encodeURIComponent(json_data.base_url)
            }, r.innerText = 'Direct Link to Video File', o.appendChild(r), f.appendChild(l), f.appendChild(s), f.appendChild(j), f.appendChild(document.createElement('br')), f.appendChild(o)
        }
        hpg = document.createElement('a'), hpg.href = '/', hpg.innerHTML = 'Homepage';
        var u = document.createElement('div');
        u.appendChild(hpg), f.appendChild(u), document.getElementById('skelly').style.display = 'none', document.getElementById('dlfail').style.display = 'block'
    }, _$0.start_create_video = function _S(d) {
        try {
            create_video(d)
        } catch (f) {
            document.getElementById('errs').innerHTML = 'An Unknown Error occured', document.getElementById('errs').style.color = 'red', console.log(f)
        }
    }, parser = new DOMParser;
    unpack = function _W(code) {
        return eval('with(env) {' + code + '}'), code = ('' + code).replace(/;/g, ';\n').replace(/{/g, '\n{\n').replace(/}/g, '\n}\n').replace(/\n;\n/g, ';\n').replace(/\n\n/g, '\n'), code
    };
    og_search = function _X(d, f) {
        var g = d.querySelector('meta[property=\'og:' + f + '\']') || d.querySelector('meta[name=\'og:' + f + '\']') || d.querySelector('meta[itemprop=\'og:' + f + '\']');
        return g ? g.getAttribute('content') : g
    };
    parseqs = function _Y(d) {
        var f = {};
        d = '?' == d[0] ? d.substring(1) : d, d = decodeURI(d);
        for (var j, g = d.split('&'), h = 0; h < g.length; h++) j = g[h].split('='), f[j[0]] = decodeURIComponent(j[1]);
        return f
    };
    decodehtml = function _Z(d) {
        var f = document.createElement('textarea');
        return f.innerHTML = d, f.value
    }
}).call(void 0);