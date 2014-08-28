<?php
    require_once '../../Modeles/Classes/ClassStatCompl.php';
    require_once '../../Configuration/PostGreSQL.php';

    $statCompl = new StatCompl();
    if ($statCompl->charge($_POST['sta_ori_compl_id'])) {
        if ($statCompl->supprime() == 0) {
            $errorMessage = 'Opération de suppression impossible';
            $data = "Vous n'avez pas les droits suffisants de suppression";
            die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                $data .'"}');
        }
    }
    foreach ($_POST as $i => $value) {
       if (isset($_POST[$i])) {
           $statCompl->$i = $_POST[$i];
       }
    }
    if ($statCompl->ajoute() > 0) {
        $data = 'Station mise à jour avec succès';
        die('{success: true, data: "' . $data . '"}');
    }
    else {
        $errorMessage = "Opération d'ajout impossible";
        $data = "Vous n'avez pas les droits suffisants d'ajout";
        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
            $data .'"}');
    }
    unset($statCompl);
?>