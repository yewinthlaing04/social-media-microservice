import express from 'express' 
import { registerUser } from '../controllers/user-controller.js'

const userRoute = express.Router()

// registeration user endpoint 

userRoute.post("/register" , registerUser)

export default userRoute