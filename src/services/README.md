# Resume Data Loader Service

A comprehensive TypeScript service for loading, transforming, and managing resume data in the Mission Control themed website. Integrates seamlessly with the existing Zustand store architecture and provides robust error handling, caching, and loading states.

## Features

### 🔄 Data Loading & Caching
- **HTTP Fetch with Timeout**: 15-second timeout with AbortController
- **Intelligent Caching**: 1-hour cache duration with localStorage persistence
- **Deduplication**: Prevents multiple simultaneous requests to the same URL
- **ETag Support**: HTTP caching headers for optimal performance

### 🗺️ Location Intelligence
- **Coordinate Mapping**: Transforms work locations to precise lat/lng coordinates
- **Predefined Locations**: Built-in mappings for El Segundo CA, Cambridge MA, Philadelphia PA
- **Fallback Handling**: Graceful defaults for unknown locations
- **Engagement Types**: Location-based Mission Control engagement themes

### 🎯 Data Transformation
- **JSON Resume Standard**: Full support for jsonresume.org schema
- **Work Experience**: Transforms jobs into interactive map sites
- **Projects**: Converts projects into mission objectives
- **Mission Codenames**: Auto-generates Mission Control themed codenames

### 🛡️ Error Handling & Recovery
- **Typed Errors**: Comprehensive error categorization (FETCH_ERROR, PARSE_ERROR, etc.)
- **Retry Logic**: Built-in retry mechanisms with exponential backoff
- **Error Boundaries**: React error boundaries with Mission Control theming
- **Telemetry Integration**: Automatic logging to the mission control system

## Quick Start

### 1. Basic Usage

```tsx
import { useDataStore } from '../store/missionControlV2';
import { ResumeDataLoader } from '../components/LoadingStates/ResumeDataLoader';

function MyComponent() {
  const { loadResumeData, sites, resumeDataState } = useDataStore();
  
  useEffect(() => {
    loadResumeData('https://your-github-url/resume.json');
  }, []);

  return (
    <ResumeDataLoader resumeUrl="https://your-github-url/resume.json">
      <div>
        <h2>Mission Sites: {sites.length}</h2>
        {sites.map(site => (
          <div key={site.id}>{site.name} - {site.codename}</div>
        ))}
      </div>
    </ResumeDataLoader>
  );
}
```

### 2. Advanced Usage with Error Handling

```tsx
import { ResumeDataErrorBoundary } from '../components/ErrorBoundary/ResumeDataErrorBoundary';

function AdvancedComponent() {
  const { 
    resumeData, 
    resumeDataState, 
    resumeDataError,
    loadResumeData, 
    refreshResumeData 
  } = useDataStore();

  return (
    <ResumeDataErrorBoundary>
      <ResumeDataLoader 
        resumeUrl="https://your-github-url/resume.json"
        autoLoad={true}
        fallbackComponent={({ error, retry }) => (
          <div>Error: {error.message} <button onClick={retry}>Retry</button></div>
        )}
      >
        {/* Your content here */}
      </ResumeDataLoader>
    </ResumeDataErrorBoundary>
  );
}
```

## Architecture

### Service Layer (`resumeService.ts`)
```
ResumeService
├── fetchResumeData(url) → JsonResume
├── transformWorkExperience(resume) → SiteData[]
├── transformProjects(resume) → SiteData[]
├── mergeSiteData(resume, existing) → SiteData[]
└── cache management (localStorage + memory)
```

### Store Integration (`dataSlice.ts`)
```
DataSlice State
├── sites: SiteData[]                    // All mission sites
├── resumeData: JsonResume | null        // Raw resume data
├── resumeDataState: ResumeDataState     // loading | loaded | error | idle
├── resumeDataError: ResumeDataError     // Error details
├── lastResumeUpdate: Date               // Cache timestamp
└── resumeUrl: string                    // Current data source
```

### Type System (`resume.ts`)
```
JsonResume (JSON Resume Schema)
├── basics: { name, email, location, ... }
├── work: Work[]
├── projects: Project[]
├── education: Education[]
└── skills: Skill[]

SiteData (Mission Control Format)
├── id: string
├── type: 'job' | 'project' | 'hobby'
├── name: string
├── codename: string                     // Auto-generated
├── hq: { lat: number, lng: number }     // Coordinates
├── briefing: string
└── deploymentLogs: string[]
```

## Location Mappings

The service includes predefined coordinate mappings for common work locations:

