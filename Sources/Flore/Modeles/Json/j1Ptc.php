<?php
    include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgBd.php';
    
    $cnxPgBd = new CnxPgBd();
    $req = 'SELECT ptc_id, ptc_nom, ptc_objectif FROM saisie.protocole WHERE ptc_id = ' .
        $_GET['ptc_id'];
    $rs = $cnxPgBd->executeSql($req);
    $arr = array();
    while ($obj = pg_fetch_object($rs)) {
        $arr[] = $obj;
    }
    echo '{"data": ' . json_encode($arr) . '}';
    unset($cnxPgBd);
?>
