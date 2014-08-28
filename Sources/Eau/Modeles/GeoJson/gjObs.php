<?php
    include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgObsEau.php';
    require_once '../../../../Outils/FiltreCarte.php';
    require_once '../../../../Outils/FiltreGrille.php';
    require_once '../../Modeles/Filtres/fGrille.php';

    $cnxPgObsEau = new CnxPgObsEau();
    $req = "SELECT st_asgeojson(geometrie), date_obs, longitude, latitude, remarque_obs,
        heure_obs, gid, m_e_s, d_c_o, d_b_o, c_o_t, nitrate, surgent, temperature,
        ph, conductivite, (obr_nom || ' ' || obr_prenom) AS numerisat, o2_dissoud,
        noms, saturation_o2, meteo_3j, id_obs, obr_id, mode_mesure_debit, mesure_debit
        FROM SAISIE.V_SAISIE_OBSERVATION LEFT JOIN SAISIE.PTS_SUIVIS USING (gid)
        LEFT JOIN SAISIE.OBSERVATEUR USING (obr_id) WHERE " . $where . ' AND ' .
        $and . $orderLimit;
    $rs = $cnxPgObsEau->executeSql($req);
    $rsTot = $cnxPgObsEau->executeSql('SELECT COUNT(id_obs) FROM SAISIE.V_SAISIE_OBSERVATION
        LEFT JOIN SAISIE.PTS_SUIVIS USING(gid) LEFT JOIN SAISIE.OBSERVATEUR USING(obr_id)
        WHERE ' . $where . ' AND ' . $and);
    $tot = pg_result($rsTot, 0, 0);
    $geoJson = '{"type": "FeatureCollection", "features": [';
    // cas particulier des géométries "NULL"
    $geomNull = '{"type": "MultiPolygon", "coordinates": []}'; // obligatoire pour SelectFeature (OpenLayers) et LegendPanel (GeoExt)
    $premiereFois = true;
    $rs = $cnxPgObsEau->executeSql($req);
    while ($tab = pg_fetch_assoc($rs)) {
        $geom = $tab['st_asgeojson'];
        // nécessaire pour le FeatureReader.js bidouillé avec le rajout de la ligne "this.totalRecords = values.st_asgeojson"
        // pour faire fonctionner correctement le PagingToolbar avec le PageSizer
        $tab['st_asgeojson'] = $tot;
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
    unset($cnxPgObsEau);
?>
