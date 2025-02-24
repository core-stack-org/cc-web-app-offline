import { api_url } from "../helper/constants";

export default async function getStates() {
    
    try{
        const response = await fetch(`${api_url}proposed_blocks/`, {
            method: "GET",
            headers: {
                "ngrok-skip-browser-warning": "1",
                "Content-Type": "application/json",
            },
        })

        return await response.json()
    }catch(err){
        //throw new Error(err)
        console.log(err)
    }
}