document.getElementById("name-set").onclick = function() {
    this.innerHTML = 'Name Changed';
    document.getElementById("download-link").download = document.getElementById("filename").value;
}
document.getElementById("filename").onclick = function() {
    document.getElementById("name-set").innerHTML = 'change Name'
}
var xhr = new XMLHttpRequest();
xhr.open("GET", "/proxy/f/?u=" + encodeURIComponent(window.dlurl) + "&referer=" + encodeURIComponent(window.dlref));
xhr.send();
xhr.onload = function() {
    setTimeout(check_download, 1000)
}
var next_req = true

function check_download() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/session/_/progress-poll/", true);
    xhr.onload = function() {
        data = JSON.parse(xhr.response);
        if (data.hasOwnProperty("error")) {
            next_req = false;
        }
        if (data.hasOwnProperty("file")) {
            document.getElementById("download-link").href = data.link;
            document.getElementById("dl-button").style.display = 'block';
            next_req = false;
            document.getElementById('till-done').innerHTML = "100";
            document.getElementById("progressbtn").style.width = "100%";

        } else {
            var done = parseInt(data.done);
            var total = parseInt(data.total);
            var perc = ((done / total) * 100).toFixed(2);
            document.getElementById('till-done').innerHTML = perc;
            document.getElementById("total-size-int").innerHTML = (total / (1024 * 1024)).toFixed(2);
            document.getElementById("progressbtn").style.display = 'block';
            document.getElementById("progressbtn").style.width = perc + "%";
        }
    }
    if (next_req) {
        xhr.send();
        setTimeout(check_download, 3000);
    }
}