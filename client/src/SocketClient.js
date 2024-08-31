import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
// import {POST_TYPES} from './redux/actions/postAction'

const SocketClient = () => {
    const { auth, socket}  = useSelector(state => state)
    const dispatch = useDispatch()
    
    // // joinUser
    useEffect(() => {
      socket.emit('joinUser', auth.user._id)
    }, [socket, auth.user._id])
    
    // // likes
    useEffect(() => {
      socket.on("likeToClient", newPost => {
        console.log({newPost})
        // dispatch({ type: POST_TYPES.UPDATE_POST, payload: newPost});
      })
      // return () => socket.off("likeToClient")
    }, [socket])
    
    return <></>
}

export default SocketClient