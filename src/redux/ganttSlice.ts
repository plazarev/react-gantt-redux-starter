import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { SerializedTask, Link, GanttConfig } from '@dhtmlx/trial-react-gantt';
import { defaultZoomLevels, seedLinks, seedTasks, type ZoomLevel } from '../common/Seed';
import { type WritableDraft } from 'immer';

interface Snapshot {
  tasks: SerializedTask[];
  links: Link[];
  config: GanttConfig;
}

interface GanttState {
  tasks: SerializedTask[];
  links: Link[];
  config: GanttConfig;
  past: Snapshot[];
  future: Snapshot[];
  maxHistory: number;
}

const initialState: GanttState = {
  tasks: seedTasks,
  links: seedLinks,
  config: {
    zoom: defaultZoomLevels,
  },
  past: [],
  future: [],
  maxHistory: 50,
};

const createSnapshot = (state: GanttState): WritableDraft<Snapshot> => ({
  tasks: JSON.parse(JSON.stringify(state.tasks)),
  links: JSON.parse(JSON.stringify(state.links)),
  config: JSON.parse(JSON.stringify(state.config)),
});

const pushHistory = (state: GanttState) => {
  state.past.push(createSnapshot(state) as Snapshot);
  if (state.past.length > state.maxHistory) state.past.shift();
  state.future = [];
};

const ganttSlice = createSlice({
  name: 'gantt',
  initialState,
  reducers: {
    undo(state) {
      if (state.past.length > 0) {
        const previous = state.past[state.past.length - 1];
        const newFuture = createSnapshot(state as GanttState);

        state.tasks = previous.tasks;
        state.links = previous.links;
        state.config = previous.config;
        state.past = state.past.slice(0, -1);
        state.future = [newFuture, ...state.future];
      }
    },
    redo(state) {
      if (state.future.length > 0) {
        const next = state.future[0];
        const newPast = createSnapshot(state as GanttState);

        state.tasks = next.tasks;
        state.links = next.links;
        state.config = next.config;
        state.future = state.future.slice(1);
        state.past = [...state.past, newPast];
      }
    },

    updateTask(state, action: PayloadAction<SerializedTask>) {
      pushHistory(state as GanttState);

      const updatedTask = action.payload;
      const index = state.tasks.findIndex((task) => task.id === updatedTask.id);
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...updatedTask };
      }
    },
    createTask(state, action: PayloadAction<SerializedTask>) {
      pushHistory(state as GanttState);

      state.tasks.push({ ...action.payload, id: `DB_ID:${action.payload.id}` });
    },
    deleteTask(state, action: PayloadAction<string>) {
      pushHistory(state as GanttState);

      state.tasks = state.tasks.filter((task) => String(task.id) !== action.payload);
    },
    updateLink(state, action: PayloadAction<Link>) {
      pushHistory(state as GanttState);

      const updatedLink = action.payload;
      const index = state.links.findIndex((link) => link.id === updatedLink.id);
      if (index !== -1) {
        state.links[index] = { ...state.links[index], ...updatedLink };
      }
    },
    createLink(state, action: PayloadAction<Link>) {
      pushHistory(state as GanttState);

      state.links.push({ ...action.payload, id: `DB_ID:${action.payload.id}` });
    },
    deleteLink(state, action: PayloadAction<string>) {
      pushHistory(state as GanttState);

      state.links = state.links.filter((link) => String(link.id) !== action.payload);
    },
    setZoom(state, action: PayloadAction<ZoomLevel>) {
      pushHistory(state as GanttState);

      state.config.zoom.current = action.payload;
    },
  },
});

export const { undo, redo, updateTask, createTask, deleteTask, updateLink, createLink, deleteLink, setZoom } =
  ganttSlice.actions;
export default ganttSlice.reducer;
