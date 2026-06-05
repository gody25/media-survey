async function loadDashboard() {
  const session = await requireAuth();
  if (!session) return;

  $("#logoutBtn")?.addEventListener("click", logout);

  try {
    const rows = (await fetchJoinedResponses()).map(flattenResponse);
    $("#totalRespondents").textContent = rows.length;
    $("#maleRespondents").textContent = rows.filter((row) => row.jenis_kelamin === "Laki-laki").length;
    $("#femaleRespondents").textContent = rows.filter((row) => row.jenis_kelamin === "Perempuan").length;
    $("#popularPlatform").textContent = topValue(rows, "platform_utama");

    $("#recentResponses").innerHTML = rows.slice(0, 6).map((row) => `
      <tr>
        <td>${row.nama || "Anonymous"}</td>
        <td>${row.jenis_kelamin}</td>
        <td>${row.platform_utama}</td>
        <td>${row.durasi_harian}</td>
        <td><span class="badge badge-soft">${row.pengaruh_kehidupan}</span></td>
        <td>${formatDate(row.created_at)}</td>
      </tr>
    `).join("") || `<tr><td colspan="6"><div class="empty-state">Belum ada data survey.</div></td></tr>`;
  } catch (error) {
    showAlert(error.message || "Gagal memuat dashboard.", "danger");
  }
}

loadDashboard();