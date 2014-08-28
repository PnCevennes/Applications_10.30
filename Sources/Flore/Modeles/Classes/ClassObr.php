<?php
    require_once '../../../../Outils/ClassEnreg.php';
    require_once '../../Configuration/PostGreSQL.php';
    
    class Obr extends Enreg {
        static private $tableObr = 'saisie.observateur';
        static private $chIdObr = 'obr_id';

        function __construct() {
            parent::__construct(HOST, PORT, DBNAME, USER, PASSWORD,
                self::$tableObr, self::$chIdObr);
        }
    }
?>
