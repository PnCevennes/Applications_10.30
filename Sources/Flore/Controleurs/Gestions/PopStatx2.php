<?php
    require_once '../../Modeles/Classes/ClassPopStat.php';
    require_once '../../Configuration/PostGreSQL.php';
    
    $pop = new PopStat();
    if (isset($_POST['bio_id'])) {
        // cas particulier de la station d'origine qui n'est pas revue
        $pop->bio_id = $_POST['bio_id'];
        $pop->pop_etiquette = '1';
        $pop->pop_nb = '0';
        $pop->pop_sta_nb_precis = 'f';
    }
    else {
        $pop->charge($_POST['pop_id']);
    }
    $pop->pop_geom = "ST_GeometryFromText('" . $_POST['pop_geom'] . "', 2154)";
    unset($pop->pop_id);
    $pop_id = $pop->ajoute($_POST['zpr_id']);
    unset($pop);
    if ($pop_id > 0) {
        $data = 'Population dupliquée avec succès';
        die('{success: true, data: "' . $data . '"}');
    }
    else {
        $errorMessage = "Opération de duplication impossible";
        $data = "Vous n'avez pas les droits suffisants de duplication";
        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
            $data .'"}');
    }
?>
