<?php
    session_start();
    require_once '../../../../Outils/ClassCnxPg.php';
    require_once '../../Configuration/PostGreSQL.php';
    
    class CnxPgThematique extends CnxPg {
        function __construct() {
            parent::__construct(HOST, PORT, DBNAME, USER, PASSWORD);
        }
    }
?>
