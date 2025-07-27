import React from "react";
import { ChartNoAxesColumn } from "lucide-react";

const SectionHead = () => {
    return (
      <div className="max-w-7xl mx-auto sticky bg-white -top-5  z-40 ">
        <div className="sticky bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row md:items-center justify-between gap-4 ">
            <div>
              <div className="flex items-center space-x-4">
                <ChartNoAxesColumn className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                  Bulletins de notes
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default SectionHead;
