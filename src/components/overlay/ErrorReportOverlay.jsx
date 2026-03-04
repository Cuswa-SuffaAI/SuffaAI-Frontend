import React, { useEffect, useRef } from "react";
import sendIcon from "../../assets/send.svg";


const ErrorReport = ({ open, onClose }) => {



  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center"
      onClick={onClose}
    >
      <div 

        onClick={(e) => e.stopPropagation()}
        className="relative w-[80%] md:w-[40%] bg-[#333333] rounded-full p-4 md:p-6 shadow-2xl">

        <div className="bg-white rounded-full px-4 py-2 flex items-center justify-between">
        <input
            type="text"
            placeholder="Hatalı bilgiyi rapor edin."
            className="flex-1 bg-transparent outline-none text-black text-[18px] placeholder:text-gray-400"
        />

        <img
            src={sendIcon}
            alt="send"
            className="w-[30px] h-[30px] md:w-[53px] md:h-[53px] cursor-pointer"
            />
        </div>

      </div>

    </div>
  );
};

export default ErrorReport;