<?php
    include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgBd.php';
    
    $cnxPgBd = new CnxPgBd();
    // si aucun biotope sélectionné alors aucune donnée lichen à afficher
    if (!isset($_POST['tax_bio_id'])) {
        $_POST['tax_bio_id'] = 0;
    }
    $req = 'SELECT tax_id, tax_lic_surf, tax_lic_nb, tax_rq, tax_statut_validation, cd_nom, 
       tax_lic_expo, tax_lic_hauteur, tax_num_herbier, tax_url_photo, tax_bio_id, 
       tax_rq_photo, nom_complet, nom_vern FROM saisie.taxon_lichen JOIN inpn.v_taxref_protocole_lichens
       USING(cd_nom) WHERE tax_bio_id = ' . $_POST['tax_bio_id'];
    $rs = $cnxPgBd->executeSql($req);
    $arr = array();
    while ($obj = pg_fetch_object($rs)) {
        $arr[] = $obj;
    }
    echo '{"data": ' . json_encode($arr) . '}';
    unset($cnxPgBd);
?>
