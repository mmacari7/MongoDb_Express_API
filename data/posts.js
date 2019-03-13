// Michael Macari
// Posts Data

// Sets collections to the collections file
const mongo = require("mongodb")
const collections = require("./collections")
const animalsData = require("./animals")

// Stores the posts collection function in posts
const posts = collections.posts

// Stores the animals collection function in animals
const animals = collections.animals

// Exports functions for the posts db
const exportedMethods = {
    // Function to create and insert a new post into the posts database
    async createPost(title, content, posterId){
        // Checks parameters arent undefined
        if(!title || !content || !posterId){
            throw("Error posts.create: No title, content or posterId provided")
        }

        //Checks that parameters are passed as string
        if(typeof title !== 'string' || typeof content !== 'string'){
            throw("Error posts.create: Title or content is not of correct type")
        }

        const postsCollection = await posts()
        
        // Check that posterId is in animals data base
        let x = await animalsData.getAll()
        console.log(x)
        return
        
        //let animalPoster = await animalsData.get(posterId)
        console.log(animalPoster)


        // Creates a new post object for insertion based on schema provided
        let newPost = {
            title: title,
            author: animalPoster._id,
            content: content
        }

        // Gets the insertion info
        const insertInfo = await postsCollection.insertOne(newPost)

        // If nothing was inserted throw an error
        if(insertInfo.insertedCount === 0){
            throw("Error posts.createPost: Could not add the post into collection")
        }

        const newId = insertInfo.insertedId

        const post = await this.readPostByID(newId)
        return(post)

    },

    // Function to read a specific post by ID
    async readPostByID(postId){
        // Checks if postId is undefined
        if(!postId){
            throw("Error posts.readPostByID: postId was not defined")
        }

        if(typeof postId !== 'string' && typeof postId !== 'object'){
            throw("Error posts.readPostByID: Invalid id type passed in")
        }

        // Gets the collection from the database
        const postsCollection = await posts()

        // If the postId passed is not already a mongo id object, we attempt to make it one, otherwise throw
        let newId
        if(typeof(postId) !== 'object'){
            
            try{
                newId = new mongo.ObjectID(postId)
            }
            catch(e){
                throw("Error posts.readPostByID: Invalid ID")
            }
        }
        else{
            newId = postId
        }

        // Try to find the post in the data base with the postId throw error if not in db
        let post
        try{
            post = await postsCollection.findOne({_id: newId})
        }
        catch(e){
            throw("Error posts.readPostByID: No post with that ID")
        }

        // If no post is returned, then throw
        if(!post){
            throw("Error posts.readPostByID: No post with that ID")
        }

        return(post)
    },

    // Function that gets all items in collection posts
    async readAllPosts(){
        // Get the collection
        const postsCollection = await posts()
        // Get all from collection
        const allPosts = await postsCollection.find({}).toArray()

        return(allPosts)

    },
    
    // Function that deletes an item in collections post
    async deletePost(postId){
        // Check that postId Exists
        if(!postId){
            throw("Error posts.deletePost: postId was not provided")
        }

        // Checks that the input id is string
        if(typeof(postId) !== 'string' && typeof postId !== 'object'){
            throw("Error post.deletePost: postId is of incorrect type")
        }

        // Get the collection
        const postsCollection = await posts()

        // Convert string to mongo ObjectID if not already Object
        let newId
        if(typeof(postId) !== 'object'){
            
            try{
                newId = new mongo.ObjectID(postId)
            }
            catch(e){
                throw("Error posts.deletePost: Invalid ID")
            }
        }
        else{
            newId = postId
        }

        
        // Get the post at ID
        const post = await this.readPostByID(newId)

        // Attempt deletion
        const deletionInfo = await postsCollection.removeOne({_id: newId})

        if(deletionInfo.deletedCount === 0){
            throw("Error posts.deletePost: Could not delete post")
        }
        
        // Return deleted information similar to animals
        return({"deleted": true, "data": post})
    },

    async updatePost(){
        return
    }

}

module.exports = exportedMethods