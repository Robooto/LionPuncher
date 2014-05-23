BasicGame.Game = function (game) {

    this.LIONS = 15; // amount of lions to loop
    this.score = 0; // starting score
    this.highScore = 0; // high score
    this.lolliesAlive = 3; // starting amount of lollies to protect
    this.spawnTimer = 1000; // 1 second
    this.punchesThrown = 0;
    this.lolliesLivedFor = 0;

};

BasicGame.Game.prototype = {

    create: function () {

        // start game flag
        this.startGame = false;

        // create cloud group
        this.clouds = this.game.add.group();
        this.game.physics.enable(this.clouds, Phaser.Physics.ARCADE);
        this.clouds.enableBody = true;
        this.clouds.createMultiple(2, 'cloud', 0);
        this.clouds.setAll('outOfBoundsKill', true);
        this.clouds.setAll('checkWorldBounds', true); // remember checkWorldBounds needs to be active for out of bounds world kill to work

        // adding background music
        this.music = this.add.audio('backGroundMusic');
        this.music.play('', 0, 0.3, true);

        // punching sounds
        this.punch1_s = this.add.audio('punch1');
        this.punch2_s = this.add.audio('punch2');
        this.punch3_s = this.add.audio('punch3');
        this.misspunch_s = this.add.audio('punchmiss');

        // adding music switch
        this.soundSwitch = this.game.add.button(725, 20, 'soundicons', this.switchSound, this);

        // spawn clouds every 3 seconds
        this.game.time.events.loop(3000, this.createClouds, this);

        // adding in scores
        this.scoreText = this.game.add.text(16, 16, 'Score: 0', {
            stroke: '#000000',
            strokeThickness: 3,
            font: '32px Arial',
            fill: '#ffffff'
        }); // x, y, string of text, style
        this.highScoreText = this.game.add.text(16, 50, 'High Score: ' + this.highScore, {
            stroke: '#000000',
            strokeThickness: 3,
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
            this.lolly = this.lollyGroup.create(330 + (40 * i), this.game.height - 18, 'lolly' + i);
            this.lolly.name = 'lolly' + i;
            this.lolly.anchor.setTo(0.5, 1); // lollies rotate from base

            // bobbing lollies to the beat 
            this.game.add.tween(this.lolly).to({
                angle: 12
            }, 390, Phaser.Easing.Linear.None).to({
                angle: -12
            }, 390, Phaser.Easing.Linear.None).loop().start();
        }

        // lolly death sounds
        this.lollydeath1_s = this.add.audio('lollydeath1');
        this.lollydeath2_s = this.add.audio('lollydeath2');

        //create lion ground and create lions
        this.lionGroup = this.game.add.group();
        this.game.physics.enable(this.lionGroup, Phaser.Physics.ARCADE);
        this.lionGroup.enableBody = true;
        this.lionGroup.createMultiple(this.LIONS, 'lion', 0); // number, key, (optional frame), (optional exists)
        this.lionGroup.setAll('outOfBoundsKill', true);
        this.lionGroup.setAll('checkWorldBounds', true); // remember checkWoldBounds needs to be active for outofboundskill to work

        // creating a timer
        this.lionTimer = 0;

        // create intropanel
        this.createPanel();

        // Add fist
        this.punch = this.game.add.sprite(this.game.world.width / 2, this.game.world.height / 2 - 100, 'punch');
        this.punch.anchor.setTo(.5, .5);
        this.punch.scale.x = -1; // making the fist display in the correct direction
        this.game.physics.enable(this.punch, Phaser.Physics.ARCADE); // this is the way to enable physics 
        this.punch.body.allowRotation = false; // let Physics do the rotation

    },

    update: function () {

        // Start spawning lions when play is pressed
        if (this.startGame) {
            // spawn lions starting at 1 per second
            if (this.game.time.now > this.lionTimer) {
                this.lionTimer = this.game.time.now + this.spawnTimer
                this.createNewLion();
            }
        }


        // delay pointer event by 20ms
        if (this.game.input.activePointer.justPressed(20)) {

            this.missedLion = true; // missed punch flag
            
            // add tween to simulate punch feedback
            this.game.add.tween(this.punch.scale).to({
                x: -.4,
                y: 1.4
            }, 100, Phaser.Easing.Linear.None).to({
                x: -1,
                y: 1
            }, 100, Phaser.Easing.Linear.None).start();

            // Kill lions within 90 pixels of the punch
            this.lionGroup.forEachAlive(function (lion) { // grab alive lions
                // if the lioin is within 90 pixels destroy it!
                if (this.game.math.distance(
                    this.punch.x, this.punch.y,
                    lion.x, lion.y) < 90) {
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
                    this.game.rnd.pick([this.punch1_s, this.punch2_s, this.punch3_s]).play();

                    this.updateScore(10);  // add 10 to score

                    this.punchesThrown++; //add 1 to punches thrown


                }

            }, this);

            // play missed sound when no lion is hit
            if (this.missedLion) {
                this.misspunch_s.play();
            }
        }

        // move to Pointer handles the rotation and the acceleration to cursor
        this.punch.rotation = this.game.physics.arcade.moveToPointer(this.punch, 200, this.game.input.activePointer, 80);

        this.game.physics.arcade.collide(this.lionGroup, this.lollyGroup, this.hitLolly, null, this); // checking for collision with our lions and the lollys.  If lollys do overlap then call hitLolly


    },
    createPanel: function () {
        // add intropanel
        this.intropanel = this.game.add.group();
        this.intropanel.create(200, 15, 'panel');
        this.startGameButton = this.game.add.button(310, 145, 'playbutton', this.playGame, this, 1, 0, 2); // x, y, key, action, notsure, over,out, down frames
        this.panelTitle = this.game.add.text(310, 20, 'Lion Puncher', {
            font: '32px Arial',
            fill: '#ffffff'
        });
        this.panelInfo1 = this.game.add.text(330, 70, 'Punch Lions!', {
            font: '24px Arial',
            fill: '#555555'
        });
        this.panelInfo2 = this.game.add.text(295, 105, 'Keep the Lollies Safe!', {
            font: '24px Arial',
            fill: '#555555'
        });
        this.intropanel.add(this.startGameButton);
        this.intropanel.add(this.panelTitle);
        this.intropanel.add(this.panelInfo1);
        this.intropanel.add(this.panelInfo2);

        if (this.gameOver) {
            this.panelTitle.text = 'Game Over';
            this.panelInfo1.x = 230; // moved info text over since it is longer now

            // using time method to calculate time since game started till game over
            this.panelInfo1.text = 'Lollies survived for: ' + this.game.math.floor(this.game.time.elapsedSecondsSince(this.lolliesLivedFor)) + ' seconds';
            this.panelInfo2.text = 'Lions Punched: ' + this.punchesThrown;
        }

    },

    playGame: function () {
        this.intropanel.destroy();  // remove panel
        this.startGame = true; // start Game
        this.punchesThrown = 0;  // reset punch counter
        this.lolliesLivedFor = this.game.time.now; // reset lolly life timer
    },

    // add score and adjust the spawn timer
    updateScore: function (addScore) {
        this.score += addScore; // update the score when each lion is hit
        this.scoreText.text = 'Score: ' + this.score;

        // lions spawn faster as score increases 
        if (this.score === 70) {
            this.spawnTimer = 700;
        } else if (this.score === 150) {
            this.spawnTimer = 600;
        } else if (this.score === 300) {
            this.spawnTimer = 550;
        } else if (this.score === 500) {
            this.spawnTimer = 500;
        } else if (this.score === 600) {
            this.spawnTimer = 450;
        } else if (this.score === 900) {
            this.spawnTimer = 100;
        }

        // add tween to score when it is higher than highscore
        if (this.score > this.highScore) {
            this.game.add.tween(this.scoreText.scale).to({
                x: 1,
                y: 1
            }, 100, Phaser.Easing.Linear.None).to({
                x: 1.1,
                y: 1.1
            }, 500, Phaser.Easing.Linear.None).start();
        }


    },

    // creating lions
    createNewLion: function () {
        var lion = this.lionGroup.getFirstDead(); // Recycle a dead lion

        // switching lions on the left or right side of screen
        if (lion) {
            lion.reset(this.game.rnd.pick([900, -100]), this.game.height - 68); // Position on ground
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
            if (lion.x > 400) {
                lion.body.velocity.x = this.game.rnd.integerInRange(-100, -500); // Move left
                lion.scale.x = 1;
            } else {
                lion.body.velocity.x = this.game.rnd.integerInRange(100, 500); // Move right
                lion.scale.x = -1;
            }
            lion.rotation = 0; // Reset rotation
            lion.anchor.setTo(0.5, 0.5); // Center texture
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
        lolly.kill();
        lion.kill();

        // lolly death sound
        this.game.rnd.pick([this.lollydeath1_s, this.lollydeath2_s]).play();
        this.createDeadLolly(0, lolly);
        this.createDeadLolly(1, lolly);
        this.createDeadLolly(2, lolly);
        this.createDeadLolly(3, lolly);


        this.lolliesAlive--;

        // game ends when lollies are gone
        if (this.lolliesAlive === 0) {
            this.quitGame();
        }
    },

    // create lolly dead pieces
    createDeadLolly: function (frame, lolly) {

        // use the correct dead lolly image
        if (lolly.name === 'lolly1') {
            this.deadLolly = 'deadlolly1';
        } else if (lolly.name === 'lolly2') {
            this.deadLolly = 'deadlolly2';
        } else {
            this.deadLolly = 'deadlolly3';
        }
        lollypart = this.game.add.sprite(lolly.x, lolly.y, this.deadLolly, frame);
        this.game.physics.enable(lollypart, Phaser.Physics.ARCADE);
        lollypart.angle = this.game.rnd.integerInRange(0, 360);
        lollypart.body.velocity.x = this.game.rnd.integerInRange(-120, 120);
        lollypart.body.velocity.y = this.game.rnd.integerInRange(-700, -800);
        lollypart.body.acceleration.y = 3000;
        this.game.add.tween(lollypart).to({
            alpha: 0
        }, 800, Phaser.Easing.Exponential.In, true).onComplete.add(function () {
            this.kill();
        }, lollypart);


    },

    // turning music on or off
    switchSound: function () {
        if (this.soundSwitch.frame === 0) {
            this.soundSwitch.frame = 1;
            this.music.pause();
        } else {
            this.soundSwitch.frame = 0;
            this.music.resume();
        }
    },

    quitGame: function (pointer) {
        // update highscore at the end of the game
        if (this.score > this.highScore) {
            this.highScore = this.score
        }

        //	Reset score, stop music, and start the game over
        this.score = 0;
        this.lolliesAlive = 3;
        this.spawnTimer = 1000;
        this.gameOver = true;
        this.state.start('Game');
        this.music.stop();

    },

    render: function () {
        // adding debug info
        // this.game.debug.spriteInfo(this.punch, 32, 32);
    }



};