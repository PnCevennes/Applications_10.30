<?php
    require_once '../../../../Outils/ClassEnreg.php';
    require_once '../../Configuration/PostGreSQL.php';

    class StatCompl extends Enreg {
        static protected $tableStatCompl = 'saisie.station_origine_complement';
        static protected $chIdStatCompl = 'sta_ori_compl_id';

        function __construct() {
            parent::__construct(HOST, PORT, DBNAME, USER, PASSWORD, self::$tableStatCompl,
                self::$chIdStatCompl);
        }
    }
?>
