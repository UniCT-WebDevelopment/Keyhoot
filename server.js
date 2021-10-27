class Quiz_inside_Room {
    constructor() {
        this.quiz_ = [];
    }
    add_Quiz_inside(pin, adminId, quiz_inside_bool, quiz_inside_info) { // quiz_inside_info contiene le informazioni sulla domanda che di volta in volta viene sottoposta ai giocatori...quiz.quiz_inside_info --> { risposte_gamers: 0, is_question_submitted: false, quiz_id: quiz.id, (num)domanda: 1 }
        var a_quiz = { pin, adminId, quiz_inside_bool, quiz_inside_info };
        this.quiz_.push(a_quiz);
        return a_quiz;
    }
    elimina_quiz(adminId) {
        var a_quiz = this.getQuiz(adminId);

        if (a_quiz) {
            this.quiz_ = this.quiz_.filter((a_quiz) => a_quiz.adminId !== adminId);//mette in this.quiz_ tutti i giochi TRANNE quello con un certo adminId
        }
        return a_quiz;
    }
    getQuiz(adminId) {
        return this.quiz_.filter((a_quiz) => a_quiz.adminId === adminId)[0]
    }
}

class Gamers {
    constructor() {
        this.gamers = [];
    }
    addGamer(adminId, gamerId, name, quiz_inside_info) {//quiz_inside_info contiene informazioni del giocatore in relazione alla domanda che gli viene sottoposta e cui risponde di volta in volta...gamer.quiz_inside_info = { risposta: 0, punteggio: 0}
        var gamer = { adminId, gamerId, name, quiz_inside_info };
        this.gamers.push(gamer);
        return gamer;
    }
    elimina_gamer(gamerId) {
        var gamer = this.getGamer(gamerId);

        if (gamer) {
            this.gamers = this.gamers.filter((gamer) => gamer.gamerId !== gamerId);
        }
        return gamer;
    }
    getGamer(gamerId) {//.filter torna un array, per questo è necessario mettere [0] alla fine
        return this.gamers.filter((gamer) => gamer.gamerId === gamerId)[0]
    }
    getGamers(adminId) {//torna un array con i giocatori iscritti ad un gioco dell'admin
        return this.gamers.filter((gamer) => gamer.adminId === adminId);
    }
}

//Importiamo "path" e "http" che servono per stabilire il path iniziale quando ci si connette al server per mezzo della socketIO (express)
const path = require('path'); //contiene una serie di funzioni utili per manipolare i percorsi
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const public = path.join(__dirname, 'public');//__dirname indica la cartella in cui si trova server.js
var app = express();
var server = http.createServer(app);
var io = socketIO(server, {//se non si settano esplicitamente ed opportunamente il pingInterval e il pingTimeout, soprattutto quest'ultimo, allora avverrà nel giro di 1/2 min la disconnessione/riconnessione automatica della socket dei client che dovessero rivelarsi inattivi per troppo tempo (e ciò comporterebbe una serie di problemi). 
    'pingInterval': 20000,
    'pingTimeout': 50000000 //impostato ad un valore molto alto per evitare disconnessioni dei client. https://stackoverflow.com/questions/30991326/socket-io-server-side-timeout-for-inactive-client-connection ...  http://node-js-tutorial.blogspot.com/2018/02/nodejs-socketio-set-ping-timeout-ping.html
});

//io.set('transports', ['websocket']); //serve ad evitare il "polling" e ad usare solo le websocket. Nella pratica, se non si usa questa opzione, ogni tot la connessione socket viene "aggiornata" tramite polling. Equivalentemente il client avrà un'opzione simile. 
var quiz_ = new Quiz_inside_Room();//conterrà i giochi "attivi" (Live) in questo momento sulla(e) finestra(e) dell'admin
var gamers = new Gamers();

//Mongodb
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/"; //27017 è la porta di default su cui ascolta il servizio di Mongodb
//var MongoClient = new mongoClient(url, { useUnifiedTopology: true });
var mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    cookieParser = require('cookie-parser'),
    session = require('express-session');

User = require("./models/user");
mongoose.connect('mongodb://localhost:27017/login-keyhootDB');
var db = mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
db.once('open', function (callback) {
    console.log("connection mongoose succeeded");
})
/*mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);*/

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // To parse the incoming requests with JSON payloads
/*app.use(express.json({ extended: true }));*/

