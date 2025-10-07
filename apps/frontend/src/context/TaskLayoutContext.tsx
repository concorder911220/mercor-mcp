import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TaskLayoutContextType {
  toolbarContent: ReactNode;
  userInputContent: ReactNode;
  isModalOpen: boolean;
  modalContent: ReactNode;
  setToolbarContent: (content: ReactNode) => void;
  setUserInputContent: (content: ReactNode) => void;
  setModalContent: (content: ReactNode) => void;
  openModal: () => void;
  closeModal: () => void;
}

const TaskLayoutContext = createContext<TaskLayoutContextType | undefined>(undefined);

export function TaskLayoutProvider({ children }: { children: ReactNode }) {
  const [toolbarContent, setToolbarContent] = useState<ReactNode>(null);
  const [userInputContent, setUserInputContent] = useState<ReactNode>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode>(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <TaskLayoutContext.Provider
      value={{
        toolbarContent,
        userInputContent,
        isModalOpen,
        modalContent,
        setToolbarContent,
        setUserInputContent,
        setModalContent,
        openModal,
        closeModal,
      }}
    >
      {children}
    </TaskLayoutContext.Provider>
  );
}

export function useTaskLayout() {
  const context = useContext(TaskLayoutContext);
  if (!context) {
    throw new Error('useTaskLayout must be used within TaskLayoutProvider');
  }
  return context;
} 