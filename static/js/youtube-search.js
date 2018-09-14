function decodehtml(s) {
    /** @type {!Element} */
    const ta = document.createElement("textarea");
    return ta.innerHTML = s, ta.value;
}
const doctitle = decodehtml(decodehtml(document.title));
if (0 != doctitle.length) {
    /** @type {string} */
    const titles = `Results for ${doctitle}`;
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
    let q;
    /** @type {string} */
    const http_url = `/search?q=${document.getElementById("search").value}`;
    /** @type {string} */
    window.location = http_url;
}
/**
 * @param {!Event} event
 * @return {undefined}
 */
document.getElementById("search").onkeyup = ({keyCode}) => {
    if (13 == keyCode) {
        search();
    }
};
/** @type {(Element|null)} */
const b = document.getElementById("s-button");
let get_data;
let extract_data;
let gen_results;
b.onmouseover = () => {
        /** @type {string} */
        b.style.boxShadow = "3px 3px #d9dce0";
    }, b.onmouseout = () => {
        /** @type {string} */
        b.style.boxShadow = "0px 0px #d9dce0";
    }, b.ontouchstart = () => {
        /** @type {string} */
        b.style.boxShadow = "3px 3px #d9dce0";
    }, b.ontouchend = () => {
        /** @type {string} */
        b.style.boxShadow = "0px 0px #d9dce0";
    },
    function () {
        const self = this;
        /**
         * @param {?} keyword
         * @return {undefined}
         */
        const search = keyword => {
            /** @type {!Request} */
            const request = new Request("/search/fetch/", {
                method: "post",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `q=${encodeURIComponent(keyword)}`
            });
            fetch(request).then((rawResp) => {
                return rawResp.json();
            }).then((data) => {
                extract_data(data);
            }).then(animate_param => {
                console.log(animate_param);
            }).catch(snippetText => {
                /** @type {!Element} */
                const div = document.createElement("div");
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
        const render = p => {
            if (html = p.html, trending = p.trending, console.log(trending), regex = new RegExp(/ytInitialData"]\s=\s({[\s\S]*?});/, "gm"), json_data = {}, json_data.data = [], videos = [], m = regex.exec(html), reg = JSON.parse(m[1]), trending) {
                const colorNames = reg.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents;
                for (dat in colorNames) {
                    let part;
                    const data = colorNames[dat].itemSectionRenderer.contents[0].shelfRenderer.content;
                    let tkey;
                    const cs = data[Object.keys(data)[0]].items;
                    videos.push(...cs);
                }
            } else {
                for (opts in (contents = reg.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents, contents)) {
                    if (null != contents[opts].videoRenderer) {
                        videos.push(contents[opts]);
                    }
                }
            }
            for (p in videos) {
                const extracts = videos[p];
                /** @type {string} */
                const j = Object.keys(extracts)[0];
                const id = extracts[j].videoId;
                /** @type {string} */
                const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
                const title = extracts[j].title.simpleText;
                const nick = extracts[j].shortBylineText.runs[0].text;
                /** @type {string} */
                const channel_url = `//youtube.com${extracts[j].shortBylineText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}`;
                try {
                    var api = extracts[j].richThumbnail.movingThumbnailRenderer.movingThumbnailDetails.thumbnails[0].url;
                } catch (e) {
                    /** @type {null} */
                    api = null;
                }
                /** @type {string} */
                const requestOrUrl = `/video?url=${encodeURIComponent(`https://youtu.be/${id}`)}`;
                json_data.data.push({
                    url: requestOrUrl,
                    thumb,
                    title,
                    channel: nick,
                    channel_url,
                    preview: api
                });
            }
            gen_results(json_data);
        };
        /**
         * @param {!Object} suiteContainer
         * @return {?}
         */
        const init = ({data}) => {
            /** @type {string} */
            document.getElementById("skelly").style.display = "none";
            /** @type {string} */
            document.getElementById("content").style.display = "block";
            /** @type {number} */
            let i = 0;
            for (; i < data.length; i++) {
                /** @type {!Element} */
                const node = document.createElement("a");
                /** @type {!Element} */
                const element = document.createElement("img");
                element.setAttribute("class", "rounded-image");
                element.src = data[i].thumb;
                const name = data[i].title;
                const src = data[i].url;
                const info = data[i].channel;
                const uriContent = data[i].channel_url;
                element.setAttribute("data-motion", data[i].preview);
                element.setAttribute("data-img", data[i].thumb);
                element.setAttribute("alt", "No Preview available or your browser does not support webp images");
                /** @type {string} */
                element.style.display = "inline-block";
                node.href = src;
                node.appendChild(element);
                node.appendChild(document.createElement("br"));
                /** @type {!Element} */
                const nOpt = document.createElement("b");
                nOpt.innerHTML = name;
                node.appendChild(nOpt);
                /** @type {!Element} */
                const a = document.createElement("a");
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
                const output = document.createElement("div");
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