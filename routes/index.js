// Michael Macari
// Routes Index Exports

const animalRoutes = require("./animals")
const postsRoutes = require("./posts")

const constructorMethod = app => {
  app.use("/animals", animalRoutes)
  app.use("/posts", postsRoutes)

  app.use("*", (req, res) => {
    res.sendStatus(404);
  });
};

module.exports = constructorMethod;