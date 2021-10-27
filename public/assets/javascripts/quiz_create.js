var socket = io();
//var socket = io({ transports: ['websocket'], upgrade: false });
/*
const urlParams = new URLSearchParams((window.location.search).substring(1)); //Prende l'id dell'admin dall'url e lo trasforma in un oggetto ({id: valore})..https://stackoverflow.com/questions/8648892/how-to-convert-url-parameters-to-a-javascript-object
const parametro = Object.fromEntries(urlParams);*/
//permette di intercettare il logout da un tab differente del browser: l'utente allora verrà sloggato anche in questo tab

var numero_domanda = 1; //la domanda n. 1 appare di default, senza premere alcun tasto, appena apriamo la pagina html

window.addEventListener('storage', function (event) {
    if (event.key === 'logout') {
        console.log('logged out from storage!');
        window.location.href = "/";
    }
});


function add_domanda() {
    numero_domanda += 1;

    var Div_domande = document.getElementById('sezione_domande');

    var Div_NuovaDomanda = document.createElement("div"); //id= area_domanda


    var Input_domanda = document.createElement('input');


    var Div_NuoveRisposte = document.createElement('div'); //id= area_risposte

    var Div_prime_due_risposte = document.createElement('div');
    var Div_risposta1 = document.createElement('div');
    var Img_red = document.createElement('img');
    var Input_risposta1 = document.createElement('input');

    var Div_risposta2 = document.createElement('div');
    var Img_blue = document.createElement('img');
    var Input_risposta2 = document.createElement('input');


    var Div_ultime_due_risposte = document.createElement('div');
    var Div_risposta3 = document.createElement('div');
    var Img_green = document.createElement('img');
    var Input_risposta3 = document.createElement('input');


    var Div_risposta4 = document.createElement('div');
    var Img_yellow = document.createElement('img');
    var Input_risposta4 = document.createElement('input');

    var Input_corretta = document.createElement('input');


    Div_NuovaDomanda.setAttribute('id', 'area_domanda');//Setta l'id e la classe del Div
    Div_NuovaDomanda.setAttribute('class', 'area_domanda');

    Input_domanda.setAttribute('class', 'domanda');
    Input_domanda.setAttribute('id', 'domanda' + String(numero_domanda));
    Input_domanda.setAttribute('type', 'text');
    Input_domanda.setAttribute('placeholder', 'Domanda ' + String(numero_domanda));

    Div_NuoveRisposte.setAttribute('class', 'area_risposte');


    Div_prime_due_risposte.setAttribute('class', 'risposte');

    Div_risposta1.setAttribute('title', 'risposta 1');
    Div_risposta1.setAttribute('class', 'risposta1');
    Img_red.setAttribute('id', 'red');
    Img_red.src = '../../../assets/img/Red.png';
    Img_red.style.height = "4rem";
    Input_risposta1.setAttribute('id', 'd' + String(numero_domanda) + "risposta1");
    Input_risposta1.setAttribute('type', 'text');
    Input_risposta1.setAttribute('class', 'risposta');
    Input_risposta1.setAttribute('placeholder', 'risposta 1');

    Div_risposta2.setAttribute('title', 'risposta 2');
    Div_risposta2.setAttribute('class', 'risposta2');
    Img_blue.setAttribute('id', 'blue');
    Img_blue.src = '../../../assets/img/Blue.png';
    Img_blue.style.height = "4rem";
    Input_risposta2.setAttribute('id', 'd' + String(numero_domanda) + "risposta2");
    Input_risposta2.setAttribute('type', 'text');
    Input_risposta2.setAttribute('class', 'risposta')
    Input_risposta2.setAttribute('placeholder', 'risposta 2');


    Div_ultime_due_risposte.setAttribute('class', 'risposte');

    Div_risposta3.setAttribute('title', 'risposta 3');
    Div_risposta3.setAttribute('class', 'risposta3');
    Img_green.setAttribute('id', 'green');
    Img_green.src = '../../../assets/img/Yellow.png';
    Img_green.style.height = "4rem";
    Input_risposta3.setAttribute('id', 'd' + String(numero_domanda) + "risposta3");
    Input_risposta3.setAttribute('type', 'text');
    Input_risposta3.setAttribute('class', 'risposta')
    Input_risposta3.setAttribute('placeholder', 'risposta 3');

    Div_risposta4.setAttribute('title', 'risposta 4');
    Div_risposta4.setAttribute('class', 'risposta4');
    Img_yellow.setAttribute('id', 'yellow');
    Img_yellow.src = '../../../assets/img/Green.png';
    Img_yellow.style.height = "4rem";
    Input_risposta4.setAttribute('id', 'd' + String(numero_domanda) + "risposta4");
    Input_risposta4.setAttribute('type', 'text');
    Input_risposta4.setAttribute('class', 'risposta')
    Input_risposta4.setAttribute('placeholder', 'risposta 4');

    Input_corretta.setAttribute('id', 'corretta' + String(numero_domanda));
    Input_corretta.setAttribute('class', 'corretta');
    Input_corretta.setAttribute('type', 'number');
    Input_corretta.setAttribute('min', 0);
    Input_corretta.setAttribute('max', 4);
    Input_corretta.setAttribute('onChange', "checkNumberQuiz(" + String(numero_domanda) + ")");
    Input_corretta.setAttribute('placeholder', 'Risposta corretta')

    Div_NuovaDomanda.appendChild(Input_domanda);

    Div_risposta1.appendChild(Img_red);
    Div_risposta1.appendChild(Input_risposta1);
    Div_risposta2.appendChild(Img_blue);
    Div_risposta2.appendChild(Input_risposta2);
    Div_risposta3.appendChild(Img_green);
    Div_risposta3.appendChild(Input_risposta3);
    Div_risposta4.appendChild(Img_yellow);
    Div_risposta4.appendChild(Input_risposta4);

    Div_prime_due_risposte.appendChild(Div_risposta1);
    Div_prime_due_risposte.appendChild(Div_risposta2);
    Div_ultime_due_risposte.appendChild(Div_risposta3);
    Div_ultime_due_risposte.appendChild(Div_risposta4);

    Div_NuoveRisposte.appendChild(Div_prime_due_risposte);
    Div_NuoveRisposte.appendChild(Div_ultime_due_risposte);


    Div_NuovaDomanda.appendChild(Div_NuoveRisposte);

    Div_NuovaDomanda.appendChild(Input_corretta);

    Div_domande.appendChild(document.createElement('br'));//Aggiungi un "br" tra una domanda e l'altra
    Div_domande.appendChild(Div_NuovaDomanda);//Il div della domanda viene aggiunto alla pagina

}

