const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
var ObjectId = require("mongodb").ObjectID;
var QRCode = require("qrcode");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function(req, res) {
  res.json({ message: "WELCOME" });
});

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads");
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  }
});

var upload = multer({ storage: storage });

const MongoClient = require("mongodb").MongoClient;
const myurl = "mongodb://localhost:27017";

app.post("/uploadphoto", upload.single("picture"), (req, res) => {
  var img = fs.readFileSync(req.file.path);
  var encode_image = img.toString("base64");

  var finalImg = {
    contentType: req.file.mimetype,
    image: new Buffer(encode_image, "base64")
  };
  db.collection("quotes").insertOne(finalImg, (err, result) => {
    if (err) return console.log(err);

    console.log("saved to database");
    //

    QRCode.toDataURL("localhost:3000/photo/" + result.insertedId, function(
      err,
      url
    ) {
      res.send(url);
    });
  });
});

app.get("/photo/:id", (req, res) => {
  var filename = req.params.id;

  db.collection("quotes").findOne(
    { _id: ObjectId(filename) },
    (err, result) => {
      if (err) return console.log(err);

      res.contentType("image/jpeg");
      res.send(result.image.buffer);
    }
  );
});

MongoClient.connect(myurl, (err, client) => {
  if (err) return console.log(err);
  db = client.db("test");
  app.listen(3000, () => {
    console.log("listening on 3000");
  });
});
