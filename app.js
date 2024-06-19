
require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
require("./db/conn");
const cors = require("cors");
const PORT = process.env.PORT || 2612
const router = require("./Routes/Router");

app.use(cors());
app.use(express.json());
app.use(router);

app.use("/uploads",express.static("./uploads"));

app.get("/",(req,res)=>{
    res.status(201).json("server started");
});

app.listen(PORT, ()=>{
    console.log(`server is up and running in port ${PORT}`);
});


