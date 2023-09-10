const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({


    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        default: () => new mongoose.Types.ObjectId(),
      }

});


const User = mongoose.model("user", userSchema);

module.exports = User;
