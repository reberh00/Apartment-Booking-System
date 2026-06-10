import { useState } from "react";
import { api } from "../api";
import { defaultApartmentForm } from "../constants/forms";
import { useAuth } from "../context/AuthContext";
import { useFeedback } from "../context/FeedbackContext";

export function useApartmentForm() {
  const { token } = useAuth();
  const { setFeedback } = useFeedback();
  const [newApartment, setNewApartment] = useState(defaultApartmentForm);

  async function createApartment(e) {
    e.preventDefault();
    try {
      await api.post(
        "/apartments",
        {
          ...newApartment,
          latitude: Number(newApartment.latitude),
          longitude: Number(newApartment.longitude),
          pricePerNight: Number(newApartment.pricePerNight),
          maxGuests: Number(newApartment.maxGuests),
          minNights: Number(newApartment.minNights),
        },
        token,
      );
      setFeedback("Apartman je kreiran i čeka admin odobrenje.");
      setNewApartment(defaultApartmentForm);
    } catch (err) {
      setFeedback(err.message, true);
    }
  }

  return { newApartment, setNewApartment, createApartment };
}
