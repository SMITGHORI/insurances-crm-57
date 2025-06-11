
import React, { useMemo, useState, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import VirtualList from './virtual-list';

const OptimizedTable = ({ 
  data = [], 
  columns = [], 
  isLoading = false,
  enableVirtualization = false,
  rowHeight = 60,
  maxHeight = 600,
  onRowClick,
  className = ""
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Memoize sorted data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const handleSort = useCallback((key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const renderRow = useCallback((item, index) => (
    <TableRow 
      key={item.id || index}
      className="hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onRowClick?.(item)}
    >
      {columns.map((column) => (
        <TableCell key={column.key} className={column.className}>
          {column.render ? column.render(item[column.key], item) : item[column.key]}
        </TableCell>
      ))}
    </TableRow>
  ), [columns, onRowClick]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Table>
        <TableHeader className="bg-gray-50 sticky top-0 z-10">
          <TableRow>
            {columns.map((column) => (
              <TableHead 
                key={column.key}
                className={`${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''} ${column.headerClassName || ''}`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center">
                  {column.label}
                  {column.sortable && sortConfig.key === column.key && (
                    <span className="ml-1">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        {enableVirtualization && sortedData.length > 50 ? (
          <TableBody>
            <TableRow>
              <TableCell colSpan={columns.length} className="p-0">
                <VirtualList
                  items={sortedData}
                  itemHeight={rowHeight}
                  containerHeight={maxHeight}
                  renderItem={renderRow}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <TableBody>
            {sortedData.map((item, index) => renderRow(item, index))}
          </TableBody>
        )}
      </Table>
    </div>
  );
};

export default React.memo(OptimizedTable);
