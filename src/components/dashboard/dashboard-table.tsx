import { cn } from '@/lib/utils';

interface TableColumn<T = any> {
  key: string;
  label: string;
  className?: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DashboardTableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  className?: string;
}

export function DashboardTable<T>({ columns, data, className }: DashboardTableProps<T>) {
  return (
    <div className="rounded-md border overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            {columns.map((column) => (
              <th 
                key={column.key} 
                className="h-12 px-4 text-left align-middle font-medium text-muted-foreground text-sm"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
            >
              {columns.map((column) => (
                <td 
                  key={`${rowIndex}-${column.key}`} 
                  className="p-4 align-middle"
                >
                  {column.render 
                    ? column.render((row as any)[column.key], row) 
                    : (row as any)[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}