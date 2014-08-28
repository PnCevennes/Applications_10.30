<?php
    include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgBd.php';
    require_once '../../../../Outils/FiltreCarte.php';
    require_once '../../../../Outils/FiltreGrille.php';
    
    $cnxPgBd = new CnxPgBd();
    $calque = (isset($_GET['calque']) && $_GET['calque']);
    if ($calque) {
        $req = 'SELECT st_asgeojson(st_transform(sta_geom, 4326)) FROM saisie.v_station_maj
            UNION SELECT st_asgeojson(st_transform(bio_geom, 4326)) FROM saisie.station_origine
            WHERE bio_id NOT IN (SELECT bio_id FROM saisie.v_station_maj)';
    }
    else {
        $req = 'SELECT st_asgeojson(st_transform(sta_geom, 4326)), genre, espece, bio_id,
            bio_code, bio_fiche, vst_date, cd_nom, max_zpr_date, nom_vern FROM (SELECT
            sta_geom, bio_id, max_zpr_date FROM saisie.v_station_maj UNION SELECT
            bio_geom AS sta_geom, bio_id, vst_date AS max_zpr_date FROM saisie.station_origine
            WHERE bio_id NOT IN (SELECT bio_id FROM saisie.v_station_maj)) AS all_station_maj
            JOIN saisie.station_origine USING(bio_id) JOIN inpn.v_taxref_protocole_suivi
            USING(cd_nom) WHERE ' . $where . ' AND ' . $and . $orderLimit;
        $rsTot = $cnxPgBd->executeSql('SELECT COUNT(bio_id) FROM (SELECT
            sta_geom, bio_id, max_zpr_date FROM saisie.v_station_maj UNION SELECT
            bio_geom AS sta_geom, bio_id, vst_date AS max_zpr_date FROM saisie.station_origine
            WHERE bio_id NOT IN (SELECT bio_id FROM saisie.v_station_maj)) AS all_station_maj
            JOIN saisie.station_origine USING(bio_id) JOIN inpn.v_taxref_protocole_suivi
            USING(cd_nom) WHERE ' . $where . ' AND ' . $and);
        $tot = pg_result($rsTot, 0, 0);
    }
    $rs = $cnxPgBd->executeSql($req);
    $geoJson = '{"type": "FeatureCollection", "features": [';
    // cas particulier des géométries "NULL"
    $geomNull = null;
    $premiereFois = true;
    while ($tab = pg_fetch_assoc($rs)) {
        $geom = $tab['st_asgeojson'];
        // nécessaire pour le FeatureReader.js bidouillé avec le rajout de la ligne "this.totalRecords = values.st_asgeojson"
        // pour faire fonctionner correctement le PagingToolbar avec le PageSizer
        if (!$calque) {
            $tab['st_asgeojson'] = $tot;
        }
        if ($premiereFois) {
            if ($geom) {
                $geoJson .= '{"geometry": ' . $geom . ', "type": "Feature", "properties": ' . json_encode($tab) . '}';
            }
            else {
                $geoJson .= '{"geometry": ' . $geomNull . ', "type": "Feature", "properties": ' . json_encode($tab) . '}';
            }
            $premiereFois = false;
        }
        else {
            if ($geom) {
                $geoJson .= ', {"geometry": ' . $geom . ', "type": "Feature", "properties": ' . json_encode($tab) . '}';
            }
            else {
                $geoJson .= ', {"geometry": ' . $geomNull . ', "type": "Feature", "properties": ' . json_encode($tab) . '}';
            }
        }
    }
    echo $geoJson . ']}';
    unset($cnxPgBd);
?>
