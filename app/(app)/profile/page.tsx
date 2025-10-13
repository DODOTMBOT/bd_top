'use client';

import { useState, useEffect } from 'react';
import { Avatar, Input, Textarea, Button, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Alert } from '@heroui/react';
import { useDisclosure } from '@heroui/react';
import { signOut } from 'next-auth/react';

type Profile = {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  about?: string;
  avatarUrl?: string | null;
};

export default function ProfilePage() {
  const [data, setData] = useState<Profile>({});
  const [saving, setSaving] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Модалка для уведомления о сохранении
  const { isOpen: isSuccessOpen, onOpen: onSuccessOpen, onOpenChange: onSuccessOpenChange } = useDisclosure();

  // Загрузка данных профиля при инициализации
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile', { cache: 'no-store' });
      const userData = await response.json();
      setData(userData || {});
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка сохранения: ${response.status} ${errorText}`);
      }
      
      onSuccessOpen();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert(`Ошибка сохранения профиля: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const pickAvatar = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      
      try {
        const b64 = await fileToDataURL(file);
        setData(d => ({ ...d, avatarUrl: b64 }));
      } catch (error) {
        console.error('Ошибка загрузки файла:', error);
        alert('Ошибка загрузки файла');
      }
    };
    input.click();
  };

  const fileToDataURL = (f: File): Promise<string> =>
    new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.onerror = rej;
      r.readAsDataURL(f);
    });

  if (isInitialLoading) {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-8">
        <Card className="shadow-lg">
          <CardBody className="p-8">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-500">Загрузка профиля...</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8">
      <Card className="shadow-lg">
        <CardBody className="p-8">
          {/* Аватар по центру */}
          <div className="flex flex-col items-center mb-8">
            <Avatar 
              src={data.avatarUrl || undefined} 
              className="w-24 h-24 text-large mb-4"
              name={data.name}
            />
            <Button 
              color="primary" 
              variant="flat" 
              onPress={pickAvatar}
            >
              Загрузить фото
            </Button>
          </div>

          {/* Основная форма */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Имя"
              value={data.name || ''}
              onChange={(e) => setData(p => ({ ...p, name: e.target.value }))}
              variant="bordered"
              size="md"
              placeholder="Введите имя"
            />
            <Input
              label="Email"
              value={data.email || ''}
              isDisabled
              variant="bordered"
              size="md"
            />
            <Input
              label="Телефон"
              value={data.phone || ''}
              onChange={(e) => setData(p => ({ ...p, phone: e.target.value }))}
              variant="bordered"
              size="md"
              placeholder="Введите номер телефона"
            />
            <Input
              label="Должность"
              value={data.position || ''}
              onChange={(e) => setData(p => ({ ...p, position: e.target.value }))}
              variant="bordered"
              size="md"
              placeholder="Введите должность"
            />
          </div>

          <Textarea
            label="О себе"
            value={data.about || ''}
            onChange={(e) => setData(p => ({ ...p, about: e.target.value }))}
            variant="bordered"
            size="md"
            className="mt-6"
            placeholder="Расскажите о себе"
            minRows={3}
          />

          {/* Кнопки в одном ряду по центру */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              color="primary"
              size="lg"
              isLoading={saving}
              onPress={handleSave}
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button
              color="danger"
              variant="flat"
              size="lg"
              onPress={handleLogout}
            >
              Выйти из аккаунта
            </Button>
          </div>
        </CardBody>
      </Card>
      
      {/* Модалка успешного сохранения */}
      <Modal isOpen={isSuccessOpen} onOpenChange={onSuccessOpenChange} placement="center" backdrop="blur">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Успешно!</ModalHeader>
              <ModalBody>
                <Alert color="success" variant="flat" title="Профиль сохранен" />
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  OK
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}