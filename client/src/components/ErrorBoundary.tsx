import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const showTechnicalDetails = import.meta.env.DEV;

      return (
        <div className="flex items-center justify-center min-h-screen p-8" style={{ background: "#0A0E14" }}>
          <div className="flex flex-col items-center w-full max-w-md p-8 text-center">
            <AlertTriangle
              size={48}
              className="mb-6 flex-shrink-0"
              style={{ color: "#F59E0B" }}
            />

            <h2 className="text-xl mb-3" style={{ color: "#E8EDF5" }}>Something went wrong.</h2>
            <p className="text-sm mb-6" style={{ color: "#8A9BB5", lineHeight: 1.6 }}>
              The demo hit a rendering error. Reloading usually restores the current session.
            </p>

            {showTechnicalDetails && (
              <div className="p-4 w-full rounded overflow-auto mb-6 text-left" style={{ background: "#111827" }}>
                <pre className="text-xs whitespace-break-spaces" style={{ color: "#8A9BB5" }}>
                  {this.state.error?.stack}
                </pre>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer"
              )}
            >
              <RotateCcw size={16} />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
