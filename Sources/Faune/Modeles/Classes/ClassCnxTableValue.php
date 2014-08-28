<?php
    require_once '../../../../Outils/ClassCnxPg.php';
    require_once '../../Configuration/PostGreSQL.php';
    
    class CnxPgTableValue extends CnxPg {
        function __construct() {
            parent::__construct(HOST, PORT, DBNAME, USER, PASSWORD);
        }
        
        function getTableValueList($table, $schema, $column, $val = '',  $limit=10) {
          $req = 'SELECT DISTINCT '.$column.' as value FROM '.$schema.'.'.$table. ' ORDER BY '. $column. ' LIMIT 10';
          $rs = $this->executeSql($req);
          $data = array();
          while ($tab = pg_fetch_assoc($rs)) {
            $data[] =  array('val' => $tab['value']);
          }
          return $data;
        }
        
    }
?>
