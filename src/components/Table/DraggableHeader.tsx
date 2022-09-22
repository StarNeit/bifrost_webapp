import {
  Portal, TableCellBaseProps, TableRow,
} from '@material-ui/core';
import { ElementType, useRef } from 'react';
import {
  DragDropContext, Draggable, DraggableProvided, DraggableStateSnapshot, Droppable,
} from 'react-beautiful-dnd';
import { HeaderGroup } from 'react-table';

import { ROOT_ELEMENT_ID } from '../../config';

interface DraggableHeaderProps<T extends Record<string, unknown>> {
  columnIds: string[];
  disabledReorderColumnIds?: string[];
  headerGroup: HeaderGroup<T>;
  onOrderChange: (orderedColumnIds: string[]) => void;
  onOrderChangeDone?: () => void;
  renderCell: (args: {
    column: HeaderGroup<T>;
    draggableProvided: DraggableProvided;
    draggableSnapshot: DraggableStateSnapshot;
    component: ElementType<TableCellBaseProps>;
  }) => JSX.Element;
}

const rootElement = document.getElementById(ROOT_ELEMENT_ID);

function DraggableHeader<T extends Record<string, unknown>>({
  columnIds,
  onOrderChange,
  onOrderChangeDone = () => null,
  headerGroup,
  renderCell,
  disabledReorderColumnIds,
}: DraggableHeaderProps<T>) {
  const currentColumnOrder = useRef<string[]>();

  return (
    <DragDropContext
      onDragStart={() => {
        currentColumnOrder.current = columnIds;
      }}
      onDragUpdate={(dragUpdateObj) => {
        if (!currentColumnOrder.current?.length) return;

        const columnOrder = [...currentColumnOrder.current];
        const currentIndex = dragUpdateObj.source.index;
        const destinationIndex = dragUpdateObj.destination?.index;

        if (destinationIndex !== undefined) {
          columnOrder.splice(currentIndex, 1);
          columnOrder.splice(destinationIndex, 0, dragUpdateObj.draggableId);
          onOrderChange(columnOrder);
        }
      }}
      onDragEnd={onOrderChangeDone}
    >
      <Droppable droppableId="droppable" direction="horizontal">
        {(droppableProvider) => (
          <TableRow
            {...headerGroup.getHeaderGroupProps()}
            {...droppableProvider.droppableProps}
            ref={droppableProvider.innerRef}
          >
            {headerGroup.headers.map((column, index) => (
              <Draggable
                key={column.id}
                draggableId={column.id}
                index={index}
                isDragDisabled={disabledReorderColumnIds?.includes(column.id)}
              >
                {(draggableProvided, draggableSnapshot) => {
                  const Cell = renderCell({
                    draggableProvided,
                    draggableSnapshot,
                    column,
                    component: draggableSnapshot.isDragging ? 'div' : 'th',
                  });

                  return (
                    draggableSnapshot.isDragging
                      // to avoid all the parents transform properties
                      ? <Portal container={rootElement}>{Cell}</Portal>
                      : Cell
                  );
                }}
              </Draggable>
            ))}
            {droppableProvider.placeholder}
          </TableRow>
        )}
      </Droppable>
    </DragDropContext>

  );
}

export default DraggableHeader;
