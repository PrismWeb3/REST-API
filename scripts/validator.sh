#!/bin/bash

# Start from poject root dir
cd ../

 function checkCode () {
     echo $1
    if [ $1 -eq 143 ]; then
        docker-compose logs -t -f || error_code=$
        checkCode ${error_code}
    fi
 }

if [ $1 == "build" ]; then
    # Build new validator image
    docker build . -t validator -f config/Dockerfile >> config/build.log
elif [ $1 == "up" ]; then
    # Start the compose insance
    docker-compose --profile $2 -f config/docker-compose.yml up -d
    cd config
    while :
    do
        clear
        docker-compose logs -f -t
        if [ $? == 1 ]
        then
            exit
        fi
    done
elif [ $1 == "restart" ]; then
    cd config
    docker-compose restart validator
else 
    echo "You must specify the action (build, up, restart) and enviornment (dev, stage, prod)"
fi