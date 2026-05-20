import OwnerApartmentFormSection from '../../components/sections/OwnerApartmentFormSection';

export default function OwnerApartmentCreatePage({ newApartment, setNewApartment, createApartment, contentsOptions }) {
  return (
    <OwnerApartmentFormSection
      newApartment={newApartment}
      setNewApartment={setNewApartment}
      createApartment={createApartment}
      contentsOptions={contentsOptions}
    />
  );
}
