import React, { useEffect } from "react";

const Resources= ({ open, onClose, children }) => {

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (open) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden"; 
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <div
        className="relative w-full md:w-1/2 bg-black rounded-t-3xl 
                   animate-slideUp p-4 mx-auto border-1 border-white"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="w-16 h-[1px] bg-white/40 rounded-full mx-auto mb-2" />

        <h2 className="text-white text-md font-semibold text-center">
          Kaynaklar
        </h2>
        <div className="h-px bg-white/30 my-2" />

        <div className="flex flex-col divide-y divide-white/20">
          {children}
        </div>
      </div>
      <style>
        {`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .animate-slideUp {
            animation: slideUp 0.3s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default Resources;