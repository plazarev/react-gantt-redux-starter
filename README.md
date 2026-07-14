# DHTMLX React Gantt with Redux Toolkit

A working starter project that integrates **DHTMLX React Gantt** with **Redux Toolkit** for centralized state management in a React + TypeScript application. Shows how to wire Gantt task and link operations to Redux actions, implement snapshot-based undo/redo, and connect a Material UI toolbar for zoom and history controls.

## What is DHTMLX React Gantt with Redux Toolkit Starter

This demo is the companion repository to the [DHTMLX Redux Toolkit integration tutorial](https://docs.dhtmlx.com/gantt/integrations/react/state/redux-toolkit/). It uses **DHTMLX React Gantt** — a commercial React component for interactive project scheduling — integrated with **Redux Toolkit** for predictable, centralized state management.

The app renders a fully interactive Gantt chart where every task creation, update, deletion, and dependency link change is routed through a Redux slice. A custom snapshot history tracks each change so users can undo and redo any action. A Material UI toolbar exposes zoom level controls (day, month, year) alongside undo/redo buttons.

The stack is React 19+, TypeScript, Vite, Redux Toolkit, and Material UI.

## When to Use

- Use this demo when you need to manage Gantt chart state in a Redux-based React application.
- Use this demo when you want a ready-to-run reference for wiring the `data.save` callback to Redux actions.
- Use this demo when you need snapshot-based undo/redo across all Gantt operations (tasks, links, and configuration).
- Use this demo when you want a starting point that includes a working Material UI toolbar connected to Gantt zoom and history state.
- Use this demo when you're evaluating DHTMLX React Gantt and want to see how it integrates with a popular state management library.

## Quick Start

Clone the repo, install dependencies, and run the dev server:

```bash
git clone https://github.com/DHTMLX/react-gantt-redux-starter.git
cd react-gantt-redux-starter
npm install
npm run dev
```

Open `http://localhost:5173`. You should see a Gantt chart with a toolbar for zoom and undo/redo controls.

> **Note:** This demo uses `@dhtmlx/trial-react-gantt`. To use the Professional package, replace all imports of `@dhtmlx/trial-react-gantt` with `@dhx/react-gantt`.

## Architecture

The app is structured around a single Redux slice (`ganttSlice`) that owns all Gantt data — tasks, links, and zoom configuration. The `GanttComponent` reads from the Redux store via `useSelector` and dispatches Redux actions via the `data.save` callback whenever the chart reports a change.

```
src/
├── redux/
│   ├── store.ts          # Redux store setup with typed RootState and AppDispatch
│   └── ganttSlice.ts     # Gantt slice: tasks, links, config, undo/redo history
├── common/
│   ├── Seed.ts           # Initial task/link data and zoom level definitions
│   └── Toolbar.tsx       # Material UI toolbar: zoom buttons + undo/redo icons
└── components/
    └── GanttComponent.tsx # Main component: connects Redux state to ReactGantt props
```

Data flows one way: user interactions in the Gantt chart trigger `data.save`, which dispatches to Redux, which updates state, which re-renders the Gantt chart via props.

## Key Patterns

- **Routing Gantt changes to Redux via `data.save`** — the `data.save` callback receives every task and link change (create, update, delete) and dispatches the matching Redux action, keeping the Redux store as the single source of truth.
- **Snapshot-based undo/redo** — each modifying action calls `pushHistory(state)` before mutating, deep-cloning the current `tasks`, `links`, and `config` into a `past` array. `undo` and `redo` reducers swap snapshots between `past` and `future`.
- **Performance optimization with `useMemo` and `useCallback`** — Gantt config objects and event handler callbacks are memoized to prevent unnecessary re-renders when unrelated state changes occur.
- **Typed Redux integration** — `RootState` and `AppDispatch` types exported from `store.ts` enable fully typed `useSelector` and `useDispatch` usage throughout the component tree.

## Code Examples

### Dispatching Gantt changes to Redux

The `data.save` callback in `GanttComponent.tsx` intercepts all Gantt mutations and routes them to Redux:

```tsx
const data: ReactGanttProps['data'] = useMemo(
  () => ({
    save: (entity, action, payload, id) => {
      if (entity === 'task') {
        const task = payload as SerializedTask;
        if (action === 'update') dispatch(updateTask(task));
        else if (action === 'create') dispatch(createTask(task));
        else if (action === 'delete') dispatch(deleteTask(String(id)));
      } else if (entity === 'link') {
        const link = payload as SerializedLink;
        if (action === 'update') dispatch(updateLink(link));
        else if (action === 'create') dispatch(createLink(link));
        else if (action === 'delete') dispatch(deleteLink(String(id)));
      }
    },
  }),
  [dispatch]
);
```

Every user action in the chart becomes a typed Redux dispatch — no manual event listeners required.

### Snapshot-based undo/redo in the Redux slice

The slice maintains a `past` and `future` stack of full Gantt state snapshots:

```ts
const pushHistory = (state: GanttState) => {
  state.past.push(createSnapshot(state) as Snapshot);
  if (state.past.length > state.maxHistory) state.past.shift();
  state.future = [];
};


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
```

Every modifying reducer calls `pushHistory` first, so any change — including drag-and-drop rescheduling — is reversible.

### Material UI toolbar wired to Redux state

```tsx
<Toolbar
  onUndo={handleUndo}
  onRedo={handleRedo}
  onZoom={handleZoomIn}
  currentZoom={config.zoom.current}
/>
```


`currentZoom` comes directly from the Redux store, so zoom buttons reflect actual state rather than local UI state.

## Features

| Feature | Details |
|---|---|
| DHTMLX React Gantt | Interactive Gantt chart with drag-and-drop, task editing, and dependency links |
| Redux Toolkit slice | Centralized state for tasks, links, and Gantt configuration |
| Undo/redo | Snapshot history with configurable depth (`maxHistory: 50` by default) |
| Zoom controls | Three preset zoom levels: day, month, year — stored in Redux state |
| Material UI toolbar | Undo, redo, and zoom buttons built with MUI `ButtonGroup` and icons |
| TypeScript | Fully typed store, slice, and component props |
| Vite | Fast dev server and build tooling |

## Production Notes

This demo is a **starting point**, not a production-ready application. Key things to address before shipping:

- **No backend persistence** — all data is seeded from `Seed.ts` and lives in memory. A production app needs a real API and persistence layer.
- **No authentication** — the demo has no user sessions or access control.
- **Trial package** — the demo uses `@dhtmlx/trial-react-gantt`. A valid DHTMLX commercial license is required for production use.
- **ID management** — the `DB_ID:` prefix in `createTask` simulates backend ID assignment. Replace this with real IDs from your API responses.

## Related Resources

- [Redux Toolkit integration tutorial](https://docs.dhtmlx.com/gantt/integrations/react/state/redux-toolkit/) — the step-by-step guide this repo accompanies
- [DHTMLX React Gantt documentation](https://docs.dhtmlx.com/gantt/integrations/react/overview/)
- [React Gantt installation guide](https://docs.dhtmlx.com/gantt/integrations/react/installation/)
- [State management basics](https://docs.dhtmlx.com/gantt/integrations/react/state/state-management-basics/) — explains the `data.save` callback in depth
- [DHTMLX React Gantt product page](https://dhtmlx.com/docs/products/dhtmlxGantt-for-React/)
- [DHTMLX Gantt samples](https://docs.dhtmlx.com/gantt/samples/)
- [Forum](https://forum.dhtmlx.com/c/gantt/15) — community support

## License

The source code in this repository is released under the **MIT License**.
 
**Commercial License**
Required for proprietary or commercial applications. Includes access to PRO features, dedicated technical support, and long-term maintenance.
[Learn more →](https://dhtmlx.com/docs/products/dhtmlxGantt-for-React/#licensing)
 
**Try before you buy**
A free evaluation of DHTMLX React Gantt is available — no credit card required.
[Start your evaluation →](https://dhtmlx.com/docs/products/dhtmlxGantt-for-React/download.shtml)
