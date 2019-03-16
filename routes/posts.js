// Michael Macari
// Animals Route
const express = require("express")
const router = express.Router()
const data = require("../data")
const postsData = data.posts
const animalsData = data.animals

// Function similar to animals, takes in author Id and returns the author and the title of the post
// Works so if the animal at author ID is updated or changed, the changes are returned as well
const getAuthorName = async (id) => {
    let animal = await animalsData.get(id)
    // Creates the object to be returned
    let idName = {
        _id: id,
        name: animal.name
    }
    return(idName)
}

// Get method for getting a post calls posts.readPostById(postId) method
router.get("/:id", async (req, res) => {
    try {
        const post = await postsData.readPostByID(req.params.id)
        post.author = await getAuthorName(post.author)
        res.status(200).json(post)
    } 
    catch (e) {
        res.status(404).json({error: "Post not found"})
    }
})

// Get method for getting entire db of posts, calls posts.readAllPosts() method
router.get("/", async (req, res) => {
    try {
        const postsList = await postsData.readAllPosts()

        // For all authors in all posts get the author and id and set into author
        for(let i=0; i < postsList.length; i++){
            postsList[i].author = await getAuthorName(postsList[i].author)
        }

        res.json(postsList)
    } 
    catch (e) {
        res.status(500).send(e)
    }
})

// Post method for posting a new post to db, calls posts.createPost(title, content, posterId) method
router.post("/", async (req, res) => {
    const postInfo = req.body

    if (!postInfo) {
        res.status(400).json({error: "You must provide data to create the post"})
        return
    }

    if(!postInfo.title && !postInfo.author && !postInfo.content){
        res.status(400).json({error: "Incorrect schema"})
    }
  
    if (!postInfo.title) {
        res.status(400).json({error: "You must provide a title for the post"})
        return
    }

    if (!postInfo.content) {
        res.status(400).json({ error: "You must provide content for the post"})
        return
    }

    if(!postInfo.author){
        res.status(400).json({error: "You must provide an author for the post"})
    }
  
    try {
        // Returns the updated animal
        const newPost = await postsData.createPost(postInfo.title, postInfo.content, postInfo.author)
        // Gets the id and author name properly
        newPost.author = await getAuthorName(newPost.author)
        res.status(200).json(newPost)
    } 
    catch (e) {
        res.status(500).send(e)
    }
})

// Post method for updating a post by id, calls posts.updatePost(postId, newPostJson) method
router.put("/:id", async (req, res) => {
    const postInfo = req.body
    if(!postInfo || postInfo === undefined) {
        res.status(400).json({error: "You must provide data to update the post"})
        return
    }   

    if(!postInfo.newTitle && !postInfo.newContent){
        res.status(400).json({error: "Error posts.updatePost: postJson has incorrect schema"})
        return
    }

    let jsonToPass = {}
    // If there is a new name field
    if(postInfo.newTitle){
        // But the new name is not of correct type
        if(typeof postInfo.newTitle !== 'string'){
            res.status(400).json({error: "Error posts.updatePost: postJson.title is not of type string"})
            return
        }
        // Set the updating data newTitle to that of the JSON
        jsonToPass.newTitle = postInfo.newTitle
    }

    // Check theres new type
    if(postInfo.newContent){
        // But the new type is not of correct type
        if(typeof postInfo.newContent !== 'string'){
            res.status(400).json({error: "Error posts.updatePost: postJSON.newContent is not of type string"})
            return
        }

        // Set the updating data newContent to that of the JSON
        jsonToPass.newContent = postInfo.newContent
    }

    // Try the ID requested
    try {
        await postsData.readPostByID(req.params.id)
    } 
    catch (e) {
        res.status(404).json({error: "Post not found" })
        return
    }

    // Try to update the post
    try {
        const updatedPost = await postsData.updatePost(req.params.id, jsonToPass)
        // Get the author name of the newly updated post for reconvey
        updatedPost.author = await getAuthorName(updatedPost.author)
        
        res.status(200).json(updatedPost)
    } 
    catch (e) {
        res.status(500).send(e)
    }
})

// Delete function for posts router
router.delete("/:id", async (req, res) => {
    // Try to get the post
    let postForDelete

    try{
        // Store the post that is going to be deleted
        postForDelete = await postsData.readPostByID(req.params.id)
    }
    // If we cannot get the post then send an error
    catch(e) {
        res.status(404).json({error: "Post not found in db" })
        return
    }

    // Try to delete the post
    try {
        // Get the deletion information
        let delInfo = await postsData.deletePost(req.params.id)

        // Update author of post in del info to display author id and name
        delInfo.data.author = await getAuthorName(delInfo.data.author._id)
        res.status(200).json(delInfo)
    }
    // If we cannot send internal error status
    catch(e) {
        res.status(500).send(e)
    }
})


module.exports = router