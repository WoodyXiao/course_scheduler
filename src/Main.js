import React from "react";
import { Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CourseTreeview from "./pages/CourseTreeview";

function Main() {
  return (
    <div className="flex flex-col min-h-screen justify-start">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/CourseTreeview" element={<CourseTreeview />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default Main;
