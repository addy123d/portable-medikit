const mongo = require("mongoose");
const schema = mongo.Schema;

const dataSchema = new schema({
    id : {
        type: String,
        required : true
    },
    data : {
        type : [Object],
        required : true
    }
});

module.exports = Data = mongo.model("data",dataSchema);