<?php
    session_start();
    require_once '../../Modeles/Classes/ClassObr.php';
    require_once '../../Configuration/PostGreSQL.php';
    
    switch ($_POST['action']) {
        case 'Deconnecter':
            $_SESSION[APPLI] = array();
            $data = 'Vous êtes à présent déconnectés !!!';
            die('{success: true, data: "' . $data . '"}');
        break;
        case 'Authentifier':
            $id = $_POST['numerisateur_id'];
            if ($id) {
                $obr = new Obr();
                $obr->charge($id);
                $_SESSION[APPLI]['numerisateur']['code'] = $obr->obr_id;
                $_SESSION[APPLI]['observateur']['code'] = $_SESSION[APPLI]['numerisateur']['code'];
                $_SESSION[APPLI]['numerisateur']['libelle'] = $obr->obr_nom . ' ' . $obr->obr_prenom;
                $_SESSION[APPLI]['observateur']['libelle'] = $_SESSION[APPLI]['numerisateur']['libelle'];
                $data = 'Bienvenue ' . $obr->obr_prenom . ' !!!';
                die('{success: true, data: "' . $data . '"}');
            }
            else {
                $errorMessage = 'Authentification échouée';
                $data = "Veuillez recommencer l'opération";
                die('{success: false, errorMessage: "' . $errorMessage . '", data: "' . $data . '"}');
            }
            break;
        case 'AttendreSaisie':
                $_SESSION['saisieEnCours'] = $_POST['saisieEnCours'];
            break;
    }
?>
