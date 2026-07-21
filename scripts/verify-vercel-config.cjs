const fs = require('fs');
const path = require('path');

console.log("🔍 Running automated Vercel configuration safeguards...");

// 1. Check that vercel.json exists at the project root and contains a rewrite rule for "/api/(.*)"
const vercelJsonPath = path.resolve(__dirname, '../vercel.json');
if (!fs.existsSync(vercelJsonPath)) {
  console.error("❌ FAIL: vercel.json is missing at the project root!");
  process.exit(1);
}

try {
  const vercelJson = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
  const routes = vercelJson.routes || vercelJson.rewrites || [];
  const hasApiRewrite = routes.some(r => r.src === '/api/(.*)' || r.source === '/api/(.*)');
  if (!hasApiRewrite) {
    console.error("❌ FAIL: vercel.json exists but is missing the rewrite rule for '/api/(.*)'!");
    process.exit(1);
  }
  console.log("✅ Check 1/5 passed: vercel.json exists and contains a rewrite rule for '/api/(.*)'");
} catch (err) {
  console.error("❌ FAIL: Failed to parse vercel.json as valid JSON!", err);
  process.exit(1);
}

// 2. Check that package.json's "scripts" section contains a "vercel-build" entry
const packageJsonPath = path.resolve(__dirname, '../package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error("❌ FAIL: package.json is missing at the project root!");
  process.exit(1);
}

try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (!packageJson.scripts || !packageJson.scripts['vercel-build']) {
    console.error("❌ FAIL: package.json is missing the 'vercel-build' entry under 'scripts'!");
    process.exit(1);
  }
  console.log("✅ Check 2/5 passed: package.json scripts section contains a 'vercel-build' entry");
} catch (err) {
  console.error("❌ FAIL: Failed to parse package.json as valid JSON!", err);
  process.exit(1);
}

// 3. Check that api/index.ts exists
const apiIndexPath = path.resolve(__dirname, '../api/index.ts');
if (!fs.existsSync(apiIndexPath)) {
  console.error("❌ FAIL: api/index.ts is missing from the workspace! This is required for Vercel serverless integration.");
  process.exit(1);
}
console.log("✅ Check 3/5 passed: api/index.ts exists");

// 4. Check that server.ts ends with the Vercel export (checking for the string "export default app")
const serverTsPath = path.resolve(__dirname, '../server.ts');
if (!fs.existsSync(serverTsPath)) {
  console.error("❌ FAIL: server.ts is missing from the workspace!");
  process.exit(1);
}

const serverTsContent = fs.readFileSync(serverTsPath, 'utf8');
if (!serverTsContent.includes('export default app')) {
  console.error("❌ FAIL: server.ts does not contain the Vercel export 'export default app'!");
  process.exit(1);
}
console.log("✅ Check 4/5 passed: server.ts contains Vercel export ('export default app')");

console.log("🎉 SUCCESS: All automated Vercel configuration safeguards passed perfectly!");
process.exit(0);
