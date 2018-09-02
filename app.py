import base64
import hashlib
import html
import json
import os
import random
import re
import secrets
import subprocess
import threading
import time
import urllib.request
import uuid
from urllib.parse import quote, unquote, urlencode, urlparse

import requests
from flask import (
    Flask,
    Response,
    make_response,
    redirect,
    render_template,
    request,
    send_from_directory,
    session,
    stream_with_context,
)
from htmlmin.minify import html_minify
from werkzeug.contrib.fixers import ProxyFix

import apIo
import streamsites
import yt_sig

api = apIo.Api()
app = Flask(__name__)
ProxyFix(app)
ua = "Mozilla/5.0 (Windows; U; Windows NT 10.0; en-US)\
 AppleWebKit/604.1.38 (KHTML, like Gecko) Chrome/68.0.3325.162"

app.secret_key = "7bf9a280"
SAVE_DIR = os.path.join(app.root_path, "saves")
basic_headers = {
    "Accept-Encoding": "gzip, deflate",
    "User-Agent": ua,
    "Upgrade-Insecure-Requests": "1",
    "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
    "dnt": "1",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
}
try:
    with open(os.path.join("static", ".mimetypes")) as f:
        _mime_types_ = json.loads(f.read())
except FileNotFoundError:
    _mime_types_ = {}
    print("Blank Mime Types")


@app.before_request
def enforce_https():
    if (
        request.endpoint in app.view_functions
        and request.url.startswith("http://")
        and not request.is_secure
        and "127.0.0.1" not in request.url
        and "localhost" not in request.url
        and "herokuapp." in request.url
    ):
        return redirect(request.url.replace("http://", "https://"), code=301)


@app.route("/", strict_slashes=False)
def index():
    return html_minify(render_template("index.html"))


@app.route("/video/", strict_slashes=False)
def video():
    url = request.args.get("url")
    if url is None:
        return redirect("/", code=302)
    data = streamsites.check_for_stream_sites(url, request.headers.get("User-Agent"))
    if data:
        return html_minify(
            render_template("multioptions.html", urls=data, url=url, number_=len(data))
        )
    return html_minify(render_template("video.html", url=url))


@app.route("/videos/fetch/", methods=["POST"])
def get_video():
    try:
        _url = request.form["url"]
        _url = "http://" + _url if not _url.startswith("http") else _url
        url = check_for_redirects(_url)
    except:
        return json.dumps({"error": "An error occured..please check the url"})
    reg = r"^https?://(.{3})?\.?(daclips|thevideo|vev.io)"
    if re.search(reg, url) is not None:
        redirect = "https://proxy-py.herokuapp.com/api/parse_query?url=%s" % (
            quote(url)
        )
        return json.dumps(
            {
                "url": url,
                "funcname": "null",
                "download": True,
                "site": re.search(reg, url).group(),
                "redirect": redirect,
            }
        )
    func_name, url = get_funcname(url)
    if not func_name:
        response = make_response(json.dumps({"error": "not supported"}))
    else:
        page = requests.get(url, headers=basic_headers, allow_redirects=True)
        if not page.ok:
            response = make_response(
                json.dumps(
                    {
                        "error": "URL Returned The error-%s %s"
                        % (page.status_code, page.reason)
                    }
                )
            )
        else:
            response = make_response(
                json.dumps(
                    {"html": page.text, "funcname": func_name, "landing_url": url}
                )
            )
    response.headers["Content-Type"] = "application/json"
    return response


@app.route("/mp3extract/", strict_slashes=False)
def extract_to_mp3():
    _url = unquote(request.args.get("mp3u"))
    mt = "audio/mp3"
    return html_minify(render_template("mp3.html", u=_url, mime=quote(mt)))


@app.route("/stream/f/cache/")
def stream_cache():
    ua = request.headers.get("User-Agent")
    file_s = unquote(request.args.get("u"))
    sess = requests.Session()
    files_n = str(uuid.uuid4())
    filename = "%s.mp4" % (files_n)
    fsize = sess.head(
        file_s, headers={"User-Agent": ua}, allow_redirects=True
    ).headers.get("Content-Length")
    r = sess.get(file_s, headers={"User-Agent": ua}, allow_redirects=True, stream=True)
    dl = str(uuid.uuid4()) + ".mp3"
    print(file_s)
    return Response(
        proxy_download_before_send(filename, r, dl, fsize, 0),
        content_type="text/event-stream",
    )


