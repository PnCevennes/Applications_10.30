<?php
    include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgBd.php';

    $critere = pg_escape_string($_REQUEST['critere']);// besoin de "pg_escape_string" pour les valeurs contenant des apostrophes
    $cnxPgBd = new CnxPgBd();
    switch ($_REQUEST['mode']) {
        case 'genre':
           $req = "SELECT DISTINCT genre AS espece FROM inpn.taxref_inventaire_flore
               WHERE genre ILIKE '" . substr($critere, 0, 1) . "%' ORDER BY espece";
            break;
        case 'espece':
           $req = "SELECT DISTINCT(nom_complet) AS espece FROM inpn.taxref_inventaire_flore
               WHERE genre ILIKE '" . $critere . "' ORDER BY espece";
            break;
    }
    $rs = $cnxPgBd->executeSql($req);
    $arr = array();
    while ($obj = pg_fetch_object($rs)) {
        $arr[] = $obj;
    }
    echo json_encode($arr);
    unset($cnxPgBd);
?>
