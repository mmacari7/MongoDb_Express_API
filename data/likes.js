// Michael Macari
// Likes Data

// Sets our required variables
const mongo = require("mongodb")
const collections = require("./collections")
const animalsData = require("./animals")

// Stores the animals collection function in animals
const animals = collections.animals
const posts = collections.posts

// Exports functions for adding a liked post to an animal
const exportedMethods = {

    async postLike(animalId, postId){
        let animalCollection = await animals()
        let updateInfo = await animalCollection.updateOne({_id: animalId}, {$addToSet: {likes: postId}})

        return
    },
    
    // Exports function for removing a liked post from animal
    async removeLike(animalId, postId){
        let animalCollection = await animals()
        let updateInfo = await animalCollection.updateOne({_id: animalId}, {$pull: {likes: postId}})

        return
    },

    async removeAllAnimalLikesForPost(postBeingRemovedId){
        let allAnimals = await animalsData.getAll()

        // Iterate through all the animals to remove the post thats being deleted from the animals likes
        for(let i=0; i < allAnimals.length; i++){
            let curAnimal = allAnimals[i]
            await this.removeLike(curAnimal._id, postBeingRemovedId)
        }

        return

    }

}

module.exports = exportedMethods