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
  closestCenter,
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


function Overview() {
  const [metrics, setMetrics] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Widget state
  const { widgets, removeWidget, addWidget, editWidget, setWidgets } = useWidgets();
  const { editMode } = useEditMode();
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);
  const [editWidgetOpen, setEditWidgetOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);

  // Drag & Drop state
  const [activeId, setActiveId] = useState(null);

  // Sensors dla drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum 8px ruchu aby zaczął drag (zapobiega przypadkowemu drag)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

    // Znajdź indeksy
    const oldIndex = widgets.findIndex(w => w.id === active.id);
    const newIndex = widgets.findIndex(w => w.id === over.id);

    // Przesuń widgety w lokalnym state (optimistic update)
    const reorderedWidgets = arrayMove(widgets, oldIndex, newIndex);
    setWidgets(reorderedWidgets);

    // Przygotuj updates dla backendu
    const updates = reorderedWidgets.map((widget, index) => ({
      id: widget.id,
      position: index
    }));

    // Zapisz w bazie
    try {
      await updateWidgetPositions(updates);
    } catch (err) {
      toast.error('Błąd zapisu kolejności');
      // Rollback
      setWidgets(widgets);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleResizeWidget = async (widgetId, newSize) => {
    const result = await editWidget(widgetId, { size: newSize });
    
    if (result.success) {
        toast.success(`Rozmiar zmieniony: ${WIDGET_SIZE_LABELS[newSize]}`);
      } else {
        toast.error('Błąd zmiany rozmiaru');
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

  // Aktywny widget (dla DragOverlay)
  const activeWidget = activeId ? widgets.find(w => w.id === activeId) : null;
  console.log('=== OVERVIEW DEBUG ===');
  console.log('Widget 0:', widgets[0]);
  console.log('Widget 0 size:', widgets[0]?.size);
  return (
    <Container sx={{ mt: 4, pb: 8 }}>
      {/* pb: 8 = padding bottom dla footer */}

      {/* Widgety użytkownika - Z DRAG & DROP */}
      {widgets.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          measuring={measuring}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={widgets.map(w => w.id)}
            strategy={rectSortingStrategy}
          >
            <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
              {widgets.map((widget) => (
                <Grid item {...getWidgetGridSize(widget.size)} key={widget.id}>
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
              ))}
            </Grid>
          </SortableContext>

          {/* DragOverlay - pokazuje dragged widget */}
          <DragOverlay
            dropAnimation={{
              duration: 300,
              easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}
          >
            {activeWidget ? (
              <Box
                sx={{
                  width: 350,
                  opacity: 0.95,
                  cursor: 'grabbing',
                  transform: 'rotate(-2deg)',
                  transformOrigin: '50% 50%',
                }}
              >
                <WidgetCard
                  widgetId={activeWidget.id}
                  widgetName={activeWidget.name}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onDuplicate={() => {}}
                >
                  {renderWidget(activeWidget)}
                </WidgetCard>
              </Box>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Info gdy brak widgetów w edit mode */}
      {widgets.length === 0 && editMode && (
        <Alert severity="info" sx={{ mt: 3 }}>
          Brak widgetów. Kliknij przycisk [+] w górnym pasku, aby dodać pierwszy widget.
        </Alert>
      )}

      {/* Dialog dodawania widgetu */}
      <WidgetFormDialog
        open={addWidgetOpen}
        onClose={() => setAddWidgetOpen(false)}
        onSave={handleAddWidget}
        widgetType="notes"
      />

      {/* Dialog edycji konfiguracji */}
      <EditWidgetDialog
        open={editWidgetOpen}
        onClose={() => {
          setEditWidgetOpen(false);
          setEditingWidget(null);
        }}
        onSave={handleSaveConfig}
        widget={editingWidget}
      />

      {/* Footer ze statusem homelab */}
      <Footer status={status} />
    </Container>
  );
}

export default Overview;