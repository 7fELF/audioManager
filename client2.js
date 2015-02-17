document.body.addEventListener('touchmove',function(e){
    e.preventDefault();
});

var nodeServer = "192.168.1.12:8080";

/**
 * Pad
 * @param url
 * @param col
 * @param title
 * @param nb
 */
function pad(url, col, title, nb){
    var posY;
    var el = document.createElement("div");
    this.el = el;
    this.url = url;
    this.title = title;
    el.innerHTML = title + "<div class=jstatus></div><div class=jtotal></div>";
    document.getElementById("col" + col).appendChild(el);
    if(url != "blank"){
        var file = new audioManager(url);
        el.className = "j";

        this.file = file;
        file.ontimechange = function(time) {
            if (file.source != null){
                el.childNodes[1].style.width = "calc(" + (time/ file.source.buffer.duration) * 100 + "% - 24px)";
                if (file.currentTime == 0) el.childNodes[1].style.width = "calc(100% - 24px)";

                if ((time - Math.round(time)) > 0.1) {
                    socket.emit('time', {"nb": nb, "time": el.childNodes[1].style.width});
                }
            }
        }

        file.onready = function(){
            el.style.backgroundColor = "#113F59";
        }

        function trigged(e){
            el.className = "j";
            if((posY - e.pageY) < -20 || (posY - e.pageY) > 20 ) window.locked = true;

            if(!window.locked){
                if(file.playing){
                    file.stop();
                    el.style.backgroundColor = "#2C82C9";
                }
                else{
                    audioManager.stopAll();
                    file.play(0);

                    socket.emit('play', {"nb":nb, "time":Date.now()});

                    el.style.backgroundColor = "#D54F58";
                }
            }
            window.locked = false;
        }
        if ('ontouchstart' in document.documentElement) {
            el.addEventListener('touchend', trigged, false);
            el.addEventListener('touchmove', function(e){
                e.stopPropagation();
            }, false);
            el.addEventListener('touchstart', function(e){
                el.className = "j jst";
                posY = e.pageY;
            }, false);
        }
        else{
            el.addEventListener('click', trigged, false);
        }

        this.stop = function(){
            this.file.stop();
            if(this.file.ready) el.style.backgroundColor = "#113F59";
        }
    }
    else{
        el.className = "j blank";
    }
}


pad.prototype.destroy = function(){
    this.el.parentElement.removeChild(this.el);
}
var padn = [];

function loadTrackList(tk){
    for (var i = 0; i <= Object.keys(tk).length - 1; i++) {
        if(padn[i] == undefined)
            padn.push(new pad(tk[i]["url"], tk[i]["c"], tk[i]["title"], i));
        else if(tk[i]["url"] != padn[i].url|| tk[i]["title"] != padn[i].title ){
            padn[i].destroy();
            padn[i] = undefined;
            padn[i] = new pad(tk[i]["url"], tk[i]["c"], tk[i]["title"], i);
        }
    };

};

function preload(){
        for (var i = 0; i <= Object.keys(padn).length - 1; i++) {
            padn[i].file.preload();
        };

}

function getTracklist(url){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url + "?q=" + Date.now(), true);
    xhr.onreadystatechange = function () {
        if (xhr.status == 404) {
            xhr.abort();
        }
        else if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 0) {
            loadTrackList(JSON.parse(xhr.responseText));
        }
    };
    xhr.send(null);
}

var tracklistUrl = "tracklists/3.json";
getTracklist(tracklistUrl);


var socket = io.connect('http://' + nodeServer);
socket.on('play', function(r) {
    if(padn[r.nb].file.playing) padn[r.nb].file.stop();
    else {
        padn[r.nb].file.latencyStartTime = r.time;
        padn[r.nb].file.play(0);
    }
});
socket.on('timer', function(r) {
    padn[r['nb']].el.childNodes[1].style.width = r['time'];
    padn[r['nb']].el.style.backgroundColor = "lightgreen";
});