def proxy_download_before_send(fn, r, dl, fsize, completed):
    fsize = int(fsize)
    print(fn, fsize)
    with open(fn, "ab") as f:
        for e in r.iter_content(chunk_size=4096):
            if e:
                completed += 4096
                yield "data: %d\n\n" % ((completed / fsize) * 100)
                f.write(e)
    now_ = time.time()
    print("DONE")
    yield "data: ffmpeg-init\n\n"
    g = """ffmpeg -i "%s" "%s" """ % (fn, dl)
    to_ = "/send-cached/*/download/?url=%s" % (dl)
    p = subprocess.Popen([g], shell=True)
    while p.poll() is None:
        time.sleep(1)
        yield "data: Converting since %d Seconds\n\n" % (int(time.time()) - now_)
    yield "data: " + to_ + "\n\n"


@app.route("/send-cached/*/download/")
def send_statics_no_range():
    mp3file = request.args.get("url")
    if os.path.isfile(mp3file):
        rv = make_response(send_from_directory(app.root_path, mp3file))
        rv.headers["Content-Disposition"] = "attachment;filename=%s" % (mp3file)
        return rv
    else:
        return "no"


@app.route("/youtube/js/")
def sig_func_name():
    url = request.args["url"]
    sig_js, funcname = yt_sig.main_decrypt().get_js(url)
    res = make_response(json.dumps({"sig_js": sig_js, "funcname": funcname}))
    res.headers["Content-Type"] = "application/json"
    return res


def check_for_redirects(url):
    sess = requests.Session()
    u = sess.head(url, headers=basic_headers, allow_redirects=True)
    if re.search(r"https?://(www\.)?google\.co.*?\/url", u.url) is not None:
        url = re.search(
            r"URL='(?P<url>.*?)'",
            sess.get(u.url, allow_redirects=True, headers=basic_headers).text,
            re.IGNORECASE,
        )
        return url.group("url")
    else:
        return u.url


@app.route("/fetch_url/")
def proxy_download():
    url = request.args.get("u")
    ref = request.args.get("referer")
    sess = requests.Session()
    req = sess.get(
        url,
        headers={"User-Agent": ua, "Referer": ref},
        allow_redirects=True,
        stream=True,
    )
    for _ in req.iter_content(chunk_size=10):
        req.close()
    url = req.url
    req_data = req.headers
    mt = req_data.get("Content-Type") or "application/octet-stream"
    session["content-type"] = mt
    print("[debug]Response Headers::", req_data)
    filesize = req_data.get("Content-Length")
    print("FileSize:", filesize)
    if filesize is None:  # Web page or a small file probably
        fils = requests.get(
            url, headers={"User-Agent": ua, "Referer": ref}, stream=True
        )
        return Response(
            stream_with_context(fils.iter_content(chunk_size=2048)),
            content_type=fils.headers.get("Content-Type"),
        )
    session["filesize"] = filesize
    return render_template("send_blob.html", url=url, ref=ref)


@app.route("/proxy/f/")
def send_files():
    print("*************\n", request.headers, "*************\n")
    url = unquote(request.args.get("u"))
    referer = request.args.get("referer")
    print("Downloading:'" + url[:50] + "...'")
    _filename = secrets.token_urlsafe(15)
    _mime = _mime_types_.get(session.get("content-type")) or ".bin"
    session["filename"] = _filename + _mime
    thread = threading.Thread(
        target=threaded_req, args=(url, referer, session["filename"])
    )
    thread.start()
    time.sleep(2)
    return "OK"


def checksum_first_5_mb(filename, meth="sha256"):
    """hashes exactly the first 5 megabytes of a file"""
    foo = getattr(hashlib, meth)()
    _bytes = 0
    total = 5 * 1024 * 1024
    with open(filename, "rb") as f:
        while _bytes <= total and _bytes < os.path.getsize(filename):
            f.seek(_bytes)
            chunk = f.read(1024 * 4)
            foo.update(chunk)
            _bytes += 1024 * 4
    return foo.hexdigest()


def dict_print(s: dict) -> None:
    print("{")
    for k, v in s.items():
        print("%s:%s" % (k, v))
    print("}")


