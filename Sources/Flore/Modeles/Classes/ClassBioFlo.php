<?php
    require_once '../../Configuration/PostGreSQL.php';
    require_once 'ClassCnxPgBd.php';
    require_once 'ClassBio.php';

    class BioFlo extends Bio {
        static protected $tableBio = 'saisie.biotope_flore';
        static protected $valIdPtc = 4;
        static protected $tableTax = 'saisie.taxon_flore';
    }
?>
