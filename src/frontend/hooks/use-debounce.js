import { useState,useEffect } from "react";

/**
 * This function will wait each delay seconds before to set the search box value as the current search theme 
 * on this way we will not make a new req to the db each time user update the search box value 
 * 
 * @param {var} value 
 * @param {number} delay 
 * @returns 
 */
const useDebounce = (value,delay) =>{
  const [debounceValue,setDebouncedValue] = useState(value);
  useEffect(()=>{
    const handler = setTimeout(() => {
        setDebouncedValue(value);
        return () => clearTimeout(handler);
    }, (delay));
  },[value,delay]);

  return debounceValue;
};

export default useDebounce;