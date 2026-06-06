// ============================================
// FILE: assets/js/statistics.js
// ============================================

const palette = ["#0f766e", "#f59e0b", "#2563eb", "#db2777", "#16a34a", "#7c3aed", "#ea580c", "#0891b2", "#64748b"];

// Fungsi untuk menghitung jumlah berdasarkan group
function groupCount(data, field) {
    const counts = {};
    data.forEach(item => {
        const value = item[field];
        if (value) {
            counts[value] = (counts[value] || 0) + 1;
        }
    });
    return counts;
}

// Fungsi untuk menyiapkan data chart
function chartDataFromGroup(grouped) {
    return {
        labels: Object.keys(grouped),
        data: Object.values(grouped)
    };
}

// Fungsi untuk membuat chart
function createChart(id, type, grouped, label) {
    const canvas = document.getElementById(id);
    if (!canvas) {
        console.error(`Canvas element with id "${id}" not found`);
        return null;
    }
    
    const data = chartDataFromGroup(grouped);
    
    // Hancurkan chart lama jika ada
    if (window.charts && window.charts[id]) {
        window.charts[id].destroy();
    }
    
    const chart = new Chart(canvas, {
        type: type,
        data: {
            labels: data.labels,
            datasets: [{
                label: label,
                data: data.data,
                backgroundColor: palette.slice(0, data.labels.length),
                borderColor: "#ffffff",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: type === "bar" ? "top" : "bottom",
                    labels: {
                        font: { size: 11 },
                        boxWidth: 12
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percent = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} (${percent}%)`;
                        }
                    }
                }
            },
            scales: type === "bar" ? {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0, stepSize: 1 }
                },
                x: {
                    ticks: { 
                        autoSkip: true,
                        maxRotation: 45,
                        minRotation: 0
                    }
                }
            } : {}
        }
    });
    
    // Simpan chart untuk destruksi nanti
    if (!window.charts) window.charts = {};
    window.charts[id] = chart;
    
    return chart;
}

// Fungsi utama load statistik
async function loadStatistics() {
    console.log("Loading statistics...");
    
    // Cek autentikasi
    if (typeof requireAuth !== 'undefined') {
        const session = await requireAuth();
        if (!session) return;
    }
    
    // Setup logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn && typeof logout !== 'undefined') {
        logoutBtn.addEventListener("click", logout);
    }
    
    try {
        // Ambil data dari Supabase
        let rows = [];
        
        if (typeof fetchJoinedResponses !== 'undefined') {
            const data = await fetchJoinedResponses();
            rows = data.map(flattenResponse);
        } else if (typeof supabase !== 'undefined') {
            // Alternatif langsung ke Supabase
            const { data: responden, error } = await supabase
                .from('responden')
                .select(`
                    *,
                    jawaban_survei (*)
                `);
            if (error) throw error;
            rows = responden.map(r => {
                const j = r.jawaban_survei?.[0] || {};
                return {
                    ...r,
                    platform_utama: j.platform_utama,
                    durasi_harian: j.durasi_harian,
                    tujuan_utama: j.tujuan_utama,
                    frekuensi: j.frekuensi,
                    bantu_informasi: j.bantu_informasi,
                    ganggu_produktivitas: j.ganggu_produktivitas,
                    pengaruh_kehidupan: j.pengaruh_kehidupan,
                    saran: j.saran
                };
            });
        } else {
            throw new Error("Tidak dapat mengambil data");
        }
        
        console.log(`Data loaded: ${rows.length} responses`);
        
        if (rows.length === 0) {
            console.warn("Tidak ada data untuk ditampilkan");
            // Tampilkan pesan di canvas
            const canvases = ['platformChart', 'durationChart', 'genderChart', 'impactChart'];
            canvases.forEach(id => {
                const canvas = document.getElementById(id);
                if (canvas && canvas.parentNode) {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.fillStyle = '#999';
                        ctx.font = '14px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText('Belum ada data survei', canvas.width/2, canvas.height/2);
                    }
                }
            });
            return;
        }
        
        // Buat chart
        createChart("platformChart", "pie", groupCount(rows, "platform_utama"), "Platform Favorit");
        createChart("durationChart", "bar", groupCount(rows, "durasi_harian"), "Durasi Harian");
        createChart("genderChart", "doughnut", groupCount(rows, "jenis_kelamin"), "Jenis Kelamin");
        createChart("impactChart", "bar", groupCount(rows, "pengaruh_kehidupan"), "Dampak Kehidupan");
        
        console.log("✅ Statistics loaded successfully");
        
    } catch (error) {
        console.error("Error loading statistics:", error);
        if (typeof showAlert !== 'undefined') {
            showAlert(error.message || "Gagal memuat statistik.", "danger");
        } else {
            alert("Error: " + error.message);
        }
    }
}

// Jalankan saat DOM siap
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadStatistics);
} else {
    loadStatistics();
}