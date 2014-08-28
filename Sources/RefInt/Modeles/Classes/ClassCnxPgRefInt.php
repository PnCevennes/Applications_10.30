<?php
    session_start();
    require_once '../../../../Outils/ClassCnxPg.php';
    require_once '../../Configuration/PostGreSQL.php';
    
    class CnxPgRefInt extends CnxPg {
        function __construct() {
            parent::__construct(HOST, PORT, DBNAME, $_SESSION[APPLI]['USER'],
                $_SESSION[APPLI]['PASSWORD']);
        }

        function cnxOK() {
            $result = true;
            $cnx = pg_connect($this->paramCnx());
            if (!$cnx) {
                $result = false;
            }
            return $result;
        }
    }
?>
