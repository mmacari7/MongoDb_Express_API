// Michael Macari
// MongoDB and Express Application
// Entry Point

const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const configRoutes = require("./routes")

// Configure the body parser
app.use(bodyParser.json())
// Create the configuration
configRoutes(app)

// Start the server
app.listen(3000, () => {
    console.log("Server is running on localhost:3000")
})