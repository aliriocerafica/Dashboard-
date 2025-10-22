// Simple test to verify authentication flow
export function testAuthFlow() {
  if (typeof window === "undefined") return;

  console.log("=== Authentication Flow Test ===");

  // Test 1: Check if sessionStorage is available
  console.log(
    "1. SessionStorage available:",
    typeof sessionStorage !== "undefined"
  );

  // Test 2: Check current auth state
  const isAuth = sessionStorage.getItem("authenticated") === "true";
  console.log("2. Current auth state:", isAuth);

  // Test 3: Check username
  const username = sessionStorage.getItem("username");
  console.log("3. Current username:", username);

  // Test 4: Test cache performance
  const start = performance.now();
  for (let i = 0; i < 100; i++) {
    sessionStorage.getItem("authenticated");
  }
  const end = performance.now();
  console.log("4. 100 auth checks took:", (end - start).toFixed(2), "ms");

  console.log("=== Test Complete ===");
}

// Auto-run test in development
if (process.env.NODE_ENV === "development") {
  setTimeout(testAuthFlow, 1000);
}
