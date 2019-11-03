(() => {
  //assuming async function support..we can safely use arrow functions
  const Component = uiLib.Component;
  const render = uiLib.render;
  let h;
  const createElement = (h = uiLib.createElement);
  const Fragment = uiLib.Fragment;
  const videoMap = {};
  const domParser = new DOMParser();
  window.get_videos = async url => {
    const App = h("div", null, h(VideoRenderer, { url }));
    const main = document.querySelector("main");
    main.innerHTML = "";
    render(App, main);
  };
  class VideoRenderer extends Component {
    constructor(props) {
      super(props);
      this.state = {
        hasError: false,
        hasResponse: false,
        videoHasError: false
      };
      this.videoProxy = () => this.setState({ videoHasError: true });
    }
    async componentDidMount() {
      try {
        const url = this.props.url;
        const req = new Request(
          new URL("/videos/fetch/", location.href).toString(),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `url=${encodeURIComponent(url)}`
          }
        );
        const resp = await fetch(req);
        const json = await resp.json();
        if (json.error) return this.setState({ hasError: json.error });
        const page = json.html;
        const funcname = json.funcname;
        const final_url = json.landing_url;
        // this.setState({ page: page, funcname: funcname, url: url });
        const fn = videoMap[funcname];
        const data = await fn(page, final_url);
        if (data.error) this.setState(data);
        this.setState({ data, hasResponse: true, hasError: false });
      } catch (e) {
        console.log(e);
        this.setState({ hasError: "Unknown Error" });
      }
    }

    render(_, state) {
      if (state.hasError) {
        return h("div", null, state.hasError, h(ReloadButton));
      }
      if (!state.hasResponse) return h(LoadingScreen);
      const data = state.data;
      if (data.image__) {
        return h(
          "div",
          null,
          data.title,
          h("div", null, h("img", { src: data.image__ }))
        );
      }
      const title = data.title || "Unknown Title";
      document.title = title;
      if (data.videoURLS.length === 0) {
        return h("div", null, "No Playable Sources Found");
      }
      return h(
        "div",
        null,
        h("div", { class: "title" }, decodehtml(title)),
        h(
          "button",
          {
            class: "offer-proxy",
            onClick: this.videoProxy
          },
          "Use Proxy"
        ),
        data.videoURLS.map(x =>
          h(
            "div",
            { class: "video-box" },
            h("video", {
              src: x.url,
              onError: this.videoProxy,
              controls: true,
              poster: data.thumbnail,
              style: { width: "400px", height: "225px" }
            }),
            h("div", null, x.quality),
            h(
              "a",
              { href: x.url, style: { display: "block" } },
              "Direct Link to Video"
            ),
            state.videoHasError &&
              h(
                "a",
                {
                  class: "proxy-dl",
                  href: `/fetch_url/?u=${encodeURIComponent(
                    x.url
                  )}&referer=${encodeURIComponent(data.baseURL)}`
                },
                "Download"
              )
          )
        )
      );
    }
  }
  function ReloadButton() {
    return h(
      "button",
      {
        class: "reload-button",
        onClick: () => location.reload()
      },
      "Reload"
    );
  }
  const env = {
    window: {},
    document: {},
    navigator: {}
  };
  const unpackEnv = Object.assign({}, env);

  const unpack = function unpack(code) {
    unpackEnv.eval = function _eval(c) {
      code = c;
    };
    eval(`with(unpackEnv) {${code}}`);
    code = `${code}`;
    return code;
  };
  const attemptSafeEval = function attemptSafeEval(str) {
    const ret = null;
    const ev = `ret = ${str}`;
    return eval(ev);
  };

  function og_search(page, what) {
    const resp =
      page.querySelector(`meta[property='og:${what}']`) ||
      page.querySelector(`meta[name='og:${what}']`) ||
      page.querySelector(`meta[itemprop='og:${what}']`);
    if (resp) {
      return resp.getAttribute("content");
    }
    return resp;
  }

  const txt = document.createElement("textarea");
  function decodehtml(html) {
    txt.innerHTML = html;
    return txt.value;
  }
  function parseqs(query) {
    const params = {};
    query = query[0] == "?" ? query.substring(1) : query;
    query = decodeURI(query);
    const vars = query.split("&");

    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split("=");
      params[pair[0]] = decodeURIComponent(pair[1]);
    }
    return params;
  }

  function tunestream(page, baseURL) {
    const fileRe = /\[{file.*?\]/;
    const x = fileRe.exec(page)[0];
    const urls = attemptSafeEval(x)
      .filter(d => {
        return !d.file.endsWith("m3u8");
      })
      .map(x => {
        return {
          url: x.file,
          quality: x.label || "unknown"
        };
      });
    const data = {
      videoURLS: urls,
      thumbnail: "",
      baseURL
    };
    return data;
  }
  function vidzi(page, baseURL) {
    const data = { baseURL, thumbnail: "http://null" },
      funcre = /eval\(function\(p[\s\S]*?\)\)\)/,
      mp4re = /file:"(http.*?mp4)"/;

    data.videoURLS = [];
    const parsed = domParser.parseFromString(page, "text/html");
    data.title = parsed.title;
    const evald = unpack(funcre.exec(parsed.body.innerHTML)[0]);
    const url = mp4re.exec(evald)[1];
    data.videoURLS.push({
      url,
      quality: "highest"
    });
    return data;
  }

  function keeload(page, baseURL) {
    const re = /(eval\(func[\s\S]*?)<\/script/;
    const parsed = domParser.parseFromString(page, "text/html");
    let script_ = re.exec(parsed);

    if (script_) {
      script_ = script_[1];
    } else {
      script_ = parsed.scripts[parsed.scripts.length - 1].innerHTML;
    }

    const code = unpack(script_),
      reg = /title:["'](.*?)["'],/g,
      urlr = /file:["'](.*?)["'],/g,
      thumb = /image:["'](.*?)["'],/g;
    const title = reg.exec(code)[1],
      url = urlr.exec(code)[1],
      thumbnail = thumb.exec(code)[1];
    const data = {
      baseURL,
      title,
      videoURLS: [{ url }],
      thumbnail
    };
    return data;
  }
  function megadrive(page, baseURL) {
    const parsed = domParser.parseFromString(page, "text/html");
    const title = og_search(parsed, "title");
    const thumbnail = og_search(parsed, "image");
    const reg = /mp4:["']([\s\S]*?)['"],/;
    const videoURLS = [
      {
        url: reg.exec(parsed.body.innerHTML),
        quality: "Default"
      }
    ];
    const data = { title, thumbnail, baseURL, videoURLS };
    return data;
  }

  function openload(_page, baseURL) {
    return {};
    console.log("Openload");
    const sandbox = {
      window: {
        location: function location(e) {
          return;
        }
      },
      location: function location(e) {
        return;
      }
    };
    page = domParser.parseFromString(_page, "text/html");
    const div = document.createElement("div");
    div.id = "OpenloadID";
    div.style.display = "none";
    div.innerHTML = page.body.innerHTML;
    eval(
      "with(sandbox){document.body.appendChild(div);document.body.style.backgroundColor='#fff';var p=document.getElementById('lqEH1')||document.getElementById(\"DtsBlkVFQx\")||document.getElementsByTagName(\"span\")[0]\nvar scripts=page.scripts;eval(scripts[scripts.length-1].innerHTML)}"
    );
    let url = p;
    const final_reg = new RegExp(
      />[\s\S]([\w-]+~\d{10,}~\d+\.\d+\.0\.0~[\w-]+)[\s\S]</
    );
    const bruh = document.getElementById("openload-why");
    bruh.style.display = "block";

    bruh.onclick = () => {
      data = {};
      data.baseURL = baseURL;

      if (url) {
        data.videoURLS = [
          {
            url: `https://openload.co/stream/${url.innerHTML}?mime=true`,
            quality: "Default"
          }
        ];
      } else {
        console.warn("Using Regex..");
        url = final_reg
          .exec(div.innerHTML)
          .replace("<", "")
          .replace(">", "");
        data.videoURLS = [
          {
            url: `https://openload.co/stream/${url}?mime=true`,
            quality: "Default"
          }
        ];
        document.body.removeChild(div);
      }

      data.title = "Video";
      data.thumbnail = document.getElementsByTagName("video")[0].poster;
      console.log(data);
      start_create_video(data);
    };

    return undefined;
  }

  function instagram(page, baseURL) {
    const videoURLS = [];
    const parsed = domParser.parseFromString(page, "text/html");
    const video = parsed.querySelector("meta[property='og:video']");
    const title = parsed.title;
    const thumbnail = og_search(parsed, "image");
    const data = { baseURL, videoURLS, thumbnail, title };
    if (video == null) {
      data.image__ = data.thumbnail;
      return data;
    } else {
      data.videoURLS.push({
        url: video.getAttribute("content"),
        quality: "default"
      });
    }

    return data;
  }

  function streamango(page, baseURL) {
    return {};
    const re = new RegExp(/eval\(function\(p[\s\S]*?var\s*?srces=[\s\S]*?}\);/);
    const data = {};
    data.videoURLS = [];
    page = domParser.parseFromString(page, "text/html");
    script_ = re.exec(page.body.innerHTML)[0];
    eval(script_);
    data.title = og_search(page, "title");
    data.thumbnail = og_search(page, "image");
    data.baseURL = baseURL;

    for (const t in srces) {
      ret = srces[t];
      url = ret.src;

      if (!url.includes("http")) {
        url = `https:${url}`;
      }

      q = ret.height;
      data.videoURLS.push({
        url,
        quality: q
      });
    }

    return data;
  }

  function watcheng(page, baseURL) {
    const data = {};
    data.videoURLS = [];
    parsed = domParser.parseFromString(page, "text/html");
    data.title = parsed.title;
    data.thumbnail = parsed
      .getElementsByTagName("video")[0]
      .getAttribute("poster");
    data.baseURL = baseURL;
    const sources = parsed.getElementsByTagName("source")[0];
    data.videoURLS.push({
      url: sources.src,
      quality: "default"
    });
    return data;
  }
  function estream(page, baseURL) {
    const data = {};
    data.videoURLS = [];
    const parsed = domParser.parseFromString(page, "text/html");
    data.title = parsed.title;
    const thumbnail = og_search(parsed, "image");
    data.thumbnail = thumbnail || "//null";
    data.baseURL = baseURL;
    const sources = parsed.getElementsByTagName("source");
    for (let i = 0; i < sources.length; i++) {
      el = sources[i];

      if (!el.getAttribute("src").includes("m3u8")) {
        data.videoURLS.push({
          url: el.getAttribute("src"),
          quality:
            el.getAttribute("res") ||
            el.getAttribute("label") ||
            el.getAttribute("data-res")
        });
      }
    }

    return data;
  }

  function yourupload(page, baseURL) {
    const data = {};
    data.videoURLS = [];
    const parsed = domParser.parseFromString(page, "text/html");
    const re = /file:\s'(.*?mp4)(?=\',)/;
    const url = re.exec(parsed.body.innerHTML)[1];
    data.videoURLS.push({
      url,
      quality: "Highest"
    });
    data.baseURL = baseURL;
    data.thumbnail = og_search(parsed, "image");
    data.title = og_search(parsed, "title") || parsed.title;
    return data;
  }

  async function youtube(page, url) {
    const data = {};
    data.youtube = true;
    data.baseURL = url;
    const parsed = domParser.parseFromString(page, "text/html");
    const re = new RegExp(/ytplayer.config\s=\s(.*?)(?=;ytplayer.)/, "m");
    let js;
    try {
      const tmp = re.exec(parsed.body.innerHTML)[1];
      js = JSON.parse(tmp);
    } catch (e) {
      return { error: "unknown error" };
    }
    const title = js.args.title;
    const basejs = `https://www.youtube.com${js.assets.js}`;
    const thumbnail =
      `https://i.ytimg.com/vi/${js.args.video_id}/hqdefault.jpg` ||
      js.args.thumbnail_url;
    data.title = title;
    data.basejs = basejs;
    data.thumbnail = thumbnail;
    data.videoURLS = [];
    const urls = js.args.url_encoded_fmt_stream_map.split(",");

    if (parseqs(urls[0]).s != null) {
      console.log("Fetch Signature Functions");
      const sigs = await youtubeSignature(urls, data, data.basejs);
    } else {
      for (let i = 0; i < urls.length; i++) {
        qs = parseqs(urls[i]);
        if (qs.url.includes("ratebypass")) {
          data.videoURLS.push({
            url: decodeURIComponent(qs.url),
            quality: qs.quality
          });
        }
      }

      return data;
    }
  }
  async function youtubeSignature(urls, data, baseJS) {
    const url = `/youtube/js/?url=${encodeURIComponent(baseJS)}`;
    const resp = await fetch(url);
    const ret = await resp.json();
    const sigJS = document.createTextNode(ret.sig_js);
    const funcName = ret.funcname;
    const scrpt = document.createElement("script");
    scrpt.appendChild(sigJS);
    document.body.appendChild(scrpt);

    for (const url of urls) {
      qs = parseqs(url);
      if (qs.url.includes("ratebypass")) {
        const sig = qs.s;
        console.log(sig);
        const newSig = window[funcName](sig);
        const _url = `${decodeURIComponent(qs.url)}&signature=${newSig}`;
        data.videoURLS.push({
          url: _url,
          quality: qs.quality
        });
      }
    }
  }
  function LoadingScreen() {
    return "loading";
  }
  videoMap.tunestream = tunestream;
  videoMap.vidzi = vidzi;
  videoMap.keeload = keeload;
  videoMap.megadrive = megadrive;
  videoMap.openload = openload;
  videoMap.instagram = instagram;
  videoMap.streamango = streamango;
  videoMap.watcheng = watcheng;
  videoMap.estream = estream;
  videoMap.yourupload = yourupload;
  videoMap.youtube = youtube;
  videoMap.rapidvideo = estream;
})();
