import React from "react";
import Home from "./pages/Home";
import Header from "./components/Header";
import Footer from "./components/Footer";

function Main() {
  return (
    <div className="flex flex-col min-h-screen justify-start">
      <Header />
      <Home />
      <Footer />
    </div>
  );
}

export default Main;
