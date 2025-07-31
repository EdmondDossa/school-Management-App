import React, { useEffect, useState } from "react";
import MultiSelected from "./MultiSelect";
import Input from "./Input";
import Select from "./Select";

const Form = ({
  fields,
  onSubmit,
  initialValues = {},
  submitLabel = "Enregistrer",
}) => {
  const [formData, setFormData] = useState(initialValues);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleChangeSelect = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="overflow-y-auto">
      <section className="space-y-6 max-h-[61vh] overflow-auto p-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-gray-700"
            >
              {field.label}{" "}
              {field.required ? (
                <span className="text-red-600 font-bold">*</span>
              ) : (
                ""
              )}
            </label>

            {/* Gestion des types de champs */}
            {field.type === "textarea" ? (
              <textarea
                id={field.name}
                name={field.name}
                value={formData[field.name] || ""}
                required={field.required}
                readOnly={field.readOnly}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-blue-500"
                rows={4}
              />
            ) : field.type === "select" ? (
              <Select
                id={field.name}
                name={field.name}
                value={formData[field.name] || ""}
                required={field.required}
                disabled={field.disabled}
                options={field.options}
                onChange={(op) => handleChangeSelect(field.name, op.value)}
                triggerClassName="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            ) : field.type === "checkbox" ? (
              <div className="mt-1 flex items-center">
                <input
                  type="checkbox"
                  id={field.name}
                  name={field.name}
                  checked={formData[field.name] || false}
                  disabled={field.disabled}
                  onChange={handleChange}
                  className="h-4 w-4 focus:outline-none text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor={field.name}
                  className="ml-2 text-sm text-gray-700"
                >
                  {field.label}
                </label>
              </div>
            ) : field.type === "multiselect" ? (
              <MultiSelected
                fieldName={field.name}
                options={field.options}
                placeholder={field.placeholder}
                defaultOptions={() =>
                  formData[field.name].map((m) => ({
                    label: m[field.keys.label],
                    value: m[field.keys.value],
                  }))
                }
                noOptionsMessage={field.noOptionsMessage}
                setFormData={setFormData}
              />
            ) : field.type === "radio" ? (
              <div className="mt-1">
                {field.options.map((option) => (
                  <div key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      id={`${field.name}-${option.value}`}
                      name={field.name}
                      value={option.value}
                      checked={formData[field.name] === option.value}
                      disabled={field.disabled}
                      onChange={handleChange}
                      className="h-4 w-4 focus:outline-none text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`${field.name}-${option.value}`}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <Input
                type={field.type}
                id={field.name}
                name={field.name}
                value={formData[field.name] || ""}
                required={field.required}
                onChange={handleChange}
                readOnly={field.readOnly}
              />
            )}
          </div>
        ))}
      </section>
      {/* Bouton de soumission */}
      <div className="flex justify-end pt-3 sticky bottom-0">
        <button
          type="submit"
          className="px-4 py-2 focus:ring-0 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default Form;
