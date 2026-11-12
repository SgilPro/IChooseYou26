import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "../../docs-site/tokens.css";
import "../../docs-site/header.css";
import "../../docs-site/components.css";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