function updateDb() {
    var domande = [];
    var titolo = document.getElementById('nome').value;//viene preso il titolo del quiz
    for (var i = 1; i <= numero_domanda; i++) {
        var domanda = document.getElementById('domanda' + i).value;//domanda'i-esima'
        var risposta1 = document.getElementById('d' + i + 'risposta1').value;
        var risposta2 = document.getElementById('d' + i + 'risposta2').value;
        var risposta3 = document.getElementById('d' + i + 'risposta3').value;
        var risposta4 = document.getElementById('d' + i + 'risposta4').value;
        var corretta = document.getElementById('corretta' + i).value;
        var risposte = [risposta1, risposta2, risposta3, risposta4];
        domande.push({ "domanda": domanda, "risposte": risposte, "risposta_corretta": corretta })//inseriamo un oggetto con -domanda, risposte e risp corretta- per ciascuna locazione dell'array "domande"
    }

    var quiz = { id: 0, "name": titolo, "domande": domande };//l'id vero e proprio lo inseriremo nel server
    socket.emit('new_quiz', quiz);
}

//Richiamata quando l'admin vuole uscire dalla pagina di creazione del quiz
function elimina() {
    if (confirm("Sei sicuro di voler uscire? Tutti progressi andranno perduti!")) { //https://www.w3schools.com/jsref/met_win_confirm.asp
        window.location.href = "../";
    }
}

socket.on('Avvia_Quiz_appena_creato', function (indice) {//data è l'indice (o l'id) del quiz che abbiamo appena inserito negli array dei quiz (db) nel server.js, in socket.on('new_quiz'...)
    window.location.href = "../../waiting_room/?id=" + indice; //in tal modo (attraverso l'id) si avrà un riferimento del quiz che ci interessa startare, nella pagina html in cui stiamo attendendo l'accesso dei giocatori mediante il pin (adesso farà una chiamata href all'indirizzo "http://127.0.0.1:3000/host/?id=idquiz"...passa a admin/waiting_room/index.html e admin_waiting_room.js)
});


function checkNumberQuiz(index) {
    let val = document.getElementsByClassName('corretta')[index - 1].value;
    if (val < 1) {
        console.log("Minore di 1");
        document.getElementsByClassName('corretta')[index - 1].value = 1;
    }
    else if (val > 4) {
        console.log("Maggiore di 4");
        document.getElementsByClassName('corretta')[index - 1].value = 4;
    }
}








