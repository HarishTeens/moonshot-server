const express=require('express')();

express.get("/",(req,res)=>{
    res.send("Hello World");
})

express.listen(8000,()=>{
    console.log("Server Started at http://localhost:5000");
})
