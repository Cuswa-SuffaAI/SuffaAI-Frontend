
import React, { useEffect, useRef, useState } from 'react';  
import { useSidebar } from './SidebarContext';
import NewChat from './chat/NewChat';
import ChatHistory from './chat/ChatHistory';
import Searchbar from './searchbar/Searchbar';
import ErrorReport from '../overlay/ErrorReportOverlay';
import searchIcon from "../../assets/search.svg";
import userIcon from "../../assets/user.svg";
import settingsIcon from "../../assets/settings.svg";
import privacyIcon from "../../assets/privacy.svg";
import personalIcon from "../../assets/personal.svg";
import paletteIcon from "../../assets/palette.svg";
import feedbacksendIcon from "../../assets/feedbacksend.svg";

const Sidebar = () => {

  const { isOpen, toggleSidebar } = useSidebar();

  const [open,setOpen]=useState(false);
  const [opensettings,setOpensettings]=useState(false);
  const settingsRef = useRef(null);

  useEffect(() => {
  if (opensettings && settingsRef.current) {
    settingsRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}, [opensettings]);

  return (
    // <aside className={`flex flex-col h-screen bg-[#333333] text-white p-6
    //   overflow-y-auto scrollbar-none scrollbar-thin
    //   transition-all duration-300 ease-in-out
    //   ${isOpen ? 'w-screen md:w-76 lg:[500px]' : 'hidden'}`}>
    <aside
      className={`
        fixed top-0 left-0 z-50
        flex flex-col h-screen
        bg-[#333333] text-white p-6
        overflow-y-auto scrollbar-none scrollbar-thin
        transform transition-transform duration-500 ease-in-out
        w-screen md:w-76
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div className='flex flex-col gap-y-8'>
        <div className='flex justify-between px-6'>
          <svg onClick={toggleSidebar} width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 32.5C3.63401 32.5 0.5 29.366 0.5 25.5L0.5 7.5C0.5 3.63401 3.63401 0.500002 7.5 0.500002H24.5C28.366 0.500002 31.5 3.63401 31.5 7.5V25.5C31.5 29.366 28.366 32.5 24.5 32.5H7.5Z" stroke="#F9F9F9"/>
            <path d="M11.5 14.5L9.5 12.5383L11.5 10.5M15 14.5383H21.5M9.5 18.5H21.5M9.5 22.5H21.5M15 10.5H21.5" stroke="#F9F9F9" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <img
            src={searchIcon}
            alt="search"
            className="cursor-pointer"
            />

        </div>
        <Searchbar/>
        <NewChat/>
      </div>
      {open ? <ErrorReport open={open} onClose={() => setOpen(false)}/> : null }
      <ChatHistory/>

      <div className={`flex justify-between ${opensettings!=true ? "mt-15" : "mt-2"} mb-2 px-1`}>

        {opensettings ? (
        <div
          className="flex items-center justify-center"
          onClick={() => setOpen(false)}
          ref={settingsRef}
        >
          <div
            className="w-full max-w-md bg-[#333333] rounded-2xl text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-poppins text-[18px] font-semibold leading-[100%] text-center">
              Ayarlar
            </h2>
            <div className="mt-6 border-t border-green-500 border-2 w-64"></div>
            <div className="mt-4 space-y-4">
              <MenuItem icon={userIcon} text="Profil" />
              <MenuItem icon={personalIcon} text="Kişisel Bağlam" />
              <MenuItem icon={paletteIcon} text="Tema" />
              <MenuItem icon={feedbacksendIcon} text="Geri Bildirim Gönder" />
              <MenuItem icon={privacyIcon} text="Gizlilik ve Yardım" />
            </div>
            <div className="mt-6 border-t border-green-500 border-2 w-64"></div>
            <div className="font-poppins text-[18px] font-semibold leading-[100%] text-center mt-3">
              İsim Soyisim
            </div>
          </div>
        </div>
      ) :(

        <>
          <div className='flex items-center'>
          Ayarlar ve Yardım
        </div>
        <img
            src={settingsIcon}
            alt="settings"
            onClick={() => setOpensettings(true)}
            className="cursor-pointer"
            />

        </>
      )}
      </div>

    </aside>
  );
};

export default Sidebar;

/* Menü Item Component */
function MenuItem({ icon, text }) {
  return (
    <div className="flex items-center gap-3 cursor-pointer hover:opacity-70 transition">
      <img
        src={icon}
        alt="icon"
        className="cursor-pointer"
        />

      <span>{text}</span>
    </div>
  );
}