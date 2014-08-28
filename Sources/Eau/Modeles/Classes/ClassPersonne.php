<?php
    require_once '../../../../Outils/ClassEnreg.php';
    require_once '../../Configuration/PostGreSQL.php';
    
    class Personne extends Enreg {
        static private $tablePersonne = 'SAISIE.OBSERVATEUR';
        static private $chIdPersonne = 'obr_id';

        function __construct() {
            parent::__construct(HOST, PORT, DBNAME, USER, PASSWORD,
                self::$tablePersonne, self::$chIdPersonne);
        }
    }
?>
