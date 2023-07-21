import mongoose from "mongoose";
import { messageModel } from "./models/messages.model.js"

export default class ManagerMessage {

    // Conexión Mongoose:
    connection = mongoose.connect('mongodb+srv://santiagodelossantos630:D2jqGLvQZMF9LXbB@cluster0.tmhnws9.mongodb.net/?retryWrites=true&w=majority');

    async nuevoMensaje(sms) {
        let result = await messageModel.create(sms);
        return result;
    };

    async verMensajes() {
        let result = await messageModel.find().lean();
        return result;
    }

    async eliminarMensaje(mid) {
        let result = await messageModel.deleteOne({_id: mid})
        return result;
    };
}