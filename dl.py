import re
working_sites = [
    'dailymotion', 'estream', 'googledrive',
    'googlephotos', 'ggpht', 'googleplus',
    'instagram', 'megadrive', 'rapidvideo',
    'vidzi', 'vimeo', 'watcheng', 'yourupload', 'youtu'
]


def urlcheck(url):
    # if re.search(r"^(https?:)?//plus\.google\.com/", url, re.IGNORECASE) is not None:
    #   return True, googleplus.gplus TODO
    if re.search(r"^(https?:)?//.*\.?megadrive\.", url, re.IGNORECASE) is not None:
        return True, megadrive.megadrive
    if re.search(r"^(https?:)?//.*\.?((docs|drive)\.google.com)|video\.google\.com", url, re.IGNORECASE) is not None:
        return True, googledrive.drive
    if re.search(r"^(https?:)?//.*\.?(photos\.google|photos\.app\.goo\.gl)", url, re.IGNORECASE) is not None:
        return True, googlephotos.ggpht
    if re.search(r"^(https?:)?//.*\.?estream", url, re.IGNORECASE) is not None:
        return True, estream.estream
    if re.search(r"^(https?:)?//.*\.?vidzi\.", url, re.IGNORECASE) is not None:
        return True, vidzi.vidzi
    elif re.search(r"^(https?:)?//.*\.?yourupload\.", url, re.IGNORECASE) is not None:
        return True, yourupload.yourupload
    elif re.search(r"^(https?:)?//.*\.?dailymotion\.", url, re.IGNORECASE) is not None:
        return True, dailymotion.daily
    elif re.search(r"^(https?:)?//.*\.?watcheng\.", url, re.IGNORECASE) is not None:
        return True, watcheng.watcheng
    elif re.search(r"^(https?:)?//.*\.?instag\.?ram\.?", url) is not None:
        return True, instagram.instag
    elif re.search(r"^(https?:)?//.*\.?rapidvideo\.", url, re.IGNORECASE) is not None:
        return True, rapidvideo.rapid_sh
    elif re.search(r"^(https?:)?//.*\.?vimeo\.", url, re.IGNORECASE) is not None:
        return True, vimeo.vimeo
    elif re.search(r"^(https?:)?//.*?\.?(youtube\.|youtu\.be|yt\.be)", url) is not None:
        return True, youtube.youtube
    else:
        return False, None
