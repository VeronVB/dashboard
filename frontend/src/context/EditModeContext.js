import React, { createContext, useContext, useState } from 'react';

const EditModeContext = createContext();

/**
 * Provider dla trybu edycji widgetów
 * Kontroluje czy użytkownik może edytować/usuwać/przeciągać widgety
 */
export function EditModeProvider({ children }) {
  const [editMode, setEditMode] = useState(false);

  const enableEditMode = () => setEditMode(true);
  const disableEditMode = () => setEditMode(false);
  const toggleEditMode = () => setEditMode(prev => !prev);

  return (
    <EditModeContext.Provider 
      value={{ 
        editMode, 
        enableEditMode, 
        disableEditMode, 
        toggleEditMode 
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

export const useEditMode = () => {
  const context = useContext(EditModeContext);
  if (!context) {
    throw new Error('useEditMode must be used within EditModeProvider');
  }
  return context;
};