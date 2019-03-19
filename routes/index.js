// Michael Macari
// Routes Index Exports

const animalRoutes = require("./animals")
const postsRoutes = require("./posts")
const likesRoutes = require("./likes")

const constructorMethod = app => {
  app.use("/animals", animalRoutes)
  app.use("/posts", postsRoutes)
  app.use("/likes", likesRoutes)

  app.use("*", (req, res) => {
      res.sendStatus(404)
  })
}

module.exports = constructorMethod