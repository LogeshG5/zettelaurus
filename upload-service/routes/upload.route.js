const express = require("express");
const router = express.Router();

const controller = require("../controller/fileUpload.controller");

let routes = (app) => {
  router.post("/upload-file", controller.uploadFile)

  router.get("/file", controller.getFilesList)

  router.get("/files/*", controller.downloadFiles)

  router.post("/post-file", controller.postFile)

  app.use(router);
};

module.exports = routes;
