const palette = ["#0f766e", "#f59e0b", "#2563eb", "#db2777", "#16a34a", "#7c3aed", "#ea580c", "#0891b2", "#64748b"];

function chartDataFromGroup(grouped) {
  return {
    labels: Object.keys(grouped),
    data: Object.values(grouped)
  };
}

function createChart(id, type, grouped, label) {
  const data = chartDataFromGroup(grouped);
  return new Chart(document.getElementById(id), {
    type,
    data: {
      labels: data.labels,
      datasets: [{
        label,
        data: data.data,
        backgroundColor: palette,
        borderColor: "#ffffff",
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: type === "bar" ? "top" : "bottom"
        }
      },
      scales: type === "bar" ? {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      } : {}
    }
  });
}

async function loadStatistics() {
  const session = await requireAuth();
  if (!session) return;
  $("#logoutBtn")?.addEventListener("click", logout);

  try {
    const rows = (await fetchJoinedResponses()).map(flattenResponse);
    createChart("platformChart", "pie", groupCount(rows, "platform_utama"), "Favorite platform");
    createChart("durationChart", "bar", groupCount(rows, "durasi_harian"), "Daily duration");
    createChart("genderChart", "doughnut", groupCount(rows, "jenis_kelamin"), "Gender");
    createChart("impactChart", "bar", groupCount(rows, "pengaruh_kehidupan"), "Life impact");
  } catch (error) {
    showAlert(error.message || "Gagal memuat statistik.", "danger");
  }
}

loadStatistics();