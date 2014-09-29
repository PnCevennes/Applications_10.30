<?php
    include_once '../../../../Librairies/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgBd.php';
    require_once '../../../../Outils/FiltreGrille.php';
    
    $cnxPgBd = new CnxPgBd();
    // si aucun biotope sélectionné alors aucune donnée Flore à afficher
    if (!isset($_POST['tax_bio_id'])) {
        $_POST['tax_bio_id'] = 0;
    }
    $req = 'SELECT tax_flo_vegetatif, tax_flo_bourgeon, tax_flo_floraison, tax_flo_fructification,
        tax_flo_dissemination, tax_flo_germination, tax_flo_nb_precis, tax_flo_nb,
        tax_flo_pheno, tax_id, tax_rq, tax_statut_validation, cd_nom, tax_num_herbier,
        tax_url_photo, tax_bio_id, tax_rq_photo, nom_complet, nom_vern FROM saisie.taxon_flore
        JOIN inpn.taxref_inventaire_flore USING(cd_nom) WHERE tax_bio_id = ' . $_POST['tax_bio_id'] ;
        
    $rs = $cnxPgBd->executeSql($req. ' '.$orderLimit);
    
    $rsTot = $cnxPgBd->executeSql('SELECT COUNT(*) as nbTotal FROM ('.$req.') as c');
    $tot = pg_result($rsTot, 0, 0);
    
    $arr = array();
    while ($obj = pg_fetch_object($rs)) {
        $arr[] = $obj;
    }
    echo '{"total":'.$tot.', "data": ' . json_encode($arr) . '}';
    unset($cnxPgBd);

?>
