export default function ChatSection({ chatForm, setChatForm, loadMessages, sendMessage, chatMessages }) {
  return (
    <section className="card">
      <h2>Poruke unutar rezervacije</h2>
      <form onSubmit={loadMessages} className="grid grid-2">
        <label>Reservation ID<input value={chatForm.reservationId} onChange={(e) => setChatForm((p) => ({ ...p, reservationId: e.target.value }))} required /></label>
        <button type="submit">Učitaj chat</button>
      </form>
      <form onSubmit={sendMessage} className="grid grid-2">
        <label>Nova poruka<input value={chatForm.content} onChange={(e) => setChatForm((p) => ({ ...p, content: e.target.value }))} required /></label>
        <button type="submit">Pošalji poruku</button>
      </form>
      <div className="list compact">
        {chatMessages.map((message) => (
          <div key={message.id} className="list-item">
            <strong>{message.sender?.firstName} {message.sender?.lastName}:</strong> {message.content}
          </div>
        ))}
      </div>
    </section>
  );
}
