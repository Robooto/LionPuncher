BasicGame.Game = function (game) {

    //	When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game; //	a reference to the currently running game
    this.add; //	used to add sprites, text, groups, etc
    this.camera; //	a reference to the game camera
    this.cache; //	the game cache
    this.input; //	the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
    this.load; //	for preloading assets
    this.math; //	lots of useful common math operations
    this.sound; //	the sound manager - add a sound, play one, set-up markers, etc
    this.stage; //	the game stage
    this.time; //	the clock
    this.tweens; //  the tween manager
    this.state; //	the state manager
    this.world; //	the game world
    this.particles; //	the particle manager
    this.physics; //	the physics manager
    this.rnd; //	the repeatable random number generator

    //	You can use any of these from any function within this State.
    //	But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

    this.LIONS = 15; // amount of lions to loop
    this.score = 0; // starting score
    this.highScore = 0; // high score
    this.lolliesAlive = 3; // starting amount of lollies to protect
    this.spawnTimer = 1000;  // 1 second

};

BasicGame.Game.prototype = {

    create: function () {
        
                // create cloud group
        this.clouds = this.game.add.group();
        this.game.physics.enable(this.clouds, Phaser.Physics.ARCADE);
        this.clouds.enableBody = true;
        this.clouds.createMultiple(2, 'cloud', 0);
        this.clouds.setAll('outOfBoundsKill', true);
        this.clouds.setAll('checkWorldBounds', true); // remember checkWoldBounds needs to be active for out of bounds world kill to work

        // adding background music
        this.music = this.add.audio('backGroundMusic');
        this.music.play();

        // punching sounds
        this.punch1_s = this.add.audio('punch1');
        this.punch2_s = this.add.audio('punch2');
        this.punch3_s = this.add.audio('punch3');
        this.misspunch_s = this.add.audio('punchmiss');
        
        // adding music switch
        this.soundSwitch = this.game.add.button( 725, 20, 'soundicons', this.switchSound, this);

        // spawn clouds every 3 seconds
        this.game.time.events.loop(3000, this.createClouds, this);

        // adding in scores
        this.scoreText = this.game.add.text(16, 16, 'Score: 0', {
            font: '32px Arial',
            fill: '#ffffff'
        }); // x, y, string of text, style
        this.highScoreText = this.game.add.text(16, 50, 'High Score: ' + this.highScore, {
            font: '32px Arial',
            fill: '#ffffff'
        }); // high score

        // create the ground
        this.ground = this.game.add.sprite(0, this.game.world.height - 22, 'ground');
        this.ground.scale.setTo(2, 1); // scale ground

        // create lolly group
        this.lollyGroup = this.game.add.group();
        this.game.physics.enable(this.lollyGroup, Phaser.Physics.ARCADE);
        this.lollyGroup.enableBody = true;



        // create our 3 lollies
        for (var i = 1; i < 4; i++) {
            this.lolly = this.lollyGroup.create(340 + (40 * i), this.game.height - 18, 'lolly' + i);
            this.lolly.name = 'lolly' + i;
            this.lolly.anchor.setTo(0.5, 1); // lollies rotate from base

            // adding rotation to lollies 
            this.game.add.tween(this.lolly).to({
                angle: 9
            }, 600, Phaser.Easing.Linear.None).to({
                angle: -9
            }, 600, Phaser.Easing.Linear.None).loop().start();
        }

        //create some lions
        this.lionGroup = this.game.add.group();
        this.game.physics.enable(this.lionGroup, Phaser.Physics.ARCADE);
        this.lionGroup.enableBody = true;
        this.lionGroup.createMultiple(this.LIONS, 'lion', 0); // number, key, (optional frame), (optional exists)
        // creating a timer
        this.lionTimer = 0;

        // Add in a punch!
        this.punch = this.game.add.sprite(this.game.world.width / 2, this.game.world.height / 2 - 100, 'punch');
        this.punch.anchor.setTo(0.5, 0.5);
        this.punch.scale.x = -1; // making the fist display in the correct direction
        this.game.physics.enable(this.punch, Phaser.Physics.ARCADE); // this is the way to enable physics DON't do the other way you were doing it
        this.punch.enableBody = true; // 

    },

    update: function () {

        // Spawn some lions
        this.lionTimer -= this.game.time.elapsed;
        if (this.lionTimer <= 0) {
            this.lionTimer = this.game.rnd.integerInRange(150, this.spawnTimer); // random  between .15 and 1 sec
            this.createNewLion();
        }

        if (this.game.input.activePointer.justPressed(20)) {

            this.missedLion = true;
            // punching tween
            this.game.add.tween(this.punch).to({
                x: '-25'
            }, 100, Phaser.Easing.Linear.None).start();
            this.game.add.tween(this.punch.scale).to({
                x: -.8,
                y: 1.2
            }, 100, Phaser.Easing.Linear.None).to({
                x: -1,
                y: 1
            }, 100, Phaser.Easing.Linear.None).start();

            // Kill lions within 64 pixels of the punch
            this.lionGroup.forEachAlive(function (lion) { // grab alive lions
                // if the lioin is within 64 pixels destroy it!
                if (this.game.math.distance(
                    this.game.input.activePointer.x, this.game.input.activePointer.y,
                    lion.x, lion.y) < 64) {
                    lion.body.checkCollision = {
                        up: false,
                        down: false,
                        left: false,
                        right: false
                    }; // stop checking for collisions when punched
                    lion.body.velocity.y = this.game.rnd.integerInRange(-600, -1200);
                    lion.body.velocity.x = this.game.rnd.integerInRange(-500, 500);
                    lion.body.acceleration.y = 3000;
                    lion.angle = 270;

                    this.missedLion = false; // toggle missed flag

                    // select a random punch sound to play
                    this.punchsound = this.game.rnd.pick([this.punch1_s, this.punch2_s, this.punch3_s]);
                    this.punchsound.play(); // punch sound

                    this.score += 10; // update the score when each lion is hit
                    this.scoreText.text = 'Score: ' + this.score;

                }

            }, this);

            // play missed sound when no lion is hit
            if (this.missedLion) {
                this.misspunch_s.play();
            }
        }

        // angelTopointer calclates the angle between two points
        this.punch.rotation = this.game.physics.arcade.angleToPointer(this.punch);

        // fist will be attached to the pointer
        this.punch.x = this.game.input.activePointer.x - 1;
        this.punch.y = this.game.input.activePointer.y;

        this.game.physics.arcade.collide(this.lionGroup, this.lollyGroup, this.hitLolly, null, this); // checking for collision with our lions and the lollys.  If lollys do overlap then call hitLolly
        
        // spawn lions faster after 400 points
        if ( this.score > 400 ) {
            this.spawnTimer = 750;
        }
        else if ( this.score > 600 ) {
            this.spawnTimer = 550;
        }

    },

    // creating lions
    createNewLion: function () {
        var lion = this.lionGroup.getFirstDead(); // Recycle a dead lion

        var leftOrRight = this.game.rnd.pick([900, -100]); // switching lions on the left or right side of screen
        if (lion) {
            lion.reset(leftOrRight, this.game.height - 68); // Position on ground
            lion.revive(); // Set "alive"
            lion.body.checkCollision = {
                up: true,
                down: true,
                left: true,
                right: true
            }; // since we are recycling we need to set collisions up again
            lion.body.velocity.setTo(0, 0); // Stop moving
            lion.body.acceleration.setTo(0, 0); // Stop accelerating

            // If lion spawns on left move left if right move right
            if (leftOrRight === 900) {
                lion.body.velocity.x = this.game.rnd.integerInRange(-100, -500); // Move left
                lion.scale.x = 1;
            } else {
                lion.body.velocity.x = this.game.rnd.integerInRange(100, 500); // Move right
                lion.scale.x = -1;
            }
            lion.rotation = 0; // Reset rotation
            lion.anchor.setTo(0.5, 0.5); // Center texture
            lion.outOfBoundsKill = true; // kills when they leave the screen if we are checking that
            lion.checkWorldBounds = true; // checking bounds so we can kill
        }

    },

    // creating clouds
    createClouds: function () {

        // grab a dead cloud
        var cloud = this.clouds.getFirstDead();

        if (cloud) {
            cloud.reset(this.game.rnd.pick([800, 0]), this.game.rnd.integerInRange(5, 60));
            cloud.revive(); // need to revive the sprite because it is currently dead

            // if cloud spawns on the right side of th screen move left else move right
            if (cloud.x > 400) {
                cloud.body.velocity.x = this.game.rnd.integerInRange(-20, -60); // Move left
                cloud.scale.x = 1;
            } else {
                cloud.body.velocity.x = this.game.rnd.integerInRange(20, 60); // Move right
                cloud.scale.x = -1;
            }
        }
    },

    // interaction between lion and lolly
    hitLolly: function (lion, lolly) {
        console.log(lolly.name);
        lolly.kill();
        lion.kill();
        this.lolliesAlive--;

        // game ends when lollies are gone
        if (this.lolliesAlive === 0) {
            //        this.quitGame();
        }
    },
    
    // turning music on or off
    switchSound: function () {
       if (this.soundSwitch.frame == 0) {
            this.soundSwitch.frame = 1;
            this.music.pause();
        }
        else {
            this.soundSwitch.frame = 0;
            this.music.resume();
        } 
    },

    quitGame: function (pointer) {
        // update highscore at the end of the game
        if (this.score > this.highScore) {
            this.highScore = this.score
        }

        //	Here you should destroy anything you no longer need.
        //	Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //	Then let's go back to the main menu.
        this.score = 0;
        this.lolliesAlive = 3;
        this.spawnTimer = 1000;
        this.state.start('Game');

    },

    render: function () {
        // adding debug info
        // this.game.debug.spriteInfo(this.punch, 32, 32);
    }



};