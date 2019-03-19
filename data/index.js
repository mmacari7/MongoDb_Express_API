// Michael Macari
// Index file to export data modules

const postsData = require("./posts")
const animalData = require("./animals")
const likesData = require("./likes")
const connectionData = require("./connection")
const collectionsData = require("./collections")

module.exports = {
  animals: animalData,
  posts: postsData,
  likes: likesData,
  connection: connectionData,
  collections: collectionsData
}