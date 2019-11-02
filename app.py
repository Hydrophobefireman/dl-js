import base64
import hashlib
import html
import json
import os
import random
import re
import secrets
import shutil
import subprocess
import threading
import time
import urllib.request
import uuid
from urllib.parse import quote, unquote, urlencode, urlparse

import requests
from bs4 import BeautifulSoup as bs
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
from dl.URL import URL
import apIo
import file_dl
import get_domains
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
    url = URL(request.url)
    host = url.host
    urlstr = str(url)
    if (
        request.endpoint in app.view_functions
        and urlstr.startswith("http://")
        and not request.is_secure
        and (
            all(x not in host for x in ["127.0.0.1", "localhost"])
            or "herokuapp" in host
        )
    ):
        url.proto = "https"
        return redirect(str(url), code=301)


@app.route("/", strict_slashes=False)
def index():
    return html_minify(render_template("index.html"))


@app.route("/video/", strict_slashes=False)
def video():
    u = request.args.get("url")
    if u is None:
        return redirect("/", code=302)
    url_obj = URL(u)
    url = str(url_obj)
    data = streamsites.check_for_stream_sites(url, request.headers.get("User-Agent"))
    if data:
        return html_minify(
            render_template("multioptions.html", urls=data, url=url, number_=len(data))
        )
    return html_minify(render_template("video.html", url=url))


@app.route("/videos/fetch/", methods=["POST"])
def get_video():
    try:
        _url = URL(request.form["url"])
        url = URL(check_for_redirects(_url))
    except:
        return json.dumps({"error": "An error occured..please check the url"})
    func_name, url = get_funcname(url)
    if not func_name:
        response = make_response(json.dumps({"error": "not supported"}))
    else:
        page = url.fetch(headers=basic_headers)
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
                    {"html": page.text, "funcname": func_name, "landing_url": str(url)}
                )
            )
    response.headers["Content-Type"] = "application/json"
    return response


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
    session["acc-range"] = req_data.get("accept-ranges", "").lower() == "bytes"
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
    return html_minify(render_template("send_blob.html", url=url, ref=ref))


@app.route("/proxy/f/")
def send_files():
    print("*************\n", request.headers, "*************\n")
    url = unquote(request.args.get("u"))
    referer = request.args.get("referer")
    acc_range = session["acc-range"]
    print("Downloading:'" + url[:50] + "...'")
    _filename = secrets.token_urlsafe(15)
    _mime = _mime_types_.get(session.get("content-type")) or ".bin"
    session["filename"] = _filename + _mime
    thread = threading.Thread(
        target=threaded_req,
        args=(url, referer, session["filename"], acc_range, session["filesize"]),
    )
    thread.start()
    time.sleep(2)
    return "OK"


def threaded_req(url, referer, filename, acc_range, fs):
    print("filename:", filename)
    if not os.path.isdir(SAVE_DIR):
        os.mkdir(SAVE_DIR)
    parsed_url = urlparse(url)
    #    file_location = os.path.join(SAVE_DIR, filename)
    dl_headers = {**basic_headers, "host": parsed_url.netloc, "referer": referer}

    # So apparently you cant set headers in urlretrieve.....brilliant
    file_dl.prepare_req(
        url,
        has_headers=True,
        range=acc_range,
        filename=filename,
        filesize=fs,
        headers=dl_headers,
    )
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
        curr_size = file_dl.get_size(file_location, session["acc-range"], filesize)
    except:
        return json.dumps({"error": "file-deleted-from our-storages"})
    if curr_size >= filesize:
        session.pop("filename")
        session.pop("filesize")
        dl_url = "/get-cached/x/?" + urlencode({"f": quote(filename)})
        return json.dumps(
            {"file": True, "link": dl_url, "done": curr_size, "total": filesize}
        )
    else:
        return json.dumps({"done": curr_size, "total": filesize})


def check(regex, url):
    return re.search(regex, url, re.IGNORECASE) is not None


def get_funcname(url):
    host = url.host
    for obj in get_domains.domains:
        if check(obj.get("re"), host):
            new_url = URL(str(url).replace("/f/", "/embed/"))
            if host != "youtube":
                new_url = URL(str(new_url).replace("/watch/", "/embed"))
            return obj.get("domain"), new_url


@app.errorhandler(404)
def page_error(e):
    return (html_minify(render_template("404.html"))), 404


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
