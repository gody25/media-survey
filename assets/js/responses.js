let allResponses = [];
let filteredResponses = [];
let currentPage = 1;
let editModal;

function initializeResponseFormOptions() {
  fillSelect("platformFilter", ["All Platforms", ...OPTIONS.platforms], "All Platforms");
  $("#platformFilter").value = "All Platforms";
  fillSelect("edit_jenis_kelamin", OPTIONS.genders);
  fillSelect("edit_platform_utama", OPTIONS.platforms);
  fillSelect("edit_durasi_harian", OPTIONS.durations);
  fillSelect("edit_tujuan_utama", OPTIONS.purposes);
  fillSelect("edit_frekuensi", OPTIONS.frequencies);
  fillSelect("edit_bantu_informasi", OPTIONS.benefits);
  fillSelect("edit_ganggu_produktivitas", OPTIONS.productivity);
  fillSelect("edit_pengaruh_kehidupan", OPTIONS.impacts);
}

async function loadResponses() {
  try {
    allResponses = (await fetchJoinedResponses()).map(flattenResponse);
    applyFilters();
  } catch (error) {
    showAlert(error.message || "Gagal memuat data.", "danger");
  }
}

function applyFilters() {
  const query = ($("#searchInput").value || "").toLowerCase();
  const platform = $("#platformFilter").value;

  filteredResponses = allResponses.filter((row) => {
    const haystack = Object.values(row).join(" ").toLowerCase();
    const matchesQuery = haystack.includes(query);
    const matchesPlatform = platform === "All Platforms" || !platform || row.platform_utama === platform;
    return matchesQuery && matchesPlatform;
  });

  currentPage = Math.min(currentPage, Math.max(1, Math.ceil(filteredResponses.length / PAGE_SIZE)));
  renderTable();
  renderPagination();
}

function renderTable() {
  const start = (currentPage - 1) * PAGE_SIZE;
  const rows = filteredResponses.slice(start, start + PAGE_SIZE);
  $("#resultInfo").textContent = `${filteredResponses.length} results`;

  $("#responsesTable").innerHTML = rows.map((row) => `
<tr>
  <td>${row.nama || "Anonymous"}</td>
  <td>${row.umur}</td>
  <td>${row.jenis_kelamin}</td>
  <td>${row.pekerjaan}</td>
  <td>${row.platform_utama}</td>
  <td>${row.durasi_harian}</td>
  <td>${row.tujuan_utama}</td>
  <td>${row.frekuensi}</td>
  <td>${row.bantu_informasi}</td>
  <td>${row.ganggu_produktivitas}</td>
  <td><span class="badge badge-soft">${row.pengaruh_kehidupan}</span></td>
  <td>${row.saran || "-"}</td>
  <td>${new Date(row.created_at).toLocaleString("id-ID")}</td>
  <td class="text-end">
    <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${row.id}" title="Edit">
      <i class="bi bi-pencil"></i>
    </button>
    <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${row.id}" data-responden="${row.responden_id}" title="Delete">
      <i class="bi bi-trash"></i>
    </button>
  </td>
</tr>
`).join("") || `
<tr>
  <td colspan="14">
    <div class="empty-state">Tidak ada data sesuai filter.</div>
  </td>
</tr>
`;
}

function renderPagination() {
  const totalPages = Math.max(1, Math.ceil(filteredResponses.length / PAGE_SIZE));
  const items = [];

  items.push(`<li class="page-item ${currentPage === 1 ? "disabled" : ""}"><button class="page-link" data-page="${currentPage - 1}">Previous</button></li>`);
  for (let page = 1; page <= totalPages; page += 1) {
    items.push(`<li class="page-item ${page === currentPage ? "active" : ""}"><button class="page-link" data-page="${page}">${page}</button></li>`);
  }
  items.push(`<li class="page-item ${currentPage === totalPages ? "disabled" : ""}"><button class="page-link" data-page="${currentPage + 1}">Next</button></li>`);
  $("#pagination").innerHTML = items.join("");
}

