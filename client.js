var padn = [];
var tracklistUrl = "./tracklist.json";


document.body.addEventListener('touchmove', function(e) {
    e.preventDefault();
});

function pad(url, col, title, nb) {
    this.nb = nb;
    this.url = url;
    this.title = title;
    this.col = col;
    this.file = undefined;

    this.el = document.createElement("div");
    this.el.innerHTML = this.title + "<div class=\"jstatus jcurrent\"></div><div class=\"jstatus jtotal\"></div>";
    this.el.className = "j";
    document.getElementById("col" + this.col).appendChild(this.el);

    if(this.url !== undefined){
        this.file = new audioManager(this.url);
        this.file.ontimechange = this.timeupdate.bind(this);
    }

    if ('ontouchstart' in document.documentElement) {
        this.el.addEventListener('touchend', this.triggered.bind(this), false);
        this.el.addEventListener('touchmove', function(e) {
            e.stopPropagation();
        }, false);
        this.el.addEventListener('touchstart', function(e) {
            this.el.className = "j jst";
            this.posY = e.pageY;
            this.posX = e.pageX;
        }.bind(this), false);
    }
    else{
        this.el.addEventListener('click', this.triggered.bind(this), false);
    }
}

pad.prototype.triggered = function(e) {
    if(!((this.posY - e.pageY) < -20 || (this.posY - e.pageY) > 20)) {
        if(this.file.playing) {
            this.file.stop();
        } else {
            audioManager.stopAll()

            this.file.play(0);
        }
    }
};

pad.prototype.timeupdate = function() {
    this.el.childNodes[1].style.width =  "calc(" + (this.file.currentTime/this.file.duration)*100 + "% - 2em)";
    if(!this.file.playing)
        this.el.childNodes[1].style.width =  "calc(100% - 24px - 2px)";
};

var xhr = new XMLHttpRequest();
xhr.open("GET", tracklistUrl, true);
xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 0) {
        var tk = JSON.parse(xhr.responseText);
        for (var i = 0; i < tk.length; i++) {
            padn.push(new pad(tk[i]["url"], tk[i]["column"], tk[i]["title"], i));
        };
    }
};
xhr.send(null);
