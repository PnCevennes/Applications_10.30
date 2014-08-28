<?php
    require_once '../../../../Outils/ClassEnreg.php';
    require_once '../../Configuration/PostGreSQL.php';
    require_once 'ClassTaxFlo.php';
    require_once 'ClassTaxLic.php';

    abstract class Bio extends Enreg {
        static protected $chIdBio = 'bio_id';

        function __construct() {
            parent::__construct(HOST, PORT, DBNAME, USER, PASSWORD, static::$tableBio,
                self::$chIdBio, 'saisie.biotope_bio_id_seq');
        }

        static function getValIdPtc() {
            return static::$valIdPtc;
        }

        private function getListIdTax() {
            $req = 'SELECT tax_id FROM ' . static::$tableTax . ' WHERE tax_bio_id = ' .
                $this->bio_id;
            $rs = $this->cnxPg->executeSql($req);
            $listIdTax = '0';
            while ($row = pg_fetch_array($rs)) {
                $listIdTax = $listIdTax . ',' . $row['tax_id'];
            }
            return $listIdTax;
        }

        function supprime() {
            $listIdTax = $this->getListIdTax();
            $req = 'DELETE FROM saisie.tl_ent_zpr_ptc WHERE ent_id = ' . $this->bio_id .
                ' AND ptc_id = ' . static::$valIdPtc;
            $this->cnxPg->executeSql($req);
            switch (static::$valIdPtc) {
                case 3:
                    TaxLic::supprimeId($listIdTax);
                    break;
                case 4:
                    TaxFlo::supprimeId($listIdTax);
                    break;
            }            
            return parent::supprime();
        }

        static private function getListIdTaxListBioTax($listIdBioTax) {
            $cnxPgBd = new CnxPgBd();
            $req = 'SELECT tax_id FROM ' . static::$tableTax . ' WHERE tax_bio_id IN (' . 
                $listIdBioTax . ')';
            $rs = $cnxPgBd->executeSql($req);
            $listIdTax = '0';
            while ($row = pg_fetch_array($rs)) {
                $listIdTax = $listIdTax . ',' . $row['tax_id'];
            }
            unset($cnxPgBd);
            return $listIdTax;
        }

        static function supprimeId($listIdBioTax) {
            $listIdTax = self::getListIdTaxListBioTax($listIdBioTax);
            $cnxPgBd = new CnxPgBd();
            $req = 'DELETE FROM saisie.tl_ent_zpr_ptc WHERE ent_id IN (' . $listIdBioTax .
                ') AND ptc_id = ' . static::$valIdPtc;
            $cnxPgBd->executeSql($req);
            unset($cnxPgBd);
            switch (static::$valIdPtc) {
                case 3:
                    TaxLic::supprimeId($listIdTax);
                    break;
                case 4:
                    TaxFlo::supprimeId($listIdTax);
                    break;
            }
            return parent::supprimeId(HOST, PORT, DBNAME, USER, PASSWORD, static::$tableBio,
                self::$chIdBio, $listIdBioTax);
        }

        function ajoute($zpr_id) {
            $bio_id = pg_result(parent::ajoute(), 0, 0);;
            $cnxPgBd = new CnxPgBd();
            $req = 'INSERT INTO saisie.tl_ent_zpr_ptc (zpr_id, ptc_id, ent_id) VALUES (' .
                $zpr_id . ', ' . static::$valIdPtc . ', ' . $bio_id . ')';
            $cnxPgBd->executeSql($req);
            unset($cnxPgBd);
            return $bio_id;
        }
    }
?>
