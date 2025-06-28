
const fs = require('fs');
const path = require('path');

// Check RBAC test coverage threshold
const coverageFile = path.join(__dirname, '../coverage/coverage-summary.json');

if (fs.existsSync(coverageFile)) {
  const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
  const total = coverage.total;
  
  const thresholds = {
    statements: 90,
    branches: 85,
    functions: 90,
    lines: 90
  };

  let failed = false;
  
  Object.keys(thresholds).forEach(key => {
    const actual = total[key].pct;
    const required = thresholds[key];
    
    if (actual < required) {
      console.error(`❌ ${key} coverage ${actual}% is below threshold ${required}%`);
      failed = true;
    } else {
      console.log(`✅ ${key} coverage ${actual}% meets threshold ${required}%`);
    }
  });

  if (failed) {
    console.error('\n❌ Coverage check failed!');
    process.exit(1);
  } else {
    console.log('\n✅ All coverage thresholds met!');
  }
} else {
  console.error('❌ Coverage file not found');
  process.exit(1);
}
