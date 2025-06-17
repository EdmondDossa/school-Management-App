import React from "react";
import Select from "react-select";

function MultiSelected({ 
  options,
  defaultOptions,
  placeholder,
  noOptionsMessage,
  setFormData,
  fieldName
 }) {

  const handleChange = (list)=>{
    const ids = list.map((element) => element.value);
    setFormData((prev)=> ({ ...prev,[fieldName]:ids }));
  };

  return (
    <Select 
      options={options}
      isMulti
      onChange={handleChange}
      defaultValue={defaultOptions}
      isSearchable={true}
      placeholder={placeholder}
      noOptionsMessage={() => noOptionsMessage}
      closeMenuOnSelect={false}
    />
  );
}

export default MultiSelected;
