<?php
    session_start();
    require_once '../../Configuration/PostGreSQL.php';
    require_once '../../../../Outils/Fct.php';

    // ATTENTION : un niveau d'arborescence de + ici par rapport à la constante JS
    $cheminRelatifPhoto = '../' . $_POST['CST_cheminRelatifPhoto'] . $_SESSION[APPLI]['numerisateur']['code'] . '/';
    // si le répertoirePhoto n'existe pas, on tente de le créer
    if (!is_dir($cheminRelatifPhoto)) {
        mkdir($cheminRelatifPhoto, 0777, true);
    }    
    if (!is_dir($cheminRelatifPhoto)) {
        $errorMessage = 'ERREUR : impossible de créer le répertoire de stockage des photos';
        $data = addslashes(dirname(__FILE__) . ' | ' . $cheminRelatifPhoto);
        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
           $data .'"}');
    }
    if (isset($_FILES['fichierLocalPhoto']['name']) && isset($_FILES['fichierLocalPhoto']['error']) &&
        isset($_FILES['fichierLocalPhoto']['tmp_name'])) {
        switch ($_FILES['fichierLocalPhoto']['error']){
            case UPLOAD_ERR_OK :
                date_default_timezone_set('Europe/Paris'); // fuseau horaire français
                $data = date('YmdHis') . '_' . $_FILES['fichierLocalPhoto']['name'];
                if (move_uploaded_file($_FILES['fichierLocalPhoto']['tmp_name'],
                    $cheminRelatifPhoto . $data)) {
                    die('{success: true, data: "' . $_SESSION[APPLI]['numerisateur']['code'] . '/' . $data .'"}');
                }
                else {
                    $data = 'Le fichier que vous avez envoyé est impossible à copier sur le serveur !';
                }
            case UPLOAD_ERR_INI_SIZE :
                $data = 'Le fichier dépasse la limite autorisée par le serveur (fichier php.ini) ou répertoire Photo!';
                break;
            case UPLOAD_ERR_FORM_SIZE :
                $data = 'Le fichier dépasse la limite autorisée dans le formulaire HTML !';
                break;
            case UPLOAD_ERR_PARTIAL :
                $data = "L'envoi du fichier a été interrompu pendant le transfert !";
                break;
            case UPLOAD_ERR_NO_FILE :
                $data = 'Le fichier que vous avez envoyé a une taille nulle !';
                break;
            default :
                $data = "Une erreur inconnue est survenue lors de l'envoi du fichier !";
                break;
        }
        $errorMessage = 'ERREUR : chargement de la photo impossible';
        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
            $data .'"}');
    }
    else {
        $errorMessage = 'ERREUR : variable de fichier inexistante';
        $data = 'fichierLocalPhoto | name ou fichierLocalPhoto | error ou fichierLocalPhoto | tmp_name';
        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
           $data .'"}');
    }
?>
