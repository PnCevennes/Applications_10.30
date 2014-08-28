<?php
    include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgBd.php';
    
    $cnxPgBd = new CnxPgBd();
    $req = 'SELECT enum_range(null::' . $_GET['typeEnum'] . ')';
    $rs = $cnxPgBd->executeSql($req);
    $arr = array();
    if (pg_numrows($rs) > 0) {
        // suppression des caractères spéciaux
        $enum = str_replace('{', '', pg_result($rs, 0, 0));
        $enum = str_replace('}', '', $enum);
        $enum = str_replace('"', '', $enum);
        $listEnum = explode(',', $enum);
        $obj = array();
        for ($i = 0; $i < count($listEnum); $i++) {
            $obj['val'] = $listEnum[$i];
            $arr[] = $obj;
        }
    }
    echo json_encode($arr);
    unset($cnxPgBd);
?>
