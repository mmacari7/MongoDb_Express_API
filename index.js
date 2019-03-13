// Michael Macari
// MongoDB and Express Application
// Entry Point

const data = require("./data")
const animalData = data.animals
const postsData = data.posts
const connection = data.connection
const collection = data.collections
const mongo = require("mongodb")

async function main(){

    const db = await connection()
    
            
    // let donny = await animalsData.get("5c88032265738348e0b2bba8")
    // console.log(donny)


    //let donny2 = await animalsData.get(donny._id)

    let donnysPost = await postsData.createPost("Donny's Pissed", "Im sick and tired of all these snakes", "5c88032265738348e0b2bba8")
    console.log(donnysPost)
    

    // catch(e){
    //     console.log(e)
    // }

    await db.serverConfig.close();


}

main()