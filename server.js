const express = require("express");
const mongo = require("mongoose");
let port = process.env.PORT || 3000;
let host = '0.0.0.0';

// Bring Tables
let Data = require("./tables/Data");

// Mongo URL
let url = require("./setup/config").url;

// Database Connection
mongo.connect(url)
    .then(()=>{
        console.log("Database sucessfully connected !");
    })
    .catch(err=>console.log("Error: ",err));

let app = express();

app.get("/test",(request,response)=>{
    let user_id = request.query.id;
    let sensor = request.query.sensorType;
    let reading = request.query.reading;

    // Store data in database
    Data.findOne({id : user_id})
        .then((record)=>{
            if(record){
                // If document exists already !
                Data.updateOne({
                    id : user_id
                },{
                    $push : {
                        data : {
                            sensorName : sensor,
                            reading : reading,
                            timeStamp : new Date().toLocaleString()
                        }
                    }
                },{
                    $new : true
                })
                    .then(()=>{
                        response.json({
                            message : "Updated Successfully"
                        });
                    })
                    .catch(err=>console.log("Error: ",err));



            }else{
                // If its your first reading  !
                let dataObject = {
                    id : user_id,
                    data : [{sensorName : sensor,reading : reading,timeStamp : new Date().toLocaleString()}]
                }

                new Data(dataObject).save()
                    .then(()=>{
                        response.json({
                            message : "Updated Successfully"
                        });
                    })
                    .catch(err=>console.log("Error: ",err));
            }
        })
        .catch(err=>console.log("Error: ",err));
})

app.listen(port,host,()=>{
    console.log(`Server is running at ${port}`);
})