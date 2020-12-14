// Require packages
const express = require("express");
const path = require("path");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const moment = require("moment");

const db = require("_helpers/db");

const methodOverride = require("method-override");

const connectionOptions = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

// Initialize environment
const app = express();
const mongoURI =
  "mongodb+srv://ql-student-expenses:ql-student-expenses@cluster0.xpl5r.mongodb.net/ql-student-expenses-app?retryWrites=true&w=majority";

// Create Mongo connection
const conn = mongoose.createConnection(mongoURI, connectionOptions);

// Middleware
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static("uploads"));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Add image uploads Endpoint
router.post("/upload", upload.single("image"), (req, res, next) => {
  const fileName = req.file.filename;
  const objType = fileName.split("-")[0];
  const objId = fileName.split("-")[1];
  const objUploadedDate = fileName.split("-")[2].split(".")[0];
  // add image to Objects Images array
  addImageToObject(objId, objType, fileName);
});

// Adder Function for Images
async function addImageToObject(objId, objType, fileName) {
  const entity = await db[`${objType}`].findById(objId);

  // Saving date formated....TODO!!! probably should do for every date....
  const timeCreatedFormated = moment(Date.now()).format("MM-DD-YYYY @HH:mm:ss");

  await entity.images.push({
    fileName: fileName,
    created: timeCreatedFormated,
  });
  entity.updated = Date.now();
  await entity.save();
}

// Delete a file EndPoint
router.delete("/files/:fileName", (req, res) => {
  // Delete image from whatever obj array
  const fileName = req.params.fileName;
  const objType = fileName.split("-")[0];
  const objId = fileName.split("-")[1];
  const objUploadedDate = fileName.split("-")[2].split(".")[0];
  removeImageFromObject(objId, objType, fileName);
});

// Deleter Function
async function removeImageFromObject(objId, objType, fileName) {
  const attribute = `${objType.toLowerCase()}Images`; //<-- defining Images selector
  await db[`${objType}`].updateOne(
    { _id: objId },
    { $pull: { images: { fileName: fileName } } }
  );
}

module.exports = router;
