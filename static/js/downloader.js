let next_req = !0;
(() => {
  (document.getElementById("name-set").onclick = e => {
    (e.target.innerHTML = "Name Changed"),
      (document.getElementById(
        "download-link"
      ).download = document.getElementById("filename").value);
  }),
    (document.getElementById("filename").onclick = () => {
      document.getElementById("name-set").innerHTML = "change Name";
    });
  const e = new XMLHttpRequest();
  e.open(
    "GET",
    `/proxy/f/?u=${encodeURIComponent(
      window.dlurl
    )}&referer=${encodeURIComponent(window.dlref)}`
  ),
    e.send(),
    (e.onload = () => {
      (window.dl_start = performance.now()), setTimeout(check_download, 1200);
    });
})();
const analyse_perf = (e, n) => {
    const t = document.getElementById("analysed-data"),
      d = document.getElementById("dl_time"),
      o = document.getElementById("dl_speed"),
      l = (n / 1e3).toFixed(2),
      a = (e / 1048576 / l).toFixed(2);
    (d.innerHTML = l), (o.innerHTML = a), (t.style.display = "block");
  },
  check_download = () => {
    const e = new XMLHttpRequest();
    e.open("GET", "/session/_/progress-poll/", !0),
      (e.onload = () => {
        (data = JSON.parse(e.response)),
          data.hasOwnProperty("error") && (next_req = !1),
          data.hasOwnProperty("file") &&
            ((document.getElementById("download-link").href = data.link),
            (document.getElementById("dl-button").style.display = "block"),
            (next_req = !1),
            (document.getElementById("till-done").innerHTML = "100"),
            (document.getElementById("progressbtn").style.width = "100%"),
            (window.dl_end = performance.now() - window.dl_start),
            analyse_perf(data.total, window.dl_end));
        const n = parseInt(data.done),
          t = parseInt(data.total),
          d = ((n / t) * 100).toFixed(2),
          o = d <= 100 ? d : 100;
        (document.getElementById("till-done").innerHTML = o),
          (document.getElementById("total-size-int").innerHTML = (
            t / 1048576
          ).toFixed(2)),
          (document.getElementById("progressbtn").style.display = "block"),
          (document.getElementById("progressbtn").style.width = `${o}%`);
      }),
      (e.onerror = () => {
        next_req = !1;
      }),
      next_req && (e.send(), setTimeout(check_download, 3e3));
  };
