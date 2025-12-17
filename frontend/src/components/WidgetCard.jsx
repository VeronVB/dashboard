import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  Card,
  CardContent,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  alpha,
  ButtonGroup,
  Tooltip,
  Collapse
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  DragIndicator as DragIcon,
  ViewColumn as SmallIcon,
  ViewDay as MediumIcon,
  ViewWeek as LargeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useEditMode } from '../context/EditModeContext';
import { WIDGET_SIZE_LABELS } from '../utils/widgetSizeHelper';

// ============================================================
// KONFIGURACJA WYSOKOŚCI
// Zmień tę wartość aby dostosować domyślną wysokość widgetu
// ============================================================
const DEFAULT_COLLAPSED_HEIGHT = 210 // px - wysokość zwiniętego widgetu
const EDIT_MODE_HEADER_HEIGHT = 50;   // px - wysokość headera w edit mode

/**
 * WidgetCard - wrapper z edit mode overlay, resize i collapse/expand
 */
function WidgetCard({ 
  children, 
  widgetId,
  widgetName,
  widgetSize = 'medium',
  widgetConfig = {},
  onEdit, 
  onDelete, 
  onDuplicate,
  onResize,
  onUpdateConfig
}) {
  const { editMode } = useEditMode();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);
  const contentRef = useRef(null);

  // Sprawdź czy autoExpand jest włączone w konfiguracji
  const autoExpand = widgetConfig?.autoExpand ?? false;

  // Przywróć stan isExpanded z konfiguracji przy renderze
  useEffect(() => {
    if (widgetConfig?.isExpanded !== undefined && !autoExpand) {
      setIsExpanded(widgetConfig.isExpanded);
    }
  }, [widgetConfig?.isExpanded, autoExpand]);

  // Jeśli autoExpand - zawsze rozwinięty
  useEffect(() => {
    if (autoExpand) {
      setIsExpanded(true);
      setNeedsExpand(false);
    }
  }, [autoExpand]);

  // ResizeObserver do wykrywania czy treść przekracza limit
  // Działa poprawnie nawet gdy dane ładują się asynchronicznie
  useLayoutEffect(() => {
    if (autoExpand) {
      setNeedsExpand(false);
      return;
    }

    const checkHeight = () => {
      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight;
        setNeedsExpand(contentHeight > DEFAULT_COLLAPSED_HEIGHT);
      }
    };

    // Sprawdź natychmiast
    checkHeight();

    // Sprawdź po krótkim opóźnieniu (dla pewności że DOM się wyrenderował)
    const timeoutId = setTimeout(checkHeight, 100);

    // Obserwuj zmiany rozmiaru (np. gdy załadują się dane)
    let resizeObserver;
    if (contentRef.current) {
      resizeObserver = new ResizeObserver(() => {
        checkHeight();
      });
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [autoExpand, children, editMode]); // editMode jako dependency!

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit?.();
  };

  const handleDuplicate = () => {
    handleMenuClose();
    onDuplicate?.();
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete?.();
  };

  const handleResize = (size) => {
    onResize?.(size);
  };

  const handleToggleExpand = (e) => {
    e.stopPropagation();
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    
    // Zapisz stan w bazie przez onUpdateConfig
    if (onUpdateConfig) {
      onUpdateConfig({ ...widgetConfig, isExpanded: newExpanded });
    }
  };

  // Oblicz wysokość contentu
  const contentMaxHeight = autoExpand || isExpanded 
    ? 'none' 
    : `${DEFAULT_COLLAPSED_HEIGHT}px`;

  return (
    <Card
      sx={{
        position: 'relative',
        transition: 'all 0.3s ease',
        border: editMode ? 2 : 1,
        borderColor: editMode ? 'warning.main' : 'divider',
        boxShadow: editMode ? `0 0 20px ${alpha('#ff9800', 0.3)}` : 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible',
        '&:hover': {
          boxShadow: editMode ? `0 0 30px ${alpha('#ff9800', 0.5)}` : 3,
        }
      }}
    >
      {/* Edit Mode Overlay Header */}
      {editMode && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: EDIT_MODE_HEADER_HEIGHT,
            bgcolor: alpha('#ff9800', 0.1),
            borderBottom: 1,
            borderColor: 'warning.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1,
            zIndex: 10
          }}
        >
          {/* Drag Handle */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'grab',
              touchAction: 'none',
              '&:active': {
                cursor: 'grabbing'
              }
            }}
          >
            <DragIcon sx={{ color: 'warning.main', mr: 1 }} />
            <Box
              component="span"
              sx={{
                fontSize: '0.75rem',
                color: 'warning.main',
                fontWeight: 'bold',
                userSelect: 'none'
              }}
            >
              PRZECIĄGNIJ
            </Box>
          </Box>

          {/* Resize Buttons */}
          <ButtonGroup
            size="small"
            sx={{ mr: 1 }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Tooltip title={WIDGET_SIZE_LABELS.small}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResize('small');
                }}
                sx={{
                  color: widgetSize === 'small' ? 'warning.main' : 'text.secondary',
                  bgcolor: widgetSize === 'small' ? alpha('#ff9800', 0.2) : 'transparent'
                }}
              >
                <SmallIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title={WIDGET_SIZE_LABELS.medium}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResize('medium');
                }}
                sx={{
                  color: widgetSize === 'medium' ? 'warning.main' : 'text.secondary',
                  bgcolor: widgetSize === 'medium' ? alpha('#ff9800', 0.2) : 'transparent'
                }}
              >
                <MediumIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title={WIDGET_SIZE_LABELS.large}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResize('large');
                }}
                sx={{
                  color: widgetSize === 'large' ? 'warning.main' : 'text.secondary',
                  bgcolor: widgetSize === 'large' ? alpha('#ff9800', 0.2) : 'transparent'
                }}
              >
                <LargeIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </ButtonGroup>

          {/* Menu Button */}
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{
              color: 'warning.main',
              '&:hover': { bgcolor: alpha('#ff9800', 0.2) }
            }}
          >
            <MoreIcon />
          </IconButton>
        </Box>
      )}

      {/* Widget Content */}
      <CardContent
        sx={{
          pt: editMode ? `${EDIT_MODE_HEADER_HEIGHT + 16}px` : 2,
          pb: needsExpand && !autoExpand ? 4 : 2,
          overflow: 'hidden',
          flex: 1,
          wordBreak: 'break-word',
          position: 'relative'
        }}
      >
        {/* Zewnętrzny wrapper - odpowiada za przycinanie (okno widoku) */}
        <Box
          sx={{
            // minHeight gwarantuje jednakową wysokość nawet gdy content jest mały
            minHeight: autoExpand ? 'auto' : `${DEFAULT_COLLAPSED_HEIGHT}px`,
            maxHeight: contentMaxHeight,
            overflow: 'hidden',
            transition: 'max-height 300ms ease-in-out',
            // Gradient fade gdy zwinięty i jest więcej treści
            ...(needsExpand && !isExpanded && !autoExpand && {
              maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
            })
          }}
        >
          <Box ref={contentRef}>
            {children}
          </Box>
        </Box>
      </CardContent>

      {/* Expand/Collapse Button - tylko gdy treść przekracza limit i nie jest autoExpand */}
      {needsExpand && !autoExpand && (
        <Tooltip title={isExpanded ? 'Zwiń' : 'Rozwiń'}>
          <IconButton
            onClick={handleToggleExpand}
            sx={{
              position: 'absolute',
              bottom: -16,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              boxShadow: 2,
              width: 32,
              height: 32,
              zIndex: 20,
              transition: 'all 200ms ease',
              '&:hover': {
                bgcolor: 'action.hover',
                transform: 'translateX(-50%) scale(1.1)'
              }
            }}
          >
            {isExpanded ? (
              <ExpandLessIcon fontSize="small" />
            ) : (
              <ExpandMoreIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      )}

      {/* Edit Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edytuj konfigurację</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleDuplicate}>
          <ListItemIcon>
            <DuplicateIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplikuj widget</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Usuń</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  );
}

export default WidgetCard;

