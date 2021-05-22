# Guide de démarrage

Ce guide vous permettra de setup le site web factilement en plusieurs étapes.

<div style="width: 80%;">
  <img style="width: 100%;" src="github/images/mock_preview.png">
</div>

## Conventions

Nous utilisons pour ce projet NuxtJS en front et NestJS en back.
Typescript est utilisé des deux côtés.
La base de données est en PostgreSQL.

## Organisation des dossiers

Le dossier front correspond au projet NuxtJS. <br />
Le dossier back correspond au projet NestJS. <br />
Le dossier tmp (non présent pas défaut) est le dossier où les données postgre sont sauvegardées.

## Maquette

Les maquettes sont sur Figma, demander à `llaurent` pour avoir les accès.
 
## Les branches

Les branches `llaurent`, `timelecou`, `mbrignol` correspondent au branches des différentes personnes qui travaillent sur le projet.
La branche `master` est la branche à jour.

## Installer le projet

* Récupérer le projet en local

    `` git clone https://github.com/brokenfiles/ft_transcendence_ts ``

* Remplir les valeurs de `FORTYTWO_OAUTH_UID`, `FORTYTWO_OAUTH_SECRET`, `JWT_SECRET` dans le fichier docker-compose.distrib.yml <br/>
  `FORTYTWO_OAUTH_UID`: L'identifiant de votre application 42 </br>
  `FORTYTWO_OAUTH_SECRET`: L'identifiant secret de votre application 42 </br>
  `JWT_SECRET`: Un mot de passe fort (vous pouvez en générer un avec cette commande : ```node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"```) </br>
  
* Renommer le fichier `docker-compose.distrib.yml` en `docker-compose.yml`

* Build et up les containers

    `` docker-compose up --build`` (ajoutez un -d pour se détacher des containers)

## Documentation

NestJS (backend) : `https://docs.nestjs.com/` <br/>
ORM utilisé pour le projet : `https://typeorm.io/#/` <br/>
NuxtJS (frontend) : `https://fr.nuxtjs.org/docs/2.x/get-started/installation` <br/>
Socket.io client : `https://www.npmjs.com/package/vue-socket.io` <br/>

## Problèmes rencontrés

* Sur windows, si le dossier "nodes_modules" ne se crée pas, il faut installer les dépendances à la main via la commande `yarn install` dans le dossier `front`
 et `back`. Si le problème persiste, vérifiez que le partage de données via les volumes fonctionnent.
  
