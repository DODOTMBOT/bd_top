"use client";
import { Modal as HModal, ModalContent as HModalContent, ModalHeader as HModalHeader, ModalBody as HModalBody, ModalFooter as HModalFooter } from "@heroui/react";
import { cn } from "@/lib/cn";

export type ModalProps = React.ComponentProps<typeof HModal>;
export type ModalContentProps = React.ComponentProps<typeof HModalContent>;
export type ModalHeaderProps = React.ComponentProps<typeof HModalHeader>;
export type ModalBodyProps = React.ComponentProps<typeof HModalBody>;
export type ModalFooterProps = React.ComponentProps<typeof HModalFooter>;

export function Modal({ className, ...props }: ModalProps) {
  return <HModal {...props} className={cn(className)} />;
}

export function ModalContent({ className, ...props }: ModalContentProps) {
  return <HModalContent {...props} className={cn(className)} />;
}

export function ModalHeader({ className, ...props }: ModalHeaderProps) {
  return <HModalHeader {...props} className={cn(className)} />;
}

export function ModalBody({ className, ...props }: ModalBodyProps) {
  return <HModalBody {...props} className={cn(className)} />;
}

export function ModalFooter({ className, ...props }: ModalFooterProps) {
  return <HModalFooter {...props} className={cn(className)} />;
}
