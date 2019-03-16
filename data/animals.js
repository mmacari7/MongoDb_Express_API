// Michael Macari
// Animals Data

// Sets collections to the collections file
const mongo = require("mongodb")
const collections = require("./collections")

// Stores the animals collection function in animals
const animals = collections.animals

// Exports all functions for the animals db
const exportedMethods = {
    // Function to create and insert new item into animals collection
    async create(name, animalType){
        // Checks that name and animal type aren't undefined
        if(!name || !animalType){
            throw("Error animals.create: One or both parameters passed are not defined")
        }
        if(typeof name !== 'string'  || typeof animalType !== 'string'){
            throw("Error animals.create: One or both parameters are not of type string")
        }

        // Gets the animal collection
        const animalCollection = await animals()


        // Creates a new animal object for insertion based on schema provided
        let newAnimal = {
            name: name,
            animalType: animalType,
            likes: [],
            posts: []
        };

        // Gets the insertion info
        const insertInfo = await animalCollection.insertOne(newAnimal)
        // If nothing was inserted throw an error
        if(insertInfo.insertedCount === 0){
            throw("Error animals.create: Could not add the animal to collection")
        }

        const newId = insertInfo.insertedId

        const animal = await this.get(newId)
        return(animal)

    },

    // Function that gets all items in collection animals
    async getAll(){
        // Get the collection
        const animalCollection = await animals()
        // Get all from collection
        const allAnimals = await animalCollection.find({}).toArray()

        return(allAnimals)

    },

    // Function to get a specific item in animal collections by id
    async get(id){
        // Checks if id is undefined
        if(!id){
            throw("Error animals.get: id was not defined")
        }

        if(typeof id !== 'string' && typeof id !== 'object'){
            throw("Error animals.get: Invalid id type passed in")
        }

        // Gets the collection from the database
        const animalCollection = await animals()

        // If the id passed is not already a mongo id object, we attempt to make it one, otherwise throw
        let newId
        if(typeof(id) !== 'object'){
            
            try{
                newId = new mongo.ObjectID(id)
            }
            catch(e){
                throw("Error animals.get: Invalid ID")
            }
        }
        else{
            newId = id
        }
        
        // Try to find the animal in the data base with the ID throw error if not in db
        let animal
        try{
            animal = await animalCollection.findOne({_id: newId})
        }
        catch(e){
            throw("Error animals.get: No animal with that ID")
        }

        // If no animal is returned, then throw
        if(!animal){
            throw("Error animals.get: No animal with that ID")
        }

        return(animal)

    },

    // Function to remove a specific animal
    async remove(id){
        // Check id exists
        if(!id){
            throw("Error animals.remove: id was not defined")
        }
        // Checks that the input id is string
        if(typeof(id) !== 'string' && typeof id !== 'object'){
            throw("Error animals.remove: Invalid ID type")
        }


        // Get the collection
        const animalCollection = await animals()


        // Convert string to mongo ObjectID if not already Object
        let newId
        if(typeof(id) !== 'object'){
            
            try{
                newId = new mongo.ObjectID(id)
            }
            catch(e){
                throw("Error animals.remove: Invalid ID")
            }
        }
        else{
            newId = id
        }

        // Get the animal at ID
        const animalBeingRemoved = await this.get(newId)

        // Delete all posts by animal
        await this.deleteAllPostsByAnimal(animalBeingRemoved)

        // Attempt deletion
        const deletionInfo = await animalCollection.removeOne({_id: newId})

        // Throw error if deletion was not possible
        if(deletionInfo.deletedCount === 0){
            throw("Error animals.remove: Could not delete animal")
        }
        
        return({"deleted": true, "data": animalBeingRemoved})

    },

    async updateAnimal(animalId, newAnimalJson){
        // Check ID definition
        if(!animalId){
            throw("Error animals.updateAnimal: animalId was not defined")
        }

        // Checks that the input animalId is string or object
        if(typeof(animalId) !== 'string' && typeof animalId !== 'object'){
            throw("Error animals.updateAnimal: AnimalId is not of correct type")
        }

        // Checks that a JSON was passed
        if(!newAnimalJson || newAnimalJson === undefined){
            throw("Error animals.updateAnimal: animalJson was not defined")
        }

        // Checks that there is at least one defined type
        if(!newAnimalJson.newName && !newAnimalJson.newType){
            throw("Error animals.updateAnimal: animalJson has incorrect schema")
        }

        // Local variable to retrieve the updated JSON
        let updatedAnimalData = {}

        // If we have a newName to update
        if(newAnimalJson.newName){
            // But the new name is not of correct type
            if(typeof newAnimalJson.newName !== 'string'){
                throw("Error animals.updateAnimal: animalJSON.newName is not of type string")
            }
            // Set the updating data newName to that of the JSON
            updatedAnimalData.name = newAnimalJson.newName
        }
        // If we have a type to update
        if(newAnimalJson.newType){
            // But the new type is not of correct type
            if(typeof newAnimalJson.newType !== 'string'){
                throw("Error animals.updateAnimal: animalJSON.newType is not of type string")
            }

            // Set the updating data newType to that of the JSON
            updatedAnimalData.animalType = newAnimalJson.newType
        }

        // Get the animals
        const animalCollection = await animals()

        // Convert the id string to a mongo ObjectID in try catch if not object
        let newId
        if(typeof(animalId) !== 'object'){
            
            try{
                newId = new mongo.ObjectID(animalId)
            }
            catch(e){
                throw("Error animals.get: Invalid ID")
            }
        }
        else{
            newId = animalId
        }

        // Get the animal to be updated
        let animal = await this.get(newId)


        // Made it past all intial error checks
        // Creates the update command
        let updateCommand = {
            $set: updatedAnimalData
        }

        const query = {
            _id: newId
        }
        // Perform the update
        let updateInfo
        try{
            updateInfo = await animalCollection.updateOne(query, updateCommand)
        }
        catch(e){
            throw("Could not perform update, possible incorrect field")
        }

        // If nothing was updated throw
        if(updateInfo.modifiedCount === 0){
            throw("Error animals.rename: Could not update animal, possible duplicate")
        }

        // Return the newly updated animal at the ID
        return(await this.get(newId))
    },
    
    // Function to add post to animal array
    async addPostToAnimal(animalId, postId, postTitle){

        let animalCollection = await animals()
        let updateInfo = await animalCollection.updateOne({_id: animalId}, {$addToSet: {posts: postId}})

        if(updateInfo.modifiedCount === 0){
            throw("Error animals.addPostToAnimal: Could not add the post to the animal")
        }

        // Return the updated animal
        return(await this.get(animalId))

    },

    // Function to remove post from animal array
    async removePostFromAnimal(animalId, postId){
        let animalCollection = await animals()
        let updateInfo = await animalCollection.updateOne({_id: animalId}, {$pull: {posts: postId}})

        if(updateInfo.modifiedCount === 0){
            throw("Error animals.removePostFromAnimal: Could not remove post from animal")
        }

        // Return the updated animal
        return(await this.get(animalId))    
    },

    async deleteAllPostsByAnimal(animal){
        // Get the posts collection
        const postsCollection = await collections.posts()
        
        if(animal.posts.length > 0){
            for(let i=0; i < animal.posts.length; i++){
                let delPost = await postsCollection.removeOne({_id: animal.posts[i]})
                
                if(delPost.deletedCount === 0){
                    throw("Error animal.deleteAllPostsByAnimal: Could not delete posts")
                }
            }
        }

        return

    }

}
module.exports = exportedMethods