"use client";

import { Modal, Button, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import {
  FavoriteCardsState,
  FavoriteCardKey,
  CardPreferences,
} from "./FavoriteCardsWrapper";

interface FavoriteCardsModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (prefs: CardPreferences) => void;
  cards: FavoriteCardsState;
}

export default function FavoriteCardsModal({
  show,
  onClose,
  onSave,
  cards,
}: FavoriteCardsModalProps) {
  const [prefs, setPrefs] = useState<CardPreferences>({} as CardPreferences);

  useEffect(() => {
    if (show) {
      const initialPrefs: CardPreferences = Object.keys(cards).reduce(
        (acc, key) => {
          acc[key as FavoriteCardKey] = cards[key as FavoriteCardKey].visible;
          return acc;
        },
        {} as CardPreferences
      );
      setPrefs(initialPrefs);
    }
  }, [show, cards]);

  const handleCheckboxChange = (key: FavoriteCardKey) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    onSave(prefs);
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Customize Favorite Cards</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-muted mb-3">
          Select which cards you want to display in your Favorite Cards section
        </p>

        <Form>
          {Object.entries(prefs).map(([key, value]) => (
            <Form.Check
              key={key}
              type="checkbox"
              id={`card-${key}`}
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              checked={value}
              onChange={() => handleCheckboxChange(key as FavoriteCardKey)}
              className="mb-2 text-capitalize"
            />
          ))}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
