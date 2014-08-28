<?php
    session_start();
    require_once '../../Configuration/PostGreSQL.php';
    
    switch ($_POST['varSession']) {
        case 'infosNumerisateur':
            $obr_id = $_SESSION[APPLI]['numerisateur']['code'];
            $numerisat = $_SESSION[APPLI]['numerisateur']['libelle'];
            die('{success: true, numerisateur: "' . $obr_id . '", numerisat: "' .
                $numerisat . '"}');
        break;
    }
    $errorMessage = 'ERREUR : variable de session inexistante';
    $data = $_POST['varSession'];
    die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
       $data .'"}');
?>