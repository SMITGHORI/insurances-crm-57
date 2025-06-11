
import React, { useMemo, useState, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Button } from './button';
import { Input } from './input';
import VirtualList from './virtual-list';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import { useDebouncedValue } from '../../hooks/useDebouncedSearch';

const OptimizedDataTable = ({ 
  data = [], 
  columns = [], 
  isLoading = false,
  enableVirtualization = false,
  enableSearch = true,
  enableSorting = true,
  rowHeight = 60,
  maxHeight = 600,
  onRowClick,
  onSelectionChange,
  searchPlaceholder = "Search...",
  className = "",
  componentName = "OptimizedDataTable"
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedRows, setSelectedRows] = useState(new Set());
  
  // Performance monitoring
  const { renderTime } = usePerformanceMonitor(componentName);
  
  // Debounced search
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 300);

  // Memoized filtered and sorted data
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (debouncedSearchTerm && enableSearch) {
      filtered = data.filter(item => {
        return columns.some(column => {
          const value = item[column.key];
          return value && value.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        });
      });
    }

    // Apply sorting
    if (sortConfig.key && enableSorting) {
      filtered = [...filtered].sort((a, b) => {
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
    }

    return filtered;
  }, [data, debouncedSearchTerm, sortConfig, columns, enableSearch, enableSorting]);

  // Memoized callbacks
  const handleSort = useCallback((key) => {
    if (!enableSorting) return;
    
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, [enableSorting]);

  const handleRowSelect = useCallback((rowId, isSelected) => {
    const newSelection = new Set(selectedRows);
    if (isSelected) {
      newSelection.add(rowId);
    } else {
      newSelection.delete(rowId);
    }
    setSelectedRows(newSelection);
    onSelectionChange?.(Array.from(newSelection));
  }, [selectedRows, onSelectionChange]);

  const handleSelectAll = useCallback(() => {
    if (selectedRows.size === processedData.length) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const allIds = new Set(processedData.map(item => item.id));
      setSelectedRows(allIds);
      onSelectionChange?.(Array.from(allIds));
    }
  }, [processedData, selectedRows.size, onSelectionChange]);

  const renderRow = useCallback((item, index) => (
    <TableRow 
      key={item.id || index}
      className="hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onRowClick?.(item)}
    >
      {onSelectionChange && (
        <TableCell className="w-12">
          <input
            type="checkbox"
            checked={selectedRows.has(item.id)}
            onChange={(e) => {
              e.stopPropagation();
              handleRowSelect(item.id, e.target.checked);
            }}
            className="rounded border-gray-300"
          />
        </TableCell>
      )}
      {columns.map((column) => (
        <TableCell key={column.key} className={column.className}>
          {column.render ? column.render(item[column.key], item) : item[column.key]}
        </TableCell>
      ))}
    </TableRow>
  ), [columns, onRowClick, selectedRows, handleRowSelect, onSelectionChange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with search and actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {enableSearch && (
          <div className="flex-1 max-w-sm">
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        )}
        
        <div className="flex items-center gap-2">
          {selectedRows.size > 0 && (
            <span className="text-sm text-gray-600">
              {selectedRows.size} selected
            </span>
          )}
          {process.env.NODE_ENV === 'development' && (
            <span className="text-xs text-gray-500">
              Render: {renderTime}ms
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 sticky top-0 z-10">
            <TableRow>
              {onSelectionChange && (
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.size === processedData.length && processedData.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead 
                  key={column.key}
                  className={`${column.sortable && enableSorting ? 'cursor-pointer hover:bg-gray-100' : ''} ${column.headerClassName || ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.sortable && enableSorting && sortConfig.key === column.key && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          {enableVirtualization && processedData.length > 50 ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={columns.length + (onSelectionChange ? 1 : 0)} className="p-0">
                  <VirtualList
                    items={processedData}
                    itemHeight={rowHeight}
                    containerHeight={maxHeight}
                    renderItem={renderRow}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {processedData.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={columns.length + (onSelectionChange ? 1 : 0)} 
                    className="text-center py-8 text-gray-500"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                processedData.map((item, index) => renderRow(item, index))
              )}
            </TableBody>
          )}
        </Table>
      </div>

      {/* Footer with pagination info */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          Showing {processedData.length} of {data.length} entries
          {debouncedSearchTerm && ` (filtered from ${data.length} total)`}
        </span>
      </div>
    </div>
  );
};

export default React.memo(OptimizedDataTable);
