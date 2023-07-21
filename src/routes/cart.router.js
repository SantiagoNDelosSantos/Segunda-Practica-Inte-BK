import { Router } from "express";
import ManagerCarts from "../daos/mongodb/CartManager.class.js";;

const router = Router();
const managerCarts = new ManagerCarts();

router.get("/:id", async (req, res) =>{
    const id = req.params.id;
    const cart = await managerCarts.consultarCartPorId(id);
    res.send(cart);
});

router.get("/", async (req, res) => {
    const carts = await managerCarts.consultarCarts();
    res.send(carts);
});

router.post("/", async (req, res) => {
    await managerCarts.crearCart();
    res.send({ status: "Success."});
});

router.post('/:cid/products/:pid', async (req, res) => {
    const cartId = req.params.cid
    const productId = req.params.pid
    await managerCarts.agregarProductoEnCarrito(cartId, productId)
    res.send({status: 'Success.'})
}); 

// Elimina del carrito el producto seleccionado:
router.delete('/:cid/products/:pid', async (req, res) => {
    const cartId = req.params.cid
    const productId = req.params.pid
    await managerCarts.deleteProductFromCart(cartId, productId)
    res.send({status: 'Success.'})
}); 

// Elimina todos los productos del carrito seleccionado:
router.delete('/:cid', async (req, res) => {
    const cartId = req.params.cid
    await managerCarts.deleteAllProductFromCart(cartId)
    res.send({status: 'Success.'})
}); 

// Actualiza el carrito con el arreglo espeficado:
router.put('/:cid', async (req, res) => {
    try{
        const cid = req.params.cid;
        const updatedCartFields = req.body;

        const updatedCart = await managerCarts.actualizarCarrito(cid, updatedCartFields);

        if(!updatedCart){
            console.log(`No se encontró ningún carrito con el ID ${cid}.`)
            res.status(404).json({
                error: `No se encontró ningún carrito con el ID ${cid}.`
            });
        } else {
            res.send(updatedCart);
            console.log(`${updatedCart}.`)
        }
    }catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({
            error: "Error al actualizar el Carrito. Por favor, inténtelo de nuevo más tarde."
        });
    }
})

// Actualiza solo la cantidad de ejemplares del producto en el carrito: 


router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const cid = req.params.cid;
        const pid = req.params.pid;
        const updatedProdInCart = req.body;

        const updatedProdCart = await managerCarts.actualizarProductoEnCarrito(cid, pid, updatedProdInCart);

        if (!updatedProdCart) {
            console.log(updatedProdCart);
        } else {
            res.send(updatedProdCart);
            console.log(updatedProdCart);
        }
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Ocurrió un error al actualizar el producto en el carrito." });
    }
});

export default router;