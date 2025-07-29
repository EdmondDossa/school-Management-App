import React from "react";
import { ChartNoAxesColumn, FileText,Loader } from "lucide-react";

const SectionHead = ({ handleExportPdf, isExporting }) => {
  return (
    <div className="max-w-7xl mx-auto sticky  bg-white -top-5  z-40 ">
      <div className="sticky bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row md:items-center justify-between gap-4 ">
          <div className="flex items-center space-x-4">
            <ChartNoAxesColumn className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Bulletins de notes
            </h1>
          </div>
          <div className="flex gap-x-5">
            <button
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md w-fit hover:bg-gray-700 transition-colors duration-200"
            >
              {!isExporting && <FileText className="w-4 h-4" />}
              {isExporting && <Loader className="w-4 h-4" />}

              <p style={{ inlineSize: "max-content" }}>Voir tous les bulletins</p>
            </button>
            <button
              disabled={isExporting}
              onClick={handleExportPdf}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md w-fit hover:bg-green-700 transition-colors duration-200"
            >
              {!isExporting && <FileText className="w-4 h-4" />}
              {isExporting && <Loader className="w-4 h-4" />}

              <p style={{ inlineSize: "max-content" }}>Exporter PDF</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionHead;
