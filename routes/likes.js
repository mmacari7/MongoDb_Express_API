// Michael Macari
// Likes Routes

const express = require("express")
const router = express.Router()
const data = require("../data")
const postsData = data.posts
const animalsData = data.animals
const likesData = data.likes

// Post method for posting a new lkek to db, calls likes.postLike(animalId, postId) method
router.post("/:id", async (req, res) => {
    const animalId = req.params.id
    const postId = req.query.postId

    // Try to get the animal
    let animalLiker
    try{
        animalLiker = await animalsData.get(animalId)
    }
    catch(e){
        res.status(404).json({error: "No animal with that ID found"})
        return
    }

    // Error check to ensure parameter is passed
    if(!postId){
        res.status(400).json({error: "No ?postId= parameter passed"})
        return
    }

    // Try to get the post
    let postToLike
    try{
        postToLike = await postsData.readPostByID(postId)
    }
    catch(e){
        res.status(404).json({error: "No post with that ID found"})
        return
    }

    for(let i=0; i < animalLiker.likes.length; i++){
        if(String(postToLike._id) === String(animalLiker.likes[i])){
            res.sendStatus(200)
            return
        }
    }
    
    // Try to add the like to the animals likes array
    try{
        await likesData.postLike(animalLiker._id, postToLike._id)
        res.sendStatus(200)
    }
    catch(e){
        res.sendStatus(500)
        return
    }

})

// Delete function for likes
router.delete("/:id", async (req, res) => {
    const animalId = req.params.id
    const postId = req.query.postId

    // Try to get the animal
    let animalLiker
    try{
        animalLiker = await animalsData.get(animalId)
    }
    catch(e){
        res.status(404).json({error: "No animal with that ID found"})
        return
    }

    // Error check to ensure parameter is passed
    if(!postId){
        res.status(400).json({error: "No ?postId= parameter passed"})
        return
    }

    // Try to get the post
    let postToUnlike
    try{
        postToUnlike = await postsData.readPostByID(postId)
    }
    catch(e){
        res.status(404).json({error: "No post with that ID found"})
        return
    }

    // Try to remove the post
    try{
        await likesData.removeLike(animalLiker._id, postToUnlike._id)
        res.sendStatus(200)
    }
    catch(e){
        res.sendStatus(500)
    }
})

module.exports = router