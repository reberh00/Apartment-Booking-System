import { DayPicker } from "react-day-picker";
import { addDays, formatDate } from "./utils";

export default function OwnerBlockManager({
  ownerBlockRange,
  onRangeSelect,
  onDayClick,
  disabledDateMatchers,
  availabilityLoading,
  ownerBlockMessage,
  onSubmit,
  ownerBlockStart,
  ownerBlockEnd,
  ownerBlocking,
  canSubmitOwnerBlock,
  availabilityBlocks,
  onDeleteBlock,
}) {
  return (
    <section className="card">
      <h3>Blokiranje termina za vlasnika</h3>
      <div className="reservation-calendar-wrap">
        <DayPicker
          mode="range"
          selected={ownerBlockRange}
          onSelect={onRangeSelect}
          onDayClick={onDayClick}
          numberOfMonths={2}
          disabled={disabledDateMatchers}
          excludeDisabled
        />
        {availabilityLoading ? (
          <p className="meta">Učitavanje dostupnosti...</p>
        ) : null}
        <p className="meta">
          Odaberite raspon datuma koji želite blokirati za nove rezervacije.
        </p>
        {ownerBlockMessage ? <p className="meta">{ownerBlockMessage}</p> : null}
      </div>

      <form onSubmit={onSubmit} className="grid grid-4">
        <label>
          Početak blokade
          <input
            type="text"
            value={ownerBlockStart}
            readOnly
            placeholder="Odaberite na kalendaru"
            required
          />
        </label>
        <label>
          Kraj blokade
          <input
            type="text"
            value={ownerBlockEnd}
            readOnly
            placeholder="Odaberite na kalendaru"
            required
          />
        </label>
        <button type="submit" disabled={ownerBlocking || !canSubmitOwnerBlock}>
          {ownerBlocking ? "Blokiranje..." : "Blokiraj termin"}
        </button>
      </form>

      <div className="list compact owner-blocks-list">
        {availabilityBlocks.length ? (
          availabilityBlocks.map((block) => (
            <article key={block.id} className="list-item row between">
              <div>
                <strong>
                  {formatDate(block.startDate)} -{" "}
                  {formatDate(addDays(new Date(block.endDate), -1))}
                </strong>
              </div>
              <button
                type="button"
                className="ghost"
                onClick={() => onDeleteBlock(block.id)}
              >
                Ukloni blokadu
              </button>
            </article>
          ))
        ) : (
          <p className="meta">Nema blokiranih termina.</p>
        )}
      </div>
    </section>
  );
}
