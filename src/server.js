const express = require("express");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const {
    engine
} = require("express-handlebars");
const routerAPI = express.Router();
const PATH = require('path')
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const PORT = process.env.PORT || 8080;
const denv = require('dotenv');
const dotenv = denv.config();
const productRouter = require("./routers/productRouter");
const userRouter = require("./routers/userRouter");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo")
const passport = require('passport');
const flash = require('connect-flash');

// --- MongoDB Models ---
const Message = require("./db/Message");
const Product = require("./db/Product");
const {
    faker
} = require('@faker-js/faker');

// --- Normalizr ---
const normalizr = require('normalizr');
const normalize = normalizr.normalize;
const denormalize = normalizr.denormalize;
const schema = normalizr.schema;

const author = new schema.Entity('authors', {}, {
    idAttribute: 'email'
})
const text = new schema.Entity('texts', {
    author: author
}, {
    idAttribute: '_id'
})

// middleware
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(express.static("./public"));
app.use(cookieParser());
app.use(flash());

// --- Session ---
const sessionOptions = {
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_ATLAS_URL
    }),
    secret: 's3cr3t0',
    resave: true,
    saveUninitialized: true,
    cookie: {
        expires: 60 * 1000
    }
}

app.use(session(sessionOptions));

// --- PASSPORT ---
app.use(passport.initialize());
app.use(passport.session());
app.use(function (err, req, res, next) {
    console.log(err);
});

// Routers
app.use("/", routerAPI);
app.use("/productos", productRouter);
app.use("/user", userRouter);

app.get('/', (req, res) => {
    res.redirect('/productos')
});

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});
server.on("error", (error) => console.log("Server Error\n\t", error));

// handlebars engine
app.engine(
    "hbs",
    engine({
        extname: ".hbs",
        defaultLayout: "index.hbs",
        layoutsDir: PATH.resolve() + "/views",
        partialsDir: PATH.resolve() + "/views/partials",
    })
);

app.set("views", "views");
app.set("view engine", "hbs");

//Mongoose
connect()

function connect() {
    mongoose.connect(process.env.MONGO_ATLAS_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 1000
        })
        .then(() => console.log('Conectado a la base de datos...'))
        .catch(error => console.log('Error al conectarse a la base de datos', error));
}

io.on('connection', (socket) => {
    console.log('Someone is connected');

    //funcion para leer todos los mensajes de la db y mostrarlos.
    function selectAllMessages() {
        Message.find().sort({
                'date': -1
            })
            .then(messages => {
                const parsedMessages = messages.map(function (m) {
                    return {
                        _id: m._id.toString(),
                        author: {
                            email: m.author.email,
                            name: m.author.name,
                            lastName: m.author.lastName,
                            age: m.author.age,
                            alias: m.author.alias,
                            avatar: m.author.avatar
                        },
                        text: m.text,
                        timeStamp: m.timeStamp
                    };
                })
                const normalizedMsgs = normalize(parsedMessages, [text]);
                console.log('Longitud antes de normalizar:', JSON.stringify(messages).length);
                console.log('Longitud después de normalizar:', JSON.stringify(normalizedMsgs).length);
                socket.emit('messages', {
                    messages: messages,
                    normalizedMsgs: normalizedMsgs,
                });
            })
            .catch(e => {
                console.log('Error getting messages: ', e);
            });
    }

    //funcion para leer todos los productos de la db y mostrarlos.
    function selectAllProducts() {
        Product.find().sort({
                '_id': 1
            })
            .then(products => {
                socket.emit('productCatalog', {
                    products: products,
                    errorMessage: "No hay productos"
                });
            })
            .catch(e => {
                console.log('Error getting products: ', e);
            });
    }

    //Llamo a las funciones para que se muestren los mensajes y productos al levantar el servidor.
    selectAllMessages();
    selectAllProducts();

    //Inserto un nuevo mensaje en la base de datos de mensajes.
    socket.on('newMsg', newMsg => {
        Product.create(newMsg)
            .then(() => {
                console.log('Mensaje insertado');
                selectAllMessages();
                return false;
            })
            .catch(e => {
                console.log('Error en Insert message: ', e);
            });
    });
});