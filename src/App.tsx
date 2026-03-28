import { Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import Game from "@/pages/Game";
import Rules from "@/pages/Rules";

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />      
      <Route path="/home" element={<Home />} />
      <Route path="/rules" element={<Rules />} />      
      <Route path="/game" element={<Game />} />
    </Routes>
  );
};
