// src/lib/auth.js

export function getSession() {
  try {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const role = localStorage.getItem("role");

    if (!token) return null;

    const parsedUser = user ? JSON.parse(user) : {};

    return {
      token,
      role: role || parsedUser.role || "customer",
      name: parsedUser.name || parsedUser.email?.split("@")[0] || "User",
      email: parsedUser.email || "",
      id: parsedUser.id || parsedUser._id || "USR-001",
    };
  } catch (error) {
    console.error("Error reading auth session:", error);
    return null;
  }
}

export function saveSession(token, user, role = "customer") {
  localStorage.setItem("authToken", token);
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("role", role);
  localStorage.setItem("isAuthenticated", "true");
}

export function clearSession() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  localStorage.removeItem("isAuthenticated");
}

// Added export to fix the missing export error
export function demoLogin(role = "admin") {
  const mockToken = "demo-token-" + Date.now();
  const mockUser = {
    id: role === "admin" ? "ADM-001" : "CUST-001",
    name: role === "admin" ? "Demo Admin" : "Demo Customer",
    email: `${role}@bank.co.in`,
    role: role,
  };

  saveSession(mockToken, mockUser, role);
  return { token: mockToken, user: mockUser };
}