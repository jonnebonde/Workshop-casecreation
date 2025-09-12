# Case Creation Feature

A comprehensive React component for creating workshop glass repair cases with multi-step workflow, internationalization, and validation.

## Features

- **Multi-step workflow**: VRN lookup, claim forms, photo documentation, parts & labor, invoicing, and confirmation
- **Photo management**: Upload and categorize photos with drag & drop
- **OCR processing**: Automatic data extraction from claim forms and invoices
- **Validation**: Comprehensive validation and pre-check logic
- **Responsive design**: Mobile-friendly interface with Tailwind CSS

## Installation

### For Development (npm link)

1. In this project directory:
```bash
npm link
```

2. In your target project:
```bash
npm link vite-react-typescript-starter
```

### As a Package

```bash
npm install vite-react-typescript-starter
```

## Usage

### Basic Usage

```tsx
import React from 'react';
import { CaseCreationFeature } from 'vite-react-typescript-starter';

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

### Props

- `onCaseSubmitted?: (caseData: any) => void` - Callback when case is submitted
- `className?: string` - Additional CSS classes

### Required Setup


1. **Update Tailwind config** to include the component paths:
   ```js
   module.exports = {
     content: [
       './src/**/*.{js,ts,jsx,tsx}',
       './node_modules/vite-react-typescript-starter/dist/**/*.{js,ts,jsx,tsx}',
     ],
     // ... rest of config
   };
   ```

2. **Install peer dependencies**:
   ```bash
   npm install react react-dom lucide-react
   ```

## Development

```bash
npm install
npm run dev
```

## Building

For standalone app:
```bash
npm run build
```

For library distribution:
```bash
npm run build:lib
```

## Components

The package exports individual components that can be used separately:

- `CaseCreationFeature` - Main component
- `VRNLookupStep` - Vehicle registration lookup
- `ClaimFormStep` - Claim form processing
- `PhotoUploadStep` - Photo documentation
- `PartsLaborStep` - Parts and labor management
- `InvoiceStep` - Invoice processing
- `ConfirmationStep` - Final confirmation
- `ProgressBar` - Step progress indicator
- `StepNavigation` - Navigation controls

## Hooks and Utilities

- `useCaseData` - Case data management hook
- `preCheckLogic` - Validation and approval logic utilities

## Types

All TypeScript types are exported for use in your project.