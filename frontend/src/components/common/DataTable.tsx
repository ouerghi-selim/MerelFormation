import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

interface Column<T> {
    title: string;
    field: keyof T | ((row: T) => React.ReactNode);
    sortable?: boolean;
    width?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyField: keyof T;
    loading?: boolean;
    actions?: (row: T) => React.ReactNode;
    onRowClick?: (row: T) => void;
    searchFields?: Array<keyof T>;
    emptyMessage?: string;
}

function DataTable<T>({
                          data,
                          columns,
                          keyField,
                          loading = false,
                          actions,
                          onRowClick,
                          searchFields,
                          emptyMessage = "Aucun élément trouvé"
                      }: DataTableProps<T>) {
    const [sortField, setSortField] = useState<keyof T | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState('');

    // Sort logic
    const handleSort = (field: keyof T) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Filter logic
    const safeData = Array.isArray(data) ? data : [];
    const filteredData = searchTerm && searchFields
        ? safeData.filter(row =>
            searchFields.some(field => {
                const value = row[field];
                return value && String(value).toLowerCase().includes(searchTerm.toLowerCase());
            })
        )
        : safeData;

    // Sort data
    const sortedData = Array.isArray(filteredData)
        ? (sortField
            ? [...filteredData].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (aValue === bValue) return 0;

            const comparison = aValue < bValue ? -1 : 1;
            return sortDirection === 'asc' ? comparison : -comparison;
            })
            : filteredData)
        : [];

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {searchFields && (
                <div className="p-4 border-b">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.width ? column.width : ''}`}
                                onClick={() => column.sortable && typeof column.field === 'string' && handleSort(column.field)}
                                style={column.sortable ? { cursor: 'pointer' } : {}}
                            >
                                <div className="flex items-center">
                                    {column.title}
                                    {column.sortable && typeof column.field === 'string' && sortField === column.field && (
                                        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                                    )}
                                </div>
                            </th>
                        ))}
                        {actions && (
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        )}
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-4 whitespace-nowrap">
                                <div className="flex justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-900"></div>
                                    <span className="ml-2">Chargement...</span>
                                </div>
                            </td>
                        </tr>
                    ) : sortedData.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        sortedData.map(row => (
                            <tr
                                key={String(row[keyField])}
                                className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
                                onClick={() => onRowClick && onRowClick(row)}
                            >
                                {columns.map((column, colIndex) => (
                                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                                        {typeof column.field === 'function'
                                            ? column.field(row)
                                            : String(row[column.field] || '')
                                        }
                                    </td>
                                ))}
                                {actions && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                        {actions(row)}
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DataTable;