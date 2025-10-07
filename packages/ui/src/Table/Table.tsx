import React from 'react';
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Checkbox,
  Typography,
  CircularProgress,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';

export interface TableColumn {
  id: string;
  label: React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  minWidth?: string | number;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface TableProps {
  columns: TableColumn[];
  rows: any[];
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (selected: string[]) => void;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  variant?: 'default' | 'striped';
  size?: 'sm' | 'md' | 'lg';
  stickyHeader?: boolean;
  maxHeight?: string | number;
  emptyMessage?: React.ReactNode;
  loading?: boolean;
  getRowId?: (row: any, index: number) => string;
}

const StyledTableContainer = styled(TableContainer)<{ maxHeight?: string | number }>(
  ({ maxHeight }) => ({
    ...(maxHeight && {
      maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
    }),
  })
);

const StyledTable = styled(MuiTable, {
  shouldForwardProp: (prop: string) => !['variant', 'size'].includes(prop),
})<{ variant?: 'default' | 'striped'; size?: 'sm' | 'md' | 'lg' }>(({ theme, variant, size }) => ({
    // Size variants
    '& .MuiTableCell-root': {
      ...(size === 'sm' && {
        padding: theme.spacing(1),
        fontSize: theme.typography.body2.fontSize,
      }),
      ...(size === 'md' && {
        padding: theme.spacing(1.5),
        fontSize: theme.typography.body1.fontSize,
      }),
      ...(size === 'lg' && {
        padding: theme.spacing(2),
        fontSize: theme.typography.body1.fontSize,
      }),
    },

    // Striped variant
    ...(variant === 'striped' && {
      '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)': {
        backgroundColor: theme.palette.action.hover,
      },
    }),
  })
);

export const Table = React.forwardRef<HTMLDivElement, TableProps>(
  ({
    columns,
    rows,
    selectable = false,
    selectedRows = [],
    onSelectionChange,
    sortBy,
    sortDirection = 'asc',
    onSort,
    variant = 'default',
    size = 'md',
    stickyHeader = false,
    maxHeight,
    emptyMessage = 'No data available',
    loading = false,
    getRowId = (row, index) => row.id || index.toString(),
    ...props
  }, ref) => {
    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!onSelectionChange) return;
      
      if (event.target.checked) {
        const allRowIds = rows.map((row, index) => getRowId(row, index));
        onSelectionChange(allRowIds);
      } else {
        onSelectionChange([]);
      }
    };

    const handleSelectRow = (rowId: string) => {
      if (!onSelectionChange) return;
      
      if (selectedRows.includes(rowId)) {
        onSelectionChange(selectedRows.filter(id => id !== rowId));
      } else {
        onSelectionChange([...selectedRows, rowId]);
      }
    };

    const handleSort = (columnId: string) => {
      if (!onSort) return;
      
      const isAsc = sortBy === columnId && sortDirection === 'asc';
      onSort(columnId, isAsc ? 'desc' : 'asc');
    };

    const isAllSelected = selectedRows.length > 0 && selectedRows.length === rows.length;
    const isIndeterminate = selectedRows.length > 0 && selectedRows.length < rows.length;

    return (
      <StyledTableContainer ref={ref} maxHeight={maxHeight} {...props}>
        <StyledTable stickyHeader={stickyHeader}>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={isIndeterminate}
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth,
                  }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortDirection : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <CircularProgress size="2rem" />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  align="center"
                  sx={{ py: 4 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => {
                const rowId = getRowId(row, index);
                const isSelected = selectedRows.includes(rowId);

                return (
                  <TableRow key={rowId} selected={isSelected}>
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleSelectRow(rowId)}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align || 'left'}>
                          {column.render ? column.render(value, row) : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </StyledTable>
      </StyledTableContainer>
    );
  }
);

Table.displayName = 'Table';