// Wait for replica set to be ready
var attempt = 0;
while (attempt < 60) {
    try {
        rs.status();
        break;
    } catch (e) {
        sleep(1000);
        attempt++;
    }
}

// Now create collections
db.createCollection('distributedlocks');
db.createCollection('jobs');