import React from 'react'
import MessageActions from './MessageActions';
import { useEffect, useRef } from "react";


const Message = ({messages}) => {

  const messagesEndRef = useRef(null);

  useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);
  return (


    <div className="flex-1 overflow-y-auto p-4 space-y-4 w-8/9 mx-auto"
      >
      {messages.map((msg, index) => {

        return (
          <React.Fragment key={index}>
            <div
              className={`w-fit break-words whitespace-pre-wrap px-3 py-3 rounded-lg ${
                msg.sender === "user"
                  ? "ml-auto bg-[#333333] text-white text-right"
                  : "mr-auto bg-black text-white text-left"
              }`}
            >
            <span
              className="font-manrope font-normal text-[15px] leading-[100%] tracking-[0%]"
            >
              {
                msg.sender === "user"
                  ? msg.text
                  : msg.text.answer
                      .split(/(\[\d+\])/g)
                      .map((part, i) =>
                        /\[\d+\]/.test(part) ? (
                          <span
                            key={i}
                            className="text-[#00FF94] font-manrope font-normal text-[15px] leading-[100%] tracking-[0%]"
                          >
                            {part}
                          </span>
                        ) : (
                          <React.Fragment key={i}>{part}</React.Fragment>
                        )
                      )
              }
            </span>
            {/* Hadisler */}
            {msg.text.hadiths?.map((hadith, hIndex) => {
              const formattedHadith = hadith.turkish_text
                .split(/(\[\d+\])/g)
                .map((part, i) =>
                  /\[\d+\]/.test(part) ? (
                    <span
                      key={i}
                      className="text-[#00FF94] font-manrope font-normal text-[15px] leading-[100%] tracking-[0%]"
                    >
                      {part}
                    </span>
                  ) : (
                    <React.Fragment key={i}>{part}</React.Fragment>
                  )
                );

              return (
                <blockquote
                  key={hIndex}
                  className="border-l-4 border-[#00FF94] pl-4 text-white italic text-[15px] leading-7 my-4"
                >
                  {formattedHadith}
                </blockquote>
              );
            })}
            </div>

            {msg.sender === "ai" && <MessageActions sourcesAll={msg.text.hadiths} />}
          </React.Fragment>

        );
      })}

      <div ref={messagesEndRef} />
    </div>


  )
}

export default Message