| Location | Coordinates | Timezone | Engagement Type |
|----------|-------------|-----------|-----------------|
| El Segundo, CA | 33.9164, -118.4103 | America/Los_Angeles | deploy-uas |
| Cambridge, MA | 42.3601, -71.0942 | America/New_York | integration-matrix |
| Philadelphia, PA | 39.9526, -75.1652 | America/New_York | build-pipeline |
| Remote | 39.8283, -98.5795 | America/Chicago | engage |

### Adding Custom Locations

```tsx
import { addLocationMapping } from '../utils/coordinates';

addLocationMapping('seattle, wa', {
  city: 'Seattle',
  state: 'Washington',
  coordinates: { lat: 47.6062, lng: -122.3321 },
  timezone: 'America/Los_Angeles'
});
```

## Error Handling

### Error Types
- `FETCH_ERROR`: Network or HTTP errors
- `PARSE_ERROR`: JSON parsing failures
- `TRANSFORM_ERROR`: Data transformation issues
- `CACHE_ERROR`: localStorage access problems

### Error Recovery
1. **Automatic Retry**: Built into loading components
2. **Cache Fallback**: Uses cached data when network fails
3. **Graceful Degradation**: Falls back to static site data
4. **User Notification**: Mission Control themed error displays

## Performance Optimizations

### Caching Strategy
- **Memory Cache**: In-memory Map for active session
- **Persistent Cache**: localStorage for cross-session persistence
- **Cache Validation**: Time-based expiration (1 hour default)
- **Cache Busting**: Manual refresh bypasses cache

### Request Optimization
- **Request Deduplication**: Prevents multiple simultaneous requests
- **Timeout Handling**: 15-second timeout with AbortController
- **Progressive Loading**: Shows loading states immediately
- **Background Refresh**: Non-blocking cache updates

### Bundle Size
- **Tree Shaking**: Only imports used components
- **Lazy Loading**: Components load on demand
- **Type-only Imports**: TypeScript interfaces don't increase bundle size

## Integration Examples

### Map Integration
```tsx
// Resume-derived markers are rendered via Mapbox in MapboxScene.
// Each marker uses setLngLat([lng, lat]) and stays anchored during pan/zoom.
import MapboxScene from '../components/map/MapboxScene';

export default function MissionMap() {
  return <MapboxScene />;
}
```

### Terminal Integration
```tsx
// Sites become selectable missions
const { engageSite } = useCombinedActions();

const handleSiteClick = (site) => {
  engageSite(site); // Automatically logs telemetry
};
```

### Telemetry Integration
```tsx
// Automatic logging of data operations
const { addTelemetry } = useTelemetryStore();

// Logs are automatically added for:
// - Data loading success/failure
// - Cache hits/misses  
// - Site transformations
// - Error recovery attempts
```

## Testing

### Unit Tests
```bash
# Test resume service
npm test resumeService.test.ts

# Test coordinate utilities  
npm test coordinates.test.ts

# Test data slice
npm test dataSlice.test.ts
```

### Integration Tests
```bash
# Test full data loading flow
npm test resumeIntegration.test.ts

# Test error boundaries
npm test errorBoundary.test.ts
```

### Manual Testing
```bash
# Start dev server with example
npm run dev

# Navigate to /examples/resume-integration
# Test various URLs and error scenarios
```

## Data Source

This project reads resume data exclusively from the local public asset: `/resume.json`.

- Place your JSON Resume file at `public/resume.json`.
- The resume service handles caching in localStorage and parsing.
- No environment variables are required for the data source.

## Best Practices

### Data Source Preparation
1. **Host on GitHub Pages**: Reliable, fast CDN
2. **CORS Headers**: Ensure proper access-control headers
3. **JSON Validation**: Validate against jsonresume.org schema
4. **Compression**: Enable gzip/brotli compression

### Error Handling
1. **User Experience**: Always show loading states
2. **Fallback Content**: Provide static alternatives
3. **Error Reporting**: Log errors for debugging
4. **Retry Logic**: Allow users to retry failed operations

### Performance
1. **Lazy Loading**: Load components only when needed
2. **Selective Subscriptions**: Use specific store selectors
3. **Memoization**: Cache expensive computations
4. **Bundle Analysis**: Monitor bundle size impact

## Contributing

### Adding New Features
1. Follow existing TypeScript patterns
2. Add comprehensive error handling
3. Include Mission Control theming
4. Write tests for new functionality
5. Update this documentation

### Reporting Issues
1. Include browser and version information
2. Provide example resume JSON that fails
3. Include console error messages
4. Describe expected vs actual behavior

---

*Mission Control Resume Data Loader v1.0.0 - Engineered for reliability, performance, and type safety.*
