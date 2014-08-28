<?php
    require_once '../../../../Outils/ClassCnxPg.php';
    require_once '../../Configuration/PostGreSQL.php';
    
    class CnxPgFaune extends CnxPg {
        function __construct() {
            parent::__construct(HOST, PORT, DBNAME, USER, PASSWORD);
        }
    }
?>
