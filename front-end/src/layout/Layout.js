import React from "react";
import Menu from "./Menu";
import Routes from "./Routes";

import "./Layout.css";

/**
 * @returns {JSX.Element}
 */
function Layout() {
  return (
    <div className="row col-12 p-0 m-0">
      <div className="col-12 m-0 p-0">
        <Menu />
      </div>
      <div className="row col-12">
        <div className="col-12 m-0 p-0">
          <Routes />
        </div>
      </div>
    </div>
  );
}

export default Layout;
