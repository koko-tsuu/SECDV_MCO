const mongoose = require('mongoose');

const connecttoDB = async() => {
    try{
        mongoose.set('strictQuery', false);
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Connected to Database: ${conn.connection.host}`);
    } catch(error){
        console.log(error);
    }
}

module.exports = connecttoDB;