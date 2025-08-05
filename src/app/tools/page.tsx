import ToolsClient from './ToolsClient';
import ErrorBoundary from '../../components/ErrorBoundary';

export default function ToolsPage() {
  return (
    <ErrorBoundary>
      <ToolsClient />
    </ErrorBoundary>
  );
} 