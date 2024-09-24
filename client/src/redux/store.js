import { legacy_createStore as createStore, applyMiddleware } from "redux";
import rootReducer from './reducers/index.js'
import { thunk } from "redux-thunk";
// import { composeWithDevTools } from "redux-devtools-extension/developmentOnly";
import { Provider } from 'react-redux'

// import logger from "redux-logger";

// const store = createStore(rootReducer, 
//   applyMiddleware(thunk,logger));
const store = createStore(rootReducer, applyMiddleware(thunk));


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

// import { legacy_createStore as createStore, applyMiddleware } from "redux";
// import rootReducer from "./reducers/index";
// import { thunk } from "redux-thunk";
// import { Provider } from "react-redux";
// import logger from "redux-logger";
// import { composeWithDevTools } from "redux-devtools-extension";

// // Create the store with thunk and logger middleware, and integrate Redux DevTools
// const store = createStore(
//   rootReducer,
//   composeWithDevTools(applyMiddleware(thunk, logger))
// );

// const DataProvider = ({ children }) => {
//   return <Provider store={store}>{children}</Provider>;
// };

// export default DataProvider;
