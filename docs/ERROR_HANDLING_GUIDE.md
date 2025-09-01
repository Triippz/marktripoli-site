# Enhanced Error Handling & Loading States Guide

## Overview

This guide covers the comprehensive error handling and loading state system implemented for the Mission Control application. The system provides robust error boundaries, intelligent retry mechanisms, tactical-themed loading states, and graceful degradation when external resume data is unavailable.

## Architecture

### Core Components

1. **Enhanced Error Boundaries** - Context-aware error catching with retry logic
2. **Loading States** - Mission Control themed loading displays with progress tracking  
3. **Error Handling Hooks** - Centralized error processing and telemetry
4. **Resume Data Provider** - Comprehensive data loading with fallback support

## Error Boundaries

### GlobalErrorBoundary

Top-level error boundary that catches application-wide errors:

```tsx
import { GlobalErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <GlobalErrorBoundary>
      <YourApp />
    </GlobalErrorBoundary>
  );
}
```

**Features:**
- Application-level error reporting
- Automatic cache clearing on critical errors
- Production error service integration
- Context-aware recovery options

### DataErrorBoundary

Specialized boundary for data operations:

```tsx
import { DataErrorBoundary } from './components/ErrorBoundary';

function DataComponent() {
  return (
    <DataErrorBoundary>
      <ResumeDataLoader />
    </DataErrorBoundary>
  );
}
```

**Features:**
- Resume data error handling
- Automatic cache invalidation
- Retry with data refresh
- Telemetry integration

### UIErrorBoundary

Non-critical component error handling:

```tsx
import { UIErrorBoundary } from './components/ErrorBoundary';

function Layout() {
  return (
    <UIErrorBoundary componentName="Status Panel">
      <StatusPanel />
    </UIErrorBoundary>
  );
}
```

**Features:**
- Minimal fallback displays
- Component isolation
- Graceful degradation
- Optional telemetry

### MapErrorBoundary

Specialized boundary for map rendering:

```tsx
import { MapErrorBoundary } from './components/ErrorBoundary';

function MapContainer() {
  return (
    <MapErrorBoundary>
      <MapboxGlobe />
    </MapErrorBoundary>
  );
}
```

**Features:**
- Map-specific error recovery
- Fallback map display
- System restart options
- Geographical component isolation

## Loading States

### TacticalLoadingDisplay

Mission Control themed loading with radar animation:

```tsx
import { TacticalLoadingDisplay } from './components/LoadingStates';

function LoadingExample() {
  return (
    <TacticalLoadingDisplay
      message="INITIALIZING SYSTEMS..."
      subMessage="Establishing secure connection..."
      progress={75}
      stage="fetching"
      showProgress={true}
      showDetails={true}
      size="lg"
      variant="detailed"
      onCancel={() => console.log('Cancelled')}
      timeout={30000}
      onTimeout={() => console.log('Timed out')}
    />
  );
}
```

**Props:**
- `message`: Primary loading message
- `subMessage`: Secondary descriptive text
- `progress`: Progress percentage (0-100)
- `stage`: Current operation stage
- `showProgress`: Display progress bar and percentage
- `showDetails`: Show operational details panel
- `size`: Display size ('sm' | 'md' | 'lg' | 'xl')
- `variant`: Display variant ('minimal' | 'detailed' | 'immersive')
- `onCancel`: Cancel operation callback
- `timeout`: Timeout duration in milliseconds
- `onTimeout`: Timeout callback

### ResumeDataLoadingDisplay

Specialized loading for resume data operations:

```tsx
import { ResumeDataLoadingDisplay } from './components/LoadingStates';

function ResumeLoader() {
  const { processingStatus } = useDataStore();
  
  return (
    <ResumeDataLoadingDisplay
      processingStatus={processingStatus}
      onCancel={() => console.log('Cancelled')}
      timeout={30000}
    />
  );
}
```

**Features:**
- Stage-specific messaging
- Automatic progress tracking
- Context-aware descriptions
- Mission Control theming

### ResumeDataSkeleton

Skeleton loading for resume data structure:

```tsx
import { ResumeDataSkeleton } from './components/LoadingStates';

function SkeletonLoader() {
  return (
    <ResumeDataSkeleton
      showSites={true}
      showBriefing={true}
      showSkills={true}
    />
  );
}
```

**Props:**
- `showSites`: Display site data skeleton
- `showBriefing`: Display briefing skeleton
- `showSkills`: Display skills skeleton

## Error Handling Hooks

### useErrorHandling

