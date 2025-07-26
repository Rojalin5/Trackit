import { User } from "../models/user.models.js";

const generateUserName = async(name) =>{
    const orgUserName = name.toLowerCase().replace(/\s+/g,'').replace(/[^a-zA-Z0-9]/g,'')
    let uniqueUserName = orgUserName
    let counter =1
    while(await User.exists({username:uniqueUserName})){
        uniqueUserName = `${orgUserName}${counter}`
        counter++
    }
    return uniqueUserName
}
export {generateUserName}