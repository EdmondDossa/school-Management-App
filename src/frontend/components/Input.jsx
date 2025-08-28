import React, { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Input = ({
  type,
  name,
  placeholder,
  value,
  onChange,
  className,
  readOnly = false,
  previewFile = null,
  required = false,
  autofocus = false,
}) => {
  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setPreview(previewFile);
  }, [previewFile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      if (onChange) {
        onChange(e);
      }
    }
  };

  if (type === "file") {
    return (
      <div className="space-y-2">
        <div
          className={`${
            preview ? "justify-between" : "justify-end"
          } h-[50px] w-full flex  items-center bg-[#2871FA1A] rounded-md overflow-hidden`}
        >
          {preview && (
            <div className="flex justify-center">
              <img
                src={preview}
                alt="Aperçu"
                className="w-[50px] h-[50px] rounded-md object-contain"
              />
            </div>
          )}
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="fileInput"
            required={required}
            accept="image/*"
          />
          <label
            htmlFor="fileInput"
            className="text-[14px] px-4 h-full flex items-center justify-center bg-gray-300 text-black cursor-pointer"
          >
            {preview ? "Changer de fichier" : "Choisir un fichier..."}
          </label>
        </div>
        {preview && (
          <p className="text-sm text-gray-500 truncate">
            Fichier sélectionné:{" "}
            {value?.name ||
              document.getElementById("fileInput")?.files[0]?.name}
          </p>
        )}
      </div>
    );
  }

  if (type === "password") {
    return (
      <div className="relative w-full">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          required={required}
          autoFocus={autofocus}
          className={`h-[50px] w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm outline-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${className}`}
        />
        <div
          className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </div>
      </div>
    );
  }

  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      required={required}
      autoFocus={autofocus}
      className={`h-[50px] w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm outline-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${className}`}
    />
  );
};

export default Input;
