const mongoose = require("mongoose");

const DB=process.env.DATABASE;

mongoose.connect(DB,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{ console.log("DataBase connected")}).catch((e)=>console.log(e));