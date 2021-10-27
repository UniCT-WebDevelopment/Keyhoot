# **Keyhoot**


## Descrizione
*Keyhoot* è una piattaforma di apprendimento basata su un approccio ludico, che prende spunto dal famoso quiz-game online "Kahoot".
Un utente (admin/insegnante) si registra al sistema e, attraverso le apposite funzioni, può creare quiz multidomanda, indicando per ciascuna la risposta corretta, e salvandolo infine su un (Mongo)DB apposito. In alternativa, se sono già presenti altri quiz nel DB, può direttamente lanciarli, aprendo così una "waiting-room" in attesa che gli utenti/studenti accedano per tramite di un PIN di stanza, indicato a schermo. Il quiz è a tempo e alla fine di ogni domanda viene mostrato a ciascun utente il punteggio parziale ottenuto, e il punteggio totale quando ciascuna domanda viene sottoposta agli utenti. Alla fine viene mostrato il podio (tre posizioni) nella "game-view" dell'admin, e nella view di ciascun giocatore viene mostrato il risultato ottenuto e la sua posizione in classifica.

## Tecnologie utilizzate
- HTML
- CSS
- Javascript
- NodeJS (JS lato server)
- Mongodb
- Mongoose
- Express
- Passport
- SocketIO

## Installazione

  1. Installazione di Node.js tramite il [sito ufficiale](https://nodejs.org/it/)
  2. Installazione di MongoDB (https://www.lanciotti.com/installare-mongodb-su-mac-via-homebrew/) 
  3. Aprire il terminale dentro la cartella del progetto e installare i moduli contenuti nelle "dependencies" all'interno del (manifest) file "package.json", tramite "npm install" da riga di comando

## Avvio
   
1. Avviare il server (server.js) tramite "node server" o "npm start"
2. Contattare il server da browser (Chrome ecc.) tramite "http://127.0.0.1:8000"
3. Se si desidera cambiare la porta bisogna modificare la riga di codice (268) nel file "server.js":
    
    `server.listen(8000, () => {
    console.log("Server started on port 8000");
    });`  

inserendo la porta che si desidera utilizzare come primo argomento della funzione .listen()   

## Informazioni su di me
Sono Mattia Lo Scalzo, uno studente al secondo anno del corso magistrale in Sicurezza informatica dell'università di Catania.

## Referenze
- https://www.html.it/pag/32814/introduzione-a-node-js/
- https://stackoverflow.com/questions/9901082/what-is-this-javascript-require
- https://www.youtube.com/watch?v=BuHcLhWdDns
- https://www.youtube.com/watch?v=9xaKQi9-VTI
- https://docs.npmjs.com/specifying-dependencies-and-devdependencies-in-a-package-json-file
- https://www.w3schools.com/nodejs/nodejs_http.asp
- https://expressjs.com/it/
- https://stackoverflow.com/questions/36239590/why-combine-http-module-with-express-module
- https://stackoverflow.com/questions/27162065/whats-the-difference-between-app-use-and-app-get-with-express-static
- https://www.nodeacademy.it/cose-socket-io-node-js/
- https://www.nodeacademy.it/inviare-ricevere-messaggi-tempo-reale-socket-node-js/
- https://ably.com/topic/socketio
- https://socket.io/docs/v4/
- https://socket.io/docs/v4/emitting-events/
- https://socket.io/docs/v4/client-initialization/
- https://stackoverflow.com/questions/45521544/differences-between-io-and-io-connect-using-socket-io
- https://www.youtube.com/watch?v=wIGee2jE97Q
- https://www.youtube.com/watch?v=zWSvb5t_zH4
- https://www.youtube.com/watch?v=WNNf5JPuwZg&list=PLrwNNiB6YOA1a0_xXvogmvSHrLcanVKkF&index=2
- https://www.nodeacademy.it/gestire-parametri-get-node-modulo-url/
- https://www.lanciotti.com/installare-mongodb-su-mac-via-homebrew/
- https://devnews.it/posts/57e134dff5b4f76b1ec8c4bc/come-collegare-nodejs-a-mongodb-con-mongoose-italiano
- https://lucabozzetto.github.io/mongodb-e-mongoose/
- https://www.youtube.com/channel/UCW3sUlAJvsmuKDgzm_P6vfw/search?query=mongodb (Lezioni: #1, #2, #3, #5, #6, #7, #8, #9, #10)
- https://mongodb.github.io/node-mongodb-native/api-generated/mongoclient.html
- https://stackoverflow.com/questions/61266601/pass-option-useunifiedtopology-true-to-the-mongoclient-constructor
- https://arunrajeevan.medium.com/understanding-mongoose-connection-options-2b6e73d96de1
- https://docs.mongodb.com/manual/
- https://stackoverflow.com/questions/5223/length-of-a-javascript-object
- https://it.javascript.info/keys-values-entries
- https://www.w3schools.com/nodejs/met_path_join.asp
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter?retiredLocale=it
- https://stackoverflow.com/questions/41768092/simple-redirect-in-express-with-static-file
- https://stackoverflow.com/questions/8648892/how-to-convert-url-parameters-to-a-javascript-object
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries
- https://www.w3schools.com/js/js_window_location.asp
- https://www.quora.com/How-does-the-scoring-work-on-Kahoot
- https://kahoot.com/files/2019/08/Kahoot-BrandGuide-August2019.pdf#page=12
- https://www.w3schools.com/jsref/met_win_clearinterval.asp
- https://www.w3schools.com/jsref/met_win_setinterval.asp
- https://www.w3schools.com/jsref/met_win_confirm.asp
- https://masteringjs.io/tutorials/express/static
- https://webplatform.github.io/docs/apis/location/search/
- https://codebun.com/login-registration-nodejsexpress-mongodb/
- https://stackoverflow.com/questions/13095418/how-to-use-passport-with-express-and-socket-io
- https://www.nodejsera.com/nodejs-tutorial-day13-signup-using-nodejs-express-mongodb.html
- https://www.tutsmake.com/login-and-registration-form-in-node-js-express-mongodb/
- https://www.geeksforgeeks.org/node-js-authentication-using-passportjs-and-passport-local-mongoose/
- https://www.geeksforgeeks.org/login-form-using-node-js-and-mongodb/
- https://www.geeksforgeeks.org/signup-form-using-node-js-and-mongodb/
- https://mongoosejs.com/docs/migrating_to_6.html#no-more-deprecation-warning-options
- https://www.geeksforgeeks.org/express-js-res-redirect-function/
- https://stackoverflow.com/questions/25463423/res-sendfile-absolute-path
- https://www.tabnine.com/code/javascript/functions/mongoose/Model/register
- https://stackoverflow.com/questions/61496881/difference-between-user-register-and-user-create-in-mongodb-nodejs
- https://stackoverflow.com/questions/17828663/passport-local-mongoose-change-password
- https://stackoverflow.com/questions/63645775/how-to-redirect-to-home-page-in-second-tab-after-session-is-destroyed-in-first-t
- https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/#force_logout
- https://stackoverflow.com/questions/13095418/how-to-use-passport-with-express-and-socket-io
