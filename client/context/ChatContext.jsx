import {  useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContextObject";
import {ChatContext} from "./chatContextObject";
import toast from "react-hot-toast";
import { createContext } from "react";

export const ChatContext = createContext();
export const ChatContext = createContext();

export const ChatProvider = ({children})=>{

    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const {socket, axios} = useContext(AuthContext);


    //function to get all users fo sidebar

    const getUsers = async() => {
        try{
            const {data} = await axios.get("/api/messages/users");
            if(data.success){
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages);

            }
             
        }catch(error){
            toast.error(error.message);
            
        }
    }

    //function to get messages for selected user

    const getMessages = async(userId)=> {
      try{
       const {data} = await axios.get(`/api/messages/${userId}`);
        if(data.success){
            setMessages(data.messages)
        }
      }catch(error){
        toast.error(error.message)
      }
    }

    //function to send message to selected user

    const sendMessage = async(messageData)=>{
        try{
         const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`,messageData);
         if(data.success){
            setMessages((prevMessages)=>[...prevMessages, data.newMessages])
         }else{
            
                toast.error(data.message);
            }
         
        }catch(error){
            toast.error(error.message)
        }
    }
    

    // function to subscribe to messages for selected user

    const subscribeToMessages =  ()=>{
        if(!socket) return;

        socket.on("newMessages", (newMessages)=>{
            if(selectedUser && newMessages.senderId === selectedUser._id){
                newMessages.seen = true;
                setMessages((prevMessages)=> [...prevMessages, newMessages])
                axios.put(`/api/messages/mark/${newMessages._id}`);
            }else{
                   setUnseenMessages((prevUnseenMessages)=>({
                              ...prevUnseenMessages, [newMessages.senderId] : prevUnseenMessages[newMessages.senderId] ? prevUnseenMessages[newMessages.senderId] + 1 : 1
                   }))
            }
        })
    }

    //function to unscribe from messages

    const unsubscribeFromMessages =()=>{
        if(socket) socket.off("newMessages");
    }

    useEffect(()=>{
       subscribeToMessages();
       return unsubscribeFromMessages;
    },[socket, selectedUser])

 const value = {
     messages, users, selectedUser, getUsers, getMessages, sendMessage, setSelectedUser, unseenMessages, setUnseenMessages 
}

    return (
        <ChatContext.Provider value={value}>
             {children}
        </ChatContext.Provider>
    )
}