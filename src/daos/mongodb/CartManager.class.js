import mongoose from "mongoose";
import {
    cartModel
} from "./models/carts.model.js";
import ManagerProducts from "./ProductsManager.class.js";

export default class ManagerCarts {

    // Conexión Mongoose:
    connection = mongoose.connect('mongodb+srv://santiagodelossantos630:D2jqGLvQZMF9LXbB@cluster0.tmhnws9.mongodb.net/?retryWrites=true&w=majority');

    productManager = new ManagerProducts();

    async crearCart() {
        const result = await cartModel.create({
            products: []
        });
        return result;
    };

    async consultarCartPorId(id) {
        const result = await cartModel.findOne({_id: id}).populate('products.product');
        return result;
    };
    
    async consultarCarts() {
        const result = await cartModel.find();
        return result;
    };

    async agregarProductoEnCarrito(cid, pid) {
        const cart = await this.consultarCartPorId(cid);
        const product = await this.productManager.consultarProductoPorId(pid);
        cart.products.push({
            product: product
        });
        await cart.save();
        return;
    }

    async deleteProductFromCart(cartId, productId) {
        const cart = await this.consultarCartPorId(cartId);
        cart.products.pull(productId);
        await cart.save();
        return;
    }

    async deleteAllProductFromCart(cartId) {
        const cart = await this.consultarCartPorId(cartId);
        cart.products = [];
        await cart.save();
        return;
    }

    async actualizarCarrito(cid, updatedCartFields) {
        let result = await cartModel.updateOne({
            _id: cid
        }, {
            $set: updatedCartFields
        });
        await cart.save();
        return result;
    }

    async actualizarProductoEnCarrito(cid, pid, updatedProdInCart) {
        const cart = await this.consultarCartPorId(cid);
        const product = cart.products.find((p) => p._id.toString() === pid);
        product.quantity = updatedProdInCart.quantity;
        await cart.save();
        return cart;
    }

}