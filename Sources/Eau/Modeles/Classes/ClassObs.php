<?php
    require_once '../../../../Outils/ClassEnreg.php';
    require_once '../../Configuration/PostGreSQL.php';
    
    class Obs extends Enreg {
        static private $tableObs = 'saisie.saisie_observation';
        static private $chIdObs = 'id_obs';

        function __construct() {
            parent::__construct(HOST, PORT, DBNAME, USER, PASSWORD, self::$tableObs,
                self::$chIdObs);
        }

        static function supprimeId($listId) {
            return parent::supprimeId(HOST, PORT, DBNAME, USER, PASSWORD, self::$tableObs,
                self::$chIdObs, $listId);
        }

    }
?>
