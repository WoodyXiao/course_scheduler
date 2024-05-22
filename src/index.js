import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Header from "./components/Header";
import "./index.css";
import Footer from "./components/Footer";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <div className="flex flex-col min-h-screen justify-start">
      <Header />
      <App />
      <Footer />
    </div>
  </React.StrictMode>
);
