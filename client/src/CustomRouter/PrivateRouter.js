import React from "react";
import { Navigate, Outlet } from "react-router-dom";
// import { Route, Redirect } from "react-router-dom";

const PrivateRouter = ({ props }) => {
  const firstLogin = localStorage.getItem("firstLogin");
  return firstLogin ? <Outlet {...props} /> : <Navigate to="/" />;
  //   return firstLogin ? <Route {...this.props} /> :<Redirect to="/" />
};

export default PrivateRouter;