Comprehensive error handling with classification and retry logic:

```tsx
import { useErrorHandling } from './hooks/useErrorHandling';

function DataComponent() {
  const {
    errors,
    handleError,
    retryOperation,
    clearError,
    getErrorStats,
    hasCriticalErrors
  } = useErrorHandling({
    enableTelemetry: true,
    maxRetries: 3,
    retryDelay: 1000,
    enableNotifications: true
  });
  
  const loadData = async () => {
    try {
      await retryOperation(async () => {
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error('Failed to fetch');
        return response.json();
      });
    } catch (error) {
      await handleError(error, 'DATA_LOADING', {
        url: '/api/data',
        timestamp: new Date().toISOString()
      });
    }
  };
  
  return (
    <div>
      {hasCriticalErrors() && (
        <div>Critical errors detected!</div>
      )}
      <button onClick={loadData}>Load Data</button>
    </div>
  );
}
```

**Features:**
- Automatic error classification
- Exponential backoff retry
- Telemetry integration
- Error statistics tracking
- Severity-based handling

### useResumeErrorHandling

Specialized hook for resume data errors:

```tsx
import { useResumeErrorHandling } from './hooks/useErrorHandling';

function ResumeComponent() {
  const {
    handleResumeError,
    retryResumeOperation,
    errors
  } = useResumeErrorHandling();
  
  const loadResumeData = async (url: string) => {
    try {
      await retryResumeOperation(async () => {
        // Your resume loading logic
      }, url);
    } catch (error) {
      await handleResumeError(error, url);
    }
  };
  
  return <div>Resume Component</div>;
}
```

## Enhanced Resume Data Provider

### EnhancedResumeDataProvider

Comprehensive data loading with error handling and fallback:

```tsx
import { EnhancedResumeDataProvider } from './components/data/EnhancedResumeDataProvider';

function App() {
  return (
    <EnhancedResumeDataProvider
      resumeUrl="https://api.example.com/resume.json"
      enableAutoLoad={true}
      enableRetry={true}
      enableFallback={true}
      maxRetries={3}
      timeout={30000}
      onLoadStart={() => console.log('Loading started')}
      onLoadSuccess={() => console.log('Loading completed')}
      onLoadError={(error) => console.error('Loading failed:', error)}
      onTimeout={() => console.log('Loading timed out')}
    >
      <YourApplicationContent />
    </EnhancedResumeDataProvider>
  );
}
```

**Props:**
- `resumeUrl`: URL to resume JSON data
- `enableAutoLoad`: Automatically load on mount
- `enableRetry`: Enable retry functionality
- `enableFallback`: Show fallback content when needed
- `maxRetries`: Maximum retry attempts
- `timeout`: Operation timeout in milliseconds
- `onLoadStart`: Loading start callback
- `onLoadSuccess`: Loading success callback
- `onLoadError`: Loading error callback
- `onTimeout`: Timeout callback
- `fallbackComponent`: Custom fallback component
- `loadingComponent`: Custom loading component
- `errorComponent`: Custom error component

**Features:**
- Automatic retry with exponential backoff
- Comprehensive error classification
- Timeout handling
- Progress tracking
- Graceful fallback to static data
- Mission Control theming

## Error Classification

The system automatically classifies errors into categories:

- **NETWORK**: Connection, timeout, fetch errors
- **PARSING**: JSON parsing, syntax errors
- **VALIDATION**: Schema validation, format errors
- **RENDERING**: Component rendering errors
- **STORAGE**: LocalStorage, cache errors
- **PERMISSION**: Authorization, access errors
- **UNKNOWN**: Unclassified errors

Each category has associated severity levels:
- **LOW**: Minor issues, optional features
- **MEDIUM**: Degraded functionality
- **HIGH**: Major feature impact
- **CRITICAL**: Application breaking

## Best Practices

### 1. Error Boundary Placement

```tsx
// ✅ Good - Hierarchical boundaries
<GlobalErrorBoundary>
  <Router>
    <DataErrorBoundary>
      <DataComponents />
    </DataErrorBoundary>
    <UIErrorBoundary componentName="Navigation">
      <Navigation />
    </UIErrorBoundary>
  </Router>
</GlobalErrorBoundary>

// ❌ Avoid - Single boundary for everything
<ErrorBoundary>
  <EntireApplication />
</ErrorBoundary>
```

### 2. Loading State Management

