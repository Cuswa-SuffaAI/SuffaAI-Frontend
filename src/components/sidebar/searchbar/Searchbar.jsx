
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
      className="flex items-center w-full max-w-sm h-9 mx-auto bg-white border border-gray-300 rounded-md px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500"
    >
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex-1 outline-none text-gray-700 placeholder-gray-400 font-poppins font-normal not-italic text-base leading-relaxed tracking-normal align-middle"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="ml-2 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      )}
    </form>
  )
}