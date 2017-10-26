let users, timer;
let user0 = 0;
let user1 = 0;
let myWeapon = 0;
let losses = 0;
let wins = 0;
let opponentWeapon, whoAmI;
let isInitialValue = true;
let gameState = false;
let fightOver = false;

//Initialize Firebase
var config = {
    apiKey: "AIzaSyB01N1qKzTHWNSxoStjH7St3gFxPQvtHwE",
    authDomain: "hello-world-b0166.firebaseapp.com",
    databaseURL: "https://hello-world-b0166.firebaseio.com",
    projectId: "hello-world-b0166",
    storageBucket: "hello-world-b0166.appspot.com",
    messagingSenderId: "667690310878"
};

firebase.initializeApp(config);

// Get a reference to the database service
var database = firebase.database();

// //Reset the users value
// database.ref().update({
//     users: 0,
// });

database.ref().once("value", function(snapshot) {
    if(snapshot.val().playing == 1){
        kill();
    }
    if(snapshot.val().users > 2){
        database.ref().update({
            users: 0,
            playing: 0,
        });
    }

});

resetView();
resetDatabase();

//Check to see if there is two players ready to play. If there is begin the match.
database.ref().on("value", function(snapshot) {
    //Check if value is invoked immediately or if it is invoked on value change.
    if (isInitialValue) {
        isInitialValue = false;
    }
    else {
        if(snapshot.val().users == 2){
            beginMatch();
        }
    }

    //Check if both players have selecter their weapon and begin the match if they have
    if (snapshot.val().user0 !== 0 && snapshot.val().user1 !== 0) {
        findOpponentWeapon(fight);
    }
    else {
        return;
    }
});

//Reset database
function resetDatabase(){
    database.ref().update({
        user0: 0,
        user1: 0,
    });
}

//Reset view
function resetView(){
    $('.rps').html('');
    $('.outcome').html('');
    $('.play').text('Find Opponent');

    let imageRock = '<div class="col weaponR"><img src="assets/images/rock.png" class="rock w"></img>';
    let imagePaper = '<div class="col weaponP"><img src="assets/images/paper.png" class="paper w"></img>';
    let imageScissors = '<div class="col weaponS"><img src="assets/images/scissors.png" class="scissors w"></img>';

    $('.rps').append(imageRock, imagePaper, imageScissors);
    gameState = false;

    //Handle the animations for when the weapons are clicked. Also, call the fight() function.
    $('.rock').on('click', function(event) {
        if(gameState == false){
            return;
        }
        else{
            $('.rock').effect('bounce', { times: 3, distance: 16 }, 666, function() {
                $('.paper').fadeOut(333, function() {
                    $('.weaponP').remove();
                });
                $('.scissors').fadeOut(333, function() {
                    $('.weaponS').remove();
                });
            });
            checkWeapon(setWeapon, 'rock');
            gameState = false;
        }
    });

    $('.paper').on('click', function(event) {
        if(gameState == false){
            return;
        }
        else{
            $('.paper').effect('bounce', { times: 3, distance: 16 }, 666, function() {
                $('.rock').fadeOut(333, function() {
                    $('.weaponR').remove();
                });
                $('.scissors').fadeOut(333, function() {
                    $('.weaponS').remove();
                });
            });
            checkWeapon(setWeapon, 'paper');
            gameState = false;
        }
    });

    $('.scissors').on('click', function(event) {
        if(gameState == false){
            return;
        }
        else{
            $('.scissors').effect('bounce', { times: 3, distance: 16 }, 666, function() {
                $('.paper').fadeOut(333, function() {
                    $('.weaponP').remove();
                });
                $('.rock').fadeOut(333, function() {
                    $('.weaponR').remove();
                });
            });
            checkWeapon(setWeapon, 'scissors');
            gameState = false;
        }
    });
}

//Fetch the current users value from the database, increment it, and run the callback function.
function getUsers(callback){
    database.ref().once("value", function(snapshot) {
        users = snapshot.val().users;
        users++;
    });

    callback();
}

//Set the users value to current local user value.
function setUsers(){
    database.ref().update({
        users: users,
    });
}

function beginMatch(){
    gameState = true;
    $('.play').text('Opponent Found! Choose your Weapon!');

    database.ref().update({
        playing: 1,
    });
}

function checkWeapon(callback, weapon){
    database.ref().once("value", function(snapshot) {
        user0 = snapshot.val().user0;
    });

    callback(weapon);
}

function setWeapon(weapon){
    myWeapon = weapon;
    if(user0 == 0){
        whoAmI = 0;
        database.ref().update({
            user0: weapon,
        });
    }
    else{
        whoAmI = 1;
        database.ref().update({
            user1: weapon,
        });  
    }
}

function findOpponentWeapon(callback){
    if(whoAmI == 0){
        database.ref().once("value", function(snapshot) {
            opponentWeapon = snapshot.val().user1;
        });
    }
    else{
        database.ref().once("value", function(snapshot) {
            opponentWeapon = snapshot.val().user0;
        });
    }

    callback();
}

function fight(){
    let image = '<div class="col"><img src="assets/images/' + opponentWeapon + ".png" + '"class="opponent"></img></div>';
    $('.rps').append(image);

    if(myWeapon == opponentWeapon){
        $('.outcome').html('It is a tie!');
    }
    else if((myWeapon == 'rock' && opponentWeapon == 'paper') || (myWeapon == 'paper' && opponentWeapon == 'scissors') || (myWeapon == 'scissors' && opponentWeapon == 'rock')){
        $('.outcome').html('You Lose');
        losses++;
        $('.losses').html('Losses: ' + losses);
    }
    else {
        $('.outcome').html('You Win');
        wins++;
        $('.wins').html('Wins: ' + wins);
    }

    fightOver = true;
    gameState = false;
    resetDatabase();

    //Reset the users value
    database.ref().update({
        users: 0,
        playing: 0,
    });

    $('.play').text('Fight Again!');
    $('.play').attr('disabled', false);
}

//Start manipulating the firebase databse when the play button is clicked by calling getUsers.
$('.play').on('click', function(){
    database.ref().once("value", function(snapshot) {
        if(snapshot.val().playing == 1){
            kill();
        }
        updateButton();
    });

    function updateButton(){
        if(fightOver == true){
            resetView();
            fightOver = false;
        }

        $('.play').text('Searching for Opponent...');
        $('.play').attr('disabled', true);

        //Run setUsers after completing getUsers
        getUsers(setUsers);
    }
});

function kill(){
    alert('Sorry, there is a game in progress. Refresh the page!');
    $('.page').remove();
    database.ref().update({
        users: 0,
        playing: 0,
    });
}





