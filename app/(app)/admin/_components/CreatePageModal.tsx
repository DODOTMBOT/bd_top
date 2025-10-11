"use client";
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Button} from "@heroui/react";

export default function CreatePageModal({
  isOpen, onOpenChange, createAction,
}:{ isOpen:boolean; onOpenChange:(open:boolean)=>void;
   createAction:(s:unknown, fd:FormData)=>Promise<{ok:boolean; error?:string}>; }) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>Новая страница</ModalHeader>
        <form action={createAction}>
          <ModalBody>
            <Input name="title" label="Заголовок" autoFocus />
            <Input name="slug"  label="Slug (латиница/цифры/дефис)" />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" type="button" onPress={()=>onOpenChange(false)}>Отмена</Button>
            <Button color="primary" type="submit">Создать</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
