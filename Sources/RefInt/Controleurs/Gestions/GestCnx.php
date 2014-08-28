<?php
    session_start();
    require_once '../../Modeles/Classes/ClassCnxPgRefInt.php';
    require_once '../../Configuration/PostGreSQL.php';
	
    // si la création de l'objet connexion échoue alors "die" déclenché avec "success" à false
    $_SESSION[APPLI]['USER'] = 'ref_int_infosproprio';
    $_SESSION[APPLI]['PASSWORD'] = $_POST['mot_de_passe'];
    $cnxPgRefInt = new CnxPgRefInt();
    if ($cnxPgRefInt->cnxOK()) {
        $reponse = '{success: true, data: "Connexion réussie !!!"}';
    }
    else {
        $reponse = '{success: false, errorMessage: "ATTENTION : connexion impossible !!!"'.
            ', data: "Paramètres incorrects : veuillez vérifier votre mot de passe !"}';
    }
    unset($cnxPgRefInt);
    die($reponse);
?>