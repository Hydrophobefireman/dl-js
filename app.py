import json
import streamsites
import re

import requests
from urllib.parse import unquote, quote
from flask import (Flask, Response, make_response, redirect, render_template, stream_with_context,
                   request, send_file, session)
from htmlmin.minify import html_minify
app = Flask(__name__)
try:
    from flask_compress import Compress
    Compress(app)
except ImportError:
    pass
import yt_sig
ua = "Mozilla/5.0 (Windows; U; Windows NT 10.0; en-US)\
 AppleWebKit/604.1.38 (KHTML, like Gecko) Chrome/68.0.3325.162"
app.secret_key = "7bf9a280"
basic_headers = {
    "User-Agent": ua,
    "Upgrade-Insecure-Requests": "1",
    "dnt": '1',
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8"
}


@app.before_request
def enforce_https():
    if request.endpoint in app.view_functions and not request.is_secure and "127.0.0.1" not in request.url and "localhost" not in request.url and "herokuapp." in request.url:
        return redirect(request.url.replace("http://", "https://"), code=301)


@app.route("/", strict_slashes=False)
def index():
    return html_minify(render_template("index.html"))


@app.route("/video/", strict_slashes=False)
def video():
    url = request.args.get("url")
    if url is None:
        return redirect("/", code=302)
    url = request.args.get("url")
    data = streamsites.check_for_stream_sites(
        url, request.headers.get("User-Agent"))
    if not data:
        return html_minify(render_template('video.html', url=url))
    else:
        return html_minify(render_template("multioptions.html", urls=data, url=url, number_=len(data)))


@app.route("/videos/fetch/", methods=['POST'])
def get_video():
    try:
        url = request.form['url']
        url = check_for_redirects(url)
    except:
        return json.dumps({'error': 'not-supported'})
    reg = r"^https?://(.{3})?\.?(oload|openload|daclips|thevideo|vev.io)"
    if re.search(reg, url) is not None:
        redirect = "https://proxy-py.herokuapp.com/api/parse_query?url=%s" % (
            quote(url))
        return json.dumps({"url": url, "download": True, "site": re.search(reg, url).group(), "redirect": redirect})
    func_name, url = get_funcname(url)
    if not func_name:
        return json.dumps({'error': 'not-supported'})
    page = requests.get(url, headers=basic_headers, allow_redirects=True).text
    return Response(json.dumps({"html": page, "funcname": func_name}), content_type='application/json')


@app.route("/youtube/js/")
def sig_func_name():
    url = request.args['url']
    funcs = yt_sig.main_decrypt().get_js(url)
    sig_js = funcs[0]
    funcname = funcs[1]
    return Response(json.dumps({"sig_js": sig_js, "funcname": funcname}), content_type='application/json')


def check_for_redirects(url):
    sess = requests.Session()
    u = sess.head(url, headers=basic_headers, allow_redirects=True)
    if re.search(r"https?://(www\.)?google\.co.*?\/url", u.url) is not None:
        url = re.search(r"URL='(?P<url>.*?)'",
                        sess.get(u.url, allow_redirects=True).text, re.IGNORECASE)
        return url.group("url")
    else:
        return u.url


@app.route("/fetch_url/")
def proxy_download():
    url = request.args.get("u")
    ref = request.args.get("referer")
    req = requests.Session().head(
        url, headers={"User-Agent": ua, "Referer": ref}, allow_redirects=True)
    print(req.headers)
    url = req.url
    req_data = req.headers
    accept_ranges = req_data.get("Accept-Ranges")
    if str(accept_ranges).lower() != 'none':
        # for Accept-Ranges:None headers
        accept_ranges = 'true'
    else:
        accept_ranges = 'false'
    mt = req_data.get("Content-Type") or "application/octet-stream"
    session['content-type'] = mt
    filesize = req_data.get("Content-Length") or 0
    return render_template("send_blob.html", r=url, ref=ref, mimetype_=mt, filesize=filesize, accept_ranges=accept_ranges)


@app.route("/proxy/f/")
def send_files():
    user_agent = request.headers.get("User-Agent") or ua
    url = unquote(request.args.get("u"))
    range_ = request.args.get("range") or "0-"
    referer = request.args.get("referer")
    print(range_)
    print("Downloading:'"+url[:50]+"...'")
    sess = requests.Session()
    r = sess.get(url, headers={"User-Agent": user_agent, "Referer": referer, "range": "Bytes=%s" % (range_)},
                 stream=True)
    return Response(stream_with_context(r.iter_content(chunk_size=5000)), content_type=session["content-type"])


def get_funcname(url):
    if re.search(r"^(https?:)?//.*\.?estream", url, re.IGNORECASE) is not None:
        return "estream", url
    elif re.search(r"^(https?:)?//.*\.?yourupload\.", url, re.IGNORECASE) is not None:
        if "/watch/" in url:
            url = url.replace("/watch/", "/embed/")
        return "yourupload", url
    elif re.search(r"^(https?:)?//.*\.?watcheng", url, re.IGNORECASE) is not None:
        return "watcheng", url
    elif re.search(r"^(https?:)?//.*\.?instag\.?ram\.?", url) is not None:
        return "instagram", url
    elif re.search(r"^(https?:)?//.*\.?vidzi\.?", url) is not None:
        return "vidzi", url
    elif re.search(r"^(https?:)?//.*\.?rapidvideo\.", url, re.IGNORECASE) is not None:
        return "rapidvideo", url
    elif re.search(r"^(https?:)?//.*?\.?(youtube\.|youtu\.be|yt\.be)", url) is not None:
        return "youtube", url
    elif re.search(r"^https?://(.{3})?\.?(streamango|streamago|streamcloud)", url, re.IGNORECASE) is not None:
        return "streamango", url
    else:
        return False, None


@app.errorhandler(404)
def page_error(e):
    return html_minify(render_template('404.html')), 404


@app.route("/search/", strict_slashes=False)
def search():
    q = request.args.get("q")
    if q is None:
        q = "  "
    return html_minify(render_template("search.html", q=q))


@app.route("/search/fetch/", methods=['POST'])
def search_json():
    q = request.form.get("q")
    if re.sub(r"\s", "", q):  # has some text
        trending = False
        req = "http://youtube.com/results?search_query="+q
    else:
        trending = True
        req = "http://youtube.com/feed/trending/"
    print(req)
    htm = requests.get(req, headers=basic_headers).text
    return Response(json.dumps({"html": htm, "trending": trending}), content_type="application/json")


if __name__ == '__main__':
    app.run(debug=True)
