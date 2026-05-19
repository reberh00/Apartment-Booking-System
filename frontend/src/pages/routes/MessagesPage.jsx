import ChatSection from '../../components/sections/ChatSection';

export default function MessagesPage({ chatForm, setChatForm, loadMessages, sendMessage, chatMessages }) {
  return (
    <ChatSection
      chatForm={chatForm}
      setChatForm={setChatForm}
      loadMessages={loadMessages}
      sendMessage={sendMessage}
      chatMessages={chatMessages}
    />
  );
}
