<?php
    include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgBd.php';

    $cnxPgBd = new CnxPgBd();
    
    
    if ((isset($_REQUEST['codes'])) && ($_REQUEST['codes']) ) {
        $req = "SELECT cd_nom AS code, nom_complet AS libelle FROM inpn.v_cibles
            WHERE cd_nom NOT IN ('" . str_replace(', ', "','", $_REQUEST['codes']) .
            "')";// ORDER BY libelle";
    }
    else {
        $req = 'SELECT cd_nom AS code, nom_complet AS libelle FROM inpn.v_cibles';
            //ORDER BY libelle';
        }
    $rs = $cnxPgBd->executeSql($req);
    $arr = array();
    while ($obj = pg_fetch_object($rs)) {
        $arr[] = $obj;
    }
    echo json_encode($arr);
    unset($cnxPgBd);
?>

