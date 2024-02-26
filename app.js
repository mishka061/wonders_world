import expressHandlebars from "express-handlebars";
import express from "express";
import __dirname from "./__dirname.js";
import mongodb from "mongodb";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import multer from "multer";
import path from "path";
import { ObjectId } from "mongodb";

const secretKey = "12345";
const handlebars = expressHandlebars.create({
  defaultLayout: "main",
  extname: "hbs",
});

let app = express();

app.use(express.static(__dirname + "/public/"));
app.use(express.static(__dirname + "/styles/"));
app.use(express.static(__dirname + "/img/"));
app.use(express.static(__dirname + "/uploads/"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(secretKey)); 
app.use(express.json());

app.engine("hbs", handlebars.engine);
app.set("view engine", "hbs");

let mongoClient = new mongodb.MongoClient("mongodb://127.0.0.1:27017");

let titles = {
  index: "Главная страница",
  heops: "Пирамида Хеопса",
  seramida: "Висячие сады Семирамиды",
  zevs: "Статуя Зевса в Олимпии",
  artemida: "Храм Артемиды",
  mavsola: "Мавзолей Мавсола",
  kollos: "Статуя Колосса Родосского",
  mayak: "Александрийский маяк",
};

function verifyToken(token) {
  try {
    let decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (error) {
    return null;
  }
}

try {
  let mongo = await mongoClient.connect();
  let db = mongo.db("test");
  let collUsers = db.collection("users");
  let collPosts = db.collection("posts");

  app.get("/admin/", function (req, res) {
    res.render("admin", {
      layout: "admin",
    });
  });

  app.get("/auth/users", async function (req, res) {
    try {
      let users = await collUsers.find({}).toArray();
      console.log(users);
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  app.get("/admin/registration", function (req, res) {
    res.render("admin", {
      registration: true,
      layout: "admin",
    });
  });

  app.post("/admin/registration", async function (req, res) {
    let { login, email, password } = req.body;

    if (req.body.submit) {
      let user = {
        login: login,
        email: email,
        password: password,
      };
      await collUsers.insertOne(user);
      console.log("Успешная регистрация");
      res.redirect("/admin/authorization");
    } else {
      console.log("Форма не отправлена");
      res.render("admin", {
        registration: true,
        layout: "admin",
      });
    }
  });

  app.get("/admin/authorization", function (req, res) {
    res.render("admin", { authorization: true, layout: "admin" });
  });

  app.post("/admin/authorization", async function (req, res) {
    let { login, password } = req.body;

    if (req.body.submit) {
      let user = await collUsers.findOne({ login, password });
      if (user) {
        let token = jwt.sign(
          {
            login: user.login,
            email: user.email,
            password: user.password,
          },
          secretKey,
          { expiresIn: "1h" }
        );
        res.cookie("token", token); 
        console.log("Успешная авторизация");
        res.redirect("/index");
        console.log("Куки записали ");
      } else {
        console.log("Авторизация не выполнена");
        res.redirect("/admin/authorization");
      }
    }
  });
  app.get("/:page", function (req, res) {
    let tokenIsPresent = req.cookies.token ? true : false;
    let user = null;
    console.log(user);
    if (tokenIsPresent) {
      try {
        let decoded = jwt.verify(req.cookies.token, secretKey);
        user = decoded.login;
        console.log(user + " login");
      } catch (error) {
        console.error(error);
        console.log("no user");
      }
    }
    res.render(req.params.page, {
      tokenIsPresent: tokenIsPresent,
      user: user,
      title: titles[req.params.page],
    });
  });

  app.get("/cookie/protected", function (req, res) {
    let token = req.cookies.token;
    if (token) {
      console.log("Значение куки прочитали: ", token);
      let decoded = verifyToken(token);
      if (decoded) {
        res.json({ message: "Доступ к защищенному ресурсу разрешен" });
      } else {
        return res.status(401).json({ message: "Токен недействителен" });
      }
    } else {
      console.log('Кука "token" не установлена.');
      return res.status(401).json({ message: "Отсутствует токен" });
    }
  });

  app.post("/logout", function (req, res) {
    res.cookie("token", null, { expires: new Date(0) });
    res.sendStatus(200);
  });
  let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });

  let upload = multer({ storage: storage });
  app.post("/upload", upload.single("image"), (req, res) => {
    res.send("Изображение успешно загружено.");
  });

  app.get("/index/posts", async function (req, res) {
    try {
      let posts = await collPosts.find().toArray();
      let tokenIsPresent = true;
      posts = posts.map((item) => ({
        _id: item._id.toString(), 
        heading: item.heading,
        text: item.text,
        img: item.img,
      }));
      if (req.cookies.token) {
        const user = await collUsers.findOne({ token: req.cookies.token });
        if (user) {
          tokenIsPresent = true;
        }
      }
      res.render("posts", { posts, tokenIsPresent });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.get('/addWonders"', function (req, res) {
    res.render("addWonders");
  });

  app.post("/addWonders", upload.single("image"), async function (req, res) {
    try {
      let { text, heading } = req.body;
      const imagePath = req.file.filename;
      const posts = {
        heading: heading,
        text: text,
        img: imagePath,
      };
      await collPosts.insertOne(posts);
      res.redirect("/index/posts");
    } catch (error) {
      console.error(error);
      res.render("addWonders", {
        addWonders: true,
        error: "Произошла ошибка при сохранении в базе данных",
      });
    }
  });

  app.get("/edit/:id", async function (req, res) {
    try {
      let postId = req.params.id;
      console.log(" app.get");
      console.log(postId);
      const postObjectId = new ObjectId(postId);

      let posts = await collPosts.findOne({ _id: postObjectId });
      console.log(posts);
      if (posts) {
        res.render("edit", { id: postId, posts });
      } else {
        res.status(404).send("Запись не найдена");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.post("/edit/:id", upload.single("image"), async function (req, res) {
    try {
      let postId = req.params.id;
      const postObjectId = new ObjectId(postId);
      let { text, heading } = req.body;
      let imagePath = req.file ? req.file.filename : null;

      if (!imagePath) {
        await collPosts.updateOne(
          { _id: postObjectId },
          { $set: { heading, text } }
        );
      } else {
        await collPosts.updateOne(
          { _id: postObjectId },
          { $set: { heading, text, img: imagePath } }
        );
      }

      res.redirect("/index/posts");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });
} catch (error) {
  console.log(error);
}

app.use(function (req, res) {
  res.status(404).render("404", { layout: "404" });
});

app.listen(3000, function () {
  console.log("running");
});
