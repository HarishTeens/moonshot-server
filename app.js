const express=require('express')();

express.get("/",(req,res)=>{
    res.send("Hello World");
})

express.listen(5000,()=>{
    console.log("Server Started at http://localhost:5000");
})
