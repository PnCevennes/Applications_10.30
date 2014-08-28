<?php
    //Fichier servant à filtrer la grille en cours
//Fichier servant Ã  filtrer la grille en cours
    $start = ((isset($_REQUEST['start'])) &&  ($_REQUEST['start'] != null)) ? pg_escape_string($_REQUEST['start']) : 0;// besoin de "pg_escape_string" car valeur maîtrisée par l'utilisateur
    $limit = ((isset($_REQUEST['limit'])) &&  ($_REQUEST['limit'] != null)) ? pg_escape_string($_REQUEST['limit']) : 20;// besoin de "pg_escape_string" car valeur maîtrisée par l'utilisateur
    $sort = ((isset($_REQUEST['sort'])) &&  ($_REQUEST['sort'] != null))  ?  $_REQUEST['sort'] :'';
    $dir = ((isset($_REQUEST['dir'])) &&  ($_REQUEST['dir'] == 'DESC')) ? 'DESC' : '';

    $filter = ((isset($_REQUEST['filter'])) && ($_REQUEST['filter']!= null))? $_REQUEST['filter']:'';

    $groupBy = ((isset($_REQUEST['groupBy'])) && ($_REQUEST['groupBy']!= null))?  $_REQUEST['groupBy']:'';
    $filtreSel = ((isset($_REQUEST['filtreSel'])) && ($_REQUEST['filtreSel'] != null))?  $_REQUEST['filtreSel'] :'';
    
    $where = '0 = 0'; // variable globale pour la clause "WHERE"
    $orderLimit = ''; // variable globale pour les clauses "ORDER BY et LIMIT-OFFSET
    $qs ='';
    // construction de la clause "WHERE"
    if ($filtreSel != '') {
        $where .= $filtreSel;
    }
    if (is_array($filter)) {
        for ($i = 0; $i < count($filter); $i++) {
            switch ($filter[$i]['data']['type']) {
                case 'string' :
                    if (strstr($filter[$i]['data']['value'],'||')) {
                        $fi = explode('||' ,$filter[$i]['data']['value']);
                        $qs .= ' AND (UPPER( ' . $filter[$i]['field'] . " ) LIKE UPPER('%" . $fi[0] . "%')";
                        for ($q = 1; $q < count($fi); $q++) {
                            $qs .= ' OR UPPER( ' . $filter[$i]['field'] . " ) LIKE UPPER('%" . $fi[$q] . "%')";
                        }
                        $qs .= ' )';
                    }
                    else {
                        $qs .= ' AND UPPER( ' . $filter[$i]['field'] . " ) LIKE UPPER('%" . $filter[$i]['data']['value'] . "%')";
                    }
                    break;
                case 'list' :
                    if ($filter[$i]['data']['value'] == 'IS NULL') {
                        $qs .= ' AND ' . $filter[$i]['field'] . ' IS NULL';
                    }
                    else {
                        $orIsNull = false;
                        if (strstr($filter[$i]['data']['value'], ',')) {
                            $fi = explode(',', $filter[$i]['data']['value']);
                            $key = array_search('IS NULL', $fi);
                            if ($key) {
                                unset($fi[$key]);
                                $filter[$i]['data']['value'] = implode(',', $fi);
                                $orIsNull = true;
                            }
                        }
                        if (strstr($filter[$i]['data']['value'], ',')) {
                            $fi = explode(',', $filter[$i]['data']['value']);
                            for ($q = 0; $q < count($fi); $q++) {
                                    $fi[$q] = "'" . $fi[$q] . "'";
                            }
                            $filter[$i]['data']['value'] = implode(',', $fi);
                            if ($orIsNull) {
                                $qs .= ' AND (' . $filter[$i]['field'] . ' IN (' .
                                $filter[$i]['data']['value'] . ') OR ' . $filter[$i]['field'] .
                                ' IS NULL)';
                            }
                            else {
                                $qs .= ' AND ' . $filter[$i]['field'] . ' IN (' .
                                $filter[$i]['data']['value'] . ')';
                            }
                        }
                        else {
                            if ($orIsNull) {
                                $qs .= ' AND (' . $filter[$i]['field'] . " = '" .
                                $filter[$i]['data']['value'] . "' OR " . $filter[$i]['field'] .
                                ' IS NULL)';
                            }
                            else {
                                $qs .= ' AND ' . $filter[$i]['field'] . " = '" .
                                $filter[$i]['data']['value'] . "'";
                            }
                        }
                    }
                    break;
                case 'boolean' :
                    $qs .= ' AND ' . $filter[$i]['field'] . ' = ' . ($filter[$i]['data']['value']);
                    break;
                case 'numeric' :
                    switch ($filter[$i]['data']['comparison']) {
                        case 'eq' :
                            $qs .= ' AND ' . $filter[$i]['field'] . ' = ' . $filter[$i]['data']['value'];
                            break;
                        case 'lt' :
                            $qs .= ' AND ' . $filter[$i]['field'] . ' < ' . $filter[$i]['data']['value'];
                            break;
                        case 'gt' :
                            $qs .= ' AND ' . $filter[$i]['field'] . ' > ' . $filter[$i]['data']['value'];
                            break;
                    }
                    break;
                case 'date' :
                    switch ($filter[$i]['data']['comparison']) {
                        case 'eq' :
                            $qs .= ' AND ' . $filter[$i]['field'] . " = '" . date('Y-m-d',strtotime($filter[$i]['data']['value'])) . "'";
                            break;
                        case 'lt' :
                            $qs .= ' AND ' . $filter[$i]['field'] . " < '" . date('Y-m-d',strtotime($filter[$i]['data']['value'])) . "'";
                            break;
                        case 'gt' :
                            $qs .= ' AND ' . $filter[$i]['field'] . " > '" . date('Y-m-d',strtotime($filter[$i]['data']['value'])) . "'";
                            break;
                    }
                break;
            }
        }
        // traitement des cas particuliers de concaténation/déconcaténation de champs
        // aucun ici
        $where .= $qs;
    }

    // construction des clauses "ORDER BY et LIMIT-OFFSET
    if ($groupBy != '') {
        $orderLimit .= ' ORDER BY ' . $groupBy;
    }
    if ($sort != '') {
        if ($groupBy != '') {
            $orderLimit .= ', ' . $sort . ' ' . $dir;
        }
        else {
            $orderLimit .= ' ORDER BY ' . $sort . ' ' . $dir;
        }
    }
    if ($limit != 'AUCUNE') {
        $orderLimit .= ' LIMIT ' . $limit . ' OFFSET ' . $start;
    }
?>
