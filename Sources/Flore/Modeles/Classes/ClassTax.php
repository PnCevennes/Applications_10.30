<?php
    require_once '../../../../Outils/ClassEnreg.php';
    require_once '../../Configuration/PostGreSQL.php';

    abstract class Tax extends Enreg {
        static protected $chIdTax = 'tax_id';

        function __construct() {
            parent::__construct(HOST, PORT, DBNAME, USER, PASSWORD, static::$tableTax,
                self::$chIdTax, 'saisie.taxon_tax_id_seq');
        }

        static function supprimeId($listId) {
            return parent::supprimeId(HOST, PORT, DBNAME, USER, PASSWORD, static::$tableTax,
                self::$chIdTax, $listId);
        }

    }
?>
