var socket = io();
//var socket = io({ transports: ['websocket'], upgrade: false });
var risposta_effettuata = false;
var risposta_corretta = false;

const urlParams = new URLSearchParams((window.location.search).substring(1));//ottieme l'id dall'url e poi Object.fromEntries (sotto) lo trasforma in un oggetto...https://stackoverflow.com/questions/8648892/how-to-convert-url-parameters-to-a-javascript-object
const parametro = Object.fromEntries(urlParams);

socket.on('connect', function () {
    //Dice al server che lo user sta entrando nella game_view
    socket.emit('user_enter_game', parametro);
    document.title = "connesso|Keyhoot"; //keyhoot | nomequiz
    document.getElementById('risposta1').style.visibility = "visible";
    document.getElementById('risposta2').style.visibility = "visible";
    document.getElementById('risposta3').style.visibility = "visible";
    document.getElementById('risposta4').style.visibility = "visible";
});

function sottometti_risposta(num) {
    if (risposta_effettuata == false) {

        risposta_effettuata = true;

        socket.emit('risposta_giocatore', num);//Invia le risposte del giocatore al server

        //Fa scomparire i bottoni per la risposta (una volta data)
        document.getElementById('risposta1').style.visibility = "hidden";
        document.getElementById('risposta2').style.visibility = "hidden";
        document.getElementById('risposta3').style.visibility = "hidden";
        document.getElementById('risposta4').style.visibility = "hidden";
        document.getElementById('info').style.display = "block";
        document.getElementById('info').innerHTML = "Risposta inviata! In attesa degli altri giocatori...";
        document.getElementById('loader').style.display = "block";
        document.body.style.backgroundColor = "rgb(64, 26, 137)";
        document.body.style.color = "white";

    }
}

socket.on('dati_giocatore', function (giocatori) {//giocatori = array di tutti i giocatori che sono iscritti al quiz (live)
    for (var i = 0; i < giocatori.length; i++) {
        if (giocatori[i].gamerId == socket.id) {
            document.getElementById('nome').innerHTML = "Nome: " + giocatori[i].name;
            document.getElementById('punteggio').innerHTML = "Punteggio: " + giocatori[i].quiz_inside_info.punteggio;
        }
    }
});

//Prende i risultati, cioè se l'ultima risposta data è corretta o meno
socket.on('esito_risposta', function (bool) {//se la risposta è corretta, allora impostiamo risposta_corretta = true...servirà per indicare al giocatore se ha dato o meno la risposta corretta, allo scadere del tempo!
    if (bool == true) {
        risposta_corretta = true;
    }
});


socket.on('conclusione_domanda', function (giocatori) {
    document.getElementById('loader').style.display = "none";
    document.getElementById('info').style.display = "none";
    document.getElementById('statistiche').style.display = "none";
    document.body.style.backgroundColor = "rgb(64, 26, 137)";
    var c_name = document.getElementById('container_nome');
    c_name.style.display = "block";
    const questo_giocatore = giocatori.filter(giocatore => giocatore.gamerId == socket.id);
    c_name.innerHTML = questo_giocatore[0].name;
    document.getElementById('container_info').style.display = "flex";
    //var punteggio_attuale = 0;
    if (risposta_corretta == true) {
        /*document.body.style.backgroundColor = "rgb(69, 135, 41)";
        document.getElementById('info').style.display = "block";
        document.getElementById('info').innerHTML = "Corretto!";*/
        document.getElementById('info_result').innerHTML = "Corretto!";
        document.getElementById('img_result').src = "../../assets/img/corretto.png";
        //il punteggio parziale lo mettiamo più avanti, su socket.on("nuovo_punteggio"), perchè il punteggio sin qua passato è privo della percentuale maggiorata dovuta al tempo che il giocatore c'ha messo a rispondere.
        /*punteggio_attuale += parseInt(document.getElementById('punteggio').innerHTML.match(/(\d+)/));//estrapoliamo il numero dalla stringa "Punteggio: numero"... https://www.geeksforgeeks.org/extract-a-number-from-a-string-using-javascript/
        console.log("punteggio_attuale " + punteggio_attuale);
        var punteggio_nuovo = questo_giocatore[0].quiz_inside_info.punteggio;
        var parziale = (+punteggio_nuovo) - (+punteggio_attuale);
        document.getElementById('punteggio_parziale').innerHTML = '+' + parziale;*/
    } else {
        /*document.body.style.backgroundColor = "rgb(208, 53, 66)";
        document.getElementById('info').style.display = "block";
        document.getElementById('info').innerHTML = "Sbagliato!";*/
        document.getElementById('info_result').innerHTML = "Sbagliato!";
        document.getElementById('img_result').src = "../../assets/img/sbagliato.png";
        document.getElementById('punteggio_parziale').innerHTML = 'Occhio alla prossima..';
    }
    document.getElementById('risposta1').style.visibility = "hidden";
    document.getElementById('risposta2').style.visibility = "hidden";
    document.getElementById('risposta3').style.visibility = "hidden";
    document.getElementById('risposta4').style.visibility = "hidden";
    socket.emit('ottieni_punteggio');
});

