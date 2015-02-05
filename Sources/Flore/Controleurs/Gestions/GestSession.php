<?php
    session_start();
    require_once '../../Modeles/Classes/ClassNumerisateur.php';
    require_once '../../Configuration/PostGreSQL.php';
    
    switch ($_POST['action']) {
        case 'Deconnecter':
            $_SESSION[APPLI] = array();
            $data = 'Vous êtes à présent déconnectés !!!';
            die('{success: true, data: "' . $data . '"}');
        break;
        case 'Authentifier':
            $num_id = $_POST['numerisateur_id'];
            $mot_de_passe = $_POST['mot_de_passe'];
            $num = new Numerisateur();
            $id_obr = $num->checklogin($num_id, $mot_de_passe) ;
            if ($id_obr) {
                $_SESSION[APPLI]['numerisateur']['code'] = $num->obr_id;
                $_SESSION[APPLI]['observateur']['code'] = $_SESSION[APPLI]['numerisateur']['code'];
                $_SESSION[APPLI]['numerisateur']['libelle'] = $num->obr_nom . ' ' . $num->obr_prenom;
                $_SESSION[APPLI]['numerisateur']['droit'] = $num->id_droit;
                $_SESSION[APPLI]['observateur']['libelle'] = $_SESSION[APPLI]['numerisateur']['libelle'];
                $data = 'Bienvenue ' . $num->obr_prenom . ' !!!';
                die('{success: true, data: "' . $data . '"}');
            }
            else {
                $errorMessage = 'Authentification échouée';
                $data = "Mot de passe erroné, Veuillez recommencer l'opération";
                die('{success: false, errorMessage: "' . $errorMessage . '", data: "' . $data . '"}');
            }
            break;
        case 'AttendreSaisie':
                $_SESSION['saisieEnCours'] = $_POST['saisieEnCours'];
            break;
    }
?>
