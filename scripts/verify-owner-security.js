const baseUrl = process.env.ARTWURK_VERIFY_BASE_URL || "http://localhost:3000";
const ownerAccessToken = process.env.OWNER_ACCESS_TOKEN || "";

const checks = [];

const expect = (name, passed, detail) => {
  checks.push({ name, passed, detail });
  const marker = passed ? "PASS" : "FAIL";
  console.log(`${marker} ${name}${detail ? ` - ${detail}` : ""}`);
};

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  });

  return response;
};

const getOwnerAccessToken = async () => {
  if (ownerAccessToken) {
    return ownerAccessToken;
  }

  if (!process.env.OWNER_EMAIL || !process.env.OWNER_PASSWORD) {
    return "";
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      "OWNER_EMAIL and OWNER_PASSWORD were provided, but NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are missing.",
    );
  }

  const { createClient } = require("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
  const { data, error } = await supabase.auth.signInWithPassword({
    email: process.env.OWNER_EMAIL,
    password: process.env.OWNER_PASSWORD,
  });

  if (error) {
    throw error;
  }

  return data.session?.access_token || "";
};

const isBlocked = (status) => status === 401 || status === 403 || status === 307 || status === 308;

const run = async () => {
  const publicPagePaths = ["/crm", "/crm/clients"];
  const publicApiPaths = ["/api/clients", "/api/crm", "/api/crm/traffic"];

  for (const path of publicPagePaths) {
    const response = await request(path);
    expect(`public user cannot access ${path}`, isBlocked(response.status), `HTTP ${response.status}`);
  }

  for (const path of publicApiPaths) {
    const response = await request(path);
    expect(`public user cannot access ${path}`, response.status === 401 || response.status === 403, `HTTP ${response.status}`);
  }

  const deleteResponse = await request("/api/crm", { method: "DELETE" });
  expect(
    "unauthenticated DELETE /api/crm is blocked",
    deleteResponse.status === 401 || deleteResponse.status === 403,
    `HTTP ${deleteResponse.status}`,
  );

  const token = await getOwnerAccessToken();

  if (token) {
    const sessionResponse = await request("/api/auth/owner-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken: token,
      }),
    });
    const cookie = sessionResponse.headers.get("set-cookie") || "";
    expect("owner login establishes protected CRM session", sessionResponse.status === 200 && cookie.includes("artwurk_owner_access_token"), `HTTP ${sessionResponse.status}`);

    const ownerPageResponse = await request("/crm", {
      headers: {
        Cookie: cookie,
      },
    });
    expect(
      "owner account can access /crm after login",
      ownerPageResponse.status === 200,
      `HTTP ${ownerPageResponse.status}`,
    );

    const ownerApiResponse = await request("/api/crm", {
      headers: {
        Cookie: cookie,
      },
    });
    expect("owner account can access /api/crm after login", ownerApiResponse.status === 200, `HTTP ${ownerApiResponse.status}`);
  } else {
    console.log("SKIP owner account access check - set OWNER_ACCESS_TOKEN or OWNER_EMAIL + OWNER_PASSWORD.");
  }

  const failed = checks.filter((check) => !check.passed);

  if (failed.length) {
    process.exitCode = 1;
  }
};

run().catch((issue) => {
  console.error(issue);
  process.exitCode = 1;
});
