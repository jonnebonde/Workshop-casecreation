import React from 'react';
import CaseCreationFeature from './CaseCreationFeature';

function App() {
  const handleCaseSubmitted = (caseData: any) => {
    console.log('Case submitted from feature:', caseData);
    // You can add any additional logic here for the standalone app
  };

  return (
    <CaseCreationFeature 
      onCaseSubmitted={handleCaseSubmitted}
    />
  );
}

export default App;