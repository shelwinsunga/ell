import React, { useMemo, useEffect, useState } from 'react';
import { FiChevronDown, FiArrowUp, FiArrowDown, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';
import { HierarchicalTableProvider, useHierarchicalTable } from './HierarchicalTableContext';
import { Checkbox } from "components/common/Checkbox";
import { Input } from "components/common/Input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/common/Tables";

const TableRowComponent = ({ item, schema, level = 0, onRowClick, columnWidths, updateWidth, rowClassName }) => {
  const { expandedRows, selectedRows, toggleRow, toggleSelection, isItemSelected } = useHierarchicalTable();
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedRows[item.id];
  const isSelected = isItemSelected(item);
  const [isNew, setIsNew] = useState(true);

  const customRowClassName = rowClassName ? rowClassName(item) : '';

  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => setIsNew(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  return (
    <React.Fragment>
      <TableRow
        className={`border-b border-gray-800 hover:bg-gray-800/30 cursor-pointer transition-all duration-500 ease-in-out 
          ${isSelected ? 'bg-blue-900/30' : ''} 
          ${customRowClassName}
          ${isNew ? 'animate-fade-in bg-green-900/30' : ''}`}
        onClick={() => {
          if (onRowClick) onRowClick(item);
        }}
      >
        <TableCell className="py-1 px-4 w-12 text-[13px]">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => toggleSelection(item, checked)}
            onClick={(e) => e.stopPropagation()}
          />
        </TableCell>
        <TableCell className="py-1 px-4 w-12 relative text-[13px]" style={{ paddingLeft: `${level * 20 + 16}px` }}>
          {hasChildren ? (
            <span onClick={(e) => { e.stopPropagation(); toggleRow(item.id); }}>
              {isExpanded ? <FiChevronDown className="text-gray-400 text-base" /> : <FiChevronRight className="text-gray-400 text-base" />}
            </span>
          ) : ( 
            <span className="w-4 h-4 inline-block relative">
              <span className="absolute left-1/2 top-1/2 w-1.5 h-1.5 bg-gray-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"></span>
            </span>
          )}
        </TableCell>
        {schema.columns.map((column, index) => {
          const content = column.render ? column.render(item) : item[column.key];
          const maxWidth = column.maxWidth || Infinity;
          return (
            <TableCell 
              key={index}
              className={`py-1 px-4 whitespace-nowrap overflow-hidden text-ellipsis text-[13px] ${column.className || ''}`}
              style={{ 
                ...column.style,
                maxWidth: maxWidth !== Infinity ? `${maxWidth}px` : undefined,
                width: `${Math.min(columnWidths[column.key] || 0, maxWidth)}px`
              }}
              title={typeof content === 'string' ? content : ''}
            >
              {content}
            </TableCell>
          );
        })}
      </TableRow>
      {hasChildren && isExpanded && item.children.map(child => (
        <TableRowComponent key={child.id} item={child} schema={schema} level={level + 1} onRowClick={onRowClick} columnWidths={columnWidths} updateWidth={updateWidth} rowClassName={rowClassName} />
      ))}
    </React.Fragment>
  );
};

const TableHeaderComponent = ({ schema, columnWidths, updateWidth }) => {
  const { isAllSelected, toggleAllSelection, sortConfig, onSort } = useHierarchicalTable();

  return (
    <TableHeader>
      <TableRow className="text-left text-[13px] text-gray-400 border-t border-b border-l border-r border-gray-800 bg-gray-800/30 ">
        <TableHead className="py-2 px-4 w-12">
          <Checkbox
            checked={isAllSelected()}
            onCheckedChange={(checked) => toggleAllSelection(checked)}
          />
        </TableHead>
        <TableHead className="py-2 px-4 w-12">
          <FiChevronRight className="text-gray-400 text-base" />
        </TableHead>
        {schema.columns.map((column, index) => {
          const maxWidth = column.maxWidth || Infinity;
          const isSorted = sortConfig.key === column.key;
          const sortIcon = isSorted ? (sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />) : null;
          return (
            <TableHead 
              key={index}
              className={`py-2 px-4 whitespace-nowrap overflow-hidden text-ellipsis text-[13px] ${column.headerClassName || ''} ${column.sortable ? 'cursor-pointer' : ''}`}
              style={{ 
                maxWidth: maxWidth !== Infinity ? `${maxWidth}px` : undefined,
                width: `${Math.min(columnWidths[column.key] || 0, maxWidth)}px`,
                ...column.headerStyle
              }}
              onClick={() => column.sortable && onSort(column.key)}
            >
              <div className="flex items-center justify-between">
                <span>{column.header}</span>
                {sortIcon}
              </div>
            </TableHead>
          );
        })}
      </TableRow>
    </TableHeader>
  );
};

const TableBodyComponent = ({ schema, onRowClick, columnWidths, updateWidth, rowClassName }) => {
  const { sortedData } = useHierarchicalTable();

  return (
    <TableBody>
      {sortedData.map(item => (
        <TableRowComponent 
          key={item.id} 
          item={item} 
          schema={schema} 
          onRowClick={onRowClick} 
          columnWidths={columnWidths} 
          updateWidth={updateWidth}
          rowClassName={rowClassName}
        />
      ))}
    </TableBody>
  );
};

const PaginationControls = ({ currentPage, totalPages, onPageChange, pageSize, totalItems }) => {
  // const startItem = currentPage * pageSize + 1;
  // const endItem = Math.min((currentPage + 1) * pageSize, totalItems);

  return (
    <div className="flex justify-between items-center mt-4 text-[13px]">
      <div className="text-gray-400">
        {/* Showing {startItem} to {endItem} of {totalItems} items */}
      </div>
      <div className="flex items-center">
        <button
          onClick={() => onPageChange(0)}
          disabled={currentPage === 0}
          className="p-2 rounded-md text-gray-400 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          title="First Page"
        >
          <FiChevronsLeft />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-2 rounded-md text-gray-400 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed ml-2"
          title="Previous Page"
        >
          <FiChevronLeft />
        </button>
        <span className="mx-4 text-gray-400">
          Page {currentPage + 1}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="p-2 rounded-md text-gray-400 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed mr-2"
          title="Next Page"
        >
          <FiChevronRight />
        </button>
        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={currentPage === totalPages - 1}
          className="p-2 rounded-md text-gray-400 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Last Page"
        >
          <FiChevronsRight />
        </button>
      </div>
    </div>
  );
};

const HierarchicalTable = ({ schema, data, onRowClick, onSelectionChange, initialSortConfig, rowClassName, currentPage, onPageChange, pageSize, totalItems, omitColumns, expandAll, tableWidth = '100%' }) => {
  const [columnWidths, setColumnWidths] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);

  const updateWidth = (key, width, maxWidth) => {
    setColumnWidths(prev => ({
      ...prev,
      [key]: Math.min(Math.max(prev[key] || 0, width), maxWidth)
    }));
  };

  useEffect(() => {
    const initialWidths = {};
    schema.columns.forEach(column => {
      initialWidths[column.key] = 0;
    });
    setColumnWidths(initialWidths);
  }, [schema]);

  const totalPages = Math.ceil(totalItems / pageSize);

  const filteredSchema = useMemo(() => {
    if (omitColumns && !isExpanded) {
      return {
        ...schema,
        columns: schema.columns.filter(column => !omitColumns.includes(column.key))
      };
    }
    return schema;
  }, [schema, omitColumns, isExpanded]);

  return (
    <HierarchicalTableProvider 
      data={data} 
      onSelectionChange={onSelectionChange}
      initialSortConfig={initialSortConfig}
      setIsExpanded={setIsExpanded}
      expandAll={expandAll}
    >
      <div className="overflow-x-auto hide-scrollbar" style={{ width: tableWidth }}>
        <Table>
          <TableHeaderComponent 
            schema={filteredSchema} 
            columnWidths={columnWidths} 
            updateWidth={updateWidth} 
          />
          <TableBodyComponent 
            schema={filteredSchema} 
            onRowClick={onRowClick} 
            columnWidths={columnWidths} 
            updateWidth={updateWidth}
            rowClassName={rowClassName}
          />
        </Table>
      </div>
      {onPageChange && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          pageSize={pageSize}
          totalItems={totalItems}
        />
      )}
    </HierarchicalTableProvider>
  );
};

export default HierarchicalTable;