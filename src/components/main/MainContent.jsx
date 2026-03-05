import React, { useState } from "react";
import Header from "./header/Header";
import Message from "./messages/Message";
import AiSearchbar from "./aisearchbar/AiSearchbar";
import History from "./History";
import { useSidebar } from "../sidebar/SidebarContext";
import bgImage from "../../assets/background.svg";



const MainContent = ({messages,onSendMessage,isLoading, error}) => {

  const [history,setHistory]=useState(1);
  const [inOutControl,SetInOutControl]=useState(false);
  const { isOpen, toggleSidebar } = useSidebar();

  return (
    <div
      className={`flex-1 ${isOpen ? "hidden md:flex md:ml-76" : "flex flex-col"} flex-col h-screen text-white bg-black`}
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "repeat",
        backgroundColor: "black"
      }}
    >

       <Header 
        //title="Musibetlere Sabretmenin Önemi" 
         title=""
         inOutControl={inOutControl}
       />
      <div className={`w-8/9 mx-auto mt-6 border-t border-white/20`}></div>

      {messages.length!=0 
        ? 
        <Message messages={messages}/> 
        : 
        <History/>
      }

      <AiSearchbar onSendMessage={onSendMessage} disabled={isLoading} />
    </div>
  );
};

export default MainContent;