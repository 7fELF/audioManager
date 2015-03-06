var nodeAddress = "http://localhost:8080";
var padn = [];
var tracklistUrl = "tracklists/1.json";


document.body.addEventListener('touchmove',function(e){
    e.preventDefault();
});

function AudioFile(url) {
    this.audio = document.createElement("audio");
    this.audio.src = url;
    this.audio.preload = this.elementPreload ;
}
AudioFile.prototype.playing = function(){ return !this.audio.paused; };
AudioFile.prototype.play = function(){ this.audio.play(); };
AudioFile.prototype.stop = function(){ this.pause(); this.audio.currentTime = 0; };
AudioFile.prototype.goTo = function(t){ this.audio.currentTime = t; };
AudioFile.prototype.pause = function(){ this.audio.pause(); };
AudioFile.prototype.volume = function(v){ this.audio.volume = v; };
AudioFile.prototype.elementPreload = "none";


function pad(url, col, title, nb){
    this.nb = nb;
    this.url = url;
    this.title = title;
    this.col = col;
    this.file = undefined;

    this.createElement();
    if(this.url !== undefined) this.initAudio();

    if ('ontouchstart' in document.documentElement) {
        this.el.addEventListener('touchend', this.trigged.bind(this), false);
        this.el.addEventListener('touchmove', function(e){
            e.stopPropagation();
        }, false);
        this.el.addEventListener('touchstart', function(e){
            this.el.className = "j jst";
            this.posY = e.pageY;
            this.posX = e.pageX;
        }.bind(this), false);
    }
    else{
        this.el.addEventListener('click', this.trigged.bind(this), false);
    }
}
// padn[11].file.AudioElement.currentTime = 221.20254166666666;
pad.prototype.trigged = function(e){
    if((this.posY - e.pageY) < -20 || (this.posY - e.pageY) > 20 ) window.locked = true;
    else window.locked = false;

    if(!window.locked) {
        socket.emit('play', {"nb": this.nb, "time": Date.now()});
        if(this.file.playing){
            this.stop();
        }
        else{
            for (var i = padn.length - 1; i >= 0; i--) {
                if(padn[i].file.playing) padn[i].stop();
            }

            this.file.play(0);
            this.el.style.backgroundColor = "#113F59";
        }
    }
    window.locked = false;
};
pad.prototype.timeupdate = function(){
    this.el.childNodes[1].style.width =  (this.file.currentTime/this.file.duration)*100 + "%";
    if(this.file.currentTime == 0) this.el.childNodes[1].style.width =  "calc(100% - 24px)";
    console.log(this.file.currentTime);
    if((this.file.currentTime - Math.round(this.file.currentTime)) > 0.1){
        socket.emit('time', {"nb":this.nb, "time":this.el.childNodes[1].style.width});
    }
};
pad.prototype.stop = function(){
    this.file.stop();
    this.el.style.backgroundColor = "#19BEC0";
};
pad.prototype.createElement = function(){
    this.el = document.createElement("div");
    this.el.innerHTML = this.title + "<div class=jstatus></div><div class=jtotal></div>";
    this.el.className = "j";
    document.getElementById("col" + this.col).appendChild(this.el);
};
pad.prototype.initAudio = function(){
    this.file = new audioManager(this.url);
    this.file.ready = function(){
        //this.el.style.backgroundColor = "#113F59";
    }.bind(this);

    this.file.ontimechange = this.timeupdate.bind(this);
};

function loadTrackList(tk){
    for (var i = 0; i < Object.keys(tk).length; i++) {
        padn.push(new pad(tk[i]["url"], tk[i]["c"], tk[i]["title"], i));
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

getTracklist(tracklistUrl);



/**
 * Socket.io
 */
var socket = io.connect(nodeAddress);
socket.on('play', function(r) {
    console.log('Play command from socket.io', r);
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


