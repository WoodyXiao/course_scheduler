import React from "react";
import { Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CourseTreeView from "./pages/CourseTreeView";



function Main() {
  return (
    <div className="flex flex-col min-h-screen justify-start">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courseTreeView" element={<CourseTreeView />} /> 
      </Routes>
      <Footer />
    </div>
  );
}

export default Main;