```tsx
// ✅ Good - Contextual loading states
const isLoading = resumeDataState === 'loading' || processingStage !== 'complete';
const hasError = resumeDataState === 'error' || !!resumeDataError;

return (
  <LoadingStateManager
    isLoading={isLoading}
    hasError={hasError}
    isEmpty={!data}
    loadingComponent={TacticalLoadingDisplay}
    errorComponent={CustomErrorDisplay}
  >
    {children}
  </LoadingStateManager>
);

// ❌ Avoid - Simple boolean checks
if (loading) return <div>Loading...</div>;
if (error) return <div>Error!</div>;
```

### 3. Error Handling

```tsx
// ✅ Good - Comprehensive error handling
const { handleError, retryOperation } = useErrorHandling();

try {
  await retryOperation(async () => {
    const result = await apiCall();
    return result;
  }, 'API_CALL');
} catch (error) {
  await handleError(error, 'API_CALL', {
    url: apiUrl,
    timestamp: new Date().toISOString(),
    userAction: 'data_refresh'
  });
}

// ❌ Avoid - Basic try-catch only
try {
  await apiCall();
} catch (error) {
  console.error(error);
}
```

### 4. Telemetry Integration

```tsx
// ✅ Good - Contextual telemetry
const errorHandler = useErrorHandling({
  enableTelemetry: true,
  context: 'RESUME_DATA_LOADING'
});

// ❌ Avoid - Manual telemetry everywhere
console.log('Error occurred:', error);
```

## Configuration

### Environment Variables

```env
# Error reporting
REACT_APP_ERROR_REPORTING_ENABLED=true
REACT_APP_ERROR_SERVICE_URL=https://errors.example.com/api

# Loading timeouts
REACT_APP_DEFAULT_TIMEOUT=30000
REACT_APP_RETRY_ATTEMPTS=3
REACT_APP_RETRY_DELAY=1000

# Development settings
REACT_APP_DEBUG_ERRORS=true
REACT_APP_SHOW_ERROR_STACK=true
```

### Store Configuration

```tsx
// Configure error handling in your store
const errorHandlingConfig = {
  enableTelemetry: process.env.NODE_ENV === 'production',
  maxRetries: parseInt(process.env.REACT_APP_RETRY_ATTEMPTS) || 3,
  retryDelay: parseInt(process.env.REACT_APP_RETRY_DELAY) || 1000,
  reportToService: process.env.REACT_APP_ERROR_REPORTING_ENABLED === 'true'
};
```

## Troubleshooting

### Common Issues

1. **Infinite retry loops**
   - Ensure maxRetries is set appropriately
   - Check retry conditions
   - Verify error classification

2. **Loading states not updating**
   - Confirm state management integration
   - Check loading state conditions
   - Verify component re-renders

3. **Error boundaries not catching errors**
   - Ensure errors occur in component render
   - Check for async error handling
   - Verify boundary placement

4. **Telemetry not reporting**
   - Confirm store integration
   - Check telemetry configuration
   - Verify error severity levels

### Debug Mode

```tsx
// Enable debug mode for development
const debugConfig = {
  logToConsole: true,
  enableTelemetry: false,
  showStackTraces: true,
  verboseLogging: true
};

const errorHandling = useErrorHandling(debugConfig);
```

## Integration Examples

### Executive Briefing Page

```tsx
function ExecutiveBriefing() {
  return (
    <DataErrorBoundary>
      <EnhancedResumeDataProvider
        resumeUrl="https://api.example.com/resume.json"
        enableAutoLoad={true}
        enableRetry={true}
        maxRetries={2}
        timeout={20000}
        loadingComponent={() => (
          <TacticalLoadingDisplay 
            message="GENERATING EXECUTIVE BRIEFING..."
            size="lg"
            variant="detailed"
          />
        )}
        errorComponent={({ error, retry }) => (
          <CustomBriefingError error={error} onRetry={retry} />
        )}
      >
        <BriefingContent />
      </EnhancedResumeDataProvider>
    </DataErrorBoundary>
  );
}
```

### Mission Control Interface

```tsx
function MissionControlInterface() {
  return (
    <div>
      <MapErrorBoundary>
        <MapboxGlobe />
      </MapErrorBoundary>
      
      <UIErrorBoundary componentName="Status Panel">
        <MainStatusPanel />
      </UIErrorBoundary>
      
      <UIErrorBoundary componentName="Terminal">
        <TerminalOverlay />
      </UIErrorBoundary>
    </div>
  );
}
```

This comprehensive error handling and loading state system ensures your Mission Control application provides a robust, user-friendly experience even when external data sources are unavailable or when errors occur.