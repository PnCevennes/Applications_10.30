<?php
    require_once '../../Configuration/PostGreSQL.php';
    require_once 'ClassCnxPgBd.php';
    require_once 'ClassPop.php';
    
    class PopStat extends Pop {
        static protected $tablePop = 'saisie.population_station';
        static protected $chIdPop = 'pop_id';
        static protected $valIdPtc = 2;
    }
?>
