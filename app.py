import json
import re
import uuid
import base64
import shutil
import time
import subprocess
import os
from urllib.parse import quote, unquote, urlparse
import threading
import requests
from flask import (
    Flask,
    Response,
    make_response,
    redirect,
    render_template,
    request,
    send_file,
    send_from_directory,
    session,
    stream_with_context,
)
from htmlmin.minify import html_minify

import streamsites
import yt_sig

app = Flask(__name__)
try:
    from flask_compress import Compress

    Compress(app)
except ImportError:
    pass
ua = "Mozilla/5.0 (Windows; U; Windows NT 10.0; en-US)\
 AppleWebKit/604.1.38 (KHTML, like Gecko) Chrome/68.0.3325.162"

app.secret_key = "7bf9a280"

basic_headers = {
    "Accept-Encoding":
    "gzip, deflate",
    "User-Agent":
    ua,
    "Upgrade-Insecure-Requests":
    "1",
    "Accept-Language":
    "en-GB,en-US;q=0.9,en;q=0.8",
    "dnt":
    "1",
    "Accept":
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
}


@app.before_request
def enforce_https():
    if (request.endpoint in app.view_functions and not request.is_secure
            and "127.0.0.1" not in request.url
            and "localhost" not in request.url
            and "herokuapp." in request.url):
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
        return html_minify(render_template("video.html", url=url))
    else:
        return html_minify(
            render_template(
                "multioptions.html", urls=data, url=url, number_=len(data)))


@app.route("/videos/fetch/", methods=["POST"])
def get_video():
    try:
        url = request.form["url"]
        url = check_for_redirects(url)
    except:
        return json.dumps({"error": "not supported"})
    reg = r"^https?://(.{3})?\.?(oload|openload|daclips|thevideo|vev.io)"
    if re.search(reg, url) is not None:
        redirect = "https://proxy-py.herokuapp.com/api/parse_query?url=%s" % (
            quote(url))
        return json.dumps({
            "url": url,
            "download": True,
            "site": re.search(reg, url).group(),
            "redirect": redirect,
        })
    func_name, url = get_funcname(url)
    if not func_name:
        return json.dumps({"error": "not supported"})
    page = requests.get(url, headers=basic_headers, allow_redirects=True)
    if not page.ok:
        return json.dumps({
            "error":
            "URL Returned The error-%s %s" % (page.status_code, page.reason)
        })
    return Response(
        json.dumps({
            "html": page.text,
            "funcname": func_name,
            "landing_url": url
        }),
        content_type="application/json",
    )


@app.route("/mp3extract/", strict_slashes=False)
def extract_to_mp3():
    print(request.headers)
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
        file_s, headers={
            "User-Agent": ua
        }, allow_redirects=True).headers.get("Content-Length")
    r = sess.get(
        file_s, headers={"User-Agent": ua}, allow_redirects=True, stream=True)
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
    print(g)
    p = subprocess.Popen([g], shell=True)
    while p.poll() is None:
        time.sleep(1)
        yield "data: Converting since %d Seconds\n\n" % (
            int(time.time()) - now_)
    yield "data: " + to_ + "\n\n"


@app.route("/send-cached/*/download/")
def send_statics_no_range():
    mp3file = request.args.get("url")
    if os.path.isfile(mp3file):
        rv = make_response(send_from_directory(app.root_path, mp3file))
        rv.headers[
            "Content-Disposition"] = "attachment;filename=%s" % (mp3file)
        return rv
    else:
        return "no"


@app.route("/youtube/js/")
def sig_func_name():
    url = request.args["url"]
    funcs = yt_sig.main_decrypt().get_js(url)
    sig_js = funcs[0]
    funcname = funcs[1]
    return Response(
        json.dumps({
            "sig_js": sig_js,
            "funcname": funcname
        }),
        content_type="application/json",
    )


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
    req = requests.Session().head(
        url, headers={
            "User-Agent": ua,
            "Referer": ref
        }, allow_redirects=True)
    print(req.headers)
    url = req.url
    req_data = req.headers
    mt = req_data.get("Content-Type") or "application/octet-stream"
    session["content-type"] = mt
    filesize = req_data.get("Content-Length")
    if filesize is None:  # Web page or a small file probably
        fils = requests.get(
            url, headers={
                "User-Agent": ua,
                "Referer": ref
            }, stream=True)
        return Response(
            stream_with_context(fils.iter_content(chunk_size=2048)),
            content_type=fils.headers.get("Content-Type"),
        )
    session["filesize"] = filesize
    return render_template("send_blob.html", url=url, ref=ref)


