const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    login: String,
    password: String,
    photos: [{ body: String, createdDate: Date, deletedDate: Date }]
})

module.exports = mongoose.model('User', userSchema)

