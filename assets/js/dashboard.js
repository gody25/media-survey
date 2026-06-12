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

    // Fungsi format tanggal saja (tanpa jam)
    function formatDateOnly(value) {
      if (!value) return "-";
      const date = new Date(value);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }

    // Tabel dengan 6 kolom (termasuk kolom Tanggal)
    $("#recentResponses").innerHTML = rows.slice(0, 6).map((row) => `
      <tr>
        <td>${row.nama || "Anonymous"}</td>
        <td>${row.jenis_kelamin}</td>
        <td>${row.platform_utama}</td>
        <td>${row.durasi_harian}</td>
        <td><span class="badge badge-soft">${row.pengaruh_kehidupan}</span></td>
        <td>${formatDateOnly(row.created_at)}</td>
      </tr>
    `).join("") || `<tr><td colspan="6"><div class="empty-state">Belum ada data survey.</div></td></td>`;
    
  } catch (error) {
    showAlert(error.message || "Gagal memuat dashboard.", "danger");
  }
}

loadDashboard();