
import React, { useEffect, useRef, useState } from 'react';  
import { useSidebar } from './SidebarContext';
import ChatHistory from './chat/ChatHistory';
import Searchbar from './searchbar/Searchbar';
import ErrorReport from '../overlay/ErrorReportOverlay';
import backIcon from "../../assets/back.svg";
import searchIcon from "../../assets/search.svg";
import userIcon from "../../assets/user.svg";
import settingsIcon from "../../assets/settings.svg";
import privacyIcon from "../../assets/privacy.svg";
import personalIcon from "../../assets/personal.svg";
import paletteIcon from "../../assets/palette.svg";
import feedbacksendIcon from "../../assets/feedbacksend.svg";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Sidebar = () => {

  const { isOpen, toggleSidebar } = useSidebar();

  const [open,setOpen]=useState(false);
  const [opensettings,setOpensettings]=useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [loadDocumentsStatus, setLoadDocumentsStatus] = useState('');
  const settingsPopupRef = useRef(null);
  const settingsTriggerRef = useRef(null);

  const handleLoadDocuments = async () => {
    setIsLoadingDocuments(true);
    setLoadDocumentsStatus('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/data/load`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage = data?.errors?.join(', ') || data?.message || 'Döküman yükleme başarısız oldu.';
        throw new Error(errorMessage);
      }

      setLoadDocumentsStatus('Dökümanlar başarıyla yüklendi.');
    } catch (error) {
      setLoadDocumentsStatus(`Hata: ${error.message}`);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  useEffect(() => {
    if (!opensettings) return;

    const handleOutsideClick = (event) => {
      const clickedInsidePopup = settingsPopupRef.current?.contains(event.target);
      const clickedTrigger = settingsTriggerRef.current?.contains(event.target);

      if (!clickedInsidePopup && !clickedTrigger) {
        setOpensettings(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
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
        overflow-hidden
        transform transition-transform duration-500 ease-in-out
        w-screen md:w-76
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div className='flex flex-col gap-y-2.5 px-1'>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[26px] md:text-[34px] leading-[1] font-serif tracking-tight text-white">SuffaAI</h2>
          <button
            type="button"
            onClick={toggleSidebar}
            className="icon-button rounded-md p-1.5 transition hover:bg-white/10"
            aria-label="Sidebar ac veya kapat"
          >
            <img src={backIcon} alt="close sidebar" className="icon-svg h-6 w-6" />
          </button>
        </div>

        <button
          type="button"
          className="icon-button group flex items-center gap-3 rounded-lg px-2 py-1.5 text-left text-white/92 transition hover:bg-white/10"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/12 text-lg leading-none text-white transition-colors duration-200 group-hover:bg-green-500/25 group-hover:text-green-300">+</span>
          <span className="text-base">Yeni Sohbet</span>
        </button>

        <button
          type="button"
          onClick={() => setIsSearchOpen((prev) => !prev)}
          className="icon-button flex items-center gap-3 rounded-lg px-2 py-1.5 text-left text-white/85 transition hover:bg-white/10"
          aria-label="Sohbet aramasini ac veya kapat"
          aria-expanded={isSearchOpen}
        >
          <img src={searchIcon} alt="search" className="icon-svg h-6 w-6" />
          <span className="text-base">Arama</span>
        </button>

        <div
          className={`grid overflow-hidden transition-all duration-300 ease-out ${isSearchOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 mt-0'}`}
        >
          <div className="overflow-hidden px-1">
            <Searchbar placeholder="Sohbetlerde ara" />
          </div>
        </div>
      </div>
      {open ? <ErrorReport open={open} onClose={() => setOpen(false)}/> : null }
      <div className="mt-4 flex-1 min-h-0 overflow-y-auto overflow-x-hidden sidebar-scroll">
        <ChatHistory/>
      </div>

      <div className="mt-auto mb-2 px-1 shrink-0 relative">

        {opensettings ? (
        <div className="absolute bottom-12 left-[-2px] right-[-2px] z-20">
          <div
            ref={settingsPopupRef}
            className="w-full bg-[#2f2f2f] rounded-2xl text-white border border-white/10 shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpensettings(false)}
              className="mb-4 inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
            >
              <span aria-hidden="true">←</span>
              <span>Geri</span>
            </button>

            <h2 className="font-poppins text-[20px] font-semibold leading-[100%] text-center">
              Ayarlar
            </h2>
            <div className="mt-4 border-t border-green-500/60"></div>
            <div className="mt-5 space-y-5">
              <MenuItem icon={userIcon} text="Profil" />
              <MenuItem icon={personalIcon} text="Kişisel Bağlam" />
              <MenuItem icon={paletteIcon} text="Tema" />
              <MenuItem icon={feedbacksendIcon} text="Geri Bildirim Gönder" />
              <MenuItem icon={privacyIcon} text="Gizlilik ve Yardım" />
              <button
                type="button"
                onClick={handleLoadDocuments}
                disabled={isLoadingDocuments}
                className="w-full rounded-lg border border-green-500/50 bg-green-500/10 px-3 py-2 text-left text-sm text-green-300 transition hover:bg-green-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingDocuments ? 'Dökümanlar yükleniyor...' : 'Döküman Yükle'}
              </button>
              {loadDocumentsStatus ? (
                <p className="text-xs text-white/80">{loadDocumentsStatus}</p>
              ) : null}
            </div>
            <div className="mt-5 border-t border-green-500/60"></div>
            <div className="font-poppins text-[18px] font-semibold leading-[100%] text-center mt-3">
              İsim Soyisim
            </div>
          </div>
        </div>
      ) :(

        <div className="flex w-full items-center justify-between">
          <div className='flex items-center'>
            Ayarlar ve Yardım
          </div>
          <button
            type="button"
            ref={settingsTriggerRef}
            onClick={() => setOpensettings(true)}
            className="icon-button cursor-pointer rounded-md p-1 transition hover:bg-white/10"
            aria-label="Ayarlar popup ac"
          >
            <img
              src={settingsIcon}
              alt="settings"
              className="icon-svg"
            />
          </button>
        </div>
      )}
      </div>

    </aside>
  );
};

export default Sidebar;

/* Menü Item Component */
function MenuItem({ icon, text }) {
  return (
    <button
      type="button"
      className="icon-button flex w-full items-center gap-3 rounded-md px-1 py-1 text-left cursor-pointer transition hover:bg-white/10"
    >
      <img
        src={icon}
        alt="icon"
        className="icon-svg shrink-0"
        />

      <span>{text}</span>
    </button>
  );
}