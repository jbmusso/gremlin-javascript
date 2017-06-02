#!/bin/bash

# Add environment java vars
export JAVA_HOME=/usr/lib/jvm/java-8-oracle
export JRE_HOME=/usr/lib/jvm/java-8-oracle

# Install gremlin-server
wget -O $HOME/apache-tinkerpop-gremlin-server-$GREMLIN_SERVER_VERSION-bin.zip "https://www.apache.org/dyn/closer.cgi?action=download&filename=tinkerpop/$GREMLIN_SERVER_VERSION/apache-tinkerpop-gremlin-server-$GREMLIN_SERVER_VERSION-bin.zip"
unzip $HOME/apache-tinkerpop-gremlin-server-$GREMLIN_SERVER_VERSION-bin.zip -d $HOME/

echo "Done extracting!"

echo "Grabbing configuration file"
# get gremlin-server configuration files
cp ./build/gremlin-server/gremlin-server-js.yaml $HOME/apache-tinkerpop-gremlin-server-$GREMLIN_SERVER_VERSION/conf/

# get neo4j dependencies
# bin/gremlin-server.sh -i org.apache.tinkerpop neo4j-gremlin $GREMLIN_SERVER_VERSION

echo "Starting gremlin-server..."
# Start gremlin-server in the background and wait for it to be available
cd $HOME/apache-tinkerpop-gremlin-server-$GREMLIN_SERVER_VERSION
bin/gremlin-server.sh conf/gremlin-server-js.yaml > /dev/null 2>&1 &
cd $TRAVIS_BUILD_DIR


echo "Waiting for gremlin-server to start listening on port 8182..."
while ! nc -z localhost 8182; do
  sleep 0.1 # wait for 1/10 of the second before check again
done

echo "gremlin-server started!"
