var namests = document.getElementById("namesh_3");
namests.addEventListener("click", function () {
    var filenames = document.getElementById("value-f").value;
    namests.innerText = "filename Changed";
    document.getElementById("dl_links").download = filenames;
});
var invs = document.getElementById("value-f");
invs.addEventListener("click", function () {
    namests.innerText = "Change Name";

})
var prbr = document.getElementById("dds_pgbr");
var el = document.getElementById("div_");
document.body.appendChild(el);
const evtSource = new EventSource("/stream/f/cache?u=" + encodeURIComponent(window.dlurl));
evtSource.addEventListener("message", function (e) {
    if (e.data.indexOf("/send-cache") > -1) {
        var btn_ = document.getElementById("download_link");
        btn_.innerText = "Click Here To Download the file";
        btn_.style.display = "block";
        document.getElementById("dl_links").href = e.data
        evtSource.close();
    } else if (e.data.indexOf("ffmpeg") > -1) {
        el.innerHTML = "Converting";
        prbr.style.display = "block";
        prbr.style.width = "100%";
        document.getElementById("ffmpeg-alert").innerHTML = "Converting the video";
    } else if (e.data.indexOf("Converting") > -1) {
        document.getElementById("ffmpeg-alert").innerHTML = e.data
    } else {
        el.innerHTML = e.data + "% Completed";
        prbr.style.display = "block";
        prbr.style.width = e.data + "%";
    }
}, false);
evtSource.onerror = function () {
    evtSource.close();
    alert("Downloading Failed");
}