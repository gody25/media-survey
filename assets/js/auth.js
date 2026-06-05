async function requireAuth() {
  if (!isConfigured()) {
    showAlert("Supabase belum dikonfigurasi.", "warning");
    return null;
  }

  const { data } = await supabaseClient.auth.getSession();
  if (!data.session) {
    window.location.href = "../login.html";
    return null;
  }
  return data.session;
}

async function redirectIfAuthenticated() {
  if (!isConfigured()) return;
  const { data } = await supabaseClient.auth.getSession();
  if (data.session) window.location.href = "admin/dashboard.html";
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "../login.html";
}

$("#loginForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!isConfigured()) {
    showAlert("Isi Supabase URL dan anon key terlebih dahulu di assets/js/config.js.", "warning");
    return;
  }

  const button = $("#loginBtn");
  setLoading(button, true, "Signing in...");

  try {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: $("#email").value,
      password: $("#password").value
    });
    if (error) throw error;
    window.location.href = "admin/dashboard.html";
  } catch (error) {
    showAlert(error.message || "Login gagal.", "danger");
  } finally {
    setLoading(button, false);
  }
});

if ($("#loginForm")) {
  redirectIfAuthenticated();
}