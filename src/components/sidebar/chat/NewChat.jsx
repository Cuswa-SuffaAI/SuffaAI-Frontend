import React from 'react'

const NewChat = () => {
  return (
    <button
      type="button"
      className="group flex w-full items-center gap-3 rounded-xl border border-white/14 bg-[#232323] px-3 py-2.5 text-left transition hover:border-green-400/45 hover:bg-[#2a2a2a]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/12 bg-[#2f2f2f] text-white transition group-hover:border-green-400/50 group-hover:text-green-300">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">Yeni Sohbet</p>
        <p className="text-xs text-white/50">Bos bir konusma baslat</p>
      </div>
    </button>
  )
}

export default NewChat
