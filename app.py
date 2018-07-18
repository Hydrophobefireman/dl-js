import json
import re

import requests
from flask import (Flask, Response, make_response, redirect, render_template,
                   request, send_file, session)
from htmlmin.minify import html_minify

app = Flask(__name__)
ua = "Mozilla/5.0 (Windows; U; Windows NT 10.0; en-US)\
 AppleWebKit/604.1.38 (KHTML, like Gecko) Chrome/68.0.3325.162"
app.secret_key = "7bf9a280"
basic_headers = {
    "User-Agent": ua,
    "Upgrade-Insecure-Requests": "1",
    "dnt": '1',
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8"
}


@app.route("/", strict_slashes=False)
def index():
    return html_minify(render_template("index.html"))


@app.route("/video/", strict_slashes=False)
def video():
    url = request.args.get("url")
    if url is None:
        return redirect("/", code=302)
    return render_template("video.html", url=url)


@app.errorhandler(404)
def page_error(e):
    return html_minify(render_template('404.html')), 404


@app.route("/search/", strict_slashes=False)
def search():
    q = request.args.get("q")
    if q is None:
        q = "  "
    return render_template("search.html", q=q)


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
