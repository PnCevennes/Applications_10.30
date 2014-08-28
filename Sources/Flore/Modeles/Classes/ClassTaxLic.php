<?php
    require_once '../../Configuration/PostGreSQL.php';
    require_once 'ClassTax.php';

    class TaxLic extends Tax {
        static protected $tableTax = 'saisie.taxon_lichen';
    }
?>
