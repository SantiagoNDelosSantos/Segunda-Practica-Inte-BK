import { Router } from "express";
import ManagerProducts from "../daos/mongodb/ProductsManager.class.js";

const router = Router();
const managerProducts = new ManagerProducts();

router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const product = await managerProducts.consultarProductoPorId(id);
        if (!product) {
            console.log(`No se encontró ningún producto con el ID ${id}.`)
            res.status(404).json({
                error: `No se encontró ningún producto con el ID ${id}.`
            });
        } else {
            res.send({product});
        }
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({
            error: "Error al consultar el producto. Por favor, inténtelo de nuevo más tarde."
        });
    }
});

router.get("/", async (req, res) => {
    try {

        const limit = Number(req.query.limit) || 10;
        const page = Number(req.query.page) || 1;
        let sort = Number(req.query.sort) || 1;
        let filtro = req.query.filtro || null;
        let filtroVal = req.query.filtroVal || null;

        const data = await managerProducts.consultarProductos(limit, page, sort, filtro, filtroVal);

        res.send(data);
        console.log(data.products.docs); 
    } 
    catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({
            error: "Error al consultar los productos. Por favor, inténtelo de nuevo más tarde."
        });
    }
});

router.post("/", async (req, res) => {
    try {
        console.log(req.body);

        const product = req.body;

        const createdProduct = await managerProducts.crearProducto(product);
        
        const products = await managerProducts.consultarProductos();

        req.socketServer.sockets.emit('productos', products);

        res.send({
            product: createdProduct
        });


    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({
            error: "Error al crear el producto. Por favor, inténtelo de nuevo más tarde."
        });
    }
});

router.put("/:pid", async (req, res) => {
    try {
        const pid = req.params.pid;
        const updatedFields = req.body;
        const updatedProduct = await managerProducts.actualizarProducto(pid, updatedFields);

        const products = await managerProducts.consultarProductos();

        req.socketServer.sockets.emit('productos', products);

        if (!updatedProduct) {
            console.log(`No se encontró ningún producto con el ID ${pid}.`)
            res.status(404).json({
                error: `No se encontró ningún producto con el ID ${pid}.`
            });
        } else {
            res.send(updatedProduct);
        }
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({
            error: "Error al actualizar el producto. Por favor, inténtelo de nuevo más tarde."
        });
    }
});

router.delete("/:pid", async (req, res) => {
    try {
        const pid = req.params.pid;
        const result = await managerProducts.eliminarProducto(pid);

        if (!result) {
            console.log(`No se encontró ningún producto con el ID ${pid}.`)
            res.status(404).json({
                error: `No se encontró ningún producto con el ID ${pid}.`
            });
        } else {
            const products = await managerProducts.consultarProductos();

            req.socketServer.sockets.emit('productos', products);
    
            res.send(result);
        }
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({
            error: "Error al eliminar el producto. Por favor, inténtelo de nuevo más tarde."
        });
    }
});

export default router;