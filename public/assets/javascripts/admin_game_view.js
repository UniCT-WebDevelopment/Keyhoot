//questo è il .js client relativo alla pagina html dell'admin quando il gioco è avviato (started)
var socket = io();//quando non si passa alcun parametro ci si connette all'url della pag html attuale
//var socket = io({ transports: ['websocket'], upgrade: false });
const urlParams = new URLSearchParams((window.location.search).substring(1)); //Prende l'id dell'admin dall'url e lo trasforma in un oggetto ({id: valore})..https://stackoverflow.com/questions/8648892/how-to-convert-url-parameters-to-a-javascript-object
const parametro = Object.fromEntries(urlParams);
var timer;

var tempo = 20;

//permette di intercettare il logout da un tab differente del browser: l'utente allora verrà sloggato anche in questo tab.
window.addEventListener('storage', function (event) {
    if (event.key === 'logout') {
        console.log('logged out from storage!');
        window.location.href = "/";
    }
});

//Quando l'admin si connette al server
socket.on('connect', function () {

    //Dice al server che è una connessione dell'admin dalla game_view
    socket.emit('admin_entra_quiz', parametro);
});

function prossima_domanda() {
    document.getElementById('prossima_domanda_Button').style.display = "none";

    document.getElementById('container_risultati').style.display = "none";

    document.getElementById('risposta1').style.filter = "none";
    document.getElementById('risposta2').style.filter = "none";
    document.getElementById('risposta3').style.filter = "none";
    document.getElementById('risposta4').style.filter = "none";

    document.getElementById('info').style.display = "grid";

    document.getElementById('num').innerHTML = " 20";
    socket.emit('prossima_domanda'); //Dice al server di avviare una nuova domanda
}

function avvia_Timer() {
    tempo = 20;
    timer = setInterval(function () {//"setInterval(callback, tot-tempo)" permette di richiamare la callback ogni tot-tempo
        tempo -= 1;
        document.getElementById('num').textContent = " " + tempo;
        if (tempo == 0) {
            socket.emit('tempo_scaduto');
        }
    }, 1000);//1000 = 1 sec
}


socket.on('domande_quiz', function (dati_quiz) {//dati_quiz --> { domanda_num: num_domanda, num_domande_totali: res[0].domande.length, d: domanda, r1: risposta1, r2: risposta2, r3: risposta3, r4: risposta4, risposta_corretta: risposta_corretta, giocatori_attivi: dati_giocatori.length}
    document.getElementById('num_domanda').innerHTML = "Domanda " + dati_quiz.domanda_num + " / " + dati_quiz.num_domande_totali;
    document.getElementById('domanda').innerHTML = dati_quiz.d;
    document.querySelector('#risposta1 > span').innerHTML = dati_quiz.r1;
    document.querySelector('#risposta2 > span').innerHTML = dati_quiz.r2;
    document.querySelector('#risposta3 > span').innerHTML = dati_quiz.r3;
    document.querySelector('#risposta4 > span').innerHTML = dati_quiz.r4;
    document.getElementById('risposte_giocatori').innerHTML = "Risposte dei giocatori 0 / " + dati_quiz.giocatori_attivi;
    avvia_Timer();
});

socket.on('aggiorna_risposte_giocatori', function (dati_giocatori) {//dati_giocatori = { giocatori_attivi: playerNum.length, risposte_giocatori: a_quiz.quiz_inside_info.risposte_gamers }
    document.getElementById('risposte_giocatori').innerHTML = "Risposte dei giocatori " + dati_giocatori.risposte_giocatori + " / " + dati_giocatori.giocatori_attivi;
});

socket.on('getTime', function (giocatore) {//"giocatore" è il socket.id del giocatore che ha dato una risposta durante il gioco, e vuole il meritato bonus per la rapidità della risposta corretta!
    socket.emit('tempo_punteggio', {
        gamer: giocatore,
        tempo: tempo //stiamo recuperando il tempo rimasto e lo stiamo inviando al server
    });
});

