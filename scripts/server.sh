#!/bin/bash

# Start from poject root dir
cd ../

if [ $1 == "build" ]; then
    # Build new server image
    docker build . -t server -f config/Dockerfile >> config/build.log
elif [ $1 == "up" ]; then
    # Start the compose insance
    docker-compose --profile $2 -f config/docker-compose.yml up -d
    cd config
    while :
    do
        clear
        docker-compose logs -f -t
        if [ $? -ne 0 ]
        then
            exit
        fi
    done
elif [ $1 == "restart" ]; then
    cd config
    docker-compose restart server
else 
    echo "You must specify the action (build, up, restart) and enviornment (dev, stage, prod)"
fi