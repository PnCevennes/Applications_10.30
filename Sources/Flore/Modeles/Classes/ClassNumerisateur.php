<?php
    require_once '../../../../Outils/ClassEnreg.php';
    require_once '../../Configuration/PostGreSQL.php';
    
    class Numerisateur extends Enreg {
      static private $tableObr = 'saisie.numerisateur';
      static private $chIdObr = 'obr_id';

      function __construct() {
          parent::__construct(HOST, PORT, DBNAME, USER, PASSWORD,
              self::$tableObr, self::$chIdObr);
      }
      
      function checklogin($obr_id, $password) {
            
            $req = 'SELECT obr_id FROM saisie.numerisateur WHERE obr_id = '.strval($obr_id) .' AND password=MD5(\''.pg_escape_string ($password).'\')';

            $rs = $this->cnxPg->executeSql($req);
            while ($row = pg_fetch_array($rs)) {
              return  self::charge($row['obr_id']);
            }
            return false;
        }
    }
?>
