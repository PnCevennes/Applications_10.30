<?php
    require_once '../../../../Outils/ClassEnreg.php';
    require_once '../../Configuration/PostGreSQL.php';

    class StatFlore extends Enreg {
        static protected $tableStatFlore = 'saisie.station_flore';
        static protected $chIdStatFlore = 'bio_id';

        function __construct() {
            parent::__construct(HOST, PORT, DBNAME, USER, PASSWORD, self::$tableStatFlore,
                self::$chIdStatFlore);
        }
    }
?>
