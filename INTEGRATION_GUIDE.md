# Case Creation Feature Integration Guide

## Option 1: Copy Files Directly (Recommended)

The simplest approach is to copy the source files directly into your other project:

### Step 1: Copy Source Files
Copy these directories from this project to your target project:
```
src/components/
src/hooks/
src/types/
src/utils/
src/CaseCreationFeature.tsx
```

### Step 2: Install Dependencies
In your target project, install the required dependencies:
```bash
npm install lucide-react
```

### Step 3: Use the Component
```tsx
import { CaseCreationFeature } from './path/to/CaseCreationFeature';

function MyApp() {
  const handleCaseSubmitted = (caseData) => {
    console.log('Case submitted:', caseData);
    // Handle the submitted case data
  };

  return (
    <CaseCreationFeature 
      onCaseSubmitted={handleCaseSubmitted}
    />
  );
}
```

## Option 2: Build as Library and Copy

### Step 1: Build the Library
```bash
npm run build:lib
```

### Step 2: Copy Built Files
Copy the `dist/` folder contents to your target project and import from there.

## Option 3: Git Submodule (Advanced)

If you want to keep the projects synchronized:

### Step 1: Add as Submodule
In your target project:
```bash
git submodule add <this-project-git-url> src/features/case-creation
```

### Step 2: Import from Submodule
```tsx
import { CaseCreationFeature } from './features/case-creation/src/CaseCreationFeature';
```

## Required Dependencies for Target Project

Add these to your target project's `package.json`:
```json
{
  "dependencies": {
    "lucide-react": "^0.344.0"
  }
}
```

## Tailwind CSS Configuration

Ensure your target project's `tailwind.config.js` includes the case creation component paths:
```js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    // Add path to case creation components
    './src/components/case-creation/**/*.{js,ts,jsx,tsx}',
  ],
  // ... rest of config
};
```

## Usage Examples

### Basic Usage
```tsx
import { CaseCreationFeature } from './components/case-creation/CaseCreationFeature';

function CaseCreationPage() {
  return (
    <div className="min-h-screen">
      <CaseCreationFeature 
        onCaseSubmitted={(data) => {
          // Send to your backend
          console.log('Case data:', data);
        }}
      />
    </div>
  );
}
```

### With Custom Styling
```tsx
<CaseCreationFeature 
  className="custom-case-creation"
  onCaseSubmitted={handleSubmit}
/>
```

### Individual Components
You can also use individual components:
```tsx
import { VRNLookupStep, PhotoUploadStep } from './components/case-creation';

// Use individual steps in your own workflow
```

## Recommendation

**Option 1 (Copy Files Directly)** is recommended because:
- No permission issues
- Full control over the code
- Easy to customize for your specific needs
- No complex build processes
- Works reliably in all environments