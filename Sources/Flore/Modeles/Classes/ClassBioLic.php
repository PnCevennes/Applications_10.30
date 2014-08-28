<?php
    require_once '../../Configuration/PostGreSQL.php';
    require_once 'ClassCnxPgBd.php';
    require_once 'ClassBio.php';
    
    class BioLic extends Bio {
        static protected $tableBio = 'saisie.biotope_lichen';
        static protected $valIdPtc = 3;
        static protected $tableTax = 'saisie.taxon_lichen';
    }
?>
