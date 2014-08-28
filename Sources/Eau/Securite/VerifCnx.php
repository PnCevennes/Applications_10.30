<?php
    session_start();
    require_once '../Configuration/PostGreSQL.php';
    
    if (!(isset($_SESSION[APPLI]['numerisateur']['code']) && isset($_SESSION[APPLI]['numerisateur']['libelle']))) {
        header('Location: vAuthent.php');
    }
?>
