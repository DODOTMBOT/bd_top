import MenuEditor from '../_components/MenuEditor'

export default function MenuPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Управление меню</h1>
      <MenuEditor />
    </div>
  )
}