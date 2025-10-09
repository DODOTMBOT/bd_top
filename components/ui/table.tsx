"use client";
import { Table as HTable, TableHeader as HTableHeader, TableColumn as HTableColumn, TableBody as HTableBody, TableRow as HTableRow, TableCell as HTableCell } from "@heroui/react";
import { cn } from "@/lib/cn";

export type TableProps = React.ComponentProps<typeof HTable>;
export type TableHeaderProps = React.ComponentProps<typeof HTableHeader>;
export type TableColumnProps = React.ComponentProps<typeof HTableColumn>;
export type TableBodyProps = React.ComponentProps<typeof HTableBody>;
export type TableRowProps = React.ComponentProps<typeof HTableRow>;
export type TableCellProps = React.ComponentProps<typeof HTableCell>;

export function Table({ className, ...props }: TableProps) {
  return <HTable {...props} className={cn(className)} />;
}

export function TableHeader({ className, ...props }: TableHeaderProps) {
  return <HTableHeader {...props} className={cn(className)} />;
}

export function TableColumn({ className, ...props }: TableColumnProps) {
  return <HTableColumn {...props} className={cn(className)} />;
}

export function TableBody({ className, ...props }: TableBodyProps) {
  return <HTableBody {...props} className={cn(className)} />;
}

export function TableRow({ className, ...props }: TableRowProps) {
  return <HTableRow {...props} className={cn(className)} />;
}

export function TableCell({ className, ...props }: TableCellProps) {
  return <HTableCell {...props} className={cn(className)} />;
}
