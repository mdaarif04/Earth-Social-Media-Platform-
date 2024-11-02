import { GLOBALTYPES } from "../actions/globalTypes";

const initialState = {
  token: null,
  user: null,
  loading: false,
  error: null,
  emailSent: false, 
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case GLOBALTYPES.AUTH:
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        loading: false,
      };
    case GLOBALTYPES.LOADING:
      return {
        ...state,
        loading: true,
      };
    case GLOBALTYPES.ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case GLOBALTYPES.EMAIL_SENT: 
      return {
        ...state,
        emailSent: true,
      };
    default:
      return state;
  }
};

export default authReducer;
