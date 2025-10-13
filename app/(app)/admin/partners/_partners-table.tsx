import { Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react";
import { impersonatePartner, clearImpersonation } from './_actions';
import { cookies } from 'next/headers';

type PartnerRow = {
  id: string;
  name: string;
  createdAt: Date;
  points: number;
  employees: number;
  plan: string;
  payStatus: 'Активна' | 'Нет' | '—';
};

interface PartnersTableProps {
  partners: PartnerRow[];
}

export default async function PartnersTable({ partners }: PartnersTableProps) {
  const cookieStore = await cookies();
  const impersonatedPartnerId = cookieStore.get('impersonatePartnerId')?.value;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Активна': return 'success';
      case 'Нет': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <Table aria-label="Таблица партнёров">
        <TableHeader>
          <TableColumn>ПАРТНЁР</TableColumn>
          <TableColumn>ТОЧЕК</TableColumn>
          <TableColumn>СОТРУДНИКОВ</TableColumn>
          <TableColumn>ТАРИФ</TableColumn>
          <TableColumn>ОПЛАТА</TableColumn>
          <TableColumn>ДЕЙСТВИЯ</TableColumn>
        </TableHeader>
        <TableBody>
          {partners.map((partner) => (
            <TableRow key={partner.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{partner.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(partner.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-medium">{partner.points}</span>
              </TableCell>
              <TableCell>
                <span className="font-medium">{partner.employees}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm">{partner.plan}</span>
              </TableCell>
              <TableCell>
                <Chip 
                  size="sm" 
                  color={getStatusColor(partner.payStatus)}
                  variant="flat"
                >
                  {partner.payStatus}
                </Chip>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <form action={impersonatePartner}>
                    <input type="hidden" name="partnerId" value={partner.id} />
                    <button 
                      type="submit" 
                      className="text-xs px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90"
                      disabled={impersonatedPartnerId === partner.id}
                    >
                      Войти как
                    </button>
                  </form>
                  
                  <a
                    href={`/admin/partners/${partner.id}`}
                    className="text-xs px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50 inline-block"
                  >
                    Открыть
                  </a>
                  
                  <form action={clearImpersonation}>
                    <button 
                      type="submit" 
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Сбросить вход
                    </button>
                  </form>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
