import React from 'react';

const Input = ({ type, name, placeholder, value, onChange, className }) => {
    if (type === "file") return <>
        <div className="h-[50px] w-full flex justify-end items-center bg-[#2871FA1A]  rounded-md overflow-hidden">
            <input
              type="file"
              onChange={onChange}
              className="hidden text-[#00000099] h-[50px] w-full"
              id="fileInput"
            />
            <label htmlFor="fileInput" className="text-[14px] px-4 h-full flex items-center justify-center bg-gray-300 text-black cursor-pointer">
              Choisir un fichier...
            </label>
        </div>
    </>;
    return (
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange} 
            className={` w-full p-3 rounded-md bg-[#2871FA1A] text-[#00000099] placeholder-[#00000099] h-[50px] border-none focus:outline-none focus:ring-0 ${className}`}
        />
    );
};

export default Input;
