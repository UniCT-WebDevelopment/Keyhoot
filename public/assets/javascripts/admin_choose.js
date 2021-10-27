//questo è il .js della pagina html in cui viene chiesto all'admin/host se avviare uno dei giochi disponibili oppure crearne uno nuovo 
var socket = io();//uguale a io(window.parameter) che a sua volta è uguale a io.connect(window.parameter). Si fa una richiesta al server(.js) tramite la connessione al "window.parameter" cioè il server dell'url della pag html attuale...guarda "io([url][, options])" su https://socket.io/docs/v4/client-api/#socket ... https://socket.io/docs/v4/client-initialization/
//var socket = io({ transports: ['websocket'], upgrade: false });
/*const urlParams = new URLSearchParams((window.location.search).substring(1)); //Prende l'id dell'admin dall'url e lo trasforma in un oggetto ({id: valore})..https://stackoverflow.com/questions/8648892/how-to-convert-url-parameters-to-a-javascript-object
const parametro = Object.fromEntries(urlParams);*/
//permette di intercettare il logout da un tab differente del browser: l'utente allora verrà sloggato anche in questo tab
window.addEventListener('storage', function (event) {
    if (event.key === 'logout') {
        console.log('logged out from storage!');
        window.location.href = "/";
    }
});

/*let link = document.getElementById("link");
link.href = link.href + window.location.search;*/



socket.on('connect', function () {//questo avviene quando viene richiesta la pagina html admin/admin_choose nel server. 
    console.log("connection" + Date.now());
    socket.emit('get_nomi_Db');//Prende dal DB i nomi dei quiz precedentemente creati e li mostra all'admin
});

socket.on('info_quiz', function (info) {//"info" è l'array con i valori della collezione del DB con i giochi creati in precedenza
    var div = document.getElementById('lista_quiz');
    div.innerHTML = "";
    for (var i = 0; i < Object.keys(info).length; i++) {

        var container = document.createElement('div');
        var button_quiz = document.createElement('button');
        var button_elimina = document.createElement('button');

        container.setAttribute('class', 'container_buttons');

        button_quiz.innerHTML = info[i].name;
        button_quiz.setAttribute('onClick', "QuizStart('" + info[i].id + "')");//<button onClick="QuizStart(data[i].id)"...viene cioè chiamata la funzione QuizStart() che si trova in questo file
        button_quiz.setAttribute('class', 'quizButton');//<button onClick="QuizStart(...) id="quizButton"></button>

        button_elimina.innerHTML = "X";
        button_elimina.setAttribute('onClick', "QuizDelete('" + info[i].id + "', '" + info[i].name + "')");
        console.log(info[i]);
        button_elimina.setAttribute('class', 'eliminaButton');

        container.appendChild(button_quiz);
        container.appendChild(button_elimina);
        div.appendChild(container);
    }

});

socket.on('aggiorna_pagina', function (res) {
    console.log('aggiorna_pagina');
    if (res == -1) {
        alert("Il gioco è attualmente in uso e non è possibile cancellarlo!");
    }
    else {
        socket.emit('get_nomi_Db');
    }
});

function QuizStart(id) {//richiamata sull' 'onClick' dei bottoni con i quiz
    window.location.href = "/admin/waiting_room/" + "?id=" + id; //impostiamo un nuovo indirizzo url nel browser...tale funzione è identica a quella di quiz_create.js, nella socket.on("Avvia_Quiz_appena_creato"), e permette di passare alla pagina di "attesa" della connessione dei giocatori al gioco, mediante pin.
}

function QuizDelete(quiz_id, quiz_name) {
    console.log(quiz_id, quiz_name);
    if (confirm("Sei sicuro di voler eliminare il quiz " + "'" + quiz_name + "' ?")) {
        socket.emit('elimina_quiz', quiz_id);
    }
}




