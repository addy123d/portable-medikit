const express = require("express");
const session = require("express-session");
const mongo = require("mongoose");
const ejs = require("ejs");
let port = process.env.PORT || 3000;
let host = '0.0.0.0';

const hour = 3600000;
// Bring Tables
let Data = require("./tables/Data");
let User = require("./tables/User");

// Mongo URL
let url = require("./setup/config").url;


let app = express();

const sess = {
    name: "User",
    resave: false,
    saveUninitialized: true,
    secret: "mySecret",
    cookie: {}
}


//   if (app.get('env') === "production") {
sess.cookie.secure = false; //http or https
sess.cookie.expires = new Date(Date.now() + hour)
sess.cookie.maxAge = hour;
sess.cookie.sameSite = true;
// }


app.use(session(sess));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Database Connection
mongo.connect(url)
    .then(() => {
        console.log("Database sucessfully connected !");
    })
    .catch(err => console.log("Error: ", err));



app.set("view engine", "ejs");

function unauthenticated(request, response, next) {
    console.log(request.session);

    if (request.session.contact != undefined) {
        next();
    } else {
        response.redirect("/login");
    }
}

function authenticated(request, response, next) {
    if (request.session.contact) {
        response.redirect("/dashboard");
    } else {
        next();
    }
}

app.use("/",express.static(__dirname + "/public"));

app.get("/register", authenticated, (request, response) => {
    response.render("register");
});

app.get("/login", authenticated, (request, response) => {
    response.render("login");
});


app.post('/registerDetails', (request, response) => {
    console.log(request.body);
    let { name, rfid, contact, password } = request.body;

    rfid = rfid.toUpperCase();

    User.findOne({ contact: contact })
        .then((user) => {
            if (user) {
                response.json({
                    code: 400
                })
            } else {
                let userObject = {
                    name, rfid, contact, password
                }

                new User(userObject).save()
                    .then(() => {
                        request.session.name = name;
                        request.session.contact = contact;
                        request.session.RFID = rfid;
                        response.json({
                            code: 200
                        })
                    })
                    .catch(err => console.log("Error: ", err));
            }
        })
        .catch(err => console.log("Error: ", err));
});

app.post("/loginDetails", (request, response) => {
    let { contact, password } = request.body;

    User.findOne({ contact: contact })
        .then((user) => {
            if (user) {
                if (user.password === password) {
                    request.session.name = user.name;
                    request.session.contact = user.contact;
                    request.session.RFID = user.rfid;

                    response.json({
                        code: 200
                    })
                }
            } else {
                response.json({
                    code: 400
                })
            }
        })
        .catch(err => console.log("Error: ", err));
});

app.get("/dashboard", unauthenticated, (request, response) => {

    let { RFID } = request.session;

    // Bring Data table !
    Data.findOne({ id: RFID })
        .then((data) => {
            if (data) {
                console.log(data.data);
                   response.render("dashboard",{
                       name : request.session.name,
                       deviceData : data.data,
                       id : RFID
                   })
            } else {
                response.json({
                    message: "No such data available on this id :("
                })
            }

        })
        .catch(err => console.log("Error: ", err));
})

app.get("/test", (request, response) => {
    let user_id = request.query.id;
    let sensor = request.query.sensorType;
    let reading = request.query.reading;

    User.findOne({ rfid: user_id })
        .then((user) => {
            if (user) {
                // Store data in database
                Data.findOne({ id: user_id })
                    .then((record) => {
                        if (record) {
                            // If document exists already !
                            Data.updateOne({
                                id: user_id
                            }, {
                                $push: {
                                    data: {
                                        sensorName: sensor,
                                        reading: reading,
                                        timeStamp: new Date().toLocaleString()
                                    }
                                }
                            }, {
                                $new: true
                            })
                                .then(() => {
                                    response.json({
                                        message: "Updated Successfully"
                                    });
                                })
                                .catch(err => console.log("Error: ", err));



                        } else {
                            // If its your first reading  !
                            let dataObject = {
                                id: user_id,
                                data: [{ sensorName: sensor, reading: reading, timeStamp: new Date().toLocaleString() }]
                            }

                            new Data(dataObject).save()
                                .then(() => {
                                    response.json({
                                        message: "Updated Successfully"
                                    });
                                })
                                .catch(err => console.log("Error: ", err));
                        }
                    })
                    .catch(err => console.log("Error: ", err));
            } else {
                response.json({
                    "message": "User doesn't exists"
                })
            }
        })
        .catch(err => console.log("Error: ", err));


})

app.listen(port, host, () => {
    console.log(`Server is running at ${port}`);
})


// Landing page
// Register Login
// Data Page 