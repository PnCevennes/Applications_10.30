<?php
    include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgBd.php';

    $cnxPgBd = new CnxPgBd();
    $req = 'SELECT sta_ori_compl_id, bio_code, bio_fiche, vst_date, cd_nom, sta_ori_landuse,
        sta_ori_rq_landuse FROM saisie.station_origine LEFT JOIN saisie.station_origine_complement
        USING(bio_id) WHERE bio_id = ' . $_GET['bio_id'];
    $rs = $cnxPgBd->executeSql($req);
    $arr = array();
    while ($obj = pg_fetch_object($rs)) {
        $arr[] = $obj;
    }
    echo '{"data": ' . json_encode($arr) . '}';
    unset($cnxPgBd);
?>