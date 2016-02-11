;var audioManager = (function() {

    /**
     * Audio manager unsing HTML5 <audio> element
     * @constructor
     * @param {string} url - Url of the audio file.
     * @param {bool} Default false (true on iDevice), Use audio element instead WebAudioAPI
     */
    function audioElementManager(url) {
        console.log(this);
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

        /**
         * config vars
         */
        this.preload = "none";

        /**
         * timing vars
         */
        this.startTime = 0;
        this.timeInterval = null;
        this.duration = null;

        /**
         * Event ontimechange
         * @event when time change.
         * @param {float} time
         */
        this.ontimechange = function(time) {};

        /**
         * Event onend
         * @event when the file is completly played
         */
        this.onend = function() {};

        /* Load file if the url is sent to the constructor */
        if (url !== undefined) this.load(this.url);
    }

    /**
     * Main audio context
     * @type {AudioContext}
     */
    audioElementManager.context = new AudioContext();

    /**
     * Speaker audio node (context destination)
     * @type {AudioDestinationNode}
     */
    audioElementManager.speakers = audioElementManager.context.destination;

    /**
     * Variable to store all instanceof audioElementManager
     * @type {Array}
     */
    audioElementManager.allInstances = [];

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
        this.AudioElement.preload = this.preload;

        this.AudioElement.ondurationchange = function() {
            this.duration = this.AudioElement.duration;
        }.bind(this);

        this.AudioElement.oncanplaythrough = function() {
            this.duration = this.AudioElement.duration;
        }.bind(this);

        this.AudioElement.onplay = function() {
        }.bind(this);

        this.AudioElement.onplaying = function() {
            console.log(this.currentTime);
        }.bind(this);
    };


    /**
     * Lis le buffer
     * @param  {int} time position du curseur
     */
    audioElementManager.prototype.play = function(time) {
        if (!this.playing) {
            time = (time == undefined) ? 0 : time;
            this.currentTime = time;
            this.AudioElement.play();

            this.AudioElement.ontimeupdate = function() {
                this.ontimechange(this.currentTime);
            }.bind(this);

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

    return audioElementManager;
})();
