import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Container, 
  Grid, 
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  DndContext,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  MeasuringStrategy,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

import { getProxmoxMetrics, getStatus, updateWidgetPositions } from '../services/api';
import { getWidgetGridSize, WIDGET_SIZE_LABELS } from '../utils/widgetSizeHelper';
import { useWidgets } from '../context/WidgetsContext';
import { useEditMode } from '../context/EditModeContext';
import WidgetCard from '../components/WidgetCard';
import SortableWidget from '../components/SortableWidget';
import Footer from '../components/Footer';
import { NotesWidget } from '../widgets';
import WidgetFormDialog from '../components/WidgetFormDialog';
import EditWidgetDialog from '../components/EditWidgetDialog';
import TabNavigation from '../components/TabNavigation';


function Overview() {
  const [metrics, setMetrics] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Widget state
  const { widgets, removeWidget, addWidget, editWidget, setWidgets, activeTabId } = useWidgets();
  const { editMode } = useEditMode();
  const [forceKeys, setForceKeys] = useState({});
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);
  const [editWidgetOpen, setEditWidgetOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);

  // Drag & Drop state
  const [activeId, setActiveId] = useState(null);

  // Sensors dla drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filtruj widgety pod kątem aktywnej zakładki
  const visibleWidgets = widgets
    .filter(w => w.tab_id === activeTabId)
    .sort((a, b) => a.position - b.position);

  // Measuring strategy - optymalizacja wydajności
  const measuring = {
    droppable: {
      strategy: MeasuringStrategy.Always,
    },
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Nasłuchuj event z Navbar (przycisk +)
  useEffect(() => {
    const handleOpenAddWidget = () => setAddWidgetOpen(true);
    window.addEventListener('openAddWidget', handleOpenAddWidget);
    return () => window.removeEventListener('openAddWidget', handleOpenAddWidget);
  }, []);

  const fetchData = async () => {
    try {
      const [metricsRes, statusRes] = await Promise.all([
        getProxmoxMetrics(),
        getStatus()
      ]);
      setMetrics(metricsRes.data);
      setStatus(statusRes.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWidget = async (widgetId, newConfig) => {
    const result = await editWidget(widgetId, { config: newConfig });
    if (!result.success) {
      toast.error('Błąd zapisu');
    }
  };

  const handleEditConfig = (widget) => {
    setEditingWidget(widget);
    setEditWidgetOpen(true);
  };

  const handleSaveConfig = async (data) => {
    const result = await editWidget(editingWidget.id, {
      name: data.name,
      config: data.config
    });

    if (result.success) {
      toast.success('Konfiguracja zaktualizowana');
      setEditWidgetOpen(false);
      setEditingWidget(null);
    } else {
      toast.error(result.error || 'Błąd aktualizacji');
    }
  };

  const handleDeleteWidget = async (id, name) => {
    if (!window.confirm(`Czy na pewno usunąć widget "${name}"?`)) {
      return;
    }
    
    const result = await removeWidget(id);
    if (result.success) {
      toast.success('Widget usunięty');
    } else {
      toast.error('Błąd usuwania');
    }
  };

  const handleDuplicateWidget = async (widget) => {
    const result = await addWidget(
      widget.type,
      `${widget.name} (kopia)`,
      widget.config
    );
    
    if (result.success) {
      toast.success('Widget zduplikowany');
    } else {
      toast.error('Błąd duplikacji');
    }
  };

  const handleAddWidget = async (data) => {
    const result = await addWidget(data.type, data.name, data.config);
    
    if (result.success) {
      toast.success('Widget dodany');
      setAddWidgetOpen(false);
    } else {
      toast.error(result.error || 'Błąd dodawania');
    }
  };

  // ============================================================
  // DRAG & DROP HANDLERS
  // ============================================================

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = visibleWidgets.findIndex(w => w.id === active.id);
    const newIndex = visibleWidgets.findIndex(w => w.id === over.id);

    const reorderedVisible = arrayMove(visibleWidgets, oldIndex, newIndex);

    const reorderedWithPositions = reorderedVisible.map((w, idx) => ({ ...w, position: idx }));
    
    const finalWidgets = widgets.map(w => {
      const found = reorderedWithPositions.find(rw => rw.id === w.id);
      return found || w;
    });
    
    setWidgets(finalWidgets);

    const updates = reorderedWithPositions.map(w => ({
      id: w.id,
      position: w.position
    }));

    try {
      await updateWidgetPositions(updates);
    } catch (err) {
      toast.error('Błąd zapisu kolejności');
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleResizeWidget = async (widgetId, newSize) => {
    const oldWidget = widgets.find(w => w.id === widgetId);
    const oldSize = oldWidget?.size || 'medium';

    setWidgets(prev =>
      prev.map(w => (w.id === widgetId ? { ...w, size: newSize } : w))
    );

    const result = await editWidget(widgetId, { size: newSize });

    if (result.success) {
      toast.success(`Rozmiar: ${WIDGET_SIZE_LABELS[newSize]}`);
      setForceKeys(prev => ({ ...prev, [widgetId]: Date.now() }));
    } else {
      toast.error('Błąd');
      setWidgets(prev =>
        prev.map(w => (w.id === widgetId ? { ...w, size: oldSize } : w))
      );
    }
  };

  // ============================================================
  // RENDER HELPERS
  // ============================================================

  const renderWidget = (widget) => {
    switch (widget.type) {
      case 'notes':
        return (
          <NotesWidget
            widget={widget}
            onUpdate={(newConfig) => handleUpdateWidget(widget.id, newConfig)}
          />
        );
      default:
        return (
          <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
            Nieznany typ widgetu: {widget.type}
          </Box>
        );
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Błąd: {error}</Alert>
      </Container>
    );
  }

  const activeWidget = activeId ? widgets.find(w => w.id === activeId) : null;

  return (
    <Container sx={{ mt: 4, pb: 8 }}>
      
      <TabNavigation />

      {visibleWidgets.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          measuring={measuring}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={visibleWidgets.map(w => w.id)}
            strategy={rectSortingStrategy}
          >
            <Grid 
              container 
              spacing={3}
              sx={{ alignItems: 'flex-start' }}
            >
              {visibleWidgets.map((widget) => {
                const gridSize = getWidgetGridSize(widget.size);
                const widgetKey = `widget-${widget.id}-${widget.size}-${forceKeys[widget.id] || ''}`;

                return (
                  <Grid
                    key={widgetKey}
                    size={{ xs: 12, sm: gridSize.sm, md: gridSize.md }}
                    data-size={widget.size}
                  >
                    <SortableWidget id={widget.id} disabled={!editMode}>
                      <WidgetCard
                        widgetId={widget.id}
                        widgetName={widget.name}
                        widgetSize={widget.size}
                        onEdit={() => handleEditConfig(widget)}
                        onDelete={() => handleDeleteWidget(widget.id, widget.name)}
                        onDuplicate={() => handleDuplicateWidget(widget)}
                        onResize={(newSize) => handleResizeWidget(widget.id, newSize)}
                      >
                        {renderWidget(widget)}
                      </WidgetCard>
                    </SortableWidget>
                  </Grid>
                );
              })}
            </Grid>
          </SortableContext>

          <DragOverlay
            dropAnimation={{
              duration: 300,
              easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}
          >
            {activeWidget ? (
              <Box
                sx={{
                  width: (() => {
                    const size = activeWidget.size || 'medium';
                    if (size === 'small') return 300;
                    if (size === 'large') return 600;
                    return 400;
                  })(),
                  opacity: 0.95,
                  cursor: 'grabbing',
                  transform: 'rotate(-2deg)',
                  transformOrigin: '50% 50%',
                }}
              >
                <WidgetCard
                  widgetId={activeWidget.id}
                  widgetName={activeWidget.name}
                  widgetSize={activeWidget.size}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onDuplicate={() => {}}
                  onResize={() => {}}
                >
                  {renderWidget(activeWidget)}
                </WidgetCard>
              </Box>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {visibleWidgets.length === 0 && (
        <Alert severity="info" sx={{ mt: 3 }}>
          {editMode 
            ? 'Ta zakładka jest pusta. Dodaj widget przyciskiem [+] na górze.' 
            : 'Pusta zakładka.'}
        </Alert>
      )}

      <WidgetFormDialog
        open={addWidgetOpen}
        onClose={() => setAddWidgetOpen(false)}
        onSave={handleAddWidget}
        widgetType="notes"
      />

      <EditWidgetDialog
        open={editWidgetOpen}
        onClose={() => {
          setEditWidgetOpen(false);
          setEditingWidget(null);
        }}
        onSave={handleSaveConfig}
        widget={editingWidget}
      />

      <Footer status={status} />
    </Container>
  );
}

export default Overview;