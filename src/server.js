import express, { urlencoded } from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import handlebars from "express-handlebars";
import __dirname from "./utils.js";

import sessionRouter from './routes/session.router.js'
import routerMessage from './routes/message.router.js'
import routerProducts from './routes/products.router.js';
import routerCart from './routes/cart.router.js'
import viewsRouter from "./routes/views.router.js";

import { Server, Socket } from 'socket.io';

import ManagerProducts from './daos/mongodb/ProductsManager.class.js';
import ManagerMessage from './daos/mongodb/MessagesManager.class.js';
import ManagerCarts from './daos/mongodb/CartManager.class.js';
import { logout } from './public/js/profile.js';

import passport from 'passport';
import initializePassport from './config/passport.config.js';

// Iniciamos el servidor:
const app = express();

// Conexión Mongoose: 
const connection = mongoose.connect('mongodb+srv://santiagodelossantos630:D2jqGLvQZMF9LXbB@cluster0.tmhnws9.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Rutas extendidas:
app.use(express.json());
app.use(urlencoded({ extended: true }));
// Configuración de archivos estáticos
app.use(express.static(__dirname + '/public'));

// Configuración Handlebars
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');


// Passport:
initializePassport();

// SESSION:  
app.use(session({
    store: new MongoStore({
        mongoUrl: 'mongodb+srv://santiagodelossantos630:D2jqGLvQZMF9LXbB@cluster0.tmhnws9.mongodb.net/?retryWrites=true&w=majority',
    }),
    secret: 'mongoSecret',
    resave: true,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


// Servidor HTTP:
const expressServer = app.listen(8080, () => {
    console.log(`Servidor iniciado en el puerto 8080.`);
});

// Servidor Socket.io escuchando servidor HTTP:
const socketServer = new Server(expressServer);

// Managers:
export const pdcMANGR = new ManagerProducts();
export const smsMANGR = new ManagerMessage();
export const cartMANGR = new ManagerCarts();

socketServer.on("connection", async (socket) => {

    // Mensaje de nuevo cliente conectado:
    console.log("¡Nuevo cliente conectado!", socket.id)

    // Products:

    // Carga de productos inicial (Sin presionar el Boton de Filtrar):
    // Traigo los productos de ManagerProducts sin filtrar y los guardo en products:
    const products = await pdcMANGR.consultarProductos();
    // Envio a traves del canal 'productos' todos los products sin filtrar:
    socket.emit('productos', products);

    // Recibo el producto para agregar al carrtito:
    socket.on("agregarProductoEnCarrito", async ({
        cartID,
        productID
    }) => {
        if (cartID && productID) {
            await cartMANGR.agregarProductoEnCarrito(cartID, productID);
            console.log(`server-prodc: ${productID}`)
            console.log(`server-cart: ${cartID}`)
        }
    });

    // Buscamos el title del product para el Alert:
    socket.on("buscarTile", async (productIDValue) => {
        let product = await pdcMANGR.consultarProductoPorId(productIDValue);
        socket.emit("titleEncontrado", product);
    });


    // Recibo los filtros de main.js en busquedaProducts:

    socket.on('busquedaFiltrada', async (busquedaProducts) => {

        const {
            limit,
            page,
            sort,
            filtro,
            filtroVal
        } = busquedaProducts;

        const products = await pdcMANGR.consultarProductos(limit, page, sort, filtro, filtroVal);

        socket.emit('productos', products);

    });

    // Otros sockets de Prodcuts:

    // Escuchamos el evento addProduct y recibimos el producto:
    socket.on("addProduct", (data) => {
        products.push(data);
        socketServer.emit("productos", products);
    })

    // Escuchamos el evento deleteProduct y recibimos el id del producto:
    socket.on("deleteProduct", (id) => {
        products.splice(
            products.findIndex((product) => product.id === id), 1
        );
        socketServer.emit("productos", products);
    })


    // Carts:

    // Traigo todos los carritos y los guardo en carts:
    const carts = await cartMANGR.consultarCarts();
    // Envio a traves del canal 'carritos' todos los carritos:
    socket.emit('carritos', {
        docs: carts
    });

    // Accedo a los productos de un carrito especifico: 
    socket.on("CartCid", async (cartID) => {
        const cartCID = await cartMANGR.consultarCartPorId(cartID);
        socketServer.emit("CARTID", (cartCID));
    })

    //Messages:

    // Escuchamos el evento addMessage y recibimos el mensaje:
    socket.on("addMessage", (sms) => {
        messages.push(sms);
        socketServer.emit("messages", messages);
    })

    // Enviamos los mensajes al usuario:
    const messages = await smsMANGR.verMensajes();
    socket.emit("messages", messages);

    // Escuchamos el evento deleteMessage y recibimos el id del mensaje.
    socket.on("deleteMessage", (id) => {
        messages.splice(
            messages.findIndex((message) => message.id === id), 1
        );
        socketServer.emit("messages", messages);
    })

});

app.use((req, res, next) => {
    req.socketServer = socketServer;
    next()
});

// Rutas:
app.use('/', viewsRouter);

app.use('/api/sessions', sessionRouter);

app.use('/api/chat/', routerMessage)
app.use('/api/realtimeproducts', routerProducts);
app.use('/api/carts/', routerCart);

app.get('/logout', logout);