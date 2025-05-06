"use client";

import { useEffect, useState } from "react";
import FavoriteCard from "./FavoriteCard";
import FavoriteCardsModal from "./FavoriteCardsModal";
import { FavoriteCardType } from "@/app/types/FavoriteCardType";
import "./Cards.css";

export type FavoriteCardKey =
  | "requisitions"
  | "advances"
  | "leave"
  | "expenses";
export type FavoriteCardsState = Record<FavoriteCardKey, FavoriteCardType>;
export type CardPreferences = Record<FavoriteCardKey, boolean>;

const defaultCards: FavoriteCardsState = {
  requisitions: {
    title: "Requisitions",
    icon: "iconoir-shopping-bag",
    pending: 24,
    completed: 156,
    pendingUrl: "/requisition",
    completedUrl: "/completed-requisitions",
    visible: true,
  },
  advances: {
    title: "Advances",
    icon: "iconoir-wallet",
    pending: 8,
    completed: 42,
    pendingUrl: "/pending-advances",
    completedUrl: "/completed-advances",
    visible: true,
  },
  leave: {
    title: "Leave",
    icon: "iconoir-calendar",
    pending: 3,
    completed: 15,
    pendingUrl: "/pending-leave",
    completedUrl: "/completed-leave",
    visible: false,
  },
  expenses: {
    title: "Expenses",
    icon: "iconoir-dollar",
    pending: 5,
    completed: 20,
    pendingUrl: "/pending-expenses",
    completedUrl: "/completed-expenses",
    visible: false,
  },
};

export default function FavoriteCardsWrapper() {
  const [cards, setCards] = useState<FavoriteCardsState>(defaultCards);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("favoriteCards");
    if (saved) {
      const parsed: CardPreferences = JSON.parse(saved);
      const updated = { ...cards };
      (Object.keys(parsed) as FavoriteCardKey[]).forEach((key) => {
        if (updated[key]) {
          updated[key].visible = parsed[key];
        }
      });
      setCards(updated);
    }
  }, []);

  const handleSave = (selected: CardPreferences) => {
    const updated = { ...cards };
    (Object.keys(updated) as FavoriteCardKey[]).forEach((key) => {
      updated[key].visible = selected[key] ?? updated[key].visible;
    });
    setCards(updated);
    localStorage.setItem("favoriteCards", JSON.stringify(selected));
  };

  return (
    <div className="card h-100 favorite-cards-section">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">
            <i className="iconoir-star text-primary me-2" />
            Favorite Cards
          </h5>
          <button
            className="btn btn-sm btn-link text-primary"
            onClick={() => setShowModal(true)}
          >
            <i
              className="iconoir-pin-solid text-danger"
              style={{ fontSize: "1.5rem" }}
            />
          </button>
        </div>

        <div className="pinned-cards-container">
          {Object.entries(cards).map(
            ([key, card]) =>
              card.visible && (
                <div key={key} className="mb-4">
                  <h6 className="fw-bold mb-2 text-uppercase text-muted">
                    {card.title}
                  </h6>
                  <FavoriteCard data={card} />
                </div>
              )
          )}
        </div>
      </div>
      <FavoriteCardsModal
        show={showModal}
        onClose={() => setShowModal(false)}
        cards={cards}
        onSave={handleSave}
      />
    </div>
  );
}
