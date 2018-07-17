import requests
from flask import (Flask, Response, make_response, redirect, render_template,
                   request, send_file, session)
from htmlmin.minify import html_minify
import ytsearch
app = Flask(__name__)
USER_AGENT = "Mozilla/5.0 (Windows; U; Windows NT 10.0; en-US)\
 AppleWebKit/604.1.38 (KHTML, like Gecko) Chrome/68.0.3325.162"
app.secret_key = "7bf9a280"


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
    data = ytsearch.yt_search(q)
    return Response(data, content_type="application/json")


if __name__ == '__main__':
    app.run(debug=True)
