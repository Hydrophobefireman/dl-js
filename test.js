phantom.onError = function(msg, trace) {
    var msgStack = ['PHANTOM ERROR: ' + msg];
    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line +
                (t.function ? ' (in function ' + t.function+')' : ''));
        });
    }
    console.error(msgStack.join('\n'));
    phantom.exit(1);
};
var page = require('webpage').create();
var fs = require('fs');
var read = { mode: 'r', charset: 'utf-8' };
var write = { mode: 'w', charset: 'utf-8' };
JSON.parse(fs.read("/tmp/tmpbdrzogpw", read)).forEach(function(x) {
    phantom.addCookie(x);
});
page.settings.resourceTimeout = 10000;
page.settings.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36";
page.onLoadStarted = function() {
    page.evaluate(function() {
        delete window._phantom;
        delete window.callPhantom;
    });
};
var saveAndExit = function() {
    fs.write("/tmp/tmp2lpc7e57", page.content, write);
    fs.write("/tmp/tmpbdrzogpw", JSON.stringify(phantom.cookies), write);
    phantom.exit();
};
page.onLoadFinished = function(status) {
    if (page.url === "") {
        page.setContent(fs.read("/tmp/tmp2lpc7e57", read), "https://openload.co/embed/Iti01Cu2tHw/");
    } else {
        saveAndExit();
    }
};
page.open("");