var nodeAddress = "http://192.168.1.12:8080";

document.body.addEventListener('touchmove',function(e){
    e.preventDefault();
});
function AudioFile(url) {
    this.audio = document.createElement("audio");
    this.audio.src = url;

    //this.audio.controls = true;
    this.audio.preload = this.elementPreload ;

    //document.getElementById("col1").appendChild(this.audio);

}
AudioFile.prototype.playing = function(){ return !this.audio.paused; };
AudioFile.prototype.play = function(){ this.audio.play(); };
AudioFile.prototype.stop = function(){ this.pause(); this.audio.currentTime = 0; };
AudioFile.prototype.preload = function(){ this.play(); this.pause(); this.audio.currentTime = 0; };
AudioFile.prototype.goTo = function(t){ this.audio.currentTime = t; };
AudioFile.prototype.pause = function(){ this.audio.pause(); };
AudioFile.prototype.volume = function(v){ this.audio.volume = v; };
AudioFile.prototype.elementPreload = "none";


function pad(url, col, title, nb){
    var posY;
    var posX;
    var el = document.createElement("div");
    this.el = el;
    el.innerHTML = title + "<div class=jstatus></div><div class=jtotal></div>";
    document.getElementById("col" + col).appendChild(el);
    if(url != "blank"){
        var file = new AudioFile(url);
        el.className = "j";
        file.audio.onloadeddata = function(){
            el.style.backgroundColor = "blue";
        };
        this.file = file;
        function timeupdate(){
            el.childNodes[1].style.width =  (file.audio.currentTime/file.audio.duration)*100 + "%";
            if(file.audio.currentTime == 0) el.childNodes[1].style.width =  "calc(100% - 24px)";

            if((file.audio.currentTime - Math.round(file.audio.currentTime)) > 0.1){
                socket.emit('time', {"nb":nb, "time":el.childNodes[1].style.width});
            }
        }
        file.audio.ontimeupdate = timeupdate;
        function trigged(e){
            el.className = "j";
            if((posY - e.pageY) < -20 || (posY - e.pageY) > 20 ) window.locked = true;
            else window.locked = false;


            if(!window.locked) {



                if(file.playing()){
                    file.stop();
                    el.style.backgroundColor = "red";
                }
                else{
                    for (var i = padn.length - 1; i >= 0; i--) {
                        if(padn[i].file.audio.currentTime && padn[i].file.playing()) padn[i].stop();
                    }
                    socket.emit('play', {"nb": nb, "time": Date.now()});
                    //file.play();

                    el.style.backgroundColor = "lightgreen";
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
                posX = e.pageX;
            }, false);
        }
        else{
            //posY = 0;
            el.addEventListener('click', trigged, false);
        }

        this.stop = function(){
            file.stop();
            el.style.backgroundColor = "red";
        }
    }
    else{
        el.className = "j blank";
    }
}

var padn = [];

function loadTrackList(tk){
    for (var i = 0; i < Object.keys(tk).length; i++) {
        padn.push(new pad(tk[i]["url"], tk[i]["c"], tk[i]["title"], i));

    };

}

function preload(){
        for (var i = 0; i < Object.keys(padn).length; i++) {
            padn[i].file.preload();
        };
}

function preloadRun(){
    preload();
    window.setTimeout(preload, 400);
    window.setTimeout(preload, 800);
    window.setTimeout(preload, 1600);
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

var tracklistUrl = "tracklists/1.json";
getTracklist(tracklistUrl);




var socket = io.connect(nodeAddress);
socket.on('play', function(r) {
    if(padn[r.nb].file.playing()) padn[r.nb].file.stop();
    else{

            padn[r.nb].file.play();
            padn[r.nb].file.currentTime = (Date.now() - r.time)/1000;
    }
});

socket.on('timer', function(r) {
    padn[r['nb']].el.childNodes[1].style.width = r['time'];
    padn[r['nb']].el.style.backgroundColor = "lightgreen";
});