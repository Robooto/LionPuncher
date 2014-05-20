BasicGame.Preloader = function (game) {

    this.background = null;
    this.preloadBar = null;

    this.ready = false;

};

BasicGame.Preloader.prototype = {

    preload: function () {
        // Set stage background color
        this.game.stage.backgroundColor = '#84CBEC';
        this.preloadBar = this.add.sprite(350, 150, 'preloaderBar');

        //	This sets the preloadBar sprite as a loader sprite.
        //	What that does is automatically crop the sprite from 0 to full-width
        //	as the files below are loaded in.
        this.load.setPreloadSprite(this.preloadBar);

        //	Here we load the rest of the assets our game needs.
        /*	//	As this is just a Project Template I've not provided these assets, swap them for your own.
    // commenting this out until I create the menu
		this.load.image('titlepage', 'images/title.jpg');
		this.load.atlas('playButton', 'images/play_button.png', 'images/play_button.json');
		this.load.audio('titleMusic', ['audio/main_menu.mp3']);
		this.load.bitmapFont('caslon', 'fonts/caslon.png', 'fonts/caslon.xml');
        */
        //	+ lots of other required assets here
        this.game.load.image('lion', 'assets/lion.png'); // name , location
        this.game.load.image('ground', 'assets/ground.png');
        this.game.load.image('punch', 'assets/punch.png');
        this.game.load.image('lolly1', 'assets/lolly1.png');
        this.game.load.image('lolly2', 'assets/lolly2.png');
        this.game.load.image('lolly3', 'assets/lolly3.png');
        this.game.load.image('cloud', 'assets/cloud_3.png');
        this.game.load.spritesheet('soundicons', 'assets/soundicons.png', 48, 35); // x, y of sprite images
        this.game.load.audio('backGroundMusic', 'assets/sounds/AmE7Backing.mp3');
        this.game.load.audio('punch1', 'assets/sounds/punch1.wav');
        this.game.load.audio('punch2', 'assets/sounds/punch2.wav');
        this.game.load.audio('punch3', 'assets/sounds/punch3.mp3');
        this.game.load.audio('punchmiss', 'assets/sounds/punchmiss.wav');
        
    },

    create: function () {

        //	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
        this.preloadBar.cropEnabled = false;

    },

    update: function () {

        //	You don't actually need to do this, but I find it gives a much smoother game experience.
        //	Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
        //	You can jump right into the menu if you want and still play the music, but you'll have a few
        //	seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
        //	it's best to wait for it to decode here first, then carry on.

        //	If you don't have any music in your game then put the game.state.start line into the create function and delete
        //	the update function completely.
      
		if (this.cache.isSoundDecoded('backGroundMusic') && this.ready == false)
		{
			this.ready = true;
            this.state.start('Game');
			//this.state.start('MainMenu');
		}
      
      //  this.state.start('Game');

    }

};