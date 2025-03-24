import React from "react";

const Button = ({ type = "button", onClick, className, children, props }) => {
  return (
    <button
      {...props}
      type={type}
      onClick={onClick}
      className={`px-4 py-3 rounded-md transition-all duration-200 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;