import { getDataAPI, postDataAPI } from "../../utils/fetchData";
import { GLOBALTYPES } from "../actions/globalTypes";

export const MESS_TYPES = {
  ADD_USER: "ADD_USER",
  ADD_MESSAGE: "ADD_MESSAGE",
  GET_CONVERSATIONS: "GET_CONVERSATIONS",
  GET_MESSAGES: "GET_MESSAGES",
};

export const addUser =({ user, message }) =>
  (dispatch) => {
    if (message.users.every((item) => item._id !== user._id)) {
      dispatch({
        type: MESS_TYPES.ADD_USER,
        payload: { ...user, text: "", media: [] },
      });
    }
    //  dispatch({type: MESS_TYPES.ADD_MESSAGE, payload: msg})

    // const { _id, avatar, fullname, username } = auth.user
    // socket.emit('addMessage', {...msg, user: { _id, avatar, fullname, username } })

    // try {
    //     await postDataAPI('message', msg, auth.token)
    // } catch (err) {
    //     dispatch({type: GLOBALTYPES.ALERT, payload: {error: err.response.data.msg}})
    // }
  };

export const addMessage = ({ msg, auth, socket }) =>
  async (dispatch) => {
    dispatch({ type: MESS_TYPES.ADD_MESSAGE, payload: msg });
    socket.emit('addMessage', msg);
    try {
      await postDataAPI('message', msg, auth.token);
    } catch (err) {
      dispatch({
        type: GLOBALTYPES.ALERT, 
        payload: { error: err.response.data.msg },
      });
    }
  }

export const getConversations = ({auth}) => async(dispatch) => {
    try {
      const res = await getDataAPI("conversations", auth.token);
      let newArr = []
      res.data.conversations.forEach((item) => {
        item.recipients.forEach((cv) => {
          if (cv._id !== auth.user._id) {
            newArr.push({ ...cv, text: item.text, media: item.media });
            
          }
        });
      });
      dispatch({
        type: MESS_TYPES.GET_CONVERSATIONS,
        payload: { newArr, result: res.data.result },
      });
    } catch (err) {
      dispatch({
        type: GLOBALTYPES.ALERT, 
        payload: { error: err.response?.data.msg },
      });
    }
  }

export const getMessages = ({auth, id}) => async(dispatch)=>{
    try {
      const res = await getDataAPI(`message/${id}`, auth.token)
      dispatch({type: MESS_TYPES.GET_MESSAGES, payload: res.data })

    } catch (err) {
      dispatch({
        type: GLOBALTYPES.ALERT,
        payload: { error: err.response?.data.msg },
      });
    }
  }
