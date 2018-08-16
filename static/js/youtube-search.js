function decodehtml(html) {
    var txt = document.createElement("textarea");
    return txt.innerHTML = html, txt.value
}
var doctitle = decodehtml(decodehtml(document.title));
if (0 != doctitle.length) {
    var titles = "Results for " + doctitle;
    document.title = titles
} else document.title = "Results from youtube.com";

function search() {
    var q, url = "/search?q=" + document.getElementById("search").value;
    window.location = url
}
document.getElementById("search").onkeyup = function (e) {
    13 == e.keyCode && search()
};
var b = document.getElementById("s-button"),
    get_data, extract_data, gen_results;
b.onmouseover = function () {
        b.style.boxShadow = "3px 3px #d9dce0"
    }, b.onmouseout = function () {
        b.style.boxShadow = "0px 0px #d9dce0"
    }, b.ontouchstart = function () {
        b.style.boxShadow = "3px 3px #d9dce0"
    }, b.ontouchend = function () {
        b.style.boxShadow = "0px 0px #d9dce0"
    },
    function () {
        var _$0 = this,
            _3 = function (q) {
                var req = new Request("/search/fetch/", {
                    method: "post",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: "q=" + encodeURIComponent(q)
                });
                fetch(req).then(response => response.json()).then(response => {
                    extract_data(response)
                }).then(function (result) {
                    console.log(result)
                }).catch(function (error) {
                    var div = document.createElement("div");
                    div.style.color = "red", div.innerText = error, document.getElementById("youtubeprev").appendChild(div)
                })
            },
            _4 = function (data) {
                if (html = data.html, trending = data.trending, console.log(trending), regex = new RegExp(/ytInitialData\"]\s=\s({[\s\S]*?});/, "gm"), json_data = {}, json_data.data = [], videos = [], m = regex.exec(html), reg = JSON.parse(m[1]), trending) {
                    var trend_data = reg.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents;
                    for (dat in trend_data) {
                        var part, temp_l = trend_data[dat].itemSectionRenderer.contents[0].shelfRenderer.content,
                            tkey, temps = temp_l[Object.keys(temp_l)[0]].items;
                        videos.push(...temps)
                    }
                } else
                    for (opts in contents = reg.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents, contents) null != contents[opts].videoRenderer && videos.push(contents[opts]);
                for (data in videos) {
                    var vid = videos[data],
                        vid_keys = Object.keys(vid)[0],
                        videoId = vid[vid_keys].videoId,
                        thumb = "https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg",
                        title = vid[vid_keys].title.simpleText,
                        channel_name = vid[vid_keys].shortBylineText.runs[0].text,
                        channel_url = "//youtube.com" + vid[vid_keys].shortBylineText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url;
                    try {
                        var preview = vid[vid_keys].richThumbnail.movingThumbnailRenderer.movingThumbnailDetails.thumbnails[0].url
                    } catch (e) {
                        var preview = null
                    }
                    var video_url = "/video?url=" + encodeURIComponent("https://youtu.be/" + videoId);
                    json_data.data.push({
                        url: video_url,
                        thumb: thumb,
                        title: title,
                        channel: channel_name,
                        channel_url: channel_url,
                        preview: preview
                    })
                }
                gen_results(json_data)
            },
            _5 = function (json_data) {
                document.getElementById("skelly").style.display = "none", document.getElementById("content").style.display = "block";
                for (var i = 0; i < json_data.data.length; i++) {
                    var a = document.createElement("a"),
                        img = document.createElement("img");
                    img.setAttribute("class", "rounded-image"), img.src = json_data.data[i].thumb;
                    var title = json_data.data[i].title,
                        link = json_data.data[i].url,
                        channel = json_data.data[i].channel,
                        channel_url = json_data.data[i].channel_url;
                    img.setAttribute("data-motion", json_data.data[i].preview), img.setAttribute("data-img", json_data.data[i].thumb), img.setAttribute("alt", "No Preview available or your browser does not support webp images"), img.style.display = "inline-block", a.href = link, a.appendChild(img), a.appendChild(document.createElement("br"));
                    var bold = document.createElement("b");
                    bold.innerHTML = title, a.appendChild(bold);
                    var ch_url = document.createElement("a");
                    ch_url.href = channel_url, ch_url.innerHTML = channel, img.onmouseover = function () {
                        this.src = this.getAttribute("data-motion")
                    }, img.onmouseout = function () {
                        this.src = this.getAttribute("data-img")
                    }, img.ontouchstart = function () {
                        this.src = this.getAttribute("data-motion")
                    }, img.ontouchend = function () {
                        this.src = this.getAttribute("data-img")
                    };
                    var sp = document.createElement("div");
                    sp.innerHTML = "Video By:", sp.appendChild(ch_url), sp.appendChild(document.createElement("br")), sp.appendChild(document.createElement("br")), document.getElementById("content").appendChild(a), document.getElementById("content").appendChild(sp)
                }
                return "Created Results"
            };
        _$0.get_data = _3, _$0.extract_data = _4, _$0.gen_results = _5
    }.call(this);