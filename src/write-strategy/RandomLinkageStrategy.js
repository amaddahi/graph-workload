const Strategy = require('../Strategy');
const neo4j = require('neo4j-driver');
const uuid = require('uuid');

class RandomLinkageStrategy extends Strategy {
    constructor(props) {
        super(props);
        this.name = 'RandomLinkage';
        this.n = props.n || 1000000;
    }

    run() {
        this.lastQuery = `
            MATCH (a) 
            WITH a 
            SKIP $idx1 LIMIT 3 
            MATCH (b) WITH a,b 
            SKIP $idx2 LIMIT 3 
            CREATE (a)-[r:randomlinkage {
                id: $id, created: datetime()
            }]->(b)
            RETURN count(r)
        `;
        
        this.lastParams = { 
            idx1: neo4j.int(this.randInt(this.n)),
            idx2: neo4j.int(this.randInt(this.n)),
            id: uuid.v4(), 
        };
        const f = (s) => s.writeTransaction(tx => tx.run(this.lastQuery, this.lastParams));
        return this.time(f);
    }
}

module.exports = RandomLinkageStrategy;