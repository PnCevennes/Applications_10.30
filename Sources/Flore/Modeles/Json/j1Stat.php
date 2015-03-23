<?php
    include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgBd.php';

    $cnxPgBd = new CnxPgBd();
    $req = 'SELECT bio_id, bio_code, bio_fiche, vst_date, cd_nom, sta_ori_landuse,
        sta_ori_rq_landuse FROM saisie.station_flore WHERE bio_id = ' . $_GET['bio_id'];
    $rs = $cnxPgBd->executeSql($req);
    $arr = array();
    while ($obj = pg_fetch_object($rs)) {
        $arr[] = $obj;
    }
    echo '{"data": ' . json_encode($arr) . '}';
    unset($cnxPgBd);
?>
