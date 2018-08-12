const decodehtml = (html) => {
        var txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }
    (async () => {
        var doctitle = decodehtml(decodehtml(document.title));
        if (doctitle.length != 0) {
            var titles = "Results for " + doctitle
            document.title = titles;
        } else {
            document.title = "Results from youtube.com"
        }
    })();

const search = () => {
    var q = document.getElementById("search").value;
    var url = "/search?q=" + q;
    window.location = url;
}
document.getElementById("search").onkeyup = e => {
    if (e.keyCode == 13) {
        search()
    }
}
const b = document.getElementById("s-button");
b.onmouseover = () => {
    b.style.boxShadow = "3px 3px #d9dce0";
}
b.onmouseout = () => {
    b.style.boxShadow = "0px 0px #d9dce0";

}
b.ontouchstart = () => {
    b.style.boxShadow = "3px 3px #d9dce0";
}
b.ontouchend = () => {
    b.style.boxShadow = "0px 0px #d9dce0";

}
let get_data;
let extract_data;
let gen_results;
(function () {
    const _$0 = this;

    const _3 = q => {
        const req = new Request("/search/fetch/", {
            method: 'post',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: "q=" + encodeURIComponent(q)
        });
        fetch(req).then(response => response.json()).then(response => {
            extract_data(response);
        }).then(result => {
            console.log(result);
        }).catch(error => {
            const div = document.createElement("div");
            div.style.color = 'red';
            div.innerText = error;
            document.getElementById('youtubeprev').appendChild(div);
        });
    };

    const _4 = data => {
        html = data['html'];
        trending = data['trending'];
        console.log(trending);
        regex = new RegExp(/ytInitialData\"]\s=\s({[\s\S]*?});/, 'gm');
        json_data = {};
        json_data['data'] = [];
        videos = [];
        m = regex.exec(html);
        reg = JSON.parse(m[1]);

        if (!trending) {
            contents = reg['contents']["twoColumnSearchResultsRenderer"]["primaryContents"]["sectionListRenderer"]["contents"][0]["itemSectionRenderer"]["contents"];

            for (opts in contents) {
                if (contents[opts]['videoRenderer'] != null) {
                    videos.push(contents[opts]);
                }
            }
        } else {
            const trend_data = reg['contents']["twoColumnBrowseResultsRenderer"]['tabs'][0]["tabRenderer"]["content"]["sectionListRenderer"]['contents'];

            for (dat in trend_data) {
                const part = trend_data[dat];
                const temp_l = part["itemSectionRenderer"]["contents"][0]["shelfRenderer"]["content"];
                const tkey = Object.keys(temp_l)[0];
                const temps = temp_l[tkey]['items'];
                videos.push(...temps);
            }
        }

        for (data in videos) {
            const vid = videos[data];
            const vid_keys = Object.keys(vid)[0];
            const videoId = vid[vid_keys]['videoId'];
            const thumb = "https://i.ytimg.com/vi/" + videoId + "/hqdefault.jpg";
            const title = vid[vid_keys]['title']['simpleText'];
            const channel_name = vid[vid_keys]['shortBylineText']['runs'][0]['text'];
            const channel_url = 'https://youtube.com' + vid[vid_keys]['shortBylineText']['runs'][0]['navigationEndpoint']['commandMetadata']['webCommandMetadata']['url'];

            try {
                var preview = vid[vid_keys]['richThumbnail']['movingThumbnailRenderer']['movingThumbnailDetails']['thumbnails'][0]['url'];
            } catch (e) {
                var preview = null;
            }

            ;
            const video_url = "/video?url=" + encodeURIComponent("https://youtu.be/" + videoId);
            json_data['data'].push({
                "url": video_url,
                "thumb": thumb,
                "title": title,
                "channel": channel_name,
                "channel_url": channel_url,
                "preview": preview
            });
        }

        gen_results(json_data);
    };

    const _5 = json_data => {
        document.getElementById("skelly").style.display = "none";
        document.getElementById("content").style.display = "block";

        for (let i = 0; i < json_data['data'].length; i++) {
            const a = document.createElement("a");
            const img = document.createElement("img");
            img.setAttribute("class", "rounded-image");
            img.src = json_data['data'][i]['thumb'];
            const title = json_data['data'][i]['title'];
            const link = json_data['data'][i]['url'];
            const channel = json_data['data'][i]['channel'];
            const channel_url = json_data['data'][i]['channel_url'];
            img.setAttribute("data-motion", json_data['data'][i]['preview']);
            img.setAttribute("data-img", json_data['data'][i]['thumb']);
            img.setAttribute("alt", "No Preview available or your browser does not support webp images");
            img.style.display = 'inline-block';
            a.href = link;
            a.appendChild(img);
            a.appendChild(document.createElement("br"));
            const bold = document.createElement("b");
            bold.innerHTML = title;
            a.appendChild(bold);
            const ch_url = document.createElement("a");
            ch_url.href = channel_url;
            ch_url.innerHTML = channel;

            img.onmouseover = function () {
                this.src = this.getAttribute("data-motion");
            };

            img.onmouseout = function () {
                this.src = this.getAttribute("data-img");
            };

            img.ontouchstart = function () {
                this.src = this.getAttribute("data-motion");
            };

            img.ontouchend = function () {
                this.src = this.getAttribute("data-img");
            };

            const sp = document.createElement("div");
            sp.innerHTML = "Video By:";
            sp.appendChild(ch_url);
            sp.appendChild(document.createElement("br"));
            sp.appendChild(document.createElement("br"));
            document.getElementById("content").appendChild(a);
            document.getElementById("content").appendChild(sp);
        }

        return "Created Results";
    };

    _$0.get_data = _3;
    _$0.extract_data = _4;
    _$0.gen_results = _5;
}).call(this);