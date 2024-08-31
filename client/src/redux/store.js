import { legacy_createStore as createStore, applyMiddleware } from "redux";
import rootReducer from './reducers/index'
import { thunk } from "redux-thunk";
// import { composeWithDevTools } from "redux-devtools-extension/developmentOnly";
import { Provider } from 'react-redux'

import logger from "redux-logger";

const store = createStore(rootReducer, applyMiddleware(thunk,logger));

// const store = createStore(
//   rootReducer,
//   composeWithDevTools(applyMiddleware(thunk))
// )
const DataProvider = ({children}) =>{
  return(
    <Provider store={store}>
      {children}
    </Provider>
  )
}

export default DataProvider;

