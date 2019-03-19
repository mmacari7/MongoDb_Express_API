// Michael Macari
// Posts Data

// Sets collections to the collections file
const mongo = require("mongodb")
const collections = require("./collections")
const animalsData = require("./animals")

// Stores the posts collection function in posts
const posts = collections.posts

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
        let animalPoster
        try{
            animalPoster = await animalsData.get(posterId)
        }
        catch(e){
            throw(e)
        }

        // Creates a new post object for insertion based on schema provided
        let newPost = {
            title: title,
            content: content,
            author: animalPoster._id
        }

        // Gets the insertion info
        const insertInfo = await postsCollection.insertOne(newPost)

        // If nothing was inserted throw an error
        if(insertInfo.insertedCount === 0){
            throw("Error posts.createPost: Could not add the post into collection")
        }

        const newId = insertInfo.insertedId

        const post = await this.readPostByID(newId)

        // Call the function to insert the post into the animals posts array
        // Returns the updated animal
        let updatedAnimal = await animalsData.addPostToAnimal(animalPoster._id, post._id)

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
        const animalWhoPosted = await animalsData.get(post.author)

        postDataBeingRemoved = {
            _id: post._id,
            title: post.title,
            content: post.content,
            author: {
                _id: post.author,
                name: animalWhoPosted.name
            }
        }
        

        // Attempt deletion
        const deletionInfo = await postsCollection.removeOne({_id: newId})
        const a = await animalsData.removePostFromAnimal(animalWhoPosted._id, post._id)

        if(deletionInfo.deletedCount === 0){
            throw("Error posts.deletePost: Could not delete post")
        }
        
        // Return deleted information similar to animals
        return({"deleted": true, "data": postDataBeingRemoved})
    },

    async updatePost(postId, newPostJson){
        // Check ID definition
        if(!postId){
            throw("Error posts.updatePost: postId was not defined")
        }

        // Checks that the input postId is string or object
        if(typeof(postId) !== 'string' && typeof postId !== 'object'){
            throw("Error posts.updatePost: PostId is not of correct type")
        }

        // Checks that a JSON was passed
        if(!newPostJson || newPostJson === undefined){
            throw("Error post.updatePost: postJson was not defined")
        }

        // Checks that there is at least one defined type
        if(!newPostJson.newTitle && !newPostJson.newContent){
            throw("Error posts.updatePosts: postsJson has incorrect schema")
        }

        // Local variable to retrieve the updated JSON
        let updatedPostsData = {}

        // If we have a newTitle to update
        if(newPostJson.newTitle){
            // But the new title is not of correct type
            if(typeof newPostJson.newTitle !== 'string'){
                throw("Error posts.updatePosts: postJSON.newTitle is not of type string")
            }
            // Set the updating data newTitle to that of the JSON
            updatedPostsData.title = newPostJson.newTitle
        }
        // If we have a type to update
        if(newPostJson.newContent){
            // But the new type is not of correct type
            if(typeof newPostJson.newContent !== 'string'){
                throw("Error posts.updatePosts: newPostsJson.newContent is not of type string")
            }

            // Set the updating data newType to that of the JSON
            updatedPostsData.content = newPostJson.newContent
        }

        // Get the animals
        const postsCollection = await posts()

        // Convert the id string to a mongo ObjectID in try catch if not object
        let newId
        if(typeof(postId) !== 'object'){
            
            try{
                newId = new mongo.ObjectID(postId)
            }
            catch(e){
                throw("Error posts.getPost: Invalid ID")
            }
        }
        else{
            newId = postId
        }

        // Get the animal to be updated
        let post = await this.readPostByID(newId)


        // Made it past all intial error checks
        // Creates the update command
        let updateCommand = {
            $set: updatedPostsData
        }

        const query = {
            _id: newId
        }
        // Perform the update
        let updateInfo
        try{
            updateInfo = await postsCollection.updateOne(query, updateCommand)
        }
        catch(e){
            throw("Error posts.updatePost: Could not perform update, possible incorrect field")
        }
        

        // If nothing was updated throw
        if(updateInfo.modifiedCount === 0){
            throw("Error posts.updatePost: Could not update posts, possible duplicate")
        }

        // Return the newly updated post at the ID
        return(await this.readPostByID(newId))
    }
}

module.exports = exportedMethods