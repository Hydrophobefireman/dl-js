import re
working_sites = [
    'dailymotion', 'estream', 'googledrive',
    'googlephotos', 'ggpht', 'googleplus',
    'instagram', 'megadrive', 'rapidvideo',
    'vidzi', 'vimeo', 'watcheng', 'yourupload', 'youtu'
]


def urlcheck(url):
    # if re.search(r"^(https?:)?//plus\.google\.com/", url, re.IGNORECASE) is not None:
    #   return True,True, googleplus.gplus TODO
    if re.search(r"^(https?:)?//.*\.?megadrive\.", url, re.IGNORECASE) is not None:
        return True, True
    if re.search(r"^(https?:)?//.*\.?((docs|drive)\.google.com)|video\.google\.com", url, re.IGNORECASE) is not None:
        return True, True
    if re.search(r"^(https?:)?//.*\.?(photos\.google|photos\.app\.goo\.gl)", url, re.IGNORECASE) is not None:
        return True, True
    if re.search(r"^(https?:)?//.*\.?estream", url, re.IGNORECASE) is not None:
        return True, True
    if re.search(r"^(https?:)?//.*\.?vidzi\.", url, re.IGNORECASE) is not None:
        return True, True
    elif re.search(r"^(https?:)?//.*\.?yourupload\.", url, re.IGNORECASE) is not None:
        return True, True
    elif re.search(r"^(https?:)?//.*\.?dailymotion\.", url, re.IGNORECASE) is not None:
        return True, True
    elif re.search(r"^(https?:)?//.*\.?watcheng\.", url, re.IGNORECASE) is not None:
        return True, True
    elif re.search(r"^(https?:)?//.*\.?instag\.?ram\.?", url) is not None:
        return True, True
    elif re.search(r"^(https?:)?//.*\.?rapidvideo\.", url, re.IGNORECASE) is not None:
        return True, True
    elif re.search(r"^(https?:)?//.*\.?vimeo\.", url, re.IGNORECASE) is not None:
        return True, True
    elif re.search(r"^(https?:)?//.*?\.?(youtube\.|youtu\.be|yt\.be)", url) is not None:
        return True, True
    else:
        return False, None
