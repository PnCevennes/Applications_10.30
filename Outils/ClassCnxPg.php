<?php
    class CnxPg {
        private $host;
        private $port;
        private $dbname;
        private $user;
        private $password;
        private $login;
        
        function __construct($host, $port, $dbname, $user, $password, $login = null) {
            $this->host = $host;
            $this->port = $port;
            $this->dbname = $dbname;
            $this->user = $user;
            $this->password = $password;
            $this->login = $login;
        }

        function paramCnx() {
            return 'host=' . $this->host . ' port=' . $this->port . ' dbname=' .
                $this->dbname . ' user=' . $this->user . ' password=' . $this->password;
        }

        function executeSql($req) {
            // connexion � la base PostGreSQL
            $cnx = pg_connect($this->paramCnx());
            if (!$cnx) {
                $errorMessage = 'ATTENTION : connexion impossible !!!';
                $data = 'Paramètres incorrects : veuillez vérifier votre mot de passe !';// . $this->paramCnx();
                unset($this);
                die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                    $data .'"}');
            }
            // exécution de la requête avec passage du login de connexion à la session PostGreSQL
            if (isset($this->login)) {
                $rs = @pg_query($cnx, "SELECT outils.set_user('" . $this->login .
                    "');" . $req);
            }
            else {
                $rs = @pg_query($cnx, $req);
            }
            if ($rs) {
                return $rs;
            }
            else {
                $errorMessage = str_replace(CHR(10), ' ', pg_errormessage()); // suppression des retours à la ligne possibles
                $errorMessage = addslashes($errorMessage); // ajout des antislashs aux guillemets simples, doubles, antislash et le caractère NULL
                $data = $this->user . ' : ' . $req;
                $data = str_replace(CHR(10), ' ', $data); // suppression des retours à la ligne possibles
                die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                    $data .'"}');
            }
        }
    }
?>
