<?php
    include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgBd.php';

    $cnxPgBd = new CnxPgBd();
    if ($_REQUEST['codes']) {
        $req = "SELECT mnc_code AS code, mnc_nom AS libelle FROM saisie.menace
            WHERE mnc_code NOT IN ('" . str_replace(', ', "','", $_REQUEST['codes']) .
            "') ORDER BY libelle";
    }
    else {
        $req = 'SELECT mnc_code AS code, mnc_nom AS libelle FROM
            saisie.menace ORDER BY libelle';
        }
    $rs = $cnxPgBd->executeSql($req);
    $arr = array();
    while ($obj = pg_fetch_object($rs)) {
        $arr[] = $obj;
    }
    echo json_encode($arr);
    unset($cnxPgBd);
?>