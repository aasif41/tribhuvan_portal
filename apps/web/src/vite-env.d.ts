/// <reference types="vite/client" />

declare module '@dnd-kit/core' {
  export type DragStartEvent = any;
  export type DragEndEvent = any;
  export const DndContext: any;
  export const useDraggable: any;
  export const useDroppable: any;
  export const DragOverlay: any;
  export const closestCenter: any;
  export const PointerSensor: any;
  export const useSensor: any;
  export const useSensors: any;
}

declare module '@dnd-kit/sortable';
declare module '@dnd-kit/utilities';
