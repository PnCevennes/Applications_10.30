<?php
    require_once '../../Configuration/PostGreSQL.php';
    require_once 'ClassTax.php';

    class TaxFlo extends Tax {
        static protected $tableTax = 'saisie.taxon_flore';
    }
?>
