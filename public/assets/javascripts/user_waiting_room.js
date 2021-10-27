//questa è la room dei giocatori
var socket = io();
//var socket = io({ transports: ['websocket'], upgrade: false });

//Quando un giocatore si connette al server
socket.on('connect', function () {//cattura il sending dell'"app.use(express.static(Publicpath))" del server

    const urlParams = new URLSearchParams((window.location.search).substring(1));//Prende lo username e il gamepin passato nella pagina principale dal giocatore, alla pressione del bottone "Join".
    const parametri = Object.fromEntries(urlParams);
    var footer = document.getElementById('footer');
    footer.innerHTML = "";
    footer.innerHTML = parametri['name'];
    //Dice al server che questa è la connessione di un giocatore e gli passa username e pin
    socket.emit('user_enter', parametri);
});

//Quando l'admin fa partire il gioco allora i giocatori vengono inviati alla user/game/index.html
socket.on('user_quiz_avviato', function () {
    window.location.href = "/user/game/" + "?id=" + socket.id;
});

//Nel caso in cui lo username usato da un giocatore fosse uguale a quello di un altro giocatore nella stanza
socket.on('change_username', function () {
    alert("Lo Username inserito è già presente..provane un altro!");
    window.location.href = '../../';
});

//Il giocatore che prova ad accedere alla "stanza" viene fatto tornare alla pagina principale se il pin non corrisponde ad alcun game avviato
socket.on('no_quiz_found', function () {
    window.location.href = '../../';
});

//Se l'admin si disconnette, il giocatore viene fatto tornare alla pagina principale.
socket.on('disconnessione_admin', function () {
    window.location.href = '../../';
});


