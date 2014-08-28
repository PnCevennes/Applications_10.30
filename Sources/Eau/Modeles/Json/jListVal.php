<?php
    include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgObsEau.php';

    $cnxPgObsEau = new CnxPgObsEau();
    $req = 'SELECT ' . $_GET['chId'] . ' AS id, ' . $_GET['chVal'] . ' AS val FROM ' .
        $_GET['table'] . ' ORDER BY val';
    $rs = $cnxPgObsEau->executeSql($req);
    $arr = array();
    while ($obj = pg_fetch_object($rs)) {
        $arr[] = $obj;
    }
    echo json_encode($arr);
    unset($cnxPgObsEau);
?>