socket.on('nuovo_punteggio', function (punteggio) {//punteggio = gamer.quiz_inside_info.punteggio
    var punteggio_attuale = 0;
    if (risposta_corretta == true) { //se il giocatore ha risposto correttamente, aggiorniamo l'indicatore del punteggio parziale a conclusione di ciascuna domanda.
        var punteggio_nuovo = punteggio;
        punteggio_attuale += parseInt(document.getElementById('punteggio').innerHTML.match(/(\d+)/));
        var parziale = (+punteggio_nuovo) - (+punteggio_attuale);
        document.getElementById('punteggio_parziale').innerHTML = '+' + parziale;
    }
    document.getElementById('punteggio').innerHTML = "Punteggio: " + punteggio;

});

socket.on('gamer_next_question', function () {
    document.getElementById('container_nome').style.display = "none";
    document.getElementById('statistiche').style.display = "block";
    document.getElementById('container_info').style.display = "none";
    risposta_corretta = false;
    risposta_effettuata = false;
    document.body.style.color = "black";
    document.getElementById('risposta1').style.visibility = "visible";
    document.getElementById('risposta2').style.visibility = "visible";
    document.getElementById('risposta3').style.visibility = "visible";
    document.getElementById('risposta4').style.visibility = "visible";
    document.getElementById('info').style.display = "none";
    document.body.style.backgroundColor = "white";

});


socket.on('GameOver', function (podio) {
    /*document.getElementById('container_nome').style.display = "none";
    document.getElementById('statistiche').style.display = "block";
    document.getElementById('container_info').style.display = "none";
    document.body.style.backgroundColor = "#FFFFFF";
    document.body.style.color = "black";
    document.getElementById('risposta1').style.visibility = "hidden";
    document.getElementById('risposta2').style.visibility = "hidden";
    document.getElementById('risposta3').style.visibility = "hidden";
    document.getElementById('risposta4').style.visibility = "hidden";
    document.getElementById('info').style.display = "block";
    document.getElementById('info').innerHTML = "GAME OVER";*/
    document.getElementById('risposta1').style.visibility = "hidden";
    document.getElementById('risposta2').style.visibility = "hidden";
    document.getElementById('risposta3').style.visibility = "hidden";
    document.getElementById('risposta4').style.visibility = "hidden";
    document.getElementById('info').style.display = "none";
    document.getElementById('statistiche').style.display = "none";
    document.body.style.backgroundColor = "rgb(126, 79, 185)";
    var c_name = document.getElementById('container_nome');
    c_name.style.display = "block";
    document.getElementById('container_info').style.display = "flex";
    console.log(podio);
    const posizioni = Object.entries(podio); //https://flexiple.com/loop-through-object-javascript/ ; https://stackoverflow.com/questions/54656389/js-filter-an-array-of-arrays/54656498
    console.log(posizioni);
    const posizione_giocatore = posizioni.filter(posizione => posizione[1].id == socket.id);
    console.log(posizione_giocatore);
    if (posizione_giocatore[0]) {
        const posizione = posizione_giocatore[0][0];
        c_name.innerHTML = posizione_giocatore[0][1].nome;
        document.getElementById('info_result').innerHTML = "" + posizione + " " + "classificato!";
        var medaglia = document.getElementById('img_result');
        medaglia.src = "../../assets/img/" + posizione + ".png";
        medaglia.style.height = "100%";
        document.getElementById('punteggio_parziale').innerHTML = posizione_giocatore[0][1].punteggio;
    }
    else {
        c_name.innerHTML = document.getElementById('nome').innerHTML.substring(6);
        document.getElementById('info_result').innerHTML = "GAME OVER!";
        document.getElementById('img_result').style.visibility = "hidden";
        document.getElementById('punteggio_parziale').innerHTML = parseInt(document.getElementById('punteggio').innerHTML.match(/(\d+)/));
    }
});

socket.on('disconnessione_admin', function () {
    window.location.href = "../../";
});

socket.on('no_quiz_found', function () {
    window.location.href = '../../';//Fa il redirect alla pagina iniziale 
});
