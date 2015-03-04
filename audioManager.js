;var audioManager = (function(){

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    if(window.AudioContext) var audioContext = new AudioContext();
    else alert("WebAudio API doesn't work on this Web Browser");

    if(window.HTMLAudioElement){}
    else alert("Audio Element doesn't work on this Web Browser");

window.gainNode = audioContext.createGain();
window.gainNode.connect(audioContext.destination);

/**
 * Gestionnaire de son utilisant AudioContext
 * @constructor
 * @param {string} url - Url of the audio file.
 * @param {bool} Default false (true on iDevice), Use audio element instead WebAudioAPI
 */
function audioManager(url, UseAudioElement) {
    this.constructor.allInstances.push(this);

    /**
     * settings vars
     */
    this.url = url;

    /*
        If userAgent is an iDevice and UseAudioElement is not defined in params, use audio element

     */
    this.UseAudioElement = (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );
    this.UseAudioElement = !(UseAudioElement == undefined) ? UseAudioElement : this.UseAudioElement;

    /**
     * audio vars
     */
    this.source = null;
    this.buffer = null;
    this.AudioElement = null;
    this.latencyStartTime = false;


    /**
     * status vars
     */
    this.playing = false;
    this.ready = false;
    this.playOnLoad = false;

    /**
     * timing vars
     */
    this.startTime = 0;
    this.currentTime = 0;
    this.timeInterval = null;

    /**
     * Evenement quand le temps en cours change
     * @event
     * @param {float} time
     */
    this.ontimechange = function(time) {};

    /**
     * Evenement quand le fichier est pret à etre lu.
     * @event
     */
    this.onready = function() {};

    /**
     * Evenement quand le fichier est lu entierement.
     * @event
     */
    this.onend = function() {};


    /* Charge le fichier si l'url est envoyée au constructeur */
    if (url !== undefined) this.load(this.url);

}


/**
 * Variable to store all instanceof audioManager
 * @type {Array}
 */
audioManager.allInstances = [];

audioManager.audioContext = audioContext;

/**
* Stop playing on all instances
* @type {void}
*/
audioManager.stopAll = function(){
    for (var i = audioManager.allInstances.length - 1; i >= 0; i--) {
        audioManager.allInstances[i].stop();
    }
};

/**
 * stops playback
 * @return {int} currentTime
 */
audioManager.prototype.stop = function() {
    if(!this.playing) return this.currentTime;
    this.source.stop();
    this.source.disconnect();
    this.playing = false;
    return this.currentTime;
};

/**
 * Load an audio file from url
 * @param {string} url
 */
audioManager.prototype.load = function(url) {
    //return true; //test
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
        this.loadBuffer(request.response);
    }.bind(this);
    request.send();
};


/**
 * Decode un ArrayBuffer
 * @param buffer
 * @return boolean
 */
audioManager.prototype.loadBuffer = function(buffer) {
    if (buffer instanceof ArrayBuffer) {
        audioContext.decodeAudioData(buffer, function(buffer) {
            this.buffer = buffer;
            this.ready = true;
            this.onready();
            if(this.playOnLoad) this.play();
            return true;
        }.bind(this));
    } else if (buffer instanceof AudioBuffer) {
        this.buffer = buffer;
        this.ready = true;
        this.onready();
        return true;
    } else {
        console.error("Buffer needs to be an ArrayBuffer or AudioBuffer");
        return false;
    }
};


/**
 * Lis le buffer
 * @param  {int} time position du curseur
 */
audioManager.prototype.play = function(time) {
    time = (time === undefined) ? 0 : time;
    if (this.ready) {
        if (!this.playing || this.UseAudioElement) {
            this.startTime = audioContext.currentTime - time;

            this.timeInterval = window.setInterval(function() {
                this.currentTime = audioContext.currentTime - this.startTime;
                this.ontimechange(this.currentTime);
                if (!this.playing) clearInterval(this.timeInterval);
            }.bind(this), 500);

            this.source = audioContext.createBufferSource();
            this.source.buffer = this.buffer;
            this.source.connect(window.gainNode);
            if(Date.now()<this.latencyStartTime) this.latencyStartTime = false;
            if(this.latencyStartTime) time =+ (Date.now() - this.latencyStartTime)/1000;
            this.source.start(0, time, this.source.buffer.duration);


            this.playing = true;
            this.source.onended = function() {
                this.onend();
                this.playing = false;
            }.bind(this);
            return true;
        } else {

            return false;
        }
    }
    else {
        this.playOnLoad = !this.playOnLoad;
    }
};
/*
audioManager.prototype.loadBuffer = function(){
    this.audio = document.createElement("audio");
    this.audio.src = this.url;
    this.audio.preload = "none";
    this.ready = true;
};*/
    return audioManager;
})();








audioContext = audioManager.audioContext;