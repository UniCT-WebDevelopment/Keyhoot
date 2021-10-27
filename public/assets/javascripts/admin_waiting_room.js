//questo è il .js dell'admin che sta aspettando che gli utenti si colleghino al pin
var socket = io();//uguale a io.connect(). Quando non si passa alcun parametro si fa una richiesta al server(.js) connettendosi al "window.parameter" cioè l'url della pag html attuale...guarda "io([url][, options])" su https://socket.io/docs/v4/client-api/#socket. Ovviamente viene intercettato nel server.js da socket.on('connection'...)
//var socket = io({ transports: ['websocket'], upgrade: false });
const urlParams = new URLSearchParams((window.location.search).substring(1)); //prendiamo dall'url la querystring, in questo caso l'id del quiz che l'admin ha creato e startato in quiz_create.js, e lo trasformiamo in un oggetto. https://stackoverflow.com/questions/8648892/how-to-convert-url-parameters-to-a-javascript-object
const parametro = Object.fromEntries(urlParams); // {abc: "foo", def: "[asf]", xyz: "5"} */

//permette di intercettare il logout da un tab differente del browser: l'utente allora verrà sloggato anche in questo tab
window.addEventListener('storage', function (event) {
    if (event.key === 'logout') {
        console.log('logged out from storage!');
        window.location.href = "/";
    }
});

//Quando l'admin si connette al server tramite l'io() sopra
socket.on('connect', function () {

    //Dice al server che è una connessione dell'admin
    socket.emit('admin_waiting', parametro);//parametro è l'id (DB) del quiz che l'admin sta startando
});

//Dice al server di far partire il gioco se l'admin ha premuto il bottone "Inizia quiz"
function inizio_quiz() {
    socket.emit('inizio_quiz');
}
function chiudi_stanza() {
    //window.location.href = "/";
    window.location.href = "/admin/choose/";
}

socket.on('mostra_Pin', function (data) {
    document.getElementById('pin_view').innerHTML = data.pin;
});

//Aggiorna il nome dei giocatori a schermo
socket.on('update_user_room', function (data) {


    var lista = document.getElementById('lista_giocatori');

    if (data.length == 0) {
        document.getElementById('container_wait').style.display = "flex";
        lista.style.display = "none";
    }
    else {
        document.getElementById('container_wait').style.display = "none";
        lista.style.display = "grid";
        lista.innerHTML = "";
        var giocatore;
        for (var i = 0; i < data.length; i++) {
            giocatore = document.createElement("div");
            giocatore.setAttribute('class', 'giocatore');
            giocatore.innerHTML = data[i].name;
            lista.appendChild(giocatore);
        }
    }

});

//Una volta che il server ha avviato il gioco..
socket.on('quiz_avviato', function (id) {//id è l'id dell'admin che ha creato il gioco che stiamo startando!
    console.log('Quiz avviato!');
    window.location.href = "/admin/game_view/" + "?id=" + id;//viene sostituito il path dopo l'indirizzo del server
});

socket.on('no_quiz_found', function () {
    window.location.href = '../../';//torna alla pagina iniziale se trova qualche problema
});