def threaded_req(url, referer, filename):
    print("filename:", filename)
    if not os.path.isdir(SAVE_DIR):
        os.mkdir(SAVE_DIR)
    parsed_url = urlparse(url)
    file_location = os.path.join(SAVE_DIR, filename)
    dl_headers = {**basic_headers, "host": parsed_url.netloc, "referer": referer}
    print("Downloading with headers:")
    dict_print(dl_headers)
    # So apparently you cant set headers in urlretrieve.....brilliant
    with open(file_location, "wb") as f:
        with requests.Session().get(url, headers=dl_headers, stream=True) as r:
            for chunk in r.iter_content(chunk_size=(5 * 1024 * 1024)):
                if chunk:
                    f.write(chunk)
    print("Downloaded File")


@app.route("/session/_/progress-poll/")
def progresses():
    filename = session.get("filename")
    filesize = session.get("filesize")
    if filename is None or filesize is None:
        return json.dumps({"error": "no-being-downloaded"})
    filesize = int(filesize)
    file_location = os.path.join(SAVE_DIR, filename)
    try:
        curr_size = os.path.getsize(file_location)
    except:
        return json.dumps({"error": "file-deleted-from our-storages"})
    if curr_size >= filesize:
        session.pop("filename")
        session.pop("filesize")
        dl_url = "/get-cached/x/?" + urlencode(
            {"f": quote(filename), "hash": checksum_first_5_mb(file_location)}
        )
        return json.dumps(
            {"file": True, "link": dl_url, "done": curr_size, "total": filesize}
        )
    else:
        return json.dumps({"done": curr_size, "total": filesize})


@app.route("/test/proxy/")
def proxy_tests():
    return render_template("test.html")


@app.route("/api/1/youtube/trending")
def yt_trending():
    data = api.youtube(trending=True)
    res = make_response(json.dumps(data))
    res.headers["Content-Type"] = "application/json"
    return res


@app.route("/api/1/youtube/get")
def youtube_search_():
    _query = request.args.get("q")
    query = html.unescape(_query) if _query else False
    if not query:
        return redirect("/youtube")
    data = api.youtube(query=query)
    res = make_response(json.dumps(data))
    res.headers["Content-Type"] = "application/json"
    return res


def get_funcname(url):
    if (
        re.search(
            r"^(https?:)?//.*\.?(openload|oload|openupload)\.", url, re.IGNORECASE
        )
        is not None
    ):
        return "openload", url
    if re.search(r"^(https?:)?//.*\.?(keeload)\.", url, re.IGNORECASE) is not None:
        return "keeload", url
    if re.search(r"^(https?:)?//.*\.?megadrive\.", url, re.IGNORECASE) is not None:
        return "megadrive", url
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
    elif (
        re.search(
            r"^https?://(.{3})?\.?(streamango|streamago|streamcloud)",
            url,
            re.IGNORECASE,
        )
        is not None
    ):
        return "streamango", url
    else:
        return False, None


@app.errorhandler(404)
def page_error(e):
    return html_minify(render_template("404.html")), 404


@app.after_request
def cors___(res):
    res.direct_passthrough = False
    res.headers["Access-Control-Allow-Origin"] = "https://pycode.tk"
    res.headers["Access-Control-Allow-Headers"] = "*"
    vary = res.headers.get("Vary")
    if vary:
        if "accept-encoding" not in vary.lower():
            res.headers[
                "Vary"
            ] = "{}, Access-Control-Allow-Origin,Access-Control-Allow-Headers".format(
                vary
            )
    else:
        res.headers["Vary"] = "Access-Control-Allow-Origin,Access-Control-Allow-Headers"
    return res


@app.route("/api/gen_204/", strict_slashes=False)
def wakeup():
    res = make_response()
    res.headers["X-Ready"] = str(uuid.uuid4())
    res.headers["Access-Control-Expose-Headers"] = "X-Ready"
    res.headers["Access-Control-Allow-Origin"] = "*"
    res.headers["Access-Control-Allow-Headers"] = "*"
    return res, 204


@app.route("/search/", strict_slashes=False)
def search():
    q = request.args.get("q")
    if q is None:
        q = "  "
    return html_minify(render_template("search.html", q=q))


@app.route("/search/fetch/", methods=["POST"])
def search_json():
    q = request.form.get("q")
    if re.sub(r"\s", "", q):  # has some text
        trending = False
        req = "http://youtube.com/results?search_query=" + q
    else:
        trending = True
        req = "http://youtube.com/feed/trending/"
    htm = requests.get(req, headers=basic_headers).text
    return Response(
        json.dumps({"html": htm, "trending": trending}), content_type="application/json"
    )


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
