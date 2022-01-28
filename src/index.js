import express from "express";
import dotenv from 'dotenv';

dotenv.config()
//this makes sure that the environment variable is loaded before the process runs up
//as the .env file is in the root we don't need to specify the path of the file 
//otherwise we'll have to specify the path of the .env file like :- dotenv.config("../.env")

const app = express()

const port = process.env.PORT || 3000

console.log(process.env.DB_URL)

// process.stdout.write("hello standard output")

app.listen(port, (req, res) => {
    console.log(`Server listening at PORT ${port}`)
})