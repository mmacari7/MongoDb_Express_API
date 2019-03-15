// Michael Macari
// Animals Route
const express = require("express")
const router = express.Router()
const data = require("../data")
const animalsData = data.animals
const postsData = data.posts

// This function is so when a post is updated, the post title if changed will also change when animals are get
// Creates a function that converts an array of post ID's to an array of {_id: id, title: title}
const postsArrayToIdTitle = async (postsArray) => {
    let newArr = []
    for(let i=0; i < postsArray.length; i++){
        //Get the titles
        let curPost = await postsData.readPostByID(postsArray[i])
        // Create the new object
        let idTitle = {
            _id: curPost._id,
            title: curPost.title
        }
        // Append the new object to the new animals posts array
        newArr.push(idTitle)
    }
    
    // Return the new array
    return(newArr)
}

// Get method for getting an animal calls animals.get(id) method
router.get("/:id", async (req, res) => {
    try {
        const animal = await animalsData.get(req.params.id)
        // If the animal post array has anything in it
        if(animal.posts.length > 0){
            // Set animals array to posts so JSON returned has proper format

            animal.posts = await postsArrayToIdTitle(animal.posts)  
        }
        res.json(animal)
    } 
    catch (e) {
        res.status(404).json({ error: "Animal not found" })
    }
})

// Get method for getting entire db of animals, calls animals.getAll() method
router.get("/", async (req, res) => {
    try {
        const animalsList = await animalsData.getAll()
        // Update the JSON that is being returned to have posts: [{_id: id, title: title}] just like get, call conv func
        // For each of the animals in the array we update the posts array to the objects using function
        for(let i=0; i < animalsList.length; i++){
            // Call the function if the array has length
            if(animalsList[i].posts.length > 0){
                animalsList[i].posts = await postsArrayToIdTitle(animalsList[i].posts)
            }
        }

        res.json(animalsList)
    } 
    catch (e) {
        res.status(500).send(e)
    }
})

// Post method for posting a new animal to db, calls animals.create(name, animalType) method
router.post("/", async (req, res) => {
    const animalInfo = req.body

    if (!animalInfo) {
        res.status(400).json({error: "You must provide data to create an animal"})
        return
    }

    if(!animalInfo.name && !animalInfo.animalType){
        res.status(400).json({error: "Incorrect schema"})
    }
  
    if (!animalInfo.name) {
        res.status(400).json({error: "You must provide a name for the animal"})
        return
    }

    if (!animalInfo.animalType) {
        res.status(400).json({ error: "You must provide an animal type"})
        return
    }
  
    try {
        const newAnimal = await animalsData.create(animalInfo.name, animalInfo.animalType)
        res.status(200).json(newAnimal)
    } 
    catch (e) {
        res.status(500).send(e)
    }
})

// Post method for updating an animal by id, calls animals.updateAnimal(animalId, newAnimalJson) method
router.put("/:id", async (req, res) => {
    const animalInfo = req.body
    if(!animalInfo || animalInfo === undefined) {
        res.status(400).json({error: "You must provide data to update an animal"});
        return
    }   

    if(!animalInfo.newName && !animalInfo.newType){
        res.status(400).json({error: "Error animals.updateAnimal: animalJson has incorrect schema"})
        return
    }

    let jsonToPass = {}
    // If there is a new name field
    if(animalInfo.newName){
        // But the new name is not of correct type
        if(typeof animalInfo.newName !== 'string'){
            res.status(400).json({error: "Error animals.updateAnimal: animalJSON.newName is not of type string"})
            return
        }
        // Set the updating data newName to that of the JSON
        jsonToPass.newName = animalInfo.newName
    }
    // Check theres new type
    if(animalInfo.newType){
        // But the new type is not of correct type
        if(typeof animalInfo.newType !== 'string'){
            res.status(400).json({error: "Error animals.updateAnimal: animalJSON.newType is not of type string"})
            return
        }

        // Set the updating data newType to that of the JSON
        jsonToPass.newType = animalInfo.newType
    }

    // Try the ID requested
    try {
        await animalsData.get(req.params.id);
    } 
    catch (e) {
        res.status(404).json({error: "Animal not found" })
        return
    }

    // Try to update the animal
    try {
        const updatedAnimal = await animalsData.updateAnimal(req.params.id, jsonToPass)
        // Check if the updated animal has posts, if so, get the id and name of post
        if(updatedAnimal.posts.length > 0){
            updatedAnimal.posts = await postsArrayToIdTitle(updatedAnimal.posts)
        }
        res.status(200).json(updatedAnimal)
    } 
    catch (e) {
        res.status(500).send(e)
    }
})

// Delete function for router
router.delete("/:id", async (req, res) => {
    // Try to get the animal
    let animalForDelete
    let postsArr = []
    try{
        // Store the animal that is going to be deleted
        animalForDelete = await animalsData.get(req.params.id)
        // Format the posts array before we delete the animal, so we can display deltion info properly
        if(animalForDelete.posts.length > 0){
            postsArr = await postsArrayToIdTitle(animalForDelete.posts)    
        }
    }
    // If we cannot then we send error
    catch(e) {
        res.status(404).json({error: "Animal not found in db" })
        return
    }

    // Try to delete the animal
    try{
        // Get the deltion information
        let delInfo = await animalsData.remove(req.params.id)

        // Similarly to the above, store the posts we generated into the deltion info of the animal
        delInfo.data.posts = postsArr
        
        res.status(200).json(delInfo)
    }
    // If we cannot send internal error status
    catch(e) {
        res.status(500).send(e)
    }
})

module.exports = router