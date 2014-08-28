<?php
    session_start();
    require_once '../../Modeles/Classes/ClassPersonne.php';
    require_once '../../Configuration/PostGreSQL.php';
	
    switch ($_POST['action']) {
        case 'Deconnecter':
            $_SESSION[APPLI] = array();
            $data = 'Vous êtes à présent déconnectés !!!';
            die('{success: true, data: "' . $data . '"}');
        break;
        case 'Authentifier':
            $id = $_POST['obr_id'];
            if ($id) {
                $personne = new Personne();
                $personne->charge($id);
                $_SESSION[APPLI]['numerisateur']['code'] = $personne->obr_id;
                $_SESSION[APPLI]['numerisateur']['libelle'] = $personne->obr_nom . ' ' . $personne->obr_prenom;
                $data = 'Bienvenue ' . $personne->obr_prenom . ' !!!';
                die('{success: true, data: "' . $data . '"}');
            }
            else {
                $errorMessage = 'Authentification échouée';
                $data = "Veuillez recommencer l'opération";
                die('{success: false, errorMessage: "' . $errorMessage . '", data: "' . $data . '"}');
            }
            break;        
    }
?>
