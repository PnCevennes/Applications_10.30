<?php
    include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgBd.php';
    
    $cnxPgBd = new CnxPgBd();
    if (isset($_GET['chOrderBy'])) {
        $req = 'SELECT ' . $_GET['chId'] . ' AS id, ' . $_GET['chVal'] . ' AS val FROM ' .
            $_GET['table'] . ' ORDER BY ' . $_GET['chOrderBy'];
    }
    else {
        $req = 'SELECT ' . $_GET['chId'] . ' AS id, ' . $_GET['chVal'] . ' AS val FROM ' .
            $_GET['table'] . ' ORDER BY val';
    }
    $rs = $cnxPgBd->executeSql($req);
    $arr = array();
    while ($obj = pg_fetch_object($rs)) {
        $arr[] = $obj;
    }
    echo json_encode($arr);
    unset($cnxPgBd);
?>
