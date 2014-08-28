<?php
    include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgFaune.php';
    require_once '../../../../Outils/FiltreCarte.php';
    require_once '../../../../Outils/FiltreGrille.php';

    $cnxPgFaune = new CnxPgFaune();
    $req = 'SELECT statut_observation, gid,  id_obs,  grp_thematique,CAST(creation_date as date) as date_operation,  datedebut ,datefin,
       nom_valide, nom_vern,  nom_cite, observateurs,
       statut_validation, denombrementmin, denombrementmax, type_effectif, 
       phenologie, determination ,localisation, commentaire, code_insee, commune,
       diffusable, "precision", 
       numerisateur_nom, validateur_nom, protocole_nom, etude_nom, structure_nom,
       source,  st_asgeojson(st_transform(centroid, 4326))  as  st_asgeojson
       FROM synthese_faune.grp_thematique_obs_occ WHERE ' . $where . ' AND NOT centroid IS NULL  AND ' .
        $and . $orderLimit;
    $rs = $cnxPgFaune->executeSql($req);
    $rsTot = $cnxPgFaune->executeSql('SELECT COUNT(gid) FROM synthese_faune.grp_thematique_obs_occ
        WHERE ' . $where . ' AND ' . $and);
    $tot = pg_result($rsTot, 0, 0);
    $geoJson = '{"type": "FeatureCollection", "features": [';
    // cas particulier des géométries "NULL"
    $geomNull = '{"type": "Point", "coordinates": []}'; // obligatoire pour SelectFeature (OpenLayers) et LegendPanel (GeoExt)
    $premiereFois = true;
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
    unset($cnxPgFaune);
?>
