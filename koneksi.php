<?php

$koneksi = mysqli_connect(
    "localhost",
    "root",
    "",
    "survey_media_sosial"
);

if (!$koneksi) {
    die("Koneksi gagal: " . mysqli_connect_error());
}

?>