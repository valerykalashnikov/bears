# Bears

RESTful API in Node, Express, Mongo and Redis

## Prepare environment
Before starting application or running tests you have to prepare environment typing such command:
```docker-compose -f devops/docker-compose.yml -p bears up -d```

### How to start
```npm start```

### How to run tests
```npm test```

## Delete environment
When you want to stop all containers application depends from:
```docker-compose -f devops/docker-compose.yml -p bears down```


