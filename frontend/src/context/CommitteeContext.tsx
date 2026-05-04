import React, { createContext, useContext, useState, ReactNode } from "react";
import { CommitteeConfig, getCommitteeByDepartmentName, CommitteeId } from "../config/committeeConfig";

interface CommitteeContextType {
  committee: CommitteeConfig | undefined;
  committeeId: CommitteeId | undefined;
  setCommitteeId: (id: CommitteeId) => void;
}

const CommitteeContext = createContext<CommitteeContextType | undefined>(undefined);

export const CommitteeProvider: React.FC<{ children: ReactNode; departmentName?: string }> = ({
  children, departmentName
}) => {
  const autoDetected = departmentName ? getCommitteeByDepartmentName(departmentName) : undefined;
  const [committeeId, setCommitteeId] = useState<CommitteeId | undefined>(autoDetected?.id);
  const committee = autoDetected;

  return (
    <CommitteeContext.Provider value={{ committee, committeeId, setCommitteeId }}>
      {children}
    </CommitteeContext.Provider>
  );
};

export const useCommittee = (): CommitteeContextType => {
  const context = useContext(CommitteeContext);
  if (!context) throw new Error("useCommittee must be used within a CommitteeProvider");
  return context;
};