socket.on('conclusione_domanda', function (dati_giocatore, ris_corretta) {
    clearInterval(timer);//serve a bloccare l'esecuzione asincrona e continua della funzione "setInterval()" nella funzione "avvia_Timer()"

    //Nascondiamo alcuni elementi della pagina, al termine della domanda e ne facciamo apparire altri (come il grafico con i numeri di risposte dati, per ciascuna risposta)
    document.getElementById('info').style.display = "none";

    //Mostriamo la risposta esatta, aggiungendo un simbolo per indicarla, e rendiamo le altre risposte più "scure"
    if (ris_corretta == 1) {
        document.getElementById('risposta2').style.filter = "grayscale(50%)";
        document.getElementById('risposta3').style.filter = "grayscale(50%)";
        document.getElementById('risposta4').style.filter = "grayscale(50%)";
        var current = document.querySelector('#risposta1 > span').innerHTML;
        document.querySelector('#risposta1 > span').innerHTML = "&#10004" + " " + current;
    } else if (ris_corretta == 2) {
        document.getElementById('risposta1').style.filter = "grayscale(50%)";
        document.getElementById('risposta3').style.filter = "grayscale(50%)";
        document.getElementById('risposta4').style.filter = "grayscale(50%)";
        var current = document.querySelector('#risposta2 > span').innerHTML;
        document.querySelector('#risposta2 > span').innerHTML = "&#10004" + " " + current;
    } else if (ris_corretta == 3) {
        document.getElementById('risposta1').style.filter = "grayscale(50%)";
        document.getElementById('risposta2').style.filter = "grayscale(50%)";
        document.getElementById('risposta4').style.filter = "grayscale(50%)";
        var current = document.querySelector('#risposta3 > span').innerHTML;
        document.querySelector('#risposta3 > span').innerHTML = "&#10004" + " " + current;
    } else if (ris_corretta == 4) {
        document.getElementById('risposta1').style.filter = "grayscale(50%)";
        document.getElementById('risposta2').style.filter = "grayscale(50%)";
        document.getElementById('risposta3').style.filter = "grayscale(50%)";
        var current = document.querySelector('#risposta4 > span').innerHTML;
        document.querySelector('#risposta4 > span').innerHTML = "&#10004" + " " + current;
    }

    var num_risposta1 = 0;
    var num_risposta2 = 0;
    var num_risposta3 = 0;
    var num_risposta4 = 0;
    var totale = 0;

    for (var i = 0; i < dati_giocatore.length; i++) {
        if (dati_giocatore[i].quiz_inside_info.risposta == 1) {
            num_risposta1 += 1;
        } else if (dati_giocatore[i].quiz_inside_info.risposta == 2) {
            num_risposta2 += 1;
        } else if (dati_giocatore[i].quiz_inside_info.risposta == 3) {
            num_risposta3 += 1;
        } else if (dati_giocatore[i].quiz_inside_info.risposta == 4) {
            num_risposta4 += 1;
        }
        totale += 1;
    }

    //Ottiene i valori per il grafico (percentuale)
    var risposta1 = num_risposta1 / totale * 100;
    var risposta2 = num_risposta2 / totale * 100;
    var risposta3 = num_risposta3 / totale * 100;
    var risposta4 = num_risposta4 / totale * 100;

    document.getElementById('container_risultati').style.display = "flex";
    document.getElementById('num_risp_red').style.display = "inline-block";
    document.getElementById('num_risp_blue').style.display = "inline-block";
    document.getElementById('num_risp_yellow').style.display = "inline-block";
    document.getElementById('num_risp_green').style.display = "inline-block";

    document.getElementById('num_risp_red').style.height = risposta1 + "px";
    document.getElementById('num_risp_blue').style.height = risposta2 + "px";
    document.getElementById('num_risp_yellow').style.height = risposta3 + "px";
    document.getElementById('num_risp_green').style.height = risposta4 + "px";
    //faccio apparire il numero di risposte dentro i "rettangoli" colorati
    document.getElementById('num_risposta1').innerHTML = num_risposta1;
    document.getElementById('num_risposta2').innerHTML = num_risposta2;
    document.getElementById('num_risposta3').innerHTML = num_risposta3;
    document.getElementById('num_risposta4').innerHTML = num_risposta4;

    document.getElementById('prossima_domanda_Button').style.display = "block";

});

socket.on('GameOver', function (classifica) {

    console.log("GameOver");
    document.getElementById('prossima_domanda_Button').style.display = "none";

    document.getElementById('container_risultati').style.display = "none";

    document.getElementById('area_risposte').style.display = "none";

    document.getElementById('info').innerHTML = "";
    document.getElementById('num_domanda').style.display = "none";
    document.getElementById('domanda').innerHTML = "GAME OVER";


    document.getElementById('podio').style.display = "flex";

    document.body.style.backgroundColor = "rgb(64, 26, 137)"; //viola scuro
    document.getElementById('container_domanda').style.backgroundColor = "white";


    document.getElementById('vincitore1_nome').innerHTML = classifica.primo.nome;
    document.getElementById('vincitore2_nome').innerHTML = classifica.secondo.nome;
    document.getElementById('vincitore3_nome').innerHTML = classifica.terzo.nome;


    document.getElementById('vincitore1_punteggio').innerHTML = classifica.primo.punteggio;
    document.getElementById('vincitore2_punteggio').innerHTML = classifica.secondo.punteggio;
    document.getElementById('vincitore3_punteggio').innerHTML = classifica.terzo.punteggio;

});

socket.on('no_quiz_found', function () {
    window.location.href = '../../';//In caso di problemi, l'admin viene reinderizzato alla pagina iniziale
});




















