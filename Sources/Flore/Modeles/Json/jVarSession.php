<?php
    session_start();
    require_once '../../Configuration/PostGreSQL.php';
    
    switch ($_POST['varSession']) {
        case 'infosNumerisateur':
            $numerisateur_id = $_SESSION[APPLI]['numerisateur']['code'];
            $numerisat = $_SESSION[APPLI]['numerisateur']['libelle'];
            $observateur_id = $_SESSION[APPLI]['observateur']['code'];
            $observateur = $_SESSION[APPLI]['observateur']['libelle'];
            die('{success: true, numerisateur: "' . $numerisateur_id . '", numerisat: "' .
                $numerisat . '"}');
        break;
        case 'saisieEnCours':
            $data = $_SESSION['saisieEnCours'];
            die('{success: true, data: "' . $data . '"}');
        break;
    }
    $errorMessage = 'ERREUR : variable de session inexistante';
    $data = $_POST['varSession'];
    die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
       $data .'"}');
?>
