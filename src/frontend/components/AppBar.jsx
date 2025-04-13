import {
  VscChromeClose,
  VscChromeMaximize,
  VscChromeMinimize,
} from "react-icons/vsc";
import React from "react";
import { SchoolManager } from "../assets/icons";
const AppBar = () => {
  return (
    <div className="z-50 h-[50px] text-center opacity-[1] bg-[#FFFFFF] flex justify-between items-center text-[calc(10px + 2vmin)] text-black shadow-lg shadow-[#000000]">
      <div className="px-8">
        <img src={SchoolManager} className="h-[40px]"/>
      </div>
      {/* Frame Name */}
      <div className="flex h-full items-center">
        {" "}
        {/* Minimize Maximize Close Icons */}
          <div 
            onClick={() => {
              window.electronAPI.minimize(); /* API Call To Minimize The Window */
            }} 
            className="w-[50px] h-full hover:cursor-pointer hover:bg-[#2871FA1A] flex items-center justify-center"
          >
            <VscChromeMinimize />
          </div>
          <div 
            onClick={() => {
              window.electronAPI.maximize(); /* API Call To Minimize The Window */
            }} 
            className="w-[50px] h-full hover:cursor-pointer hover:bg-[#2871FA1A] flex items-center justify-center"
          >
            <VscChromeMaximize/>
          </div>
          <div 
            onClick={() => {
              window.electronAPI.close("mainWindow"); /* API Call To Minimize The Window */
            }} 
            className="w-[50px] h-full hover:cursor-pointer hover:bg-red-500 flex items-center justify-center"
          >
            <VscChromeClose/>
          </div>
      </div>
    </div>
  );
}

export default AppBar;
