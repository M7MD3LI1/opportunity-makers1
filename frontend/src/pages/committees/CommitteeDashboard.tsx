import React from "react";
import { useParams } from "react-router-dom";
import HRDashboard from "./hr/HRDashboard";
import PRDashboard from "./pr/PRDashboard";
import ORDashboard from "./or/ORDashboard";
import TrainingDashboard from "./training/TrainingDashboard";
import SocialMediaDashboard from "./social/SocialMediaDashboard";

const CommitteeDashboard: React.FC = () => {
  const { committeeId } = useParams<{ committeeId: string }>();

  switch (committeeId) {
    case "hr": return <HRDashboard />;
    case "pr": return <PRDashboard />;
    case "or": return <ORDashboard />;
    case "training": return <TrainingDashboard />;
    case "social": return <SocialMediaDashboard />;
    default:
      return (
        <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Committee Not Found</h2>
            <p className="text-slate-500">The requested committee dashboard does not exist.</p>
          </div>
        </div>
      );
  }
};

export default CommitteeDashboard;
