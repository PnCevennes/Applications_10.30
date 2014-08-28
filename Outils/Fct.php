<?php
    // Vérification de la valeur à insérer dans la clause SQL
    function valeurControlee($typeCh, $val) {
        if ($val == '') {
            return 'NULL';
        }
        else {
            switch ($typeCh) {
                case 'saisie.enum_categorie_zp':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_categorie_zp':
                    return "'" . pg_escape_string($val) . "'";
                case 'saisie.enum_germination':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_germination':
                    return "'" . pg_escape_string($val) . "'";
                case 'saisie.enum_landuse':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_landuse':
                    return "'" . pg_escape_string($val) . "'";
                case 'saisie.enum_expo':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_expo':
                    return "'" . pg_escape_string($val) . "'";
                case 'saisie.enum_mode_mesure_debit':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_mode_mesure_debit':
                    return "'" . pg_escape_string($val) . "'";
               case 'saisie.enum_pheno':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_pheno':
                    return "'" . pg_escape_string($val) . "'";
                case 'saisie.enum_type_contact':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_type_contact':
                    return "'" . pg_escape_string($val) . "'";
                case 'saisie.enum_meteo_3j':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_meteo_3j':
                    return "'" . pg_escape_string($val) . "'";
                case 'saisie.enum_statut_validation':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_statut_validation':
                    return "'" . pg_escape_string($val) . "'";
                case 'saisie.enum_precision':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_precision':
                    return "'" . pg_escape_string($val) . "'";
                case 'varchar':
                    return "'" . pg_escape_string($val) . "'";
                case 'text':
                    return "'" . pg_escape_string($val) . "'";
                case 'date':
                    return "'" . $val . "'";
                case 'time':
                    return "'" . $val . "'";
                case 'bool':
                    return "'" . $val . "'";
                default:
                    return $val;
            }
        }
    }
?>