import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, showBack, rightElement, className }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className={cn("sticky top-0 z-40 glass border-b border-border/50 safe-top", className)}>
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        {rightElement}
      </div>
    </header>
  );
}