@app.route("/proxy/f/")
def send_files():
    print(session["filesize"])
    url = unquote(request.args.get("u"))
    referer = request.args.get("referer")
    print("Downloading:'" + url[:50] + "...'")
    session["filename"] = base64.urlsafe_b64encode(str(
        uuid.uuid4()).encode())[:10]
    filename = session["filename"]
    thread = threading.Thread(
        target=threaded_req, args=(url, referer, filename))
    thread.start()
    time.sleep(2)
    return "OK"


def threaded_req(url, referer, filename):
    sess = requests.Session()
    parsed_url = urlparse(url)
    print("STARTING DOWNLOAD")
    dl_headers = {
        **basic_headers, "host": parsed_url.netloc,
        "referer": referer
    }
    print("headers:", dl_headers)
    with sess.get(
            url, headers=dl_headers, stream=True, allow_redirects=True) as r:
        with open(filename, "wb") as f:
            for chunk in r.iter_content(chunk_size=1024 * 1024):
                if chunk:
                    f.write(chunk)
    print("Downloaded File")


@app.route("/session/_/progress-poll/")
def progresses():
    filename = session.get("filename")
    filesize = session.get("filesize")
    if filename is None or filesize is None:
        return json.dumps({"error": "no"})
    filesize = int(filesize)
    try:
        curr_size = os.path.getsize(filename)
    except:
        return json.dumps({"error": "no"})
    if curr_size >= filesize:
        session.pop("filename")
        session.pop("filesize")
        return json.dumps({
            "file":
            True,
            "link":
            "/get-cached/*/?mt=" + str(session.get("content-type")) + "&f=" +
            quote(filename),
        })
    else:
        return json.dumps({"done": curr_size, "total": filesize})


@app.route("/get-cached/*/", strict_slashes=False)
def send_downloaded_file():
    filename = request.args.get("f")
    print("******************\n", request.headers, "***********************")
    if not os.path.isfile(filename):
        return "No File"
    fsize = os.path.getsize(filename)
    resp = make_response(send_from_directory(app.root_path, filename))
    # Request headers are 0- or no header included
    if ("Content-Range" not in resp.headers
            or str(resp.headers.get("Content-Range")).lower() == "bytes=0-"):
        resp.headers["Content-Range"] = "Bytes=0-%d/%d" % (fsize - 1, fsize)
    resp.headers["Content-Type"] = (session.get("content-type")
                                    or request.args.get("mt")
                                    or "application/octet-stream")
    print(resp.headers)
    return resp


def get_funcname(url):
    if re.search(r"^(https?:)?//.*\.?estream", url, re.IGNORECASE) is not None:
        return "estream", url
    elif re.search(r"^(https?:)?//.*\.?yourupload\.", url,
                   re.IGNORECASE) is not None:
        if "/watch/" in url:
            url = url.replace("/watch/", "/embed/")
        return "yourupload", url
    elif re.search(r"^(https?:)?//.*\.?watcheng", url,
                   re.IGNORECASE) is not None:
        return "watcheng", url
    elif re.search(r"^(https?:)?//.*\.?instag\.?ram\.?", url) is not None:
        return "instagram", url
    elif re.search(r"^(https?:)?//.*\.?vidzi\.?", url) is not None:
        return "vidzi", url
    elif re.search(r"^(https?:)?//.*\.?rapidvideo\.", url,
                   re.IGNORECASE) is not None:
        return "rapidvideo", url
    elif re.search(r"^(https?:)?//.*?\.?(youtube\.|youtu\.be|yt\.be)",
                   url) is not None:
        return "youtube", url
    elif (re.search(
            r"^https?://(.{3})?\.?(streamango|streamago|streamcloud)",
            url,
            re.IGNORECASE,
    ) is not None):
        return "streamango", url
    else:
        return False, None


@app.errorhandler(404)
def page_error(e):
    return html_minify(render_template("404.html")), 404


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
    print(req)
    htm = requests.get(req, headers=basic_headers).text
    return Response(
        json.dumps({
            "html": htm,
            "trending": trending
        }),
        content_type="application/json")


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
