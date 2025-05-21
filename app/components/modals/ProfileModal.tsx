"use client";

import { JSX } from "react";
import { Modal } from "react-bootstrap";
import "./custom-modal.css";
import { User } from "lucide-react";

type ProfileModalProps = {
  show: boolean;
  onClose: () => void;
  title?: string;
  titleIcon?: JSX.Element;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "lg" | "xl";
  centered?: boolean;
  backdrop?: "static" | true;
  closable?: boolean;
  keyboard?: boolean;
};

export default function ProfileModal({
  show,
  onClose,
  title,
  children,
  footer,
  size,
  centered = true,
  backdrop = true,
  closable = true,
}: ProfileModalProps) {
  return (
    <Modal
      show={show}
      onHide={closable ? onClose : undefined}
      size={size}
      centered={centered}
      backdrop={closable ? backdrop : "static"}
      keyboard={false}
    >
      {title && (
        <Modal.Header
          closeButton={closable}
          className="custom-modal-header"
          closeVariant="white"
        >
          <Modal.Title>
            <h1 className="wizard-title">
              {" "}
              <User size={20} /> Complete Your Profile
            </h1>
            <p className="wizard-subtitle">Help us get to know you better</p>
          </Modal.Title>
        </Modal.Header>
      )}

      <Modal.Body className="card">{children}</Modal.Body>

      {footer && <Modal.Footer>{footer}</Modal.Footer>}
    </Modal>
  );
}
