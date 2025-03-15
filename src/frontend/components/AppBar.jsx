import {
  VscChromeClose,
  VscChromeMaximize,
  VscChromeMinimize,
} from "react-icons/vsc";
import React from "react";
const AppBar = () => {
  return (
    <div className="h-[50px] text-center opacity-[1] bg-[#1c6758] flex justify-between items-center text-[calc(10px + 2vmin)] text-black">
      <div><h1 className="p-2 text-xl font-bold text-gray-800">School Manager</h1></div>
      {/* Frame Name */}
      <div className="flex h-full items-center">
        {" "}
        {/* Minimize Maximize Close Icons */}
          <div 
            onClick={() => {
              window.electronAPI.minimize(); /* API Call To Minimize The Window */
            }} 
            className="w-[50px] h-full hover:cursor-pointer hover:bg-gray-400 flex items-center justify-center"
          >
            <VscChromeMinimize />
          </div>
          <div 
            onClick={() => {
              window.electronAPI.maximize(); /* API Call To Minimize The Window */
            }} 
            className="w-[50px] h-full hover:cursor-pointer hover:bg-gray-400 flex items-center justify-center"
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
