function decodehtml(s) {
    /** @type {!Element} */
    var ta = document.createElement("textarea");
    return ta.innerHTML = s, ta.value;
}
var doctitle = decodehtml(decodehtml(document.title));
if (0 != doctitle.length) {
    /** @type {string} */
    var titles = "Results for " + doctitle;
    /** @type {string} */
    document.title = titles;
} else {
    /** @type {string} */
    document.title = "Results from youtube.com";
}
/**
 * @return {undefined}
 */
function search() {
    var q;
    /** @type {string} */
    var http_url = "/search/?q=" + document.getElementById("search").value;
    /** @type {string} */
    window.location = http_url;
}
/**
 * @param {!Event} event
 * @return {undefined}
 */
document.getElementById("search").onkeyup = function (event) {
    if (13 == event.keyCode) {
        search();
    }
};
/** @type {(Element|null)} */
var b = document.getElementById("s-button");
var get_data;
var extract_data;
var gen_results;
b.onmouseover = function () {
        /** @type {string} */
        b.style.boxShadow = "3px 3px #d9dce0";
    }, b.onmouseout = function () {
        /** @type {string} */
        b.style.boxShadow = "0px 0px #d9dce0";
    }, b.ontouchstart = function () {
        /** @type {string} */
        b.style.boxShadow = "3px 3px #d9dce0";
    }, b.ontouchend = function () {
        /** @type {string} */
        b.style.boxShadow = "0px 0px #d9dce0";
    },
    function () {
        var self = this;
        /**
         * @param {?} keyword
         * @return {undefined}
         */
        var search = function (keyword) {
            /** @type {!Request} */
            var request = new Request("/search/fetch/", {
                method: "post",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: "q=" + encodeURIComponent(keyword)
            });
            fetch(request).then((rawResp) => {
                return rawResp.json();
            }).then((data) => {
                extract_data(data);
            }).then(function (animate_param) {
                console.log(animate_param);
            }).catch(function (snippetText) {
                /** @type {!Element} */
                var div = document.createElement("div");
                /** @type {string} */
                div.style.color = "red";
                /** @type {*} */
                div.innerText = snippetText;
                document.getElementById("youtubeprev").appendChild(div);
            });
        };
        /**
         * @param {string} p
         * @return {undefined}
         */
        var render = function (p) {
            if (html = p.html, trending = p.trending, console.log(trending), regex = new RegExp(/ytInitialData"]\s=\s({[\s\S]*?});/, "gm"), json_data = {}, json_data.data = [], videos = [], m = regex.exec(html), reg = JSON.parse(m[1]), trending) {
                var colorNames = reg.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents;
                for (dat in colorNames) {
                    var part;
                    var data = colorNames[dat].itemSectionRenderer.contents[0].shelfRenderer.content;
                    var tkey;
                    var cs = data[Object.keys(data)[0]].items;
                    videos.push(...cs);
                }
            } else {
                for (opts in contents = reg.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents, contents) {
                    if (null != contents[opts].videoRenderer) {
                        videos.push(contents[opts]);
                    }
                }
            }
            for (p in videos) {
                var extracts = videos[p];
                /** @type {string} */
                var j = Object.keys(extracts)[0];
                var id = extracts[j].videoId;
                /** @type {string} */
                var thumb = "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
                var title = extracts[j].title.simpleText;
                var nick = extracts[j].shortBylineText.runs[0].text;
                /** @type {string} */
                var channel_url = "//youtube.com" + extracts[j].shortBylineText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url;
                try {
                    var api = extracts[j].richThumbnail.movingThumbnailRenderer.movingThumbnailDetails.thumbnails[0].url;
                } catch (e) {
                    /** @type {null} */
                    api = null;
                }
                /** @type {string} */
                var requestOrUrl = "/video/?url=" + encodeURIComponent("https://youtu.be/" + id);
                json_data.data.push({
                    url: requestOrUrl,
                    thumb: thumb,
                    title: title,
                    channel: nick,
                    channel_url: channel_url,
                    preview: api
                });
            }
            gen_results(json_data);
        };
        /**
         * @param {!Object} suiteContainer
         * @return {?}
         */
        var init = function (suiteContainer) {
            /** @type {string} */
            document.getElementById("skelly").style.display = "none";
            /** @type {string} */
            document.getElementById("content").style.display = "block";
            /** @type {number} */
            var i = 0;
            for (; i < suiteContainer.data.length; i++) {
                /** @type {!Element} */
                var node = document.createElement("a");
                /** @type {!Element} */
                var element = document.createElement("img");
                element.setAttribute("class", "rounded-image");
                element.src = suiteContainer.data[i].thumb;
                var name = suiteContainer.data[i].title;
                var src = suiteContainer.data[i].url;
                var info = suiteContainer.data[i].channel;
                var uriContent = suiteContainer.data[i].channel_url;
                element.setAttribute("data-motion", suiteContainer.data[i].preview);
                element.setAttribute("data-img", suiteContainer.data[i].thumb);
                element.setAttribute("alt", "No Preview available or your browser does not support webp images");
                /** @type {string} */
                element.style.display = "inline-block";
                node.href = src;
                node.appendChild(element);
                node.appendChild(document.createElement("br"));
                /** @type {!Element} */
                var nOpt = document.createElement("b");
                nOpt.innerHTML = name;
                node.appendChild(nOpt);
                /** @type {!Element} */
                var a = document.createElement("a");
                a.href = uriContent;
                a.innerHTML = info;
                /**
                 * @return {undefined}
                 */
                element.onmouseover = function () {
                    this.src = this.getAttribute("data-motion");
                };
                /**
                 * @return {undefined}
                 */
                element.onmouseout = function () {
                    this.src = this.getAttribute("data-img");
                };
                /**
                 * @return {undefined}
                 */
                element.ontouchstart = function () {
                    this.src = this.getAttribute("data-motion");
                };
                /**
                 * @return {undefined}
                 */
                element.ontouchend = function () {
                    this.src = this.getAttribute("data-img");
                };
                /** @type {!Element} */
                var output = document.createElement("div");
                /** @type {string} */
                output.innerHTML = "Video By:";
                output.appendChild(a);
                output.appendChild(document.createElement("br"));
                output.appendChild(document.createElement("br"));
                document.getElementById("content").appendChild(node);
                document.getElementById("content").appendChild(output);
            }
            return "Created Results";
        };
        /** @type {function(?): undefined} */
        self.get_data = search;
        /** @type {function(string): undefined} */
        self.extract_data = render;
        /** @type {function(!Object): ?} */
        self.gen_results = init;
    }.call(this);