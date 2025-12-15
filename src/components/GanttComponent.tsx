import React, { useRef, useEffect, useMemo, useCallback } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import ReactGantt, {
  type GanttConfig,
  type ReactGanttProps,
  type Link,
  type ReactGanttRef,
  type SerializedTask,
} from '@dhtmlx/trial-react-gantt';
import '@dhtmlx/trial-react-gantt/dist/react-gantt.css';

import {
  undo,
  redo,
  updateTask,
  createTask,
  deleteTask,
  updateLink,
  createLink,
  deleteLink,
  setZoom,
} from '../redux/ganttSlice';

import type { RootState, AppDispatch } from '../redux/store';
import Toolbar from '../common/Toolbar';
import { type ZoomLevel } from '../common/Seed';

const ReactGanttExample: React.FC = () => {
  const ganttRef = useRef<ReactGanttRef>(null);
  const dispatch = useDispatch<AppDispatch>();

  const { tasks, links, config } = useSelector((state: RootState) => state.gantt);

  useEffect(() => {
    document.title = 'DHTMLX React Gantt | Redux Toolkit';
  }, []);

  const handleUndo = useCallback(() => {
    dispatch(undo());
  }, [dispatch]);

  const handleRedo = useCallback(() => {
    dispatch(redo());
  }, [dispatch]);

  const handleZoomIn = useCallback(
    (newZoom: ZoomLevel) => {
      dispatch(setZoom(newZoom));
    },
    [dispatch]
  );

  const ganttConfig: GanttConfig = useMemo(() => ({ ...config }), [config]);

  const templates: ReactGanttProps['templates'] = useMemo(
    () => ({
      format_date: (date: Date) => date.toISOString(),
      parse_date: (date: string) => new Date(date),
    }),
    []
  );

  const data: ReactGanttProps['data'] = useMemo(
    () => ({
      save: (entity, action, payload, id) => {
        if (entity === 'task') {
          const task = payload as SerializedTask;
          if (action === 'update') {
            dispatch(updateTask(task));
          } else if (action === 'create') {
            dispatch(createTask(task));
          } else if (action === 'delete') {
            dispatch(deleteTask(String(id)));
          }
        } else if (entity === 'link') {
          const link = payload as Link;
          if (action === 'update') {
            dispatch(updateLink(link));
          } else if (action === 'create') {
            dispatch(createLink(link));
          } else if (action === 'delete') {
            dispatch(deleteLink(String(id)));
          }
        }
      },
    }),
    [dispatch]
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar onUndo={handleUndo} onRedo={handleRedo} onZoom={handleZoomIn} currentZoom={config.zoom.current} />

      <ReactGantt tasks={tasks} links={links} config={ganttConfig} templates={templates} data={data} ref={ganttRef} />
    </div>
  );
};

export default ReactGanttExample;
