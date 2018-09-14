const namests = document.getElementById("namesh_3");
namests.addEventListener("click", () => {
    filenames = document.getElementById("value-f").value;
    namests.innerText = "filename Changed";
    document.getElementById("dl_links").download = filenames;
});
const invs = document.getElementById("value-f");
invs.addEventListener("click", () => {
    namests.innerText = "Change Name";

})
prbr = document.getElementById("dds_pgbr");
const el = document.getElementById("div_");
document.body.appendChild(el);
const evtSource = new EventSource(`/stream/f/cache?u=${encodeURIComponent(window.dlurl)}`);
evtSource.addEventListener("message", e => {
    if (e.data.includes("/send-cache")) {
        const btn_ = document.getElementById("download_link");
        btn_.innerText = "Click Here To Download the file";
        btn_.style.display = "block";
        document.getElementById("dl_links").href = e.data
        evtSource.close();
    } else if (e.data.includes("ffmpeg")) {
        el.innerHTML = "Converting";
        prbr.style.display = "block";
        prbr.style.width = "100%";
        document.getElementById("ffmpeg-alert").innerHTML = "Converting the video";
    } else if (e.data.includes("Converting")) {
        document.getElementById("ffmpeg-alert").innerHTML = e.data
    } else {
        el.innerHTML = `${e.data}% Completed`;
        prbr.style.display = "block";
        prbr.style.width = `${e.data}%`;
    }
}, false);
evtSource.onerror = () => {
    evtSource.close();
    alert("Downloading Failed");
}