const express = require("express");
const http = require("http");
const dbConnection = require("./connection/db");
const path = require("path");
const app = express();
////////////////////////////////////////////////
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: false }));
app.use("/static", express.static(path.join(__dirname, "public")));
///////////////////////////////////////////////

//Multer

const multer = require("multer");
const { query } = require("./connection/db");
const { render } = require("ejs");

//set storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    //set destionation
    cb(null, "./public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// file filter so only image are allowed
const fileFilter = function (req, file, cb) {
  if (!file.originalname.match(/\.(jpg|JPG|png|PNG|svg|SVG|mp3|MP3)$/)) {
    req.fileValidationError = {
      message: "Only image files are allowed",
    };

    return cb(new Error("Only image files are allowed", false));
  }

  cb(null, true);
};

// max file size in MB
const sizeMB = 20;
const maxSize = sizeMB * 1024 * 1024;

//upload function
const upload = multer({
  storage: storage,
  fileFilter,
  limits: {
    fileSize: maxSize,
  },
});

///////////////////////////////////////////
//Render addHeroes page
app.get("/addHeroes", (req, res) => {
  res.render("addHeroes");
});

app.post("/addHeroes", upload.single("image"), (req, res) => {
  const { name, type } = req.body;

  const imgName = req.file.filename;

  const query = "INSERT INTO heroes_tb (name, type_id, photo) VALUES (?,?,?)";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [name, type, imgName], (err, results) => {
      if (err) throw err;

      console.log(results);
      res.redirect("/");
    });
    conn.release();
  });
});

//Render Home Page
app.get("/", (req, res) => {
  dbConnection.getConnection((err, conn) => {
    if (err) throw err;
    const query = "SELECT * FROM heroes_tb";

    conn.query(query, (err, results) => {
      res.render("home", {
        title: "Mobile Legend Heroes",
        content: results,
      });
    });
    conn.release();
  });
});

//delete heroes
app.get("/delete/heroes/:id", function (req, res) {
  const { id } = req.params;

  const query = "DELETE FROM heroes_tb WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [id], () => {
      res.redirect("/");
    });
    conn.release();
  });
});

//delete type
app.get("/delete/type/:id", function (req, res) {
  const { id } = req.params;

  const query = "DELETE FROM type_tb WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [id], () => {
      res.redirect("/");
    });
    conn.release();
  });
});

//edit page
app.get("/edit/:id", (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM heroes_tb WHERE id = ${id}`;

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;
    conn.query(query, (err, results) => {
      if (err) throw err;

      res.render("edit", {
        id: results[0].id,
        name: results[0].name,
        typeId: results[0].type_id,
        photo: results[0].photo,
      });
    });
    conn.release();
  });
});

//post edit page
app.post("/edit/:id", upload.single("image"), (req, res) => {
  const { id, name, type } = req.body;
  const imgName = req.file.filename;
  const query =
    "UPDATE heroes_tb SET name = ?, type_id = ?, photo =? WHERE id = ?";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(query, [name, type, imgName, id], (err, results) => {
      if (err) throw err;
      res.redirect("/");
    });
    conn.release();
  });
});

//detail
app.get("/detail/:id", (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM heroes_tb WHERE id = ${id}`;

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;
    conn.query(query, (err, results) => {
      if (err) throw err;

      res.render("detail", {
        id: results[0].id,
        name: results[0].name,
        typeId: results[0].type_id,
        photo: results[0].photo,
      });
    });
    conn.release();
  });
});

//add Type
app.get("/addType", (req, res) => {
  res.render("addType");
});

app.post("/addType", (req, res) => {
  const { type } = req.body;
  const query = "INSERT INTO type_tb (name) VALUES (?)";

  dbConnection.getConnection((err, conn) => {
    if (err) throw err;
    conn.query(query, [type], (err, results) => {
      if (err) throw err;
      res.redirect("/");
    });
    conn.release();
  });
});

const port = 2000;
const server = http.createServer(app);
server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
