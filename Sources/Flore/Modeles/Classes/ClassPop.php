<?php
    require_once '../../../../Outils/ClassEnreg.php';
    require_once '../../Configuration/PostGreSQL.php';
    require_once 'ClassCnxPgBd.php';

    class Pop extends Enreg {
        static private $tablePop = 'saisie.population';
        static private $chIdPop = 'pop_id';
        static private $valIdPtc = 1;
        
        static function getValIdPtc() {
            return static::$valIdPtc;
        }

        function __construct() {
            parent::__construct(HOST, PORT, DBNAME, USER, PASSWORD, static::$tablePop,
                static::$chIdPop, 'saisie.population_pop_id_seq');
        }

        function supprime() {
            $req = 'DELETE FROM saisie.tl_ent_zpr_ptc WHERE ent_id = ' . $this->pop_id .
                ' AND ptc_id = ' . static::$valIdPtc;
            $this->cnxPg->executeSql($req);
            return parent::supprime();
        }

        static function supprimeId($listId) {
            $cnxPgBd = new CnxPgBd();
            $req = 'DELETE FROM saisie.tl_ent_zpr_ptc WHERE ent_id IN (' . $listId .
                ') AND ptc_id = ' . static::$valIdPtc;
            $cnxPgBd->executeSql($req);
            unset($cnxPgBd);
            return parent::supprimeId(HOST, PORT, DBNAME, USER, PASSWORD, static::$tablePop,
                static::$chIdPop, $listId);
        }

        function ajoute($zpr_id) {
            $pop_id = pg_result(parent::ajoute(), 0, 0);;
            $cnxPgBd = new CnxPgBd();
            $req = 'INSERT INTO saisie.tl_ent_zpr_ptc (zpr_id, ptc_id, ent_id) VALUES (' .
                $zpr_id . ', ' . static::$valIdPtc . ', ' . $pop_id . ')';
            $cnxPgBd->executeSql($req);
            unset($cnxPgBd);
            return $pop_id;
        }

    }
?>
