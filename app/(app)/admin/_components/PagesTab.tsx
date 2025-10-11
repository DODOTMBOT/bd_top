"use client";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Folder, Plus, Move } from "lucide-react";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Tooltip, Select, SelectItem } from "@heroui/react";

type Row = { route:string; file:string | null; isDynamic:boolean; protected:boolean; kind:string };

function prettyName(route: string) {
  const seg = route.split("/").filter(Boolean).pop() ?? "";
  const base = seg.replace(/\[.*?\]/g, "").replace(/-/g, " ").trim();
  return base ? base.replace(/(^|\s)\S/g, s => s.toUpperCase()) : "Главная";
}

type SortField = 'name' | 'route' | null;
type SortDirection = 'asc' | 'desc';

export default function PagesTab({ pages }: { pages: Row[] }) {
  const router = useRouter();
  const [localRows, setLocalRows] = useState<Row[]>(pages);
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [createErr, setCreateErr] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Состояние для создания папки
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [folderPath, setFolderPath] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  
  // Состояние для перемещения
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<Row | null>(null);
  const [targetFolder, setTargetFolder] = useState("");
  const [moving, setMoving] = useState(false);
  const [movingPages, setMovingPages] = useState<Set<string>>(new Set());

  const canOpen = (r: Row) => !(r.isDynamic || /\[[^\]]+\]/.test(r.route)) && r.kind === "page";

  // Синхронизируем локальное состояние с пропсами при их изменении
  useEffect(() => {
    setLocalRows(pages);
  }, [pages]);

  // Получаем список папок для выпадающего списка
  const availableFolders = useMemo(() => {
    return localRows
      .filter(row => row.kind === "folder")
      .map(folder => ({
        key: folder.route,
        label: prettyName(folder.route),
        value: folder.route
      }));
  }, [localRows]);

  // Sorting logic
  const sortedRows = useMemo(() => {
    if (!sortField) return localRows;
    
    return [...localRows].sort((a, b) => {
      let aValue: string;
      let bValue: string;
      
      if (sortField === 'name') {
        aValue = prettyName(a.route);
        bValue = prettyName(b.route);
      } else {
        aValue = a.route;
        bValue = b.route;
      }
      
      const comparison = aValue.localeCompare(bValue, 'ru');
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [localRows, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="size-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />;
  };

  // API функции
  async function apiCreatePage(path: string, title: string) {
    const res = await fetch("/api/admin/nodes", {
      method: "POST",
      headers: { "content-type":"application/json" },
      body: JSON.stringify({ type:"page", route: path, title }),
    });
    return res.json();
  }

  async function apiCreateFolder(path: string) {
    const res = await fetch("/api/admin/nodes", {
      method: "POST",
      headers: { "content-type":"application/json" },
      body: JSON.stringify({ type:"folder", route: path }),
    });
    return res.json();
  }

  async function apiDelete(path: string) {
    await fetch("/api/admin/nodes", {
      method: "DELETE",
      headers: { "content-type":"application/json" },
      body: JSON.stringify({ route: path }),
    });
  }

  async function apiMove(fromPath: string, toPath: string) {
    await fetch("/api/admin/nodes", {
      method: "PATCH",
      headers: { "content-type":"application/json" },
      body: JSON.stringify({ from: fromPath, to: toPath }),
    });
  }

  // Функции для работы с папками
  const createFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderPath.trim()) return;
    
    setCreatingFolder(true);
    try {
      const newFolderPath = folderPath.trim();
      
      // Оптимистичное обновление UI
      const newFolder: Row = {
        route: newFolderPath,
        file: null,
        isDynamic: false,
        protected: false,
        kind: "folder"
      };
      setLocalRows(prevRows => [...prevRows, newFolder].sort((a, b) => a.route.localeCompare(b.route)));
      
      await apiCreateFolder(newFolderPath);
      setFolderPath("");
      setCreateFolderOpen(false);
      
      // Обновляем серверные данные для синхронизации
      router.refresh();
    } catch (err:any) {
      console.error("Error creating folder:", err);
      // В случае ошибки возвращаем исходное состояние
      setLocalRows(pages);
    } finally {
      setCreatingFolder(false);
    }
  };

  // Функция для перемещения страницы
  const movePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage || !targetFolder) return;
    
    const pageRoute = selectedPage.route;
    const newPath = targetFolder + "/" + selectedPage.route.split("/").pop();
    
    setMoving(true);
    setMovingPages(prev => new Set(prev).add(pageRoute));
    
    try {
      // Оптимистичное обновление UI - сразу перемещаем страницу
      setLocalRows(prevRows => {
        const updatedRows = prevRows.map(row => 
          row.route === pageRoute 
            ? { ...row, route: newPath }
            : row
        );
        // Сортируем обновленный список для правильного отображения
        return updatedRows.sort((a, b) => a.route.localeCompare(b.route));
      });
      
      // Выполняем API запрос
      await apiMove(pageRoute, newPath);
      
      // Закрываем модалку и очищаем состояние
      setMoveModalOpen(false);
      setSelectedPage(null);
      setTargetFolder("");
      
      // Обновляем серверные данные для синхронизации
      router.refresh();
      
    } catch (err:any) {
      console.error("Error moving page:", err);
      // В случае ошибки возвращаем исходное состояние
      setLocalRows(pages);
    } finally {
      setMoving(false);
      setMovingPages(prev => {
        const newSet = new Set(prev);
        newSet.delete(pageRoute);
        return newSet;
      });
    }
  };

  // Функция для открытия модалки перемещения
  const openMoveModal = (page: Row) => {
    setSelectedPage(page);
    setTargetFolder("");
    setMoveModalOpen(true);
  };

  // Компонент для отображения строки страницы/папки
  const PageRow = ({ page }: { page: Row }) => {
    const slug = page.route.replace(/^\/+/, "");
    const canDelete = !page.protected && !page.isDynamic;
    const loading = deletingSlug === slug;
    const isFolder = page.kind === "folder";
    const canMove = !page.protected && !page.isDynamic && !isFolder;
    const isMoving = movingPages.has(page.route);
    
    return (
      <tr key={page.route} className={`border-b border-default-200 ${isFolder ? 'bg-blue-50 dark:bg-blue-950/20' : ''} ${isMoving ? 'opacity-60' : ''}`}>
        {/* Название страницы/папки */}
        <td className="whitespace-nowrap py-3 px-4">
          <div className="flex items-center gap-2">
            {isFolder ? (
              <Folder className="size-4 text-blue-600 dark:text-blue-400" />
            ) : null}
            <span className={isFolder ? "font-medium text-blue-900 dark:text-blue-100" : ""}>
              {prettyName(page.route)}
            </span>
            {isFolder && (
              <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                папка
              </span>
            )}
          </div>
        </td>

        {/* Путь */}
        <td className="text-default-500 py-3 px-4">
          <code className={`text-sm ${isFolder ? 'text-blue-700 dark:text-blue-300' : ''}`}>
            {page.route}
          </code>
        </td>

        {/* Действия: иконки */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-1">
            {/* Открыть: только для страниц */}
            {canOpen(page) ? (
              <Tooltip content="Открыть" placement="top">
                <Button
                  as={Link}
                  href={page.route}
                  isIconOnly
                  variant="light"
                  size="sm"
                  className="min-w-8 w-8 h-8"
                  aria-label="Открыть"
                  isDisabled={isMoving}
                >
                  <ExternalLink className="size-4" />
                </Button>
              </Tooltip>
            ) : (
              <span className="text-default-300 text-xs px-2">
                {isFolder ? "Папка" : "Шаблон"}
              </span>
            )}

            {/* Переместить: только для страниц */}
            {canMove && (
              <Tooltip content={isMoving ? "Перемещение..." : "Переместить в папку"} placement="top">
                <Button
                  variant="light"
                  size="sm"
                  isIconOnly
                  className="min-w-8 w-8 h-8"
                  onPress={() => openMoveModal(page)}
                  aria-label="Переместить"
                  isDisabled={isMoving}
                  isLoading={isMoving}
                >
                  <Move className="size-4" />
                </Button>
              </Tooltip>
            )}

            {/* Удалить: только если можно удалять */}
            {canDelete && (
              <Tooltip content="Удалить" placement="top">
                <Button
                  variant="light"
                  size="sm"
                  isIconOnly
                  className="min-w-8 w-8 h-8 text-danger hover:bg-danger/10"
                  onPress={()=>handleDelete(slug)}
                  isDisabled={loading || isMoving}
                  isLoading={loading}
                  aria-label="Удалить"
                >
                  <Trash2 className="size-4" />
                </Button>
              </Tooltip>
            )}
          </div>
        </td>
      </tr>
    );
  };

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateErr(null);
    if (!title.trim()) { setCreateErr("Пустой заголовок"); return; }
    setCreating(true);
    try {
      const res = await apiCreatePage("/" + title.toLowerCase().replace(/\s+/g, "-"), title);
      if (!res?.ok) throw new Error(res?.error || "Create failed");
      // оптимизм: добавить строку
      const route = res.path as string;
      setLocalRows(prev => [...prev, { route, file: `app/(app)${route}/page.tsx`, isDynamic:false, protected:false, kind:"page" }].sort((a,b)=>a.route.localeCompare(b.route)));
      setTitle("");
      setCreateOpen(false);
      router.refresh();
    } catch (err:any) {
      setCreateErr(err?.message || "Ошибка");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(slug: string) {
    setDeletingSlug(slug);
    try {
      await apiDelete("/" + slug);
      // оптимистично убрать строку
      setLocalRows(prev => prev.filter(r => r.route.replace(/^\/+/,"") !== slug));
      router.refresh();
    } finally {
      setDeletingSlug(null);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Страницы и папки</h3>
        <div className="flex gap-2">
          <Button 
            color="secondary" 
            variant="flat"
            startContent={<Plus className="size-4" />}
            onPress={()=>setCreateFolderOpen(true)}
          >
            Создать папку
          </Button>
          <Button color="primary" onPress={()=>setCreateOpen(true)}>Добавить страницу</Button>
        </div>
      </div>

      <div key={localRows.length} className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-default-200">
                <th className="text-left py-3 px-4">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('name')}>
                    <span>Название</span>
                    {getSortIcon('name')}
                  </div>
                </th>
                <th className="text-left py-3 px-4">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('route')}>
                    <span>Путь</span>
                    {getSortIcon('route')}
                  </div>
                </th>
                <th className="text-left py-3 px-4 w-0">Действия</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-default-500">
                    Страниц и папок нет
                  </td>
                </tr>
              ) : (
                sortedRows.map(page => (
                  <PageRow key={page.route} page={page} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={createOpen} onOpenChange={setCreateOpen}>
        <ModalContent>
          <ModalHeader>Новая страница</ModalHeader>
          <form onSubmit={handleCreate}>
            <ModalBody>
              <Input name="title" label="Заголовок" value={title} onChange={e=>setTitle(e.target.value)} autoFocus />
              {createErr && <p className="text-danger text-sm">{createErr}</p>}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" type="button" onPress={()=>setCreateOpen(false)}>Отмена</Button>
              <Button color="primary" type="submit" isDisabled={creating} isLoading={creating}>Создать</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <Modal isOpen={createFolderOpen} onOpenChange={setCreateFolderOpen}>
        <ModalContent>
          <ModalHeader>Создать папку</ModalHeader>
          <form onSubmit={createFolder}>
            <ModalBody>
              <Input 
                name="folderPath" 
                label="Путь папки" 
                value={folderPath} 
                onChange={e=>setFolderPath(e.target.value)} 
                autoFocus 
                placeholder="Например: /docs, /admin/settings, /users/profiles"
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" type="button" onPress={()=>setCreateFolderOpen(false)}>Отмена</Button>
              <Button color="primary" type="submit" isDisabled={creatingFolder || !folderPath.trim()} isLoading={creatingFolder}>
                Создать папку
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <Modal isOpen={moveModalOpen} onOpenChange={setMoveModalOpen}>
        <ModalContent>
          <ModalHeader>Переместить страницу</ModalHeader>
          <form onSubmit={movePage}>
            <ModalBody>
              <div className="mb-4">
                <p className="text-sm text-default-600 mb-2">
                  Перемещаем: <strong>{selectedPage?.route}</strong>
                </p>
              </div>
              <Select
                label="Выберите папку назначения"
                placeholder="Выберите папку"
                selectedKeys={targetFolder ? [targetFolder] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setTargetFolder(selected || "");
                }}
                description="Страница будет перемещена в выбранную папку"
              >
                {availableFolders.map((folder) => (
                  <SelectItem key={folder.value} value={folder.value}>
                    {folder.label}
                  </SelectItem>
                ))}
              </Select>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" type="button" onPress={()=>setMoveModalOpen(false)}>Отмена</Button>
              <Button color="primary" type="submit" isDisabled={moving || !targetFolder} isLoading={moving}>
                Переместить
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}