function openEdit(id) {
  const row = allResponses.find((item) => String(item.id) === String(id));
  if (!row) return;

  Object.entries(row).forEach(([key, value]) => {
    const field = document.getElementById(`edit_${key}`);
    if (field) field.value = value || "";
  });
  editModal.show();
}

async function saveEdit(event) {
  event.preventDefault();
  const button = $("#saveEditBtn");
  setLoading(button, true, "Saving...");

  try {
    const answerId = $("#edit_id").value;
    const respondentId = $("#edit_responden_id").value;

    const respondent = {
      nama: $("#edit_nama").value.trim() || null,
      umur: Number($("#edit_umur").value),
        jenis_kelamin: $("#edit_jenis_kelamin").value,
      pekerjaan: $("#edit_pekerjaan").value.trim()
    };

    const answer = {
      platform_utama: $("#edit_platform_utama").value,
      durasi_harian: $("#edit_durasi_harian").value,
      tujuan_utama: $("#edit_tujuan_utama").value,
      frekuensi: $("#edit_frekuensi").value,
      bantu_informasi: $("#edit_bantu_informasi").value,
      ganggu_produktivitas: $("#edit_ganggu_produktivitas").value,
      pengaruh_kehidupan: $("#edit_pengaruh_kehidupan").value,
      saran: $("#edit_saran").value.trim() || null
    };

    const { error: respondentError } = await supabaseClient.from("responden").update(respondent).eq("id", respondentId);
    if (respondentError) throw respondentError;

    const { error: answerError } = await supabaseClient.from("jawaban_survei").update(answer).eq("id", answerId);
    if (answerError) throw answerError;

    editModal.hide();
    showAlert("Response berhasil diperbarui.", "success");
    await loadResponses();
  } catch (error) {
    showAlert(error.message || "Gagal memperbarui response.", "danger");
  } finally {
    setLoading(button, false);
  }
}

async function deleteResponse(answerId, respondentId) {
  if (!confirm("Delete this response? This action cannot be undone.")) return;

  try {
    const { error } = await supabaseClient.from("responden").delete().eq("id", respondentId);
    if (error) throw error;
    allResponses = allResponses.filter((row) => row.id !== answerId);
    applyFilters();
    showAlert("Response berhasil dihapus.", "success");
  } catch (error) {
    showAlert(error.message || "Gagal menghapus response.", "danger");
  }
}

function exportCsv() {
  const headers = ["nama", "umur", "jenis_kelamin", "pekerjaan", "platform_utama", "durasi_harian", "tujuan_utama", "frekuensi", "bantu_informasi", "ganggu_produktivitas", "pengaruh_kehidupan", "saran", "created_at"];
  const csv = [
    headers.join(","),
    ...filteredResponses.map((row) => headers.map((key) => `"${String(row[key] || "").replaceAll('"', '""')}"`).join(","))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `media-survey-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

async function initResponses() {
  const session = await requireAuth();
  if (!session) return;

  $("#logoutBtn")?.addEventListener("click", logout);
  initializeResponseFormOptions();
   editModal = new bootstrap.Modal(document.getElementById("editModal"));

  $("#searchInput").addEventListener("input", () => {
    currentPage = 1;
    applyFilters();
  });
  $("#platformFilter").addEventListener("change", () => {
    currentPage = 1;
    applyFilters();
  });
  $("#pagination").addEventListener("click", (event) => {
    const page = Number(event.target.dataset.page);
    if (!page) return;
    currentPage = page;
    renderTable();
    renderPagination();
  });
  $("#responsesTable").addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    if (button.dataset.action === "edit") openEdit(button.dataset.id);
    if (button.dataset.action === "delete") deleteResponse(button.dataset.id, button.dataset.responden);
  });
  $("#editForm").addEventListener("submit", saveEdit);
  $("#exportBtn").addEventListener("click", exportCsv);

  await loadResponses();
}

initResponses();