import React, { useState } from 'react'

const ChatHistory = () => {
   const items = [
    {
      title: "Bugün",
      list: [
        "Kripto Para Yatırımı Caiz mi?",
        "Nahl Suresi 90. Ayet Tefsiri",
        "Seferi Namazı Şartları",
      ],
    },
    {
      title: "Dün",
      list: [
        "İmam Gazali ve İhya",
        "Bedir Savaşı Stratejisi",
      ],
    },
    {
      title: "Geçen Hafta",
      list: [
        '"Ameller Niyetlere Göredir" Hadisi',
        "Zekat Hesaplama Yöntemleri",
        "Bediüzzaman Said Nursi - Tarihçe",
      ],
    },
    {
      title: "Daha Önce",
      list: [
        "Mevlana'nın Mesnevi'sinden Dersler",
        "Dört Halife Dönemi Özeti",
        "Borsa ve Kaldıraçlı İşlemler",
        "Hicretin Kronolojisi",
        "Kütüb-i Sitte'de Ahlak Hadisleri",
        "Şemail-i Şerif ve Peygamber Efendimiz",
      ],
    },
  ];

  const [openSections, setOpenSections] = useState(() => ({
    Bugün: true,
    Dün: false,
    'Geçen Hafta': false,
    'Daha Önce': false,
  }));

  const toggleSection = (title) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div className="flex flex-col justify-center w-64 max-w-full min-w-0 rounded-lg pt-8 mx-auto overflow-x-hidden">

      <h2 className="text-lg font-bold text-white text-center mb-2">
        Sohbet Geçmişi
      </h2>

      <div className="border-t-2 border-green-500 w-full mb-4 "></div>

      {items.map((item, idx) => (
        <div key={idx} className="flex flex-col mb-0.5 min-w-0">

          <button
            type="button"
            onClick={() => toggleSection(item.title)}
            className="mb-2 flex w-full items-center justify-between pl-5 pr-2 text-left text-white font-semibold text-base"
            aria-expanded={Boolean(openSections[item.title])}
          >
            <span>{item.title}</span>
            <span
              className={`text-green-400 transition-transform duration-300 ease-out ${openSections[item.title] ? 'rotate-0' : 'rotate-180'}`}
            >
              {openSections[item.title] ? '−' : '+'}
            </span>
          </button>

          <div
            className={`grid overflow-hidden transition-all duration-300 ease-out ${openSections[item.title] ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
          >
            <ul className="list-disc ml-4 text-white min-w-0 overflow-hidden pb-1">
              {item.list.map((li, i) => (
                <li
                  key={i}
                  className={`block max-w-full overflow-hidden text-ellipsis whitespace-nowrap py-1 transition-colors duration-200 hover:text-green-300 cursor-pointer ${i !== item.list.length - 1 ? 'border-b border-white/15' : ''}`}
                  title={li}
                >
                  {li}
                </li>
              ))}
            </ul>
          </div>

          {idx !== items.length - 1 && (
            <div className="border-t-2 border-green-500 w-full my-2"></div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ChatHistory
