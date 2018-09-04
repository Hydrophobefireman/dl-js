var next_req = true;
(() => {
    document.getElementById("name-set").onclick = e => {
        e.target.innerHTML = 'Name Changed';
        document.getElementById("download-link").download = document.getElementById("filename").value;
    }
    document.getElementById("filename").onclick = () => {
        document.getElementById("name-set").innerHTML = 'change Name'
    }
    fetch("/proxy/f/?u=" + encodeURIComponent(window.dlurl) + "&referer=" + encodeURIComponent(window.dlref), {
        "credentials": "include",
        "referrer": window.location.href,
        "referrerPolicy": "no-referrer-when-downgrade",
        "body": null,
        "method": "GET",
        "mode": "cors"
    }).then(res => res.text()).then(ret => {
        window.dl_start = performance.now();
        setTimeout(socket, 1200)
    });
})();
var analyse_perf = function (b, c) {
    var d = document.getElementById("analysed-data"),
        e = document.getElementById("dl_time"),
        f = document.getElementById("dl_speed"),
        a = (c / 1E3).toFixed(2),
        g = (b / 1048576 / a).toFixed(2);
    e.innerHTML = a;
    f.innerHTML = g;
    d.style.display = "block"
};


function socket() {
    var next_req = true;
    var websocket_url = ((window.location.protocol === 'https:') ? "wss://" : "ws://") + window.location.host + "/session/sockets/"
    var ws = new WebSocket(websocket_url);
    ws.onopen = function () {
        ws.send("init-message")
    };
    ws.onmessage = function (msg) {
        var data = JSON.parse(msg.data);
        if (data.hasOwnProperty("error")) {
            next_req = false;
        }
        if (data.hasOwnProperty("file")) {
            document.getElementById("download-link").href = data.link;
            document.getElementById("dl-button").style.display = 'block';
            next_req = false;
            document.getElementById('till-done').innerHTML = "100";
            document.getElementById("progressbtn").style.width = "100%";
            window.dl_end = performance.now() - window.dl_start;
            analyse_perf(data.total, window.dl_end);
            ws.close()

        }
        const done = parseInt(data.done);
        const total = parseInt(data.total);
        var _perc = ((done / total) * 100).toFixed(2);
        const perc = _perc <= 100 ? _perc : 100;
        document.getElementById('till-done').innerHTML = perc;
        document.getElementById("total-size-int").innerHTML = (total / (1024 * 1024)).toFixed(2);
        document.getElementById("progressbtn").style.display = 'block';
        document.getElementById("progressbtn").style.width = perc + "%";
        if (next_req) {
            setTimeout(function () {
                ws.send("status")
            }, 2000)
        }
    }
}