const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const usersCollection = 'users';

const usersSchema = new Schema({
    userName: { type: String, required: true },
    password: { type: String, required: true },
    admin: { type: Boolean, required: true, default: false }
});

module.exports = mongoose.model(usersCollection, usersSchema);