//Express-Session e cookie-parser servono per salvare i dettagli dello user, che ad ogni sessione useremo per recuperare le informazioni dei quiz dal DB.
var sessionMiddleware = session({
    secret: "Rusty is a dog",
    resave: false,
    saveUninitialized: false
});
//associo la sessione al socket.io
io.use(function (socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

app.use(sessionMiddleware);
app.use(cookieParser());

//fondamentali per il login
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

//servono per recuperare le informazioni (cookie) dell'utente loggato quando contatta il server o quando restituiamo una risposta
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



//app.use(express.static(public)); //la funzione static permette di indicare ad express la cartella in cui si trovano gli assets. In particolare tale app.use() permette di tornare automaticamente l'index.html interno al public, per tramite del socket.io (quindi la pagina web principale quando ci connettiamo al server con "http://127.0.0.1:8000"), tramite un implicita send(). Quando si fa una connessione ad una cartella specifica dentro .../public/.. tale app.use(blabla) tornerà la pag html dentro tale cartella. NB il nome della cartella "public" deve essere omesso dal percorso: es. "http://127.0.0.1:8000/admin/admin_choose" torna l'index.html dentro /public/admin/admin_choose. Il socket.emit() implicito potrà poi essere catturato nel file .js relativo alla pag html tornata  

app.get("/admin/choose/", isLoggedIn, function (req, res) {
    console.log("entra in app.get");

    res.sendFile("/public/admin/choose/index.html", { root: __dirname });
    /*if (req.originalUrl != req.baseUrl + req.path + "?user=" + req.user.username)
        res.redirect(req.baseUrl + req.path + "?user=" + req.user.username);*/

});

app.get("/admin/choose/quiz_create/", isLoggedIn, function (req, res) {
    console.log("entra in quiz");
    res.sendFile("/public/admin/choose/quiz_create/index.html", { root: __dirname });

});

app.get("/admin/waiting_room/", isLoggedIn, function (req, res) {
    console.log("entra in app.get");
    res.sendFile("/public/admin/waiting_room/index.html", { root: __dirname });

});
app.get("/admin/game_view/", isLoggedIn, function (req, res) {
    console.log("entra in app.get");
    res.sendFile("/public/admin/game_view/index.html", { root: __dirname });

});

app.get("/register", function (req, res) {
    console.log("register1");
    res.sendFile("/public/register/index.html", { root: __dirname });
});

app.post("/register", async function (req, res) {
    var _username = req.body.username;
    console.log(_username);
    var _password = req.body.password;
    var _email = req.body.email;
    if (!_username || typeof _username !== 'string') {
        //return res.json({ status: 'error', error: 'Invalid username' });
        return res.send('<script>alert("Username non valido"); window.location.href = "/register/index.html"; </script>');
    }
    if (!_password || typeof _password !== 'string') {
        //return res.json({ status: 'error', error: 'Invalid password' });
        return res.send('<script>alert("Password non valida"); window.location.href = "/register/index.html"; </script>');
    }

    if (_password.length < 8) {
        //return res.json({ status: 'error', error: 'Password too small. Should be atleast 8 characters' })
        return res.send('<script>alert("Password troppo corta. Deve essere almeno 8 caratteri!"); window.location.href = "/register/index.html"; </script>');
    }



    //le info sono salvate nel MongoDB "login-keyhootDB" alla collezione "users"
    //tramite User possiamo usare i classici User.find, .delete ecc.

    User.register(new User({ username: _username, email: _email }),
        req.body.password, function (err, user) {
            if (err) {
                console.log(err);
                res.send('<script>alert("C\'è stato un problema con la registrazione nel DB...riprova!"); window.location.href = "/register/index.html"; </script>');
                //return res.sendFile("/public/register/index.html", { root: __dirname });
            }

            passport.authenticate("local")(
                req, res, function () {
                    //res.sendFile("/public/admin/choose/index.html", { root: __dirname });
                    console.log("registrazione riuscita");
                    //console.log(req);
                    res.send('<script>alert("Registrazione andata a buon fine! Verrai reindirizzato nella pagina di creazione/scelta dei quiz!"); window.location.href = "/admin/choose/index.html"; </script>');
                    //res.redirect("../admin/choose/");
                });
        });
});

app.get("/login", function (req, res) {
    console.log("enter login");
    res.sendFile("/public/login/index.html", { root: __dirname });
});

app.post('/changepassword', function (req, res) {

    User.findOne({ email: req.body.email }, (err, user) => {
        // Check if error connecting
        console.log("Sono qua!");
        var password = req.body.password;
        if (!password || typeof password !== 'string') {
            //return res.json({ status: 'error', error: 'Invalid password' });
            return res.send('<script>alert("Password non valida"); window.location.href = "/changepassword/index.html"; </script>');
        }

        if (password.length < 8) {
            //return res.json({ status: 'error', error: 'Password too small. Should be atleast 8 characters' })
            return res.send('<script>alert("Password troppo corta. Deve essere almeno 8 caratteri!"); window.location.href = "/changepassword/index.html"; </script>');
        }
        if (err) {
            //res.json({ success: false, message: err }); // Return error
            res.send('<script>alert("C\'è stato un problema con il cambio della password...riprova!"); window.location.href = "/changepassword/index.html"; </script>');
        } else {
            // Check if user was found in database
            if (!user) {
                // res.json({ success: false, message: 'User not found' }); // Return error, user was not found in db
                res.send('<script>alert("Non è stato trovato alcun utente, sulla base della mail fornita...riprova!"); window.location.href = "/changepassword/index.html"; </script>');
            } else {
                user.setPassword(password, function (err, user) {
                    if (err) {
                        /*res.json({
                            success: false, message: 'Password could not be saved.Please try again!'
                        })*/
                        res.send('<script>alert("Qualcosa è andato storto...riprova!"); window.location.href = "/changepassword/index.html"; </script>');
                    } else {
                        /*res.json({
                            success: true, message: 'Your new password has been saved successfully'
                        })*/
                        user.save();
                        console.log(user);
                        res.send('<script>alert("La tua password è stata cambiata con successo! Effettua il login!"); window.location.href = "/login/index.html"; </script>');
                    }
                });

            }
        }
    });
});

//il seguente viene triggerato quando si preme il bottone di "login", dopo aver inserito le credenziali
app.post("/login", passport.authenticate("local", {
    successRedirect: "../admin/choose/",
    failureRedirect: "/login"
}), function (req, res) {
    //res.redirect("../admin/choose/" + "?user=" + req.user.username);
});

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next) {
    console.log("isLoggedIn");
    if (req.isAuthenticated()) return next();
    res.redirect("../../login/");
}
console.log("static");

app.use(express.static(public)); //la funzione static permette di indicare ad express la cartella in cui si trovano gli assets. In particolare tale app.use() permette di tornare automaticamente l'index.html interno al public, per tramite del socket.io (quindi la pagina web principale quando ci connettiamo al server con "http://127.0.0.1:8000"), tramite un implicita send(). Quando si fa una connessione ad una cartella specifica dentro .../public/.. tale app.use(blabla) tornerà la pag html dentro tale cartella. NB il nome della cartella "public" deve essere omesso dal percorso: es. "http://127.0.0.1:8000/admin/admin_choose" torna l'index.html dentro /public/admin/admin_choose. Il socket.emit() implicito potrà poi essere catturato nel file .js relativo alla pag html tornata  


//Il server è avviato sulla porta 8000
server.listen(8000, () => {
    console.log("Server started on port 8000");
});

//Quando viene effettuata la connessione al server dall'admin o dall'utente normale
io.on('connection', (socket) => {
    console.log("ok" + Date.now());
    //recuperiamo lo username dell'utente loggato ad ogni connessione con la socket. In tal maniera ad esempio possiamo inserire il nome dell'utente che crea un quiz, all'interno del record db che contiene il quiz stesso. E alla stessa maniera possiamo mostrare a ciascun utente solo i quiz che ha creato lui
    _username = socket.request.session.passport.user;
    //Restituisce all'admin i nomi dei quiz da mostrare nella admin/choose/index.html.."get_nomi_Db" viene emessa da admin_choose.js
    socket.on('get_nomi_Db', function () {
        console.log("get_nomi_Db" + Date.now());

        MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
            if (err) throw err;

            var dbo = db.db('keyhootDB');
            var query = { username: _username }; //recuperiamo solo i quiz dell'utente che è loggato e sta visionando la pagina.
            dbo.collection("kahoot_Quiz").find(query).toArray(function (err, res) {//dbo.collection().find() torna un oggetto "cursor"...il .toArray(function(err,res)) è un metodo dei cursor. NB forse bisognerebbe mettere "await" e "async" in quanto si tratta di chiamate asincrone. O forse no, perchè il risultato è gestito da una callback (che è asincrona già di suo)
                if (err) throw err;
                socket.emit('info_quiz', res);//viene mandata ad admin_choose.js
                db.close();
            });
        });


    });
    // il metodo si occupa di eliminare un quiz in seguito alla pressione del tasto "elimina" e conferma da parte dell'admin.
    socket.on("elimina_quiz", function (id_) {
        console.log("elimina_quiz", typeof (id_));
        var result = quiz_.quiz_.filter((a_quiz) => a_quiz.quiz_inside_info.quiz_id == id_);
        console.log("elimina_quiz_risultato", result);
        if (result.length != 0) {
            socket.emit('aggiorna_pagina', -1);
        }
        else {
            MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
                if (err) throw err;
                var dbo = db.db("keyhootDB");
                var query = { id: parseInt(id_) };
                console.log(query);
                dbo.collection("kahoot_Quiz").deleteOne(query, function (err, res) {
                    if (err) throw err;
                    socket.emit('aggiorna_pagina', 0);
                    db.close();
                });

            });
        }
    });



    //quando viene creato un nuovo quiz in quiz_create.js, da salvare nel DB
    socket.on('new_quiz', function (data) {//'data' conterrà un oggetto di tal tipo { id: 0, "name": name, "domande": domande }, in cui name=nome del quiz che stiamo inserendo, e domande è un array di oggetti del tipo { "domanda": question, "risposte": risposte, "risposta_corretta": risposta_corretta }
        console.log("new_quiz");
        data.username = _username;//associamo al quiz il nome dell'utente che lo sta creando
        MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
            if (err) throw err;
            var dbo = db.db('keyhootDB');
            console.log("accesso al db");
            dbo.collection('kahoot_Quiz').find({}).toArray().then((res, err) => {//res sarà un array contenente tutti i quiz finora creati
                if (err) throw err;
                console.log("dentro al find()");
                var num = Object.keys(res).length;//torna il numero di quiz sinora inseriti
                if (num == 0) {//allora stiamo creando (dobbiamo creare) il primo quiz
                    data.id = 1;
                    num = 1;
                } else {
                    data.id = res[num - 1].id + 1;//prende l'id del quiz precedente, lo incrementa di 1 e lo assegna all'id dell'attuale quiz che stiamo creando/aggiungendo
                }
                return a_quiz = data;
            }).then((a_quiz) => {
                dbo.collection("kahoot_Quiz").insertOne(a_quiz).then((res, err) => {
                    if (err) throw err;
                    db.close();
                }).then(() => {
                    console.log("ultimo then()");
                    //db.close();
                    socket.emit('Avvia_Quiz_appena_creato', data.id);//torna al quiz_create.js
                });
            });

        });

    });

    //Quando l'admin avvia l' "a_quiz"
    socket.on('inizio_quiz', () => {
        console.log("inizio_quiz");
        var a_quiz = quiz_.getQuiz(socket.id);//Ottiene il quiz sulla base del socket.id
        a_quiz.quiz_inside_bool = true;//cambio dello "stato" del quiz
        socket.emit('quiz_avviato', a_quiz.adminId);//Avverte l'admin (e lui i giocatori) che il gioco è stato startato, come richiesto. Una volta restituito il "a_quiz.adminId" ad admin_waiting_room.js, viene fatta richiesta al server della pagina con il gioco avviato, e a quel punto in admin_game_view.js viene rifatta richiesta al server.js di "admin_entra_quiz", che infine aggiorna gli utenti nella room (user_waiting_room) con .emit('user_quiz_avviato') )
    });

    //Quando l'admin fa partire un quiz dalla choose_room o dopo averne creato uno 
    socket.on('admin_waiting', (data) => {//data è un oggetto tipo {id: 'number'}, dove id è l'id del gioco che si sta startando
        console.log("admin_waiting");
        //Controlliamo se l'id passato nell'url corrisponde all'id di un quiz dentro al DB
        MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
            if (err) throw err;
            var dbo = db.db("keyhootDB"); //nome del database
            var query = { id: parseInt(data.id) };
            dbo.collection('kahoot_Quiz').find(query).toArray(function (err, res) { //il .find() torna un oggetto 'cursor' ai quiz trovati, quindi bisogna usare il metodo .toArray per averne una rappresentazione in array di oggetti (quiz)...NB keyhootDB (db) --> kahoot_Quiz (collection)
                if (err) throw err;

                //Il quiz è stato trovato nel db
                if (res[0] !== undefined) {
                    var pin_quiz = Math.floor(Math.random() * 9000000) + 1000000; //nuovo pin per il quiz

                    quiz_.add_Quiz_inside(pin_quiz, socket.id, false, { risposte_gamers: 0, is_question_submitted: false, quiz_id: data.id, domanda: 1 }); //Crea/lancia un quiz con il pin e l'admin id

                    var a_quiz = quiz_.getQuiz(socket.id); //Prende i dati del quiz

                    socket.join(a_quiz.pin);//L'admin entra nella stanza alla quale accederanno tutti i giocatori tramite pin...la room in pratica è l'insieme di tutte le socket che avranno fatto il join con il pin

                    //Invia il pin del quiz alla waiting_room dell'admin, in modo da poterlo mostrare ai giocatori
                    socket.emit('mostra_Pin', {//torna ad admin_waiting_room
                        pin: a_quiz.pin
                    });
                } else {//viene usata se si manomette l'id manualmente dall'url o se un utente fa direttamente la connessione all'indirizzo "http://127.0.0.1:3000/admin/waiting_room/?id=idquizDB"
                    socket.emit('no_quiz_found 1');
                }
                db.close();
            });
        });

    });

    //Quando un giocatore si connette passando il pin per giocare ad un quiz
    socket.on('user_enter', (params) => {
        console.log("user_enter");
        var quiz_trovato = false; //Se un gioco viene trovato con il pin inserito dall'utente/giocatore (cioè se non ha inserito il pin sbagliato, allora si trasformerà in "true")
        var riuso_username = false; //se è già presente un giocatore col medesimo username, allora l'utente viene disconnesso e reindirizzatto alla pagina iniziale
        //Per ogni gioco di cui è presente una admin_waiting_room "attiva" (nell'oggetto quiz_ della classe Quiz_inside_Room)
        for (var i = 0; i < quiz_.quiz_.length; i++) {
            //Se il pin dell'i-esimo gioco è uguale a quello passato dal giocatore
            if (params.pin == quiz_.quiz_[i].pin) {

                console.log('Gamer connesso al quiz');

                var adminId = quiz_.quiz_[i].adminId; //Prende l'id dell'admin che ha aperto la waiting_room del quiz

                //controlliamo se lo username inserito non è già stato utilizzato
                var gamer = gamers.getGamers(adminId).find(giocatore => giocatore.name == params.name);

                if (gamer) { //se entra nell'if allora lo username era già stato usato
                    socket.emit('change_username');
                    riuso_username = true;
                }

                else {

                    console.log("Il nuovo giocatore è entrato");

                    gamers.addGamer(adminId, socket.id, params.name, { punteggio: 0, risposta: 0 }); //aggiunge l'utente alla lista dei giocatori

                    socket.join(params.pin); //Il giocatore si sta connettendo alla "stanza", contraddistinta proprio dal pin.

                    var quiz_gamers = gamers.getGamers(adminId); //Prende tutti i giocatori iscritti al quiz

                    io.to(params.pin).emit('update_user_room', quiz_gamers);//Invia alla admin_waiting_room la lista di tutti coloro che vogliono partecipare al quiz e sono entrati nella stanza, in modo da poter mostrare i dati (per capire che fa io.to().emit -> https://socket.io/docs/v4/emit-cheatsheet/)
                    quiz_trovato = true; //Il quiz è stato trovato (guarda sotto)
                }
            }
        }

        //Se il gioco non è stato trovato, magari il giocatore ha inserito il pin sbagliato..
        if (quiz_trovato == false && riuso_username == false) {
            console.log("no_quiz_found 3");
            socket.emit('no_quiz_found'); //L'utente viene mandato indietro alla pagina principale
        }

    });

    //Quando l'admin si connette alla game_view (pagina con le domande del gioco avviato..la situazione in cui ad un certo punto l'admin decide di avviare il quiz, e allora vengono recuperate le domande e i giocatori che si sono connessi e che debbono giocare)
    socket.on('admin_entra_quiz', (parametri) => {
        console.log("admin_entra_quiz");
        var waiting_room_adminId = parametri.id;//il socket.id cambia tra admin_waiting_room.js (dove l'admin crea la stanza del gioco da mandare in "Live", con pin ecc., e sta in attesa della connessione dei gamers) e admin_game_view.js, perchè sono due socket differenti (e due pag html diverse)!
        var quiz = quiz_.getQuiz(waiting_room_adminId);//Prende il quiz con l'id che l'admin aveva nella waiting_room..da notare che il vecchio admin id è quello con cui abbiamo creato l'istanza del "quiz avviato" in socket.on("admin_waiting"), con quiz_.add_Quiz_inside(...).
        if (quiz) {
            quiz.adminId = socket.id;//Cambiamo l'adminId del quiz, con il nuovo Id dell'admin dalla pagina del gioco avviato
            socket.join(quiz.pin);//bisogna unire alla room anche la socket attuale dell'admin
            var dati_giocatori = gamers.getGamers(waiting_room_adminId);//Prende i giocatori che hanno richiesto di partecipare al quiz
            for (var i = 0; i < Object.keys(gamers.gamers).length; i++) {
                if (gamers.gamers[i].adminId == waiting_room_adminId) {
                    gamers.gamers[i].adminId = socket.id;
                }//dobbiamo modificare ovunque l'adminId vecchio, con quello nuovo
            }
            var quizid = quiz.quiz_inside_info['quiz_id']; //quiz.quiz_inside_info --> { risposte_gamers: 0, is_question_submitted: false, quiz_id: data.id, domanda: 1 }
            MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
                if (err) throw err;

                var dbo = db.db('keyhootDB');
                var query = { id: parseInt(quizid) };
                dbo.collection("kahoot_Quiz").find(query).toArray(function (err, res) {
                    if (err) throw err;
                    //res sarà un array con un solo elemento...res[0]. Prendiamo per ora la prima domanda (domande[0].domanda) e le sue risposte
                    var domanda = res[0].domande[0].domanda;
                    var risposta1 = res[0].domande[0].risposte[0];
                    var risposta2 = res[0].domande[0].risposte[1];
                    var risposta3 = res[0].domande[0].risposte[2];
                    var risposta4 = res[0].domande[0].risposte[3];
                    var risposta_corretta = res[0].domande[0].risposta_corretta;

                    socket.emit('domande_quiz', {
                        domanda_num: 1,
                        num_domande_totali: res[0].domande.length,
                        d: domanda,
                        r1: risposta1,
                        r2: risposta2,
                        r3: risposta3,
                        r4: risposta4,
                        corretta: risposta_corretta,
                        giocatori_attivi: dati_giocatori.length
                    });
                    db.close();
                });
            });


            io.to(quiz.pin).emit('user_quiz_avviato');//cambiamo la pagina dei gamers, dalla "loading" page alla pagina vera e propria, con la domanda e i riquadri per scegliere la risposta
            quiz.quiz_inside_info.is_question_submitted = true;
        } else {
            console.log("no_quiz_found 2");
            socket.emit('no_quiz_found');//questo accade se si fa una richiesta al server del tipo "http://127.0.0.1:3000/admin/game_view/?id=blabla" direttamente tramite url, passando un id fasullo, o comunque SENZA PASSARE PRIMA PER LA PAGINA DI "ATTESA" DELLA CONNESSIONE DEI GIOCATORI, e dunque senza aver creato il gioco "live" (che si è aggiunto in socket.on("admin_waiting"), con quiz_.add_Quiz_inside(...))
        }
    });

    //Quando un giocatore si connette alla game_view
    socket.on('user_enter_game', (data) => {//data = {id: gamer_id}
        console.log("user_enter_game");
        var gamer = gamers.getGamer(data.id);
        if (gamer) {
            var a_quiz = quiz_.getQuiz(gamer.adminId);//il gamer.adminId è stato aggiornato (qui stesso, nel server.js) quando l'admin ha avviato il gioco in socket.on("admin_entra_quiz")
            socket.join(a_quiz.pin);//la socket è cambiata rispetto a quella della user_waiting_room
            gamer.gamerId = socket.id;//Aggiornamento del gamerId con l'id del socket attuale: dall'id della socket nella pagina di "loading" (user_waiting_room.js; user/waiting_room/index.html) all'id della socket della pagina con i quattro rettangoli per le risposte: user/game/index.html, user_game_view.js

            var gamers_info = gamers.getGamers(a_quiz.adminId);//questo a_quiz.adminId era già stato updatato in socket.on("admin_entra_quiz"), quando l'admin ha avviato il quiz (Live)
            socket.emit('dati_giocatore', gamers_info);//gamers_info include tutti i giocatori iscritti al quiz
        } else {//questo avviene se qualcuno prova a connettersi al server direttamente senza passare dalla sezione col pin e quindi entrando nella "room" con "socket.join(pin)", inserendo "http://127.0.0.1:3000/user/game/game/?id=blabla"
            console.log("no_quiz_found 4")
            socket.emit('no_quiz_found');//Nella room non è stato trovato alcun gioco
        }

    });

    //Setting di una risposta da parte di un giocatore
    socket.on('risposta_giocatore', function (num) {//num=numero della risposta data
        console.log("risposta_giocatore");
        var gamer = gamers.getGamer(socket.id);
        var adminId = gamer.adminId;
        var gamers_list = gamers.getGamers(adminId);//array con tutti i giocatori
        var a_quiz = quiz_.getQuiz(adminId);
        if (a_quiz.quiz_inside_info.is_question_submitted == true) {//se siamo a gioco avviato (settato a true in socket.on('admin_entra_quiz'))
            gamer.quiz_inside_info.risposta = num; //quiz_inside_info contiene le informazioni sulla domanda del quiz al momento sottoposta; vale sia per le informazioni dell'oggetto quiz in sè, che per le informazioni dei giocatori, in relazione alla domanda, per esempio per conoscere quale risposta un giocatore abbia dato alla domanda.
            a_quiz.quiz_inside_info.risposte_gamers += 1;//num giocatori che hanno risposto

            var gameQuestion = a_quiz.quiz_inside_info.domanda;//domanda num...
            var quiz_id = a_quiz.quiz_inside_info.quiz_id;

            MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
                if (err) throw err;

                var dbo = db.db('keyhootDB');
                var query = { id: parseInt(quiz_id) };
                dbo.collection("kahoot_Quiz").find(query).toArray(function (err, res) {
                    if (err) throw err;
                    var risposta_corretta = res[0].domande[gameQuestion - 1].risposta_corretta;//gameQuestion-1 perchè ad es. la domanda n. 5 sarà in posizione 4 nell'array delle domande (dal momento che si comincia da 0) 
                    //Controlla se la risposta data dal giocatore è quella giusta
                    if (num == risposta_corretta) {
                        gamer.quiz_inside_info.punteggio += 1000;//se la risposta è giusta diamo 100 punti al giocatore
                        io.to(a_quiz.pin).emit('getTime', socket.id); //è una funzione di admin_game_view.js, che permette di ottenere il tempo rimanente prima dello scadere, al fine di aumentare il punteggio da assegnare al giocatore, in percentuale rispetto a quanto tempo c'ha messo a rispondere
                        socket.emit('esito_risposta', true); //torna a user_game_view.js, per impostare a true la variabile "risposta_corretta" che servirà per decidere cosa fare apparire nella pagina del giocatore, a tempo scaduto.
                    }

                    //Controlla se tutti i giocatori hanno risposto.. se così, allora possiamo concludere la domanda e ottenere i risultati senza aspettare lo scadere del tempo!
                    if (a_quiz.quiz_inside_info.risposte_gamers == gamers_list.length) {
                        a_quiz.quiz_inside_info.is_question_submitted = false; //La domanda si è conclusa perchè tutti i giocatori hanno risposto, prima dello scadere del tempo
                        var gamers_info = gamers.getGamers(a_quiz.adminId);
                        io.to(a_quiz.pin).emit('conclusione_domanda', gamers_info, risposta_corretta);//Tell everyone (sia a giocatori che all'admin, quindi sia in user_game_view.js, sia admin_game_view.js) that question is over NB gamers_info e risposta_corretta vengono usati solo dall'admin!
                    } else {
                        //aggiorna la view dell'admin con il numero di giocatori che hanno risposto
                        io.to(a_quiz.pin).emit('aggiorna_risposte_giocatori', {//catturata solo dall'admin in admin_game_view.js
                            giocatori_attivi: gamers_list.length,
                            risposte_giocatori: a_quiz.quiz_inside_info.risposte_gamers//num_risposte_giocatori
                        });
                    }

                    db.close();
                });
            });
        }
    });

    //aumenta il punteggio del gamer (socket) tramite una formula sul tempo rimanente/totale oltre ai 1000 statici, ottenuti in socket.on("risposta_giocatore"))!
    // https://www.quora.com/How-does-the-scoring-work-on-Kahoot
    socket.on('tempo_punteggio', function (data) {//data={gamer: giocatore, tempo: tempo}...tempo è il tempo rimasto prima dello scadere
        console.log("tempo");
        var bonus_tempo = 1000 * (1 - ((20 - data.tempo) / 40)); //formula
        var gamerId = data.gamer;
        var gamer = gamers.getGamer(gamerId);
        gamer.quiz_inside_info.punteggio += bonus_tempo;
    });

    //un gamer richiede il proprio punteggio
    socket.on('ottieni_punteggio', function () {
        console.log("ottieni_punteggio");
        var gamer = gamers.getGamer(socket.id);
        socket.emit('nuovo_punteggio', gamer.quiz_inside_info.punteggio);
    });

    //tempo scaduto!
    socket.on('tempo_scaduto', function () {
        console.log("tempo_scaduto");
        var a_quiz = quiz_.getQuiz(socket.id); //dal momento che "tempo_scaduto" è un evento emesso (socket.emit()) dal solo admin, scoket.id si può riferire solo all'admin e non ad un qualche giocatore
        a_quiz.quiz_inside_info.is_question_submitted = false;//cioè sia "fuori" dalla domanda "live" (in corso di sottomissione ai giocatori)
        var gamers_info = gamers.getGamers(a_quiz.adminId);

        var gameQuestion = a_quiz.quiz_inside_info.domanda;//numero della domanda
        var quiz_id = a_quiz.quiz_inside_info.quiz_id;

        MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
            if (err) throw err;

            var dbo = db.db('keyhootDB');
            var query = { id: parseInt(quiz_id) };
            dbo.collection("kahoot_Quiz").find(query).toArray(function (err, res) {
                if (err) throw err;
                var risposta_corretta = res[0].domande[gameQuestion - 1].risposta_corretta;//gameQuestion-1 perchè ad es. la domanda n. 5 sarà in posizione 4 nell'array delle domande (dal momento che si comincia da 0)
                io.to(a_quiz.pin).emit('conclusione_domanda', gamers_info, risposta_corretta);

                db.close();
            });
        });
    });

    socket.on('prossima_domanda', function () {//l'evento è emesso dall'admin quindi socket.id si riferisce all'id dell'admin
        console.log("prossima_domanda");
        var dati_giocatori = gamers.getGamers(socket.id);
        //Ogni giocatore avrà dato una "risposta", alla domanda. Tale risposta è stata salvata su un attributo dell'oggetto di classe gamers. Bisogna quindi resettarlo a 0, per la prossima domanda
        for (var i = 0; i < Object.keys(gamers.gamers).length; i++) {
            if (gamers.gamers[i].adminId == socket.id) {//"se il giocatore è iscritto ad un quiz live avviato da un certo admin che sta richiedendo la prossima_domanda (socket.id)"
                gamers.gamers[i].quiz_inside_info.risposta = 0;
            }
        }

        var a_quiz = quiz_.getQuiz(socket.id);
        a_quiz.quiz_inside_info.risposte_gamers = 0;
        a_quiz.quiz_inside_info.is_question_submitted = true;
        a_quiz.quiz_inside_info.domanda += 1; //domanda n. 1,2,3 ecc.
        var quiz_id = a_quiz.quiz_inside_info.quiz_id;



        MongoClient.connect(url, { useUnifiedTopology: true }, function (err, db) {
            if (err) throw err;

            var dbo = db.db('keyhootDB');
            var query = { id: parseInt(quiz_id) };
            dbo.collection("kahoot_Quiz").find(query).toArray(function (err, res) {
                if (err) throw err;

                if (res[0].domande.length >= a_quiz.quiz_inside_info.domanda) {//se non siamo andati oltre l'ultima domanda...
                    console.log("check!");
                    var questionNum = a_quiz.quiz_inside_info.domanda;
                    questionNum = questionNum - 1;
                    var domanda = res[0].domande[questionNum].domanda;
                    var risposta1 = res[0].domande[questionNum].risposte[0];
                    var risposta2 = res[0].domande[questionNum].risposte[1];
                    var risposta3 = res[0].domande[questionNum].risposte[2];
                    var risposta4 = res[0].domande[questionNum].risposte[3];
                    var risposta_corretta = res[0].domande[questionNum].risposta_corretta;

                    socket.emit('domande_quiz', {
                        domanda_num: a_quiz.quiz_inside_info.domanda,
                        num_domande_totali: res[0].domande.length,
                        d: domanda,
                        r1: risposta1,
                        r2: risposta2,
                        r3: risposta3,
                        r4: risposta4,
                        corretta: risposta_corretta,
                        giocatori_attivi: dati_giocatori.length
                    });
                    db.close();
                } else {//fine del gioco..assegniamo il podio!
                    var quiz_gamers = gamers.getGamers(a_quiz.adminId);
                    console.log("checkPodio");
                    var podio = [
                        { nome: "", punteggio: 0, id: "" },
                        { nome: "", punteggio: 0, id: "" },
                        { nome: "", punteggio: 0, id: "" }
                    ];

                    quiz_gamers.sort((a, b) => (a.quiz_inside_info.punteggio < b.quiz_inside_info.punteggio) ? 1 : -1); //https://flaviocopes.com/how-to-sort-array-of-objects-by-property-javascript/

                    podio[0].nome = quiz_gamers.length > 0 ? quiz_gamers[0].name : "";
                    podio[0].punteggio = quiz_gamers.length > 0 ? quiz_gamers[0].quiz_inside_info.punteggio : "";
                    podio[0].id = quiz_gamers.length > 0 ? quiz_gamers[0].gamerId : 0;
                    podio[1].nome = quiz_gamers.length > 1 ? quiz_gamers[1].name : "";
                    podio[1].punteggio = quiz_gamers.length > 1 ? quiz_gamers[1].quiz_inside_info.punteggio : "";
                    podio[1].id = quiz_gamers.length > 1 ? quiz_gamers[1].gamerId : 0;
                    podio[2].nome = quiz_gamers.length > 2 ? quiz_gamers[2].name : "";
                    podio[2].punteggio = quiz_gamers.length > 2 ? quiz_gamers[2].quiz_inside_info.punteggio : "";
                    podio[2].id = quiz_gamers.length > 2 ? quiz_gamers[2].gamerId : 0;

                    io.to(a_quiz.pin).emit('GameOver', {
                        primo: podio[0],
                        secondo: podio[1],
                        terzo: podio[2]
                    });

                }
            });
        });

        io.to(a_quiz.pin).emit('gamer_next_question');//nell'ordine prima viene eseguita questa, e poi quanto si trova sopra, nella callback di MongoClient.connect
    });

    //Quando un admin o un giocatore lasciano il sito sia perchè cambiano pagina sia perchè la chiudono...entrambi gli eventi "distruggono" la socket e quindi richiedono in auto il socket.on("disconnect"))
    socket.on('disconnect', () => {
        console.log("disconnect");
        var a_quiz = quiz_.getQuiz(socket.id); //Si cerca il gioco sulla base della socket.id
        //Se viene trovato un quiz sulla base di tale socket.id, allora chi si sta disconnettendo è un admin
        if (a_quiz) {
            //Controllo se l'admin si è "disconnesso" o se ha fatto accesso alla game_view (cioè se game.quiz_inside_bool è false o true)..ovviamente se è "entrato" nel gioco live, allora non bisogna fare nulla di che
            if (a_quiz.quiz_inside_bool == false) {
                quiz_.elimina_quiz(socket.id);//Eliminiamo il quiz che si trova dentro l'oggetto della classe Quiz_inside_room
                //console.log('Game ended with pin:', a_quiz.pin);

                var gamers_remove = gamers.getGamers(a_quiz.adminId); //Prendiamo tutti i giocatori connessi al quiz

                //Per ciascun giocatore partecipante al quiz
                for (var i = 0; i < gamers_remove.length; i++) {
                    gamers.elimina_gamer(gamers_remove[i].gamerId); //Lo rimuoviamo dalla classe dei "gamers" (torna cioè un normale "user", non giocatore)
                }

                io.to(a_quiz.pin).emit('disconnessione_admin'); //Invia il giocatore indietro alla pagina principale
                socket.leave(a_quiz.pin); //L'admin lascia la stanza
            }
        } else {
            //Nessun quiz è stato trovato sulla base della socket.id attuale, quindi sigifica che non è LA SOCKET di un admin, bensì DI UN GIOCATORE CHE SI STA DISCONNETTENDO 
            var gamer = gamers.getGamer(socket.id); //Otteniamo l'istanza del giocatore
            //Se un giocatore viene trovato con l'id dell'attuale socket
            if (gamer) {
                var adminId = gamer.adminId;//Prendiamo l'id dell'admin del quiz cui il giocatore è iscritto
                var a_quiz = quiz_.getQuiz(adminId);//Prendiamo i dati del quiz medesimo, sfruttando l'adminId ottenuto
                var pin = a_quiz.pin;//Prendiamo il pin del quiz

                if (a_quiz.quiz_inside_bool == false) { //cioè IL GIOCO NON è ANCORA STATO AVVIATO, quindi il giocatore sta uscendo dalla "waiting_room"
                    gamers.elimina_gamer(socket.id);//Rimuovi il giocatore dall'oggetto della classe dei gamers
                    var quiz_gamers = gamers.getGamers(adminId);//Prende i giocatori rimasti in gioco

                    io.to(pin).emit('update_user_room', quiz_gamers);//Invia i dati ottenuti all'admin_waiting_room per aggiornare il nome dei giocatori connessi
                    socket.leave(pin); //il giocatore lascia la stanza

                }
            }
        }

    });

});
