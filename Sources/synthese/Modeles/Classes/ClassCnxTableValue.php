<?php
    require_once '../../../../Outils/ClassCnxPg.php';
    require_once '../../Configuration/PostGreSQL.php';
    
    class CnxPgTableValue extends CnxPg {
        function __construct() {
            parent::__construct(HOST, PORT, DBNAME, USER, PASSWORD);
        }
        
        function getTableValueList($table, $schema, $column,$filter, $limit=10, $val = '') {
          $sqlwhere='';
          if ($filter !== '') {
            $sqlwhere = ' WHERE '. $column. ' ilike \'' .$filter. '\'';
          }
          $req = 'SELECT DISTINCT '.$column.' as value FROM '.$schema.'.'.$table.$sqlwhere .' ORDER BY '. $column. ' LIMIT '.$limit;
          $rs = $this->executeSql($req);
          $data = array();
          while ($tab = pg_fetch_assoc($rs)) {
            $data[] =  array('val' => $tab['value']);
          }
          return $data;
        }
        
    }
?>
