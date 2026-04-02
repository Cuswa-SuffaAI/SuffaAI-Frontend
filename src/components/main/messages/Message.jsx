import React, { useState } from 'react'
import MessageActions from './MessageActions';
import { useEffect, useRef } from "react";


const Message = ({messages, isLoading = false}) => {

  const messagesEndRef = useRef(null);
  const [openArabicMap, setOpenArabicMap] = useState({});

  const toggleArabicText = (key) => {
    setOpenArabicMap((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);
  return (


    <div className="flex-1 overflow-y-auto main-content-scroll p-4 space-y-4 w-8/9 mx-auto"
      >
      {messages.map((msg, index) => {
        const isAiStreaming = msg.sender === 'ai' && Boolean(msg.isStreaming);
        const aiAnswer = msg.sender === 'ai'
          ? (typeof msg.text === 'string' ? msg.text : (msg.text?.answer || msg.text?.response || ''))
          : '';
        const showStreamingPlaceholder = isAiStreaming && !aiAnswer?.trim();

        const aiHadiths = Array.isArray(msg.text?.hadiths) ? msg.text.hadiths : [];
        const aiSections = Array.isArray(msg.text?.sections) ? msg.text.sections : [];
        const aiSources = Array.isArray(msg.text?.sources) ? msg.text.sources : [];
        const aiFetvalar = Array.isArray(msg.text?.fetvalar) ? msg.text.fetvalar : [];

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
                  : showStreamingPlaceholder
                    ? <span className="stream-placeholder-chip">Sabırla...</span>
                  : aiAnswer
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
            {aiHadiths.map((hadith, hIndex) => {
              const arabicKey = `${msg.id}-${hIndex}`;
              const hasArabicText = Boolean(hadith?.arabic_text?.trim());
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
                  className="fade-in-item border-l-4 border-[#00FF94] pl-4 text-white italic text-[15px] leading-7 my-4"
                  style={{ animationDelay: `${hIndex * 70}ms` }}
                >
                  {formattedHadith}

                  {hasArabicText ? (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => toggleArabicText(arabicKey)}
                        className="text-[#00FF94] text-sm font-medium hover:opacity-85 transition"
                      >
                        {openArabicMap[arabicKey] ? 'Arapca Metni Gizle' : 'Arapca Metni Goster'}
                      </button>

                      <div
                        className={`grid overflow-hidden transition-all duration-300 ease-out ${openArabicMap[arabicKey] ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}
                      >
                        <blockquote className="border-l-4 border-[#00FF94] pl-4 text-white italic text-[15px] leading-7 overflow-hidden">
                          {hadith.arabic_text}
                        </blockquote>
                      </div>
                    </div>
                  ) : null}
                </blockquote>
              );
            })}

            {/* Fetvalar - sadece ilk sonuç */}
            {(() => {
              const fetva = aiFetvalar[0];
              const fetvaText = fetva?.answer || fetva?.relevant_text || '';
              if (!fetva || !fetvaText) return null;
              return (
                <blockquote
                  className="fade-in-item border-l-4 border-[#00FF94] pl-4 text-white italic text-[15px] leading-7 my-4"
                >
                  <div className="not-italic text-[#00FF94] text-sm mb-1 flex flex-wrap gap-x-3 gap-y-1">
                    {fetva?.subject && <span className="capitalize">{fetva.subject}</span>}
                    {fetva?.page && <span>Sayfa {fetva.page}</span>}
                  </div>
                  {fetva?.question && (
                    <div className="not-italic text-white/60 text-sm mb-2">S: {fetva.question}</div>
                  )}
                  {fetvaText}
                </blockquote>
              );
            })()}

            {/* Siyer bolumleri */}
            {aiSections.map((section, sIndex) => {
              const sectionText = section?.relevant_text || section?.text || '';
              if (!sectionText) return null;

              return (
                <blockquote
                  key={`section-${sIndex}`}
                  className="fade-in-item border-l-4 border-[#00FF94] pl-4 text-white italic text-[15px] leading-7 my-4"
                  style={{ animationDelay: `${sIndex * 70}ms` }}
                >
                  {(section?.section_id || section?.main_theme) ? (
                    <div className="text-[#00FF94] not-italic text-sm mb-1 flex flex-wrap gap-x-3 gap-y-1">
                      {section?.main_theme && <span>{section.main_theme}</span>}
                      {Array.isArray(section?.volume) && section.volume.length > 0 && (
                        <span>{section.volume.join(', ')}</span>
                      )}
                      {Array.isArray(section?.pages) && section.pages.length > 0 && (
                        <span>Sayfa {section.pages.join(', ')}</span>
                      )}
                    </div>
                  ) : null}
                  {sectionText}
                </blockquote>
              );
            })}
            </div>

            {msg.sender === "ai" && !isAiStreaming && (
              <MessageActions
                sourcesAll={aiSources}
                hadiths={aiHadiths}
                sections={aiSections}
                fetvalar={aiFetvalar}
                answerText={aiAnswer}
              />
            )}
          </React.Fragment>

        );
      })}

      {isLoading && !messages.some((msg) => msg.sender === 'ai' && msg.isStreaming) ? (
        <div className="w-fit break-words whitespace-pre-wrap px-4 py-3 rounded-xl mr-auto border border-white/12 bg-[#121212]/92 text-white/65 text-left italic animate-pulse shadow-[0_6px_16px_rgba(0,0,0,0.28)]">
          <span className="font-manrope font-normal text-[15px] leading-[100%] tracking-[0%]">
            <span className="stream-placeholder-chip">Sabırla...</span>
          </span>
        </div>
      ) : null}

      <div ref={messagesEndRef} />
    </div>


  )
}

export default Message
