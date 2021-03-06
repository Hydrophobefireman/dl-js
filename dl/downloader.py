import sys
import shutil
from threading import Thread as _Parallel_impl
from time import time
from .report import Report, to_screen
from os.path import isfile, realpath, basename, join
from os import remove

from .util import make_range_sizes, safe_getsize, force_round, to_MB
from ._cache import get_cached_file, make_cached_file, get_cachedir
from .URL import URL, UA_d, basic_headers


class Downloader(object):
    """the downloader class"""

    is_resumable: bool = False
    start_time: int = 0
    did_resume: bool = False
    report: bool = True
    _continued_size: int = 0

    def _make_file(self):
        """internal method that combines all the 
           temporary files into the final file
        """
        if self._downloaded_size != self.filesize:
            raise Exception(
                f"Downloaded filesize ({to_MB(self._downloaded_size)})  does not match expected size of {to_MB(self.filesize)} MB"
            )
        c = self.threads
        with open(self.save_path, "wb") as wfd:
            for i in range(c):
                f = get_cachedir(f"{self.filename}.part.{i}")
                with open(f, "rb") as fd:
                    shutil.copyfileobj(fd, wfd, 1024 * 1024 * 10)
                remove(f)
        remove(get_cachedir(f"{self._meta_file_name}.data.json"))

    def _progress_callback(self, size, speed, perc):
        """progress messages"""
        to_screen(
            f"\rSize: {to_MB(size)} MB Downloaded: {perc}% -- Speed: {speed} MB/s  "
        )
        sys.stdout.flush()

    @property
    def _elapsed_time(self):
        return time() - self.start_time

    @property
    def _downloaded_size(self,):
        return sum(
            safe_getsize(get_cachedir(f"{self.filename}.part.{i}"))
            for i in range(self.threads)
        )

    def __init__(
        self,
        url,
        ua=UA_d,
        f=None,
        d=None,
        intermediate_fn: str = None,
        is_cli: bool = False,
        t: int = 3,
    ):
        self.__thread_count = t or 3
        self.url = URL(url)
        self.url.follow_redirects()
        self.user_agent = ua
        self.is_cli = is_cli
        self.report = Report(is_cli)
        self.report.report_init()
        self.filesize = self.url.file_size
        self.is_resumable = (
            self.url._m_headers.get("accept-ranges", "").lower() == "bytes"
            and self.filesize
        )
        self._meta_file_name = self.url.get_filesafe_url()
        self.filename = intermediate_fn or self._meta_file_name
        save_path = f or (self.url.get_suggested_filename() or self.filename)
        self.save_path = join(d, basename(save_path)) if d else realpath(save_path)
        if isfile(self.save_path):
            raise Exception(f"Filename:{self.save_path} already exists")
        print(f"Filesize: {to_MB(self.filesize)} MB")

    def _generate_init_headers(self, thread_count: int):
        req = []
        previous_range = 0
        range_headers = make_range_sizes(self.filesize, thread_count)
        for i in range_headers:
            req.append(
                {
                    "range": i["range"],
                    "from": i["from"],
                    "to": i["to"],
                    "file_index": previous_range,
                    "file_size": i["size"],
                }
            )
            previous_range += 1
        reqs = {"headers": basic_headers, "filename": self.filename, "reqs": req}
        make_cached_file(self._meta_file_name, reqs)
        return reqs

    def _download_handler(self, h, file, idx):
        n = get_cachedir(f"{file}.part.{idx}")
        with open(n, "ab") as f:
            with self.url.fetch(headers=h, stream=True, refetch=True) as r:
                for c in r.iter_content(chunk_size=2048):
                    if c:
                        f.write(c)
                    if self.report:
                        elapsed = self._elapsed_time
                        size = self._downloaded_size
                        perc = force_round((size / self.filesize) * 100, 2)
                        speed = force_round(
                            ((size - self._continued_size) / (1024 * 1024)) / elapsed, 2
                        )
                        self._progress_callback(size, speed, perc)

    def _simple_fetch(self):
        to_screen("Only reporting size downloaded\n")
        with open(self.save_path, "wb") as f:
            with self.url.fetch(headers=basic_headers, stream=True, refetch=True) as r:
                for c in r.iter_content(chunk_size=2048):
                    if c:
                        f.write(c)
                        self._progress_callback(safe_getsize(self.save_path), 0, 0)

    def _spawn_downloaders(self, h: dict):
        hdr = h["headers"]
        fn = h["filename"]
        th = []
        reqs = h["reqs"]
        for i in reqs:
            th.append(
                _Parallel_impl(
                    target=self._download_handler,
                    args=({**hdr, "range": i["range"]}, fn, i["file_index"]),
                )
            )
        try:
            for i in th:
                i.start()
            for i in th:
                i.join()
            self._is_completed = True
        except:
            pass

    def _alter_headers(self, data: dict):
        """change headers  fot continued downloads"""
        headers = data["headers"]
        previous_file = data["filename"]
        ranges = data["reqs"]
        ret = []
        self.threads = len(ranges)
        to_screen("Continuing File Download\n")
        for i in ranges:
            idx = i["file_index"]
            size = i["file_size"]
            completed = safe_getsize(get_cachedir(f"{previous_file}.part.{idx}"))
            self._continued_size += completed
            if completed >= size:
                to_screen("skipping")
                continue
            to_screen(
                f"Chunk number: {idx} \n completed : {to_MB(completed)} of {to_MB(size)} MB\n"
            )
            ret.append(
                {"range": f"bytes={i['from']+completed}-{i['to']}", "file_index": idx}
            )

        return {"headers": headers, "filename": previous_file, "reqs": ret}

    def start(self, thread_count=None):
        self.start_time = time()
        self.threads = thread_count or self.__thread_count
        if self.is_resumable:
            headers_to_fetch = get_cached_file(self._meta_file_name)
            if headers_to_fetch:
                self._spawn_downloaders(self._alter_headers(headers_to_fetch))
            else:
                self._spawn_downloaders(self._generate_init_headers(self.threads))
            self._make_file()
        else:
            to_screen(f"Server at {self.url.host} does not support multi threading\n")
            self._simple_fetch()
