import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

const Select = ({
  options = [],
  value,
  onChange,
  placeholder = "Sélectionner une option",
  disabled = false,
  error = false,
  label = "",
  className = "",
  triggerClassName = "",
  optionClassName = "",
  size = "md",
  variant = "default",
  searchable = false,
  multiple = false,
  clearable = false,
  maxHeight = "200px",
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectRef = useRef(null);
  const inputRef = useRef(null);

  // Styles selon la taille
  const sizeStyles = {
    sm: "px-2 py-1 text-sm",
    md: "px-3 py-2 text-base",
    lg: "px-4 py-3 text-lg",
  };

  // Styles selon la variante
  const variantStyles = {
    default:
      "bg-white border-gray-300 hover:border-gray-400 outline-none  outline-none focus:border-blue-500 outline-none focus:ring-blue-500",
    primary:
      "bg-blue-50 border-blue-300 hover:border-blue-400 outline-none  outline-none focus:border-blue-600 outline-none focus:ring-blue-600",
    success:
      "bg-green-50 border-green-300 hover:border-green-400 outline-none  outline-none focus:border-green-600 outline-none focus:ring-green-600",
    danger:
      "bg-red-50 border-red-300 hover:border-red-400  outline-none outline-none focus:border-red-600 outline-none focus:ring-red-600",
  };

  // Filtrer les options si recherche activée
  const filteredOptions = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Gérer la sélection
  const handleSelect = (option) => {
    if (multiple) {
      const newValue = Array.isArray(value) ? [...value] : [];
      const optionIndex = newValue.findIndex((v) => v.value === option.value);

      if (optionIndex > -1) {
        newValue.splice(optionIndex, 1);
      } else {
        newValue.push(option);
      }

      onChange(newValue);
    } else {
      onChange(option);
      setIsOpen(false);
    }
  };

  // Effacer la sélection
  const handleClear = (e) => {
    e.stopPropagation();
    onChange(multiple ? [] : null);
  };

  // Gérer les clics à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Affichage de la valeur sélectionnée
  const getDisplayValue = () => {
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      if (value.length === 1) {
        const selectedOption = options.find((opt) => opt.value === value[0]);
        return selectedOption ? selectedOption.label : placeholder;
      }
      return `${value.length} éléments sélectionnés`;
    }
    const selectedOption = options.find((opt) => opt.value === value);
    return selectedOption ? selectedOption.label : placeholder;
  };

  // Vérifier si une option est sélectionnée
  const isSelected = (option) => {
    if (multiple && Array.isArray(value)) {
      return value.some((v) => v.value === option.value);
    }
    return value?.value === option.value;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Select trigger */}
      <div
        ref={selectRef}
        className={`
          relative border rounded-lg cursor-pointer transition-all duration-200
          ${sizeStyles[size]}
          ${variantStyles[variant]}
          ${
            error
              ? "border-red-500 outline-none outline-none focus:border-red-500 outline-none focus:ring-red-500"
              : ""
          }
          ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}
          ${isOpen ? "ring-2 ring-opacity-50" : ""}
          ${triggerClassName}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between w-full">
          <span
            className={`block truncate ${
              !value || (multiple && Array.isArray(value) && value.length === 0)
                ? "text-gray-400"
                : "text-gray-900"
            }`}
          >
            {getDisplayValue()}
          </span>

          <div className="flex items-center space-x-1">
            {/* Bouton clear */}
            {clearable &&
              (value ||
                (multiple && Array.isArray(value) && value.length > 0)) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  ×
                </button>
              )}

            {/* Icône dropdown */}
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div
            className="absolute overflow-auto top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
            style={{ maxHeight }}
          >
            {/* Barre de recherche */}
            {searchable && (
              <div className="p-2 border-b border-gray-200">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-2 py-1 text-sm outline-none border border-gray-300 rounded outline-none focus:outline-none outline-none focus:border-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {/* Options */}
            <div style={{ maxHeight: "calc(100% - 60px)" }}>
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  {searchable && searchTerm
                    ? "Aucun résultat"
                    : "Aucune option"}
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    className={`
                      px-3 py-2 cursor-pointer flex items-center justify-between transition-colors duration-150
                      hover:bg-gray-50 active:bg-gray-100
                      ${
                        isSelected(option)
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-900"
                      }
                      ${optionClassName}
                    `}
                    onClick={() => handleSelect(option)}
                  >
                    <span className="block truncate">{option.label}</span>
                    {isSelected(option) && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Message d'erreur */}
      {error && typeof error === "string" && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Select;
