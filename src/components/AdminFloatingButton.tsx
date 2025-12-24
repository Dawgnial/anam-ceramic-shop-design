import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { Button } from "./ui/button";

export const AdminFloatingButton = () => {
  return (
    <Link to="/admin">
      <Button
        className="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all z-50"
        style={{ backgroundColor: '#B3886D' }}
      >
        <Settings className="w-6 h-6 text-white" />
      </Button>
    </Link>
  );
};