import React from "react";
import { IconButton } from "./button";
import { showConfirm } from "./ui-lib";

interface TableProps {
  columns: {
    key: string;
    title: string;
    dataIndex: string;
    render?: (value: any, record: any) => React.ReactNode;
  }[];
  dataSource: any[];
  onDelete?: (record: any) => void;
  onEdit?: (record: any) => void;
  showActionButtons?: boolean;
  className?: string;
}

export const Table: React.FC<TableProps> = ({
  columns,
  dataSource,
  onDelete,
  onEdit,
  showActionButtons = true,
  className = "",
}) => {
  return (
    <div className={`rounded-lg border ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-[var(--gray)]">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                {column.title}
              </th>
            ))}
            {showActionButtons && (onDelete || onEdit) && (
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                操作
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-[var(--white)] divide-y divide-gray-200 dark:divide-gray-700">
          {dataSource.map((record, index) => (
            <tr
              key={record.id || index}
              className="hover:bg-gray-50 dark:hover:bg-[var(--gray)] transition-colors duration-150"
            >
              {columns.map((column) => (
                <td
                  key={`${record.id || index}-${column.key}`}
                  className="px-6 py-4 whitespace-nowrap"
                >
                  <div className="text-sm text-gray-900 dark:text-gray-300">
                    {column.render
                      ? column.render(record[column.dataIndex], record)
                      : record[column.dataIndex]}
                  </div>
                </td>
              ))}
              {showActionButtons && (onDelete || onEdit) && (
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(record)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        编辑
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={async () => {
                          const confirmed = await showConfirm(
                            "确定要删除这条记录吗？此操作不可撤销。",
                          );
                          if (confirmed) {
                            onDelete(record);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400"
                      >
                        删除
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
