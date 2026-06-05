function $(selector, root = document) {
  return root.querySelector(selector);
}

function $all(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function showAlert(message, type = "success") {
  let stack = $(".alert-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "alert-stack";
    document.body.appendChild(stack);
  }

  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show shadow-sm`;
  alert.role = "alert";
  alert.innerHTML = `
  <div>${message}</div>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  stack.appendChild(alert);
  setTimeout(() => bootstrap.Alert.getOrCreateInstance(alert).close(), 4500);
}

function setLoading(button, loading, label = "Processing...") {
  if (!button) return;
  if (loading) {
    button.dataset.originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>${label}`;
  } else {
    button.disabled = false;
    button.innerHTML = button.dataset.originalText || button.innerHTML;
  }
}

function fillSelect(id, options, placeholder = "Pilih salah satu") {
  const select = document.getElementById(id);
  if (!select) return;
  select.innerHTML = `<option value="">${placeholder}</option>` + options.map((item) => `<option value="${item}">${item}</option>`).join("");
}

function formatDate(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
     }).format(new Date(value));
}

function groupCount(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row[key] || "Tidak diisi";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function topValue(rows, key) {
  const grouped = groupCount(rows, key);
  return Object.entries(grouped).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
}

async function fetchJoinedResponses() {
  const { data, error } = await supabaseClient
    .from("jawaban_survei")
    .select("*, responden:responden_id(id,nama,umur,jenis_kelamin,pekerjaan,created_at)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

function flattenResponse(row) {
  return {
    id: row.id,
    responden_id: row.responden_id,
    nama: row.responden?.nama || "",
    umur: row.responden?.umur || "",
    jenis_kelamin: row.responden?.jenis_kelamin || "",
    pekerjaan: row.responden?.pekerjaan || "",
    platform_utama: row.platform_utama,
    durasi_harian: row.durasi_harian,
    tujuan_utama: row.tujuan_utama,
    frekuensi: row.frekuensi,
    bantu_informasi: row.bantu_informasi,
    ganggu_produktivitas: row.ganggu_produktivitas,
    pengaruh_kehidupan: row.pengaruh_kehidupan,
    saran: row.saran || "",
    created_at: row.created_at
  };
}