import React from "react";
import { Link } from "react-router-dom";
import Menu from "./Menu";
import Search from "./Search";
// import arlog from "../../images/aricons.png";

const Header = () => {
  return (
    <div className="header bg-light">
      <nav
        className="navbar navbar-expand-lg navbar-light
            bg-light justify-content-between align-middle"
      >
        <Link to="/" className="logo">
          <h1
            style={{
              fontFamily: "Arial",
              fontSize: "48px",
              fontWeight: "bold",
              color: "#4A90E2",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)",
              transition: "color 0.3s ease",
            }}
            className="navbar-brand text-uppercase  p-0 m-0"
            onClick={() => window.scrollTo({ top: 0 })}
          >
            {/* <img width="50px" src={arlog} alt="Not found" /> */}
            YaarTalk
          </h1>
        </Link>

        <Search />

        <Menu />
      </nav>
    </div>
  );
};

export default Header;
