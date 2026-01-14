import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white p-4">
                    <div className="bg-neutral-800 p-8 rounded-xl max-w-lg w-full border border-red-500/20 shadow-2xl">
                        <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h2>
                        <p className="text-neutral-400 mb-6">
                            The application encountered an unexpected error.
                        </p>
                        {this.state.error && (
                            <div className="bg-black/30 p-4 rounded-lg mb-6 overflow-auto max-h-48">
                                <code className="text-red-400 text-sm font-mono whitespace-pre-wrap">
                                    {this.state.error.toString()}
                                </code>
                            </div>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg transition-colors font-medium w-full"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
