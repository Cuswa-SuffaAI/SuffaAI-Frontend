import React from 'react'
import MessageActions from './MessageActions';
import bgImage from "../../../assets/background.svg";

const messages = [
  {
    type: "question",
    text: "Merhaba! Bugün hava nasıl? Bu arada hava tahminleri uzun sürüyor mu? " +
          "Sence dışarı çıkmak için uygun mu? Hava durumu uygulamaları genelde güncel veriyor mu?"
  },
  {
    type: "answer",
    text: "Merhaba! Bugün hava güneşli ve sıcak. Öğleden sonra sıcaklık 28 derece civarında olacak. " +
          "Rüzgar hafif ve nem %45 civarında. Yani dışarı çıkmak için oldukça uygun. Öğleden sonra hafif bir rüzgar olabilir, " +
          "ama günlük aktiviteleri etkilemez. Güneş ışığı özellikle öğle saatlerinde güçlü olacak, güneş kremi öneririm. " +
          "Hava durumu uygulamaları genellikle güncel ve güvenilir veriler sağlıyor. Ayrıca online meteoroloji sitelerinden de detaylı bilgi alabilirsiniz. " +
          "Yağmur olasılığı düşük ancak akşam saatlerinde hafif bir serinlik olabilir, dışarı çıkmadan önce sıcaklık kontrol etmek faydalı olur."
  },
  {
    type: "question",
    text: "Peki yarın yağmur yağacak mı? Hangi saatlerde? " +
          "Yağışın yoğunluğu nasıl olacak? Şemsiyeyi yanımıza almalıyız mı? " +
          "Hafta sonu için plan yapmayı düşünüyorum, tahminler güvenilir mi?"
  },
  {
    type: "answer",
    text: "Yarın öğleden sonra yağmur bekleniyor. Yağış hafif başlayacak ve akşam biraz artacak. " +
          "Sabah saatlerinde yağmur olasılığı yok, öğleden sonra 15:00 civarında başlayacak ve akşam 20:00 civarına kadar sürecek. " +
          "Yoğunluğu hafif olacak, ama bazı bölgelerde orta şiddette yağış görülebilir. " +
          "Şemsiye almak iyi olur. Hafta sonu planı için güvenilir bir tahmin, ancak son dakika değişikliklerini meteoroloji uygulamalarından takip etmek faydalı olur. " +
          "Günün farklı saatlerinde sıcaklık değişimleri olabileceğinden dış mekan planları esnek tutulmalı."
  },
  {
    type: "question",
    text: "React ile component oluşturmayı uzun bir örnekle anlatabilir misin? " +
          "Fonksiyonel component mi class component mi tercih etmeli? " +
          "Props ve state kullanımı nasıl olmalı? " +
          "Event handling örneği ve lifecycle hookları detaylı ver."
  },
  {
    type: "answer",
    text: "React’te component oluşturmak için fonksiyonel componentler kullanabilirsiniz. Örneğin uzun bir liste componenti oluşturup map ile render edebilirsiniz. " +
          "Fonksiyonel componentlerde useState, useEffect gibi hooklar kullanılır. Class componentlerde ise state ve lifecycle methodları vardır. " +
          "Props ile parent componentten veri alabilirsiniz ve state ile component içi veri yönetebilirsiniz. Event handling için onClick, onChange gibi eventleri kullanabilirsiniz. " +
          "useEffect ile mount, update ve unmount işlemlerini yönetebilirsiniz. Örnek: uzun bir form componenti, liste componenti veya API çağrısı yapan componentleri fonksiyonel component olarak yazabilirsiniz. " +
          "Props değişikliklerine tepki verip state’i güncelleyerek interaktif componentler oluşturabilirsiniz. Ayrıca, context ve reducer kullanımıyla state yönetimi daha büyük projelerde kolaylaşır. " +
          "Uzun cevap, componentin tüm lifecycle ve state yönetim mantığını kapsayacak şekilde detaylandırılmıştır."
  },
  {
    type: "question",
    text: "Tailwind ile responsive tasarım örneği? " +
          "Mobilde navbar nasıl gizlenir ve tabletde görünür? " +
          "Breakpoint kullanımı ve class kombinasyonları hakkında detay ver."
  },
  {
    type: "answer",
    text: "Tailwind’de responsive tasarım için breakpoint sınıfları kullanılır: sm:, md:, lg:, xl:. " +
          "Örneğin navbar mobilde gizlenip md ve üzeri ekranda gösterilebilir. " +
          "hidden md:flex gibi sınıflar kullanılır. " +
          "Padding, margin ve text boyutları da breakpoint ile değiştirilebilir. " +
          "Flexbox ve grid ile layout oluşturabilir, responsive olarak elementleri hizalayabilirsiniz. " +
          "Uzun cevap için bir örnek: mobilde hamburger menü gizlenir, tablet ve masaüstünde tam navbar görünür. " +
          "Tailwind’in JIT compile sayesinde breakpointler hızlı uygulanır ve responsive tasarım kolayca yönetilir. " +
          "Ek olarak, hover ve focus gibi state sınıfları da breakpoint ile kombine edilebilir."
  },

];

const Message = ({messages}) => {
  return (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 w-8/9 mx-auto"
            >
            {messages.map((msg, index) => {
              const formattedText =
                msg.type !== "question"
                  ? msg.text
                      .split(/(?<=[.!?])\s+/)
                      .map((sentence, i) => (
                        <React.Fragment key={i}>
                          {sentence}{" "}
                          <span className="text-[#00FF94] font-manrope font-normal text-[15px] leading-[100%] tracking-[0%]">[{i + 1}]</span>{" "}
                        </React.Fragment>
                      ))
                  : msg.text;
    
              return (
                <React.Fragment key={index}>
                  <div
                    className={`max-w-2xl break-words whitespace-pre-wrap px-2 py-3 rounded-lg ${
                      msg.type === "question"
                        ? "ml-auto bg-[#333333] text-white text-right"
                        : "mr-auto bg-black text-white text-left"
                    }`}
                  >
                    {formattedText}
                  </div>
    
                  {msg.type !== "question" && <MessageActions text={formattedText}/>}
                </React.Fragment>

              );
            })}
          </div>
  )
}

export default Message
