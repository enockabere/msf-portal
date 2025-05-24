"use client";

import { JSX } from "react";
import { Modal } from "react-bootstrap";
import PageLoader from "../loaders/PageLoader";

type CustomModalProps = {
  show: boolean;
  onClose: () => void;
  title?: string;
  titleIcon?: JSX.Element;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "lg" | "xl";
  centered?: boolean;
  backdrop?: "static" | true;
};

export default function CustomModal({
  show,
  onClose,
  title,
  titleIcon,
  children,
  footer,
  size,
  centered = true,
  backdrop = true,
}: CustomModalProps) {
  return (
    <>
      <Modal
        show={show}
        onHide={onClose}
        size={size}
        centered={centered}
        backdrop={backdrop}
      >
        <PageLoader />
        {title && (
          <Modal.Header closeButton className="bg-danger" closeVariant="white">
            <Modal.Title className="d-flex align-items-center gap-2 text-white">
              {titleIcon}
              {title}
            </Modal.Title>
          </Modal.Header>
        )}

        <Modal.Body className="card">{children}</Modal.Body>

        {footer && <Modal.Footer>{footer}</Modal.Footer>}
      </Modal>
    </>
  );
}
