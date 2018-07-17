import json
import re
from urllib.parse import quote_plus as quote

import requests

USER_AGENT = "Mozilla/5.0 (Windows; U; Windows NT 10.0; en-US) AppleWebKit/604.1.38 (KHTML, like Gecko) Chrome/68.0.3325.162"


def yt_search(q):
    if re.sub(r"\s", "", q):  # has some text
        trending = False
        req = "http://youtube.com/results?search_query="+q
    else:
        trending = True
        req = "http://youtube.com/feed/trending/"
    print(req)
    htm = requests.get(req, headers={
        "User-Agent": USER_AGENT}).text
    reg = json.loads(re.search(
        r"(?s)ytInitialData\"]\s=\s(?P<id>{.*?});", htm, re.IGNORECASE).group("id"))
    json_data = {}
    json_data['data'] = []
    videos = []
    if not trending:
        contents = reg['contents']["twoColumnSearchResultsRenderer"]["primaryContents"][
            "sectionListRenderer"]["contents"][0]["itemSectionRenderer"]["contents"]
        for opt in contents:
            if opt.get("videoRenderer"):
                videos.append(opt)
    else:
        temp_ = []
        print("trending")
        data = reg['contents']["twoColumnBrowseResultsRenderer"]['tabs'][0]["tabRenderer"]["content"]["sectionListRenderer"]['contents']
        for part in data:
            key = list(part["itemSectionRenderer"]["contents"]
                       [0]["shelfRenderer"]["content"])[0]
            temp_ = [s for s in part["itemSectionRenderer"]
                     ["contents"][0]["shelfRenderer"]["content"][key]['items']]
            videos += temp_
    for vid in videos:
        vid_keys = list(vid.keys())[0]
        videoId = vid[vid_keys]['videoId']
        thumb = "https://i.ytimg.com/vi/%s/hqdefault.jpg" % (videoId)
        title = vid[vid_keys]['title']['simpleText'].replace(
            "'", '').replace("\"", '')
        channel_name = vid[vid_keys]['shortBylineText']['runs'][0]['text']
        channel_url = "//youtube.com" + \
            vid[vid_keys]['shortBylineText']['runs'][0]['navigationEndpoint']['commandMetadata']['webCommandMetadata']['url']
        try:
            preview = vid[vid_keys]['richThumbnail']['movingThumbnailRenderer']['movingThumbnailDetails']['thumbnails'][0]['url']
        except:
            preview = None
        video_url = "/video?url="+quote("https://youtu.be/%s" % (videoId))
        json_data['data'].append({"url": video_url, "thumb": thumb, "title": title,
                                  "channel": channel_name, "channel_url": channel_url, "preview": preview})
    return json.dumps(json_data)


if __name__ == "__main__":
    print(yt_search(input("Enter Search Term:")))
