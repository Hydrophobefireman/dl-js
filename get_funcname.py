import re
from dl.URL import URL


def openload_fixer(u: URL) -> URL:
    u.path = u.path.replace("/f/", "/embed/")
    return u


def yourupload_fixer(u: URL) -> URL:
    u.path.replace("/watch/", "/embed/")
    return u


matcher = {
    "keeload": {"pattern": r"^(www\.)?keeload\.com$"},
    "megadrive": {"pattern": r"^(www\.)?megadrive\.com$"},
    "openload": {
        "pattern": r"openload\.(co|io|link|pw)|oload\.(tv|stream|site|xyz|win|download|cloud|cc|icu|fun|club|info|pw|live|space|services)|oladblock\.(?:services|xyz|me)|openloed\.co",
        "fixer": openload_fixer,
    },
    "estream": {"pattern": r"^(www\.)?estream\.com$"},
    "yourupload": {"pattern": r"^(www\.)?yourupload\.com$", "fixer": yourupload_fixer},
    "watcheng": {"pattern": r"^(www\.)?watcheng\.com$"},
    "instagram": {"pattern": r"^(www\.)?instagr(\.am|am\.com)$"},
    "vidzi": {"pattern": r"^(www\.)?vidzi\.(tv|cc|si|nu)$"},
    "rapidvideo": {"pattern": r"^(www\.)?rapidvideo\.com$"},
    "youtube": {"pattern": r"^(www\.)?youtu(\.be|be\.com)$"},
    "streamango": {
        "pattern": r"^(www\.)?(streamango\.com|fruithosts\.net|streamcherry\.com)$",
        "fixer": openload_fixer,
    },
}


def get_funcname(u):
    url = URL(u)
    host = url.host
    for k, v in matcher.items():
        if re.search(v["pattern"], host):
            fixer = v.get("fixer")
            return (k, str(url)) if fixer is None else (k, str(fixer(url)))
    return [False, None]
