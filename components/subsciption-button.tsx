"use client"

import axios from "axios"   
import { Zap } from "lucide-react"
import { Button } from "./ui/button"
import { useState } from "react"
import toast from "react-hot-toast"

interface SubscriptionButtonProps{
    ispro:boolean
}

export const SubscriptionButton=({ispro=false}:SubscriptionButtonProps)=>{
    const [loading,setLoading]=useState(false);
const onClick=async()=>{
try {
    setLoading(true)
    const response= await axios.get("/api/stripe")
    window.location.href= response.data.url;

} catch (error) {
    console.log(error);
    
toast.error("someting went wrong")
}finally{
    setLoading(false)
}
}
return(
    <Button disabled={loading} variant={!ispro? "default":"premium"} onClick={onClick}>
        {ispro?"Manage Subscription":"Ugrade"}
        {!ispro && <Zap className="w-4 h-4 ml-2 fill-white"/>}
    </Button>
)
}