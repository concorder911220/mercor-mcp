import React, {
  createContext,
  useContext,
  ReactNode,
} from "react";

interface TaskContextType {
  // Simplified - no state management, just a placeholder for future use
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <TaskContext.Provider value={{}}>
      {children}
    </TaskContext.Provider>
  );
};

export function useTask() {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTask must be used within TaskProvider");
  return context;
}
