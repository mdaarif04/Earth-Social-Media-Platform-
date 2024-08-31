import React from "react";
import { useParams } from "react-router-dom";
import NotFound from "../components/NotFound";
import { useSelector } from "react-redux";

const generatePage = (pageName) => {
  const components = () => require(`../pages/${pageName}`).default;

  try {
    return React.createElement(components());
  } catch (error) {
    return <NotFound />;
  }
};

const PageRender = () => {
  const { page, id } = useParams();
  const { auth } = useSelector((state) => state);

  let pageName = "";

  if (auth.token) {
    if (id) {
      pageName = `${page}/[id]`;
    } else {
      pageName = `${page}`;
    }
    // console.log(pageName);
  }
  return generatePage(pageName);
};

export default PageRender;
