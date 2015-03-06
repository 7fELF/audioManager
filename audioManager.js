/*
 Preloading policies
+----------------------------------+
|              | none | all | auto |
+--------------+------+-----+------+
| audioElement |  X   |     |   X  |
+--------------+------+-----+------+
| WebAudioAPI  |  X   |  X  |      |
+--------------+------+-----+------+

Select technology
+---------------------+
+ tech | description  |
+---------------------+
|  1   | audioElement |
+---------------------+
|  2   | WebAudioAPI  |
+------------------------------------------------+
|  3   |  audioElement / WebAudioAPI as Failback |       
+------------------------------------------------+
|  4   |  WebAudioAPI / audioElement as Failback |
+------------------------------------------------+
*/

;var audioManager = (function() {
    /* For iOS */
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    /* Check Web Browser Capabilities */
    var WebAudioAPISupport = window.AudioContext ? true : false;
    var AudioElementSupport = window.HTMLAudioElement ? true : false;
    if (WebAudioAPISupport) var audioContext = new AudioContext();


    /**
     * Gestionnaire de son utilisant l'element <audio>
     * @constructor
     * @param {string} url - Url of the audio file.
     * @param {bool} Default false (true on iDevice), Use audio element instead WebAudioAPI
     */
    function audioElementManager(url) {
        this.constructor.allInstances.push(this);

        /**
         * set properties from constructor parameters
         */
        this.url = url;
        this.AudioElement = null;


        /**
         * status vars
         */
        this.playing = false;
        this.ready = false;
        this.playOnLoad = false;
        this.elementPreload = "none";

        /**
         * timing vars
         */
        this.startTime = 0;

        this.timeInterval = null;

        this.duration = null;

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
     * Variable to store all instanceof audioElementManager
     * @type {Array}
     */
    audioElementManager.allInstances = [];
    audioElementManager.audioContext = audioContext;

    /**
     * Stop playing on all instances
     * @type {void}
     */
    audioElementManager.stopAll = function() {
        for (var i = audioElementManager.allInstances.length - 1; i >= 0; i--) {
            audioElementManager.allInstances[i].stop();
        }
    };

    /**
     * stops playback
     * @return {int} currentTime
     */
    audioElementManager.prototype.stop = function() {
        if (!this.playing) return this.currentTime;
        this.AudioElement.pause();
        this.playing = false;
        return this.currentTime;
    };

    /**
     * Load an audio file from url
     * @param {string} url
     */
    audioElementManager.prototype.load = function(url) {
        this.AudioElement = document.createElement("audio");
        this.AudioElement.src = url;
        this.AudioElement.preload = this.elementPreload;

        this.AudioElement.ondurationchange = function() {
            this.duration = this.AudioElement.duration;
        }.bind(this);


        this.AudioElement.oncanplaythrough = function() {
            this.duration = this.AudioElement.duration;
        }.bind(this);

        this.AudioElement.onplay = function() {

        };
        this.AudioElement.onplaying = function() {
            this.currentTime = this.startTime;
        };

    };


    /**
     * Lis le buffer
     * @param  {int} time position du curseur
     */
    audioElementManager.prototype.play = function(time) {
        time = (time === undefined) ? 0 : time;
        if (!this.playing) {

            this.AudioElement.play();
            this.startTime = time;

            this.timeInterval = window.setInterval(function() {
                this.ontimechange(this.currentTime);
                if (!this.playing) clearInterval(this.timeInterval);
            }.bind(this), 500);

            this.playing = true;



            this.AudioElement.onended = function() {
                this.onend();
                this.playing = false;
            }.bind(this);
            return true;
        } else {

            return false;
        }
    };

    Object.defineProperty(audioElementManager.prototype, "currentTime", {
        get: function() {
            return this.AudioElement.currentTime;
        },
        set: function(e) {
            this.AudioElement.currentTime = e;
        }
    });

    function audioManager(url, tech) {
        if (typeof tech === "boolean" && tech) this.audio = new WebAudioAPIManager(url);
        else if (typeof tech === "boolean" && !tech) this.audio = new WebAudioAPIManager(url);
        else if (typeof tech === "object") this.audio = tech;
        else if (typeof tech === "function") this.audio = new tech(url);
        else{
        	this.audio = new audioElementManager(url);
        }
    }

    audioManager.prototype.play = function() {
    	this.audio.play();
    };


    return audioElementManager;
})();


audioContext = audioManager.audioContext;