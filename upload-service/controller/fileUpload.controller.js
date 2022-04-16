const upload = require("../middleware/fileUpload");

const URL = "http://localhost:8888/files/";
const fs = require("fs");


const uploadFile = async (req, res) => {
  try {
    console.log("UploadFile requested");
    await upload(req, res);
    res.status(200).send({
      message: "File uploaded successfully",
    });
  } catch (err) {
    console.log(err);

    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "File size should be less than 5MB",
      });
    }

    res.status(500).send({
      message: `Error occured: ${err}`,
    });
  }
};

const getFilesList = (req, res) => {
  fs.readdir(__base_dir, function(err, files) {
    if (err) {
      res.status(500).send({
        message: "Files not found.",
      });
    }

    let filesList = [];

    files.forEach((file) => {
      filesList.push({
        name: file,
        url: URL + file,
      });
    });

    res.status(200).send(filesList);
  });
};

const downloadFiles = (req, res) => {
  const fileName = req.originalUrl.replace("/files/", "");

  console.log("Requested: " + fileName);

  res.download(__base_dir + fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "File can not be downloaded: " + err,
      });
    }
  });
};

const getDirectories = (req, res) => {
  const walkSync = require("walk-sync");
  let all = walkSync(__base_dir, {
    globs: ["**/*"],
    directories: true,
    ignore: ['.git'],
  });
  let dirs = all.filter(file => file[file.length - 1] == "/");
  res.status(200).send(dirs);
};

const postFile = (req, res) => {
  try {
    if (req.body.filePath == undefined) {
      console.log("Provide file path");
      return res.status(400).send({ message: "Provide file path" });
    }

    if (req.body.fileContents == undefined) {
      console.log("Provide file contents");
      return res.status(400).send({ message: "Provide file contents" });
    }
    const filePath = __base_dir + req.body.filePath;

    fs.writeFile(filePath, req.body.fileContents, err => {
      if (err) {
        console.error(err)
        throw err
      }
      console.log(filePath, "written successfully");
    });
    res.status(204).send({
      // message: req.body.fileContents
    });
    // res.redirect(req.body.editUrl);
  } catch (err) {
    console.log(err);

    res.status(500).send({
      message: `Error occured: ${err}`,
    });
  }
};

module.exports = { uploadFile, downloadFiles, getFilesList, postFile, getDirectories };
