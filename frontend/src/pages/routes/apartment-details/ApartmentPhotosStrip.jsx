import { assetUrl } from "../../../api";

export default function ApartmentPhotosStrip({ photos, title }) {
  return (
    <section className="apartment-photos-strip">
      {photos.length ? (
        photos.map((photo) => (
          <img
            key={photo.id}
            src={assetUrl(photo.url)}
            alt={title}
            className="apartment-photo"
          />
        ))
      ) : (
        <div className="apartment-photo apartment-photo-placeholder">
          Nema fotografija apartmana
        </div>
      )}
    </section>
  );
}
