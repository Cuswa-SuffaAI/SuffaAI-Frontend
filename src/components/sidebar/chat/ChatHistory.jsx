import React from 'react'

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

  return (
    <div className="flex flex-col justify-center w-64 rounded-lg pt-8 mx-auto">

      <h2 className="text-lg font-bold text-white text-center mb-2">
        Sohbet Geçmişi
      </h2>

      <div className="border-t-2 border-green-500 w-full mb-4 "></div>

      {items.map((item, idx) => (
        <div key={idx} className="flex flex-col mb-0.5">

          <span className="text-white font-semibold text-base mb-2 pl-5">{item.title}</span>
          <ul className="list-disc ml-4 text-white">
            {item.list.map((li, i) => (
              <li key={i} className="mb-1 break-words">{li}</li>
            ))}
          </ul>
          {idx !== items.length - 1 && (
            <div className="border-t-2 border-green-500 w-full my-2"></div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ChatHistory
