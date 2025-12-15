import React, { useState } from 'react';
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
  Tooltip
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  DragIndicator as DragIcon,
  ViewColumn as SmallIcon,
  ViewDay as MediumIcon,
  ViewWeek as LargeIcon
} from '@mui/icons-material';
import { useEditMode } from '../context/EditModeContext';
import { WIDGET_SIZE_LABELS } from '../utils/widgetSizeHelper';

/**
 * WidgetCard - wrapper z edit mode overlay i resize
 */
function WidgetCard({ 
  children, 
  widgetId,
  widgetName,
  widgetSize = 'medium',
  onEdit, 
  onDelete, 
  onDuplicate,
  onResize
}) {
  const { editMode } = useEditMode();
  const [menuAnchor, setMenuAnchor] = useState(null);

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

  return (
    <Card
      sx={{
        position: 'relative',
        minHeight: '100%',
        height: '100%',
        transition: 'all 0.3s ease',
        border: editMode ? 2 : 1,
        borderColor: editMode ? 'warning.main' : 'divider',
        boxShadow: editMode ? `0 0 20px ${alpha('#ff9800', 0.3)}` : 1,
        display: 'flex',
        flexDirection: 'column',
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
            height: 50,
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
          pt: editMode ? 7 : 2,
          pb: 2,
          overflow: 'hidden',
          overflowY: 'auto',
          flex: 1,
          wordBreak: 'break-word'
        }}
      >
        {children}
      </CardContent>

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