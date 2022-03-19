const express = require("express");
let port = process.env.PORT || 3000;
let host = '0.0.0.0';

let app = express();

app.get("/test/:uid",(request,response)=>{
    let id = request.params.uid;

    console.log("ID: ");
    console.log(id);

    response.json({
        message : id
    })
})

app.listen(port,host,()=>{
    console.log(`Server is running at ${port}`);
})