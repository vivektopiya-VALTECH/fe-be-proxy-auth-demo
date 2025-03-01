# NextJS, Keycloak, Spring Cloud Gateway and API Demo

**Working demo, with zero config, just run as it is.**

## Prerequisite

- Docker
- Java 21
- Node 20+ if you want run ui

| App         | Port |
|-------------|------|
| ui          | 3000 |
| proxy       | 9090 |
| vehicle-api | 9091 |
| keycloak    | 8080 |

## Run the app

### Keycloak

No addtional config is required after keycloak is started. It uses `docker/keycloak_data/realm-export.json` to setup
realm and users.

Use realm : `valtech-gmbh`

Backend client : `valetch-app`

Frontend client : `valtech-fe`

Preconfigured users for keycloak

| User name | Password | Remarks                            |
|-----------|----------|------------------------------------|
| admin     | password | admin user for keycloak            |
| batmab    | robin    | normal user for valtech-gmbh realm |

```shell
cd docker
docker compose up -d
```

### Vehicle Api

Only has one endpoint `/api/v1/vehicle` and security config for keycloak.
It is **resource server** and run on port 9091

### Proxy

Spring cloud gateway configured to work with keycloak, checkout application for config.
It is **gateway**, **oauth2-client**, **resource server** and run on port 9090

### UI

NextJS app configured to work with keycloak
It is **client app** and run on port 3000

