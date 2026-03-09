
import React from 'react';  
import { useState } from 'react'


export default function SearchBar({ placeholder = "Sohbette ara..." }) {
  const [query, setQuery] = useState("")

  const handleChange = (e) => setQuery(e.target.value)
  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Arama:", query)
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex items-center w-full h-10 rounded-xl border border-white/14 bg-[#212121] px-3 py-2 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition focus-within:border-green-400/60 focus-within:ring-2 focus-within:ring-green-500/20"
    >
      <span className="mr-2 text-white/45" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-white placeholder:text-white/45 font-poppins font-normal not-italic text-sm leading-relaxed tracking-normal align-middle"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="ml-2 rounded-md px-1 text-white/50 transition hover:bg-white/10 hover:text-white/90"
        >
          ×
        </button>
      )}
    </form>
  )
}