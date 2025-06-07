import React from 'react';
import { MoveLeft  } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const ButtonBack = () => {

  const navigate = useNavigate();

  return (
    <button
    className='flex items-center px-4 py-2  bg-gray-200 rounded-md border-2  hover:bg-gray-100 transition-all ease-linear text-blue-500 border-blue-500'
      onClick={() => navigate(-1)}
  >
    <MoveLeft />
  </button>
  );
};

export default ButtonBack;