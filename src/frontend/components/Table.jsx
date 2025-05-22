import React from "react";
import { DeleteIcon, EditIcon } from "../assets/icons";
import { useNavigate } from "react-router-dom";

const Table = ({
  name,
  columns,
  data,
  elementKey,
  onDelete,
  editRoute,
  loading,
}) => {

    const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-[#2871FA] border border-[#2871FA]">
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-semibold text-[#FFFFFF] uppercase tracking-wider border-gray-500"
              >
                {column.label}
              </th>
            ))}
            <th className="px-6 py-3 text-left text-xs font-semibold text-[#FFFFFF] uppercase tracking-wider border-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {!loading &&
            data.map((item, n) => (
              <tr
                key={item[elementKey]}
                className="hover:bg-gray-50 border-gray-500"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border border-gray-500"
                  >
                    {item[column.key]}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium border border-gray-500">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`${editRoute}?id=${item[elementKey]}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <img src={EditIcon} className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => onDelete(item[elementKey])}
                      className="text-red-600 hover:text-red-900"
                    >
                      <img src={DeleteIcon} className="h-6 w-6" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          {!loading && !data.length && (
            <tr>
              <td
                className="text-center font-bold text-[20px] h-[300px] bg-[#FFFFFF] text-[#000000]"
                colSpan={columns.length + 1}
              >
                PAS DE {name} TROUVES
              </td>
            </tr>
          )}
          {loading && (
            <tr>
              <td
                className="text-center font-bold text-[20px] h-[300px] bg-[#FFFFFF] text-[#000000]"
                colSpan={columns.length + 1}
              >
                Chargement...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
