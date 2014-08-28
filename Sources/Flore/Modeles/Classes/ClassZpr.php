<?php
    require_once '../../../../Outils/ClassEnreg.php';
    require_once '../../Configuration/PostGreSQL.php';
    require_once 'ClassCnxPgBd.php';
    require_once 'ClassPop.php';
    require_once 'ClassBioLic.php';

    class Zpr extends Enreg {
        static private $tableZpr = 'saisie.zone_prospection';
        static private $chIdZpr = 'zpr_id';

        function __construct() {
            parent::__construct(HOST, PORT, DBNAME, USER, PASSWORD, self::$tableZpr,
                self::$chIdZpr);
        }

        private function getListIdEnt1Zpr($ptc_id) {
            $req = 'SELECT ent_id FROM saisie.tl_ent_zpr_ptc WHERE ptc_id = ' . $ptc_id .
                ' AND ' . self::$chIdZpr . ' = ' . $this->zpr_id;
            $rs = $this->cnxPg->executeSql($req);
            $listId = '0';
            while ($row = pg_fetch_array($rs)) {
                $listId = $listId . ',' . $row['ent_id'];
            }
            return $listId;
        }

        function supprime() {
            $listIdPop = $this->getListIdEnt1Zpr(Pop::getValIdPtc());
            $listIdBioLic = $this->getListIdEnt1Zpr(BioLic::getValIdPtc());
            $req = 'DELETE FROM saisie.tl_ent_zpr_ptc WHERE ' . self::$chIdZpr .
                ' = ' . $this->zpr_id;
            $this->cnxPg->executeSql($req);
            Pop::supprimeId($listIdPop);
            BioLic::supprimeId($listIdBioLic);
            return parent::supprime();
        }

        static private function getListIdEntListZpr($listIdZpr, $ptc_id) {
            $cnxPgBd = new CnxPgBd();
            $req = 'SELECT ent_id FROM saisie.tl_ent_zpr_ptc WHERE ptc_id = ' . $ptc_id .
                ' AND ' . self::$chIdZpr . ' IN (' . $listIdZpr . ')';
            $rs = $cnxPgBd->executeSql($req);
            $listId = '0';
            while ($row = pg_fetch_array($rs)) {
                $listId = $listId . ',' . $row['ent_id'];
            }
            unset($cnxPgBd);
            return $listId;
        }

        static function supprimeId($listIdZpr) {
            $listIdPop = self::getListIdEntListZpr($listIdZpr, Pop::getValIdPtc());
            $listIdBioLic = self::getListIdEntListZpr($listIdZpr, BioLic::getValIdPtc());
            $cnxPgBd = new CnxPgBd();
            $req = 'DELETE FROM saisie.tl_ent_zpr_ptc WHERE ' . self::$chIdZpr .
                ' IN (' . $listIdZpr . ')';
            $cnxPgBd->executeSql($req);
            unset($cnxPgBd);
            Pop::supprimeId($listIdPop);
            BioLic::supprimeId($listIdBioLic);
            return parent::supprimeId(HOST, PORT, DBNAME, USER, PASSWORD, self::$tableZpr,
                self::$chIdZpr, $listIdZpr);
        }
    }
?>
