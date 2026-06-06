fillSelect("jenis_kelamin", OPTIONS.genders);
fillSelect("platform_utama", OPTIONS.platforms);
fillSelect("durasi_harian", OPTIONS.durations);
fillSelect("tujuan_utama", OPTIONS.purposes);
fillSelect("frekuensi", OPTIONS.frequencies);
fillSelect("bantu_informasi", OPTIONS.benefits);
fillSelect("ganggu_produktivitas", OPTIONS.productivity);
fillSelect("pengaruh_kehidupan", OPTIONS.impacts);

function resetSurveyForm() {
  const form = document.getElementById("surveyForm");
  if (form) form.reset();
  fillSelect("jenis_kelamin", OPTIONS.genders);
  fillSelect("platform_utama", OPTIONS.platforms);
  fillSelect("durasi_harian", OPTIONS.durations);
  fillSelect("tujuan_utama", OPTIONS.purposes);
  fillSelect("frekuensi", OPTIONS.frequencies);
  fillSelect("bantu_informasi", OPTIONS.benefits);
  fillSelect("ganggu_produktivitas", OPTIONS.productivity);
  fillSelect("pengaruh_kehidupan", OPTIONS.impacts);
}

$("#surveyForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formElement = event.currentTarget;

  if (!isConfigured()) {
    showAlert("Supabase belum dikonfigurasi. Isi SUPABASE_URL dan SUPABASE_ANON_KEY di assets/js/config.js.", "warning");
    return;
  }

  const button = $("#submitBtn");
  setLoading(button, true, "Submitting...");

  try {
    const form = new FormData(formElement);
    const respondent = {
      nama: form.get("nama")?.trim() || null,
      umur: Number(form.get("umur")),
      jenis_kelamin: form.get("jenis_kelamin"),
      pekerjaan: form.get("pekerjaan")?.trim()
    };

    const { data: insertedRespondent, error: respondentError } = await supabaseClient
      .from("responden")
      .insert(respondent)
      .select()
      .single();

    if (respondentError) throw respondentError;

    const answer = {
      responden_id: insertedRespondent.id,
      platform_utama: form.get("platform_utama"),
      durasi_harian: form.get("durasi_harian"),
      tujuan_utama: form.get("tujuan_utama"),
      frekuensi: form.get("frekuensi"),
      bantu_informasi: form.get("bantu_informasi"),
      ganggu_produktivitas: form.get("ganggu_produktivitas"),
      pengaruh_kehidupan: form.get("pengaruh_kehidupan"),
      saran: form.get("saran")?.trim() || null
    };

    const { error: answerError } = await supabaseClient.from("jawaban_survei").insert(answer);
    if (answerError) throw answerError;

    resetSurveyForm();
    showAlert("Terima kasih. Jawaban survey berhasil disimpan.", "success");
  } catch (error) {
    showAlert(error.message || "Gagal menyimpan survey.", "danger");
  } finally {
    setLoading(button, false);
  }
});