import { assetUrl } from "../../../api";

export default function OwnerPhotoManager({
  photos,
  title,
  photoInputRef,
  photoFile,
  photoLoading,
  setPhotoFile,
  onSubmit,
  onReorder,
  onDelete,
}) {
  return (
    <section className="card">
      <h3>Fotografije apartmana</h3>
      <form onSubmit={onSubmit} className="row gap">
        <input
          ref={photoInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
        />
        <button type="submit" disabled={photoLoading || !photoFile}>
          {photoLoading ? "Prijenos..." : "Učitaj fotografiju"}
        </button>
      </form>
      <p className="meta">
        Podržani formati: JPEG, PNG, WebP, GIF. Maksimalno 5 MB. Prva fotografija
        se prikazuje kao naslovna.
      </p>

      <div className="list compact owner-photo-list">
        {photos.length ? (
          photos.map((photo, index) => (
            <article key={photo.id} className="list-item row between">
              <div className="row gap">
                <img
                  src={assetUrl(photo.url)}
                  alt={`${title} ${index + 1}`}
                  className="owner-photo-thumb"
                />
                <span className="meta">#{index + 1}</span>
              </div>
              <div className="row gap">
                <button
                  type="button"
                  className="ghost"
                  disabled={photoLoading || index === 0}
                  onClick={() => onReorder(photo.id, "up")}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="ghost"
                  disabled={photoLoading || index === photos.length - 1}
                  onClick={() => onReorder(photo.id, "down")}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="ghost"
                  disabled={photoLoading}
                  onClick={() => onDelete(photo.id)}
                >
                  Obriši
                </button>
              </div>
            </article>
          ))
        ) : (
          <p className="meta">Nema učitanih fotografija.</p>
        )}
      </div>
    </section>
  );
}
