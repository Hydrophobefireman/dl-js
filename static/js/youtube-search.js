function _toConsumableArray(c) {
  if (Array.isArray(c)) {
    for (var d = 0, f = Array(c.length); d < c.length; d++) f[d] = c[d];
    return f;
  }
  return Array.from(c);
}

function decodehtml(c) {
  var d = document.createElement("textarea");
  return (d.innerHTML = c), d.value;
}
var doctitle = decodehtml(decodehtml(document.title));
if (0 != doctitle.length) {
  var titles = "Results for " + doctitle;
  document.title = titles;
} else document.title = "Results from youtube.com";

function search() {
  var d = "/search?q=" + document.getElementById("search").value;
  window.location = d;
}
document.getElementById("search").onkeyup = function(c) {
  13 == c.keyCode && search();
};
var b = document.getElementById("s-button"),
  get_data,
  extract_data,
  gen_results;
(b.onmouseover = function() {
  b.style.boxShadow = "3px 3px #d9dce0";
}),
  (b.onmouseout = function() {
    b.style.boxShadow = "0px 0px #d9dce0";
  }),
  (b.ontouchstart = function() {
    b.style.boxShadow = "3px 3px #d9dce0";
  }),
  (b.ontouchend = function() {
    b.style.boxShadow = "0px 0px #d9dce0";
  }),
  function() {
    var c = this;
    (c.get_data = function d(h) {
      var k = new Request("/search/fetch/", {
        method: "post",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "q=" + encodeURIComponent(h)
      });
      fetch(k)
        .then(function(l) {
          return l.json();
        })
        .then(function(l) {
          extract_data(l);
        })
        .then(function(l) {
          console.log(l);
        })
        .catch(function(l) {
          var n = document.createElement("div");
          (n.style.color = "red"),
            (n.innerText = l),
            document.getElementById("youtubeprev").appendChild(n);
        });
    }),
      (c.extract_data = function f(h) {
        if (
          ((html = h.html),
          (trending = h.trending),
          console.log(trending),
          (regex = new RegExp(/ytInitialData"]\s=\s({[\s\S]*?});/, "gm")),
          (json_data = {}),
          (json_data.data = []),
          (videos = []),
          (m = regex.exec(html)),
          (reg = JSON.parse(m[1])),
          trending)
        ) {
          var k =
            reg.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer
              .content.sectionListRenderer.contents;
          for (dat in k) {
            var C,
              n = k[dat].itemSectionRenderer.contents[0].shelfRenderer.content,
              r = n[Object.keys(n)[0]].items;
            (C = videos).push.apply(C, _toConsumableArray(r));
          }
        } else
          for (opts in ((contents =
            reg.contents.twoColumnSearchResultsRenderer.primaryContents
              .sectionListRenderer.contents[0].itemSectionRenderer.contents),
          contents))
            null != contents[opts].videoRenderer && videos.push(contents[opts]);
        for (h in videos) {
          var t = videos[h],
            u = Object.keys(t)[0],
            v = t[u].videoId,
            x = t[u].title.simpleText,
            y = t[u].shortBylineText.runs[0].text,
            z =
              "//youtube.com" +
              t[u].shortBylineText.runs[0].navigationEndpoint.commandMetadata
                .webCommandMetadata.url;
          try {
            var A =
              t[u].richThumbnail.movingThumbnailRenderer.movingThumbnailDetails
                .thumbnails[0].url;
          } catch (C) {
            A = null;
          }
          var B = "/video?url=" + encodeURIComponent("https://youtu.be/" + v);
          json_data.data.push({
            url: B,
            thumb: "https://i.ytimg.com/vi/" + v + "/hqdefault.jpg",
            title: x,
            channel: y,
            channel_url: z,
            preview: A
          });
        }
        gen_results(json_data);
      }),
      (c.gen_results = function g(h) {
        (document.getElementById("skelly").style.display = "none"),
          (document.getElementById("content").style.display = "block");
        for (var k = 0; k < h.data.length; k++) {
          var l = document.createElement("a"),
            n = document.createElement("img");
          n.setAttribute("class", "rounded-image"), (n.src = h.data[k].thumb);
          var o = h.data[k].title,
            r = h.data[k].url,
            t = h.data[k].channel,
            u = h.data[k].channel_url;
          n.setAttribute("data-motion", h.data[k].preview),
            n.setAttribute("data-img", h.data[k].thumb),
            n.setAttribute(
              "alt",
              "No Preview available or your browser does not support webp images"
            ),
            (n.style.display = "inline-block"),
            (l.href = r),
            l.appendChild(n),
            l.appendChild(document.createElement("br"));
          var v = document.createElement("b");
          (v.innerHTML = o), l.appendChild(v);
          var w = document.createElement("a");
          (w.href = u),
            (w.innerHTML = t),
            (n.onmouseover = function() {
              this.src = this.getAttribute("data-motion");
            }),
            (n.onmouseout = function() {
              this.src = this.getAttribute("data-img");
            }),
            (n.ontouchstart = function() {
              this.src = this.getAttribute("data-motion");
            }),
            (n.ontouchend = function() {
              this.src = this.getAttribute("data-img");
            });
          var x = document.createElement("div");
          (x.innerHTML = "Video By:"),
            x.appendChild(w),
            x.appendChild(document.createElement("br")),
            x.appendChild(document.createElement("br")),
            document.getElementById("content").appendChild(l),
            document.getElementById("content").appendChild(x);
        }
        return "Created Results";
      });
  }.call(window);
