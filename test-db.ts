import fetch from "node-fetch";

const url = "https://siewuccllcisezwyiyaz.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function probe() {
  console.log("Probing Supabase URL:", url);
  
  // Test 1: Check if /rest/v1/users exists
  try {
    const res = await fetch(`${url}/rest/v1/users?limit=1`, {
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`
      }
    });
    console.log("REST /users status:", res.status);
    const text = await res.text();
    console.log("REST /users response:", text.substring(0, 300));
  } catch (e: any) {
    console.log("REST /users failed:", e.message);
  }

  // Test 2: Check if /rest/v1/entries exists
  try {
    const res = await fetch(`${url}/rest/v1/entries?limit=1`, {
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`
      }
    });
    console.log("REST /entries status:", res.status);
    const text = await res.text();
    console.log("REST /entries response:", text.substring(0, 300));
  } catch (e: any) {
    console.log("REST /entries failed:", e.message);
  }

  // Test 3: Try to execute SQL via various potential endpoints
  const endpoints = [
    "/pg-meta/query",
    "/pg/query",
    "/api/sql",
    "/admin/api/sql",
    "/pg-meta/sql"
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${url}${ep}`, {
        method: "POST",
        headers: {
          "apikey": key,
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: "SELECT 1;" })
      });
      console.log(`Endpoint ${ep} status:`, res.status);
      const text = await res.text();
      console.log(`Endpoint ${ep} response:`, text.substring(0, 300));
    } catch (e: any) {
      console.log(`Endpoint ${ep} failed:`, e.message);
    }
  }
}

probe();
