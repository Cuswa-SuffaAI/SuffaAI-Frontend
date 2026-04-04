import React from "react";

const Copy = ({ show }) => {
  return (
    <div className="relative inline-block w-full">

      {show && (
        <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 z-[9999]">

          <div className="bg-[#171717] rounded-xl md:rounded-full p-3 shadow-2xl w-[92vw] max-w-[350px] md:min-w-[500px] md:max-w-none">

            <div className="flex flex-col-reverse md:flex-row md:items-center gap-1 md:gap-6 md:justify-center">

              <div className="bg-[#333333] rounded-full p-2 md:p-4 flex items-center justify-center gap-x-2">

                <div className="bg-white rounded-full w-full md:px-6 py-1.5 text-black text-sm text-center font-medium">
                  Cevabınız panoya kopyalandı
                </div>
                <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="0.5" width="28" height="28" rx="14" fill="#F9F9F9" stroke="#00FF94"/>
                <path d="M8.5 14.0556L13.1429 18.5L21.5 10.5" stroke="#00FF94" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>

              <div className="flex flex-row md:flex-col justify-center gap-4 md:gap-1.5">
                <button className="bg-[#333333] text-white w-full md:w-auto text-xs px-1 md:px-5 py-2 md:py-2 rounded-full hover:opacity-80 transition">
                  Kaynak Kopyala
                </button>
                <button className="bg-[#333333] text-white w-full md:w-auto text-xs px-1 md:px-5 py-2 md:py-2 rounded-full hover:opacity-80 transition">
                  Nakil Kopyala
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Copy;