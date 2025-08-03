import React from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";


const Sidebar = ({ selectedUser,/* setSelectedUser*/ }) => {
  const navigate = useNavigate();

  

  return (
    <div>
      <h2>Sidebar is working!</h2>
      {/* Add your sidebar content here */}
    </div>
  );
};

  



export default Sidebar;