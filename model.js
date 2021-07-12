const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let User = new Schema(
    {
        firstname: {
            type: String
        },
        lastname: {
            type: String
        },
        address1: {
            type: String
        },
        address2: {
            type: String
        },
        city: {
            type: String
        },
        state: {
            type: String
        },
        zip: {
            type: Number
        },
        country: {
            type: String
        },
        date: {
            type: Date
        }
    },
    { collection: "MerkleUsers"}
);

module.exports = mongoose.model("users", User);