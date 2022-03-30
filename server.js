const express = require("express");
let port = process.env.PORT || 3000;
let host = '0.0.0.0';

let app = express();

app.get("/test",(request,response)=>{
    let sensor = request.query.sensorType;
    let reading = request.query.reading;

    console.log("Reading: ");
    console.log(reading);

    response.json({
       sensor : sensor,
       reading : reading
    })
})

app.listen(port,host,()=>{
    console.log(`Server is running at ${port}`);
})