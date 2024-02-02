const util = require("util");
const multer = require("multer");

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, __base_dir + req.body.dir.replaceAll("%20", " "));
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(' ').join('-').replaceAll("%20", " ");
    cb(null, fileName);
  },
});

let upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  // fileFilter: (req, file, cb) => {
  //   if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
  //     cb(null, true);
  //   } else {
  //     cb(null, false);
  //     return cb(new Error('File types allowed .jpeg, .jpg and .png!'));
  //   }
  // }
}).any();

let fileUploadMiddleware = util.promisify(upload);

module.exports = fileUploadMiddleware;
// uploadFile
