import React, { useEffect, useState } from "react";

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

  useEffect(() => {
    setPreview(previewFile);
  }, [previewFile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Appeler la fonction onChange parente si elle existe
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
            accept="image/*" // Limite aux fichiers images
          />
          <label
            htmlFor="fileInput"
            className="text-[14px] px-4 h-full flex items-center justify-center bg-gray-300 text-black cursor-pointer"
          >
            {preview ? "Changer de fichier" : "Choisir un fichier..."}
          </label>
        </div>

        {/* Nom du fichier */}
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
      className={`h-[50px] w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${className}`}
    />
  );
};

export default Input;
