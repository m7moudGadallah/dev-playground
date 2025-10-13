// Wait for MongoDB to be ready
sleep = function(millis) {
    var date = new Date();
    var curDate = null;
    do { curDate = new Date(); }
    while(curDate-date < millis);
}

// Retry initialization until success
var attempt = 0;
while (attempt < 10) {
    try {
        rs.initiate({
            _id: "rs0",
            members: [
                { _id: 0, host: "mongo1:27017" },
                { _id: 1, host: "mongo2:27017" },
                { _id: 2, host: "mongo3:27017" }
            ]
        });
        break;
    } catch (e) {
        print("Initialization attempt failed, retrying...");
        sleep(5000);
        attempt++;
    }
}

// Wait for replica set to be ready
attempt = 0;
while (attempt < 10) {
    try {
        if (rs.status().ok) {
            break;
        }
    } catch (e) {
        print("Waiting for replica set to be ready...");
        sleep(5000);
        attempt++;
    }
}

// Create collections after replica set is ready
db.createCollection('distributedlocks');
db.createCollection('jobs');