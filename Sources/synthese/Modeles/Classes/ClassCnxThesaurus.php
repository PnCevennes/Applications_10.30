<?php
    require_once '../../../../Outils/ClassCnxPg.php';
    require_once '../../Configuration/PostGreSQL.php';
    
    class CnxPgThesaurus extends CnxPg {
        function __construct() {
            parent::__construct(HOST, PORT, DBNAME, USER, PASSWORD);
        }
        
        function getVocabulary($vocId, $withVoc=false) {
          
          $where = ' id_type  =' . $vocId ;
          if (!$withVoc) $where .= ' AND NOT fk_parent = 0 ';
          $req = 'SELECT code, libelle FROM synthese_faune.tthesaurus WHERE ' . $where . ' ORDER BY hierarchie';
          $rs = $this->executeSql($req);
          $data = array();
          while ($tab = pg_fetch_assoc($rs)) {
            $data[$tab['code']] =  $tab['libelle'];
          }
          return $data;
        }
        
    }
?>
