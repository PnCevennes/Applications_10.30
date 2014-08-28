<?php
    require_once '../../../../Outils/ClassCnxPg.php';
    require_once '../../Configuration/PostGreSQL.php';
    
    class CnxPgDbPNC extends CnxPg {
        function __construct() {
            parent::__construct(HOST, PORT, DBNAME, USER, PASSWORD);
        }
    }
?>
